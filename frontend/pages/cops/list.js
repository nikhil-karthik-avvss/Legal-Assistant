import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function ListAllCopsPage() {
  const [cops, setCops] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/cops/all/")
      .then((res) => res.json())
      .then((data) => setCops(data))
      .catch((err) => console.error("Failed to fetch cops:", err));
  }, []);

  return (
    <Layout>
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Police Officer Directory
      </h1>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-6">
        {cops.map((cop) => (
          <div
            key={cop.officerId}
            className="bg-[#1a1a2e] text-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 p-6 flex flex-col"
          >
            <div className="flex justify-center mb-4">
              <img
                src={cop.photo_data || "/default-profile.png"}
                alt={`${cop.name}'s profile`}
                width={100}
                height={100}
                className="rounded-full border-4 border-blue-500 shadow-lg"
              />
            </div>

            <div className="text-center mb-4">
              <div className="text-2xl font-semibold text-blue-300">{cop.name}</div>
              <div className="text-lg text-blue-200">{cop.role}</div>
            </div>

            <div className="space-y-3 text-sm text-gray-400">
              <div>Officer ID: {cop.officerId}</div>
              <div>Mobile: {cop.mobile}</div>
              <div>Email: {cop.email}</div>
              <div>Address: {cop.address}</div>
            </div>
          </div>
        ))}
      </div>

      {cops.length === 0 && (
        <div className="text-gray-400 text-center mt-12 font-medium">
          No officers found.
        </div>
      )}
    </Layout>
  );
}
