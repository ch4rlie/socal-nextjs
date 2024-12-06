import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchPrintfulProducts() {
  const response = await fetch('https://api.printful.com/store/products', {
    headers: {
      'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch products from Printful')
  }

  return response.json()
}

export async function POST() {
  try {
    const stats = {
      added: 0,
      updated: 0,
      skipped: 0,
    }

    // Get existing custom images mapping
    const { data: customImages } = await supabase
      .from('custom_image_backup')
      .select('product_id, custom_images')
      .order('created_at', { ascending: false })

    const customImageMap = new Map(
      customImages?.map(item => [item.product_id, item.custom_images]) || []
    )

    // Fetch products from Printful
    const printfulData = await fetchPrintfulProducts()
    const products = printfulData.result

    for (const product of products) {
      // Check if product exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id, custom_images')
        .eq('printful_id', product.id)
        .single()

      const productData = {
        name: product.name,
        description: product.description || '',
        printful_id: product.id,
        active: true,
        // Preserve custom images if they exist
        custom_images: existingProduct?.custom_images || customImageMap.get(product.id) || null,
        // Add other Printful fields as needed
      }

      if (existingProduct) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', existingProduct.id)

        if (updateError) throw updateError
        stats.updated++
      } else {
        // Create new product
        const { error: insertError } = await supabase
          .from('products')
          .insert(productData)

        if (insertError) throw insertError
        stats.added++
      }

      // Handle variants
      for (const variant of product.variants) {
        const variantData = {
          product_id: product.id,
          printful_variant_id: variant.id,
          size: variant.size || null,
          color: variant.color || null,
          price: variant.retail_price,
          stock: variant.quantity || 0,
        }

        // Check if variant exists
        const { data: existingVariant } = await supabase
          .from('product_variants')
          .select('id')
          .eq('printful_variant_id', variant.id)
          .single()

        if (existingVariant) {
          // Update existing variant
          const { error: updateError } = await supabase
            .from('product_variants')
            .update(variantData)
            .eq('id', existingVariant.id)

          if (updateError) throw updateError
        } else {
          // Create new variant
          const { error: insertError } = await supabase
            .from('product_variants')
            .insert(variantData)

          if (insertError) throw insertError
        }
      }
    }

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync with Printful' },
      { status: 500 }
    )
  }
}
