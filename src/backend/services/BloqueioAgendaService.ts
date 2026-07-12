import { BloqueioAgendaRepository } from "../repositories/BloqueioAgendaRepository";
import { ProfissionalRepository } from "../repositories/ProfissionalRepository";
import { BloqueioAgenda } from "../models/types";

export class BloqueioAgendaService {
  private repository = new BloqueioAgendaRepository();
  private profissionalRepo = new ProfissionalRepository();

  async list(): Promise<BloqueioAgenda[]> {
    return await this.repository.all();
  }

  async find(id: string): Promise<BloqueioAgenda | null> {
    return await this.repository.find(id);
  }

  async listByProfessional(profissionalId: string): Promise<BloqueioAgenda[]> {
    return await this.repository.listByProfessional(profissionalId);
  }

  async create(data: Partial<BloqueioAgenda>): Promise<BloqueioAgenda> {
    if (!data.profissional_id) throw new Error("profissional_id é obrigatório");
    if (!data.inicio) throw new Error("Horário de início é obrigatório");
    if (!data.fim) throw new Error("Horário de término é obrigatório");
    if (!data.motivo) throw new Error("Motivo do bloqueio é obrigatório");

    const start = new Date(data.inicio);
    const end = new Date(data.fim);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Formato de data/hora inválido para início ou término");
    }

    if (start >= end) {
      throw new Error("Horário de início deve ser anterior ao de término");
    }

    const professional = await this.profissionalRepo.find(data.profissional_id);
    if (!professional) throw new Error("Profissional não cadastrado");

    const overlapping = await this.repository.findOverlapping(
      data.profissional_id,
      data.inicio,
      data.fim
    );
    if (overlapping.length > 0) {
      throw new Error("Já existe um bloqueio de agenda cadastrado para este profissional neste período");
    }

    return await this.repository.create({
      profissional_id: data.profissional_id,
      inicio: data.inicio,
      fim: data.fim,
      motivo: data.motivo,
    });
  }

  async update(id: string, data: Partial<BloqueioAgenda>): Promise<BloqueioAgenda> {
    const existing = await this.repository.find(id);
    if (!existing) throw new Error("Bloqueio de agenda não encontrado");

    const merged = { ...existing, ...data };

    const start = new Date(merged.inicio);
    const end = new Date(merged.fim);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Formato de data/hora inválido para início ou término");
    }

    if (start >= end) {
      throw new Error("Horário de início deve ser anterior ao de término");
    }

    if (data.profissional_id) {
      const professional = await this.profissionalRepo.find(data.profissional_id);
      if (!professional) throw new Error("Profissional não cadastrado");
    }

    const overlapping = await this.repository.findOverlapping(
      merged.profissional_id,
      merged.inicio,
      merged.fim,
      id
    );
    if (overlapping.length > 0) {
      throw new Error("Já existe um bloqueio de agenda cadastrado para este profissional neste período");
    }

    const updateData: Partial<BloqueioAgenda> = {};
    if (data.profissional_id !== undefined) updateData.profissional_id = data.profissional_id;
    if (data.inicio !== undefined) updateData.inicio = data.inicio;
    if (data.fim !== undefined) updateData.fim = data.fim;
    if (data.motivo !== undefined) updateData.motivo = data.motivo;

    return await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.repository.find(id);
    if (!existing) throw new Error("Bloqueio de agenda não encontrado");
    return await this.repository.delete(id);
  }
}
