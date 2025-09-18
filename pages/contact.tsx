import { useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabaseClient'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const { error } = await supabase.from('contacts').insert([{ name, email, message }])
      if (error) {
        setStatus('Error: ' + error.message)
      } else {
        setStatus('Message sent successfully!')
        setName('')
        setEmail('')
        setMessage('')
      }
    } catch (err) {
      setStatus('Something went wrong. Please try again.')
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 transition-colors duration-300">
          <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Contact Me
          </h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Have a question or suggestion? Fill out the form below and I’ll get back to you promptly.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              required
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your Message"
              rows={6}
              required
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition resize-none"
            />

            <div className="flex items-center gap-4 mt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg py-3 px-6 transition-colors duration-300"
              >
                Send Message
              </button>
              {status && (
                <span
                  className={`text-sm font-medium ${
                    status.includes('Error')
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {status}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
