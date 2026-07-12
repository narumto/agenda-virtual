import { NextRequest } from "next/server";
import { BloqueioAgendaController } from "@/backend/controllers/BloqueioAgendaController";

const controller = new BloqueioAgendaController();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return controller.show(id);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return controller.update(id, req);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return controller.destroy(id);
}
