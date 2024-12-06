import { Product, ProductReview } from '@/types/product'

export function generateBreadcrumbStructuredData(categoryPath: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: categoryPath.map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
        name: category,
      },
    })),
  }
}

export function generateReviewStructuredData(review: ProductReview, product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: review.user?.name || 'Anonymous',
    },
    datePublished: review.created_at,
    reviewBody: review.review_text,
    name: review.review_title,
    itemReviewed: {
      '@type': 'Product',
      name: product.name,
      image: product.images?.[0],
      description: product.description,
    },
  }
}

export function generateAggregateRatingStructuredData(product: Product) {
  if (!product.review_count || product.review_count === 0) {
    return null
  }

  return {
    '@type': 'AggregateRating',
    ratingValue: product.review_average,
    reviewCount: product.review_count,
    bestRating: '5',
    worstRating: '1',
  }
}

export function generateProductStructuredData(
  product: Product,
  reviews?: ProductReview[]
) {
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    mpn: product.mpn || product.sku,
    gtin: product.gtin,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'SoCal',
    },
    manufacturer: product.manufacturer ? {
      '@type': 'Organization',
      name: product.manufacturer,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      itemCondition: `https://schema.org/${product.condition?.[0].toUpperCase()}${product.condition?.slice(1)}Condition`,
      availability: product.in_stock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'SoCal',
      },
    },
    // Google Product Category
    googleProductCategory: product.google_product_category,
    identifier_exists: 'yes',
  }

  // Add aggregate rating if available
  const aggregateRating = generateAggregateRatingStructuredData(product)
  if (aggregateRating) {
    structuredData.aggregateRating = aggregateRating
  }

  // Add individual reviews if available
  if (reviews?.length) {
    structuredData.review = reviews.map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1',
      },
      author: {
        '@type': 'Person',
        name: review.user?.name || 'Anonymous',
      },
      datePublished: review.created_at,
      reviewBody: review.review_text,
      name: review.review_title,
    }))
  }

  // Add additional product properties if available
  if (product.color?.length) {
    structuredData.color = product.color
  }

  if (product.size?.length) {
    structuredData.size = product.size
  }

  if (product.material?.length) {
    structuredData.material = product.material
  }

  if (product.weight) {
    structuredData.weight = {
      '@type': 'QuantitativeValue',
      value: product.weight,
      unitCode: product.weight_unit?.toUpperCase() || 'KGM',
    }
  }

  if (product.dimensions) {
    const unit = product.dimensions.unit?.toUpperCase() || 'CMT'
    
    if (product.dimensions.height) {
      structuredData.height = {
        '@type': 'QuantitativeValue',
        value: product.dimensions.height,
        unitCode: unit,
      }
    }
    
    if (product.dimensions.width) {
      structuredData.width = {
        '@type': 'QuantitativeValue',
        value: product.dimensions.width,
        unitCode: unit,
      }
    }
    
    if (product.dimensions.length) {
      structuredData.depth = {
        '@type': 'QuantitativeValue',
        value: product.dimensions.length,
        unitCode: unit,
      }
    }
  }

  return structuredData
}
