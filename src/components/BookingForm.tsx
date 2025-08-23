"use client";
import { useState } from "react";

export default function BookingForm({ activity }: { activity: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    participants: 1,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, activity }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Reservation successful!");
        setFormData({ name: "", email: "", participants: 1 });
      } else {
        setMessage("❌ " + data.message);
      }
    } catch (err) {
      setMessage("⚠️ Something went wrong!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-full max-w-md"
    >
      <h2 className="text-xl font-bold">Book: {activity}</h2>

      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="number"
        name="participants"
        placeholder="Participants"
        value={formData.participants}
        onChange={handleChange}
        min="1"
        className="w-full p-2 border rounded"
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Confirm Booking
      </button>

      {message && <p className="mt-2">{message}</p>}
    </form>
  );
}
