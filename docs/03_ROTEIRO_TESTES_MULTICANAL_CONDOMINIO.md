# 🧪 Roteiro e Matriz de Testes de Fluxo — Página de Propostas

Documento de trabalho para guiar a bateria de testes práticos nos diferentes cenários de carrinho (**OOH Puro**, **Condomínios**, **Desconto de Condômino** e **Múltiplos Produtos: OOH + Digital + Rádio + Revistas Digitais**).

---

## Checklist de Cenários para Testar Amanhã

### 🔹 Fluxo 1: Carrinho de OOH Puro (Rua + Estabelecimentos + Elevadores Comerciais)
- **Link de Referência já capturado:** `https://aqui.globo/resumo/proposta/20261021-193555-19063-6ad9141b7fb09` (`#743446`)
- [ ] **Web (`/resumo/proposta/:id`):**
  - [ ] Verificar ausência do número de telas (`screens: 13`) no card do *Faria Lima Financial Center*.
  - [ ] Verificar ausência de `Inserções por dia` nos cards OOH.
  - [ ] Conferir divergência entre o KPI `Exibições` do topo (`32 mil / 31.872`) e a soma dos cards (`720 + 34.320 = 35.040`).
- [ ] **PDF Exportado:**
  - [ ] Conferir coluna `Exibições Diária` (`51` e `2.451`) vs. `Exibições` (`720` e `34.320`).
  - [ ] Conferir se as páginas de Especificações Técnicas renderizam os 2 formatos (`720x1280` Barbearia e `1280x720` Elevadores Comerciais).
- [ ] **Notas da Natália (Fluxo 1):**
  > *(Espaço para anotar observações durante o teste)*

---

