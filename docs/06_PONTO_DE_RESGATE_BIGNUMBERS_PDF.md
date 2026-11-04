# 🛟 Ponto de Resgate: Big Numbers da Página Final do PDF Comercial

**Data do Ponto de Resgate:** 04/11/2026  
**Commit Git de Referência (com os Big Numbers ativos):** `af9ad69` (Tag Git: `resgate-bignumbers-pdf`)  
**Arquivo Original:** [`prototipo/app.js`](../prototipo/app.js) (`renderPdfDocument(m)`)  
**Motivo da Retirada:** Solicitação da gestão para retirar os Big Numbers (`+23% de faturamento onde a campanha foi veiculada` + citação quantitativa) da página final do PDF comercial, mantendo o código salvo como ponto de resgate caso queiram reativar no futuro.

---

## 1. Como Restaurar Rapidamente

### Opção A — Restaurar apenas o bloco de Big Numbers (`+23%`) na página final do PDF
Basta reinserir o bloco HTML abaixo dentro de `renderPdfDocument(m)` em [`prototipo/app.js`](../prototipo/app.js), logo após o cabeçalho `CONHEÇA NOSSOS CASES DE SUCESSO` e imediatamente antes da grid de 8 depoimentos (`<div class="grid grid-cols-4 gap-2.5">`):

```html
            <!-- Topo: Big Number +23% à esquerda + Depoimento Destaque à direita -->
            <div class="grid grid-cols-12 gap-6 items-center pb-2 mb-4">
              <div class="col-span-5">
                <h2 class="font-display font-bold text-xl sm:text-2xl text-primary leading-tight">
                  Mais presença.<br />Mais resultado.
                </h2>
                <div class="font-display font-extrabold text-5xl sm:text-[54px] leading-none mt-2.5 tracking-tight">
                  <span class="text-[#E83C39]">+</span><span class="text-[#EE5229]">2</span><span class="text-[#F37219]">3</span><span class="text-[#F7980F]">%</span>
                </div>
                <p class="text-[11px] text-ds-textSecondary mt-1.5">
                  de faturamento onde a campanha foi veiculada
                </p>
              </div>

              <div class="col-span-7">
                <blockquote class="font-display font-medium text-base sm:text-lg text-ds-textMain leading-snug">
                  “A experiência está sendo positiva! Onde a campanha foi veiculada, notamos crescimento de 23% no faturamento.”
                </blockquote>
                <div class="mt-3 flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full border-[1.5px] border-primary text-primary font-display font-bold text-xs flex items-center justify-center shrink-0">
                    G
                  </div>
                  <div class="leading-tight">
                    <div class="font-bold text-xs text-ds-textMain">Guilherme</div>
                    <div class="text-[11px] text-ds-textSecondary">Athena Candy Shop</div>
                  </div>
                </div>
              </div>
            </div>
```

---

## 2. Snapshot Completo da Página Final do PDF (Antes da Retirada)

Abaixo está o código integral da seção final do PDF (`lines 8807–9007` no commit `af9ad69`):

