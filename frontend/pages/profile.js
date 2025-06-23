import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import Image from "next/image";

export default function ProfilePage() {
  const [officer, setOfficer] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/profile/", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setOfficer(data);
        else alert("Failed to load profile: " + data.detail);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  if (!officer) return <Layout><p className="text-blue-200">Loading profile...</p></Layout>;

  return (
    <Layout>
      <div className="bg-[#001a33] rounded-2xl p-8 shadow-lg border border-blue-800 max-w-3xl mx-auto">
        <div className="flex items-center space-x-6">
        <img
  src={officer.photo_data || "/default-profile.png"}
  alt="Officer Profile"
  width={120}
  height={120}
  className="rounded-full border-4 border-blue-700 shadow-md"
/>

          <div>
            <h2 className="text-3xl font-bold text-blue-300">{officer.name}</h2>
            <p className="text-blue-200">ID: {officer.officer_id}</p>
            <p className="text-blue-200">Role: {officer.role}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-blue-100">
          <div>
            <h4 className="font-semibold text-blue-300">Mobile</h4>
            <p>{officer.mobile}</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-300">Email</h4>
            <p>{officer.email}</p>
          </div>
          <div className="sm:col-span-2">
            <h4 className="font-semibold text-blue-300">Address</h4>
            <p>{officer.address}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}