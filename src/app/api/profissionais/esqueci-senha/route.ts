import { NextRequest } from "next/server";
import { ProfissionalController } from "@/backend/controllers/ProfissionalController";

const controller = new ProfissionalController();

export async function POST(req: NextRequest) {
  return controller.esqueciSenha(req);
}
