import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function ViewPastFIRs() {
  const [firs, setFirs] = useState([]);
  const [expandedFIR, setExpandedFIR] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/fir/view-past-firs")
      .then(res => res.json())
      .then(data => setFirs(data.firs));
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4 text-white">
        <h1 className="text-2xl font-bold mb-4">Past FIRs</h1>
        {firs.map(fir => (
          <div key={fir.id} className="bg-[#001a33] rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p><strong>ID:</strong> {fir.id}</p>
                <p><strong>Name:</strong> {fir.name}</p>
                <p><strong>Status:</strong> {fir.status}</p>
              </div>
              <button onClick={() => setExpandedFIR(fir)} className="bg-blue-700 px-3 py-1 rounded">View</button>
            </div>
          </div>
        ))}

        {expandedFIR && (
          <div className="mt-6 p-4 bg-[#002244] rounded-xl">
            <h2 className="text-xl font-semibold mb-2">FIR #{expandedFIR.id}</h2>
            <p><strong>Name:</strong> {expandedFIR.name}</p>
            <p><strong>Crime:</strong> {expandedFIR.crime}</p>
            <p><strong>Location:</strong> {expandedFIR.location}</p>
            <p><strong>Description:</strong> {expandedFIR.description}</p>
            <p><strong>Filed Date:</strong> {expandedFIR.filedDate}</p>
            <p><strong>Filed Time:</strong> {expandedFIR.filedTime}</p>
            <p><strong>Officer:</strong> {expandedFIR.officer}</p>

            <h3 className="text-lg mt-4 mb-2">Timeline of Updates</h3>
            <div className="space-y-2">
              {(expandedFIR.updates || []).map((u, idx) => (
                <div key={idx} className="bg-blue-800 p-2 rounded">
                  <p><strong>Officer:</strong> {u.officerId}</p>
                  <p>{u.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
