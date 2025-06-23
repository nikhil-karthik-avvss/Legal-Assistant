import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function CrimeAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/analytics/crime", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok) setData(json);
        else alert("Failed to load analytics: " + json.detail);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };
    fetchAnalytics();
  }, []);

  if (!data) return <Layout><p className="text-blue-200">Loading analytics...</p></Layout>;

  const {
    counts,
    crime_type_freq,
    location_freq,
    ipc_freq
  } = data;

  return (
    <Layout>
      <div className="bg-[#001a33] rounded-2xl p-8 shadow-lg border border-blue-800 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-300 mb-6">Crime Analytics</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-blue-100">
          <Stat label="Ongoing FIRs" value={counts.ongoing_firs} />
          <Stat label="Concluded FIRs" value={counts.concluded_firs} />
          <Stat label="Inconclusive FIRs" value={counts.inconclusive_firs} />
          <Stat label="Total FIRs" value={counts.total_firs} />
          <Stat label="Approved Complaints" value={counts.approved_complaints} />
          <Stat label="Declined Complaints" value={counts.declined_complaints} />
          <Stat label="Total Complaints" value={counts.total_complaints} />
          <Stat label="Total CSRs" value={counts.total_csrs} />
        </div>

        <h3 className="text-xl font-semibold text-blue-200 mb-2">Crime Types Frequency</h3>
        <ul className="list-disc list-inside mb-6 text-blue-100">
          {crime_type_freq.map(({ type, count }) => (
            <li key={type}>{type} - {count}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold text-blue-200 mb-2">Location Frequency</h3>
        <ul className="list-disc list-inside mb-6 text-blue-100">
          {location_freq.map(({ location, count }) => (
            <li key={location}>{location} - {count}</li>
          ))}
        </ul>

        <h3 className="text-xl font-semibold text-blue-200 mb-2">IPC Sections Frequency</h3>
        <ul className="list-disc list-inside text-blue-100">
          {ipc_freq.map(({ section, count }) => (
            <li key={section}>{section} - {count}</li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#002244] rounded-xl p-4 shadow border border-blue-700">
      <p className="text-sm text-blue-300">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}
