import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function FIRDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [fir, setFir] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8000/api/fir/${id}`)
        .then(res => res.json())
        .then(data => setFir(data));  // No longer using data.fir if backend returns full FIR directly
    }
  }, [id]);

  const handleAction = async (action) => {
    const officer_id = JSON.parse(localStorage.getItem("user"))?.username;

    const method = action === "approve" ? "POST" : "DELETE";
    const res = await fetch(`http://localhost:8000/api/firs/${id}/${action}/`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: action === "approve" ? JSON.stringify({ officer_id }) : null,
    });

    if (res.ok) {
      alert(`FIR ${action}d successfully.`);
      router.push("/fir/review");
    } else {
      const error = await res.text();
      alert(`Error: ${error}`);
    }
  };

  if (!fir) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-8 bg-[#001a33] text-blue-100 rounded-2xl">
        <h1 className="text-2xl font-bold text-blue-300 mb-4">FIR Details</h1>
        <p><strong>FIR ID:</strong> {fir.fir_id}</p>
        <p><strong>Name:</strong> {fir.name}</p>
        <p><strong>Contact:</strong> {fir.contact}</p>
        <p><strong>Email:</strong> {fir.email}</p>
        <p><strong>Incident Date:</strong> {fir.incidentDate}</p>
        <p><strong>Crime:</strong> {fir.crimeType}</p>
        <p><strong>IPC Section:</strong> {fir.ipcSections}</p>
        <p><strong>Location:</strong> {fir.location}</p>
        <p><strong>Description:</strong> {fir.description}</p>
        <p><strong>Filed On:</strong> {fir.filed_date} at {fir.filed_time}</p>
        <div className="flex gap-4 mt-6">
          <button
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            onClick={() => handleAction("approve")}
          >
            Approve
          </button>
          <button
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            onClick={() => handleAction("decline")}
          >
            Decline
          </button>
        </div>
      </div>
    </Layout>
  );
}
