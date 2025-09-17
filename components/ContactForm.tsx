import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState<string|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message: msg }),
    });
    setStatus(res.ok ? 'sent' : 'error');
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 p-4 border">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required className="border p-2"/>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required className="border p-2"/>
      <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Message" required className="border p-2"/>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">Send</button>
      {status && <p>{status}</p>}
    </form>
  );
}
