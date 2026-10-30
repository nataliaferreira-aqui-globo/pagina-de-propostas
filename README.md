# 📄 Projeto: Página de Propostas Unificada — Aqui Ads (`aqui.globo`)

Repositório dedicado ao diagnóstico técnico, estudo comportamental (Mixpanel/HubSpot), arquitetura de produto e prototipação da **Nova Página e PDF Unificados de Proposta Comercial** da **Aqui Ads**.

---

## 🎯 Contexto e Problema de Produto

Hoje, a experiência de Proposta Comercial na plataforma está fragmentada em **3 versões concorrentes**:
1. **Compartilhar Proposta (Web):** `https://aqui.globo/resumo/proposta/:orderId` (`SharableLink.21db1268.js`)
2. **Exportar PDF:** Gerado via `PdfGenerator.977b4886.js` (o artefato mais compartilhado internamente pelos executivos comerciais e decisores B2B, além de um 2º PDF separado para gabaritos em `techSpecsPdfGenerator.f0ef0b1e.js`).
3. **Renata-First (IA SDR):** Fluxo iniciado pela assistente de IA (`[R] proposal_...`), que conceitualmente traz a estrutura mais unificada (3 abas: *Plano de Mídia*, *Arte / Especificações Técnicas* e *Pagamento*), mas compartilha gargalos técnicos e visuais com as demais versões.

### Por que atacar a Página de Propostas é Prioridade #1 de Receita?
- **Conversão em D0 / D+1:** Em **9 dos 11 dias de pico de vendas**, o download de proposta liderou os pagamentos aprovados no mesmo dia (`D0`) ou no dia seguinte (`D+1`).
- **Ticket Médio +20% Maior:** Usuários que baixam a proposta compram com ticket médio de **~R$ 2.933** contra **~R$ 2.439** da média geral (**+20%** na mediana, chegando de **+11% a +279%** nos dias de pico).
- **Alta Adesão Pós-Fluxo Deslogado (15/10/2026):** Em outubro (`01/10 a 20/10`), foram **1.135 visualizações de proposta** e **601 downloads de PDF** (**53,0% de taxa de download**), com salto de **+8,5%/dia** após a liberação da jornada deslogada.

---

## 📂 Estrutura do Repositório

```text
Página de propostas/
├── README.md
├── docs/
│   ├── 01_DIAGNOSTICO_PANTEAO_PROPOSTAS.md        # Diagnóstico completo dos 7 agentes (Código + UX + Negócio + Specs CSV/XML/PDF)
│   ├── 02_ESTUDO_COMPORTAMENTAL_MIXPANEL.md       # Estudo estatístico Setembro + Outubro (Pré e Pós-Fluxo Deslogado 15/10)
│   └── 03_ROTEIRO_TESTES_MULTICANAL_CONDOMINIO.md # Matriz de testes de fluxo (OOH, Condomínios, Desconto Condômino, Digital, Revistas, Rádio)
├── data/
│   ├── proposal_live_data.json                    # Payload real da API da Proposta #743446 (20261021-193555-19063-6ad9141b7fb09)
│   ├── query_proposal_deep.sql                    # Query SQL (DuckDB) das métricas de propostas no Mixpanel
│   ├── query_proposal_deep_out.md                 # Resultado consolidado de eventos (90 dias + Outubro diário)
│   └── auditoria_codigo_producao/                 # Bundles de produção descompilados e auditados
│       ├── proposal_code_audit.md                 # Mapeamento linha a linha (CSV, Desconto Condômino, PDF Generator, Tech Specs)
│       ├── sharable_link_formatted.js             # Código formatado da página /resumo/proposta/:id (1.524 linhas)
│       ├── CartItem.formatted.js                  # Código formatado do Card de Item OOH/Condomínio/Digital (202 linhas)
│       ├── PdfGenerator.977b4886.js               # Motor atual de geração do PDF da Proposta
│       ├── SharableLink.21db1268.js               # Bundle original da Proposta Web / Renata-First
│       └── techSpecsPdfGenerator.f0ef0b1e.js      # Motor separado de geração do PDF de Gabaritos/Specs
├── scripts/                                       # Scripts Node.js de extração e auditoria técnica da proposta
└── prototipo/                                     # Diretório para o Protótipo Unificado (HTML/Tailwind/JS) -> GitHub Pages
```
