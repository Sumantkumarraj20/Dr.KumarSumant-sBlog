// pages/learn/index.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LearnIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/learn/dashboard");
  }, [router]);

  return null; // or a loading spinner while redirecting
}
