"use client";
import SocialLogin from "@/components/auth/SocialLogin";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import axios from "axios";
import { signIn } from "next-auth/react";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !username || !email || !password) {
      toast.error("All fields are required", { position: "top-right" });
      return; 
    }
  
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
        username,
      });
      if (res.status === 200) {
        toast.success("Registration successful.", { position: "top-right" });
  
        const signInResponse = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
  
        if (signInResponse && signInResponse.ok) {
          toast.success("Signed in successfully!", {
            position: "top-right",
          });
          router.push("/test");
        }
      } else {
        toast.error("Something went wrong. Please try again...!", {
          position: "top-right",
        });
        
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again...!", {
        position: "top-right",
      });
      console.log(error)
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-[#FFDEE9] justify-center to-[#B5FFFC] p-4 md:p-8 min-h-screen">
      <Toaster position="top-right" />
      <div className="border p-4 md:p-5 rounded-2xl flex flex-col items-center border-gray-300 justify-center w-full max-w-md">
        <h1 className="text-xl font-bold md:text-3xl mt-2 md:mt-4">
          Create an account
        </h1>
        <p className="text-sm md:text-base mt-1 md:mt-2 text-center">Join us and start your journey</p>

        <div className="flex flex-col items-center w-full p-4 md:p-8 justify-center gap-3 md:gap-4">
          <div className="flex gap-1 md:gap-2 w-full flex-col">
            <label className="ml-1 text-sm md:text-base" htmlFor="FullName">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-2 py-1.5 md:py-2 outline-none text-sm border-gray-300 rounded-lg w-full"
            />
          </div>
          <div className="flex gap-1 md:gap-2 w-full flex-col">
            <label className="ml-1 text-sm md:text-base" htmlFor="Username">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border px-2 py-1.5 md:py-2 outline-none text-sm border-gray-300 rounded-lg w-full"
            />
          </div>
          <div className="flex gap-1 md:gap-2 w-full flex-col">
            <label className="ml-1 text-sm md:text-base" htmlFor="Email">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border px-2 py-1.5 md:py-2 outline-none text-sm border-gray-300 rounded-lg w-full"
            />
          </div>
          <div className="flex gap-1 md:gap-2 w-full flex-col">
            <label className="ml-1 text-sm md:text-base" htmlFor="Password">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border px-2 py-1.5 md:py-2 outline-none text-sm border-gray-300 rounded-lg w-full"
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="relative mt-2 md:mt-4 border rounded-lg w-full px-4 md:px-6 py-2 text-black border-gray-300 cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-lg hover:scale-105 hover:text-gray-900"
          >
            <span className="relative z-10">
              {loading ? "Registering..." : "Register"}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>

          <SocialLogin />
          <div className="flex gap-1 text-sm md:text-base">
            <p>Already have an account?</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="text-purple-500 cursor-pointer hover:underline"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}