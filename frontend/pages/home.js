// pages/home.js (or wherever your homepage is)
import Layout from "@/components/layout";

export default function HomePage() {
  return (
    <Layout>
      <div className="bg-[#001a33] rounded-2xl p-8 shadow-lg border border-blue-800">
        <h2 className="text-4xl font-extrabold mb-4 text-blue-300">
          Welcome to LegalAssistant 👮‍♂️
        </h2>
        <p className="text-lg text-blue-100">
          Select an option from the left to get started.
        </p>
      </div>
    </Layout>
  );
}