```html
        <!-- ÚLTIMA PÁGINA DO PDF: PROVA SOCIAL (+23% & DEPOIMENTOS) + BANNER "SUA MARCA NO LUGAR CERTO" EM PÁGINA ÚNICA -->
        <section class="mt-6 pt-2 pdf-break-before-print pdf-avoid-break flex flex-col justify-between">
          
          <!-- TÍTULO E SUBTÍTULO DE CASES DE SUCESSO + LINHA SEPARADORA (EVITA INTERPRETAÇÃO COMO PROMESSA DE RETORNO) -->
          <div class="pb-3 mb-3 border-b border-slate-200">
            <h2 class="font-display font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
              CONHEÇA NOSSOS CASES DE SUCESSO
            </h2>
            <p class="text-xs text-ds-textSecondary mt-0.5">
              Resultados reais relatados por clientes que anunciaram pelo Aqui ads
            </p>
          </div>

          <!-- 1. SEÇÃO: MAIS PRESENÇA. MAIS RESULTADO. (+23% + 8 DEPOIMENTOS) -->
          <div class="bg-white py-2">
            <!-- Topo: Big Number +23% à esquerda + Depoimento Destaque à direita -->
            <div class="grid grid-cols-12 gap-6 items-center pb-2">
              <div class="col-span-5">
                <h2 class="font-display font-bold text-xl sm:text-2xl text-primary leading-tight">
                  Mais presença.<br />Mais resultado.
                </h2>
                <div class="font-display font-extrabold text-5xl sm:text-[54px] leading-none mt-2.5 tracking-tight">
                  <span class="text-[#E83C39]">+</span><span class="text-[#EE5229]">2</span><span class="text-[#F37219]">3</span><span class="text-[#F7980F]">%</span>
                </div>
                <p class="text-[11px] text-ds-textSecondary mt-1.5">
                  de faturamento onde a campanha foi veiculada
                </p>
              </div>

              <div class="col-span-7">
                <blockquote class="font-display font-medium text-base sm:text-lg text-ds-textMain leading-snug">
                  “A experiência está sendo positiva! Onde a campanha foi veiculada, notamos crescimento de 23% no faturamento.”
                </blockquote>
                <div class="mt-3 flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full border-[1.5px] border-primary text-primary font-display font-bold text-xs flex items-center justify-center shrink-0">
                    G
                  </div>
                  <div class="leading-tight">
                    <div class="font-bold text-xs text-ds-textMain">Guilherme</div>
                    <div class="text-[11px] text-ds-textSecondary">Athena Candy Shop</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Grid 4x2 com os 8 depoimentos de clientes -->
            <div class="mt-4 grid grid-cols-4 gap-2.5">
              <div class="rounded-xl border border-ds-border bg-white p-3 flex flex-col justify-between">
                <p class="text-[11px] text-ds-textMain leading-snug">
                  “Muitos não conheciam o restaurante antes de ver o anúncio nos elevadores.”
                </p>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full border border-primary text-primary font-display font-bold text-[10px] flex items-center justify-center shrink-0">B</div>
                  <div class="leading-tight min-w-0">
                    <div class="font-bold text-[11px] text-ds-textMain truncate">Beatriz</div>
                    <div class="text-[10px] text-ds-textSecondary truncate">Restaurante Trio</div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-ds-border bg-white p-3 flex flex-col justify-between">
                <p class="text-[11px] text-ds-textMain leading-snug">
                  “O resultado foi imediato: mais visitas, mais matrículas e uma presença marcante.”
                </p>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full border border-primary text-primary font-display font-bold text-[10px] flex items-center justify-center shrink-0">GM</div>
                  <div class="leading-tight min-w-0">
                    <div class="font-bold text-[11px] text-ds-textMain truncate">Gustavo Meneguello</div>
                    <div class="text-[10px] text-ds-textSecondary truncate">Pen Life</div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-ds-border bg-white p-3 flex flex-col justify-between">
                <p class="text-[11px] text-ds-textMain leading-snug">
                  “Tivemos um aumento real no contato de novos pacientes.”
                </p>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full border border-primary text-primary font-display font-bold text-[10px] flex items-center justify-center shrink-0">GG</div>
                  <div class="leading-tight min-w-0">
                    <div class="font-bold text-[11px] text-ds-textMain truncate">Grace Graton</div>
                    <div class="text-[10px] text-ds-textSecondary truncate">Moment Fisioterapia</div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-ds-border bg-white p-3 flex flex-col justify-between">
                <p class="text-[11px] text-ds-textMain leading-snug">
                  “Foi incrível pra visibilidade da marca e retorno de leads.”
                </p>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full border border-primary text-primary font-display font-bold text-[10px] flex items-center justify-center shrink-0">C</div>
                  <div class="leading-tight min-w-0">
                    <div class="font-bold text-[11px] text-ds-textMain truncate">Camile</div>
                    <div class="text-[10px] text-ds-textSecondary truncate">Casari Imóveis</div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-ds-border bg-white p-3 flex flex-col justify-between">
                <p class="text-[11px] text-ds-textMain leading-snug">
                  “O impacto é muito grande onde passam mais pessoas.”
                </p>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full border border-primary text-primary font-display font-bold text-[10px] flex items-center justify-center shrink-0">RL</div>
                  <div class="leading-tight min-w-0">
                    <div class="font-bold text-[11px] text-ds-textMain truncate">Raul</div>
                    <div class="text-[10px] text-ds-textSecondary truncate">Trade La Guapa</div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-ds-border bg-white p-3 flex flex-col justify-between">
                <p class="text-[11px] text-ds-textMain leading-snug">
                  “Trouxe um impacto muito positivo para a marca, um caso de sucesso.”
                </p>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full border border-primary text-primary font-display font-bold text-[10px] flex items-center justify-center shrink-0">OE</div>
                  <div class="leading-tight min-w-0">
                    <div class="font-bold text-[11px] text-ds-textMain truncate">Otello</div>
                    <div class="text-[10px] text-ds-textSecondary truncate">Galícia Educação</div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-ds-border bg-white p-3 flex flex-col justify-between">
                <p class="text-[11px] text-ds-textMain leading-snug">
                  “Experiência incrível nas estações de metrô com suporte ágil.”
                </p>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full border border-primary text-primary font-display font-bold text-[10px] flex items-center justify-center shrink-0">MB</div>
                  <div class="leading-tight min-w-0">
                    <div class="font-bold text-[11px] text-ds-textMain truncate">Mariana Barjud</div>
                    <div class="text-[10px] text-ds-textSecondary truncate">Rede Ponto Certo</div>
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-ds-border bg-white p-3 flex flex-col justify-between">
                <p class="text-[11px] text-ds-textMain leading-snug">
                  “Percebemos um aumento claro no movimento e novos clientes do elevador.”
                </p>
                <div class="mt-2.5 flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full border border-primary text-primary font-display font-bold text-[10px] flex items-center justify-center shrink-0">SR</div>
                  <div class="leading-tight min-w-0">
                    <div class="font-bold text-[11px] text-ds-textMain truncate">Sidinei Roman</div>
                    <div class="text-[10px] text-ds-textSecondary truncate">Churrascaria Bovinu'S</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
```

---

## 3. Comando Git de Resgate (Referência)

Para inspecionar ou restaurar via Git a qualquer momento:
```bash
git show resgate-bignumbers-pdf:prototipo/app.js
```
