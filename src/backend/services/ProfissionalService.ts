import { ProfissionalRepository } from "../repositories/ProfissionalRepository";
import { Profissional } from "../models/types";

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
}
