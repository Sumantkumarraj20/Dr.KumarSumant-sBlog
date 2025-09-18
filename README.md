
# Health Blog Starter

## What this package includes
- Next.js 14 (Pages) + TypeScript starter
- MDX posts in `content/posts/*.mdx`
- TailwindCSS styling
- Supabase client wired to contact form and a live chat example (requires `messages` table)
- Sample posts (diabetes, vaccines, nutrition)
- `supabase/migrations/001_create_messages.sql` — run this in Supabase SQL editor to enable live chat.

## Setup (local)
1. Clone your repo or replace files.
2. Install dependencies:
   ```
   npm install
   ```
3. Add environment variables (locally `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. (Optional) In Supabase SQL editor, run `supabase/migrations/001_create_messages.sql`
5. Run dev:
   ```
   npm run dev
   ```

## Deploy to Vercel
- Push this repo to GitHub, connect Vercel, and add the two environment variables in Project Settings.
- Vercel will build and deploy automatically.

## Notes
- Do NOT commit your real keys.
- The chat uses Supabase Realtime and a public `messages` table. For small user counts this is free, but monitor usage.
