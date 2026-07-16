import { NextRequest, NextResponse } from "next/server";
import { ProfissionalRepository } from "@/backend/repositories/ProfissionalRepository";

const repo = new ProfissionalRepository();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pro = await repo.find(id);
    if (!pro) {
      return NextResponse.json({ message: "Profissional não encontrado" }, { status: 404 });
    }

    await repo.update(id, { senha_hash: null });

    return NextResponse.json({ message: "Palavra-passe redefinida com sucesso para o padrão." });
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Erro interno" }, { status: 500 });
  }
}
