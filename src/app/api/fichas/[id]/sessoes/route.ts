import { NextRequest, NextResponse } from "next/server";
import { FichaTratamentoRepository } from "@/backend/repositories/FichaTratamentoRepository";

const repo = new FichaTratamentoRepository();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { numero_sessao, zona_tratada, potencia, ponteira, observacoes, agendamento_id, profissional_id } = body;

    if (!zona_tratada || !numero_sessao) {
      return NextResponse.json(
        { message: "numero_sessao e zona_tratada são obrigatórios." },
        { status: 400 }
      );
    }

    const sessao = await repo.addSessao({
      ficha_id: id,
      agendamento_id: agendamento_id || null,
      data_sessao: body.data_sessao || new Date().toISOString(),
      numero_sessao: Number(numero_sessao),
      zona_tratada,
      potencia: potencia || null,
      ponteira: ponteira || null,
      observacoes: observacoes || null,
      profissional_id: profissional_id || null,
    });

    return NextResponse.json(sessao, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao registrar sessão:", error);
    return NextResponse.json(
      { message: error.message || "Erro ao registrar sessão" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessaoId = searchParams.get("sessao_id");

    if (!sessaoId) {
      return NextResponse.json({ message: "sessao_id é obrigatório." }, { status: 400 });
    }

    await repo.deleteSessao(sessaoId);
    return NextResponse.json({ message: "Sessão removida com sucesso." });
  } catch (error: any) {
    console.error("Erro ao remover sessão:", error);
    return NextResponse.json(
      { message: error.message || "Erro ao remover sessão" },
      { status: 400 }
    );
  }
}
