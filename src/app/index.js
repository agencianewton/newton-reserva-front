// pages/index.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";

const principal = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de login após 1 segundo
    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, 1000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div>
      <p>Redirecionando para a página de login...</p>
    </div>
  );
};

export default principal;
