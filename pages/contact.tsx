
import Layout from '../components/Layout'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Contact() {
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [message,setMessage] = useState('')
  const [status,setStatus] = useState<string|null>(null)

  async function handleSubmit(e:any){
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.from('contacts').insert([{ name, email, message }])
    if(error){ setStatus('error: '+error.message) } else { setStatus('sent'); setName(''); setEmail(''); setMessage('') }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-2 border rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
          <input className="w-full p-2 border rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <textarea className="w-full p-2 border rounded" placeholder="Message" value={message} onChange={e=>setMessage(e.target.value)} rows={6} required />
          <div className="flex items-center gap-3">
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded">Send</button>
            <span className="text-sm text-slate-500">{status}</span>
          </div>
        </form>
      </div>
    </Layout>
  )
}
