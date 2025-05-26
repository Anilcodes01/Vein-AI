'use client'
import React from 'react';
import { useState } from 'react';
import { 
  HeartPulse, 
  Bot, 
  MessageSquareText, 
  Heart, 
  ShieldCheck, 
  Brain,
  Dumbbell,
  Leaf,
  ArrowRight,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  type FeatureItem = {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: keyof ColorMap;
  };

  const coreFeatures: FeatureItem[] = [
    {
      icon: <HeartPulse className="h-6 w-6" />,
      title: "Smart Health Insights",
      desc: "AI-driven tips for workouts, hydration, and living your best life.",
      color: "rose"
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: "Chat with Your Health Bot",
      desc: "Ask questions, get answers. Like having a health expert in your pocket.",
      color: "blue"
    },
    {
      icon: <MessageSquareText className="h-6 w-6" />,
      title: "Daily Nudges",
      desc: "Gentle reminders and habits that actually stick.",
      color: "emerald"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Hyper-Personalized",
      desc: "Adapts to your lifestyle, mood, and goals.",
      color: "purple"
    }
  ];

  const whyChoose: FeatureItem[] = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Smarter Than Your Ex",
      desc: "Actually listens and remembers everything... respectfully.",
      color: "indigo"
    },
    {
      icon: <Dumbbell className="w-6 h-6" />,
      title: "Loves Leg Day",
      desc: "Plans workouts so good, your quads might file a complaint.",
      color: "orange"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Privacy-First",
      desc: "Your data stays yours. No creepy trackers, no weird ads.",
      color: "green"
    }
  ];

  interface ColorMap {
    rose: string;
    blue: string;
    emerald: string;
    purple: string;
    indigo: string;
    orange: string;
    green: string;
  }

  type ColorOption = keyof ColorMap;

  const getColorClasses = (color: ColorOption, isHovered: boolean = false): string => {
    const colors: ColorMap = {
      rose: isHovered ? 'text-rose-600 bg-rose-50' : 'text-rose-500 bg-rose-50',
      blue: isHovered ? 'text-blue-600 bg-blue-50' : 'text-blue-500 bg-blue-50',
      emerald: isHovered ? 'text-emerald-600 bg-emerald-50' : 'text-emerald-500 bg-emerald-50',
      purple: isHovered ? 'text-purple-600 bg-purple-50' : 'text-purple-500 bg-purple-50',
      indigo: isHovered ? 'text-indigo-600 bg-indigo-50' : 'text-indigo-500 bg-indigo-50',
      orange: isHovered ? 'text-orange-600 bg-orange-50' : 'text-orange-500 bg-orange-50',
      green: isHovered ? 'text-green-600 bg-green-50' : 'text-green-500 bg-green-50',
    };
    return colors[color] || colors.rose;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-800">
      {/* Header */}
      <header className="py-4 px-4 md:px-12 flex justify-between items-center border-b border-amber-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
            Vein
          </h1>
        </div>
        <button onClick={() => router.push('/auth/login')} className="px-6 py-2 border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-full font-medium transition-all duration-200 hover:shadow-sm">
          Sign In
        </button>
      </header>

      <main className="px-6 md:px-24 pt-16 pb-20">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm font-medium mb-8">
            <Star className="h-4 w-4" />
            Your AI-Powered Health Sidekick
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-800 via-orange-700 to-amber-700 bg-clip-text text-transparent leading-tight">
            Health Made Simple,
            <br />
            <span className="text-4xl md:text-5xl">Personal & Smart</span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Think of Vein as your fit friend, personal doctor, and mental coach — all in one sleek AI form. 
            No fluff. Just vibes and results.
          </p>
          
          <button onClick={() => router.push('/auth/register')} className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            Get Started Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* Core Features */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-amber-800 mb-4">Core Features</h3>
            <p className="text-gray-600 text-lg">Everything you need for a healthier, happier you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white/70 hover:bg-white border border-amber-100 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer backdrop-blur-sm"
                onMouseEnter={() => setHoveredCard(`core-${idx}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`inline-flex p-3 rounded-2xl mb-6 transition-all duration-300 ${getColorClasses(feature.color, hoveredCard === `core-${idx}`)}`}>
                  {feature.icon}
                </div>
                
                <h4 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-amber-800 transition-colors">
                  {feature.title}
                </h4>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Vein */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-amber-800 mb-4">Why Choose Vein?</h3>
            <p className="text-gray-600 text-lg">Built different, built better</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyChoose.map((item, index) => (
              <div
                key={index}
                className="group bg-white/70 hover:bg-white border border-amber-100 rounded-3xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer backdrop-blur-sm"
                onMouseEnter={() => setHoveredCard(`why-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`inline-flex p-4 rounded-2xl mb-6 transition-all duration-300 ${getColorClasses(item.color, hoveredCard === `why-${index}`)}`}>
                  {item.icon}
                </div>
                
                <h4 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-amber-800 transition-colors">
                  {item.title}
                </h4>
                
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="mb-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/80 border border-amber-200 rounded-3xl p-12 text-center backdrop-blur-sm shadow-lg">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-xl text-gray-700 mb-6 italic leading-relaxed">
                "I asked Vein what to eat for muscle gain. It roasted my current diet and then gave me a plan. Love it."
              </blockquote>
              
              <cite className="text-amber-700 font-semibold">
                — Rohit M., Delhi
              </cite>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Health?</h3>
            <p className="text-xl mb-8 text-amber-100">Join thousands who've already started their journey</p>
            
            <button onClick={() => router.push('/auth/register')} className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-700 hover:bg-amber-50 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Start Your Health Journey Today
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="mt-4 text-amber-200 text-sm">
              Or just stare at this button until your body fixes itself. Your call.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/50 py-8 px-4 md:px-12 text-center text-sm text-amber-700 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <span>&copy; {new Date().getFullYear()} Vein. Built with</span>
          <Heart className="h-4 w-4 text-red-500 fill-current" />
          <span>&</span>
          <Leaf className="h-4 w-4 text-green-500" />
          <span>for a healthier future.</span>
        </div>
      </footer>
    </div>
  );
}