import { Lead } from '@/types/lead'

interface LeadCardProps {
  lead: Lead
}

export default function LeadCard({ lead }: LeadCardProps) {
  return (
    <div className="card hover:border-primary-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{lead.name}</h3>
          <p className="text-primary-600 font-medium">{lead.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {lead.qualified ? (
            <span className="badge badge-success">Qualified</span>
          ) : (
            <span className="badge badge-warning">Unqualified</span>
          )}
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{lead.score}</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {lead.website && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Website</p>
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 font-medium break-all"
            >
              {lead.website}
            </a>
          </div>
        )}

        {lead.companyName && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Company</p>
            <p className="text-gray-900 font-medium">{lead.companyName}</p>
          </div>
        )}

        {lead.companySize && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Company Size</p>
            <p className="text-gray-900 font-medium">{lead.companySize} employees</p>
          </div>
        )}

        {lead.industry && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Industry</p>
            <p className="text-gray-900 font-medium">{lead.industry}</p>
          </div>
        )}

        {lead.country && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Country</p>
            <p className="text-gray-900 font-medium">{lead.country}</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Created: {new Date(lead.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
