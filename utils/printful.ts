const PRINTFUL_API_URL = 'https://api.printful.com'

export async function getPrintfulProducts() {
  if (!process.env.PRINTFUL_API_KEY) {
    throw new Error('PRINTFUL_API_KEY is not configured')
  }
  
  if (!process.env.PRINTFUL_STORE_ID) {
    throw new Error('PRINTFUL_STORE_ID is not configured')
  }

  try {
    const response = await fetch(`${PRINTFUL_API_URL}/sync/products?store_id=${process.env.PRINTFUL_STORE_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Printful API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Printful API Response:', JSON.stringify(data, null, 2))
    
    // Ensure we're returning the correct data structure
    if (Array.isArray(data.result)) {
      return data.result.map(item => ({
        ...item,
        sync_product: item.sync_product || {
          name: item.name,
          thumbnail_url: item.thumbnail_url,
          retail_price: 'N/A',
          currency: 'USD'
        }
      }))
    } else {
      console.error('Unexpected API response structure:', data)
      throw new Error('Unexpected API response structure')
    }
  } catch (error) {
    console.error('Error fetching Printful products:', error)
    throw error
  }
}

export async function getPrintfulProduct(productId: string) {
  if (!process.env.PRINTFUL_API_KEY) {
    throw new Error('PRINTFUL_API_KEY is not configured')
  }
  
  if (!process.env.PRINTFUL_STORE_ID) {
    throw new Error('PRINTFUL_STORE_ID is not configured')
  }

  try {
    const response = await fetch(`${PRINTFUL_API_URL}/sync/products/${productId}?store_id=${process.env.PRINTFUL_STORE_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Printful API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Printful API Response:', JSON.stringify(data, null, 2))
    
    // Ensure we're returning the correct data structure
    if (data.result) {
      return {
        ...data.result,
        sync_product: data.result.sync_product || {
          name: data.result.name,
          thumbnail_url: data.result.thumbnail_url,
          retail_price: 'N/A',
          currency: 'USD'
        }
      }
    } else {
      console.error('Unexpected API response structure:', data)
      throw new Error('Unexpected API response structure')
    }
  } catch (error) {
    console.error('Error fetching Printful product:', error)
    throw error
  }
}

export async function getProductVariants(productId: string) {
  if (!process.env.PRINTFUL_API_KEY) {
    throw new Error('PRINTFUL_API_KEY is not configured')
  }
  
  if (!process.env.PRINTFUL_STORE_ID) {
    throw new Error('PRINTFUL_STORE_ID is not configured')
  }

  try {
    const response = await fetch(`${PRINTFUL_API_URL}/sync/products/${productId}/variants?store_id=${process.env.PRINTFUL_STORE_ID}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Printful API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to fetch variants: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Printful API Response:', JSON.stringify(data, null, 2))
    
    // Ensure we're returning the correct data structure
    if (Array.isArray(data.result)) {
      return data.result
    } else {
      console.error('Unexpected API response structure:', data)
      throw new Error('Unexpected API response structure')
    }
  } catch (error) {
    console.error('Error fetching Printful variants:', error)
    throw error
  }
}

export async function getShippingRates(variantId: number, address: {
  country_code: string
  state_code?: string
  city?: string
  zip?: string
}) {
  if (!process.env.PRINTFUL_API_KEY) {
    throw new Error('PRINTFUL_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${PRINTFUL_API_URL}/shipping/rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: {
          country_code: address.country_code,
          state_code: address.state_code,
          city: address.city,
          zip: address.zip
        },
        items: [{
          variant_id: variantId,
          quantity: 1
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping rates: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Error fetching shipping rates:', error)
    throw error
  }
}
