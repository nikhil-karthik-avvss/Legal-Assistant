import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function ApprovedComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/complaints/approved/")
      .then((res) => res.json())
      .then((data) => setComplaints(data))
      .catch((err) => console.error("Failed to fetch approved complaints:", err));
  }, []);

  const handleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-green-300 mb-6">Approved Complaints</h1>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div
            key={c.id}
            onClick={() => handleExpand(c.id)}
            className={`bg-[#12382f] border border-green-800 rounded-xl p-4 shadow-md transition-all duration-300 cursor-pointer ${
              expandedId === c.id ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="text-green-200 font-semibold text-lg">
              Complaint ID: {c.id}
            </div>
            <div className="text-green-100">Filed By: {c.name}</div>
            <div className="text-green-100">Filed At: {c.created_at}</div>

            {expandedId === c.id && (
              <div className="mt-4 space-y-2 text-green-100">
                <div>Mobile: {c.mobile}</div>
                <div>Email: {c.email}</div>
                <div>Govt ID: {c.govt_id}</div>
                <div>Address: {c.address}</div>
                <div>Title: {c.title}</div>
                <div>Description: {c.main_body}</div>
                <div>Type: {c.type}</div>
                <div>Accused Persons: {c.against_people}</div> 
              </div>
            )}
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="text-green-300 text-center mt-10">No approved complaints.</div>
        )}
      </div>
    </Layout>
  );
}
