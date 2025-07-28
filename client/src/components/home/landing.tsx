// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowRight,
//   Mail,
//   Zap,
//   BarChart3,
//   Key,
//   Code,
//   Send,
// } from "lucide-react";
// import Link from "next/link";

// export default function Landing() {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [scrollY, setScrollY] = useState(0);
//   const [currentWord, setCurrentWord] = useState(0);
//   const [isTyping, setIsTyping] = useState(true);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const heroRef = useRef<HTMLDivElement>(null);

//   const words = [
//     "reliable",
//     "lightning fast",
//     "secure",
//     "scalable",
//     "powerful",
//   ];

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     };

//     const handleScroll = () => {
//       setScrollY(window.scrollY);
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsTyping(false);
//       setTimeout(() => {
//         setCurrentWord((prev) => (prev + 1) % words.length);
//         setIsTyping(true);
//       }, 500);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const particles: Array<{
//       x: number;
//       y: number;
//       vx: number;
//       vy: number;
//       size: number;
//       opacity: number;
//       color: string;
//     }> = [];

//     for (let i = 0; i < 100; i++) {
//       particles.push({
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height,
//         vx: (Math.random() - 0.5) * 0.5,
//         vy: (Math.random() - 0.5) * 0.5,
//         size: Math.random() * 3 + 1,
//         opacity: Math.random() * 0.5 + 0.1,
//         color: Math.random() > 0.5 ? "#3b82f6" : "#06b6d4",
//       });
//     }

//     const animate = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       particles.forEach((particle, index) => {
//         particle.x += particle.vx;
//         particle.y += particle.vy;

//         if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
//         if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

//         const dx = mousePosition.x - particle.x;
//         const dy = mousePosition.y - particle.y;
//         const distance = Math.sqrt(dx * dx + dy * dy);

//         if (distance < 100) {
//           particle.vx += dx * 0.00001;
//           particle.vy += dy * 0.00001;
//         }

//         ctx.beginPath();
//         ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
//         ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255)
//           .toString(16)
//           .padStart(2, "0")}`;
//         ctx.fill();

//         particles.slice(index + 1).forEach((otherParticle) => {
//           const dx = particle.x - otherParticle.x;
//           const dy = particle.y - otherParticle.y;
//           const distance = Math.sqrt(dx * dx + dy * dy);

//           if (distance < 80) {
//             ctx.beginPath();
//             ctx.moveTo(particle.x, particle.y);
//             ctx.lineTo(otherParticle.x, otherParticle.y);
//             ctx.strokeStyle = `rgba(59, 130, 246, ${
//               0.1 * (1 - distance / 80)
//             })`;
//             ctx.lineWidth = 0.5;
//             ctx.stroke();
//           }
//         });
//       });

//       requestAnimationFrame(animate);
//     };

//     animate();

//     const handleResize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [mousePosition]);

//   return (
//     <div className="min-h-screen bg-black text-white overflow-hidden relative">
//       {/* Animated Canvas Background */}
//       <canvas
//         ref={canvasRef}
//         className="fixed inset-0 pointer-events-none z-0"
//         style={{ opacity: 0.6 }}
//       />

//       {/* Geometric Background Elements */}
//       <div className="fixed inset-0 z-0">
//         <div
//           className="absolute w-96 h-96 border border-blue-500/20 rounded-full"
//           style={{
//             top: "20%",
//             left: "10%",
//             transform: `rotate(${scrollY * 0.1}deg) scale(${
//               1 + Math.sin(scrollY * 0.01) * 0.1
//             })`,
//           }}
//         />
//         <div
//           className="absolute w-64 h-64 border border-cyan-500/20 rounded-full"
//           style={{
//             top: "60%",
//             right: "15%",
//             transform: `rotate(${-scrollY * 0.15}deg) scale(${
//               1 + Math.cos(scrollY * 0.01) * 0.1
//             })`,
//           }}
//         />
//         <div
//           className="absolute w-32 h-32 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-xl"
//           style={{
//             top: "40%",
//             left: "70%",
//             transform: `translate(${Math.sin(scrollY * 0.01) * 50}px, ${
//               Math.cos(scrollY * 0.01) * 30
//             }px)`,
//           }}
//         />
//       </div>

