import { createClient } from '@/utils/supabase/server'
import { validateSchema, validateStructuredData, validateRequiredProductFields } from '@/utils/schemaValidation'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Fetch all products
    const { data: products } = await supabase
      .from('products')
      .select('*')

    // Fetch all categories
    const { data: categories } = await supabase
      .from('products')
      .select('category_path')
      .not('category_path', 'is', null)

    // Fetch all blog posts
    const { data: posts } = await supabase
      .from('posts')
      .select('*')

    // Calculate unique categories
    const uniqueCategories = new Set<string>()
    categories?.forEach(product => {
      if (product.category_path) {
        product.category_path.forEach((category: string) => {
          uniqueCategories.add(category)
        })
      }
    })

    // Validate products and collect issues
    const issues: string[] = []
    const recommendations: string[] = []
    let productsWithMissingFields = 0
    let productsWithInvalidSchema = 0
    let missingMetaDescriptions = 0
    let missingAltTags = 0
    let duplicateTitles = 0
    let lowWordCount = 0

    const titleCounts = new Map<string, number>()

    // Analyze each product
    products?.forEach(product => {
      // Check required fields
      const fieldValidation = validateRequiredProductFields(product)
      if (!fieldValidation.isValid) {
        productsWithMissingFields++
        issues.push(...fieldValidation.errors)
      }

      // Check structured data
      const schemaValidation = validateStructuredData({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        offers: {
          price: product.price,
          priceCurrency: 'USD',
          availability: product.in_stock ? 'InStock' : 'OutOfStock'
        }
      })
      
      if (!schemaValidation.isValid) {
        productsWithInvalidSchema++
      }

      // Check meta description
      if (!product.meta_description || product.meta_description.length < 50) {
        missingMetaDescriptions++
      }

      // Check image alt tags
      if (product.images?.some((img: any) => !img.alt)) {
        missingAltTags++
      }

      // Check title uniqueness
      const title = product.name.toLowerCase()
      titleCounts.set(title, (titleCounts.get(title) || 0) + 1)

      // Check description length
      if (product.description && product.description.split(' ').length < 100) {
        lowWordCount++
      }
    })

    // Count duplicate titles
    titleCounts.forEach(count => {
      if (count > 1) duplicateTitles++
    })

    // Generate recommendations
    if (productsWithMissingFields > 0) {
      recommendations.push('Complete all required fields for products')
    }
    if (missingMetaDescriptions > 0) {
      recommendations.push('Add unique meta descriptions for all products')
    }
    if (missingAltTags > 0) {
      recommendations.push('Add alt tags to all product images')
    }
    if (duplicateTitles > 0) {
      recommendations.push('Make all product titles unique')
    }
    if (lowWordCount > 0) {
      recommendations.push('Expand product descriptions to at least 100 words')
    }

    // Calculate overall score
    const totalProducts = products?.length || 0
    const score = Math.round(
      100 - (
        (productsWithMissingFields / totalProducts * 30) +
        (missingMetaDescriptions / totalProducts * 20) +
        (missingAltTags / totalProducts * 20) +
        (duplicateTitles / totalProducts * 15) +
        (lowWordCount / totalProducts * 15)
      )
    )

    return NextResponse.json({
      metrics: {
        totalProducts,
        totalCategories: uniqueCategories.size,
        totalBlogPosts: posts?.length || 0,
        productsWithMissingFields,
        productsWithInvalidSchema,
        missingMetaDescriptions,
        missingAltTags,
        duplicateTitles,
        lowWordCount
      },
      score: {
        score,
        issues,
        recommendations
      }
    })
  } catch (error) {
    console.error('Error generating SEO metrics:', error)
    return NextResponse.json({ error: 'Error generating SEO metrics' }, { status: 500 })
  }
}
