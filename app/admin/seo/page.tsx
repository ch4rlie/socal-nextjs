import { Metadata } from 'next'
import SEODashboard from '@/components/SEODashboard'

export const metadata: Metadata = {
  title: 'SEO Dashboard | SoCal Shop Admin',
  description: 'Monitor and optimize your site\'s SEO performance',
}

export default function SEOPage() {
  return (
    <div className="container mx-auto py-8">
      <SEODashboard />
    </div>
  )
}
