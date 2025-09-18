import Layout from '../components/Layout'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetchInitial()

    const sub = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchInitial() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(200)
    setMessages(data || [])
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text || !name) return
    await supabase.from('messages').insert([{ name, text }])
    setText('')
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto h-[70vh] flex flex-col bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Live Chat
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Supabase powered
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {messages.map((m, i) => {
            const isMe = m.name === name
            return (
              <div
                key={i}
                className={`flex flex-col ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl break-words shadow-sm transition-colors duration-200 ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                  }`}
                >
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="mt-1">{m.text}</div>
                  <div className="text-xs mt-1 text-gray-400 dark:text-gray-300 text-right">
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 shadow-inner"
        >
          <input
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition placeholder:text-gray-400 dark:placeholder:text-gray-300"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-full transition-colors duration-200"
          >
            Send
          </button>
        </form>
      </div>
    </Layout>
  )
}
