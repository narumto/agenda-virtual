import { BaseController } from "./BaseController";
import { PacienteService } from "../services/PacienteService";
import { PacienteResource } from "../resources/PacienteResource";
import { NextRequest } from "next/server";

export class PacienteController extends BaseController {
  private service = new PacienteService();

  async index() {
    try {
      const items = await this.service.list();
      return this.json(PacienteResource.collection(items));
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter pacientes", 500);
    }
  }

  async show(id: string) {
    try {
      const item = await this.service.find(id);
      if (!item) return this.error("Paciente não encontrado", 404);
      return this.json(new PacienteResource(item).toArray());
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter paciente", 500);
    }
  }

  async store(req: NextRequest) {
    try {
      const body = await req.json();
      const paciente = await this.service.create(body);
      return this.json(
        {
          message: "Paciente cadastrado com sucesso!",
          data: new PacienteResource(paciente).toArray(),
        },
        201
      );
    } catch (e: any) {
      return this.error(e.message || "Erro ao cadastrar paciente", 400);
    }
  }

  async update(id: string, req: NextRequest) {
    try {
      const body = await req.json();
      const paciente = await this.service.update(id, body);
      return this.json({
        message: "Paciente atualizado com sucesso!",
        data: new PacienteResource(paciente).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao atualizar paciente", 400);
    }
  }

  async destroy(id: string) {
    try {
      await this.service.delete(id);
      return this.json({ message: "Paciente removido com sucesso!" });
    } catch (e: any) {
      return this.error(e.message || "Erro ao remover paciente", 400);
    }
  }
}
