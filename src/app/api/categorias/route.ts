import { NextRequest } from "next/server";
import { CategoriaController } from "@/backend/controllers/CategoriaController";

const controller = new CategoriaController();

export async function GET() {
  return controller.index();
}

export async function POST(req: NextRequest) {
  return controller.store(req);
}
