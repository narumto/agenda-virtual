import { NextRequest, NextResponse } from "next/server";
import { FichaTratamentoRepository } from "@/backend/repositories/FichaTratamentoRepository";

const repo = new FichaTratamentoRepository();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ficha = await repo.findWithDetails(id);

    if (!ficha) {
      return NextResponse.json({ message: "Ficha não encontrada" }, { status: 404 });
    }

    return NextResponse.json(ficha);
  } catch (error: any) {
    console.error("Erro ao buscar detalhes da ficha:", error);
    return NextResponse.json(
      { message: error.message || "Erro ao obter ficha" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await repo.update(id, body);
    const fullFicha = await repo.findWithDetails(id);

    return NextResponse.json(fullFicha || updated);
  } catch (error: any) {
    console.error("Erro ao atualizar ficha:", error);
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar ficha" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await repo.delete(id);

    return NextResponse.json({ message: "Ficha excluída com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir ficha:", error);
    return NextResponse.json(
      { message: error.message || "Erro ao excluir ficha" },
      { status: 400 }
    );
  }
}
