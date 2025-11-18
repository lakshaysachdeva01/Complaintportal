import { useState, useEffect } from 'react'

interface AdminDashboardProps {
  onLogout: () => void
}

type Tab = 'home' | 'all' | 'resolved' | 'pending' | 'sent'

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

function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responses, setResponses] = useState<any[]>([])

  const loadIssues = () => {
    const storedIssues = localStorage.getItem('issues')
    if (storedIssues) {
      const allIssues = JSON.parse(storedIssues)
      // Sort by newest first
      allIssues.sort((a: Issue, b: Issue) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setIssues(allIssues)
    }
  }

  const loadResponses = () => {
    const storedResponses = localStorage.getItem('responses')
    if (storedResponses) {
      const allResponses = JSON.parse(storedResponses)
      // Filter only admin responses (sent by admin)
      const adminResponses = allResponses.filter((r: any) => r.from === 'Municipal Corporation')
      // Sort by newest first
      adminResponses.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setResponses(adminResponses)
    }
  }

  const initializeStaticIssues = () => {
    const storedIssues = localStorage.getItem('issues')
    const staticIssueIds = [1001, 1002, 1003, 1004, 1005, 1006]
    
    const createStaticIssues = (): Issue[] => [
      {
        id: 1001,
        userId: null,
        userName: 'Demo User 1',
        userEmail: 'demo1@example.com',
        subject: 'Broken Street Light on Main Road',
        location: 'Main Road, Sector 5',
        description: 'Street light number 45 is not working. It has been dark for the past week, causing safety concerns for pedestrians.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: null,
        status: 'new',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 1002,
        userId: null,
        userName: 'Demo User 2',
        userEmail: 'demo2@example.com',
        subject: 'Garbage Not Collected',
        location: 'Park Street, Block A',
        description: 'Garbage has not been collected for the past 5 days. The bins are overflowing and causing foul smell in the area.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: null,
        status: 'in_progress',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 1003,
        userId: null,
        userName: 'Demo User 3',
        userEmail: 'demo3@example.com',
        subject: 'Pothole on Highway',
        location: 'Highway Road, KM 12',
        description: 'Large pothole near the highway exit. Multiple vehicles have been damaged. Needs immediate attention.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: null,
        status: 'resolved',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 1004,
        userId: null,
        userName: 'Demo User 4',
        userEmail: 'demo4@example.com',
        subject: 'Water Leakage in Public Park',
        location: 'Central Park, Zone 3',
        description: 'Water pipe is leaking near the children play area. Water is being wasted and creating slippery conditions.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: null,
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 1005,
        userId: null,
        userName: 'Demo User 5',
        userEmail: 'demo5@example.com',
        subject: 'Illegal Parking on No-Parking Zone',
        location: 'Market Street, Near Hospital',
        description: 'Vehicles are regularly parked in no-parking zone blocking emergency vehicle access to the hospital.',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: null,
        status: 'resolved',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 1006,
        userId: null,
        userName: 'Demo User 6',
        userEmail: 'demo6@example.com',
        subject: 'Damaged Footpath',
        location: 'School Road, Block B',
        description: 'Footpath tiles are broken and uneven, making it difficult for pedestrians, especially elderly and children.',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        image: null,
        status: 'pending',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    
    if (!storedIssues) {
      // Create all static issues if no issues exist
      const staticIssues = createStaticIssues()
      localStorage.setItem('issues', JSON.stringify(staticIssues))
    } else {
      // Merge missing static issues with existing ones
      const existingIssues = JSON.parse(storedIssues)
      const existingStaticIds = existingIssues.map((issue: Issue) => issue.id)
      const missingStaticIds = staticIssueIds.filter(id => !existingStaticIds.includes(id))
      
      if (missingStaticIds.length > 0) {
        const allStaticIssues = createStaticIssues()
        const staticIssuesToAdd = allStaticIssues.filter(issue => missingStaticIds.includes(issue.id))
        const mergedIssues = [...existingIssues, ...staticIssuesToAdd]
        localStorage.setItem('issues', JSON.stringify(mergedIssues))
      }
    }
  }

  useEffect(() => {
    initializeStaticIssues()
    loadIssues()
    loadResponses()
    
    // Refresh issues every 2 seconds to catch new user submissions
    const interval = setInterval(() => {
      loadIssues()
      loadResponses()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const updateIssueStatus = (issueId: number, newStatus: string) => {
    const updatedIssues = issues.map((issue) =>
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    )
    setIssues(updatedIssues)
    localStorage.setItem('issues', JSON.stringify(updatedIssues))
    
    // Also update responses if they exist
    const storedResponses = localStorage.getItem('responses')
    if (storedResponses) {
      const responses = JSON.parse(storedResponses)
      const updatedResponses = responses.map((response: any) => {
        if (response.issueId === issueId) {
          // Update response message if status changed
          return response
        }
        return response
      })
      localStorage.setItem('responses', JSON.stringify(updatedResponses))
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
  const resolvedIssues = issues.filter((issue) => issue.status === 'resolved')
  const pendingIssues = issues.filter((issue) => issue.status === 'pending' || issue.status === 'in_progress')

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

          <button
            onClick={() => setActiveTab('sent')}
            className={`w-full text-left px-4 py-3 rounded-lg transition duration-200 flex items-center space-x-3 ${
              activeTab === 'sent'
                ? 'bg-indigo-50 text-indigo-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Sent</span>
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
                    <IssueCard key={issue.id} issue={issue} onStatusUpdate={updateIssueStatus} formatDate={formatDate} getStatusBadgeColor={getStatusBadgeColor} onOpenResponse={(issue) => { setSelectedIssue(issue); setShowResponseModal(true); }} />
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
                  <IssueCard key={issue.id} issue={issue} onStatusUpdate={updateIssueStatus} formatDate={formatDate} getStatusBadgeColor={getStatusBadgeColor} onOpenResponse={(issue) => { setSelectedIssue(issue); setShowResponseModal(true); }} />
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
                    <IssueCard key={issue.id} issue={issue} onStatusUpdate={updateIssueStatus} formatDate={formatDate} getStatusBadgeColor={getStatusBadgeColor} onOpenResponse={(issue) => { setSelectedIssue(issue); setShowResponseModal(true); }} />
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
                    <IssueCard key={issue.id} issue={issue} onStatusUpdate={updateIssueStatus} formatDate={formatDate} getStatusBadgeColor={getStatusBadgeColor} onOpenResponse={(issue) => { setSelectedIssue(issue); setShowResponseModal(true); }} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Sent Responses</h2>
              {responses.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 text-lg">No responses sent yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {responses.map((response) => {
                    const issue = issues.find((i) => i.id === response.issueId)
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
                              Sent on {formatDateTime(response.createdAt)}
                            </div>
                            
                          </div>
                          
                        {/* Original Issue Card */}
                        {issue && (
                          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition duration-200 flex gap-6">
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
                              </div>
                              <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-2 text-ellipsis">{issue.description}</p>
                              <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
                                Submitted on {formatDate(issue.createdAt)}
                              </div>
                            </div>
                          </div>
                        )}
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedIssue && (
        <ResponseModal
          issue={selectedIssue}
          onClose={() => {
            setShowResponseModal(false)
            setSelectedIssue(null)
          }}
          onSend={(message) => {
            const storedResponses = localStorage.getItem('responses')
            const allResponses = storedResponses ? JSON.parse(storedResponses) : []

            const newResponse = {
              id: Date.now(),
              issueId: selectedIssue.id,
              userId: selectedIssue.userId,
              from: 'Municipal Corporation',
              message: message,
              image: selectedIssue.image,
              subject: selectedIssue.subject,
              location: selectedIssue.location,
              createdAt: new Date().toISOString(),
            }

            allResponses.push(newResponse)
            localStorage.setItem('responses', JSON.stringify(allResponses))
            loadResponses()
            setShowResponseModal(false)
            setSelectedIssue(null)
          }}
        />
      )}
    </div>
  )
}

interface ResponseModalProps {
  issue: Issue
  onClose: () => void
  onSend: (message: string) => void
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

function ResponseModal({ issue, onClose, onSend }: ResponseModalProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Send Response</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-600 mb-1">Issue:</p>
          <p className="text-gray-800 font-semibold">{issue.subject}</p>
          <p className="text-sm text-gray-600 mt-1">Location: {issue.location}</p>
          <p className="text-sm text-gray-600">From: {issue.userName} ({issue.userEmail})</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 resize-none"
              placeholder="Type your response message here..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              Send Response
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface IssueCardProps {
  issue: Issue
  onStatusUpdate: (id: number, status: string) => void
  formatDate: (date: string) => string
  getStatusBadgeColor: (status: string) => string
  onOpenResponse: (issue: Issue) => void
}

function IssueCard({ issue, onStatusUpdate, formatDate, getStatusBadgeColor, onOpenResponse }: IssueCardProps) {
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

        {/* Status Update and Message Button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Update Status:</label>
            <select
              value={issue.status}
              onChange={(e) => onStatusUpdate(issue.id, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <button
            onClick={() => onOpenResponse(issue)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Respond</span>
          </button>
        </div>

        <div className="text-xs text-gray-500 pt-3 border-t border-gray-200">
          Submitted on {formatDate(issue.createdAt)} by {issue.userEmail}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

