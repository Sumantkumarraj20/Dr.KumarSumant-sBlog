import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: msg }),
      })
      setStatus(res.ok ? 'sent' : 'error')
      if (res.ok) {
        setName('')
        setEmail('')
        setMsg('')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Get in Touch
      </h2>
      <p className="mb-6 text-slate-600 dark:text-slate-300">
        Have questions or suggestions? Fill out the form below and I’ll get back to you.
      </p>
      <form
        onSubmit={submit}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 flex flex-col gap-4 transition-colors duration-300"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          required
          className="border border-gray-300 dark:border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email"
          required
          className="border border-gray-300 dark:border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
        />
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Your Message"
          required
          rows={5}
          className="border border-gray-300 dark:border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition resize-none"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-md py-3 transition-colors duration-300"
        >
          Send Message
        </button>

        {status && (
          <p
            className={`mt-2 font-medium ${
              status === 'sent'
                ? 'text-green-600 dark:text-green-400'
                : status === 'sending'
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {status === 'sent'
              ? 'Message sent successfully!'
              : status === 'sending'
              ? 'Sending message...'
              : 'Something went wrong. Please try again.'}
          </p>
        )}
      </form>
    </div>
  )
}
