import { useState, useEffect } from 'react'

interface RaiseIssueProps {
  onIssueSubmitted: () => void
}

function RaiseIssue({ onIssueSubmitted }: RaiseIssueProps) {
  const [formData, setFormData] = useState({
    subject: '',
    location: '',
    description: '',
    date: '',
    image: null as string | null,
  })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      setUser(JSON.parse(currentUser))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setMessage('')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file')
        setTimeout(() => setMessage(''), 3000)
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB')
        setTimeout(() => setMessage(''), 3000)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFormData((prev) => ({ ...prev, image: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    // Validation
    if (!formData.subject.trim()) {
      setMessage('Please enter a subject')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    if (!formData.location.trim()) {
      setMessage('Please enter a location')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    if (!formData.description.trim()) {
      setMessage('Please enter a description')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    if (!formData.date) {
      setMessage('Please select a date')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setIsLoading(true)

    // Get existing issues from localStorage
    const storedIssues = localStorage.getItem('issues')
    const issues = storedIssues ? JSON.parse(storedIssues) : []

    // Create new issue
    const newIssue = {
      id: Date.now(),
      userId: user?.id || null,
      userName: user?.name || 'Unknown',
      userEmail: user?.email || '',
      subject: formData.subject,
      location: formData.location,
      description: formData.description,
      date: formData.date,
      image: formData.image,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage
    issues.push(newIssue)
    localStorage.setItem('issues', JSON.stringify(issues))

    setTimeout(() => {
      setIsLoading(false)
      setMessage('Thank you! Your issue has been submitted successfully.')
      setTimeout(() => {
        // Reset form
        setFormData({
          subject: '',
          location: '',
          description: '',
          date: '',
          image: null,
        })
        setMessage('')
        onIssueSubmitted()
      }, 2000)
    }, 500)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }))
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Raise your Issue
          </h1>
          <p className="text-gray-600 text-lg">
            Report rule violations or safety protocol non-compliance. Help maintain safety and order by reporting incidents that need attention.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.includes('Thank you') || message.includes('successfully')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg  p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
                placeholder="Brief description of the issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
                placeholder="Where did this occur?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200 resize-none"
                placeholder="Provide detailed information about the rule violation or safety protocol non-compliance..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Upload (Optional)
              </label>
              {formData.image ? (
                <div className="relative">
                  <img
                    src={formData.image}
                    alt="Uploaded"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RaiseIssue

