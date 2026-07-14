import { NextRequest } from "next/server";
import { AuthController } from "@/backend/controllers/AuthController";

const controller = new AuthController();

export async function POST(req: NextRequest) {
  return controller.verify(req);
}
