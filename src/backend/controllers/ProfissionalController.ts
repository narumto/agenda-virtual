import { BaseController } from "./BaseController";
import { ProfissionalService } from "../services/ProfissionalService";
import { ProfissionalResource } from "../resources/ProfissionalResource";
import { NextRequest } from "next/server";

export class ProfissionalController extends BaseController {
  private service = new ProfissionalService();

  async index(req: NextRequest) {
    try {
      const onlyActive = req.nextUrl.searchParams.get("ativo") === "true";
      const items = await this.service.list(onlyActive);
      return this.json(ProfissionalResource.collection(items));
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter profissionais", 500);
    }
  }

  async show(id: string) {
    try {
      const item = await this.service.find(id);
      if (!item) return this.error("Profissional não encontrado", 404);

      const services = await this.service.getLinkedServices(id);

      return this.json({
        ...new ProfissionalResource(item).toArray(),
        servico_ids: services,
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter profissional", 500);
    }
  }

  async store(req: NextRequest) {
    try {
      const body = await req.json();
      const prof = await this.service.create(body);
      return this.json(
        {
          message: "Profissional cadastrado com sucesso!",
          data: new ProfissionalResource(prof).toArray(),
        },
        201
      );
    } catch (e: any) {
      return this.error(e.message || "Erro ao cadastrar profissional", 400);
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const body = await req.json();
      const prof = await this.service.update(id, body);
      return this.json({
        message: "Profissional atualizado com sucesso!",
        data: new ProfissionalResource(prof).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao atualizar profissional", 400);
    }
  }

  async destroy(id: string) {
    try {
      await this.service.delete(id);
      return this.json({ message: "Profissional removido com sucesso!" });
    } catch (e: any) {
      return this.error(e.message || "Erro ao remover profissional", 400);
    }
  }
}
