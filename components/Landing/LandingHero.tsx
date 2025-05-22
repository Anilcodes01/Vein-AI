"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LandingHero = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className=" w-full mt-12 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-landing animate-wave"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDMwKSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] opacity-30 animate-pulse"></div>

      <div className="absolute top-1/4 left-1/6 h-32 w-32 rounded-full bg-health-lightpink opacity-30 blur-2xl animate-float"></div>
      <div
        className="absolute bottom-1/4 right-1/6 h-40 w-40 rounded-full bg-health-lightcyan opacity-30 blur-2xl animate-float-delay"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute top-2/3 left-1/3 h-24 w-24 rounded-full bg-purple-300 opacity-20 blur-xl animate-float-reverse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 h-36 w-36 rounded-full bg-blue-200 opacity-20 blur-xl animate-float-delay"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="relative z-10 text-center max-w-4xl px-6 py-20">
        <div
          className={`inline-block mb-3 text-sm font-medium px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-gray-800 transition-all duration-700 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } hover:bg-white/30 hover:scale-105`}
        >
          AI-Powered Health Companion
        </div>

        <h1
          className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900 transition-all duration-700 delay-100 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Your Journey to Effortless{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 animate-gradient">
            Wellness
          </span>{" "}
          Starts Here
        </h1>

        <p
          className={`lg:text-xl text-sm text-gray-700  mb-10 max-w-2xl mx-auto transition-all duration-700 delay-200 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          A beautiful, personalized health experience that adapts to your unique
          needs and helps you achieve your wellness goals with minimal effort.
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            onClick={() => router.push("/auth/register")}
            className="relative border rounded-full lg:px-6 lg:py-3 px-4 py-2 text-black border-white cursor-pointer overflow-hidden group bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 hover:shadow-lg hover:scale-105 hover:text-gray-900"
          >
            <span className="relative z-10">Let's Get Started</span>
            <span className="absolute inset-0 bg-gradient-to-r from-pink-200 to-cyan-200 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
