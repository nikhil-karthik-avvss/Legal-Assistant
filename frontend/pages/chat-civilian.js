import { useState } from "react";
import { useRouter } from "next/router";

export default function ChatWithAssistant() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    const newMessages = [...messages, { type: "user", text: prompt }];
    setMessages(newMessages);
    setLoading(true);
    setPrompt("");

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setMessages([...newMessages, { type: "assistant", text: data.response }]);
    } catch (err) {
      setMessages([...newMessages, { type: "assistant", text: "Error: Unable to fetch response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] p-4 bg-[#001a33] text-white w-full">
      {/* Header with Back Button and Logo */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/")}
          className="text-blue-400 hover:underline"
        >
          ← Back to Home
        </button>

        <img
          src="/vcpd-logo.png" // Replace with the actual path to your logo
          alt="Logo"
          className="w-12 h-12"
        />
      </div>

      <h1 className="text-2xl font-bold text-blue-300 mb-4">Chat with Legal Assistant</h1>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-[#00264d] rounded-xl">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-xl ${
                msg.type === "user" ? "bg-blue-600" : "bg-green-600"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 bg-gray-600 rounded-xl animate-pulse">Awaiting Response...</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask your legal assistant..."
          onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
        />
        <button
          className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800"
          onClick={sendPrompt}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
