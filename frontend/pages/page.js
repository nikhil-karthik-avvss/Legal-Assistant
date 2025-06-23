import Image from "next/image";
import Link from "next/link";

const sidebarItems = [
  { label: "Profile", href: "/profile" },
  { label: "FIR Management", href: "/fir" },
  { label: "Cops Management", href: "/cops" },
  { label: "Task Management", href: "/tasks" },
  { label: "Crime Analytics", href: "/analytics" },
  { label: "Chat with Legal Assistant", href: "/chat" },
  { label: "Logout", href: "/logout" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-[#001a33] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#00002E] p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-6">
          <Image
            src="/vcpd-logo.png"
            alt="VCPD Logo"
            width={80}
            height={80}
            className="rounded-full"
          />
          <h1 className="text-xl font-semibold text-center">VCPD Dashboard</h1>
        </div>

        <nav className="mt-10 space-y-4">
          {sidebarItems.map(({ label, href }) => (
            <Link key={label} href={href}>
              <span className="block py-2 px-4 rounded-lg hover:bg-blue-800 transition cursor-pointer">
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold mb-4">Welcome to LegalAssistant 👮‍♂️</h2>
        <p className="text-lg text-blue-100">Select an option from the left to get started.</p>
      </main>
    </div>
  );
}
