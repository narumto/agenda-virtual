"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
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
  Printer,
  History,
  ChevronRight,
  RefreshCw,
  Calendar,
  Edit,
  X,
} from "lucide-react";
import { Paciente, FichaTratamento, SessaoTratamento } from "@/types";
import { FichaTratamentoPrintable } from "./FichaTratamentoPrintable";

interface FichaTratamentoManagerProps {
  initialPacienteId?: string;
  onSelectPaciente?: (paciente: Paciente) => void;
}

export function FichaTratamentoManager({
  initialPacienteId,
  onSelectPaciente,
}: FichaTratamentoManagerProps) {
  // Patients list & search state
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(
    initialPacienteId || null
  );

  // Active Patient detail state
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [savingPaciente, setSavingPaciente] = useState(false);

  // Editable patient fields
  const [dataNascimento, setDataNascimento] = useState("");
  const [nif, setNif] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  // Patient history and fichas
  const [fichas, setFichas] = useState<FichaTratamento[]>([]);
  const [selectedFichaId, setSelectedFichaId] = useState<string | null>(null);
  const [historicoAgendamentos, setHistoricoAgendamentos] = useState<any[]>([]);

  // Notifications
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Fetch all patients on component mount
  useEffect(() => {
    fetchPacientes();
  }, []);

  // Sync initialPacienteId if passed
  useEffect(() => {
    if (initialPacienteId) {
      setSelectedPacienteId(initialPacienteId);
    }
  }, [initialPacienteId]);

  // Fetch full details whenever selectedPacienteId changes
  useEffect(() => {
    if (selectedPacienteId) {
      fetchPatientData(selectedPacienteId);
    } else {
      setSelectedPaciente(null);
      setFichas([]);
      setHistoricoAgendamentos([]);
    }
  }, [selectedPacienteId]);

  const fetchPacientes = async () => {
    setLoadingPacientes(true);
    try {
      const res = await fetch("/api/pacientes");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setPacientes(list);
        if (!selectedPacienteId && list.length > 0) {
          setSelectedPacienteId(list[0].id);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar lista de pacientes", e);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const fetchPatientData = async (pacienteId: string) => {
    setLoadingPatientData(true);
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
          if (onSelectPaciente) onSelectPaciente(pData);
        }
      }

      if (resFichas && resFichas.ok) {
        const fData: FichaTratamento[] = await resFichas.json();
        setFichas(fData);
        if (fData.length > 0) {
          setSelectedFichaId(fData[0].id);
          setObservacoesGerais(fData[0].observacoes_gerais || "");
          setZonaTratada(fData[0].procedimento_zona);
          setNumSessao((fData[0].sessoes?.length || 0) + 1);
        } else {
          setSelectedFichaId(null);
          setObservacoesGerais("");
        }
      }

      if (resAgendamentos && resAgendamentos.ok) {
        const aData = await resAgendamentos.json();
        setHistoricoAgendamentos(Array.isArray(aData) ? aData : []);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do paciente.");
    } finally {
      setLoadingPatientData(false);
    }
  };

  const handleSavePacienteData = async () => {
    if (!selectedPaciente) return;
    setSavingPaciente(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const formattedPhone = formatPortuguesePhone(telefone);
      const res = await fetch(`/api/pacientes/${selectedPaciente.id}`, {
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
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingPaciente(false);
    }
  };

  const handleCreateFicha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaciente) return;
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
          paciente_id: selectedPaciente.id,
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
      setSuccessMsg("Ficha de tratamento criada com sucesso!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
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
      setSuccessMsg("Ficha de tratamento atualizada com sucesso!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
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
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const currentFicha = fichas.find((f) => f.id === selectedFichaId) || fichas[0];

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
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter patients by search query
  const filteredPacientes = pacientes.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.nome.toLowerCase().includes(q) ||
      (p.telefone && p.telefone.includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.nif && p.nif.includes(q))
    );
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">

      {/* PAINEL LATERAL DE BUSCA DE PACIENTES */}
      <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <User className="text-amber-700 dark:text-amber-400" size={18} />
            <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              Clientes Cadastrados
            </h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 font-semibold text-stone-600 dark:text-stone-400">
            {filteredPacientes.length}
          </span>
        </div>

        {/* Campo de Busca de Paciente */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-2.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar por Nome, Telemóvel ou NIF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
          />
        </div>

        {/* Lista de Pacientes */}
        <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-1 flex-1">
          {loadingPacientes ? (
            <div className="p-6 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              <span>Carregando lista de clientes...</span>
            </div>
          ) : filteredPacientes.length > 0 ? (
            filteredPacientes.map((p) => {
              const isSelected = p.id === selectedPacienteId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPacienteId(p.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                    isSelected
                      ? "bg-amber-950 text-amber-100 border-amber-800 shadow-sm"
                      : "bg-white dark:bg-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200/70 dark:border-stone-800"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs truncate">{p.nome}</div>
                    <div className={`text-[11px] mt-0.5 ${isSelected ? "text-amber-300" : "text-stone-400"}`}>
                      {p.telefone ? formatPortuguesePhone(p.telefone) : "Sem telefone"}
                    </div>
                  </div>
                  <ChevronRight size={14} className={`shrink-0 ${isSelected ? "text-amber-400" : "text-stone-400"}`} />
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-stone-400 italic">
              Nenhum cliente encontrado com "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      {/* PAINEL PRINCIPAL DE GESTÃO DA FICHA DO PACIENTE */}
      <div className="flex-1 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col">
        {selectedPaciente ? (
          <>
            {/* Header da Ficha (Estilo Clinic) */}
            <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-stone-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="text-amber-400" size={20} />
                  <span className="text-xs uppercase tracking-widest text-amber-300 font-medium">
                    Cristiane Vasconcelos Clinic
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-amber-100">
                  Ficha Clínica — {selectedPaciente.nome}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Controlo técnico de sessões e histórico oficial do tratamento
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 rounded-xl text-xs font-semibold hover:opacity-95 transition-all shadow flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={16} />
                  <span>Imprimir Ficha Oficial (PDF)</span>
                </button>
              </div>
            </div>

            {/* Alertas */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Conteúdo Principal Scrollável */}
            <div className="p-6 space-y-8 overflow-y-auto flex-1">

              {/* 1. DADOS DA CLIENTE */}
              <section className="bg-stone-50 dark:bg-stone-800/50 p-5 rounded-xl border border-stone-200 dark:border-stone-700/60">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <User size={15} /> Dados Pessoais da Cliente
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
                      <span className="truncate">{selectedPaciente.nome}</span>
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
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">E-mail</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200">
                      <Mail size={14} className="text-stone-400 shrink-0" />
                      <span className="truncate">{email || selectedPaciente.email || "Não informado"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">NIF (Opcional)</label>
                    <input
                      type="text"
                      placeholder="ex: 123456789"
                      value={nif}
                      onChange={(e) => setNif(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* 2. PROCEDIMENTOS ADQUIRIDOS / FICHA */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <FileText size={15} /> Procedimentos / Fichas Adquiridas
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
                    <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase">Cadastrar Novo Plano / Zona</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Procedimento / Zona *</label>
                        <input
                          type="text"
                          placeholder="ex: Perfil / percevejo / Pernas Inteiras"
                          value={procedimentoZona}
                          onChange={(e) => setProcedimentoZona(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Nº Sessões Adquiridas</label>
                        <input
                          type="number"
                          min={1}
                          value={sessoesAdquiridas}
                          onChange={(e) => setSessoesAdquiridas(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Validade (Data)</label>
                        <input
                          type="date"
                          value={validadeFicha}
                          onChange={(e) => setValidadeFicha(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
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
                        {savingEditFicha ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                        {savingEditFicha ? "Salvando..." : "Salvar Alterações"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de Fichas */}
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
                    Nenhum procedimento cadastrado para esta cliente ainda. Clique em "Novo Tratamento" para iniciar.
                  </p>
                )}
              </section>

              {/* 3. EVOLUÇÃO TÉCNICA DAS SESSÕES */}
              {currentFicha && (
                <section className="space-y-4 border-t border-stone-200 dark:border-stone-800 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                        <Activity size={15} /> Acompanhamento de Sessões (Evolução Técnica)
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Histórico de disparos, potência e ponteiras da ficha selecionada
                      </p>
                    </div>
                    <button
                      onClick={() => setShowNewSessaoForm(!showNewSessaoForm)}
                      className="text-xs px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors flex items-center gap-1 font-medium shadow-sm"
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
                            className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Sessão Nº</label>
                          <input
                            type="number"
                            min={1}
                            value={numSessao}
                            onChange={(e) => setNumSessao(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-semibold"
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
                            className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Potência (ex: 18 J/cm²)</label>
                          <input
                            type="text"
                            placeholder="ex: 18 J/cm² ou Nível 4"
                            value={potencia}
                            onChange={(e) => setPotencia(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
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
                            className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">Observações da Sessão</label>
                          <input
                            type="text"
                            placeholder="ex: Reação eritematosa suave, boa tolerância"
                            value={obsSessao}
                            onChange={(e) => setObsSessao(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
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
                          {savingSessao ? "Registrando..." : "Confirmar Sessão"}
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

              {/* 4. HISTÓRICO DE CONSULTAS E AGENDAMENTOS */}
              <section className="space-y-4 border-t border-stone-200 dark:border-stone-800 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-2">
                      <History size={15} /> Últimas Consultas & Agendamentos na Clínica
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Histórico geral do cliente (Serviço, Profissional e Estado)
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
                            Nenhum agendamento registrado para esta cliente.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 5. OBSERVAÇÕES GERAIS DA FICHA */}
              {currentFicha && (
                <section className="space-y-2 border-t border-stone-200 dark:border-stone-800 pt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      Observações Gerais da Ficha
                    </label>
                    <button
                      onClick={handleSaveObsGerais}
                      className="text-xs px-3 py-1 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 rounded-lg transition-colors cursor-pointer"
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-stone-400 space-y-3">
            <User size={48} className="text-stone-300 stroke-1" />
            <h3 className="text-base font-semibold text-stone-600 dark:text-stone-300">
              Nenhum cliente selecionado
            </h3>
            <p className="text-xs max-w-sm">
              Selecione um cliente na lista à esquerda ou utilize a barra de pesquisa para visualizar, gerenciar e imprimir a ficha clínica oficial.
            </p>
          </div>
        )}
      </div>

      {/* Componente Oculto de Impressão (Ativado apenas no window.print()) */}
      {selectedPaciente && (
        <FichaTratamentoPrintable
          paciente={{
            ...selectedPaciente,
            telefone: telefone || selectedPaciente.telefone,
            data_nascimento: dataNascimento || selectedPaciente.data_nascimento,
            nif: nif || selectedPaciente.nif,
          }}
          ficha={currentFicha}
        />
      )}

    </div>
  );
}
