import { BaseController } from "./BaseController";
import { AgendamentoService } from "../services/AgendamentoService";
import { AgendamentoResource } from "../resources/AgendamentoResource";
import { NextRequest } from "next/server";

export class AgendamentoController extends BaseController {
  private service = new AgendamentoService();

  async index(req: NextRequest) {
    try {
      const pacienteId = req.nextUrl.searchParams.get("paciente_id");

      if (pacienteId) {
        const items = await this.service.listByPatient(pacienteId);
        return this.json(AgendamentoResource.collection(items));
      }

      const items = await this.service.list();
      return this.json(AgendamentoResource.collection(items));
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter agendamentos", 500);
    }
  }

  async show(id: string) {
    try {
      const item = await this.service.find(id);
      if (!item) return this.error("Agendamento não encontrado", 404);
      return this.json(new AgendamentoResource(item).toArray());
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter agendamento", 500);
    }
  }

  async store(req: NextRequest) {
    try {
      const body = await req.json();
      const agendamento = await this.service.create(body);
      return this.json(
        {
          message: "Agendamento cadastrado com sucesso!",
          data: new AgendamentoResource(agendamento).toArray(),
        },
        201
      );
    } catch (e: any) {
      return this.error(e.message || "Erro ao cadastrar agendamento", 400);
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const body = await req.json();
      const agendamento = await this.service.update(id, body);
      return this.json({
        message: "Agendamento atualizado com sucesso!",
        data: new AgendamentoResource(agendamento).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao atualizar agendamento", 400);
    }
  }

  async destroy(id: string) {
    try {
      await this.service.delete(id);
      return this.json({ message: "Agendamento removido com sucesso!" });
    } catch (e: any) {
      return this.error(e.message || "Erro ao remover agendamento", 400);
    }
  }
}
