import { AgendamentoRepository } from "../repositories/AgendamentoRepository";
import { PacienteRepository } from "../repositories/PacienteRepository";
import { ServicoRepository } from "../repositories/ServicoRepository";
import { BloqueioAgendaRepository } from "../repositories/BloqueioAgendaRepository";
import { ConfiguracaoService } from "./ConfiguracaoService";
import { EmailService } from "./EmailService";
import { Agendamento } from "../models/types";

export class AgendamentoService {
  private repository = new AgendamentoRepository();
  private pacienteRepo = new PacienteRepository();
  private servicoRepo = new ServicoRepository();
  private bloqueioRepo = new BloqueioAgendaRepository();
  private configService = new ConfiguracaoService();

  async list(): Promise<Agendamento[]> {
    return await this.repository.all();
  }

  async find(id: string): Promise<Agendamento | null> {
    return await this.repository.find(id);
  }

  async listByPatient(pacienteId: string): Promise<Agendamento[]> {
    return await this.repository.listByPatient(pacienteId);
  }

  async create(data: Partial<Agendamento>): Promise<Agendamento> {
    await this.validateAndPrepare(data);

    const agendamento = await this.repository.create({
      paciente_id: data.paciente_id,
      servico_id: data.servico_id,
      inicio: data.inicio,
      fim: data.fim,
      status: "PENDENTE",
      observacao: data.observacao || null,
    });

    try {
      const paciente = await this.pacienteRepo.find(agendamento.paciente_id);
      const servico = await this.servicoRepo.find(agendamento.servico_id);

      if (paciente && paciente.email) {
        const emailService = new EmailService();

        const start = new Date(agendamento.inicio);
        const formattedDate = start.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
        const formattedTime = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        await emailService.sendConfirmationEmail(
          paciente.email,
          agendamento.id,
          paciente.nome,
          servico?.nome || "Serviço",
          formattedDate,
          formattedTime
        );
      }
    } catch (err) {
      console.error("Erro ao disparar e-mail de confirmação:", err);
    }

    return agendamento;
  }

  async update(id: string, data: Partial<Agendamento>): Promise<Agendamento> {
    const existing = await this.repository.find(id);
    if (!existing) throw new Error("Agendamento não encontrado");

    const merged = { ...existing, ...data };
    await this.validateAndPrepare(merged, id);

    const updateData: Partial<Agendamento> = {};
    if (data.paciente_id !== undefined) updateData.paciente_id = data.paciente_id;
    if (data.servico_id !== undefined) updateData.servico_id = data.servico_id;
    if (data.inicio !== undefined) updateData.inicio = data.inicio;
    if (data.fim !== undefined) updateData.fim = data.fim;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.observacao !== undefined) updateData.observacao = data.observacao;

    return await this.repository.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.repository.find(id);
    if (!existing) throw new Error("Agendamento não encontrado");
    return await this.repository.delete(id);
  }

  private async validateAndPrepare(data: Partial<Agendamento>, excludeId?: string): Promise<void> {
    if (!data.paciente_id) throw new Error("paciente_id é obrigatório");
    if (!data.servico_id) throw new Error("servico_id é obrigatório");
    if (!data.inicio) throw new Error("Horário de início é obrigatório");
    if (!data.fim) throw new Error("Horário de término é obrigatório");

    const start = new Date(data.inicio);
    const end = new Date(data.fim);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Formato de data/hora inválido para início ou término");
    }

    if (start >= end) {
      throw new Error("Horário de início deve ser anterior ao de término");
    }

    const patient = await this.pacienteRepo.find(data.paciente_id);
    if (!patient) throw new Error("Paciente não cadastrado");

    const service = await this.servicoRepo.find(data.servico_id);
    if (!service) throw new Error("Serviço não cadastrado");
    if (!service.ativo) throw new Error("Este serviço não está ativo");

    const config = await this.configService.getConfig();

    const timeZone = "Europe/Lisbon";
    const getClinicTimeStr = (date: Date) => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      const hour = parts.find(p => p.type === "hour")?.value || "00";
      const minute = parts.find(p => p.type === "minute")?.value || "00";
      const second = parts.find(p => p.type === "second")?.value || "00";
      return `${hour}:${minute}:${second}`;
    };

    const getClinicDayOfWeek = (date: Date) => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      const getPart = (type: string) => Number(parts.find(p => p.type === type)?.value);
      const localDate = new Date(Date.UTC(
        getPart("year"),
        getPart("month") - 1,
        getPart("day"),
        getPart("hour"),
        getPart("minute")
      ));
      return localDate.getUTCDay();
    };

    const dayOfWeek = getClinicDayOfWeek(start);
    if (!config.dias_funcionamento.includes(dayOfWeek)) {
      throw new Error("O estabelecimento não funciona no dia selecionado");
    }

    const startStr = getClinicTimeStr(start);
    const endStr = getClinicTimeStr(end);

    if (startStr < config.hora_abertura || endStr > config.hora_fechamento) {
      throw new Error(
        `Horário solicitado (${startStr.slice(0, 5)} - ${endStr.slice(0, 5)}) está fora do horário de funcionamento (${config.hora_abertura.slice(0, 5)} às ${config.hora_fechamento.slice(0, 5)})`
      );
    }

    if (startStr < config.almoco_fim && endStr > config.almoco_inicio) {
      throw new Error(
        `O horário solicitado entra em conflito com o intervalo de almoço (${config.almoco_inicio.slice(0, 5)} às ${config.almoco_fim.slice(0, 5)})`
      );
    }
  }
}
