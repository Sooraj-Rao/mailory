"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: `
            group toast 
            group-[.toaster]:bg-blue-600
            group-[.toaster]:text-white 
            group-[.toaster]:border-transparent 
            group-[.toaster]:shadow-xl
            dark:group-[.toaster]:bg-blue-800
            dark:group-[.toaster]:text-white
          `,
          description:
            "group-[.toast]:text-gray-200 dark:group-[.toast]:text-gray-300",
          actionButton:
            "group-[.toast]:bg-green-600 group-[.toast]:text-white group-[.toast]:hover:bg-green-700",
          cancelButton:
            "group-[.toast]:bg-gray-400 group-[.toast]:text-white group-[.toast]:hover:bg-gray-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
