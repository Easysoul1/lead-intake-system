import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import LeadCard from '@/components/LeadCard'
import { Lead } from '@/types/lead'

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterQualified, setFilterQualified] = useState(false)
  const [sortBy, setSortBy] = useState<'score' | 'date'>('date')

  const fetchLeads = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (filterQualified) {
        params.append('qualified', 'true')
      }
      if (sortBy === 'score') {
        params.append('sortBy', 'score')
      }

      const response = await fetch(`/api/leads/list?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leads')
      }

      setLeads(result.leads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [filterQualified, sortBy])

  const qualifiedCount = leads.filter(l => l.qualified).length
  const totalScore = leads.reduce((sum, l) => sum + l.score, 0)
  const averageScore = leads.length > 0 ? Math.round(totalScore / leads.length) : 0

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Lead Dashboard</h1>
        <p className="text-lg text-gray-600">
          View and manage all submitted leads with enrichment data and qualification scores.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <p className="text-sm font-medium opacity-90 mb-1">Total Leads</p>
          <p className="text-4xl font-bold">{leads.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm font-medium opacity-90 mb-1">Qualified Leads</p>
          <p className="text-4xl font-bold">{qualifiedCount}</p>
        </div>
        <div className="card bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <p className="text-sm font-medium opacity-90 mb-1">Average Score</p>
          <p className="text-4xl font-bold">{averageScore}</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filterQualified}
                onChange={(e) => setFilterQualified(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Show only qualified leads
              </span>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
              className="input-field py-2 text-sm"
            >
              <option value="date">Newest First</option>
              <option value="score">Highest Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card bg-red-50 border-2 border-red-200">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchLeads}
            className="mt-4 btn-secondary"
          >
            Retry
          </button>
        </div>
      )}

      {/* Leads List */}
      {!loading && !error && (
        <>
          {leads.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No leads found</p>
              <p className="text-gray-400 text-sm">
                {filterQualified
                  ? 'No qualified leads match your filter. Try removing the filter to see all leads.'
                  : 'Submit your first lead to get started!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {leads.map(lead => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </>
      )}
    </Layout>
  )
}
