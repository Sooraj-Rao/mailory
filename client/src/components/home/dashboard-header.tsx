import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";

const DashboardHeader = () => {
  return (
    <div className=" h-16 sticky z-[99] top-0 bg-background flex justify-end items-center text-sm  px-10  w-full border-b">
      <Link href={"/docs"}>
        <Button variant="link">Docs</Button>
      </Link>
      <Link href={"/help"}>
        <Button variant="link">Help</Button>
      </Link>
    </div>
  );
};

export default DashboardHeader;
