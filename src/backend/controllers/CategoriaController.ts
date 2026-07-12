import { BaseController } from "./BaseController";
import { CategoriaService } from "../services/CategoriaService";
import { CategoriaResource } from "../resources/CategoriaResource";
import { NextRequest } from "next/server";

export class CategoriaController extends BaseController {
  private service = new CategoriaService();

  async index() {
    try {
      const items = await this.service.list();
      return this.json(CategoriaResource.collection(items));
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter categorias", 500);
    }
  }

  async show(id: string) {
    try {
      const item = await this.service.find(id);
      if (!item) return this.error("Categoria não encontrada", 404);
      return this.json(new CategoriaResource(item).toArray());
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter categoria", 500);
    }
  }

  async store(req: NextRequest) {
    try {
      const body = await req.json();
      const cat = await this.service.create(body);
      return this.json(
        {
          message: "Categoria cadastrada com sucesso!",
          data: new CategoriaResource(cat).toArray(),
        },
        201
      );
    } catch (e: any) {
      return this.error(e.message || "Erro ao cadastrar categoria", 400);
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const body = await req.json();
      const cat = await this.service.update(id, body);
      return this.json({
        message: "Categoria atualizada com sucesso!",
        data: new CategoriaResource(cat).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao atualizar categoria", 400);
    }
  }

  async destroy(id: string) {
    try {
      await this.service.delete(id);
      return this.json({ message: "Categoria removida com sucesso!" });
    } catch (e: any) {
      return this.error(e.message || "Erro ao remover categoria", 400);
    }
  }
}
