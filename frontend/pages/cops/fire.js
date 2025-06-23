// pages/cops/fire.js
import Layout from "@/components/layout";
import { useEffect, useState } from "react";

export default function FireCopPage() {
  const [officerId, setOfficerId] = useState("");
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/cops/rank/")
      .then((res) => res.json())
      .then((data) => setOfficers(data))
      .catch((err) => console.error("Failed to fetch officers:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await fetch("http://localhost:8000/api/cops/fire/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ officer_id: officerId }),
    });

    const data = await res.json();
    setLoading(false);
    setResult(data.message || data.error);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-[#001a33] text-blue-100 p-8 rounded-2xl mt-10">
        <h1 className="text-2xl font-bold mb-6 text-blue-300">Fire a Cop</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Select Officer:</label>
            <select
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
              required
            >
              <option value="">-- Choose Officer --</option>
              {officers.map((officer) => (
                <option key={officer.officerId} value={officer.officerId}>
                  {officer.name} ({officer.role})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded font-semibold"
          >
            {loading ? "Firing..." : "Fire Cop"}
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
        </form>
      </div>
    </Layout>
  );
}
