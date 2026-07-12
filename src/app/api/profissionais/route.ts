import { NextRequest } from "next/server";
import { ProfissionalController } from "@/backend/controllers/ProfissionalController";

const controller = new ProfissionalController();

export async function GET(req: NextRequest) {
  return controller.index(req);
}

export async function POST(req: NextRequest) {
  return controller.store(req);
}
