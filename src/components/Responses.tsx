import { useState, useEffect } from 'react'

interface Response {
  id: number
  issueId: number
  userId: number | null
  from: string
  message: string
  image: string | null
  subject: string
  location: string
  createdAt: string
}

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

function Responses() {
  const [responses, setResponses] = useState<Response[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      setUser(userData)
    }
  }, [])

  useEffect(() => {
    const loadResponses = () => {
      const storedResponses = localStorage.getItem('responses')
      if (storedResponses) {
        const allResponses = JSON.parse(storedResponses)
        // Filter responses for current user
        if (user) {
          const userResponses = allResponses.filter((response: Response) => response.userId === user.id)
          // Sort by newest first
          userResponses.sort((a: Response, b: Response) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setResponses(userResponses)
        } else {
          const sortedResponses = allResponses.sort((a: Response, b: Response) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setResponses(sortedResponses)
        }
      }
    }
    loadResponses()
  }, [user])

  const getIssueById = (issueId: number): Issue | null => {
    const storedIssues = localStorage.getItem('issues')
    if (storedIssues) {
      const issues = JSON.parse(storedIssues)
      return issues.find((issue: Issue) => issue.id === issueId) || null
    }
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (responses.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Responses</h2>
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No responses yet</p>
          <p className="text-gray-400 text-sm mt-2">Your responses will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Responses</h2>
      <div className="space-y-6">
        {responses.map((response) => {
          const issue = getIssueById(response.issueId)
          return (
            <div key={response.id} className="space-y-4">
              {/* Response Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition duration-200">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-indigo-600 mb-3">
                   From : Municipal Corp
                  </h3>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Re: {response.subject}
                  </h4>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Response:</p>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {response.message}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                    Received on {formatDateTime(response.createdAt)}
                  </div>
                </div>
              </div>

             
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Responses
