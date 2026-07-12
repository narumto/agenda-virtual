import { NextRequest } from "next/server";
import { ConfiguracaoController } from "@/backend/controllers/ConfiguracaoController";

const controller = new ConfiguracaoController();

export async function GET() {
  return controller.show();
}

export async function PUT(req: NextRequest) {
  return controller.update(req);
}