### 🔹 Fluxo 2: Carrinho de OOH com Condomínios Residenciais de Múltiplas Torres + Desconto de Condômino — ✅ AUDITADO AO VIVO (`#743446`)
> **Link auditado:** `https://aqui.globo/resumo/proposta/20261021-193555-19063-6ad9141b7fb09` (Payload salvo em [`data/proposal_condomino_multitorres_live_data.json`](file:///c:/Users/natalia.ferreira/Documents/P%C3%A1gina%20de%20propostas/data/proposal_condomino_multitorres_live_data.json) — 28 dias, **15 pontos / 21 telas**, `Total: R$ 47.617,10`).
>
> 📌 **REGRA DE NEGÓCIO CONFIRMADA (Alexsandro + Time):**
> 1. **Condomínio Residencial (preço normal):** **Cada torre/bloco custa `R$ 441,60`** (valor único por torre para 4 semanas, independente de a torre ter 1 ou 2 telas). Logo, 5 torres = **`R$ 2.208,00`**.
> 2. **Desconto de Condômino (morador):** Aplica a tarifa promocional fixa (`R$ 99,00`) para o condomínio do morador (`Faria Lima New Style`).
> 3. **Condomínio Comercial:** O preço varia pela quantidade de telas (`Maria Cristina` com 3 telas = `R$ 895,68`).

- [x] **1. Bug Matemático Grave no Card Fechado do Condomínio (`Jt` / `OohCartItemGroup`):**
  - [x] **Realidade do Pedido:**
    - **Condomínio `1624` (`Jardins do Brasil Abrolhos`):** **5 torres**, **7 telas**, **70.644 exibições**, Total do Condomínio = **`R$ 2.208,00`** (`5 × R$ 441,60`).
    - **Condomínio `1628` (`Jardins do Brasil Mantiqueira`):** **5 torres**, **6 telas**, **60.552 exibições**, Total do Condomínio = **`R$ 2.208,00`** (`5 × R$ 441,60`).
  - [x] **Erro na Exibição do Card Fechado:** A função `Jt` (`sharable_link_formatted.js` linhas 1303–1322) usa a **1ª torre** (`Caravelas B` e `Jacarandá B`) como capa do grupo e joga as outras 4 torres em `condominium_group` **sem somar o preço (`R$ 2.208,00`), a quantidade de torres (`5 torres`), as telas (`7` e `6 telas`) nem as exibições (`70.644` e `60.552`)**!
  - [x] **Consequência para o cliente:** Com os cards fechados (padrão da página), cada condomínio mostra **`R$ 441,60` e `1 tela`** em vez de **`R$ 2.208,00` (`5 torres · 7 telas`)**. Se o cliente somar os 7 cards da lista, a conta dá **`R$ 44.084,30` (`10 telas`)**, enquanto o topo da proposta cobra **`R$ 47.617,10` (`21 telas / 15 pontos`)** — deixando **`R$ 3.532,80` e 8 torres escondidos**!
- [x] **2. No Mobile (`< 1024px`), a seta para expandir e ver as 5 torres desaparece:**
  - [x] Como a seta de expandir depende de `isDesktop` dentro do `CartItem`, **no celular o cliente vê apenas a 1ª torre (`Caravelas B` / `Jacarandá B`) com `1 tela` e `R$ 441,60`** e não tem botão para abrir as gavetas e descobrir onde estão os outros `R$ 3.532,80` e as outras 8 torres!
- [x] **3. Efeito Cascata de `p.items = Jt(...)` (Mutação destrutiva do array `campaign.items` na linha 1212):**
  - [x] **No Mapa (`oohItemsForMap`):** Como `Jt` remove as 8 torres filhas de `campaign.items`, **as 8 torres desaparecem do mapa interativo** (só 7 pinos são renderizados no mapa em vez dos 15 pontos contratados).
  - [x] **Na Busca da Proposta (`Pe()`):** Se o cliente pesquisar pelo nome de uma torre filha (ex.: `"Atoba"` ou `"Araucária"`), a busca dá **"Nenhum produto encontrado"**, pois o filtro ignora `condominium_group`.
  - [x] **No `Faria Lima New Style` (Prédio com Desconto de Condômino):** Como `d.condominiuns` só lista os IDs com múltiplas torres (`1624` e `1628`) e não inclui `"859"`, a linha `te.properties.is_condominium = !!p?.[Ge]` **sobrescreve `is_condominium` do `Faria Lima New Style` de `true` para `false`**!
- [x] **4. PDF Exportado (`PdfGenerator.977b4886.js`):**
  - [x] **Desagrupamento + Cobrança repetida + Mutilação do nome (`At(t)` na linha 2868):** No PDF, a função `tt()` achata o `condominium_group` em **10 linhas separadas**, repetindo **`R$ 441,60` em cada uma das 10 linhas** (como se cada torre custasse `R$ 441,60`), e a função `At(t)` (`name.split("-").slice(1).join("-")`) **apaga o nome do condomínio** (`Jardins do Brasil Abrolhos` / `Mantiqueira`), imprimindo apenas `Caravelas B`, `Atoba A`, `Atoba B`... soltos na tabela!
- [x] **5. Planilha CSV (`Wt()` -> `Ha(_.value?.campaign)` na linha 1283):**
  - [x] `Wt()` passa `_.value?.campaign` (`undefined`), gerando um CSV `locais_campanha.csv` **100% vazio** (apenas cabeçalho, zero linhas). E mesmo se recebesse `campaign`, `xs()` não achata `condominium_group`, omitindo 8 das 10 torres.

---

### 🔹 Fluxo 3: Carrinho com Desconto de Condômino + Outros Pontos na Mesma Proposta — ✅ AUDITADO AO VIVO (`#743446`)
> **Link auditado:** `https://aqui.globo/resumo/proposta/20261021-193555-19063-6ad9141b7fb09` (Payload salvo em [`data/proposal_condomino_live_data.json`](file:///c:/Users/natalia.ferreira/Documents/P%C3%A1gina%20de%20propostas/data/proposal_condomino_live_data.json) — 28 dias, 5 itens OOH).

- [x] **1. Desconto de Condômino (`-R$ 342,60` / `-77,6% OFF`) fica invisível nos Totais, na Aba Pagamento e no PDF:**
  - [x] **No JSON da API (`Item[1]` — `PR12275` `Faria Lima New Style`):** O ponto de Elevadores Residenciais (2 telas, 28 dias) vem com `original_price: "441.60"` e `price: "99.00"` (tarifa fixa de condômino de **R$ 99,00** para 4 semanas, gerando uma economia real de **R$ 342,60**).
  - [x] **Inconsistência de Flags na API:** A API retorna `"is_condominium_discount_in_use": false`, `"discount": 0`, `"total_discount": "0.00"` no item, e no topo do pedido retorna `"subtotal": "43201.10"`, `"discount": "0.00"`, `"total": "43201.10"` (em vez de `subtotal: "43543.70"` e `discount: "342.60"`).
  - [x] **Impacto no Topo da Proposta e na Aba Pagamento:** O cabeçalho (`Investimento total: R$ 43.201,10`) e o `PaymentSummary` da Aba Pagamento **não exibem** o Subtotal original (`R$ 43.543,70`) nem a linha `Desconto de Condômino (-R$ 342,60)`. O benefício fica completamente invisível no fechamento financeiro.
- [x] **2. Card do Condomínio (`Faria Lima New Style`) cria acordeão redundante (`Coletânea Faria Lima New Style`):**
  - [x] Como `Item[1]` tem `is_condominium: true` (`condominium_id: "859"`), a função `groupCartItemsByCondominium` envolve esse único item num `condominium_group` de 1 elemento e ativa a seta de acordeão (`action-mode: "visible"`).
  - [x] Ao clicar na seta do card `Faria Lima New Style`, abre um box cinza-escuro escrito **`Coletânea Faria Lima New Style`** contendo **exatamente o mesmo card `Faria Lima New Style` repetido lá dentro** (e em Mobile a seta some por causa do `isDesktop`).
- [x] **3. Mistura de Categorias OOH e Contraste de Ticket Sem Agrupamento:**
  - [x] Os 5 itens aparecem soltos na mesma lista sem separação por vertical/ambiente:
    1. `Estúdios de Pilates - Wellhub - Pure Pilates - Vila Madalena - Alto Pinheiros - Id235` (`Academias`, 1 tela, `R$ 406,42`) — **nome sujo com tags internas `Wellhub` e `Id235`**.
    2. `Faria Lima New Style` (`Elevadores Residenciais`, 2 telas, `R$ 99,00` — com Desconto de Condômino).
    3. `Av Brig Faria Lima, 801 X Lg da Batata` (`Ponto de ônibus`, 1 face, `R$ 20.900,00`).
    4. `Maria Cristina` (`Elevadores Comerciais`, 3 telas, `R$ 895,68`).
    5. `Av Brig Faria Lima, 426` (`Ponto de ônibus`, 1 face, `R$ 20.900,00`).
  - [x] A tarifa especial de `R$ 99,00` do condomínio do morador fica perdida no meio de uma proposta de `R$ 43.201,10` dominada por 2 abrigos de ônibus de `R$ 20.900,00` cada, sem um selo claro de **"Benefício de Condômino Aplicado (-77%)"**.
- [x] **4. PDF Exportado (`PdfGenerator.977b4886.js`):**
  - [x] Na tabela de `Elevadores Residenciais`, `Faria Lima New Style` sai apenas com `Preço: R$ 99,00`, sem mostrar o valor de tabela (`R$ 441,60`) nem que é tarifa de Condômino.
  - [x] Na tabela de `Academias`, a função `At(m)` (`name.split("-")[1]`) corta o nome `Estúdios de Pilates - Wellhub - Pure Pilates - Vila Madalena - Alto Pinheiros - Id235` e imprime apenas **`Wellhub`** na coluna `Edifício/Estabelecimento`, apagando o nome real do estúdio (*Pure Pilates*)!
- [x] **5. Aba Anônima / Compartilhamento com Terceiros:**
  - [x] Não há nenhum aviso de governança informando que a tarifa de **R$ 99,00** no *Faria Lima New Style* é um benefício **pessoal e intransferível de morador** (sujeito a comprovação de endereço da conta titular).

---

### 🔹 Fluxo 4: Carrinho Multicanal (OOH + Digital Portais + Rádio) — ✅ AUDITADO
- **Link auditado:** `https://aqui.globo/resumo/proposta/20261021-193555-19063-6ad9141b7fb09` (`#743446`)
- **Arquivos salvos no projeto:**
  - Payload real da API: [`data/proposal_multicanal_live_data.json`](file:///c:/Users/natalia.ferreira/Documents/P%C3%A1gina%20de%20propostas/data/proposal_multicanal_live_data.json)
  - PDF exportado escaneado (12 páginas, 18,8 MB): [`plano-de-mídia-23-10-2026.pdf`](file:///c:/Users/natalia.ferreira/Documents/P%C3%A1gina%20de%20propostas/plano-de-m%C3%ADdia-23-10-2026.pdf)
- [x] **Web (`/resumo/proposta/:id`):**
  - [x] **Divergência de Valor Total (`R$ 4.719,50` vs. `R$ 52.859,90`):** A API retorna `subtotal_ooh: 2881.10`, `subtotal_digital: 1838.40` e `subtotal_radio: 48140.40`, mas grava `total: 4719.50` (omitindo Rádio da soma total). O cabeçalho diz `Investimento total: R$ 4.719,50` enquanto o 1º item listado no plano é Rádio CBN de `R$ 48.140,40`.
  - [x] **Card de Métricas no topo:** Grid de 5 colunas sem divisórias visuais misturando `1 rádio/programa + 7 inserções/semana`, `7 portais + 107 mil impressões` (Digital) e `2 Pontos / 14 Telas / 35 mil Exibições / 4 mil Alcance / 29 mil Impacto / 8,11 Frequência` (OOH). No mobile, os títulos desalinham das caixas.
  - [x] **Filtros e Mapa:** Quando filtra por `Digital`, o mapa de OOH (focado em SP) continua ocupando metade da tela; quando filtra por `Ambientes`, Rádio e Digital somem.
- [x] **Escaneamento Completo do PDF (`plano-de-mídia-23-10-2026.pdf` — 12 páginas / 18,8 MB):**
  - [x] **Peso excessivo (18,8 MB):** 20 imagens PNG sem compressão (só a contracapa `1920x1080` pesa 8,1 MB, e o callback `didDrawPage` redesenha o cabeçalho e duplica imagens em toda tabela).
  - [x] **Página 1 — Total errado + Métricas quebradas + Cabeçalho órfão:**
    - `Resumo do pedido -> Total` exibe `R$ 4.719,50` sem nenhum aviso, exatamente acima da tabela `Rádio` que cobra `R$ 48.140,40`.
    - Na caixa de métrica de Rádio, o texto `inserções/semana` quebra no meio da sílaba (`inserções/se` + `mana`) e a linha de baixo fica com um buraco vazio (falta a caixa `1 rádio/programa`).
    - Na tabela de Rádio, o cabeçalho `Duração` quebra em duas linhas (`Duraçã` + `o`).
    - No rodapé da Página 1, o título `Digital` e um cabeçalho de tabela vazio ficam órfãos (sem linhas) e se repetem no topo da Página 2.
  - [x] **Página 2 — Nomes dos pontos OOH amputados:**
    - A função `At(m)` corta tudo antes do hífen (`split(" - ")[1]`): *Faria Lima Financial Center - Premium* vira apenas **`Premium`**, e *Black Jack Barber Shop - Itaim Bibi* vira apenas **`Itaim Bibi`**. O cliente perde o nome real do prédio/estabelecimento no PDF.
  - [x] **Página 3 — Contradição na duração do Vídeo Globo:**
    - O título da página diz **`Vídeo de 15 segundos - Portais Globo`**, mas a tabela técnica diz **`Duração: 10 segundos`**.
  - [x] **Páginas 4 a 9 — 6 páginas inteiras para 1 único produto de Display:**
    - Gera 1 página A4 inteira para cada tamanho de banner (`Display - Portais Globo` `970x250`, `Maxiboard` `970x150` sem imagem de preview, `Retângulo Médio` `300x250`, `Half Page` `300x600`, `Banner Mobile Pequeno` `320x50`, `Banner Mobile Médio` `320x100`).
  - [x] **Zero página de especificação técnica de Rádio no PDF:** O item de `R$ 48.140,40` não tem nenhuma instrução de entrega de spot/locução no PDF.
- [x] **Exportação CSV:**
  - [x] Produtos Globo Digital (`PR75165`, `PR75167`) vêm cadastrados com endereço físico da sede da Globo RJ (`Rua Lopes Quintas, 303`), foto de abrigo de ônibus e `condominium_id: "68948"`, saindo na planilha como pontos físicos de 1 tela. Rádio sai com endereço `", "` e telas vazias.
- [x] **Notas e Diretrizes da Natália (Fluxo 4 — Regra de Soma e Pagamento de Rádio):**
  > 1. **No valor total da proposta (Web e PDF):** Rádio **deve entrar na soma do Valor Total da Proposta** (`R$ 52.859,90`), acompanhado de um aviso explícito logo abaixo (ex.: *"Rádio possui faturamento dedicado à parte, mas compõe o valor total desta proposta"*), além da quebra de subtotais por canal.
  > 2. **Na hora de pagar direto na proposta (Aba Pagamento / Checkout):** Deve exibir claramente a separação financeira e o passo a passo: *"O valor pago online agora nesta proposta é de **R$ 4.719,50** (OOH + Digital), pois **Rádio (R$ 48.140,40)** é faturado de outra forma. Veja o passo a passo para concluir o pagamento de Rádio..."*

---

### 🔹 Fluxo 4.1 (Cenário Completo / "Stress Test"): OOH + Condomínios Multi-Torres + Desconto de Condômino + Portais Globo + Revistas Digitais (Editora Globo) + Rádio — ✅ AUDITADO AO VIVO (`#743446`)
> **Link auditado:** `https://aqui.globo/resumo/proposta/20261021-193555-19063-6ad9141b7fb09` (Payload salvo em [`data/proposal_completo_live_data.json`](file:///c:/Users/natalia.ferreira/Documents/P%C3%A1gina%20de%20propostas/data/proposal_completo_live_data.json) — 28 dias, **28 itens no carrinho**).

- [x] **1. Quebra Financeira Real vs. O que a Página Mostra:**
  - **OOH (15 pontos / 21 telas):** `R$ 47.617,10` *(já com o Desconto de Condômino de `-R$ 342,60` no `Faria Lima New Style`)*
  - **Digital — Revistas Digitais / Editora Globo (4 produtos: `Extra`, `Galileu`, `Globo Rural`, `O Globo`):** `4 × R$ 902,40 = R$ 3.609,60`
  - **Digital — Portais Globo & Globoplay (5 produtos de Vídeo e Display):** `R$ 4.545,60` *(Subtotal Digital = `R$ 8.155,20`)*
  - **Rádio (4 praças/faixas: BH Manhã, SP Tarde, Nacional Noite, Brasília Noite):** `R$ 314.294,40`
  - **Total Real da Proposta (todos os canais):** **`R$ 370.066,70`**
  - **O que a Página e o PDF mostram como `Investimento total`:** **`R$ 55.772,30`** (omitindo os **`R$ 314.294,40`** de Rádio e sem mostrar os subtotais de cada canal!).
- [x] **2. Problemas Específicos de Revistas Digitais (`Editora Globo - Display` — `PR76941`, `PR76942`, `PR76943`, `PR76949`):**
  - [x] **Misturadas sem separação:** Os cards de `Display - Extra`, `Display - Galileu`, `Display - Globo Rural` e `Display - O Globo` ficam misturados no meio da lista, sem cabeçalho de seção separando *Revistas/Jornais Editora Globo* de *Portais Globo / Globoplay* e *OOH*.
  - [x] **Rótulo fixo "Portais" nos Cards e no KPI (`11 Portais`):** O componente `GloboProductCard` rotula a coluna de veículos fixamente como `"Portais"` mesmo quando são **Revistas (`Galileu`, `Globo Rural`)**, **Jornais (`O Globo`, `Extra`)** ou **Streaming (`Globoplay`)**, e soma tudo no KPI do topo como `"11 Portais"`.
  - [x] **Filtro de Ambiente esconde `"Editora Globo Digital"`:** Apesar de no JSON o campo `vertical` ser `"Editora Globo Digital"`, o dropdown de **Ambiente** na página ignora esse campo e joga tudo dentro de `"Digital Globo"`.
  - [x] **Duplicidade de métrica no Card (`94 mil` no chip com olho vs. `94.000` em Impressões):** O card calcula `902,40 / 9,60 × 1.000 = 94.000` e exibe esse mesmo número duas vezes no card (uma como `Impressões: 94.000` e outra no chip cinza superior `94 mil` com tooltip de exibições OOH), enquanto no JSON `period_insertions` vem gravado como `174`.
- [x] **3. Sumiço dos Formatos de Vídeo Digital (`Globoplay` / `Portais Globo`) e do Banner `320x100` na Aba `Arte` e no PDF:**
  - [x] Embora a proposta tenha **4 produtos de Vídeo Digital** (`Globoplay` 15s e 16–180s com/sem skip, `Portais Globo` 15s e 16–180s com/sem skip), o objeto `campaign.formats` da API só traz formatos de imagem (`970x250`, `970x150`, `300x250`, `300x600`, `320x50`, `320x100`) para `Digital` (e o `1920x1080` vem apenas com `item_category: ["Academias"]`)!
  - [x] Resultado: **Nenhuma especificação técnica de Vídeo Digital (Globoplay / Portais Globo) aparece na aba `Arte` nem nas páginas finais do PDF!** Além disso, o formato `320x100` é descartado porque não está mapeado em `GLOBO_COMMERCIAL_NAMES_MAP` nem em `FormatsDetail`.
- [x] **4. Anomalia de Dados no Backend: Produtos Digitais da Globo dentro de `data.condominiuns["68948"]`:**
  - [x] Os 5 produtos de Portais Globo/Globoplay (`PR75168`, `PR75170`, `PR75171`, `PR75165`, `PR75167`) estão cadastrados no banco com o endereço da sede da Globo (`Rua Lopes Quintas, 303 - RJ`) e `condominium_id: "68948"`. Por isso, a API inclui `"68948": ["PR75168", ...]` dentro de `data.condominiuns` como se fossem 5 torres de um condomínio residencial!

---

### 🔹 Fluxo 5: Proposta Gerada via "Renata-First" (IA SDR)
- [ ] Passar pelo fluxo da IA SDR Renata até a geração da proposta.
- [ ] Comparar a URL gerada, o preenchimento das métricas, o comportamento do mapa e a exportação de PDF/CSV com a proposta gerada pelo fluxo padrão.
- [ ] **Notas da Natália (Fluxo 5):**
  > *(Espaço para anotar observações durante o teste)*
