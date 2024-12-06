import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { 
  generateProductStructuredData, 
  generateBreadcrumbStructuredData 
} from '@/utils/structuredData'
import ProductDetails from './components/ProductDetails'
import { Product, ProductReview } from '@/types/product'
import { siteConfig } from '@/app/metadata'

interface Props {
  params: {
    slug: string
  }
}

async function getProductData(slug: string) {
  try {
    const supabase = createClient()
    
    // Log the slug we're searching for
    console.log('Fetching product with slug:', slug)
    
    // Fetch product with all metadata and variants
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants (
          id,
          sku,
          retail_price,
          preview_image_url,
          availability_status,
          is_active
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return null
    }

    if (!product) {
      console.error('Product not found:', slug)
      return null
    }

    // Log the found product
    console.log('Found product:', {
      id: product.id,
      name: product.name,
      slug: product.slug,
      product_type: product.product_type,
      shipping_type: product.shipping_type,
      is_active: product.is_active
    })

    // Fetch product reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('product_reviews')
      .select(`
        id,
        product_id,
        user_id,
        rating,
        review_text,
        review_title,
        verified_purchase,
        helpful_votes,
        created_at,
        updated_at,
        reviewer:profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    }

    return {
      product: {
        ...product,
        product_type: product.product_type || 'DEFAULT',
        shipping_type: product.shipping_type || 'flat_rate',
        weight: product.weight || 0.5,
        dimensions: product.dimensions || { length: 20, width: 20, height: 5 }
      },
      reviews: reviews || []
    }
  } catch (error) {
    console.error('Unexpected error in getProductData:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProductData(params.slug)
  
  if (!data) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    }
  }

  const { product, reviews } = data

  // Generate all structured data
  const structuredData = [
    // Product data with reviews
    generateProductStructuredData(product, reviews),
    // Breadcrumbs if category path exists
    ...(product.category_path 
      ? [generateBreadcrumbStructuredData(product.category_path)]
      : [])
  ]

  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.description,
    keywords: product.meta_keywords,
    openGraph: {
      title: product.meta_title || product.name,
      description: product.meta_description || product.description,
      images: product.images?.map(image => ({
        url: image,
        width: 800,
        height: 600,
        alt: product.name
      })) || [],
      type: 'website',
      siteName: siteConfig.name,
      locale: 'en_US',
      availability: product.availability_status === 'active' ? 'instock' : 'outofstock',
      price: product.retail_price ? {
        amount: product.retail_price.toString(),
        currency: product.currency || 'USD',
      } : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.meta_title || product.name,
      description: product.meta_description || product.description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
    other: {
      'application/ld+json': JSON.stringify(structuredData),
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const data = await getProductData(params.slug)

  if (!data) {
    notFound()
  }

  const { product, reviews } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductDetails 
        product={product} 
        reviews={reviews}
      />
    </div>
  )
}
