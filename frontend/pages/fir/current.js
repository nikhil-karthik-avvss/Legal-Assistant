import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function ViewCurrentFIRs() {
  const [firs, setFirs] = useState([]);
  const [expandedFIR, setExpandedFIR] = useState(null);
  const [newUpdate, setNewUpdate] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/firs/current")
      .then(res => res.json())
      .then(data => setFirs(data.firs));
  }, []);

  const fetchDetails = async (id) => {
    const res = await fetch(`http://localhost:8000/api/fir/${id}/with-updates`);
    const data = await res.json();
    // Ensure updates is at least an empty array
    data.fir.updates = data.fir.updates || [];
    setExpandedFIR(data.fir);
  };

  const handleUpdate = async () => {
    const officer_id = JSON.parse(localStorage.getItem("user"))?.username;
    await fetch(`http://localhost:8000/api/fir/${expandedFIR.fir_id}/add-update/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ officer_id, description: newUpdate }),
    });
    await fetchDetails(expandedFIR.fir_id);  // Refresh updates
    setNewUpdate("");
  };

  const handleStatusChange = async (status) => {
    await fetch(`http://localhost:8000/api/fir/${expandedFIR.fir_id}/set-status/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setExpandedFIR(null);
    window.location.reload();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 text-white">
        <h1 className="text-2xl font-bold mb-4">Current FIRs</h1>
        {firs.map(fir => (
          <div key={fir.fir_id} className="bg-[#001a33] rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p><strong>ID:</strong> {fir.fir_id}</p>
                <p><strong>Name:</strong> {fir.name}</p>
              </div>
              <button onClick={() => fetchDetails(fir.fir_id)} className="bg-blue-700 px-3 py-1 rounded">View</button>
            </div>
          </div>
        ))}

        {expandedFIR && (
          <div className="mt-6 p-4 bg-[#002244] rounded-xl">
            <h2 className="text-xl font-semibold mb-2">FIR #{expandedFIR.fir_id}</h2>
            <p><strong>Name:</strong> {expandedFIR.name}</p>
            <p><strong>Crime:</strong> {expandedFIR.crimeType}</p>
            <p><strong>Location:</strong> {expandedFIR.location}</p>
            <p><strong>Description:</strong> {expandedFIR.description}</p>

            <h3 className="text-lg mt-4 mb-2">Timeline of Updates</h3>
            <div className="space-y-2">
              {(expandedFIR.updates || []).map((u, idx) => (
                <div key={idx} className="bg-blue-800 p-2 rounded">
                  <p><strong>Officer:</strong> {u.officer_id}</p>
                  <p>{u.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <textarea
                className="w-full p-2 rounded bg-blue-950 text-white"
                placeholder="Add an update..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
              />
              <button onClick={handleUpdate} className="mt-2 bg-green-700 px-3 py-1 rounded">Submit Update</button>
            </div>

            <div className="flex gap-4 mt-4">
              <button onClick={() => handleStatusChange("concluded")} className="bg-green-600 px-3 py-1 rounded">Mark Concluded</button>
              <button onClick={() => handleStatusChange("inconclusive")} className="bg-yellow-600 px-3 py-1 rounded">Mark Inconclusive</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
