import { NextRequest, NextResponse } from "next/server";
import { FichaTratamentoRepository } from "@/backend/repositories/FichaTratamentoRepository";

const repo = new FichaTratamentoRepository();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pacienteId = searchParams.get("paciente_id");

    if (pacienteId) {
      const fichas = await repo.findByPacienteId(pacienteId);
      return NextResponse.json(fichas);
    }

    const fichas = await repo.all();
    return NextResponse.json(fichas);
  } catch (error: any) {
    console.error("Erro ao buscar fichas de tratamento:", error);
    return NextResponse.json(
      { message: error.message || "Erro ao buscar fichas de tratamento" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paciente_id, procedimento_zona, sessoes_adquiridas, validade, observacoes_gerais } = body;

    if (!paciente_id || !procedimento_zona) {
      return NextResponse.json(
        { message: "paciente_id e procedimento_zona são obrigatórios." },
        { status: 400 }
      );
    }

    const ficha = await repo.create({
      paciente_id,
      procedimento_zona,
      data_aquisicao: body.data_aquisicao || new Date().toISOString().split("T")[0],
      sessoes_adquiridas: Number(sessoes_adquiridas) || 10,
      validade: validade || null,
      observacoes_gerais: observacoes_gerais || null,
    });

    const fullFicha = await repo.findWithDetails(ficha.id);
    return NextResponse.json(fullFicha || ficha, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar ficha de tratamento:", error);
    return NextResponse.json(
      { message: error.message || "Erro ao criar ficha de tratamento" },
      { status: 400 }
    );
  }
}
