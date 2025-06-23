import { useState } from "react";
import Layout from "@/components/layout";

export default function HireCop() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "Constable",
    mobile: "",
    email: "",
    address: "",
  });

  const [photo, setPhoto] = useState(null);
  const [assignedOfficerId, setAssignedOfficerId] = useState(null);

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

    const res = await fetch("http://localhost:8000/api/cops/hire/", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    if (res.ok) {
      alert("Cop hired successfully.");
      setFormData({
        name: "",
        password: "",
        role: "Constable",
        mobile: "",
        email: "",
        address: "",
      });
      setPhoto(null);
      setAssignedOfficerId(result.officerId);
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-[#001a33] text-blue-100 p-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-4 text-blue-300">Hire New Cop</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "password", "mobile", "email", "address"].map((field) => (
            <div key={field}>
              <label className="block capitalize">{field}</label>
              <input
                type={field === "password" ? "password" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#002244] rounded"
                required
              />
            </div>
          ))}

          <div>
            <label className="block">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#002244] rounded"
            >
              <option>Station House Officer</option>
              <option>Sub Inspector</option>
              <option>Assistant Sub-Inspector</option>
              <option>Constable</option>
            </select>
          </div>

          <div>
            <label className="block">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-3 py-2 bg-[#002244] rounded"
              required
            />
          </div>

          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded" type="submit">
            Hire
          </button>
        </form>

        {assignedOfficerId && (
          <p className="mt-4 text-green-400">
            Assigned Officer ID: <span className="font-bold">{assignedOfficerId}</span>
          </p>
        )}
      </div>
    </Layout>
  );
}
