# 💰 Regras Oficiais de Precificação — Aqui Ads (`v2_upd`)

> **Fonte Oficial:** [Planilha `precificacao_aquiads_v2_upd`](https://docs.google.com/spreadsheets/d/1AMnlotghh_iK83tucvdRMhcRNpQ8gft9EuVUVCbWquk/edit?gid=946001431#gid=946001431)
> **Fórmula Geral de Duração:**
> - **28 dias (4 semanas):** Valor Base (`100%`)
> - **14 dias (2 semanas):** `28d × 60%`
> - **7 dias (1 semana):** `14d × 60%` (`= 28d × 36%`)
> - **3 meses (12 semanas):** `28d × 3 × 95%` (`-5% de desconto`)
> - **6 meses (24 semanas):** `28d × 6 × 90%` (`-10% de desconto`)

---

## 1. Edifícios Residenciais e Comerciais (Aba `01 - Edifícios`)

### 1.1. Edifícios Residenciais — **Cobrança POR TORRE (Ativo)**
> **Regra de Negócio Crítica:** Em edifícios residenciais, o valor é **único por torre/ativo**, **independentemente da quantidade de telas** instaladas nos elevadores daquela torre (ex.: uma torre residencial com 1 tela custa `R$ 441,60` e uma torre residencial com 2 telas também custa `R$ 441,60`).
> - Quando um condomínio residencial possui **múltiplas torres** (ex.: 5 torres em SP/Osasco), o valor total do condomínio é **`Nº de Torres × Valor por Torre`** (`5 × R$ 441,60 = R$ 2.208,00`).
> - **Desconto de Condômino (Morador):** Aplica tarifa promocional fixa (**`R$ 99,00` / 28 dias**) para o condomínio residencial do morador (ex.: de `R$ 441,60` por `R$ 99,00`, economia de `-R$ 342,60`). Por ser um **desconto cadastral**, o Desconto de Condômino **acumula** com cupons promocionais (o cupom é aplicado em cima do subtotal líquido).

| Tier / Praça | 28 dias | 14 dias (`60%`) | 3 meses (`-5%`) | 6 meses (`-10%`) | 7 dias (`60% do 14d`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **T1 — SP / RJ / DF** | **R$ 441,60** | R$ 264,96 | R$ 1.258,56 | R$ 2.384,64 | R$ 158,98 |
| **T2 — MG / PR / RS / CE / PE / BA** | **R$ 337,92** | R$ 202,75 | R$ 963,07 | R$ 1.824,77 | R$ 121,65 |
| **T3 — PB / MS / GO / AL / RN / PA / AM / MA / PI / SC / ES** | **R$ 259,20** | R$ 155,52 | R$ 738,72 | R$ 1.399,68 | R$ 93,31 |

### 1.2. Edifícios Comerciais — **Cobrança POR TELA**
> **Regra de Negócio Crítica:** Em edifícios comerciais, o valor da tabela é **multiplicado pela quantidade de telas** do ponto comercial (ex.: edifício comercial *Maria Cristina* em SP com **3 telas** em 28 dias = `3 × R$ 298,56 = R$ 895,68`).

| Tier / Praça | 28 dias (por tela) | 14 dias (`60%`) | 3 meses (`-5%`) | 6 meses (`-10%`) | 7 dias (`60% do 14d`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **T1 — SP / RJ / DF** | **R$ 298,56** | R$ 179,14 | R$ 850,90 | R$ 1.612,22 | R$ 107,48 |
| **T2 — MG / PR / RS / CE / PE / BA** | **R$ 234,24** | R$ 140,54 | R$ 667,58 | R$ 1.264,90 | R$ 84,32 |
| **T3 — PB / MS / GO / AL / RN / PA / AM / MA / PI / SC / ES** | **R$ 181,44** | R$ 108,86 | R$ 517,10 | R$ 979,78 | R$ 65,32 |

---

## 2. Estabelecimentos Comerciais (Aba `02 - Estabelecimentos`)

### 2.1. Academias (Wellhub / Gympass)
> **Nota de Auditoria:** Na proposta ao vivo `#743446`, o item `GV8830` (*Estúdios de Pilates - Wellhub - Pure Pilates - Vila Madalena*, 1 tela, 28d em SP) retornou `R$ 406,42` na API vs. `R$ 418,56` na planilha.

| Tier / Praça | 28 dias | 14 dias (`60%`) | 3 meses (`-5%`) | 6 meses (`-10%`) | 7 dias (`60% do 14d`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **T1 — SP / RJ / DF** | **R$ 418,56** | R$ 251,14 | R$ 1.192,90 | R$ 2.260,22 | R$ 150,68 |
| **T2 — MG / PR / RS / CE / PE / BA** | **R$ 327,36** | R$ 196,42 | R$ 932,98 | R$ 1.767,74 | R$ 117,85 |
| **T3 — PB / MS / GO / AL / RN** | **R$ 254,40** | R$ 152,64 | R$ 725,04 | R$ 1.373,76 | R$ 91,58 |

### 2.2. Padarias — Franquia
| Produto / Local | 28 dias | 14 dias (`60%`) | 3 meses (`-5%`) | 6 meses (`-10%`) | 7 dias (`60% do 14d`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Franquia — Sorocaba / Campinas / Valinhos** | **R$ 597,12** | R$ 358,27 | R$ 1.701,79 | R$ 3.224,45 | R$ 214,96 |

---

## 3. Ruas São Paulo — Estático e Digital (Abas `03` e `04`)

### 3.1. Ruas São Paulo — Estático (por Categoria de Bairro)
| Categoria de Bairro | 28 dias | 14 dias (`60%`) | 3 meses (`-5%`) | 6 meses (`-10%`) | 7 dias (`60% do 14d`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Bairros Outros (T3)** | **R$ 3.289,00** | R$ 1.973,40 | R$ 9.373,65 | R$ 17.760,60 | R$ 1.184,04 |
| **Centro Expandido (T2)** | **R$ 3.946,80** | R$ 2.368,08 | R$ 11.248,38 | R$ 21.312,72 | R$ 1.420,85 |
| **Centro Premium (T1)** *(Alto de Pinheiros, Consolação, Itaim Bibi, Jd. Paulista, Pinheiros, Vl. Olímpia)* | **R$ 4.933,50** | R$ 2.960,10 | R$ 14.060,47 | R$ 26.640,90 | R$ 1.776,06 |

### 3.2. Ruas São Paulo — Digital (por Categoria de Bairro)
> **Nota de Auditoria na Planilha:** Na aba `04 - Ruas SP Digital`, as colunas `14 dias` e `7 dias` ainda estão calculadas sobre a base antiga da coluna K (`R$ 8.619 / R$ 10.342,80 / R$ 12.928,50`), enquanto `28 dias`, `3 meses` e `6 meses` usam a base atualizada (`R$ 8.900 / R$ 14.900 / R$ 20.900`).

| Categoria de Bairro | 28 dias | 14 dias | 3 meses (`-5%`) | 6 meses (`-10%`) | 7 dias |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Bairros Outros (T3)** | **R$ 8.900,00** | R$ 5.171,40 | R$ 25.365,00 | R$ 48.060,00 | R$ 3.102,84 |
| **Centro Expandido (T2)** | **R$ 14.900,00** | R$ 6.205,68 | R$ 42.465,00 | R$ 80.460,00 | R$ 3.723,41 |
| **Centro Premium (T1)** *(Alto de Pinheiros, Bela Vista, Brooklin, Chácara Itaim, Cidade Jardim, Cidade Monções, Consolação, Higienópolis, Ibirapuera, Indianópolis, Itaim Bibi, Jd. Paulista, Pinheiros, Vl. Madalena, Vl. Nova Conceição, Vl. Olímpia)* | **R$ 20.900,00** | R$ 7.757,10 | R$ 59.565,00 | R$ 112.860,00 | R$ 4.654,26 |

---

## 4. Ponto de Ônibus — Demais Praças (Aba `05 - Ponto de Ônibus`)

| Tipo | Praça | 28 dias | 14 dias (`60%`) | 3 meses (`-5%`) | 6 meses (`-10%`) | 7 dias (`60% do 14d`) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Digital** | **Porto Alegre** | R$ 4.337,92 | R$ 2.602,75 | R$ 12.363,07 | R$ 23.424,77 | R$ 1.561,65 |
| **Digital** | **Sorocaba** | R$ 1.843,20 | R$ 1.105,92 | R$ 5.253,12 | R$ 9.953,28 | R$ 663,55 |
| **Digital** | **Belo Horizonte** | R$ 2.828,80 | R$ 1.697,28 | R$ 8.062,08 | R$ 15.275,52 | R$ 1.018,37 |
| **Digital** | **Campinas** | R$ 3.244,80 | R$ 1.946,88 | R$ 9.247,68 | R$ 17.521,92 | R$ 1.168,13 |
| **Digital** | **Cuiabá** | R$ 1.982,72 | R$ 1.189,63 | R$ 5.650,75 | R$ 10.706,69 | R$ 713,78 |
| **Digital** | **Fortaleza** | R$ 3.754,24 | R$ 2.252,54 | R$ 10.699,58 | R$ 20.272,90 | R$ 1.351,52 |
| **Digital** | **Salvador** | R$ 3.206,40 | R$ 1.923,84 | R$ 9.138,24 | R$ 17.314,56 | R$ 1.154,30 |
| **Estático** | **Belo Horizonte** | R$ 1.525,44 | R$ 915,26 | R$ 4.347,50 | R$ 8.237,38 | R$ 549,16 |
| **Estático** | **Campinas** | R$ 1.431,36 | R$ 858,82 | R$ 4.079,38 | R$ 7.729,34 | R$ 515,29 |
| **Estático** | **Porto Alegre** | R$ 2.129,28 | R$ 1.277,57 | R$ 6.068,45 | R$ 11.498,11 | R$ 766,54 |

---

## 5. Tembici, Banca, Relógio, CPTM e Outros Formatos (Abas `06` a `10`)

* **Tembici Digital (28d):** Curitiba `R$ 4.416,00` | Florianópolis `R$ 3.153,92` | Recife `R$ 3.244,80` | Salvador `R$ 3.206,40`
* **Banca Digital (28d):** Curitiba `R$ 4.657,92` | Rio de Janeiro `R$ 8.398,08` | Belo Horizonte `R$ 8.327,68`
* **Banca Estática (28d):** Rio de Janeiro `R$ 5.985,60` | Belo Horizonte `R$ 3.253,44`
* **Relógio Digital (28d):** Recife `R$ 2.944,00` | Salvador `R$ 3.200,00`
* **Relógio Estático (28d):** Recife `R$ 2.211,84` | Salvador `R$ 1.849,92` | Porto Alegre `R$ 2.129,28` | Caxias do Sul `R$ 1.173,12`
* **CPTM Estático (28d):**
  * Estações Padrão: `Mub Estático = R$ 2.112,00` | `Painel Super = R$ 1.769,00`
  * Estações Intermediárias (Grajaú / Pres. Altino): `Mub Estático = R$ 2.534,40` | `Painel Super = R$ 2.122,80` | `Grandes Fluxos = R$ 5.209,00`
  * Estações Hub (Barra Funda, Osasco, Pinheiros, Santo Amaro, Brás, Luz, Tatuapé, Palmeiras-Barra Funda): `Grandes Fluxos = R$ 7.813,50` | `Mub Estático = R$ 3.801,60` | `Painel Super = R$ 3.184,20`
* **Outros Formatos (28d):**
  * **Totem Digital:** Florianópolis `R$ 3.153,92` | Vitória `R$ 3.317,76`
  * **Duchas Estáticas:** Florianópolis `R$ 1.198,08`
  * **Campinas Estático:** Outdoor `R$ 1.996,80` | Painel `R$ 4.851,84`
  * **Totens Estáticos Fernando de Noronha:** `R$ 4.908,48`
  * **LEDs Digitais:** Interior CE (`Juazeiro, Maracanaú, Caucaia, Eusébio, Sobral`) `R$ 5.098,24` | Capitais N/NE (`Belém, Fortaleza, Manaus, São Luís, Teresina`) `R$ 8.097,28`
  * **Empena Digital:** BH (`Av. Raja Gabaglia`) `R$ 13.360,64` | CE (`Iguatemi Bosque`) `R$ 48.584,96` | CE (`Shopping Aldeota`) `R$ 32.389,12`
  * **Grandes Formatos Rua Estático (BH):** `Av. Pedro I = R$ 5.073,60` | `Mario Werneck = R$ 6.376,32`
  * **Mubs Estáticos Porto Maravilha (RJ):** `R$ 2.992,32`
