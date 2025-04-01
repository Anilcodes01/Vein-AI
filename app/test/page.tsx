"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, ChangeEvent } from "react";

interface FormData {
  name: string;
  age: string;
  identity: string;
  maingoal: string;
  height: string;
  weight: string;
  activityLevel: string;
  preferredWorkouts: string;
  dietaryApproach: string;
  averageSleep: string;
  biggestChallenge: string;
  fitnessSuperpower: string;
}

export default function Test() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    identity: "",
    maingoal: "",
    height: "",
    weight: "",
    activityLevel: "",
    preferredWorkouts: "",
    dietaryApproach: "",
    averageSleep: "",
    biggestChallenge: "",
    fitnessSuperpower: "",
  });

  const { data: session } = useSession();
  const userId = session?.user.id;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (!userId) {
        console.error("User ID is missing from session.");
        return;
      }

      const res = await axios.post("/api/test", {
        ...formData,
        userId,
      });

      if (res.status === 200) {
        console.log("user data saved successfully");
        setFormData({
          name: "",
          age: "",
          identity: "",
          maingoal: "",
          height: "",
          weight: "",
          activityLevel: "",
          preferredWorkouts: "",
          dietaryApproach: "",
          averageSleep: "",
          biggestChallenge: "",
          fitnessSuperpower: "",
        });
      }
    } catch (error: any) { 
      console.error("Error while submitting data...", error.response?.data || error.message);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen  p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Fitness Profile Form</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Identity</label>
              <select
                  name="identity"
                  value={formData.identity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  required
              >
                <option value="">Select Identity</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Main Goal</label>
              <input
                type="text"
                name="maingoal"
                value={formData.maingoal}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Activity Level</label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              >
                <option value="">Select activity level</option>
                <option value="RELAXED_HOMEBODY">Relaxed Homebody</option>
                <option value="CASUAL_MOVER">Casual Mover</option>
                <option value="PRETTY_ACTIVE">Pretty Active</option>
                <option value="FITNESS_BEAST">Fitness Beast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Workouts</label>
              <input
                type="text"
                name="preferredWorkouts"
                value={formData.preferredWorkouts}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Dietary Approach</label>
              <input
                type="text"
                name="dietaryApproach"
                value={formData.dietaryApproach}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Average Sleep (hours)</label>
              <select
                  name="averageSleep"
                  value={formData.averageSleep}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  required
              >
                <option value="">Select sleep duration</option>
                <option value="LESS_THAN_4">Less than 4 hours</option>
                <option value="BETWEEN_4_TO_6">Between 4 to 6 hours</option>
                <option value="SOLID_6_TO_8">Solid 6 to 8 hours</option>
                <option value="MORE_THAN_8">More than 8 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Biggest Challenge</label>
              <textarea
                name="biggestChallenge"
                value={formData.biggestChallenge}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fitness Superpower</label>
              <select
                  name="fitnessSuperpower"
                  value={formData.fitnessSuperpower}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                  required
              >
                <option value="">Select your superpower</option>
                <option value="NEVER_FEEL_TIRED">Never Feel Tired</option>
                <option value="INSTANT_MUSCLE_GAIN">Instant Muscle Gain</option>
                <option value="EFFORTLESS_HEALTHY_EATING">Effortless Healthy Eating</option>
                <option value="UNSHAKEABLE_MOTIVATION">Unshakeable Motivation</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}