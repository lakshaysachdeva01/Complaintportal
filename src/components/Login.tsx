import { useState, useEffect } from 'react'
import { apiLogin, rememberUserIdForEmail } from '../api'

interface LoginProps {
  onSwitchToSignup: () => void
  onLoginSuccess: () => void
}

const backgroundImages = [
  '/images/img-3.webp',
  '/images/istockphoto-1313632033-612x612.jpg',
  '/images/Potholes-resized-for-blog.jpg',
  '/images/Untitled-design-62.jpg',
]

function Login({ onSwitchToSignup, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Check for admin login (keeping this for backward compatibility)
    if (email === 'admin@gmail.com' && password === '12345678') {
      setTimeout(() => {
        const adminUser = {
          id: 'admin',
          email: 'admin@gmail.com',
          name: 'Admin',
          role: 'admin',
        }
        localStorage.setItem('currentUser', JSON.stringify(adminUser))
        localStorage.setItem('isAdmin', 'true')
        setIsLoading(false)
        onLoginSuccess()
      }, 500)
      return
    }

    try {
      const data = (await apiLogin({
        email: email.trim(),
        password,
      })) as Record<string, unknown>

      const u = (data.user as Record<string, unknown> | undefined) ?? data
      const id = u.id ?? u.userId ?? data.id ?? data.userId
      const user = {
        id: id != null ? Number(id) : undefined,
        email: String(u.email ?? email.trim()),
        name: u.name != null ? String(u.name) : undefined,
        role: String(u.role ?? 'USER'),
      }

      if (user.id != null && !Number.isNaN(user.id)) {
        rememberUserIdForEmail(user.email, user.id)
      }

      const sessionUser: Record<string, unknown> = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
      if (typeof u.phone === 'string') sessionUser.phone = u.phone
      if (typeof u.aadhar === 'string') sessionUser.aadhar = u.aadhar

      localStorage.setItem('currentUser', JSON.stringify(sessionUser))
      localStorage.removeItem('isAdmin')
      setIsLoading(false)
      onLoginSuccess()
    } catch (err: unknown) {
      const e = err as Error & { status?: number }
      const status = e.status
      const msg = (e.message || '').toLowerCase()

      const looksLikeMissingUser =
        status === 404 ||
        msg.includes('not found') ||
        msg.includes('does not exist') ||
        msg.includes("doesn't exist") ||
        msg.includes('no user') ||
        msg.includes('user not exist') ||
        msg.includes('not registered')

      if (looksLikeMissingUser) {
        setError('User does not exist. Please create an account.')
      } else if (
        status === 401 ||
        status === 403 ||
        msg.includes('password') ||
        msg.includes('invalid') ||
        msg.includes('unauthorized') ||
        msg.includes('bad credentials') ||
        msg.includes('incorrect')
      ) {
        setError('Invalid email or password.')
      } else {
        setError(e.message || 'Could not sign in. Please try again.')
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Slideshow */}
      <div className="fixed inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Background ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70 bg-opacity-50 backdrop-blur-xs"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Marquee */}
        <div className="bg-[#dfdcff9c] bg-opacity-90 text-white py-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="inline-block mr-8">
              📢 Facing issues in your area? Rule violations, safety concerns, or civic problems - You can now report them all here! Help us build a safer and better community. 🏘️
            </span>
            <span className="inline-block mr-8">
              📢 Facing issues in your area? Rule violations, safety concerns, or civic problems - You can now report them all here! Help us build a safer and better community. 🏘️
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center py-6 px-4 mt-[20px] ">
          <h1  style={{fontFamily: 'unset'}} className="text-[56px] font-semibold text-indigo-600  drop-shadow-lg">
            Complaint Portal
          </h1>
          <p  style={{fontFamily: 'Math'}} className="text-[58px] text-white font-normal drop-shadow-md">
            Report Issues & Get Quick Responses
          </p>
          <p className="text-lg text-gray-200 mt-2 drop-shadow-md">
            Your voice matters. Report rule violations and civic issues easily.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 mb-[120px]">
          <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl p-8 max-w-md w-full backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
<h3 className='text-center text-gray-700 font-medium'>Sign In to continue</h3>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="Enter your email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

