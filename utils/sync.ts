import { createClient } from '@supabase/supabase-js'
import { getPrintfulProducts, getPrintfulProduct } from './printful'
import { Database } from '../types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function syncProducts() {
  console.log('Starting product sync...')
  
  try {
    // 1. Get all products from Printful
    const printfulProducts = await getPrintfulProducts()
    console.log(`Retrieved ${printfulProducts.length} products from Printful`)

    for (const printfulProduct of printfulProducts) {
      try {
        // 2. Get detailed product information
        const detailedProduct = await getPrintfulProduct(printfulProduct.id.toString())
        
        // 3. Prepare product data
        const productData = {
          id: printfulProduct.id,
          name: printfulProduct.sync_product.name,
          description: detailedProduct.sync_product.description || '',
          thumbnail_url: printfulProduct.sync_product.thumbnail_url,
          is_active: true,
          external_id: printfulProduct.id.toString(),
          retail_price: parseFloat(printfulProduct.sync_product.retail_price || '0'),
          currency: printfulProduct.sync_product.currency || 'USD',
          updated_at: new Date().toISOString()
        }

        // 4. Upsert product into database
        const { error: productError } = await supabase
          .from('products')
          .upsert(productData, {
            onConflict: 'external_id'
          })

        if (productError) {
          console.error(`Error upserting product ${printfulProduct.id}:`, productError)
          continue
        }

        // 5. Handle variants
        if (detailedProduct.sync_variants) {
          for (const variant of detailedProduct.sync_variants) {
            const variantData = {
              id: variant.id,
              product_id: printfulProduct.id,
              name: variant.name,
              sku: variant.sku || '',
              retail_price: parseFloat(variant.retail_price || '0'),
              currency: variant.currency || 'USD',
              is_active: true,
              external_id: variant.id.toString(),
              updated_at: new Date().toISOString()
            }

            const { error: variantError } = await supabase
              .from('product_variants')
              .upsert(variantData, {
                onConflict: 'external_id'
              })

            if (variantError) {
              console.error(`Error upserting variant ${variant.id}:`, variantError)
              continue
            }
          }
        }

        // 6. Handle product images
        if (detailedProduct.sync_product.files) {
          for (const file of detailedProduct.sync_product.files) {
            if (file.type === 'preview') {
              const imageData = {
                product_id: printfulProduct.id,
                url: file.preview_url,
                position: file.position || 0,
                is_thumbnail: file.type === 'preview',
                updated_at: new Date().toISOString()
              }

              const { error: imageError } = await supabase
                .from('product_images')
                .upsert(imageData, {
                  onConflict: 'product_id,url'
                })

              if (imageError) {
                console.error(`Error upserting image for product ${printfulProduct.id}:`, imageError)
                continue
              }
            }
          }
        }

        console.log(`Successfully synced product ${printfulProduct.id}`)
      } catch (error) {
        console.error(`Error processing product ${printfulProduct.id}:`, error)
        continue
      }
    }

    console.log('Product sync completed successfully')
    return { success: true }
  } catch (error) {
    console.error('Error during product sync:', error)
    return { success: false, error }
  }
}
