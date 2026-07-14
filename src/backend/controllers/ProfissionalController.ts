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

  async updateAcesso(id: string, req: NextRequest) {
    try {
      const body = await req.json();
      const { status_acesso, categoria } = body;

      if (!status_acesso) {
        return this.error("O campo 'status_acesso' é obrigatório", 400);
      }
      if (status_acesso !== "pendente" && status_acesso !== "liberado") {
        return this.error("status_acesso inválido. Use 'pendente' ou 'liberado'", 400);
      }
      if (categoria && !["desenvolvedor", "dono", "funcionario"].includes(categoria)) {
        return this.error("categoria inválida. Use 'desenvolvedor', 'dono' ou 'funcionario'", 400);
      }

      const updated = await this.service.update(id, { status_acesso, categoria });
      return this.json({
        message: "Status de acesso atualizado com sucesso!",
        data: new ProfissionalResource(updated).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao atualizar acesso do profissional", 400);
    }
  }

  async esqueciSenha(req: NextRequest) {
    try {
      const body = await req.json();
      const { email } = body;

      if (!email) {
        return this.error("O campo 'email' é obrigatório", 400);
      }

      await this.service.solicitarReset(email);
      return this.json({
        message: "Se o e-mail estiver cadastrado, a solicitação de reset foi enviada para a administração.",
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao solicitar reset de senha", 400);
    }
  }

  async aprovarReset(id: string, req: NextRequest) {
    try {
      const updated = await this.service.aprovarReset(id);
      return this.json({
        message: "Reset de senha aprovado com sucesso!",
        data: new ProfissionalResource(updated).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao aprovar reset de senha", 400);
    }
  }

  async statusReset(email: string) {
    try {
      const status = await this.service.checkResetStatus(email);
      if (status === null) {
        return this.error("Profissional não encontrado", 404);
      }
      return this.json({ status_reset: status });
    } catch (e: any) {
      return this.error(e.message || "Erro ao verificar status de reset", 400);
    }
  }

  async redefinirSenha(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, nova_senha } = body;

      if (!email) {
        return this.error("O campo 'email' é obrigatório", 400);
      }
      if (!nova_senha) {
        return this.error("O campo 'nova_senha' é obrigatório", 400);
      }

      await this.service.redefinirSenha(email, nova_senha);
      return this.json({
        message: "Senha atualizada com sucesso",
      });
    } catch (e: any) {
      if (e.status === 403) {
        return this.error(e.message, 403);
      }
      return this.error(e.message || "Erro ao redefinir senha", 400);
    }
  }
}
