// pages/auth.tsx
import { useState } from "react";
import { signIn, signUp } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") await signUp(email, password);
      else await signIn(email, password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/chat` },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-6 transition-colors duration-300">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === "signup"
              ? "Join our community and get started"
              : "Sign in to continue to your account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : mode === "signup"
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
          <span className="flex-1 border-b border-slate-300 dark:border-slate-600"></span>
          OR
          <span className="flex-1 border-b border-slate-300 dark:border-slate-600"></span>
        </div>

        {/* Google Sign-In */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
        >
          <img
            src="/google-logo.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        {/* Toggle Sign In / Sign Up */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          {mode === "signup"
            ? "Already have an account?"
            : "Need an account?"}{" "}
          <span
            className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Sign in" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
}
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['nav', 'common'])),
    },
    revalidate: 60,
  };
};