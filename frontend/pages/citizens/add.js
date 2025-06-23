import { useState } from "react";
import Layout from "@/components/layout";

export default function AddCitizen() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    mobile: "",
    email: "",
    address: "",
  });

  const [photo, setPhoto] = useState(null);
  const [assignedCitizenId, setAssignedCitizenId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });
    data.append("photo", photo);

    const res = await fetch("http://localhost:8000/api/citizens/add/", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    if (res.ok) {
      alert("Citizen added successfully.");
      setAssignedCitizenId(result.citizenId);
      setFormData({
        name: "",
        dob: "",
        mobile: "",
        email: "",
        address: "",
      });
      setPhoto(null);
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-[#001a33] text-blue-100 p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-4 text-blue-300">Add New Citizen</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "dob", "mobile", "email", "address"].map((field) => (
            <div key={field}>
              <label className="block capitalize">{field.replace("dob", "Date of Birth")}</label>
              <input
                type={field === "dob" ? "date" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#002244] rounded"
                required
              />
            </div>
          ))}

          <div>
            <label className="block">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-3 py-2 bg-[#002244] rounded"
              required
            />
          </div>

          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded" type="submit">
            Add Citizen
          </button>
        </form>

        {assignedCitizenId && (
          <p className="mt-4 text-green-400">
            Assigned Citizen ID: <span className="font-bold">{assignedCitizenId}</span>
          </p>
        )}
      </div>
    </Layout>
  );
}
