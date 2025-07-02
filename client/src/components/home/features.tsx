"use client";

import {
  Send,
  Users,
  Calendar,
  LayoutTemplateIcon as Template,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Send,
    title: "Transactional API",
    description:
      "Send password resets, confirmations, and notifications with our reliable API.",
    stats: "100 emails/day free",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Users,
    title: "Batch Campaigns",
    description:
      "Marketing campaigns and newsletters to multiple recipients with tracking.",
    stats: "100 recipients/day",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Schedule emails for optimal delivery times and automated sequences.",
    stats: "Coming Soon",
    upcoming: true,
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Template,
    title: "Email Templates",
    description:
      "Beautiful, responsive templates with drag-and-drop customization.",
    stats: "Coming Soon",
    upcoming: true,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track opens, clicks, bounces with detailed performance insights.",
    stats: "Live tracking",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 compliant with end-to-end encryption and data protection.",
    stats: "Bank-level security",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800" />

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 border border-cyan-500/10 rounded-full" />
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-blue-500/10 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-cyan-400/30 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400/30 rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-cyan-500/20 mb-6">
            <Zap className="w-4 h-4 text-cyan-400 mr-2" />
            <span className="text-sm text-cyan-300">Powerful Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              send emails at scale
            </span>
          </h2>
          <p className="text-xl text-slate-300">
            From simple transactional emails to complex marketing automation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-2xl border transition-all duration-500 hover:scale-105 ${
                feature.upcoming
                  ? "border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"
                  : "border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-cyan-500/30"
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}
              />

              <div className="relative mb-6">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <div
                  className={`absolute -top-2 -right-2 px-3 py-1 text-xs rounded-full border ${
                    feature.upcoming
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  }`}
                >
                  {feature.stats}
                </div>
              </div>

              <div className="relative">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="absolute bottom-4 right-4 w-8 h-8 border border-slate-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-4 right-4 w-2 h-2 bg-slate-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100" />
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-4 rounded-full bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-slate-300">
                Global Infrastructure
              </span>
            </div>
            <div className="w-px h-6 bg-slate-600" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-300">99.9% Uptime</span>
            </div>
            <div className="w-px h-6 bg-slate-600" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-300">
                Enterprise Security
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
