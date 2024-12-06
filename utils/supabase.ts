import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Debug environment variables
console.log('Environment Variables Status:', {
  url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
})

// Check required public environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY is not defined. Some admin functions may not work.')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create the default client with anon key
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

// Create a Supabase admin client with the service role key
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey
)

// User Profile Types
export type Profile = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  updated_at?: string
}

// Order Types
export type Order = {
  id: string
  user_id?: string
  email: string
  session_id: string
  amount_total: number
  currency: string
  status: 'complete' | 'canceled' | 'processing'
  shipping_address: any
  created_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  name: string
  price: number
  quantity: number
  created_at: string
}

// Product Types
export type Product = Database['public']['Tables']['products']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']

// Profile Functions
export async function getProfile(userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Order Functions
export async function createOrder(orderData: Omit<Order, 'id' | 'created_at'>) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()

  if (error) throw error
  return order
}

export async function createOrderItems(items: Omit<OrderItem, 'id' | 'created_at'>[]) {
  const { data: orderItems, error } = await supabase
    .from('order_items')
    .insert(items)
    .select()

  if (error) throw error
  return orderItems
}

export async function getUserByEmail(email: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found" error
  return user
}

export async function getOrderBySessionId(sessionId: string) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return order
}

export async function getUserOrders(userId: string) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return orders
}

export async function getOrdersByEmail(email: string) {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) throw error
  return orders
}

// Product Functions
export async function getProducts() {
  console.log('Fetching products...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    // First, check if we have any products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log('Product count:', { count, error: countError });

    if (countError) {
      console.error('Error counting products:', countError);
      throw countError;
    }

    // If we have no products, return early
    if (count === 0) {
      console.log('No products found in database');
      return [];
    }

    // First try to fetch products with images
    let { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        printful_id,
        active,
        custom_thumbnail_url,
        thumbnail_url,
        retail_price,
        product_variants (
          id,
          printful_variant_id,
          product_id,
          price,
          stock,
          size,
          color
        )
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: error.status
      });
      throw error;
    }

    if (!products) {
      console.warn('No products returned from database');
      return [];
    }

    // Try to fetch images separately
    const { data: allProductImages, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', products.map(p => p.id));

    if (imagesError) {
      console.warn('Error fetching product images:', imagesError);
    }

    // Filter out any null values and format the response
    const formattedProducts = products.map(product => ({
      ...product,
      product_variants: (product.product_variants || []).filter(variant => variant !== null),
      product_images: allProductImages 
        ? allProductImages
            .filter(img => img.product_id === product.id)
            .sort((a, b) => (a.position || 0) - (b.position || 0))
        : []
    }));

    console.log('Products fetched successfully:', {
      count: formattedProducts.length,
      sampleProduct: formattedProducts.length > 0 ? {
        id: formattedProducts[0].id,
        name: formattedProducts[0].name,
        active: formattedProducts[0].active,
        variantsCount: formattedProducts[0].product_variants?.length || 0,
        imagesCount: formattedProducts[0].product_images?.length || 0,
        hasPrice: !!formattedProducts[0].retail_price,
        hasThumbnail: !!(formattedProducts[0].custom_thumbnail_url || formattedProducts[0].thumbnail_url)
      } : null
    });
    
    return formattedProducts;
  } catch (err) {
    console.error('Exception in getProducts:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause
    });
    throw err;
  }
}

export async function getProduct(id: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id,
      created_at,
      name,
      description,
      printful_id,
      active,
      custom_images,
      product_variants (
        id,
        printful_variant_id,
        size,
        color,
        price,
        stock
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return product
}

export async function upsertProduct(product: Partial<Product> & { id: string }) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .upsert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function upsertProductVariant(variant: Partial<ProductVariant> & { id: string }) {
  const { data, error } = await supabaseAdmin
    .from('product_variants')
    .upsert(variant)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function upsertProductImage(image: Omit<ProductImage, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabaseAdmin
    .from('product_images')
    .upsert(image)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadProductImage(file: File, path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) throw error
  return data
}

export async function deleteProductImage(path: string) {
  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .remove([path])

  if (error) throw error
}

async function downloadAndStoreImage(imageUrl: string, productId: string): Promise<string | null> {
  try {
    // Download the image
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    
    const blob = await response.blob()
    const fileName = `${productId}-${Date.now()}.${blob.type.split('/')[1]}`
    const filePath = `product-images/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('product-images')
      .upload(filePath, blob, {
        contentType: blob.type,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error downloading and storing image:', error)
    return null
  }
}

export async function syncPrintfulProduct(printfulProduct: any) {
  try {
    // Download and store the thumbnail image if it's from WordPress
    let storedThumbnailUrl = printfulProduct.thumbnail_url
    if (storedThumbnailUrl && storedThumbnailUrl.includes('socalprerunner.com')) {
      const newThumbnailUrl = await downloadAndStoreImage(storedThumbnailUrl, printfulProduct.id.toString())
      if (newThumbnailUrl) {
        storedThumbnailUrl = newThumbnailUrl
      }
    }

    // Start a transaction
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .upsert({
        id: printfulProduct.id,
        name: printfulProduct.name,
        description: printfulProduct.description,
        thumbnail_url: storedThumbnailUrl,
        retail_price: printfulProduct.retail_price,
        currency: printfulProduct.currency || 'USD',
        printful_sync_timestamp: new Date().toISOString(),
        is_active: true,
        slug: printfulProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })
      .select()
      .single()

    if (productError) throw productError

    // Sync variants
    if (printfulProduct.variants) {
      const variants = await Promise.all(printfulProduct.variants.map(async (variant: any) => {
        // Download and store variant thumbnail if it's from WordPress
        let variantThumbnailUrl = variant.thumbnail_url
        if (variantThumbnailUrl && variantThumbnailUrl.includes('socalprerunner.com')) {
          const newThumbnailUrl = await downloadAndStoreImage(variantThumbnailUrl, `${product.id}-${variant.id}`)
          if (newThumbnailUrl) {
            variantThumbnailUrl = newThumbnailUrl
          }
        }

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
        }
      }))

      const { error: variantsError } = await supabaseAdmin
        .from('product_variants')
        .upsert(variants)

      if (variantsError) throw variantsError
    }

    // Sync images
    if (printfulProduct.images) {
      const images = await Promise.all(printfulProduct.images.map(async (image: any, index: number) => {
        // Download and store image if it's from WordPress
        let imageUrl = image.url
        if (imageUrl && imageUrl.includes('socalprerunner.com')) {
          const newImageUrl = await downloadAndStoreImage(imageUrl, `${product.id}-image-${index}`)
          if (newImageUrl) {
            imageUrl = newImageUrl
          }
        }

        return {
          product_id: product.id,
          image_url: imageUrl,
          position: index,
          is_thumbnail: index === 0,
        }
      }))

      const { error: imagesError } = await supabaseAdmin
        .from('product_images')
        .upsert(images)

      if (imagesError) throw imagesError
    }

    return product
  } catch (error) {
    console.error('Error syncing product:', error)
    throw error
  }
}
