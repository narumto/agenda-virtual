import { NextRequest } from "next/server";
import { BloqueioAgendaController } from "@/backend/controllers/BloqueioAgendaController";

const controller = new BloqueioAgendaController();

export async function GET(req: NextRequest) {
  return controller.index(req);
}

export async function POST(req: NextRequest) {
  return controller.store(req);
}
