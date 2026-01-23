# Formato de Dados Esperado pelo Webhook

O projeto aceita **dois formatos** de resposta do webhook do n8n:

## Formato 1: Array direto (Recomendado)

```json
[
  {
    "id": "1",
    "platform": "Google",
    "event_time": "2025-01-15 14:30:00",
    "gclid": "Cj0KCQiA...",
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "phone_number": "+5511987654321",
    "conversion_value": 1500,
    "currency_code": "BRL",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "ip_address": "192.168.1.100",
    "session_attributes": "utm_source=google&utm_medium=cpc",
    "attendance_number": "ATD-001",
    "campaign": "Campanha Vendas Q1",
    "ad_set": "Conjunto Principal",
    "ad": "Anúncio Promocional",
    "source_id": "SRC-G001",
    "message": "Gostaria de mais informações sobre o produto premium.",
    "whatsapp_link": "https://wa.me/5511987654321",
    "conversion": "Qualificado"
  },
  {
    "id": "2",
    "platform": "Meta",
    "event_time": "2025-01-15 13:15:00",
    "name": "Maria Santos",
    "email": "maria.santos@email.com",
    "phone_number": "+5511876543210",
    "conversion_value": 800,
    "currency_code": "BRL",
    "attendance_number": "ATD-002",
    "campaign": "Campanha Facebook Conversão",
    "ad_set": "Público Interessado",
    "ad": "Carrossel de Produtos",
    "source_id": "SRC-F001",
    "conversion": "Sem Info"
  }
]
```

## Formato 2: Objeto com propriedade "leads"

```json
{
  "leads": [
    {
      "id": "1",
      "platform": "Google",
      "event_time": "2025-01-15 14:30:00",
      "name": "João Silva",
      "phone_number": "+5511987654321",
      "attendance_number": "ATD-001",
      "campaign": "Campanha Vendas Q1",
      "ad_set": "Conjunto Principal",
      "ad": "Anúncio Promocional",
      "source_id": "SRC-G001",
      "conversion": "Qualificado"
    }
  ]
}
```

## Campos Obrigatórios

Cada lead **deve** conter os seguintes campos:

- `id` (string): Identificador único do lead
- `platform` (string): Plataforma de origem - valores aceitos: `"Google"`, `"Meta"`, `"Sem Info"`
- `event_time` (string): Data e hora do evento no formato `"YYYY-MM-DD HH:mm:ss"`
- `name` (string): Nome do lead
- `phone_number` (string): Número de telefone do lead
- `attendance_number` (string): Número de atendimento
- `campaign` (string): Nome da campanha
- `ad_set` (string): Conjunto de anúncios
- `ad` (string): Nome do anúncio
- `source_id` (string): ID da fonte
- `conversion` (string): Status da conversão - valores aceitos: `"Qualificado"`, `"Desqualificado"`, `"Sem Info"`

## Campos Opcionais

- `gclid` (string): Google Click ID
- `email` (string): Email do lead
- `gbraid` (string): Google Braid
- `wbraid` (string): WhatsApp Braid
- `conversion_value` (number): Valor da conversão
- `currency_code` (string): Código da moeda (ex: "BRL")
- `order_id` (string): ID do pedido
- `user_agent` (string): User agent do navegador
- `ip_address` (string): Endereço IP
- `session_attributes` (string): Atributos da sessão
- `ctwaclid` (string): CTWACLID
- `message` (string): Mensagem do lead
- `whatsapp_link` (string): Link do WhatsApp
- `title` (string): Título
- `thumbnail_url` (string): URL da miniatura
- `ad_url` (string): URL do anúncio
- `ad_type` (string): Tipo do anúncio

## Exemplo Mínimo

```json
[
  {
    "id": "1",
    "platform": "Google",
    "event_time": "2025-01-15 14:30:00",
    "name": "João Silva",
    "phone_number": "+5511987654321",
    "attendance_number": "ATD-001",
    "campaign": "Campanha Vendas Q1",
    "ad_set": "Conjunto Principal",
    "ad": "Anúncio Promocional",
    "source_id": "SRC-G001",
    "conversion": "Qualificado"
  }
]
```

## Requisitos da Resposta HTTP

- **Content-Type**: `application/json`
- **Status Code**: `200 OK`
- **Método**: O webhook recebe requisições `POST` (mas pode retornar dados sem usar o body da requisição)

## Erros Comuns

1. **"Formato de dados inválido"**: A resposta não é um array nem um objeto com propriedade `leads`
2. **"Resposta não é JSON válido"**: O Content-Type não é `application/json`
3. **Campos obrigatórios faltando**: Algum campo obrigatório não está presente no lead

