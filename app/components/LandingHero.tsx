"use client";
import React from "react";
import { useRouter } from "next/navigation";

const LandingHero = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] flex flex-col items-center justify-center relative overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-gradient-landing animate-wave"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDMwKSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="absolute top-1/4 left-1/6 h-32 w-32 rounded-full bg-health-lightpink opacity-30 blur-2xl animate-float"></div>
      <div
        className="absolute bottom-1/4 right-1/6 h-40 w-40 rounded-full bg-health-lightcyan opacity-30 blur-2xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="relative z-10 text-center max-w-4xl px-6 py-20">
        <div className="inline-block mb-3 text-sm font-medium px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 animate-fade-in">
          AI-Powered Health Companion
        </div>

        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Your Journey to Effortless{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Wellness
          </span>{" "}
          Starts Here
        </h1>

        <p
          className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          A beautiful, personalized health experience that adapts to your unique
          needs and helps you achieve your wellness goals with minimal effort.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <button
            onClick={() => router.push("/onboarding")}
            className="border rounded-full px-4 py-2 text-black cursor-pointer"
          >
            {" "}
            Let's Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
