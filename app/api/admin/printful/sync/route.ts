import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Check admin authorization
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize admin Supabase client
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const stats = {
      added: 0,
      updated: 0,
      skipped: 0,
    }

    // Validate Printful API key and store ID
    if (!process.env.PRINTFUL_API_KEY) {
      throw new Error('PRINTFUL_API_KEY environment variable is not set')
    }
    if (!process.env.PRINTFUL_STORE_ID) {
      throw new Error('PRINTFUL_STORE_ID environment variable is not set')
    }

    const storeId = process.env.PRINTFUL_STORE_ID

    // Get existing custom images mapping
    const { data: customImages } = await adminSupabase
      .from('custom_image_backup')
      .select('product_id, custom_images')
      .order('created_at', { ascending: false })

    const customImageMap = new Map(
      customImages?.map(item => [item.product_id, item.custom_images]) || []
    )

    // Fetch products from Printful
    const printfulResponse = await fetch(`https://api.printful.com/sync/products?store_id=${storeId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json'
      },
    })

    if (!printfulResponse.ok) {
      const errorText = await printfulResponse.text()
      console.error('Printful API Error:', {
        status: printfulResponse.status,
        statusText: printfulResponse.statusText,
        error: errorText,
        headers: Object.fromEntries(printfulResponse.headers.entries()),
      })
      throw new Error(`Failed to fetch products from Printful: ${printfulResponse.status} ${printfulResponse.statusText} - ${errorText}`)
    }

    let printfulData
    try {
      printfulData = await printfulResponse.json()
    } catch (error) {
      console.error('Failed to parse Printful response:', error)
      throw new Error('Invalid response from Printful API')
    }

    if (!printfulData?.result) {
      console.error('Unexpected Printful response format:', printfulData)
      throw new Error('Unexpected response format from Printful API')
    }

    const products = printfulData.result

    // Function to generate slug from name
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }

    for (const product of products) {
      // Check if product exists
      const { data: existingProduct } = await adminSupabase
        .from('products')
        .select('id, custom_images, printful_id, slug')
        .eq('printful_id', product.id)
        .single()

      const productData = {
        name: product.name,
        description: product.description || '',
        printful_id: product.id,
        active: true,
        slug: existingProduct?.slug || generateSlug(product.name),
        // Preserve custom images if they exist
        custom_images: existingProduct?.custom_images || customImageMap.get(product.id) || null,
      }

      let productId: string
      if (existingProduct) {
        // Update existing product
        const { error: updateError } = await adminSupabase
          .from('products')
          .update(productData)
          .eq('id', existingProduct.id)

        if (updateError) throw updateError
        productId = existingProduct.id
        stats.updated++
      } else {
        // Create new product
        const { data: newProduct, error: insertError } = await adminSupabase
          .from('products')
          .insert(productData)
          .select('id')
          .single()

        if (insertError) throw insertError
        if (!newProduct) throw new Error('Failed to create product')
        productId = newProduct.id
        stats.added++
      }

      // Handle variants
      const { data: variantSync } = await fetch(`https://api.printful.com/sync/products/${product.id}?store_id=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        },
      }).then(res => res.json())

      if (variantSync?.result?.sync_variants) {
        for (const variant of variantSync.result.sync_variants) {
          const variantData = {
            product_id: productId,
            printful_variant_id: variant.id,
            size: variant.size || null,
            color: variant.color || null,
            price: variant.retail_price,
            stock: variant.quantity || 0,
          }

          // Check if variant exists
          const { data: existingVariant } = await adminSupabase
            .from('product_variants')
            .select('id')
            .eq('printful_variant_id', variant.id)
            .single()

          if (existingVariant) {
            // Update existing variant
            const { error: updateError } = await adminSupabase
              .from('product_variants')
              .update(variantData)
              .eq('id', existingVariant.id)

            if (updateError) throw updateError
          } else {
            // Create new variant
            const { error: insertError } = await adminSupabase
              .from('product_variants')
              .insert(variantData)

            if (insertError) throw insertError
          }
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
