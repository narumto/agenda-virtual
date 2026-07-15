import { ProfissionalRepository } from "../repositories/ProfissionalRepository";
import { PacienteRepository } from "../repositories/PacienteRepository";
import { Profissional, Paciente } from "../models/types";

export interface VerifyLoginResult {
  role: "profissional" | "paciente";
  user: Profissional | Paciente;
  isNewUser: boolean;
}

export class AuthService {
  private profissionalRepo = new ProfissionalRepository();
  private pacienteRepo = new PacienteRepository();

  async verifyLogin(payload: {
    email: string;
    google_id: string;
    nome: string;
    foto_url?: string | null;
    role: "profissional" | "paciente";
  }): Promise<VerifyLoginResult> {
    const { email, google_id, nome, foto_url, role } = payload;

    if (!email) throw new Error("E-mail é obrigatório");
    if (!google_id) throw new Error("Google ID é obrigatório");
    if (!role) throw new Error("Role é obrigatório");

    if (role === "profissional") {
      const profissional = await this.profissionalRepo.findByEmail(email);

      if (profissional) {
        if (profissional.status_acesso === "pendente") {
          const err = new Error("Login pendente de liberação pela administração");
          (err as any).status = 403;
          throw err;
        }

        return {
          role: "profissional",
          user: profissional,
          isNewUser: false,
        };
      } else {
        const newProfissional = await this.profissionalRepo.create({
          nome: nome,
          email: email,
          status_acesso: "pendente",
          categoria: "funcionario",
          prioridade: 1,
          ativo: true,
          foto_url: foto_url || null,
        });

        const err = new Error("Login pendente de liberação pela administração");
        (err as any).status = 403;
        throw err;
      }
    } else {
      const paciente = await this.pacienteRepo.findByEmail(email);

      if (paciente) {
        let updatedPaciente = paciente;
        if (paciente.google_id !== google_id) {
          updatedPaciente = await this.pacienteRepo.update(paciente.id, {
            google_id: google_id,
          });
        }

        return {
          role: "paciente",
          user: updatedPaciente,
          isNewUser: false,
        };
      } else {
        const newPaciente = await this.pacienteRepo.create({
          nome: nome,
          email: email,
          google_id: google_id,
          telefone: "",
        });

        return {
          role: "paciente",
          user: newPaciente,
          isNewUser: true,
        };
      }
    }
  }
}
