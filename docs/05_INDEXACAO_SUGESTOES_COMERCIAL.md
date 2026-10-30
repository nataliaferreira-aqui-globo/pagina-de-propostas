# 🗂️ Indexação de Sugestões — Time Comercial (Aqui Ads)

Documento vivo para indexar, classificar e cruzar os feedbacks do time comercial com o escopo da **Página de Propostas** vs. **Backlog do Construtor de Mídia (Aba OOH / Plataforma)**.

---

## Lote 1 — Pietra Vendramin (14/10 · Aba OOH)
- **Fonte:** [Thread Slack (`#C065H9CN694`)](https://eletromidia.enterprise.slack.com/archives/C065H9CN694/p1791998483225059?thread_ts=1791998483225059)

| # | Sugestão do Comercial | Onde Impacta | Escopo na **Página de Propostas** | Escopo no **Construtor (Aba OOH da Plataforma)** |
| :--- | :--- | :--- | :--- | :--- |
| **1.1** | **Exibir o código do produto**, para identificação interna e reserva de estáticos | **Proposta + Construtor + Excel** | **Aplicável já:** Exibir o código do ativo (`code` / `id`, ex.: `#10492`) discretamente no card OOH (e nas torres do condomínio) + coluna dedicada no CSV/Excel para reserva de estáticos com OPEC. | Exibir o `code` no popover do pino e no card lateral de seleção. |
| **1.2** | **Filtros de busca por nome e código** | **Proposta + Construtor** | **Aplicável já:** Indexar o campo `code` / `id` na barra de busca do `Plano de mídia` (`Buscar ponto OOH, código, rua ou bairro...`). | Permitir buscar ativos pelo código interno ou código Atlas direto no mapa de seleção. |
| **1.3** | **Geolocalização por bairro, zona e classe social** | **Construtor + Proposta** | **Parcial na Proposta:** Bairro (`district`) já indexado na busca; caso o payload traga `zone` (Zona Sul, Oeste, etc.) e `social_class` (A, AB, B), podem entrar como filtro/coluna no Excel. | **Core do Construtor:** Filtros de polígono/camadas por Bairro, Zona geográfica e Classe Social predominante no mapa de planejamento. |
| **1.4** | **Destacar em verde no mapa os pontos que já estão no plano** | **Construtor (Aba OOH)** | *Na proposta fechada, todos os pinos exibidos no mapa já fazem parte do plano.* (No nosso protótipo, os pontos com desconto condômino já usam pino verde `#059669`). | **Core do Construtor:** No mapa de inventário completo, diferenciar visualmente os pinos disponíveis (laranja/cinza) dos pinos já adicionados ao carrinho (verde). |
| **1.5** | **Botão "Selecionar todos os pontos"** (planos complexos do Atlas e edifícios multi-torres) | **Construtor (Aba OOH)** | *Na proposta, os pontos já vêm selecionados e as torres agrupadas em `Coletânea Condomínio`.* | **Core do Construtor:** Botão `Selecionar todos os pontos filtrados` / `Selecionar todas as torres do condomínio` em 1 clique ao montar o carrinho. |
| **1.6** | **Copiar rascunho ou plano de mídia**, para enviar cenários diferentes sem refazer | **Proposta + Meus Planos** | **Aplicável como ação de topo/header:** Botão `Duplicar proposta (Criar cenário)` para que o comercial clone o plano atual e gere Cenário A / Cenário B sem refazer do zero. | Botão `Duplicar rascunho` na listagem de planos salvos / carrinho. |
| **1.7** | **Excel melhorado, com valor líquido para quem trata com agência** | **Proposta (Exportação)** | **Aplicável já:** Evoluir a exportação de planilha (`Exportar planilha CSV / Excel`) incluindo: `Código do Produto`, `Canal`, `Categoria`, `Ativo`, `Bairro/Cidade/UF`, `Telas/Formato`, `Inserções`, `Valor Bruto (Tabela)`, `Descontos (Condômino/Cupom)` e **`Valor Líquido (Net / Agência)`**. | Mesma estrutura de exportação disponível antes de gerar o link final. |
