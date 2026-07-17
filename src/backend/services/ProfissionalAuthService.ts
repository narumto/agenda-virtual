import { ProfissionalRepository } from "../repositories/ProfissionalRepository";
import bcrypt from "bcrypt";

const repo = new ProfissionalRepository();

export class ProfissionalAuthService {
  async login(email: string, senha: string) {
    if (!email || !senha) throw new Error("Email e senha são obrigatórios");

    const profissional = await repo.findByEmail(email.trim().toLowerCase());
    if (!profissional) throw new Error("Credenciais inválidas");

    if (profissional.status_acesso !== "liberado") {
      throw new Error("Acesso não autorizado. Aguarde a liberação pelo administrador.");
    }

    if (!profissional.senha_hash) {
      const err: any = new Error("Primeiro acesso detectado! O seu cadastro está liberado. Defina a sua palavra-passe para continuar.");
      err.needsPasswordSetup = true;
      throw err;
    }

    const senhaCorreta = await bcrypt.compare(senha, profissional.senha_hash);
    if (!senhaCorreta) throw new Error("Credenciais inválidas");

    const { senha_hash, ...safe } = profissional as any;
    return safe;
  }
}
