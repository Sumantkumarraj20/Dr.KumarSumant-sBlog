
import Link from 'next/link'
export default function PostCard({meta}:{meta:any}) {
  return (
    <article className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold"><Link href={'/posts/'+meta.slug}><a>{meta.title}</a></Link></h3>
      <p className="text-sm text-slate-500">{meta.date} · {meta.tags?.join(', ')}</p>
      <p className="mt-2 text-slate-700">{meta.description || ''}</p>
    </article>
  )
}
