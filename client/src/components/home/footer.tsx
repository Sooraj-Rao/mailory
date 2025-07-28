"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t flex justify-between items-center px-10 p-6 border-white/10">
      <div>
        <Link href="/" className="flex items-center space-x-2 ">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Mailory
          </span>
        </Link>
      </div>
      <div>
        <p className=" text-sm">
          Developed by
            <a
              target="_blank"
              className="text-cyan-300 px-1 font-semibold  hover:underline"
              href="https://soorajrao.in/?ref=mailory_app"
            >
              Sooraj Rao
            </a>
        </p>
      </div>
    </footer>
  );
}
