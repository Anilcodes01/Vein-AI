'use client'
import SocialLogin from "@/components/SocialLogin";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-[#FFDEE9] justify-center to-[#B5FFFC] min-h-screen">
      <div className="border p-5 rounded-2xl flex flex-col items-center border-gray-300  justify-center w-xl">
       
        <h1 className="text-2xl font-bold md:text-3xl mt-4">Welcome back</h1>
        <p className="mt-2">Sign in to your account to continue</p>

        <div className=" flex flex-col items-center w-full p-8 justify-center gap-4">
          <div className="flex gap-2 w-full flex-col">
            <label className="ml-1" htmlFor="Email">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="border px-2 py-2 outline-none text-sm border-gray-300 rounded-lg w-full "
            />
          </div>
          <div className="flex gap-2 w-full  flex-col">
            <label className="ml-1" htmlFor="Password">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="border px-2 py-2 outline-none text-sm border-gray-300 rounded-lg w-full"
            />
          </div>
          <button className="relative mt-4 border rounded-lg w-full px-6 py-2 text-black border-gray-300 cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-lg hover:scale-105 hover:text-gray-900">
            <span className="relative z-10">Login</span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>

          <SocialLogin />
          <div className="flex gap-1">
            <p>No Account?</p>
            <button onClick={() => router.push('/auth/register')} className="text-purple-500 cursor-pointer hover:underline">
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
