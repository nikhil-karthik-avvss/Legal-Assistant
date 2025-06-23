import Layout from "@/components/layout";
import { useEffect, useState } from "react";

export default function FileFIRPage() {
  const [citizens, setCitizens] = useState([]);
  const [complainantId, setComplainantId] = useState(""); // Single complainant selection
  const [accusedId, setAccusedId] = useState(""); // Single accused selection
  const [firDetails, setFirDetails] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [location, setLocation] = useState("");
  const [crimeType, setCrimeType] = useState("");
  const [ipcSections, setIpcSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch all citizens for dropdown
    const fetchCitizens = async () => {
      const res = await fetch("http://localhost:8000/api/citizens");
      const data = await res.json();
      setCitizens(data);
    };
    fetchCitizens();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Retrieve username from localStorage (session)
    const user = JSON.parse(localStorage.getItem("user"));
    const username = user ? user.username : "";

    // Create FIR request body
    const firData = {
      complainant_ids: complainantId ? [complainantId] : [],  
      accused_ids: accusedId ? [accusedId] : [],            
      fir_details: firDetails,
      incidentDate: incidentDate,
      location: location,
      crimeType: crimeType,
      ipcSections: ipcSections,
      username: username,
    };
    

    const res = await fetch("http://localhost:8000/api/file-fir/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(firData),
    });

    const data = await res.json();
    setLoading(false);
    setResult(data.message || data.error);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-[#001a33] text-blue-100 p-8 rounded-2xl mt-10">
        <h1 className="text-2xl font-bold mb-6 text-blue-300">File FIR</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Complainant Dropdown */}
          <div>
            <label className="block mb-1 font-medium">Select Complainant:</label>
            <select
              value={complainantId}
              onChange={(e) => setComplainantId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
              required
            >
              <option value="" disabled>Select complainant</option>
              {citizens.map((citizen) => (
                <option key={citizen.id} value={citizen.id}>
                  {citizen.name}
                </option>
              ))}
            </select>
          </div>

          {/* Accused Dropdown */}
          <div>
            <label className="block mb-1 font-medium">Select Accused:</label>
            <select
              value={accusedId}
              onChange={(e) => setAccusedId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
              required
            >
              <option value="" disabled>Select accused</option>
              {citizens.map((citizen) => (
                <option key={citizen.id} value={citizen.id}>
                  {citizen.name}
                </option>
              ))}
            </select>
          </div>

          {/* Incident Date */}
          <div>
            <label className="block mb-1 font-medium">Incident Date:</label>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block mb-1 font-medium">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
              required
            />
          </div>

          {/* Crime Type */}
          <div>
            <label className="block mb-1 font-medium">Crime Type:</label>
            <select
  value={crimeType}
  onChange={(e) => setCrimeType(e.target.value)}
  className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
  required
>
  <option value="">Select a crime</option>
  <option value="Theft">Theft</option>
  <option value="Assault">Assault</option>
  <option value="Cyber Crime">Cyber Crime</option>
  <option value="Kidnapping">Kidnapping</option>
  <option value="Murder">Murder</option>
  <option value="Other">Other</option>
</select>

          </div>

          {/* IPC Sections */}
          <div>
            <label className="block mb-1 font-medium">IPC Sections (comma separated):</label>
            <input
              type="text"
              value={ipcSections}
              onChange={(e) => setIpcSections(e.target.value.split(",").map((item) => item.trim()))}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
            />
          </div>

          {/* FIR Details */}
          <div>
            <label className="block mb-1 font-medium">FIR Details:</label>
            <textarea
              value={firDetails}
              onChange={(e) => setFirDetails(e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#003366] text-white border border-blue-500"
              rows="4"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
          >
            {loading ? "Processing..." : "Submit FIR"}
          </button>

          {/* Result */}
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
