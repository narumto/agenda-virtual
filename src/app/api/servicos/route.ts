import { NextRequest } from "next/server";
import { ServicoController } from "@/backend/controllers/ServicoController";

const controller = new ServicoController();

export async function GET(req: NextRequest) {
  return controller.index(req);
}

export async function POST(req: NextRequest) {
  return controller.store(req);
}
