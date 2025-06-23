import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

const sidebarItems = [
  {
    label: "Profile",
    href: "/profile",
    roles: ["Station House Officer", "Sub Inspector", "Assistant Sub Inspector", "Constable"],
  },
  {
    label: "FIR Management",
    roles: ["Station House Officer", "Sub Inspector", "Assistant Sub Inspector"],
    subItems: [
      { label: "File FIR", href: "/fir/file", roles: ["Station House Officer","Sub Inspector", "Assistant Sub Inspector"] },
      { label: "Approve FIR", href: "/fir/review", roles: ["Station House Officer"] },
      { label: "View Current FIRs", href: "/fir/current", roles: ["Station House Officer", "Sub Inspector"] },
      { label: "View Past FIRs", href: "/fir/history", roles: ["Station House Officer", "Sub Inspector", "Assistant Sub Inspector"] },
    ],
  },
  {
    label: "Cops Management",
    roles: ["Station House Officer", "Sub Inspector", "Assistant Sub Inspector", "Constable"],
    subItems: [
      { label: "Hire New Cop", href: "/cops/hire", roles: ["Station House Officer"] },
      { label: "Promote/Demote a Cop", href: "/cops/changeposition", roles: ["Station House Officer"] },
      { label: "Fire a Cop", href: "/cops/fire", roles: ["Station House Officer"] },
      { label: "List All Cops", href: "/cops/list", roles: ["Station House Officer", "Sub Inspector", "Assistant Sub Inspector", "Constable"] },
    ],
  },
  {
    label: "Citizen Records",
    roles: ["Station House Officer", "Sub Inspector"],
    subItems: [
      { label: "Add New Citizen", href: "/citizens/add", roles: ["Station House Officer", "Sub Inspector"] },
      { label: "View All Citizens", href: "/citizens/list", roles: ["Station House Officer", "Sub Inspector"] },
    ],
  },
  { label: "Crime Analytics", href: "/analytics", roles: ["Station House Officer", "Sub Inspector"] },
  { label: "Chat with Legal Assistant", href: "/chat", roles: ["Station House Officer", "Sub Inspector", "Assistant Sub Inspector", "Constable"] },
  {
    label: "Complaints Management",
    roles: ["Station House Officer", "Sub Inspector","Assistant Sub Inspector"],
    subItems: [
      { label: "Pending Complaints", href: "/complaints-cops/pending", roles: ["Station House Officer"] },
      { label: "Approved Complaints", href: "/complaints-cops/approved", roles: ["Station House Officer", "Sub Inspector","Assistant Sub Inspector"] },
      { label: "Declined Complaints", href: "/complaints-cops/declined", roles: ["Station House Officer", "Sub Inspector","Assistant Sub Inspector"] },
    ],
  },
  { label: "Logout", href: "/logout", roles: ["Station House Officer", "Sub Inspector", "Assistant Sub Inspector", "Constable"] },
];

export default function Layout({ children }) {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role) {
      setRole(user.role);
    }
  }, []);

  useEffect(() => {
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
            {sidebarItems.map(({ label, href, subItems, roles }) => {
              if (!roles.includes(role)) return null;

              if (subItems) {
                const visibleSubItems = subItems.filter((sub) =>
                  sub.roles.includes(role)
                );
                if (visibleSubItems.length === 0) return null;

                return (
                  <div key={label}>
                    <span
                      onClick={() => toggleMenu(label)}
                      className="block py-2 px-4 rounded-lg hover:bg-blue-700 bg-opacity-20 hover:text-white transition duration-200 cursor-pointer text-blue-200"
                    >
                      {label}
                    </span>
                    {openMenu === label && (
                      <div className="ml-4 mt-1 space-y-1">
                        {visibleSubItems.map((sub) => (
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
                  </div>
                );
              }

              return (
                <Link key={label} href={href}>
                  <span
                    className={`block py-2 px-4 rounded-lg hover:bg-blue-700 bg-opacity-20 hover:text-white transition duration-200 cursor-pointer text-blue-200 ${
                      router.pathname === href ? "bg-blue-700 text-white" : ""
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-10 bg-[#00002E]">{children}</main>
    </div>
  );
}
