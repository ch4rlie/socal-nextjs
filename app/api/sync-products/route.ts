import { NextResponse } from 'next/server'
import { getPrintfulProducts } from '@/utils/printful'
import { createAdminClient } from '@/utils/supabase/server'

// Helper function to extract thread colors from options
function extractThreadColors(options: any[]): string[] {
  const threadColors: string[] = []
  options.forEach(option => {
    if (option.id.includes('thread_colors') && Array.isArray(option.value)) {
      threadColors.push(...option.value)
    }
  })
  return [...new Set(threadColors)] // Remove duplicates
}

// Helper function to safely download an image
async function downloadImage(url: string, supabase: any, product_id: string | number) {
  try {
    if (!url) return null
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to download image from ${url}: ${response.statusText}`)
      return null
    }

    const blob = await response.blob()
    const fileName = `${product_id}-${Date.now()}.${blob.type.split('/')[1]}`
    const filePath = `product-images/${fileName}`

    const { error: uploadError, data } = await supabase
      .storage
      .from('product-images')
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error downloading/uploading image:', error)
    return null
  }
}

// Helper function to determine product category
function determineProductCategory(product: any): string {
  const name = product.name.toLowerCase()
  const description = (product.description || '').toLowerCase()
  
  // Check for All-Over Print Premium items first (most specific)
  if (name.includes('windbreaker') || name.includes('track pants') || 
      name.includes('cropped windbreaker')) {
    return 'AOP_PREMIUM'
  }
  
  // Check for All-Over Print Heavy items
  if ((name.includes('all-over') || name.includes('aop')) && 
      (name.includes('hoodie') || name.includes('sweatshirt') || 
       name.includes('jacket') || name.includes('pants') || 
       name.includes('jogger'))) {
    return 'AOP_HEAVY'
  }
  
  // Check for All-Over Print Light items
  if (name.includes('all-over') || name.includes('aop')) {
    return 'AOP_LIGHT'
  }
  
  // Check for Heavy Outerwear
  if (name.includes('hoodie') || name.includes('sweatshirt') || 
      name.includes('jacket') || name.includes('jogger') || 
      name.includes('pants')) {
    return 'HEAVY_OUTERWEAR'
  }
  
  // Check for Headwear
  if (name.includes('hat') || name.includes('cap') || 
      name.includes('beanie') || name.includes('visor')) {
    return 'HEADWEAR'
  }
  
  // Check for Basic Shirts
  if (name.includes('shirt') || name.includes('tee') || 
      name.includes('tank') || name.includes('polo') || 
      description.includes('t-shirt')) {
    return 'BASIC_SHIRT'
  }
  
  return 'DEFAULT'
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!process.env.SYNC_API_KEY || authHeader !== `Bearer ${process.env.SYNC_API_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const supabase = createAdminClient()
    const printfulProducts = await getPrintfulProducts()
    
    console.log(`Found ${printfulProducts.length} products from Printful`)
    
    const syncedProducts = await Promise.all(
      printfulProducts.map(async (product) => {
        try {
          // Download and store the thumbnail image if it exists
          const storedThumbnailUrl = await downloadImage(product.thumbnail_url, supabase, product.id)

          console.log(`Fetching details for product ${product.id}: ${product.name}`)
          
          // Get detailed product info including variants
          const response = await fetch(`https://api.printful.com/sync/products/${product.id}?store_id=${process.env.PRINTFUL_STORE_ID}`, {
            headers: {
              'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error(`API Error for product ${product.id}:`, errorText)
            throw new Error(`Failed to fetch product details: ${response.statusText} - ${errorText}`)
          }

          const responseData = await response.json()
          const { result: { sync_product, sync_variants } } = responseData

          console.log(`Found ${sync_variants?.length || 0} variants for product ${product.id}`)

          // Extract thread colors and embroidery type from the first variant
          const firstVariant = sync_variants?.[0] || {}
          const threadColors = extractThreadColors(firstVariant.options || [])
          const embroideryType = firstVariant.options?.find((o: any) => o.id === 'embroidery_type')?.value

          // Always update the product with latest data
          const { data: syncedProduct, error: productError } = await supabase
            .from('products')
            .upsert({
              id: product.id,
              name: product.name,
              description: sync_product?.description || null,
              thumbnail_url: storedThumbnailUrl,
              retail_price: sync_variants?.[0]?.retail_price || null,
              currency: sync_variants?.[0]?.currency || 'USD',
              is_active: true,
              meta_title: product.name,
              meta_description: sync_product?.description || `Shop ${product.name} at our store`,
              meta_keywords: `{${product.name.toLowerCase().replace(/[^a-z0-9]+/g, ',')},apparel,clothing}`,
              canonical_url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              og_title: product.name,
              og_description: sync_product?.description || `Shop ${product.name} at our store`,
              og_image_url: storedThumbnailUrl,
              printful_sync_timestamp: new Date().toISOString(),
              slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              // New fields
              external_id: sync_product.external_id,
              sync_product_id: sync_product.id,
              variant_id: sync_variants?.[0]?.variant_id,
              main_category_id: sync_product.main_category_id,
              embroidery_type: embroideryType,
              thread_colors: threadColors,
              availability_status: sync_product.status || 'active',
              shipping_type: parseFloat(sync_variants?.[0]?.retail_price || '0') >= 50 ? 'free' : 'flat_rate',
              shipping_rate: 5.00,
              last_sync_error: null,
              product_category: determineProductCategory(product)
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            })
            .select()
            .single()

          if (productError) {
            console.error('Error upserting product:', productError)
            throw productError
          }

          // Sync variants
          if (sync_variants && sync_variants.length > 0) {
            const variants = await Promise.all(sync_variants.map(async (variant: any) => {
              // Download and store variant images
              const variantThumbnailUrl = await downloadImage(
                variant.files?.find((f: any) => f.type === 'preview')?.preview_url,
                supabase,
                `${product.id}-${variant.id}`
              )

              const variantThreadColors = extractThreadColors(variant.options || [])
              const variantEmbroideryType = variant.options?.find((o: any) => o.id === 'embroidery_type')?.value

              return {
                id: variant.id,
                product_id: product.id,
                name: variant.name,
                size: variant.size,
                color: variant.color,
                thumbnail_url: variantThumbnailUrl,
                retail_price: variant.retail_price,
                currency: variant.currency || 'USD',
                printful_sync_timestamp: new Date().toISOString(),
                // New fields
                external_id: variant.external_id,
                sync_variant_id: variant.id,
                variant_id: variant.variant_id,
                sku: variant.sku,
                main_category_id: variant.main_category_id,
                availability_status: variant.availability_status || 'active',
                embroidery_type: variantEmbroideryType,
                thread_colors: variantThreadColors,
                preview_image_url: variant.product?.image,
                shipping_type: parseFloat(variant.retail_price || '0') >= 50 ? 'free' : 'flat_rate',
                shipping_rate: 5.00,
                last_sync_error: null
              }
            }))

            console.log(`Upserting ${variants.length} variants for product ${product.id}`)
            
            const { error: variantsError } = await supabase
              .from('product_variants')
              .upsert(variants, {
                onConflict: 'id',
                ignoreDuplicates: false
              })

            if (variantsError) {
              console.error('Error upserting variants:', variantsError)
              throw variantsError
            }
          }

          console.log(`Successfully synced product ${product.id} with variants`)
          return syncedProduct
        } catch (error) {
          // Update product with sync error
          await supabase
            .from('products')
            .update({
              last_sync_error: error instanceof Error ? error.message : 'Unknown error',
              printful_sync_timestamp: new Date().toISOString()
            })
            .eq('id', product.id)

          console.error(`Failed to sync product ${product.id}:`, error)
          return null
        }
      })
    )

    const successfulSyncs = syncedProducts.filter(Boolean)

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${successfulSyncs.length} products`,
      syncedProducts: successfulSyncs
    })
  } catch (error) {
    console.error('Error syncing products:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
