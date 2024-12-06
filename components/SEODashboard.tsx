import React from 'react'
import { validateSchema, validateStructuredData, validateRequiredProductFields } from '@/utils/schemaValidation'

interface SEOScore {
  score: number
  issues: string[]
  recommendations: string[]
}

interface SEOMetrics {
  totalProducts: number
  totalCategories: number
  totalBlogPosts: number
  productsWithMissingFields: number
  productsWithInvalidSchema: number
  missingMetaDescriptions: number
  missingAltTags: number
  duplicateTitles: number
  lowWordCount: number
}

export default function SEODashboard() {
  const [metrics, setMetrics] = React.useState<SEOMetrics | null>(null)
  const [seoScore, setSeoScore] = React.useState<SEOScore | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchSEOMetrics()
  }, [])

  async function fetchSEOMetrics() {
    try {
      const response = await fetch('/api/seo/metrics')
      const data = await response.json()
      setMetrics(data.metrics)
      setSeoScore(data.score)
    } catch (error) {
      console.error('Error fetching SEO metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading SEO metrics...</div>
  }

  if (!metrics || !seoScore) {
    return <div>Error loading SEO metrics</div>
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">SEO Dashboard</h1>
      
      {/* Overall Score */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overall SEO Score</h2>
        <div className="flex items-center">
          <div className={`text-4xl font-bold ${
            seoScore.score >= 90 ? 'text-green-600' :
            seoScore.score >= 70 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {seoScore.score}%
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Products"
          value={metrics.totalProducts}
          subtitle={`${metrics.productsWithMissingFields} with missing fields`}
        />
        <MetricCard
          title="Categories"
          value={metrics.totalCategories}
          subtitle="Product Categories"
        />
        <MetricCard
          title="Blog Posts"
          value={metrics.totalBlogPosts}
          subtitle="Articles"
        />
      </div>

      {/* Issues */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Critical Issues</h2>
        <div className="space-y-2">
          {seoScore.issues.map((issue, index) => (
            <div key={index} className="flex items-center text-red-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {issue}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
        <div className="space-y-2">
          {seoScore.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-center text-blue-600">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {recommendation}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, subtitle }: { title: string, value: number, subtitle: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="text-3xl font-bold my-2">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  )
}
