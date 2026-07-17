"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfissionalLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?role=profissional");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
      <div className="w-8 h-8 border-4 border-[#C49A82] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
