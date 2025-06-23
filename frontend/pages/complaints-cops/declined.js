import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function DeclinedComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/complaints/declined/")
      .then((res) => res.json())
      .then((data) => setComplaints(data))
      .catch((err) => console.error("Failed to fetch declined complaints:", err));
  }, []);

  const handleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-red-300 mb-6">Declined Complaints</h1>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div
            key={c.id}
            onClick={() => handleExpand(c.id)}
            className={`bg-[#471e1e] border border-red-800 rounded-xl p-4 shadow-md transition-all duration-300 cursor-pointer ${
              expandedId === c.id ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="text-red-200 font-semibold text-lg">
              Complaint ID: {c.id}
            </div>
            <div className="text-red-100">Filed By: {c.name}</div>
            <div className="text-red-100">Filed At: {c.created_at}</div>

            {expandedId === c.id && (
              <div className="mt-4 space-y-2 text-red-100">
                <div>Title: {c.title}</div>
                <div>Description: {c.main_body}</div>
                <div>Type: {c.type}</div>
                <div>Accused Persons: {c.against_people}</div>
                <div>Mobile: {c.mobile}</div>
                <div>Email: {c.email}</div>
                <div>Govt ID: {c.govt_id}</div>
                <div>Address: {c.address}</div>
              </div>
            )}
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="text-red-300 text-center mt-10">No declined complaints.</div>
        )}
      </div>
    </Layout>
  );
}
