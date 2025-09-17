import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Welcome to My Health Blog</h1>
      <p className="mt-4">Evidence-based guidance for patients in India.</p>
      <Link href="/posts/first-post" className="text-blue-600 underline mt-2 block">Read first article</Link>
    </div>
  );
}
