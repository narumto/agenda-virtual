import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área do Profissional — Agenda Virtual",
  description: "Acesso restrito a profissionais da equipe.",
};

export default function ProfissionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
