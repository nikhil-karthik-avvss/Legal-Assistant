import { useState } from "react";
import { useRouter } from "next/router";

export default function ComplaintStatus() {
  const [complaintId, setComplaintId] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleCheckStatus = async () => {
    if (!complaintId.trim()) {
      alert("Please enter a valid complaint ID.");
      return;
    }

    setLoading(true);
    setStatus(null); // Clear previous status
    setError(null); // Clear previous error

    try {
      const res = await fetch(`http://localhost:8000/api/complaints/status/${complaintId}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setStatus(data); // Set the response data (complaint status details)
      } else {
        setError("Complaint not found or invalid ID.");
      }
    } catch (err) {
      setError("Error fetching complaint status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001a33] flex flex-col items-center justify-center text-white px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="mb-6 text-blue-400 hover:underline text-lg"
      >
        ← Back to Home
      </button>

      {/* Logo */}
      <div className="mb-6">
        <img src="/vcpd-logo.png" alt="Legal Assistant Logo" className="w-40 h-40 rounded-xl" />
      </div>

      {/* Complaint Status Form */}
      <h1 className="text-2xl font-bold mb-6 text-blue-300">Check Complaint Status</h1>

      <div className="w-full max-w-lg space-y-4">
        <input
          type="text"
          placeholder="Enter Complaint ID"
          value={complaintId}
          onChange={(e) => setComplaintId(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />
        <button
          onClick={handleCheckStatus}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-semibold"
          disabled={loading}
        >
          {loading ? "Checking Status..." : "Check Status"}
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {status && (
          <div className="mt-6 text-center text-blue-300">
            <h2 className="text-xl">Complaint Status</h2>
            <p><strong>Complaint ID:</strong> {status.complaint_id}</p>
            <p><strong>Status:</strong> {status.status_text}</p>
            <p><strong>Type:</strong> {status.type}</p>
            <p><strong>Title:</strong> {status.title}</p>
            <p><strong>Main Body:</strong> {status.main_body}</p>
            <p><strong>Accused Individuals:</strong> {status.against_people}</p>
            <p><strong>Address:</strong> {status.address}</p>
            <p><strong>Mobile:</strong> {status.mobile}</p>
            <p><strong>Name:</strong> {status.name}</p>
            <p><strong>Email:</strong> {status.email}</p>
            <p><strong>Created At:</strong> {status.created_at}</p>
          </div>
        )}
      </div>
    </div>
  );
}
