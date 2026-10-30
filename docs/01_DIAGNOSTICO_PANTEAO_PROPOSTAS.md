# 🏛️ Diagnóstico Completo do Panteão — Unificação da Página de Propostas e PDF

**Data da Análise:** 21/10/2026  
**Proposta Real Auditada:** [`https://aqui.globo/resumo/proposta/20261021-193555-19063-6ad9141b7fb09`](https://aqui.globo/resumo/proposta/20261021-193555-19063-6ad9141b7fb09) (**Pedido `#743446`** — *Natalia Ferreira* — **R$ 2.881,10** — 14 dias — 2 pontos no Itaim Bibi: *Black Jack Barber Shop* e *Faria Lima Financial Center - Premium*).

---

## 1. 🔨 Hefesto & 🦉 Atena: Autópsia Técnica das 3 Versões Atuais

A auditoria direta nos bundles de produção (`SharableLink.21db1268.js`, `CartItem.9e4ad0c5.js`, `PdfGenerator.977b4886.js`, `campaign-to-csv.7509ada8.js`, `condominiumDiscountHelper.11843836.js` e `techSpecsPdfGenerator.f0ef0b1e.js`) revelou **6 bugs e divergências estruturais graves**:

### 🚨 Bug #1: Divergência de Inserções por Dia x Total (Web vs. PDF e Topo vs. Tabela)
1. **Omissão na Web (`CartItem.9e4ad0c5.js`):**
   - Os cards da página web exibem apenas `period_insertions` (total do período: `720` e `34.320`), **sem exibir Inserções por Dia**.
   - A propriedade `screens` (`13 telas` no *Faria Lima Financial Center*) **não existe nas `props` do componente `CartItem`** (linhas 60–92 de `CartItem.formatted.js`). O cliente vê o preço de `R$ 2.687,10` na Web sem saber que está levando **13 telas** (informação que só aparece na coluna `Telas` do PDF).
   - **Erro de Tooltip (Linha 159 de `CartItem.formatted.js`):** O chip de `period_insertions` (ícone de olho `uil-eye`) usa o tooltip `e.midiaToolTipText.Alcance`, rotulando erroneamente **Exibições** como **Alcance**.
2. **Conta de Exibições Diárias no PDF (Linha 3164 de `PdfGenerator.977b4886.js`):**
   - O PDF calcula `Exibições Diária = Math.floor(period_insertions / duration)`.
   - Na proposta `#743446` (`14 dias`), para o *Faria Lima Financial Center* (`34.320` exibições), o PDF imprime `2.451/dia`, mas `2.451 * 14 = 34.314 != 34.320` (pois edifícios comerciais operam por ciclo de dias úteis/telas, `13 telas * 220 inserções * 12 dias = 34.320`).
3. **Divergência entre o Topo da Proposta e a Soma dos Itens (Payload `proposal_live_data.json`):**
   - Soma real de `period_insertions` dos 2 itens: `720 + 34.320 = 35.040 exibições`.
   - Valor gravado em `items_summary.total_insertions` e `metrics.insertions` (exibido no Card de Métricas do topo): **`31.872 exibições` (`32 mil`)**.
   - Quando o comprador B2B ou executivo soma a tabela do PDF (`35.040`), o número diverge em **3.168 exibições** do cabeçalho (`31.872`).

---

### 🚨 Bug #2: Exportação CSV Trancada para Clientes (`is_master`) e Incompleta + Ausência de XML
1. **Bloqueio de permissão na UI (Linha 1474 de `sharable_link_formatted.js`):**
   - O menu dropdown `exportar` (que contém `Baixar planilha` e `Baixar PDF`) exige `e.UserStore.is_master === true`.
   - Clientes externos, agências e usuários deslogados veem apenas o botão `baixar pdf` — **não conseguem exportar CSV**.
2. **Função CSV limitada a 4 colunas de OOH (Linha 2717 de `proposal_code_audit.md` / `campaign-to-csv.7509ada8.js`):**
   ```javascript
   function xs(l){
     const t=l?.items||[], s=l?.name, e=zt();
     e.header(["Ponto","Endereço","Vertical","Telas"]),
     t.map(d=>e.row([d.properties?.name||"", `${d.properties?.address||""}, ${d.properties?.number||""}`, d.properties?.vertical||"", d.properties?.screens||""])),
     qt(e,s,"locais_")
   }
   ```
   - **Gaps críticos:** Não exporta **Inserções/Dia**, **Inserções Totais**, **Alcance**, **Formato/Dimensão**, **Preço Bruto**, **Desconto**, **Preço Final**, **Datas da Campanha** e gera linhas vazias `, , , ` para produtos **Digital Globo, Revistas Digitais e Rádio**. Não existe exportação **XML**.

---

### 🚨 Bug #3: Quebra das Especificações Técnicas no PDF Principal e Duplicidade de Motores PDF
- Na aba **`Arte`** da Web (`SharableLinkTabArt`), as especificações são montadas dinamicamente via `FormatsEnum.3b8d46b3.js` e exportadas num 2º PDF em Retrato (`techSpecsPdfGenerator.f0ef0b1e.js`), que só habilita o botão após marcar checkboxes.
- Já o PDF principal da Proposta (`PdfGenerator.977b4886.js`, em Paisagem) usa um dicionário estático `PA` (linhas 2775–2836) com apenas 15 modelos hardcoded.
- Quando um formato retorna `"Desconhecido"` na função `He()` (linha 2840), o PDF imprime na linha 3370 a mensagem:
  > *"No momento, a pré-visualização de todos os formatos ainda não está disponível neste PDF. Confira as especificações técnicas completas no botão abaixo..."* (dentro de um PDF estático onde não existe botão abaixo).

---

### 🚨 Bug #4: Divergências de Mapa (Desktop vs. Mobile vs. PDF vs. Multicanal)
1. **Mapa invisível no Mobile:** Na linha 1069 de `sharable_link_formatted.js`, o container do mapa tem a classe `hidden lg:block lg:w-1/2`. Quem abre o link da proposta no celular perde 100% da visualização geográfica.
2. **Modal Tapume ativo na rota da proposta:** O HTML de `/resumo/proposta/:id` carrega `Tapume.e9bc25b6.js` (*"Sua experiência é mais completa no computador"*), bloqueando decisores que abrem o link via WhatsApp no smartphone.
3. **Sem Mapa no PDF:** Na linha 3068 de `PdfGenerator.977b4886.js`, a função `Ce(A)` desenha apenas um botão preto `"ver mapa"` com link externo, sem renderizar a imagem estática do mapa com os pontos selecionados.
4. **Centro do Mapa e Multicanal:** `mapCenter` (linha 1007) ancora apenas no 1º item OOH do array em vez de aplicar `fitBounds` em todos os pontos, e não exibe indicação visual de cobertura/praça quando há produtos **Digital Globo, Revistas ou Rádio**.

---

### 🚨 Bug #5: Condomínios Agrupados (`OohCartItemGroup`) e Desconto de Condômino
1. **Seta de expandir torres de condomínio NÃO APARECE NO MOBILE:**
   - Em `CartItem.formatted.js` (linhas 96 e 197), o slot `right-action-bar` (usado pelo `OohCartItemGroup` para renderizar a seta `uil-angle-down` que abre as demais torres do condomínio) está condicionado a `canShowRemoveButton`, que exige `isDesktop === true` (`I = g(() => x.value && (u.value || v.value))`).
   - Resultado: **no celular é impossível expandir as torres de um condomínio na página de proposta**, e o card fechado mostra apenas os dados da 1ª torre!
2. **Omissão de Subtotal e Desconto no PDF:**
   - No resumo financeiro do PDF (`ge`, linhas 3011–3031 de `PdfGenerator.977b4886.js`), é impressa apenas a linha `Total`, omitindo o `Subtotal` e o valor economizado via **Desconto de Condômino** ou **Cupom**.

---

### 🚨 Bug #6: Confusão Visual e de Faturamento em Carrinhos Multicanal (OOH + Digital + Revistas + Rádio)
1. **Grid de Métricas Heterogêneo (Linhas 1489–1496 de `sharable_link_formatted.js`):**
   - Mistura até 5 colunas lado a lado com unidades incompatíveis (`inserções/semana` em Rádio vs. `impressões` no período em Digital vs. `Exibições / Alcance / Impacto / Frequência` em OOH).
2. **Revistas Digitais ocultas dentro de "Digital":**
   - Títulos premium da Editora Globo (`PEGN`, `Época Negócios`, `Valor Econômico`, `Marie Claire`, `Casa e Jardim`, `Autoesporte`, `Globo Rural`, `Galileu`, `Quem`) são tratados apenas como tags de cor dentro do card genérico de `Digital` (linhas 528–529).
3. **Divergência de Total quando há Rádio + Bloqueio de Pagamento Deslogado (Linhas 1147–1161):**
   - O topo da proposta soma Rádio no `Investimento Total`, mas a aba `Pagamento` exclui Rádio do checkout (*"Rádio tem um processo de faturamento à parte"*).
   - Além disso, propostas geradas no **Fluxo Deslogado** (sem `addressId / billing_id` prévio) exibem na aba Pagamento o bloqueio *"Pagamento indisponível. Para liberar o pagamento, o responsável pela conta precisa cadastrar os dados de faturamento"*, impedindo que o receptor do link preencha o CNPJ e pague na hora.

---

## 2. 📐 Dédalo, 🪽 Hermes & 🔨 Hefesto: Arquitetura da Página Unificada ("One Proposal Engine")

### A. Estrutura Visual Unificada (Evolução do Modelo Renata-First)
- **Header Executivo Fixo:**
  - Identificação clara da Proposta (`#ID`, Nome da Campanha, Período, Duração em dias/semanas, Criado por Executivo/Cliente).
  - Menu **`Exportar ▾` liberado para 100% dos usuários** (internos e externos) com 3 opções: **PDF Completo**, **Planilha CSV (Excel)** e **XML Estruturado**.
  - **Ancoragem Financeira Transparente:** Exibe `Subtotal Bruto` $\rightarrow$ `Desconto Aplicado (Condômino / Cupom)` $\rightarrow$ **`Parcelamento em 6x sem juros`** (destaque principal) + `Valor à vista no PIX/Boleto` (separando claramente o que é checkout imediato OOH/Digital do que é faturamento assistido de Rádio).
- **Resumo de Impacto Modular por Canal:**
  - Em vez de 5 colunas misturadas, exibe o **Impacto Consolidado** + **Cards/Pílulas Resumo por Canal Ativo no Carrinho**:
    1. 📍 **OOH & Condomínios:** `Pontos · Telas · Inserções/Dia · Inserções Totais no Período · Alcance/Impacto`
    2. 🌐 **Portais Digitais Globo:** `Portais · Formato (Vídeo/Display) · Impressões Estimadas · CPM`
    3. 📖 **Revistas Digitais Globo:** `Títulos Editoriais · Impressões Estimadas · Segmentação`
    4. 📻 **Rádio:** `Emissoras · Praça · Secundagem (30s) · Inserções/Semana · Inserções Totais`
- **Cards de OOH e Condomínios Padronizados (Web = PDF):**
  - Todo card OOH na Web passa a exibir obrigatoriamente: **Nº de Telas**, **Inserções/Dia**, **Inserções no Período**, **Formato (px/orientação)** e **Preço**.
  - Cards de **Condomínio** exibem no cabeçalho do grupo o **Total de Torres + Soma de Telas + Soma de Inserções/Dia + Preço Total do Condomínio**, com botão de expandir 100% funcional no Mobile e selo verde quando houver **Desconto de Morador/Condômino**.

### B. Novo Exportador CSV (18 Colunas Multi-Produto) e XML
- **Colunas do Novo CSV (com BOM UTF-8 para Excel):**
  `Proposta_ID;Campanha;Data_Inicio;Data_Fim;Duracao_Dias;Canal;Vertical_ou_Editorial;Nome_Ponto_ou_Produto;Endereco_ou_Veiculos;Cidade_UF;Condominio_Grupo;Formato_Dimensao;Telas_ou_Espacos;Insercoes_Dia;Insercoes_Periodo_ou_Impressoes;Alcance_Impacto;Preco_Bruto_BRL;Desconto_BRL;Preco_Liquido_BRL`
- **Novo XML (`proposta_<id>.xml`):**
  Estrutura hierárquica completa (`<PropostaAquiAds>` $\rightarrow$ `<Cabecalho>`, `<ResumoFinanceiro>`, `<ResumoPorCanal>`, `<ItensPlanoMidia>`, `<EspecificacoesTecnicas>`).

### C. Novo PDF Executivo de Alta Conversão
1. **Capa/Página 1 Completa:** Resumo do Pedido com **Subtotal + Desconto (Condômino/Cupom) + Total Final em 6x / PIX**, Métricas modulares por canal, **Imagem do Mapa Estático (Mapbox Static API)** com os pinos numerados e **QR Code + Botão Clicável `"Aprovar e Pagar Proposta Online"`**.
2. **Tabelas de Mídia Consistentes:** Colunas de `Exibições/Dia` e `Exibições Totais` 100% reconciliadas com o cabeçalho.
3. **Especificações Técnicas Unificadas:** Alimentadas dinamicamente pelo mesmo motor da aba `Arte` (`FormatsEnum`), eliminando o erro de formato desconhecido e a necessidade de baixar um 2º PDF separado.

---

## 3. ⚡ Roadmap de Execução (Quick Wins vs. Evolução Estrutural)

### Sprint 1 — Quick Wins (1 a 3 dias)
- [ ] **QW1:** Exibir `screens` (`X telas`) e `Inserções/dia` nos cards OOH da Web (`CartItem.9e4ad0c5.js`) e corrigir o tooltip de `period_insertions`.
- [ ] **QW2:** Reconciliar o KPI `Exibições` do topo com a soma exata das exibições dos itens da tabela.
- [ ] **QW3:** Remover a trava `UserStore.is_master` do menu `Exportar` e substituir `xs(l)` pelo novo exportador **CSV (18 colunas multi-produto) + XML**.
- [ ] **QW4:** Desativar o `Tapume` em `/resumo/proposta/*`, liberar a seta de expandir condomínios no Mobile e adicionar toggle para abrir o Mapa no Mobile.
- [ ] **QW5:** Incluir `Subtotal` e `Desconto` no bloco de resumo financeiro do PDF (`PdfGenerator.977b4886.js`).

### Sprint 2 — Unificação Completa ("One Proposal")
- [ ] **U1:** Modularizar o Resumo de Métricas e a listagem por **Canal (OOH | Portais Globo | Revistas Digitais | Rádio)** com separação clara do checkout imediato vs. faturamento assistido de Rádio.
- [ ] **U2:** Unificar o gerador de Specs Técnicas do PDF da Proposta com o motor dinâmico da aba `Arte`.
- [ ] **U3:** Embutir **Mapa Estático (Mapbox Static API)** + **QR Code para Pagamento** no PDF.
- [ ] **U4:** Permitir preenchimento inline dos Dados de Faturamento (CNPJ/CPF + Endereço) dentro da aba `Pagamento` da proposta quando `!hasAddressId`.
