interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export async function validateSchema(schema: any): Promise<ValidationResult> {
  try {
    // Google's Schema Markup Validator API
    const response = await fetch('https://validator.schema.org/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ schema }),
    })

    if (!response.ok) {
      throw new Error('Schema validation request failed')
    }

    const result = await response.json()
    return {
      isValid: result.valid,
      errors: result.errors || [],
    }
  } catch (error) {
    console.error('Schema validation error:', error)
    return {
      isValid: false,
      errors: ['Schema validation service unavailable'],
    }
  }
}

export function validateRequiredProductFields(product: any): ValidationResult {
  const errors: string[] = []
  const required = [
    'name',
    'description',
    'price',
    'sku',
    'google_product_category',
    'images',
  ]

  required.forEach(field => {
    if (!product[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  })

  // Validate price
  if (typeof product.price !== 'number' || product.price <= 0) {
    errors.push('Invalid price: must be a positive number')
  }

  // Validate images
  if (!Array.isArray(product.images) || product.images.length === 0) {
    errors.push('Product must have at least one image')
  }

  // Validate Google Product Category
  if (!product.google_product_category || !product.google_product_category_id) {
    errors.push('Missing Google Product Category')
  }

  // Validate dimensions if provided
  if (product.dimensions) {
    const { length, width, height, unit } = product.dimensions
    if (!length || !width || !height || !unit) {
      errors.push('Invalid dimensions: must include length, width, height, and unit')
    }
  }

  // Validate weight if provided
  if (product.weight && !product.weight_unit) {
    errors.push('Weight unit must be specified when weight is provided')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateProductReview(review: any): ValidationResult {
  const errors: string[] = []

  // Required fields
  if (!review.rating || typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) {
    errors.push('Invalid rating: must be a number between 1 and 5')
  }

  if (!review.product_id) {
    errors.push('Missing product_id')
  }

  if (!review.user_id) {
    errors.push('Missing user_id')
  }

  // Optional fields validation
  if (review.review_text && typeof review.review_text !== 'string') {
    errors.push('Invalid review_text: must be a string')
  }

  if (review.review_title && typeof review.review_title !== 'string') {
    errors.push('Invalid review_title: must be a string')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateStructuredData(data: any): ValidationResult {
  const errors: string[] = []

  // Basic schema.org validation
  if (!data['@context'] || data['@context'] !== 'https://schema.org') {
    errors.push('Invalid or missing @context')
  }

  if (!data['@type']) {
    errors.push('Missing @type')
  }

  // Product-specific validation
  if (data['@type'] === 'Product') {
    if (!data.offers || typeof data.offers !== 'object') {
      errors.push('Missing or invalid offers')
    } else {
      if (!data.offers.price || typeof data.offers.price !== 'number') {
        errors.push('Invalid or missing price in offers')
      }
      if (!data.offers.priceCurrency) {
        errors.push('Missing priceCurrency in offers')
      }
      if (!data.offers.availability) {
        errors.push('Missing availability in offers')
      }
    }

    // Validate reviews if present
    if (data.review) {
      const reviews = Array.isArray(data.review) ? data.review : [data.review]
      reviews.forEach((review, index) => {
        if (!review['@type'] || review['@type'] !== 'Review') {
          errors.push(`Invalid review type at index ${index}`)
        }
        if (!review.reviewRating || !review.reviewRating.ratingValue) {
          errors.push(`Missing rating value in review at index ${index}`)
        }
      })
    }

    // Validate aggregate rating if present
    if (data.aggregateRating) {
      if (!data.aggregateRating.ratingValue || !data.aggregateRating.reviewCount) {
        errors.push('Invalid aggregate rating: missing required fields')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
