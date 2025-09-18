
import Layout from '../components/Layout'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const bottomRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=> {
    fetchInitial()
    const sub = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        setMessages(prev=>[...prev, payload.new])
      })
      .subscribe()
    return ()=> { sub.unsubscribe() }
  }, [])

  useEffect(()=> { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function fetchInitial(){
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(200)
    setMessages(data || [])
  }

  async function sendMessage(e:any){
    e?.preventDefault()
    if(!text || !name) return
    await supabase.from('messages').insert([{ name, text }])
    setText('')
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-4 rounded shadow flex flex-col" style={{height: '70vh'}}>
        <div className="flex items-center gap-3 mb-3">
          <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} className="border p-2 rounded" />
          <div className="text-sm text-slate-500">Live chat via Supabase (free for low usage)</div>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-2 border rounded">
          {messages.map((m,i)=>(
            <div key={i} className="p-2 rounded">
              <div className="text-sm text-slate-600">{m.name} · <span className="text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</span></div>
              <div className="mt-1">{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendMessage} className="mt-3 flex gap-2">
          <input className="flex-1 p-2 border rounded" placeholder="Message..." value={text} onChange={e=>setText(e.target.value)} />
          <button className="px-4 py-2 bg-slate-800 text-white rounded">Send</button>
        </form>
      </div>
    </Layout>
  )
}