//       {/* Navigation */}
//       <nav className="relative z-50 flex items-center justify-between p-6 max-w-7xl mx-auto backdrop-blur-sm">
//         <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
//           Mailory
//         </div>
//         <div className="flex items-center gap-4">
//           <Link href="/login">
//             <Button
//               variant="ghost"
//               className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
//             >
//               Sign In
//             </Button>
//           </Link>
//           <Link href="/register">
//             <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
//               Get Started
//             </Button>
//           </Link>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section
//         ref={heroRef}
//         className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32"
//       >
//         <div className="grid lg:grid-cols-2 gap-12 items-center">
//           <div className="space-y-8">
//             <div className="space-y-6">
//               <div className="text-8xl font-black leading-none tracking-tight">
//                 <div className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
//                   Email API
//                 </div>
//                 <div className="flex items-center gap-4 mt-2">
//                   <span className="text-gray-400">that's</span>
//                   <span
//                     className={`bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-500 ${
//                       isTyping
//                         ? "opacity-100 transform-none"
//                         : "opacity-0 transform translate-y-4"
//                     }`}
//                   >
//                     {words[currentWord]}
//                   </span>
//                 </div>
//               </div>

//               <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
//                 Send transactional emails and campaigns with our blazing-fast
//                 API. Built for developers who demand reliability and
//                 performance.
//               </p>
//             </div>

//             <div className="flex gap-4">
//               <Link href="/register">
//                 <Button
//                   size="lg"
//                   className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8 py-6 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group"
//                 >
//                   Start Building
//                   <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
//                 </Button>
//               </Link>
//               <Link href="/docs">
//                 <Button
//                   size="lg"
//                   variant="outline"
//                   className="border-gray-600 text-lg px-8 py-6 bg-black/50 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
//                 >
//                   <Code className="mr-2 h-5 w-5" />
//                   Documentation
//                 </Button>
//               </Link>
//             </div>

//             {/* Stats */}
//             <div className="flex items-center gap-8 pt-8">
//               <div className="text-center group">
//                 <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
//                   100+
//                 </div>
//                 <div className="text-sm text-gray-400">Free emails/day</div>
//               </div>
//               <div className="text-center group">
//                 <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
//                   99.9%
//                 </div>
//                 <div className="text-sm text-gray-400">Uptime</div>
//               </div>
//               <div className="text-center group">
//                 <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
//                   &lt;1s
//                 </div>
//                 <div className="text-sm text-gray-400">Delivery</div>
//               </div>
//             </div>
//           </div>

//           {/* 3D Interactive Elements */}
//           <div className="relative h-96 lg:h-[600px] perspective-1000">
//             {/* Floating Email Cards */}
//             {[...Array(6)].map((_, i) => (
//               <div
//                 key={i}
//                 className="absolute w-72 h-44 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl transition-all duration-1000 hover:scale-105 cursor-pointer"
//                 style={{
//                   top: `${20 + i * 15}%`,
//                   left: `${10 + (i % 2) * 40}%`,
//                   transform: `
//                     rotateX(${Math.sin(scrollY * 0.01 + i) * 10}deg)
//                     rotateY(${Math.cos(scrollY * 0.01 + i) * 15}deg)
//                     translateZ(${Math.sin(scrollY * 0.01 + i) * 50}px)
//                     translate(${mousePosition.x * 0.02 * (i + 1)}px, ${
//                     mousePosition.y * 0.02 * (i + 1)
//                   }px)
//                   `,
//                   zIndex: 10 - i,
//                 }}
//               >
//                 <div className="p-6 h-full flex flex-col justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
//                       <Mail className="h-5 w-5 text-white" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-medium text-white">
//                         Email Sent
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         user@example.com
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <div
//                       className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
//                       style={{ width: `${60 + i * 10}%` }}
//                     />
//                     <div
//                       className="h-2 bg-gray-700 rounded-full"
//                       style={{ width: `${40 + i * 8}%` }}
//                     />
//                   </div>
//                   <div className="text-xs text-gray-400">
//                     {new Date(Date.now() - i * 60000).toLocaleTimeString()}
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {/* Floating Code Block */}
//             <div
//               className="absolute w-80 h-48 bg-black/95 backdrop-blur-sm rounded-xl border border-blue-500/30 shadow-2xl font-mono text-xs overflow-hidden"
//               style={{
//                 top: "30%",
//                 right: "5%",
//                 transform: `
//                   rotateX(${Math.sin(scrollY * 0.01) * 5}deg)
//                   rotateY(${Math.cos(scrollY * 0.01) * 10}deg)
//                   translate(${mousePosition.x * -0.03}px, ${
//                   mousePosition.y * -0.03
//                 }px)
//                 `,
//               }}
//             >
//               <div className="p-4 space-y-1">
//                 <div className="text-blue-400">POST /api/emails</div>
//                 <div className="text-gray-500">{"{"}</div>
//                 <div className="text-gray-300 ml-2">
//                   "to": "user@example.com",
//                 </div>
//                 <div className="text-gray-300 ml-2">"subject": "Welcome!",</div>
//                 <div className="text-gray-300 ml-2">
//                   "html": "&lt;h1&gt;Hello World&lt;/h1&gt;"
//                 </div>
//                 <div className="text-gray-500">{"}"}</div>
//                 <div className="mt-4 text-green-400">
//                   ✓ Email sent successfully
//                 </div>
//                 <div className="text-gray-400">Response time: 0.3s</div>
//               </div>
//             </div>

