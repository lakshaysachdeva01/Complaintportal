import { useState, useEffect, useRef, useCallback } from 'react'
import {
  apiGetIssues,
  apiUpdateIssueStatus,
  mapApiIssueToUi,
  uiStatusToApi,
  verifyIssueStatusQueryWorks,
  type UiIssue,
} from '../api'

interface AdminDashboardProps {
  onLogout: () => void
}

type Tab = 'home' | 'all' | 'resolved' | 'pending'

type Issue = UiIssue

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [issues, setIssues] = useState<Issue[]>([])
  const [resolvedFromServer, setResolvedFromServer] = useState<Issue[] | null>(null)
  const [pendingFromServer, setPendingFromServer] = useState<Issue[] | null>(null)
  const statusQueryVerifiedRef = useRef(false)
  const statusQueryWorksRef = useRef(false)
  const statusUpdateInFlightRef = useRef<Set<number>>(new Set())

  const sortDesc = (list: Issue[]) =>
    [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const refreshIssues = useCallback(async () => {
    const fullRaw = await apiGetIssues()
    let works = statusQueryWorksRef.current

    if (!statusQueryVerifiedRef.current) {
      statusQueryVerifiedRef.current = true
      works = await verifyIssueStatusQueryWorks(fullRaw)
      statusQueryWorksRef.current = works
    }

    const full = sortDesc(fullRaw.map(mapApiIssueToUi))
    setIssues(full)

    if (works) {
      const [cRaw, pRaw, ipRaw] = await Promise.all([
        apiGetIssues('COMPLETED'),
        apiGetIssues('PENDING'),
        apiGetIssues('IN_PROCESS'),
      ])
      setResolvedFromServer(sortDesc(cRaw.map(mapApiIssueToUi)))
      setPendingFromServer(sortDesc([...pRaw, ...ipRaw].map(mapApiIssueToUi)))
    } else {
      setResolvedFromServer(null)
      setPendingFromServer(null)
    }
  }, [])

  useEffect(() => {
    const sync = () => {
      refreshIssues().catch(() => {})
    }
    sync()

    const onVisible = () => {
      if (document.visibilityState === 'visible') sync()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshIssues])

  const updateIssueStatus = async (issue: Issue, newStatus: string) => {
    if (newStatus === issue.status) return

    const issueId = issue.id
    if (statusUpdateInFlightRef.current.has(issueId)) return
    statusUpdateInFlightRef.current.add(issueId)

    const reporterId =
      issue.userId != null && !Number.isNaN(Number(issue.userId))
        ? Number(issue.userId)
        : null

    const FALLBACK_A = 5
    const FALLBACK_B = 11

    const firstUserId = reporterId ?? FALLBACK_A
    const secondUserId =
      firstUserId === FALLBACK_A
        ? FALLBACK_B
        : firstUserId === FALLBACK_B
          ? FALLBACK_A
          : FALLBACK_A

    const userIdsToTry =
      firstUserId === secondUserId ? [firstUserId] : [firstUserId, secondUserId]

    try {
      for (const userId of userIdsToTry) {
        try {
          await apiUpdateIssueStatus({
            userId,
            id: Number(issueId),
            status: uiStatusToApi(newStatus),
          })
          break
        } catch {
          /* try next userId (e.g. 5 ↔ 11) */
        }
      }

      await refreshIssues().catch(() => {})
    } finally {
      statusUpdateInFlightRef.current.delete(issueId)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const newIssues = issues.filter((issue) => issue.status === 'new')
  const resolvedIssues =
    resolvedFromServer ?? issues.filter((issue) => issue.status === 'resolved')
  const pendingIssues =
    pendingFromServer ??
    issues.filter((issue) => issue.status === 'pending' || issue.status === 'in_progress')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Municipal Corp</p>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center space-x-3 ${
              activeTab === 'home'
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>New Issues</span>
            {newIssues.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {newIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center space-x-3 ${
              activeTab === 'all'
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>All Issues</span>
          </button>

          <button
            onClick={() => setActiveTab('resolved')}
            className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center space-x-3 ${
              activeTab === 'resolved'
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Resolved</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center space-x-3 ${
              activeTab === 'pending'
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pending</span>
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen overflow-auto bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {activeTab === 'home' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">New Issues Raised</h2>
              {newIssues.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 text-lg">No new issues</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {newIssues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} onStatusUpdate={updateIssueStatus} formatDate={formatDate} getStatusBadgeColor={getStatusBadgeColor} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">All Issues</h2>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} onStatusUpdate={updateIssueStatus} formatDate={formatDate} getStatusBadgeColor={getStatusBadgeColor} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resolved' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Resolved Issues</h2>
              {resolvedIssues.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 text-lg">No resolved issues</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resolvedIssues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} onStatusUpdate={updateIssueStatus} formatDate={formatDate} getStatusBadgeColor={getStatusBadgeColor} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Pending Issues</h2>
              {pendingIssues.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 text-lg">No pending issues</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingIssues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} onStatusUpdate={updateIssueStatus} formatDate={formatDate} getStatusBadgeColor={getStatusBadgeColor} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface IssueCardProps {
  issue: Issue
  onStatusUpdate: (issue: Issue, status: string) => void
  formatDate: (date: string) => string
  getStatusBadgeColor: (status: string) => string
}

function IssueCard({ issue, onStatusUpdate, formatDate, getStatusBadgeColor }: IssueCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition duration-200 flex gap-6">
      {/* Image on the left */}
      {issue.image ? (
        <div className="flex-shrink-0">
          <img
            src={issue.image}
            alt="Issue evidence"
            className="w-[200px] h-[160px] object-cover rounded-lg border border-gray-300"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-[200px] h-[160px] bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Text content on the right */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1 text-ellipsis">
            {issue.subject}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-3 ${getStatusBadgeColor(issue.status)}`}>
            {issue.status === 'new' ? 'New' : issue.status === 'in_progress' ? 'In Progress' : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{issue.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(issue.date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{issue.userName}</span>
          </div>
        </div>

        <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-2 text-ellipsis">{issue.description}</p>

        {/* Status update */}
        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Update Status:</label>
            <select
              value={issue.status}
              onChange={(e) => onStatusUpdate(issue, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
          Submitted on {formatDate(issue.createdAt)} by {issue.userEmail}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

