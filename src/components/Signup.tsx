import { useState, useEffect } from 'react'
import { apiCreateUser, apiGetDepartments, rememberUserIdForEmail } from '../api'

interface SignupProps {
  onSwitchToLogin: () => void
  onSignupSuccess: () => void
}

function Signup({ onSwitchToLogin, onSignupSuccess }: SignupProps) {
  const [defaultDepartmentId, setDefaultDepartmentId] = useState<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    apiGetDepartments()
      .then((depts) => {
        if (!cancelled && depts.length > 0) setDefaultDepartmentId(depts[0].id)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadhar: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits')
      return false
    }
    if (formData.aadhar && !/^[0-9]{12}$/.test(formData.aadhar)) {
      setError('Aadhar number must be exactly 12 digits')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const data = await apiCreateUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'USER',
        ...(defaultDepartmentId != null ? { departmentId: defaultDepartmentId } : {}),
      })

      rememberUserIdForEmail(formData.email, data.id)

      const newUser = {
        id: data.id,
        name: data.name ?? formData.name,
        email: data.email ?? formData.email,
        role: data.role ?? 'USER',
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.aadhar && { aadhar: formData.aadhar }),
      }
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      setIsLoading(false)
      onSignupSuccess()
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Fill in your details to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setFormData((prev) => ({ ...prev, phone: value }))
                setError('')
              }}
              maxLength={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter 10-digit phone number (optional)"
            />
          </div>

          <div>
            <label
              htmlFor="aadhar"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Aadhar Number
            </label>
            <input
              type="text"
              id="aadhar"
              name="aadhar"
              value={formData.aadhar}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setFormData((prev) => ({ ...prev, aadhar: value }))
                setError('')
              }}
              maxLength={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Enter 12-digit Aadhar number (optional)"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
              placeholder="Create a password (min. 6 characters)"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup

