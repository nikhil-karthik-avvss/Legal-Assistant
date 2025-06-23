import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "Station House Officer",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: formData.username,
            role: formData.role,
            isLoggedIn: true,
          })
        );
        alert("Login successful!");
        window.location.href = "/home";
      } else {
        alert("Login Failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#001F3F] px-4 py-8 text-white">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/vcpd-logo.png"
          alt="Legal Assistant Logo"
          width={150}
          height={150}
          className="rounded-xl"
        />
      </div>

      {/* Login Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#0E2A47] p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4"
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-blue-200 hover:text-blue-400 mb-2"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-blue-200">LegalAssistant Login</h2>

        <div>
          <label className="block text-sm text-blue-100">Username</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-blue-100">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-blue-100">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option>Station House Officer</option>
            <option>Sub Inspector</option>
            <option>Assistant Sub Inspector</option>
            <option>Constable</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-xl transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}