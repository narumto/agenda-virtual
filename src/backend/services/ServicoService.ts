import { ServicoRepository } from "../repositories/ServicoRepository";
import { CategoriaRepository } from "../repositories/CategoriaRepository";
import { Servico } from "../models/types";

export class ServicoService {
  private repository = new ServicoRepository();
  private categoriaRepository = new CategoriaRepository();

  async list(onlyActive: boolean = false): Promise<Servico[]> {
    if (onlyActive) {
      return await this.repository.listActive();
    }
    return await this.repository.all();
  }

  async find(id: string): Promise<Servico | null> {
    return await this.repository.find(id);
  }

  async listByCategory(categoriaId: string): Promise<Servico[]> {
    const cat = await this.categoriaRepository.find(categoriaId);
    if (!cat) throw new Error("Categoria não encontrada");
    return await this.repository.listByCategory(categoriaId);
  }

  async create(data: Partial<Servico>): Promise<Servico> {
    if (!data.categoria_id) throw new Error("categoria_id é obrigatório");
    if (!data.nome) throw new Error("Nome é obrigatório");
    if (data.duracao_minutos === undefined || Number(data.duracao_minutos) <= 0) {
      throw new Error("duracao_minutos deve ser maior que 0");
    }
    if (data.preco === undefined || Number(data.preco) < 0) {
      throw new Error("preco não pode ser negativo");
    }

    const cat = await this.categoriaRepository.find(data.categoria_id);
    if (!cat) throw new Error("Categoria associada não existe");

    return await this.repository.create({
      categoria_id: data.categoria_id,
      nome: data.nome,
      descricao: data.descricao || null,
      foto_url: data.foto_url || null,
      duracao_minutos: Number(data.duracao_minutos),
      preco: Number(data.preco),
      ativo: data.ativo !== undefined ? Boolean(data.ativo) : true,
    });
  }

  async update(id: string, data: Partial<Servico>): Promise<Servico> {
    const s = await this.repository.find(id);
    if (!s) throw new Error("Serviço não encontrado");

    if (data.categoria_id) {
      const cat = await this.categoriaRepository.find(data.categoria_id);
      if (!cat) throw new Error("Categoria associada não existe");
    }

    const updateData: Partial<Servico> = {};
    if (data.categoria_id !== undefined) updateData.categoria_id = data.categoria_id;
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.foto_url !== undefined) updateData.foto_url = data.foto_url;
    if (data.duracao_minutos !== undefined) {
      if (Number(data.duracao_minutos) <= 0) throw new Error("duracao_minutos deve ser maior que 0");
      updateData.duracao_minutos = Number(data.duracao_minutos);
    }
    if (data.preco !== undefined) {
      if (Number(data.preco) < 0) throw new Error("preco não pode ser negativo");
      updateData.preco = Number(data.preco);
    }
    if (data.ativo !== undefined) updateData.ativo = Boolean(data.ativo);

    return await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const s = await this.repository.find(id);
    if (!s) throw new Error("Serviço não encontrado");
    return await this.repository.delete(id);
  }
}
