"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Calendar,
  Phone,
  Mail,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  AlertCircle,
  Save,
  Clock,
  ChevronDown,
  ChevronUp,
  Printer,
  Search,
  History,
  Edit,
} from "lucide-react";
import { Paciente, FichaTratamento, SessaoTratamento } from "@/types";
import { FichaTratamentoPrintable } from "./FichaTratamentoPrintable";
import { ToastContainer, ToastMessage, ToastType } from "./Toast";

interface FichaTratamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: Paciente | null;
  agendamentoId?: string;
  servicoNome?: string;
}

export function FichaTratamentoModal({
  isOpen,
  onClose,
  paciente,
  agendamentoId,
  servicoNome,
}: FichaTratamentoModalProps) {
  const [loading, setLoading] = useState(false);
  const [savingPaciente, setSavingPaciente] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Active patient & list for selection
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(paciente);
  const [pacientesList, setPacientesList] = useState<Paciente[]>([]);

  // Patient editable extra fields
  const [dataNascimento, setDataNascimento] = useState("");
  const [nif, setNif] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  // Patient's history of appointments / consultations
  const [historicoAgendamentos, setHistoricoAgendamentos] = useState<any[]>([]);

  // Fichas state
  const [fichas, setFichas] = useState<FichaTratamento[]>([]);
  const [selectedFichaId, setSelectedFichaId] = useState<string | null>(null);

  // New Ficha form state
  const [showNewFichaForm, setShowNewFichaForm] = useState(false);
  const [procedimentoZona, setProcedimentoZona] = useState("");
  const [sessoesAdquiridas, setSessoesAdquiridas] = useState(10);
  const [validadeFicha, setValidadeFicha] = useState("");
  const [obsGeraisFicha, setObsGeraisFicha] = useState("");
  const [creatingFicha, setCreatingFicha] = useState(false);

  // Edit Ficha state
  const [editingFichaId, setEditingFichaId] = useState<string | null>(null);
  const [editProcedimentoZona, setEditProcedimentoZona] = useState("");
  const [editSessoesAdquiridas, setEditSessoesAdquiridas] = useState(10);
  const [editValidadeFicha, setEditValidadeFicha] = useState("");
  const [editObsGeraisFicha, setEditObsGeraisFicha] = useState("");
  const [savingEditFicha, setSavingEditFicha] = useState(false);

  // New Session form state
  const [showNewSessaoForm, setShowNewSessaoForm] = useState(false);
  const [numSessao, setNumSessao] = useState(1);
  const [zonaTratada, setZonaTratada] = useState("");
  const [potencia, setPotencia] = useState("");
  const [ponteira, setPonteira] = useState("");
  const [obsSessao, setObsSessao] = useState("");
  const [dataSessao, setDataSessao] = useState(new Date().toISOString().split("T")[0]);
  const [savingSessao, setSavingSessao] = useState(false);

  // General notes save state for selected ficha
  const [observacoesGerais, setObservacoesGerais] = useState("");

  const formatDate = (dStr?: string | null) => {
    if (!dStr) return "";
    const match = String(dStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dStr;
    }
  };

  const formatPortuguesePhone = (phone?: string | null) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (!cleaned) return "";

    let hasCountryCode = false;
    if (cleaned.startsWith("351")) {
      cleaned = cleaned.substring(3);
      hasCountryCode = true;
    }

    if (cleaned.length > 9) {
      cleaned = cleaned.substring(0, 9);
    }

    let formatted = "";
    if (cleaned.length <= 3) {
      formatted = cleaned;
    } else if (cleaned.length <= 6) {
      formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
    } else {
      formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }

    return hasCountryCode ? `+351 ${formatted}`.trim() : formatted;
  };

  // Keep selectedPaciente in sync with prop
  useEffect(() => {
    setSelectedPaciente(paciente);
  }, [paciente]);

  // Fetch full patient data (profile, fichas, consultations) whenever selectedPaciente changes
  useEffect(() => {
    if (isOpen && selectedPaciente?.id) {
      fetchPatientData(selectedPaciente.id);
    }
  }, [isOpen, selectedPaciente?.id]);

  // Fetch list of all patients for search / dropdown selection
  useEffect(() => {
    if (isOpen) {
      fetchPacientesList();
    }
  }, [isOpen]);

  const fetchPacientesList = async () => {
    try {
      const res = await fetch("/api/pacientes");
      if (res.ok) {
        const data = await res.json();
        setPacientesList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      // silent fallback
    }
  };

  const fetchPatientData = async (pacienteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [resPaciente, resFichas, resAgendamentos] = await Promise.all([
        fetch(`/api/pacientes/${pacienteId}`).catch(() => null),
        fetch(`/api/fichas?paciente_id=${pacienteId}`).catch(() => null),
        fetch(`/api/agendamentos?paciente_id=${pacienteId}`).catch(() => null),
      ]);

      if (resPaciente && resPaciente.ok) {
        const pData = await resPaciente.json();
        if (pData) {
          setSelectedPaciente(pData);
          setDataNascimento(pData.data_nascimento ? pData.data_nascimento.split("T")[0] : "");
          setNif(pData.nif || "");
          setTelefone(formatPortuguesePhone(pData.telefone || ""));
          setEmail(pData.email || "");
        }
      }

      if (resFichas && resFichas.ok) {
        const fData: FichaTratamento[] = await resFichas.json();
        setFichas(fData);
        if (fData.length > 0) {
          setSelectedFichaId(fData[0].id);
          setObservacoesGerais(fData[0].observacoes_gerais || "");
          setZonaTratada(fData[0].procedimento_zona || servicoNome || "");
          setNumSessao((fData[0].sessoes?.length || 0) + 1);
        } else if (servicoNome) {
          setProcedimentoZona(servicoNome);
          setZonaTratada(servicoNome);
        }
      }

      if (resAgendamentos && resAgendamentos.ok) {
        const aData = await resAgendamentos.json();
        setHistoricoAgendamentos(Array.isArray(aData) ? aData : []);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do paciente.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFichas = async (pacienteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fichas?paciente_id=${pacienteId}`);
      if (!res.ok) {
        // Graceful fallback if table doesn't exist yet
        const errData = await res.json().catch(() => ({}));
        if (errData.message && errData.message.includes("Could not find the table")) {
          setError(
            "A tabela de fichas ainda não foi criada no Supabase. Por favor, execute o script 'supabase_fichas_tratamento.sql'."
          );
          setFichas([]);
          return;
        }
        throw new Error(errData.message || "Erro ao carregar fichas");
      }
      const data: FichaTratamento[] = await res.json();
      setFichas(data);
      if (data.length > 0) {
        setSelectedFichaId(data[0].id);
        setObservacoesGerais(data[0].observacoes_gerais || "");
        setZonaTratada(data[0].procedimento_zona || servicoNome || "");
        setNumSessao((data[0].sessoes?.length || 0) + 1);
      } else if (servicoNome) {
        setProcedimentoZona(servicoNome);
        setZonaTratada(servicoNome);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const currentPaciente = selectedPaciente || paciente;

  if (!isOpen || !currentPaciente) return null;

  const currentFicha = fichas.find((f) => f.id === selectedFichaId) || fichas[0];

  const handleSavePacienteData = async () => {
    if (!currentPaciente) return;
    setSavingPaciente(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const formattedPhone = formatPortuguesePhone(telefone);
      const res = await fetch(`/api/pacientes/${currentPaciente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone: formattedPhone || null,
          data_nascimento: dataNascimento || null,
          nif: nif || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao atualizar dados do paciente");
      }

      setTelefone(formattedPhone);
      setSuccessMsg("Dados do paciente salvos com sucesso!");
      addToast("success", "Dados do Paciente Salvos", "As informações foram salvas com sucesso.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
      addToast("error", "Erro ao Salvar Dados", err.message);
    } finally {
      setSavingPaciente(false);
    }
  };

  const handleCreateFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedimentoZona.trim()) {
      setError("Informe o procedimento / zona adquirida.");
      return;
    }
    setCreatingFicha(true);
    setError(null);
    try {
      const res = await fetch("/api/fichas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paciente_id: currentPaciente.id,
          procedimento_zona: procedimentoZona.trim(),
          sessoes_adquiridas: sessoesAdquiridas,
          validade: validadeFicha || null,
          observacoes_gerais: obsGeraisFicha || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao criar ficha");
      }

      const newFicha: FichaTratamento = await res.json();
      setFichas([newFicha, ...fichas]);
      setSelectedFichaId(newFicha.id);
      setObservacoesGerais(newFicha.observacoes_gerais || "");
      setZonaTratada(newFicha.procedimento_zona);
      setShowNewFichaForm(false);
      setSuccessMsg("Ficha de tratamento criada!");
      addToast("success", "Ficha Criada", `Tratamento "${procedimentoZona.trim()}" cadastrado.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
      addToast("error", "Erro ao Criar Ficha", err.message);
    } finally {
      setCreatingFicha(false);
    }
  };

  const handleStartEditFicha = (ficha: FichaTratamento) => {
    setEditingFichaId(ficha.id);
    setEditProcedimentoZona(ficha.procedimento_zona);
    setEditSessoesAdquiridas(ficha.sessoes_adquiridas);
    setEditValidadeFicha(ficha.validade ? ficha.validade.split("T")[0] : "");
    setEditObsGeraisFicha(ficha.observacoes_gerais || "");
    setShowNewFichaForm(false);
  };

  const handleSaveEditFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFichaId || !editProcedimentoZona.trim()) {
      setError("Informe o procedimento / zona.");
      return;
    }
    setSavingEditFicha(true);
    setError(null);
    try {
      const res = await fetch(`/api/fichas/${editingFichaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procedimento_zona: editProcedimentoZona.trim(),
          sessoes_adquiridas: editSessoesAdquiridas,
          validade: editValidadeFicha || null,
          observacoes_gerais: editObsGeraisFicha || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao atualizar ficha");
      }

      const updatedFicha: FichaTratamento = await res.json();

      setFichas((prev) =>
        prev.map((f) => (f.id === editingFichaId ? { ...f, ...updatedFicha } : f))
      );

      setEditingFichaId(null);
      setSuccessMsg("Ficha de tratamento atualizada!");
      addToast("success", "Ficha Atualizada", "Ficha editada com sucesso.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
      addToast("error", "Erro ao Atualizar Ficha", err.message);
    } finally {
      setSavingEditFicha(false);
    }
  };

  const handleDeleteFicha = async (fichaId: string) => {
    if (!confirm("Deseja realmente excluir esta ficha de tratamento? Todas as sessões desta ficha serão removidas.")) return;
    try {
      const res = await fetch(`/api/fichas/${fichaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir ficha.");

      const remaining = fichas.filter((f) => f.id !== fichaId);
      setFichas(remaining);
      if (selectedFichaId === fichaId) {
        setSelectedFichaId(remaining[0]?.id || null);
      }
      setSuccessMsg("Ficha excluída com sucesso.");
      addToast("info", "Ficha Excluída", "Registo de ficha removido.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
      addToast("error", "Erro ao Excluir Ficha", err.message);
    }
  };

  const handleAddSessao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFicha) {
      setError("Crie ou selecione uma ficha de procedimento antes de registrar uma sessão.");
      return;
    }
    if (!zonaTratada.trim()) {
      setError("Informe a zona tratada.");
      return;
    }
    setSavingSessao(true);
    setError(null);
    try {
      const res = await fetch(`/api/fichas/${currentFicha.id}/sessoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero_sessao: numSessao,
          zona_tratada: zonaTratada.trim(),
          potencia: potencia.trim() || null,
          ponteira: ponteira.trim() || null,
          observacoes: obsSessao.trim() || null,
          agendamento_id: agendamentoId || null,
          data_sessao: dataSessao ? new Date(dataSessao).toISOString() : new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao registrar sessão");
      }

      const newSessao: SessaoTratamento = await res.json();
      const updatedFichas = fichas.map((f) => {
        if (f.id === currentFicha.id) {
          const prevSessoes = f.sessoes || [];
          return { ...f, sessoes: [...prevSessoes, newSessao] };
        }
        return f;
      });

      setFichas(updatedFichas);
      setShowNewSessaoForm(false);
      setPotencia("");
      setPonteira("");
      setObsSessao("");
      setNumSessao((currentFicha.sessoes?.length || 0) + 2);
      setSuccessMsg("Sessão registrada com sucesso!");
      addToast("success", "Sessão Registrada", `Evolução técnica da ${numSessao}ª sessão gravada.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
      addToast("error", "Erro na Sessão", err.message);
    } finally {
      setSavingSessao(false);
    }
  };

  const handleDeleteSessao = async (sessaoId: string) => {
    if (!confirm("Deseja realmente excluir o registro desta sessão?")) return;
    try {
      const res = await fetch(`/api/fichas/${currentFicha?.id}/sessoes?sessao_id=${sessaoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Erro ao excluir sessão");
      }

      setFichas((prev) =>
        prev.map((f) => {
          if (f.id === currentFicha?.id) {
            return { ...f, sessoes: f.sessoes?.filter((s) => s.id !== sessaoId) };
          }
          return f;
        })
      );
      addToast("info", "Sessão Excluída", "O registro da sessão foi removido.");
    } catch (err: any) {
      setError(err.message);
      addToast("error", "Erro ao Excluir Sessão", err.message);
    }
  };

  const handleSaveObsGerais = async () => {
    if (!currentFicha) return;
    try {
      const res = await fetch(`/api/fichas/${currentFicha.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observacoes_gerais: observacoesGerais }),
      });

      if (!res.ok) throw new Error("Erro ao salvar observações.");

      setSuccessMsg("Observações salvas!");
      addToast("success", "Observações Salvas", "Observações gerais atualizadas.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
      addToast("error", "Erro ao Salvar Observações", err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 my-8 overflow-hidden transition-all">
        
        {/* Header Elegante (Estilo Cristiane Vasconcelos Clinic) */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-stone-100 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <Sparkles className="text-amber-400" size={24} />
            <span className="text-xs uppercase tracking-widest text-amber-300 font-medium">
              Cristiane Vasconcelos Clinic
            </span>
          </div>
          <h2 className="text-2xl font-serif font-semibold text-amber-100 tracking-wide">
            Controlo de Tratamento — Depilação a Laser
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Ficha clínica e acompanhamento de evolução técnica de sessões
          </p>
        </div>

        {/* Notifications / Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-8 max-h-[75vh] overflow-y-auto">

          {/* 0. SELETOR E BUSCA RÁPIDA DE CLIENTE */}
          {pacientesList.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/80 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <Search size={15} className="shrink-0 text-amber-700 dark:text-amber-400" />
                <span>Alternar ou Buscar Cliente:</span>
              </div>
              <select
                value={currentPaciente.id}
                onChange={(e) => {
                  const found = pacientesList.find((p) => p.id === e.target.value);
                  if (found) {
                    setSelectedPaciente(found);
                  }
                }}
                className="px-3 py-1.5 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-medium text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {pacientesList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} {p.telefone ? `(${formatPortuguesePhone(p.telefone)})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 1. DADOS DA CLIENTE (PRÉ-PREENCHIDOS) */}
          <section className="bg-stone-50 dark:bg-stone-800/50 p-5 rounded-xl border border-stone-200 dark:border-stone-700/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <User size={16} /> Dados da Cliente
              </h3>
              <button
                onClick={handleSavePacienteData}
                disabled={savingPaciente}
                className="text-xs px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Save size={14} />
                {savingPaciente ? "Salvando..." : "Salvar Dados"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Nome Completo</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-medium">
                  <User size={14} className="text-stone-400 shrink-0" />
                  <span className="truncate">{currentPaciente.nome}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Telemóvel</label>
                <div className="relative flex items-center">
                  <Phone size={14} className="absolute left-3 text-stone-400 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="ex: 912 345 678 ou +351 912 345 678"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPortuguesePhone(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">E-mail</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200">
                  <Mail size={14} className="text-stone-400 shrink-0" />
                  <span className="truncate">{email || currentPaciente.email || "Não informado"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">NIF (Opcional)</label>
                <input
                  type="text"
                  placeholder="ex: 123456789"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                />
              </div>
            </div>
          </section>

          {/* 2. PROCEDIMENTOS ADQUIRIDOS / SELEÇÃO DE FICHA */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <FileText size={16} /> Procedimentos Adquiridos
              </h3>
              <button
                onClick={() => setShowNewFichaForm(!showNewFichaForm)}
                className="text-xs px-3 py-1.5 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-900 rounded-lg transition-colors flex items-center gap-1 shadow-sm font-medium"
              >
                <Plus size={14} /> Novo Tratamento
              </button>
            </div>

            {/* Form de Nova Ficha */}
            {showNewFichaForm && (
              <form onSubmit={handleCreateFicha} className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase">Cadastrar Novo Plano/Zona</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Procedimento / Zona *</label>
                    <input
                      type="text"
                      placeholder="ex: Perfil / Percevejo / Pernas Inteiras"
                      value={procedimentoZona}
                      onChange={(e) => setProcedimentoZona(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Nº Sessões Adquiridas</label>
                    <input
                      type="number"
                      min={1}
                      value={sessoesAdquiridas}
                      onChange={(e) => setSessoesAdquiridas(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Validade (Data)</label>
                    <input
                      type="date"
                      value={validadeFicha}
                      onChange={(e) => setValidadeFicha(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewFichaForm(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200/50 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingFicha}
                    className="px-4 py-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium shadow"
                  >
                    {creatingFicha ? "Criando..." : "Salvar Ficha"}
                  </button>
                </div>
              </form>
            )}

                {/* Form de Edição de Ficha */}
                {editingFichaId && (
                  <form onSubmit={handleSaveEditFicha} className="p-4 bg-[#231F1C] text-amber-100 border border-amber-800/80 rounded-xl space-y-3 shadow-lg mb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                        <Edit size={14} /> Editar Ficha de Tratamento
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingFichaId(null)}
                        className="text-stone-400 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-300 mb-1">Procedimento / Zona *</label>
                        <input
                          type="text"
                          required
                          value={editProcedimentoZona}
                          onChange={(e) => setEditProcedimentoZona(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-300 mb-1">Nº Sessões Adquiridas</label>
                        <input
                          type="number"
                          min={1}
                          value={editSessoesAdquiridas}
                          onChange={(e) => setEditSessoesAdquiridas(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-300 mb-1">Validade (Data)</label>
                        <input
                          type="date"
                          value={editValidadeFicha}
                          onChange={(e) => setEditValidadeFicha(e.target.value)}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-300 mb-1">Observações Gerais</label>
                      <input
                        type="text"
                        placeholder="Observações do plano/tratamento..."
                        value={editObsGeraisFicha}
                        onChange={(e) => setEditObsGeraisFicha(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-xs text-amber-50"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingFichaId(null)}
                        className="px-3 py-1.5 text-xs text-stone-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingEditFicha}
                        className="px-4 py-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium shadow flex items-center gap-1.5"
                      >
                        <Save size={12} />
                        {savingEditFicha ? "Salvando..." : "Salvar Alterações"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Selector de Fichas Existentes */}
                {fichas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {fichas.map((f) => {
                      const isSelected = f.id === currentFicha?.id;
                      return (
                        <div
                          key={f.id}
                          className={`group relative rounded-xl text-xs font-medium transition-all flex items-center gap-2 border px-3 py-2 ${
                            isSelected
                              ? "bg-amber-900 text-amber-100 border-amber-800 shadow-sm"
                              : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFichaId(f.id);
                              setObservacoesGerais(f.observacoes_gerais || "");
                              setZonaTratada(f.procedimento_zona);
                              setNumSessao((f.sessoes?.length || 0) + 1);
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Sparkles size={12} className={isSelected ? "text-amber-400" : "text-stone-400"} />
                            <span>{f.procedimento_zona}</span>
                            <span className="text-[10px] opacity-75 px-1.5 py-0.5 rounded bg-black/20">
                              {f.sessoes?.length || 0}/{f.sessoes_adquiridas} sessões
                            </span>
                          </button>

                          {/* Ações da Ficha */}
                          <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditFicha(f);
                              }}
                              className="p-1 rounded hover:bg-black/20 text-amber-300 hover:text-white transition-colors cursor-pointer"
                              title="Editar Ficha"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFicha(f.id);
                              }}
                              className="p-1 rounded hover:bg-black/20 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                              title="Excluir Ficha"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    Nenhum procedimento cadastrado ainda. Clique em "Novo Tratamento" para adicionar o pacote de depilação a laser.
                  </p>
                )}
          </section>

          {/* 3. ACOMPANHAMENTO DAS SESSÕES (EVOLUÇÃO TÉCNICA) */}
          {currentFicha && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <Activity size={16} /> Acompanhamento das Sessões
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Histórico de disparos, zonas tratadas, potência e ponteira utilizada
                  </p>
                </div>
                <button
                  onClick={() => setShowNewSessaoForm(!showNewSessaoForm)}
                  className="text-xs px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors flex items-center gap-1 font-medium shadow-sm"
                >
                  <Zap size={14} /> Registrar Nova Sessão
                </button>
              </div>

              {/* Form de Nova Sessão */}
              {showNewSessaoForm && (
                <form onSubmit={handleAddSessao} className="p-4 bg-stone-100 dark:bg-stone-800/80 border border-amber-300 dark:border-amber-800 rounded-xl space-y-3 shadow-inner">
                  <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase flex items-center gap-1.5">
                    <Zap size={14} /> Registrar Evolução Técnica da Sessão
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Data da Sessão</label>
                      <input
                        type="date"
                        value={dataSessao}
                        onChange={(e) => setDataSessao(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Sessão Nº</label>
                      <input
                        type="number"
                        min={1}
                        value={numSessao}
                        onChange={(e) => setNumSessao(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Zona Tratada *</label>
                      <input
                        type="text"
                        placeholder="ex: Axilas / Buço"
                        value={zonaTratada}
                        onChange={(e) => setZonaTratada(e.target.value)}
                        required
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Potência (ex: 18 J/cm²)</label>
                      <input
                        type="text"
                        placeholder="ex: 18 J/cm² ou Nível 4"
                        value={potencia}
                        onChange={(e) => setPotencia(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Ponteira</label>
                      <input
                        type="text"
                        placeholder="ex: Spot 12mm / HR"
                        value={ponteira}
                        onChange={(e) => setPonteira(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Observações da Sessão</label>
                      <input
                        type="text"
                        placeholder="ex: Reação de eritema normal, cliente tolera bem"
                        value={obsSessao}
                        onChange={(e) => setObsSessao(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewSessaoForm(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200/50 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingSessao}
                      className="px-4 py-1.5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium shadow"
                    >
                      {savingSessao ? "Registrando..." : "Confirmar e Registrar Sessão"}
                    </button>
                  </div>
                </form>
              )}

              {/* Tabela de Sessões */}
              <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Sessão</th>
                      <th className="p-3">Zona Tratada</th>
                      <th className="p-3">Potência</th>
                      <th className="p-3">Ponteira</th>
                      <th className="p-3">Observações</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900">
                    {currentFicha.sessoes && currentFicha.sessoes.length > 0 ? (
                      currentFicha.sessoes.map((s) => (
                        <tr key={s.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="p-3 font-medium text-stone-800 dark:text-stone-200">
                            {formatDate(s.data_sessao)}
                          </td>
                          <td className="p-3 font-semibold text-amber-800 dark:text-amber-400">
                            {s.numero_sessao}ª Sessão
                          </td>
                          <td className="p-3 text-stone-700 dark:text-stone-300">{s.zona_tratada}</td>
                          <td className="p-3 font-mono text-stone-600 dark:text-stone-400">
                            {s.potencia || "—"}
                          </td>
                          <td className="p-3 text-stone-600 dark:text-stone-400">{s.ponteira || "—"}</td>
                          <td className="p-3 text-stone-500 dark:text-stone-400 max-w-xs truncate">
                            {s.observacoes || "—"}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteSessao(s.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                              title="Excluir sessão"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-stone-400 italic">
                          Nenhuma sessão registrada nesta ficha ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 4. HISTÓRICO DE CONSULTAS E AGENDAMENTOS DA CLIENTE */}
          <section className="space-y-4 border-t border-stone-200 dark:border-stone-800 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <History size={16} /> ÚLTIMAS CONSULTAS & AGENDAMENTOS
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Histórico de agendamentos na clínica (Serviço, Profissional e Estado)
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold">
                {historicoAgendamentos.length} consulta(s)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3">Serviço / Procedimento</th>
                    <th className="p-3">Profissional</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 bg-white dark:bg-stone-900">
                  {historicoAgendamentos.length > 0 ? (
                    historicoAgendamentos.map((app) => (
                      <tr key={app.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="p-3 font-medium text-stone-800 dark:text-stone-200 whitespace-nowrap">
                          {formatDate(app.inicio)}
                          {app.inicio && (
                            <span className="text-stone-400 ml-1.5 text-[11px]">
                              {new Date(app.inicio).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-stone-700 dark:text-stone-300">
                          {app.servico?.nome || "Serviço não especificado"}
                        </td>
                        <td className="p-3 text-stone-600 dark:text-stone-400">
                          {app.profissional?.nome || "—"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                              app.status === "CONCLUIDO"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : app.status === "CONFIRMADO"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                : app.status === "CANCELADO"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (app.servico?.nome) setZonaTratada(app.servico.nome);
                              if (app.inicio) setDataSessao(app.inicio.split("T")[0]);
                              setShowNewSessaoForm(true);
                            }}
                            className="px-2.5 py-1 text-[11px] bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors font-medium shadow-sm inline-flex items-center gap-1 cursor-pointer"
                            title="Usar esta consulta para preencher a nova sessão"
                          >
                            <Zap size={12} />
                            <span>Puxar p/ Sessão</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-stone-400 italic">
                        Nenhum agendamento / consulta anterior encontrado para esta cliente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. OBSERVAÇÕES GERAIS DA FICHA */}
          {currentFicha && (
            <section className="space-y-2 border-t border-stone-200 dark:border-stone-800 pt-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                  Observações Gerais da Ficha
                </label>
                <button
                  onClick={handleSaveObsGerais}
                  className="text-xs px-3 py-1 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 rounded-lg transition-colors"
                >
                  Salvar Observações
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Anotações gerais sobre o tratamento, patologias ou avisos da cliente..."
                value={observacoesGerais}
                onChange={(e) => setObservacoesGerais(e.target.value)}
                className="w-full p-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs text-stone-500">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 rounded-xl font-semibold hover:opacity-95 transition-all shadow-sm flex items-center gap-2"
          >
            <Printer size={16} />
            <span>Imprimir / Exportar Ficha Oficial (PDF)</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Concluído / Fechar
          </button>
        </div>

      </div>

      {/* Componente Oculto em Tela, Ativado Apenas no window.print() */}
      <FichaTratamentoPrintable
        paciente={{
          ...currentPaciente,
          telefone: telefone || currentPaciente.telefone,
          data_nascimento: dataNascimento || currentPaciente.data_nascimento,
          nif: nif || currentPaciente.nif,
        }}
        ficha={currentFicha}
      />
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
