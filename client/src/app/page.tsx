"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Features from "@/components/home/features";
import Footer from "@/components/home/footer";
import Header from "@/components/home/header";
import Hero from "@/components/home/hero";
import Pricing from "@/components/home/pricing";
import { useUser } from "@/hooks/user/auth-user";

export default function HomePage() {
  const router = useRouter();
  const { userData } = useUser();

  useEffect(() => {
    if (userData) {
      router.push("/dashboard/emails");
      return;
    }
  }, [userData]);

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