//             {/* Floating Analytics */}
//             <div
//               className="absolute w-64 h-40 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-2xl"
//               style={{
//                 bottom: "10%",
//                 left: "20%",
//                 transform: `
//                   rotateX(${Math.cos(scrollY * 0.01) * 8}deg)
//                   rotateY(${Math.sin(scrollY * 0.01) * 12}deg)
//                   translate(${mousePosition.x * 0.025}px, ${
//                   mousePosition.y * 0.025
//                 }px)
//                 `,
//               }}
//             >
//               <div className="p-4">
//                 <div className="text-sm font-medium text-white mb-3">
//                   Live Analytics
//                 </div>
//                 <div className="flex items-end gap-1 h-20">
//                   {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map(
//                     (height, i) => (
//                       <div
//                         key={i}
//                         className="bg-gradient-to-t from-blue-600 to-cyan-400 rounded-sm flex-1 transition-all duration-1000"
//                         style={{
//                           height: `${height}%`,
//                           animationDelay: `${i * 100}ms`,
//                         }}
//                       />
//                     )
//                   )}
//                 </div>
//                 <div className="text-xs text-gray-400 mt-2">
//                   29,486 emails delivered
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Interactive Code Section */}
//       <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
//         <div className="text-center mb-16">
//           <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-8 transform hover:rotate-12 transition-transform duration-300">
//             <Code className="h-10 w-10 text-white" />
//           </div>
//           <h2 className="text-6xl font-black mb-6">
//             <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
//               Integrate
//             </span>{" "}
//             <span className="text-white">in minutes</span>
//           </h2>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
//             Drop-in email API that works with your existing codebase. Start
//             sending emails with just a few lines of code.
//           </p>
//         </div>

//         {/* Interactive Code Playground */}
//         <div className="max-w-5xl mx-auto">
//           <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
//             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//               </div>
//               <div className="text-sm text-gray-400">mailory-example.js</div>
//               <div className="flex gap-2">
//                 <Button size="sm" variant="ghost" className="text-xs">
//                   <Send className="h-3 w-3 mr-1" />
//                   Run
//                 </Button>
//               </div>
//             </div>
//             <div className="p-8 font-mono text-sm">
//               <div className="space-y-2">
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">1</span>
//                   <span className="text-purple-400">import</span>
//                   <span className="text-gray-300"> {"{ Mailory }"} </span>
//                   <span className="text-purple-400">from</span>
//                   <span className="text-green-400"> 'mailory'</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">2</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">3</span>
//                   <span className="text-purple-400">const</span>
//                   <span className="text-blue-400"> mailory </span>
//                   <span className="text-gray-300">= </span>
//                   <span className="text-purple-400">new</span>
//                   <span className="text-yellow-400"> Mailory</span>
//                   <span className="text-gray-300">(</span>
//                   <span className="text-green-400">'your-api-key'</span>
//                   <span className="text-gray-300">)</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">4</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">5</span>
//                   <span className="text-purple-400">const</span>
//                   <span className="text-gray-300"> result = </span>
//                   <span className="text-purple-400">await</span>
//                   <span className="text-blue-400"> mailory</span>
//                   <span className="text-gray-300">.</span>
//                   <span className="text-yellow-400">send</span>
//                   <span className="text-gray-300">({"{"}</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">6</span>
//                   <span className="text-blue-400 ml-4"> to</span>
//                   <span className="text-gray-300">: </span>
//                   <span className="text-green-400">'user@example.com'</span>
//                   <span className="text-gray-300">,</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">7</span>
//                   <span className="text-blue-400 ml-4"> subject</span>
//                   <span className="text-gray-300">: </span>
//                   <span className="text-green-400">'Welcome to Mailory!'</span>
//                   <span className="text-gray-300">,</span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">8</span>
//                   <span className="text-blue-400 ml-4"> html</span>
//                   <span className="text-gray-300">: </span>
//                   <span className="text-green-400">
//                     '&lt;h1&gt;Hello World!&lt;/h1&gt;'
//                   </span>
//                 </div>
//                 <div className="flex">
//                   <span className="text-gray-500 w-8">9</span>
//                   <span className="text-gray-300">{"});"}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Grid */}
//       <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {[
//             {
//               icon: <BarChart3 className="h-8 w-8" />,
//               title: "Real-time Analytics",
//               description:
//                 "Track delivery, opens, clicks, and bounces in real-time",
//               gradient: "from-green-500 to-emerald-500",
//             },
//             {
//               icon: <Zap className="h-8 w-8" />,
//               title: "Lightning Fast",
//               description:
//                 "Sub-second email delivery with global infrastructure",
//               gradient: "from-yellow-500 to-orange-500",
//             },
//             {
//               icon: <Key className="h-8 w-8" />,
//               title: "API Management",
//               description:
//                 "Secure API keys with granular permissions and monitoring",
//               gradient: "from-purple-500 to-pink-500",
//             },
//           ].map((feature, i) => (
//             <div
//               key={i}
//               className="group relative p-8 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm hover:border-gray-700 transition-all duration-500 hover:scale-105"
//               style={{
//                 transform: `translateY(${Math.sin(scrollY * 0.01 + i) * 10}px)`,
//               }}
//             >
//               <div
//                 className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
//               >
//                 {feature.icon}
//               </div>
//               <h3 className="text-2xl font-bold mb-4 text-white">
//                 {feature.title}
//               </h3>
//               <p className="text-gray-300 leading-relaxed">
//                 {feature.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Pricing */}
//       <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
//         <div className="text-center mb-16">
//           <h2 className="text-6xl font-black mb-4">
//             <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//               Simple
//             </span>{" "}
//             pricing
//           </h2>
//           <p className="text-xl text-gray-300">Start free, scale as you grow</p>
//         </div>

