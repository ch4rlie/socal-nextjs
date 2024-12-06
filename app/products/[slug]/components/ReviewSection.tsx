'use client'

import { ProductReview } from '@/types/product'
import { formatDate } from '@/utils/date'
import { StarRating } from '@/components/ui/star-rating'

interface Props {
  reviews: ProductReview[]
}

export function ReviewSection({ reviews }: Props) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-8 border-t border-gray-200 pt-8">
        <h2 className="text-lg font-medium text-gray-900">Reviews</h2>
        <p className="mt-4 text-sm text-gray-500">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-medium text-gray-900">Reviews</h2>
      <div className="mt-6 space-y-10 divide-y divide-gray-200">
        {reviews.map((review) => (
          <div key={review.id} className="pt-10">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {review.reviewer?.avatar_url ? (
                  <img
                    className="h-12 w-12 rounded-full"
                    src={review.reviewer.avatar_url}
                    alt={review.reviewer.username || 'Anonymous'}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">
                      {(review.reviewer?.username || 'A')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {review.reviewer?.username || 'Anonymous'}
                </h3>
                <div className="mt-1 flex items-center">
                  <StarRating rating={review.rating} />
                </div>
              </div>
            </div>

            {review.review_title && (
              <h4 className="mt-4 text-sm font-medium text-gray-900">
                {review.review_title}
              </h4>
            )}

            {review.review_text && (
              <div className="mt-4 space-y-6 text-sm text-gray-600">
                <p>{review.review_text}</p>
              </div>
            )}

            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="text-gray-500">
                {formatDate(review.created_at)}
              </div>
              {review.verified_purchase && (
                <div className="text-green-600">Verified Purchase</div>
              )}
              {review.helpful_votes > 0 && (
                <div className="text-gray-500">
                  {review.helpful_votes} {review.helpful_votes === 1 ? 'person' : 'people'} found this helpful
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
