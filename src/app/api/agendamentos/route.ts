import { NextRequest } from "next/server";
import { AgendamentoController } from "@/backend/controllers/AgendamentoController";

const controller = new AgendamentoController();

export async function GET(req: NextRequest) {
  return controller.index(req);
}

export async function POST(req: NextRequest) {
  return controller.store(req);
}
