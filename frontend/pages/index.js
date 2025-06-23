import Image from "next/image";
import { useRouter } from "next/router";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#001a33] flex flex-col items-center justify-center text-white px-4">
      {/* Logo */}
      <div className="mb-10">
        <Image
          src="/vcpd-logo.png"
          alt="Legal Assistant Logo"
          width={180}
          height={180}
          className="rounded-xl"
        />
      </div>

      {/* Buttons */}
      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={() => router.push("/login")}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-semibold"
        >
          Cops Login
        </button>

        <button
          onClick={() => router.push("/complaints/file")}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-semibold"
        >
          Civilian Complaint Lodging
        </button>

        <button
          onClick={() => router.push("/complaints/status")}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-semibold"
        >
          Civilian Complaint Status Checker
        </button>

        <button
          onClick={() => router.push("/chat-civilian")}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-semibold"
        >
          Chat with Legal Assistant
        </button>
      </div>
    </div>
  );
}
