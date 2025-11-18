import { useState, useEffect } from 'react'

interface Issue {
  id: number
  userId: number | null
  userName: string
  userEmail: string
  subject: string
  location: string
  description: string
  date: string
  image: string | null
  status: string
  createdAt: string
}

function IssuesRaised() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      setUser(userData)
    }
  }, [])

  useEffect(() => {
    const loadIssues = () => {
      const storedIssues = localStorage.getItem('issues')
      if (storedIssues) {
        const allIssues = JSON.parse(storedIssues)
        // Filter issues for current user
        if (user) {
          const userIssues = allIssues.filter((issue: Issue) => issue.userId === user.id)
          // Sort by newest first
          userIssues.sort((a: Issue, b: Issue) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setIssues(userIssues)
        } else {
          const sortedIssues = allIssues.sort((a: Issue, b: Issue) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setIssues(sortedIssues)
        }
      }
    }
    loadIssues()
    
    // Refresh issues every 2 seconds to catch admin updates
    const interval = setInterval(loadIssues, 2000)
    return () => clearInterval(interval)
  }, [user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (issues.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Issues Raised</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No issues raised yet</p>
          <p className="text-gray-400 text-sm mt-2">Your raised issues will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Issues Raised</h2>
      <div className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition duration-200 flex gap-6"
          >
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
              <div className="flex-shrink-0 w-64 h-64 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Text content on the right */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1 text-ellipsis">
                  {issue.subject}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-3 ${
                    issue.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : issue.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{issue.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatDate(issue.date)}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-2 text-ellipsis">{issue.description}</p>

              <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                Submitted on {formatDate(issue.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IssuesRaised
