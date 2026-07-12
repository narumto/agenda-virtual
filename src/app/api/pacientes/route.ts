import { NextRequest } from "next/server";
import { PacienteController } from "@/backend/controllers/PacienteController";

const controller = new PacienteController();

export async function GET() {
  return controller.index();
}

export async function POST(req: NextRequest) {
  return controller.store(req);
}
