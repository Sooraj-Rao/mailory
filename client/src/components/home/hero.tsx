"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-20 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 border border-cyan-500/20 rounded-full" />
        <div className="absolute -top-20 -right-20 w-40 h-40 border border-blue-500/30 rounded-full" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 border border-purple-500/20 rounded-full" />
        <div className="absolute bottom-20 right-1/4 w-32 h-32 border border-cyan-400/25 rounded-full" />

        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-500" />
      </div>

      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent transform rotate-12" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent transform -rotate-12" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center mb-8">
            <div className="flex items-center px-6 py-3 rounded-full border border-cyan-500/30 bg-slate-800/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse" />
              <span className="text-sm text-cyan-300 font-medium">
                Live • Serving 10,000+ developers
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-4 leading-none">
              <span className="block text-white">Email</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Infrastructure
              </span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6" />
          </div>

          <p className="text-xl sm:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Developer-first email API that scales from startup to enterprise.
            <br />
            <span className="text-cyan-400 font-medium">
              Simple. Reliable. Fast.
            </span>
          </p>

          <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-1">
                99.9%
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">
                Uptime
              </div>
            </div>
            <div className="text-center border-x border-slate-700">
              <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">
                10M+
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">
                Delivered
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-1">
                5min
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">
                Setup
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-2xl shadow-cyan-500/25 group"
              >
                Start Building
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-white/10 hover:text-white px-8 py-4 text-lg font-semibold backdrop-blur-sm bg-transparent group"
            >
              <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm">GDPR Ready</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
