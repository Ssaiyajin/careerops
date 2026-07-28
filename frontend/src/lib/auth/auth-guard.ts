import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "./token";

export const useAuthGuard = () => {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    }
  }, [router]);
};