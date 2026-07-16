import { NextRequest, NextResponse } from "next/server";
import { ProfissionalRepository } from "@/backend/repositories/ProfissionalRepository";

const repo = new ProfissionalRepository();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email é obrigatório" }, { status: 400 });
    }

    const pro = await repo.findByEmail(email.trim().toLowerCase());
    if (pro && pro.status_acesso === "liberado" && !pro.senha_hash) {
      return NextResponse.json({ needsPasswordSetup: true });
    }

    return NextResponse.json({ needsPasswordSetup: false });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erro interno" }, { status: 500 });
  }
}
