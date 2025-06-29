"use client";

import { useZustandStore } from "@/zustand/store";
import { useEffect, useState } from "react";

export const useUser = () => {
  const { userData, setUserData } = useZustandStore();
  const [userDataLoading, setUserDataLoading] = useState(false);

  const fetchData = async () => {
    try {
      setUserDataLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUserData(data.user);
    } catch (err) {
      console.log(err);
    } finally {
      setUserDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { userData, userDataLoading };
};
