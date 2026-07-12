import { BaseController } from "./BaseController";
import { BloqueioAgendaService } from "../services/BloqueioAgendaService";
import { BloqueioAgendaResource } from "../resources/BloqueioAgendaResource";
import { NextRequest } from "next/server";

export class BloqueioAgendaController extends BaseController {
  private service = new BloqueioAgendaService();

  async index(req: NextRequest) {
    try {
      const profissionalId = req.nextUrl.searchParams.get("profissional_id");

      if (profissionalId) {
        const items = await this.service.listByProfessional(profissionalId);
        return this.json(BloqueioAgendaResource.collection(items));
      }

      const items = await this.service.list();
      return this.json(BloqueioAgendaResource.collection(items));
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter bloqueios de agenda", 500);
    }
  }

  async show(id: string) {
    try {
      const item = await this.service.find(id);
      if (!item) return this.error("Bloqueio de agenda não encontrado", 404);
      return this.json(new BloqueioAgendaResource(item).toArray());
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter bloqueio de agenda", 500);
    }
  }

  async store(req: NextRequest) {
    try {
      const body = await req.json();
      const item = await this.service.create(body);
      return this.json(
        {
          message: "Bloqueio de agenda cadastrado com sucesso!",
          data: new BloqueioAgendaResource(item).toArray(),
        },
        201
      );
    } catch (e: any) {
      return this.error(e.message || "Erro ao cadastrar bloqueio de agenda", 400);
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const body = await req.json();
      const item = await this.service.update(id, body);
      return this.json({
        message: "Bloqueio de agenda atualizado com sucesso!",
        data: new BloqueioAgendaResource(item).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao atualizar bloqueio de agenda", 400);
    }
  }

  async destroy(id: string) {
    try {
      await this.service.delete(id);
      return this.json({ message: "Bloqueio de agenda removido com sucesso!" });
    } catch (e: any) {
      return this.error(e.message || "Erro ao remover bloqueio de agenda", 400);
    }
  }
}
