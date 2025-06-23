import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function PendingComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/complaints/pending/")
      .then((res) => res.json())
      .then((data) => setComplaints(data))
      .catch((err) => console.error("Failed to fetch complaints:", err));
  }, []);

  const handleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleUpdate = async (id, updates) => {
    try {
      const res = await fetch(`http://localhost:8000/api/complaints/update/${id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
  
      if (res.ok) {
        // Refetch pending complaints from backend
        const newRes = await fetch("http://localhost:8000/api/complaints/pending/");
        const updatedData = await newRes.json();
        setComplaints(updatedData);
  
        alert("Complaint updated successfully");
      } else {
        alert("Failed to update complaint");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating complaint");
    }
  };
  

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-blue-300 mb-6">Pending Complaints</h1>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div
            key={c.id}
            onClick={() => handleExpand(c.id)}
            className={`bg-[#0e2a47] border border-blue-800 rounded-xl p-4 shadow-md transition-all duration-300 cursor-pointer ${
              expandedId === c.id ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="text-blue-200 font-semibold text-lg">
              Complaint ID: {c.id}
            </div>
            <div className="text-blue-100">Filed By: {c.name}</div>
            <div className="text-blue-100">Filed At: {c.created_at}</div>

            {expandedId === c.id && (
              <div className="mt-4 space-y-2 text-blue-100">
                <div>Title: {c.title}</div>
                <div>Description: {c.main_body}</div>
                <div>Accused Persons: {c.against_people}</div>

                <div className="flex gap-4 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(c.id, { status: "Approved" });
                    }}
                    className="bg-green-600 px-4 py-1 rounded-lg text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(c.id, { status: "Declined" });
                    }}
                    className="bg-red-600 px-4 py-1 rounded-lg text-white hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>

                <div className="flex gap-4 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(c.id, { type: "Civil" });
                    }}
                    className="bg-yellow-600 px-4 py-1 rounded-lg text-white hover:bg-yellow-700"
                  >
                    Mark as Civil
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(c.id, { type: "Criminal" });
                    }}
                    className="bg-purple-600 px-4 py-1 rounded-lg text-white hover:bg-purple-700"
                  >
                    Mark as Criminal
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="text-blue-300 text-center mt-10">No pending complaints.</div>
        )}
      </div>
    </Layout>
  );
}
