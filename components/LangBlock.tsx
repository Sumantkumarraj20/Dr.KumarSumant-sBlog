"use client";
import { ReactNode } from "react";
import { useRouter } from "next/router";

export default function LangBlock({
  lang,
  children,
}: {
  lang: string;
  children: ReactNode;
}) {
  const { locale } = useRouter();
  return locale === lang ? <>{children}</> : null;
}
