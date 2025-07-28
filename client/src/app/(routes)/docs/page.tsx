import DocsPage from "@/components/docs/docs-page";
import React, { Suspense } from "react";

const Page = () => (
  <Suspense>
    <DocsPage />
  </Suspense>
);

export default Page;
