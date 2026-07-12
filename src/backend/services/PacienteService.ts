import { PacienteRepository } from "../repositories/PacienteRepository";
import { Paciente } from "../models/types";

export class PacienteService {
  private repository = new PacienteRepository();

  async list(): Promise<Paciente[]> {
    return await this.repository.all();
  }

  async find(id: string): Promise<Paciente | null> {
    return await this.repository.find(id);
  }

  async create(data: Partial<Paciente>): Promise<Paciente> {
    if (!data.nome) throw new Error("Nome é obrigatório");
    if (!data.telefone) throw new Error("Telefone é obrigatório");

    if (data.email) {
      const existing = await this.repository.findByEmail(data.email);
      if (existing) throw new Error("E-mail já cadastrado");
    }

    if (data.google_id) {
      const existing = await this.repository.findByGoogleId(data.google_id);
      if (existing) throw new Error("Google ID já cadastrado");
    }

    return await this.repository.create({
      nome: data.nome,
      telefone: data.telefone,
      email: data.email || null,
      google_id: data.google_id || null,
    });
  }

  async update(id: string, data: Partial<Paciente>): Promise<Paciente> {
    const paciente = await this.repository.find(id);
    if (!paciente) throw new Error("Paciente não encontrado");

    if (data.email && data.email !== paciente.email) {
      const existing = await this.repository.findByEmail(data.email);
      if (existing) throw new Error("E-mail já cadastrado");
    }

    if (data.google_id && data.google_id !== paciente.google_id) {
      const existing = await this.repository.findByGoogleId(data.google_id);
      if (existing) throw new Error("Google ID já cadastrado");
    }

    const updateData: Partial<Paciente> = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.google_id !== undefined) updateData.google_id = data.google_id;

    return await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const paciente = await this.repository.find(id);
    if (!paciente) throw new Error("Paciente não encontrado");
    return await this.repository.delete(id);
  }
}
