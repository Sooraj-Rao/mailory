"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Features from "@/components/home/features";
import Footer from "@/components/home/footer";
import Header from "@/components/home/header";
import Hero from "@/components/home/hero";
import Pricing from "@/components/home/pricing";
import Cookies from "js-cookie";

export default function HomePage() {
  const router = useRouter();
  const token = Cookies.get("auth-token");

  useEffect(() => {
    console.log(token);
    if (token) {
      router.push("/dashboard/overview");
      return;
    }
  }, [router]);

  if (!router) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen ">
        <Header />
        <Hero />
        <Features />
        <Pricing />
        <Footer />
      </div>
    </>
  );
}
