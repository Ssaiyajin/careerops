import { isLoggedIn } from "./token";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useProtectRoute = () => {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    }
  }, []);
};