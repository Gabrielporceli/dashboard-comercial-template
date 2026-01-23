# Guia de Configuração do n8n para Retornar Todos os Leads

## Problema Atual

O webhook está retornando apenas **um lead** por vez, quando deveria retornar um **array com todos os leads**.

## Solução: Configurar o n8n para Retornar Array Completo

### Opção 1: Usando o Nó "Aggregate" ou "Set" (Recomendado)

1. **Após buscar os dados da planilha**, adicione um nó que agrupe todos os leads em um array
2. Use o nó **"Set"** ou **"Code"** para criar um array com todos os leads
3. Configure o nó de resposta para retornar esse array

#### Exemplo com Nó "Set":

1. Adicione um nó **"Set"** após buscar os dados
2. Configure:
   - **Keep Only Set Fields**: Desmarque esta opção
   - **Values**: 
     - **Name**: `leads` (ou deixe vazio se quiser retornar array direto)
     - **Value**: `{{ $json }}` (isso pega todos os itens do array anterior)

#### Exemplo com Nó "Code":

```javascript
// Se você tem múltiplos itens vindo de um loop ou split
const items = $input.all();

// Retorna array direto
return items.map(item => item.json);
```

### Opção 2: Usar "Aggregate" para Agrupar

1. Adicione um nó **"Aggregate"**
2. Configure:
   - **Aggregate**: `All Fields`
   - **Put Output In Field**: Deixe vazio ou use `leads`
   - **Keep Only Set Fields**: Desmarque

### Opção 3: Configurar o Nó de Resposta (HTTP Response / Respond to Webhook)

No nó de resposta do webhook:

1. **Response Code**: `200`
2. **Response Headers**: 
   - Adicione: `Content-Type: application/json`
3. **Response Body**: 
   - Se você tem um array de itens, use: `{{ $json }}`
   - Se você agrupou em um campo `leads`, use: `{{ $json.leads }}`
   - **IMPORTANTE**: Certifique-se de que está retornando um **array** `[...]` e não um objeto `{...}`

### Verificação no n8n

1. Execute o workflow manualmente
2. Clique no último nó (o de resposta)
3. Verifique o output - deve mostrar um array `[...]` com todos os leads
4. Se mostrar apenas um objeto `{...}`, você precisa ajustar a configuração

## Exemplo de Workflow Correto

```
[Webhook Trigger] 
    ↓
[Google Sheets - Read] (busca todos os leads)
    ↓
[Set ou Code] (agrupa em array)
    ↓
[HTTP Response] (retorna array completo)
```

## Formato Esperado na Resposta

O nó de resposta deve retornar exatamente isso:

```json
[
  {
    "id": "2",
    "platform": "Sem Info",
    "event_time": "2025-11-13 00:00:00",
    "name": "Gabriel Sem Info",
    ...
  },
  {
    "id": "3",
    "platform": "Google",
    "event_time": "2025-11-13 00:00:00",
    "name": "Gabriel Google",
    ...
  },
  {
    "id": "4",
    "platform": "Meta",
    "event_time": "2025-11-13 00:00:00",
    "name": "Gabriel Meta",
    ...
  }
]
```

**NÃO** deve retornar:
- Um objeto único: `{ "id": "2", ... }`
- Um objeto com um item: `{ "data": { "id": "2", ... } }`
- Apenas o primeiro item de um loop

## Dica: Teste o Webhook Diretamente

1. Copie a URL do webhook do n8n
2. Use uma ferramenta como Postman ou curl para testar:
   ```bash
   curl -X POST https://seu-webhook.n8n.cloud/webhook/...
   ```
3. Verifique se a resposta é um array com todos os leads

## Problema Comum: Loop Retornando um por vez

Se você tem um **loop** (Split In Batches, Loop Over Items, etc.) que processa os leads um por um, o problema é que o nó de resposta está dentro do loop ou retornando apenas o último item.

**Solução**: 
- Mova o nó de resposta **fora** do loop
- Use um nó "Aggregate" ou "Set" para coletar todos os itens antes de responder
- Configure para retornar o array completo, não itens individuais

