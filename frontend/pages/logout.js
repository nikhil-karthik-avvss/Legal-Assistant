// pages/logout.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("user"); // Clear the session
    router.push("/"); // Redirect to index.js
  }, [router]);

  return null; // No UI needed
}
