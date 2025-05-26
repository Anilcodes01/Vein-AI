'use client'
import React from 'react';
import { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Leaf, 
  Eye, 
  EyeOff,
  Loader2,
  User,
  AtSign
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock SocialLogin component for demonstration
const SocialLogin = () => (
  <div className="w-full space-y-3">
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-amber-200"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white text-gray-500">Or continue with</span>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <button className="flex items-center justify-center gap-2 px-4 py-3 border border-amber-200 rounded-xl bg-white hover:bg-amber-50 transition-all duration-200 text-sm font-medium text-gray-700 hover:border-amber-300">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>
      
      <button className="flex items-center justify-center gap-2 px-4 py-3 border border-amber-200 rounded-xl bg-white hover:bg-amber-50 transition-all duration-200 text-sm font-medium text-gray-700 hover:border-amber-300">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>
    </div>
  </div>
);

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
          toast.success("Signed in successfully!", { position: "top-right" });
          router.push("/test");
        }
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again...!", { position: "top-right" });
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 sm:px-6 py-8">
      {/* Background decoration */}
      <Toaster position="top-right" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
              Vein
            </h1>
          </div>
          
          <h2 className="text-2xl font-bold text-amber-800 mb-2">Create an account</h2>
          <p className="text-gray-600">Join us and start your health journey today</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/80 backdrop-blur-md border border-amber-200/50 rounded-3xl shadow-xl p-8">
          <div className="space-y-5">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-amber-800">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-amber-800">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AtSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-amber-800">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-amber-800">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border border-amber-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Privacy */}
            <div className="text-sm text-gray-600 text-center">
              By creating an account, you agree to our{' '}
              <button className="text-amber-600 hover:text-amber-700 hover:underline transition-colors">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-amber-600 hover:text-amber-700 hover:underline transition-colors">
                Privacy Policy
              </button>
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={loading || !name || !username || !email || !password}
              className="group w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Social Login */}
            <SocialLogin />

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-amber-200">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                onClick={() => {
                  router.push('/auth/login')
                }}
                  type="button"
                  className="text-amber-600 hover:text-amber-700 font-semibold hover:underline transition-colors"
                >
                  Sign in instead
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Your data is protected with industry-standard security</p>
        </div>
      </div>
    </div>
  );
}