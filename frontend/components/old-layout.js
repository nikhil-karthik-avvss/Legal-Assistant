import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

const sidebarItems = [
  { label: "Profile", href: "/profile" },
  {
    label: "CSR Management",
    subItems: [
      { label: "File CSR", href: "/csr/file" },
      { label: "Review CSR", href: "/csr/review" },
      { label: "View Current CSR", href: "/csr/current" },
      { label: "View Past CSR", href: "/csr/history" },
    ],
  },
  {
    label: "FIR Management",
    subItems: [
      { label: "File FIR", href: "/fir/file" },
      { label: "Approve FIR", href: "/fir/review" },
      { label: "View Current FIRs", href: "/fir/current" },
      { label: "View Past FIRs", href: "/fir/history" },
    ],
  },
  {
    label: "Cops Management",
    subItems: [
      { label: "Hire New Cop", href: "/cops/hire" },
      { label: "Promote/Demote a Cop", href: "/cops/changeposition" },
      { label: "Fire a Cop", href: "/cops/fire" },
      { label: "List All Cops", href: "/cops/list" },
    ],
  },
  { label: "Task Management", href: "/tasks" },
  { label: "Crime Analytics", href: "/analytics" },
  { label: "Chat with Legal Assistant", href: "/chat" },
  {
    label: "Complaints Management",
    subItems: [
      { label: "Pending Complaints", href: "/complaints-cops/pending" },
      { label: "Approved Complaints", href: "/complaints-cops/approved" },
      { label: "Declined Complaints", href: "/complaints-cops/declined" },
    ],
  },
  { label: "Logout", href: "/logout" },
];

export default function Layout({ children }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    // Automatically open the menu whose subItem matches the current route
    const activeSection = sidebarItems.find((item) =>
      item.subItems?.some((sub) => router.pathname.startsWith(sub.href))
    );
    if (activeSection) {
      setOpenMenu(activeSection.label);
    }
  }, [router.pathname]);

  const toggleMenu = (label) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#001a33] via-[#00002E] to-[#001a33] text-white">
      <aside className="w-64 bg-[#00001A] p-6 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/vcpd-logo.png"
              alt="VCPD Logo"
              width={80}
              height={80}
              className="rounded-full border-4 border-blue-700 shadow-md"
            />
            <h1 className="text-2xl font-bold text-center tracking-wide text-blue-300">
              VCPD Dashboard
            </h1>
          </div>

          <nav className="mt-10 space-y-2">
            {sidebarItems.map(({ label, href, subItems }) => (
              <div key={label}>
                {subItems ? (
                  <>
                    <span
                      onClick={() => toggleMenu(label)}
                      className="block py-2 px-4 rounded-lg hover:bg-blue-700 bg-opacity-20 hover:text-white transition duration-200 cursor-pointer text-blue-200"
                    >
                      {label}
                    </span>
                    {openMenu === label && (
                      <div className="ml-4 mt-1 space-y-1">
                        {subItems.map((sub) => (
                          <Link key={sub.label} href={sub.href}>
                            <span
                              className={`block py-1 px-4 rounded-md text-sm hover:bg-blue-800 bg-opacity-10 text-blue-300 hover:text-white cursor-pointer ${
                                router.pathname === sub.href
                                  ? "bg-blue-800 text-white"
                                  : ""
                              }`}
                            >
                              {sub.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={href}>
                    <span
                      className={`block py-2 px-4 rounded-lg hover:bg-blue-700 bg-opacity-20 hover:text-white transition duration-200 cursor-pointer text-blue-200 ${
                        router.pathname === href ? "bg-blue-700 text-white" : ""
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-10 bg-[#00002E]">{children}</main>
    </div>
  );
}
