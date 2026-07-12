import { BaseController } from "./BaseController";
import { ConfiguracaoService } from "../services/ConfiguracaoService";
import { ConfiguracaoResource } from "../resources/ConfiguracaoResource";
import { NextRequest } from "next/server";

export class ConfiguracaoController extends BaseController {
  private service = new ConfiguracaoService();

  async show() {
    try {
      const config = await this.service.getConfig();
      return this.json(new ConfiguracaoResource(config).toArray());
    } catch (e: any) {
      return this.error(e.message || "Erro ao obter configurações", 500);
    }
  }

  async update(req: NextRequest) {
    try {
      const body = await req.json();
      const config = await this.service.updateConfig(body);
      return this.json({
        message: "Configurações atualizadas com sucesso!",
        data: new ConfiguracaoResource(config).toArray(),
      });
    } catch (e: any) {
      return this.error(e.message || "Erro ao atualizar configurações", 400);
    }
  }
}