//         <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//           {[
//             {
//               name: "Free",
//               price: "₹0",
//               features: [
//                 "3,000 emails/month",
//                 "100 emails/day",
//                 "Basic analytics",
//               ],
//               popular: false,
//             },
//             {
//               name: "Pro",
//               price: "₹299",
//               features: [
//                 "18,000 emails/month",
//                 "600 emails/day",
//                 "Advanced analytics",
//                 "Priority support",
//               ],
//               popular: true,
//             },
//             {
//               name: "Premium",
//               price: "₹599",
//               features: [
//                 "40,000 emails/month",
//                 "1,334 emails/day",
//                 "Premium analytics",
//                 "24/7 support",
//               ],
//               popular: false,
//             },
//           ].map((plan, i) => (
//             <div
//               key={i}
//               className={`relative p-8 rounded-2xl border transition-all duration-500 hover:scale-105 ${
//                 plan.popular
//                   ? "bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/50"
//                   : "bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800"
//               }`}
//             >
//               {plan.popular && (
//                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                   <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-medium">
//                     Most Popular
//                   </div>
//                 </div>
//               )}
//               <div className="text-center">
//                 <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
//                 <div className="text-5xl font-black mb-6">{plan.price}</div>
//                 <ul className="space-y-4 mb-8">
//                   {plan.features.map((feature, j) => (
//                     <li key={j} className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
//                       <span className="text-gray-300">{feature}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <Button
//                   className={`w-full ${
//                     plan.popular
//                       ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
//                       : "bg-transparent border border-gray-700 hover:bg-white/10"
//                   }`}
//                 >
//                   {plan.popular ? "Upgrade to Pro" : "Get Started"}
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
//         <div className="text-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-3xl p-16 border border-gray-800">
//           <h2 className="text-6xl font-black mb-6">
//             Ready to{" "}
//             <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
//               ship?
//             </span>
//           </h2>
//           <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
//             Join thousands of developers building the future with Mailory's
//             email infrastructure.
//           </p>
//           <Link href="/register">
//             <Button
//               size="lg"
//               className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-xl px-12 py-8 shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group"
//             >
//               Start Building Free
//               <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
//             </Button>
//           </Link>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="relative z-10 border-t border-gray-800 py-12">
//         <div className="max-w-7xl mx-auto px-6 text-center">
//           <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-4">
//             Mailory
//           </div>
//           <div className="text-gray-400">
//             © 2024 Mailory. Email infrastructure for developers.
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

import React from "react";

const Landing = () => {
  return <div>Landing</div>;
};

export default Landing;
