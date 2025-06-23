import { useState } from "react";
import { useRouter } from "next/router";

export default function FileComplaint() {
  const [name, setName] = useState("");
  const [govtId, setGovtId] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [mainBody, setMainBody] = useState("");
  const [againstPeople, setAgainstPeople] = useState("");
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if any field is empty
    if (!name || !govtId || !address || !mobile || !email || !title || !mainBody || !againstPeople) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const complaintData = {
      name,
      govt_id: govtId,
      address,
      mobile,
      email,
      title,
      main_body: mainBody,
      against_people: againstPeople,
    };

    try {
      const res = await fetch("http://localhost:8000/api/complaints/file/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintData),
      });

      if (res.ok) {
        const data = await res.json();
        setComplaintId(data.complaint_id); // Save the complaint ID for display
        resetForm(); // Clear the form fields after submission
        alert(`Complaint filed successfully! Your Complaint ID is ${data.complaint_id}`);
      } else {
        alert("Error submitting complaint. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setGovtId("");
    setAddress("");
    setMobile("");
    setEmail("");
    setTitle("");
    setMainBody("");
    setAgainstPeople("");
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

      {/* Complaint Form */}
      <h1 className="text-2xl font-bold mb-6 text-blue-300">File a Complaint</h1>
      <form className="space-y-4 w-full max-w-lg" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />
        <input
          type="text"
          placeholder="Government ID"
          value={govtId}
          onChange={(e) => setGovtId(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />
        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />
        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />
        <input
          type="text"
          placeholder="Complaint Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />
        <textarea
          placeholder="Main Body of Complaint"
          value={mainBody}
          onChange={(e) => setMainBody(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />
        <input
          type="text"
          placeholder="Names of People Against"
          value={againstPeople}
          onChange={(e) => setAgainstPeople(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-800 text-white"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-semibold"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>

      {complaintId && (
        <div className="mt-6 text-center text-blue-300">
          <p>Complaint filed successfully!</p>
          <p>Your Complaint ID is: <strong>{complaintId}</strong></p>
        </div>
      )}
    </div>
  );
}
