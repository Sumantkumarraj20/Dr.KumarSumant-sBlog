// pages/auth.tsx
import { useState } from 'react';
import { signIn, signUp } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'signup') await signUp(email, password);
    else await signIn(email, password);
  }
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/chat` },
    });
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">{mode === 'signup' ? 'Sign Up' : 'Sign In'}</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
        />
        <button className="bg-blue-600 text-white p-2 w-full">
          {mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
      </form>
       <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <button
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
      >
        Sign in with Google
      </button>
    </div>
      <p
        className="text-sm mt-3 cursor-pointer text-blue-600"
        onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
      >
        {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
      </p>
    </div>
  );
}
