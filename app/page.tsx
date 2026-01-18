"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, fetchUser } = useAuthStore();

  // Restore user from cookie
  useEffect(() => {
    fetchUser();
  }, []);

  // Redirect once auth state is known
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/chat"); // ✅ logged in → dashboard
      } else {
        router.replace("/login"); // ❌ not logged in → login
      }
    }
  }, [user, loading, router]);

  // Optional loading UI (prevents blank screen)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      Loading...
    </div>
  );
}
