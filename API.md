# Documentação da API - Agenda Virtual

Esta documentação descreve todos os endpoints da API REST da Agenda Virtual, seus parâmetros, payloads de envio e estruturas de resposta para facilitar a integração com o Frontend.

---

## 🚀 Informações Gerais

- **URL Base Local:** `http://localhost:3000`
- **Prefixo da API:** `/api` (ex: `http://localhost:3000/api/pacientes`)
- **Headers Padrão:**
  - `Content-Type: application/json`

---

## 🛠️ Coleção de Testes Interativa (Postman)
Para testar a API de forma interativa, você pode importar o arquivo [agenda-virtual.postman_collection.json](./agenda-virtual.postman_collection.json) na raiz do projeto direto no seu Postman.

---

## 📌 Sumário de Endpoints

- [Configurações](#1-configurações) (`/api/configuracoes`)
- [Categorias](#2-categorias) (`/api/categorias`)
- [Serviços](#3-serviços) (`/api/servicos`)
- [Pacientes](#4-pacientes) (`/api/pacientes`)
- [Profissionais](#5-profissionais) (`/api/profissionais`)
- [Bloqueios de Agenda](#6-bloqueios-de-agenda) (`/api/bloqueios-agenda`)
- [Agendamentos](#7-agendamentos) (`/api/agendamentos`)
- [Autenticação](#8-autenticação) (`/api/auth`)
- [Redefinição de Senha](#9-redefinição-de-senha-profissional) (`/api/profissionais/...`)

---

## 1. Configurações

Gerencia o horário de funcionamento do estabelecimento e intervalo de almoço.

### Obter Configurações
Retorna as configurações vigentes (ou cria uma padrão caso não exista).

- **Método:** `GET`
- **Rota:** `/api/configuracoes`
- **Resposta Sucesso (`200 OK`):**
```json
{
  "id": true,
  "hora_abertura": "08:00:00",
  "hora_fechamento": "18:00:00",
  "almoco_inicio": "12:00:00",
  "almoco_fim": "13:00:00",
  "dias_funcionamento": [1, 2, 3, 4, 5]
}
```
> **Nota:** `dias_funcionamento` é um array de inteiros onde `0` é Domingo e `6` é Sábado.

### Atualizar Configurações
- **Método:** `PUT`
- **Rota:** `/api/configuracoes`
- **Corpo da Requisição (JSON):**
```json
{
  "hora_abertura": "08:00:00",
  "hora_fechamento": "19:00:00",
  "almoco_inicio": "12:00:00",
  "almoco_fim": "13:30:00",
  "dias_funcionamento": [1, 2, 3, 4, 5, 6]
}
```
- **Resposta Sucesso (`200 OK`):**
```json
{
  "message": "Configurações atualizadas com sucesso!",
  "data": {
    "id": true,
    "hora_abertura": "08:00:00",
    "hora_fechamento": "19:00:00",
    "almoco_inicio": "12:00:00",
    "almoco_fim": "13:30:00",
    "dias_funcionamento": [1, 2, 3, 4, 5, 6]
  }
}
```

---

## 2. Categorias

Divisão dos tipos de serviços prestados (ex: Barba, Cabelo, Estética).

### Listar Categorias
- **Método:** `GET`
- **Rota:** `/api/categorias`
- **Resposta Sucesso (`200 OK`):**
```json
[
  {
    "id": "e4a7d7bc-1b2c-3d4e-5f6g-7h8i9j0k1l2m",
    "nome": "Cabelo"
  }
]
```

### Criar Categoria
- **Método:** `POST`
- **Rota:** `/api/categorias`
- **Corpo da Requisição (JSON):**
```json
{
  "nome": "Estética Masculina"
}
```
- **Resposta Sucesso (`201 Created`):**
```json
{
  "message": "Categoria cadastrada com sucesso!",
  "data": {
    "id": "a9b8c7d6-e5f4-a3b2-c1d0-e9f8a7b6c5d4",
    "nome": "Estética Masculina"
  }
}
```

### Deletar Categoria
- **Método:** `DELETE`
- **Rota:** `/api/categorias/[id]`
- **Resposta Sucesso (`200 OK`):**
```json
{
  "message": "Categoria removida com sucesso!"
}
```

---

## 3. Serviços

### Listar Serviços
- **Método:** `GET`
- **Rota:** `/api/servicos`
- **Parâmetros de Filtro (Query String):**
  - `categoria_id` (opcional): Filtra por categoria específica.
  - `ativo` (opcional): `true` para listar apenas ativos.
- **Resposta Sucesso (`200 OK`):**
```json
[
  {
    "id": "c1f2e3d4-b5a6-7890-1234-567890abcdef",
    "categoria_id": "e4a7d7bc-1b2c-3d4e-5f6g-7h8i9j0k1l2m",
    "nome": "Corte degrade masculino",
    "descricao": "Corte de cabelo moderno com acabamento na navalha",
    "foto_url": null,
    "duracao_minutos": 30,
    "preco": 45,
    "ativo": true,
    "created_at": "2026-07-12T17:03:50.000Z",
    "updated_at": "2026-07-12T17:03:50.000Z"
  }
]
```

### Criar Serviço
- **Método:** `POST`
- **Rota:** `/api/servicos`
- **Corpo da Requisição (JSON):**
```json
{
  "categoria_id": "e4a7d7bc-1b2c-3d4e-5f6g-7h8i9j0k1l2m",
  "nome": "Corte degrade masculino",
  "descricao": "Corte de cabelo moderno",
  "duracao_minutos": 30,
  "preco": 45.00
}
```
- **Resposta Sucesso (`201 Created`):**
```json
{
  "message": "Serviço cadastrado com sucesso!",
  "data": {
    "id": "c1f2e3d4-b5a6-7890-1234-567890abcdef",
    "categoria_id": "e4a7d7bc-1b2c-3d4e-5f6g-7h8i9j0k1l2m",
    "nome": "Corte degrade masculino",
    "descricao": "Corte de cabelo moderno",
    "foto_url": null,
    "duracao_minutos": 30,
    "preco": 45,
    "ativo": true,
    "created_at": "2026-07-12T17:03:50.000Z",
    "updated_at": "2026-07-12T17:03:50.000Z"
  }
}
```

---

## 4. Pacientes

### Criar Paciente (Cadastro do Cliente)
- **Método:** `POST`
- **Rota:** `/api/pacientes`
- **Corpo da Requisição (JSON):**
```json
{
  "nome": "Carlos Cliente",
  "telefone": "11988888888",
  "email": "carlos@example.com"
}
```
- **Resposta Sucesso (`201 Created`):**
```json
{
  "message": "Paciente cadastrado com sucesso!",
  "data": {
    "id": "f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5",
    "nome": "Carlos Cliente",
    "telefone": "11988888888",
    "email": "carlos@example.com",
    "google_id": null,
    "created_at": "2026-07-12T17:03:51.000Z",
    "updated_at": "2026-07-12T17:03:51.000Z"
  }
}
```

---

## 5. Profissionais

### Criar Profissional (Com Vínculo de Serviços)
Você pode enviar uma lista de IDs de serviços que o profissional realiza no campo `servico_ids`.

- **Método:** `POST`
- **Rota:** `/api/profissionais`
- **Corpo da Requisição (JSON):**
```json
{
  "nome": "João Barbeiro",
  "telefone": "11999999999",
  "prioridade": 5,
  "email": "joao.barbeiro@example.com",
  "categoria": "funcionario",
  "status_acesso": "pendente",
  "servico_ids": [
    "c1f2e3d4-b5a6-7890-1234-567890abcdef"
  ]
}
```
- **Resposta Sucesso (`201 Created`):**
```json
{
  "message": "Profissional cadastrado com sucesso!",
  "data": {
    "id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
    "nome": "João Barbeiro",
    "telefone": "11999999999",
    "foto_url": null,
    "prioridade": 5,
    "ativo": true,
    "email": "joao.barbeiro@example.com",
    "categoria": "funcionario",
    "status_acesso": "pendente",
    "created_at": "2026-07-12T17:03:52.000Z",
    "updated_at": "2026-07-12T17:03:52.000Z"
  }
}
```

### Visualizar Profissional
Retorna os dados do profissional e o array de IDs de serviços que ele realiza em `servico_ids`.

- **Método:** `GET`
- **Rota:** `/api/profissionais/[id]`
- **Resposta Sucesso (`200 OK`):**
```json
{
  "id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
  "nome": "João Barbeiro",
  "telefone": "11999999999",
  "foto_url": null,
  "prioridade": 5,
  "ativo": true,
  "email": "joao.barbeiro@example.com",
  "categoria": "funcionario",
  "status_acesso": "pendente",
  "created_at": "2026-07-12T17:03:52.000Z",
  "updated_at": "2026-07-12T17:03:52.000Z",
  "servico_ids": [
    "c1f2e3d4-b5a6-7890-1234-567890abcdef"
  ]
}
```

### Liberação de Acesso
Atualiza o status de acesso e categoria de um profissional.

- **Método:** `PATCH`
- **Rota:** `/api/profissionais/[id]/acesso`
- **Corpo da Requisição (JSON):**
```json
{
  "status_acesso": "liberado",
  "categoria": "dono"
}
```
- **Resposta Sucesso (`200 OK`):**
```json
{
  "message": "Status de acesso updated com sucesso!",
  "data": {
    "id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
    "nome": "João Barbeiro",
    "telefone": "11999999999",
    "foto_url": null,
    "prioridade": 5,
    "ativo": true,
    "email": "joao.barbeiro@example.com",
    "categoria": "dono",
    "status_acesso": "liberado",
    "created_at": "2026-07-12T17:03:52.000Z",
    "updated_at": "2026-07-12T17:03:52.000Z"
  }
}
```

---

## 6. Bloqueios de Agenda

Define momentos em que um profissional estará indisponível (almoço extra, médico, folga).

### Criar Bloqueio
- **Método:** `POST`
- **Rota:** `/api/bloqueios-agenda`
- **Corpo da Requisição (JSON):**
```json
{
  "profissional_id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
  "inicio": "2026-07-20T10:00:00-03:00",
  "fim": "2026-07-20T11:00:00-03:00",
  "motivo": "Consulta Médica"
}
```
- **Resposta Sucesso (`201 Created`):**
```json
{
  "message": "Bloqueio de agenda cadastrado com sucesso!",
  "data": {
    "id": "b1b1b1b1-b1b1-b1b1-b1b1-b1b1-b1b1-b1b1b1b1",
    "profissional_id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
    "inicio": "2026-07-20T10:00:00-03:00",
    "fim": "2026-07-20T11:00:00-03:00",
    "motivo": "Consulta Médica"
  }
}
```

---

## 7. Agendamentos

Gerenciamento das reservas de horários.

### Listar Agendamentos
- **Método:** `GET`
- **Rota:** `/api/agendamentos`
- **Parâmetros de Filtro (Query String):**
  - `profissional_id` (opcional): Filtra agendamentos de um profissional.
  - `paciente_id` (opcional): Filtra agendamentos de um cliente/paciente.

### Criar Agendamento
- **Método:** `POST`
- **Rota:** `/api/agendamentos`
- **Corpo da Requisição (JSON):**
```json
{
  "paciente_id": "f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5",
  "profissional_id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
  "servico_id": "c1f2e3d4-b5a6-7890-1234-567890abcdef",
  "inicio": "2026-07-20T14:00:00-03:00",
  "fim": "2026-07-20T14:30:00-03:00",
  "status": "PENDENTE",
  "observacao": "Corte de cabelo com tesoura"
}
```

- **Resposta Sucesso (`201 Created`):**
```json
{
  "message": "Agendamento cadastrado com sucesso!",
  "data": {
    "id": "a1a1a1a1-a1a1-a1a1-a1a1-a1a1-a1a1-a1a1a1a1",
    "paciente_id": "f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5",
    "profissional_id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
    "servico_id": "c1f2e3d4-b5a6-7890-1234-567890abcdef",
    "inicio": "2026-07-20T14:00:00-03:00",
    "fim": "2026-07-20T14:30:00-03:00",
    "status": "PENDENTE",
    "observacao": "Corte de cabelo com tesoura",
    "created_at": "2026-07-12T17:03:54.000Z",
    "updated_at": "2026-07-12T17:03:54.000Z"
  }
}
```

---

## 🚫 Tratamento de Erros de Validação (Erros 400)

O Backend possui regras rígidas de consistência de agendamentos. Quando o frontend tenta realizar um agendamento inválido, o endpoint retorna **`400 Bad Request`** com a respectiva mensagem explicativa.

O frontend deve capturar a mensagem e exibir um alerta amigável na tela.

### Cenário A: Fora do Horário Comercial
*Ocorre quando o horário solicitado de início ou fim está fora do horário cadastrado em `Configuracoes`.*
- **Resposta (`400 Bad Request`):**
```json
{
  "message": "Horário solicitado (19:30 - 20:00) está fora do horário de funcionamento (08:00 às 18:00)"
}
```

### Cenário B: Dia sem Funcionamento
*Ocorre quando o dia da semana solicitado não está no array de `dias_funcionamento` das configurações (ex: tentar agendar em um domingo).*
- **Resposta (`400 Bad Request`):**
```json
{
  "message": "O estabelecimento não funciona no dia selecionado"
}
```

### Cenário C: Conflito com Almoço
*Ocorre quando o horário intersecta o intervalo de almoço definido nas configurações.*
- **Resposta (`400 Bad Request`):**
```json
{
  "message": "O horário solicitado entra em conflito com o intervalo de almoço (12:00 às 13:00)"
}
```

### Cenário D: Profissional Já Ocupado
*Ocorre quando o profissional já tem outro agendamento que não esteja cancelado cobrindo o mesmo horário.*
- **Resposta (`400 Bad Request`):**
```json
{
  "message": "O profissional já possui um agendamento conflitante neste horário"
}
```

### Cenário E: Agenda Bloqueada
*Ocorre quando o profissional possui um bloqueio de agenda ativo no intervalo (ex: folga).*
- **Resposta (`400 Bad Request`):**
```json
{
  "message": "A agenda do profissional está bloqueada neste horário: Consulta Médica"
}
```

---

## 8. Autenticação

### Verificação de Login Google (NextAuth)
Realiza a verificação de login integrada ao NextAuth para obter permissões de acesso do usuário. O fluxo é separado de acordo com a `role` solicitada.

- **Método:** `POST`
- **Rota:** `/api/auth/verify`
- **Corpo da Requisição (JSON):**
```json
{
  "email": "joao.barbeiro@example.com",
  "google_id": "google_joao_123",
  "nome": "João Barbeiro",
  "foto_url": "https://example.com/joao.png",
  "role": "profissional"
}
```
> **Nota:** O campo `role` é obrigatório e aceita os valores `'profissional'` ou `'paciente'`.

#### Fluxo 1: Profissional (`role: "profissional"`)
1. Busca pelo e-mail na tabela `profissionais`.
2. **Se encontrar**:
   - Se o `status_acesso` for `'pendente'`, retorna `403 Forbidden`.
   - Se for `'liberado'`, retorna os dados com `role: "profissional"`.
3. **Se não encontrar**:
   - Cria um novo registro na tabela `profissionais` com status `'pendente'` e retorna `403 Forbidden` (Login pendente de liberação).

#### Fluxo 2: Paciente (`role: "paciente"`)
1. Busca pelo e-mail na tabela `pacientes`.
2. **Se encontrar**:
   - Atualiza o `google_id` se for nulo ou diferente.
   - Retorna os dados com `role: "paciente"`.
3. **Se não encontrar**:
   - Cria um novo registro na tabela `pacientes` (telefone padrão: `""`) e retorna com `role: "paciente"`.

---

- **Resposta Sucesso - Profissional Liberado (`200 OK`):**
```json
{
  "role": "profissional",
  "data": {
    "id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
    "nome": "João Barbeiro",
    "telefone": "11999999999",
    "foto_url": "https://example.com/joao.png",
    "prioridade": 5,
    "ativo": true,
    "email": "joao.barbeiro@example.com",
    "categoria": "funcionario",
    "status_acesso": "liberado",
    "created_at": "2026-07-12T17:03:52.000Z",
    "updated_at": "2026-07-12T17:03:52.000Z"
  }
}
```
- **Resposta Sucesso - Paciente (`200 OK`):**
```json
{
  "role": "paciente",
  "data": {
    "id": "f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5",
    "nome": "Carlos Cliente",
    "telefone": "",
    "email": "carlos@example.com",
    "google_id": "google_carlos_123",
    "created_at": "2026-07-12T17:03:51.000Z",
    "updated_at": "2026-07-12T17:03:51.000Z"
  }
}
```
- **Resposta Erro - Acesso Pendente (`403 Forbidden`):**
```json
{
  "message": "Login pendente de liberação pela administração"
}
```

---

## 9. Redefinição de Senha (Profissional)

Lógica de "Esqueci minha senha" com aprovação manual pela administração (sem envio de e-mails).

### Solicitar Reset de Senha
Solicita a redefinição de senha para um profissional.

- **Método:** `POST`
- **Rota:** `/api/profissionais/esqueci-senha`
- **Corpo da Requisição (JSON):**
```json
{
  "email": "joao.barbeiro@example.com"
}
```
- **Resposta Sucesso (`200 OK`):**
```json
{
  "message": "Se o e-mail estiver cadastrado, a solicitação de reset foi enviada para a administração."
}
```
> **Nota:** Retorna sucesso genérico mesmo se o e-mail não estiver cadastrado, a fim de evitar enumeração de usuários.

### Aprovar Reset de Senha (Admin)
Aprova a solicitação de reset de senha de um profissional, alterando o status para `aprovado`.

- **Método:** `PATCH`
- **Rota:** `/api/profissionais/[id]/aprovar-reset`
- **Resposta Sucesso (`200 OK`):**
```json
{
  "message": "Reset de senha aprovado com sucesso!",
  "data": {
    "id": "e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9",
    "nome": "João Barbeiro",
    "telefone": "11999999999",
    "foto_url": null,
    "prioridade": 5,
    "ativo": true,
    "email": "joao.barbeiro@example.com",
    "categoria": "funcionario",
    "status_acesso": "liberado",
    "status_reset": "aprovado",
    "created_at": "2026-07-12T17:03:52.000Z",
    "updated_at": "2026-07-12T17:03:52.000Z"
  }
}
```

### Checar Status do Reset
Faz o pooling da liberação do reset do profissional.

- **Método:** `GET`
- **Rota:** `/api/profissionais/status-reset/[email]`
- **Resposta Sucesso (`200 OK`):**
```json
{
  "status_reset": "pendente"
}
```
> **Valores de `status_reset`:** `nenhum`, `pendente`, `aprovado`.

### Redefinir Senha
Define a nova senha do profissional (mínimo de 8 caracteres), criptografando-a no banco. Só é permitida se o `status_reset` estiver como `aprovado`.

- **Método:** `POST`
- **Rota:** `/api/profissionais/redefinir-senha`
- **Corpo da Requisição (JSON):**
```json
{
  "email": "joao.barbeiro@example.com",
  "nova_senha": "novasenhafortissima123"
}
```
- **Resposta Sucesso (`200 OK`):**
```json
{
  "message": "Senha atualizada com sucesso"
}
```
- **Resposta Erro - Não Autorizado (`403 Forbidden`):**
```json
{
  "message": "Redefinição de senha não autorizada"
}
```
