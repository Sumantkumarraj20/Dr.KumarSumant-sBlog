import Link from 'next/link'

type PostCardProps = {
  meta: {
    title: string
    slug: string
    date: string
    tags?: string[]
    description?: string
    thumbnail?: string // optional image URL
  }
}

export default function PostCard({ meta }: PostCardProps) {
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      
      {/* Thumbnail */}
      {meta.thumbnail && (
        <div className="relative overflow-hidden h-48 md:h-52">
          <img
            src={meta.thumbnail}
            alt={meta.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}

      <div className="p-6 flex flex-col justify-between h-full">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {meta.tags?.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          <Link
            href={`/posts/${meta.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            {meta.title}
          </Link>
        </h3>

        {/* Date */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          {meta.date}
        </p>

        {/* Description */}
        <p className="text-slate-700 dark:text-slate-200 mb-4 line-clamp-3">
          {meta.description || ''}
        </p>

        {/* Read More */}
        <div>
          <Link
            href={`/posts/${meta.slug}`}
            className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  )
}
