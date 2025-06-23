import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/layout";

export default function UnapprovedFIRs() {
  const [firs, setFirs] = useState([]);

  useEffect(() => {
    const fetchFIRs = async () => {
        const res = await fetch("http://localhost:8000/api/fir/unapproved/");
      const data = await res.json();
      setFirs(data.firs);
    };

    fetchFIRs();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8 bg-[#001a33] text-blue-100 rounded-2xl">
        <h1 className="text-3xl font-bold text-blue-300 mb-6">Unapproved FIRs</h1>
        {firs.length === 0 ? (
          <p>No FIRs pending approval.</p>
        ) : (
          <ul className="space-y-4">
            {firs.map((fir, index) => (
              <li
                key={index}
                className="border border-blue-800 p-4 rounded-lg hover:bg-[#002244]"
              >
                <p className="text-blue-200 font-semibold">
                  {fir.name} | {fir.crimeType}
                </p>
                <p className="text-sm text-blue-400">{fir.location}</p>
                <Link
                href={`/fir/review/${encodeURIComponent(fir.fir_id)}`}
                className="text-blue-500 hover:underline text-sm mt-2 inline-block"
                >
                View & Take Action
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
