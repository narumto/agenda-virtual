import { NextRequest } from "next/server";
import { ProfissionalController } from "@/backend/controllers/ProfissionalController";

const controller = new ProfissionalController();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return controller.updateAcesso(id, req);
}
