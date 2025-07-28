import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { Logo } from "./sidebar";

const DashboardHeader = ({ onToggle }: { onToggle: () => void }) => {
  return (
    <div className=" h-16 sticky z-[99] top-0 bg-background flex justify-between items-center text-sm  md:px-10 px-6  w-full border-b">
      <div className=" md:opacity-0">
        <Logo />
      </div>
      <div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="md:hidden text-foreground hover:bg-accent"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <div className=" md:block hidden">
          <Link href={"/docs"}>
            <Button variant="link">Docs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
