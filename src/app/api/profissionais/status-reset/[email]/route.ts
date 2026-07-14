import { NextRequest } from "next/server";
import { ProfissionalController } from "@/backend/controllers/ProfissionalController";

const controller = new ProfissionalController();

export async function GET(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);
  return controller.statusReset(decodedEmail);
}
