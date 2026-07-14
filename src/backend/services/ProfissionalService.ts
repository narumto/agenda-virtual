import { ProfissionalRepository } from "../repositories/ProfissionalRepository";
import { Profissional } from "../models/types";
import bcrypt from "bcrypt";

export class ProfissionalService {
  private repository = new ProfissionalRepository();

  async list(onlyActive: boolean = false): Promise<Profissional[]> {
    if (onlyActive) {
      return await this.repository.listActive();
    }
    return await this.repository.all();
  }

  async find(id: string): Promise<Profissional | null> {
    return await this.repository.find(id);
  }

  async create(data: Partial<Profissional> & { servico_ids?: string[] }): Promise<Profissional> {
    if (!data.nome) throw new Error("Nome é obrigatório");

    const prof = await this.repository.create({
      nome: data.nome,
      telefone: data.telefone || null,
      foto_url: data.foto_url || null,
      prioridade: data.prioridade !== undefined ? Number(data.prioridade) : 1,
      ativo: data.ativo !== undefined ? Boolean(data.ativo) : true,
      email: data.email || null,
      categoria: data.categoria || "funcionario",
      status_acesso: data.status_acesso || "pendente",
    });

    if (data.servico_ids) {
      await this.repository.linkServices(prof.id, data.servico_ids);
    }

    return prof;
  }

  async update(id: string, data: Partial<Profissional> & { servico_ids?: string[] }): Promise<Profissional> {
    const prof = await this.repository.find(id);
    if (!prof) throw new Error("Profissional não encontrado");

    const updateData: Partial<Profissional> = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.foto_url !== undefined) updateData.foto_url = data.foto_url;
    if (data.prioridade !== undefined) updateData.prioridade = Number(data.prioridade);
    if (data.ativo !== undefined) updateData.ativo = Boolean(data.ativo);
    if (data.email !== undefined) updateData.email = data.email;
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (data.status_acesso !== undefined) updateData.status_acesso = data.status_acesso;

    const updated = await this.repository.update(id, updateData);

    if (data.servico_ids !== undefined) {
      await this.repository.linkServices(id, data.servico_ids);
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const prof = await this.repository.find(id);
    if (!prof) throw new Error("Profissional não encontrado");
    return await this.repository.delete(id);
  }

  async getLinkedServices(id: string): Promise<string[]> {
    const prof = await this.repository.find(id);
    if (!prof) throw new Error("Profissional não encontrado");
    return await this.repository.listServices(id);
  }

  async solicitarReset(email: string): Promise<boolean> {
    if (!email) throw new Error("E-mail é obrigatório");
    const prof = await this.repository.findByEmail(email);
    if (!prof) {
      return true;
    }
    await this.repository.update(prof.id, { status_reset: "pendente" });
    return true;
  }

  async aprovarReset(id: string): Promise<Profissional> {
    const prof = await this.repository.find(id);
    if (!prof) throw new Error("Profissional não encontrado");

    return await this.repository.update(id, { status_reset: "aprovado" });
  }

  async checkResetStatus(email: string): Promise<'nenhum' | 'pendente' | 'aprovado' | null> {
    if (!email) throw new Error("E-mail é obrigatório");
    const prof = await this.repository.findByEmail(email);
    if (!prof) return null;
    return prof.status_reset;
  }

  async redefinirSenha(email: string, novaSenhaPlain: string): Promise<boolean> {
    if (!email) throw new Error("E-mail é obrigatório");
    if (!novaSenhaPlain) throw new Error("Nova senha é obrigatória");

    const prof = await this.repository.findByEmail(email);
    if (!prof) {
      const err = new Error("Redefinição de senha não autorizada");
      (err as any).status = 403;
      throw err;
    }

    if (prof.status_reset !== "aprovado") {
      const err = new Error("Redefinição de senha não autorizada");
      (err as any).status = 403;
      throw err;
    }

    if (novaSenhaPlain.length < 8) {
      const err = new Error("A nova senha deve ter no mínimo 8 caracteres");
      (err as any).status = 400;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(novaSenhaPlain, salt);

    await this.repository.update(prof.id, {
      senha_hash: senhaHash,
      status_reset: "nenhum",
    });

    return true;
  }
}
