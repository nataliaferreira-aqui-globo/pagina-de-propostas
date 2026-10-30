# ☀️ Estudo Comportamental e Estatístico — Página de Propostas (Setembro & Outubro 2026)

Cruzamento do estudo histórico de Setembro/2026 (Natália Ferreira) com a extração completa de eventos do Mixpanel no DuckDB (`01/10/2026 a 20/10/2026`, cobrindo o período pré e pós-virada do **Fluxo Deslogado em 15/10/2026**).

---

## 1. Síntese dos Achados de Setembro (Baseline Validado)

1. **Padrão Líder de Vendas (Janela de 0–1 Dia):**
   - Em **9 dos 11 dias de pico de vendas**, o evento de **Proposta Baixada (`proposal_downloaded`)** esteve elevado no mesmo dia (`D0`) ou no dia anterior (`D-1`).
   - Os casos mais expressivos (`01/set`, `22–24/set` e `25/set`) comprovam que o usuário baixa a proposta e aprova o pagamento no mesmo dia ou no dia seguinte (**ciclo de decisão curto**).
2. **Sazonalidade Estritamente B2B (Dias Úteis vs. Fim de Semana):**
   - Nos fins de semana (sábado e domingo), tanto propostas baixadas quanto pagamentos aprovados colapsam para `0–4` ocorrências, confirmando rito de aprovação empresarial/comercial.
3. **Impacto Direto no Ticket Médio (+20% na Média, até +279% nos Picos):**
   - **Ticket Médio — Usuários que baixaram proposta:** **~R$ 2.933**
   - **Ticket Médio — Todos os usuários:** **~R$ 2.439**
   - **Diferença estimada:** **+20% a favor de quem baixou a proposta** (aparecendo em ~62% dos dias com dados disponíveis e variando entre **+11% e +279%** nos dias de maior volume de pagamentos aprovados).

---

## 2. Evolução em Outubro/2026 e Impacto do Fluxo Deslogado (15/10)

### Volume Acumulado (Últimos 90 dias vs. Outubro `01/10 a 20/10`)
| Evento Mixpanel | Eventos (90d) | Usuários Únicos (90d) | Eventos Outubro (`01–20/10`) | Usuários Únicos Outubro | Taxa de Retenção/Ação |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `proposal_viewed` | 1.981 | 440 | **1.135** | **316** | 3,59 views por usuário |
| `proposal_downloaded` | 1.158 | 369 | **601** | **213** | **53,0% dos views viram download (67,4% dos usuários!)** |
| `add_payment_info` | — | — | **1.434** | **311** | Forte correlação nos dias de pico de proposta |
| `purchase` | — | — | **512** | **130** | Pico em `19/10` (`49` compras) junto ao pico de propostas |

### Comparativo Pré vs. Pós-Fluxo Deslogado (`15/10/2026`)
- **Pré-15/10 (`01/10 a 14/10` — 14 dias):**
  - `proposal_viewed`: `791` eventos (**média de `56,5/dia`**)
  - `proposal_downloaded`: `447` eventos (**média de `31,9/dia`**)
- **Pós-15/10 (`15/10 a 20/10` — 6 dias, incluindo sábado e domingo):**
  - `proposal_viewed`: `344` eventos (**média de `57,3/dia`**, e **`78,3/dia` nos dias úteis!**)
  - `proposal_downloaded`: `154` eventos (**`36,3/dia` nos dias úteis**)
  - **Recorde de Outubro em `19/10` (Segunda-feira pós-deslogado):** **`119` `proposal_viewed`** + **`55` `proposal_downloaded`** $\rightarrow$ **`147` `add_payment_info`** + **`49` `purchase`** no mesmo dia!

### Série Diária de Outubro (`01/10 a 20/10/2026`)
| Data | Dia da Semana | `proposal_viewed` | `proposal_downloaded` | `add_payment_info` | `purchase` | Observação |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `2026-10-01` | Quinta | 92 | 52 | 66 | 30 | Pico de início de mês |
| `2026-10-02` | Sexta | 79 | 49 | 36 | 24 | Alta taxa de download (62%) |
| `2026-10-03` | Sábado | 7 | 7 | 7 | 6 | Queda padrão de FDS (B2B) |
| `2026-10-04` | Domingo | 6 | 3 | 18 | 6 | Queda padrão de FDS (B2B) |
| `2026-10-05` | Segunda | 70 | 49 | 122 | 35 | Retomada forte segunda-feira |
| `2026-10-06` | Terça | 77 | 50 | 89 | 36 | — |
| `2026-10-07` | Quarta | 85 | 49 | 62 | 29 | — |
| `2026-10-08` | Quinta | 88 | 49 | 89 | 33 | — |
| `2026-10-09` | Sexta | 80 | 32 | 83 | 34 | — |
| `2026-10-10` | Sábado | 6 | 1 | 6 | 4 | Queda padrão de FDS (B2B) |
| `2026-10-11` | Domingo | 14 | 5 | 25 | 8 | Queda padrão de FDS (B2B) |
| `2026-10-12` | Segunda (Feriado) | 38 | 31 | 38 | 19 | Feriado Nacional (12/Out) |
| `2026-10-13` | Terça | 99 | 42 | 94 | 25 | Pós-feriado |
| `2026-10-14` | Quarta | 50 | 28 | 60 | 28 | Véspera da virada deslogada |
| **`2026-10-15`** | **Quinta (Virada)** | **62** | **31** | **62** | **26** | **Início do Fluxo Deslogado** |
| `2026-10-16` | Sexta | 56 | 28 | 97 | 31 | — |
| `2026-10-17` | Sábado | 11 | 3 | 32 | 12 | FDS com dobro de compras vs. FDS anteriores |
| `2026-10-18` | Domingo | 20 | 8 | 28 | 12 | FDS com dobro de compras vs. FDS anteriores |
| **`2026-10-19`** | **Segunda** | **119** | **55** | **147** | **49** | **Recorde absoluto em todas as 4 métricas!** |
| `2026-10-20` | Terça | 76 | 29 | 122 | 35 | Mantém patamar elevado de checkout |
