"use client";
import { useState } from "react";

export default function Onboarding() {
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    gender: "",
    fitnessGoal: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("User Data:", userData);
    alert("Onboarding Complete!");
    // Redirect or save data as needed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-blue-600 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome! Let's get started</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold">Name</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold">Age</label>
            <input
              type="number"
              name="age"
              value={userData.age}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold">Gender</label>
            <select
              name="gender"
              value={userData.gender}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold">Fitness Goal</label>
            <input
              type="text"
              name="fitnessGoal"
              value={userData.fitnessGoal}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              placeholder="e.g., Lose weight, Gain muscle"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4">
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
