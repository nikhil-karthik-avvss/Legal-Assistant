import Layout from "@/components/layout";
import { useEffect, useState } from "react";

export default function ManageCopPage() {
  const [cops, setCops] = useState([]);
  const [officerId, setOfficerId] = useState("");
  const [action, setAction] = useState("promote");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [officerInfo, setOfficerInfo] = useState(null);

  useEffect(() => {
    // Fetch all cops for dropdown
    const fetchCops = async () => {
      const res = await fetch("http://localhost:8000/api/cops/rank/");
      const data = await res.json();
      setCops(data);
    };
    fetchCops();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setOfficerInfo(null);

    const res = await fetch("http://localhost:8000/api/cops/rank/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ officer_id: officerId, action }),
    });

    const data = await res.json();
    setLoading(false);
    setResult(data.message || data.error);
    setOfficerInfo(data.officer || null);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-[#001a33] text-blue-100 p-8 rounded-2xl mt-10">
        <h1 className="text-2xl font-bold mb-6 text-blue-300">Promote / Demote Cop</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Select Officer:</label>
            <select
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
              required
            >
              <option value="" disabled>Select officer</option>
              {cops.map((cop) => (
                <option key={cop.officerId} value={cop.officerId}>
                  {`${cop.officerId} - ${cop.name} - ${cop.role}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Action:</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
            >
              <option value="promote">Promote</option>
              <option value="demote">Demote</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
          >
            {loading ? "Processing..." : `${action.charAt(0).toUpperCase() + action.slice(1)} Cop`}
          </button>

          {result && (
            <div
              className={`mt-4 p-3 rounded ${
                result.toLowerCase().includes("success") ? "bg-green-700" : "bg-red-700"
              }`}
            >
              {result}
            </div>
          )}

          {officerInfo && (
            <div className="mt-4 p-3 rounded bg-[#002244] border border-blue-400 text-white">
              <p><strong>Officer ID:</strong> {officerInfo.officerId}</p>
              <p><strong>Name:</strong> {officerInfo.name}</p>
              <p><strong>Role:</strong> {officerInfo.role}</p>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
