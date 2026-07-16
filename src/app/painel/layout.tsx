import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel Admin — Cristiane Vasconcelos Clinic",
  description: "Painel de administração da Cristiane Vasconcelos Clinic. Gerencie agendamentos, serviços, profissionais e configurações.",
};

export default function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
