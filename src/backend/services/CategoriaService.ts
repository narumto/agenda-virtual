import { CategoriaRepository } from "../repositories/CategoriaRepository";
import { Categoria } from "../models/types";

export class CategoriaService {
  private repository = new CategoriaRepository();

  async list(): Promise<Categoria[]> {
    return await this.repository.all();
  }

  async find(id: string): Promise<Categoria | null> {
    return await this.repository.find(id);
  }

  async create(data: Partial<Categoria>): Promise<Categoria> {
    if (!data.nome) throw new Error("Nome é obrigatório");
    return await this.repository.create({
      nome: data.nome,
    });
  }

  async update(id: string, data: Partial<Categoria>): Promise<Categoria> {
    const cat = await this.repository.find(id);
    if (!cat) throw new Error("Categoria não encontrada");

    const updateData: Partial<Categoria> = {};
    if (data.nome !== undefined) updateData.nome = data.nome;

    return await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const cat = await this.repository.find(id);
    if (!cat) throw new Error("Categoria não encontrada");
    return await this.repository.delete(id);
  }
}
