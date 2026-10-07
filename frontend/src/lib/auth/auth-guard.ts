import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearSessionHint } from "./token";

export const useAuthGuard = () => {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        if (!response.ok) {
          clearSessionHint();
          router.replace("/login");
        }
      })
      .catch(() => {
        if (!active) return;
        clearSessionHint();
        router.replace("/login");
      });

    return () => {
      active = false;
    };
  }, [router]);
};