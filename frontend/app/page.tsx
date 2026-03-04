"use client";
// Root page — Next.js middleware handles all redirects:
// - Unauthenticated → /login
// - Authenticated → /{role}
// This file is a fallback that should never render in practice.
export default function RootPage() {
  return null;
}
