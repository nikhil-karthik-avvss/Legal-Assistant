import { useEffect, useState } from "react";
import Layout from "@/components/layout";

export default function ViewCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [selectedCitizen, setSelectedCitizen] = useState(null); // For showing selected citizen details

  useEffect(() => {
    const fetchCitizens = async () => {
      const res = await fetch("http://localhost:8000/api/citizens/all/");
      const data = await res.json();
      setCitizens(data);
    };
    fetchCitizens();
  }, []);

  const handleCitizenClick = async (citizenId) => {
    // Fetch additional data about the citizen (complaints, FIRs, etc.)
    const res = await fetch(`http://localhost:8000/api/citizens/${citizenId}/details/`);
    const data = await res.json();
    setSelectedCitizen(data);
  };

  return (
    <Layout>
      <div className="p-6 text-blue-100">
        <h1 className="text-4xl mb-6 text-blue-300 font-bold text-center">
          All Citizens
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6">
          {citizens.map((citizen) => (
            <div
              key={citizen.citizenId}
              className="relative group bg-[#02102d] p-6 rounded-xl shadow-xl hover:bg-[#03354d] transition duration-300 cursor-pointer"
              onClick={() => handleCitizenClick(citizen.citizenId)}
            >
              {/* Citizen Image */}
              <img
                src={citizen.photo_data || "/fallback-image.jpg"}
                alt="Citizen"
                className="w-full h-48 object-cover rounded-lg mb-4 shadow-md"
              />
              <h2 className="text-2xl font-semibold text-blue-300">{citizen.name}</h2>
              <p className="text-sm text-blue-400">ID: {citizen.citizenId}</p>

              {/* Hover Info - Displays additional info */}
              <div className="absolute inset-0 bg-black bg-opacity-70 text-sm p-4 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-center">
                <p><span className="font-semibold text-blue-200">DOB:</span> {citizen.dob}</p>
                <p><span className="font-semibold text-blue-200">Mobile:</span> {citizen.mobile}</p>
                <p><span className="font-semibold text-blue-200">Email:</span> {citizen.email}</p>
                <p><span className="font-semibold text-blue-200">Address:</span> {citizen.address}</p>
              </div>

              {/* Show additional details on click */}
              {selectedCitizen && selectedCitizen.citizenId === citizen.citizenId && (
                <div className="absolute inset-0 bg-[#03354d] bg-opacity-90 text-sm p-6 rounded-xl flex flex-col space-y-4">
                  <h3 className="text-xl font-semibold text-blue-200 mb-3">Additional Details</h3>
                  <p><span className="font-bold text-blue-300">Complaints Made:</span> {selectedCitizen.complaints.length}</p>
                  <ul className="list-disc pl-6 space-y-1">
                    {selectedCitizen.complaints.map((complaint) => (
                      <li key={complaint.complaintId} className="text-blue-300">{complaint.name}</li>
                    ))}
                  </ul>
                  <p><span className="font-bold text-blue-300">FIRs Complained:</span> {selectedCitizen.firsComplained.length}</p>
                  <ul className="list-disc pl-6 space-y-1">
                    {selectedCitizen.firsComplained.map((fir) => (
                      <li key={fir.firId} className="text-blue-300">{fir.firId} - {fir.crime_type}</li>
                    ))}
                  </ul>
                  <p><span className="font-bold text-blue-300">FIRs Defended:</span> {selectedCitizen.firsDefended.length}</p>
                  <ul className="list-disc pl-6 space-y-1">
                    {selectedCitizen.firsDefended.map((fir) => (
                      <li key={fir.firId} className="text-blue-300">{fir.firId} - {fir.crime_type}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
