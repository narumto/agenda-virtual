import { BaseController } from "./BaseController";
import { ServicoService } from "../services/ServicoService";
import { ServicoResource } from "../resources/ServicoResource";
import { NextRequest } from "next/server";

export class ServicoController extends BaseController {
  private service = new ServicoService();

  async index(req: NextRequest) {
    try {
      const categoriaId = req.nextUrl.searchParams.get("categoria_id");
      const onlyActive = req.nextUrl.searchParams.get("ativo") === "true";

      if (categoriaId) {
        const items = await this.service.listByCategory(categoriaId);
        return this.json(ServicoResource.collection(items));
      }

      const items = await this.service.list(onlyActive);
      return this.json(ServicoResource.collection(items));
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter serviços", 500);
    }
  }

  async show(id: string) {
    try {
      const item = await this.service.find(id);
      if (!item) return this.error("Serviço não encontrado", 404);
      return this.json(new ServicoResource(item).toArray());
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter serviço", 500);
    }
  }

  async store(req: NextRequest) {
    try {
      const body = await req.json();
      const servico = await this.service.create(body);
      return this.json(
        {
          message: "Serviço cadastrado com sucesso!",
          data: new ServicoResource(servico).toArray(),
        },
        201
      );
    } catch (e: any) {
      return this.error(e.message || "Erro ao cadastrar serviço", 400);
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const body = await req.json();
      const servico = await this.service.update(id, body);
      return this.json({
        message: "Serviço atualizado com sucesso!",
        data: new ServicoResource(servico).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao atualizar serviço", 400);
    }
  }

  async destroy(id: string) {
    try {
      await this.service.delete(id);
      return this.json({ message: "Serviço removido com sucesso!" });
    } catch (e: any) {
      return this.error(e.message || "Erro ao remover serviço", 400);
    }
  }
}
