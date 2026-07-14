import { BaseController } from "./BaseController";
import { AuthService } from "../services/AuthService";
import { ProfissionalResource } from "../resources/ProfissionalResource";
import { PacienteResource } from "../resources/PacienteResource";
import { NextRequest } from "next/server";

export class AuthController extends BaseController {
  private service = new AuthService();

  async verify(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, google_id, nome, foto_url, role } = body;

      if (!email) {
        return this.error("O campo 'email' é obrigatório", 400);
      }
      if (!google_id) {
        return this.error("O campo 'google_id' é obrigatório", 400);
      }
      if (!nome) {
        return this.error("O campo 'nome' é obrigatório", 400);
      }
      if (!role) {
        return this.error("O campo 'role' é obrigatório", 400);
      }
      if (role !== "profissional" && role !== "paciente") {
        return this.error("O campo 'role' deve ser 'profissional' ou 'paciente'", 400);
      }

      const result = await this.service.verifyLogin({
        email,
        google_id,
        nome,
        foto_url,
        role,
      });

      if (result.role === "profissional") {
        return this.json({
          role: result.role,
          data: new ProfissionalResource(result.user as any).toArray(),
        });
      } else {
        return this.json({
          role: result.role,
          data: new PacienteResource(result.user as any).toArray(),
        });
      }
    } catch (e: any) {
      if (e.status === 403) {
        return this.error(e.message, 403);
      }
      return this.error(e.message || "Erro durante a verificação de login", 400);
    }
  }
}
