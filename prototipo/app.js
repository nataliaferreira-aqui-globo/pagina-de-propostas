/**
 * ============================================================================
 * PÁGINA DE PROPOSTA — DESIGN SYSTEM AQUI ADS (CONSISTÊNCIA & ESCANEABILIDADE)
 * ============================================================================
 */

const state = {
  scenarioKey: 'completo',
  viewportMode: 'desktop', // 'desktop' | 'mobile'
  activeTab: 'plano',      // 'plano' | 'arte' | 'pagamento'
  channelFilter: 'ooh',    // 'ooh' | 'revistas' | 'portais' | 'radio' (sem "todos")
  subFilter: 'all',        // filtro rápido contextual do canal ativo
  searchQuery: '',
  ambienteFilter: '',      // filtro dropdown "Categoria"
  categoriaFilter: '',     // filtro dropdown "Tipo de exibição"
  geoFilter: '',           // filtro dropdown "Bairro / Zona / Classe Social" (Sugestão Comercial)
  selectedForRemoval: {},  // itens marcados pelo usuário para exclusão em massa (padrão vazio, sem select inicial)
  removedItems: {},        // itens efetivamente excluídos da proposta pelo usuário
  unselectedOohCodes: {},  // compatibilidade legada
  clonedScenariosCount: 0, // contador de cenários duplicados ("Copiar rascunho/plano")
  oohHeroExpanded: false,  // controle de expansão das 18+ categorias de OOH no Hero
  oohHeroMacroFilter: 'all',
  oohHeroSearch: '',
  heroCouponOpen: false,   // controle do input de cupom direto no card de Valor Total do Hero
  couponCode: 'AQUIADS10',
  simulateCoupon: false,
  simulateUnlogged: false,
  expandedCondos: { '1624': false },
  expandedCardMetrics: {},
  paymentMethod: null,     // null | 'card' | 'pix' | 'boleto'
  cardMode: 'saved',       // 'saved' | 'new'
  selectedInstallments: 6,
  couponDrawerOpen: false,
  billingDrawerOpen: false,
  billingCompany: 'Padaria & Confeitaria Bela Paulista LTDA',
  billingDoc: '12.345.678/0001-99',
  billingCep: '04538-132',
  billingUnlockedInline: false,
  proposalStatus: 'awaiting', // 'awaiting' | 'processing' | 'completed'
  pixGenerated: false,
  boletoGenerated: false,
  orderSubmitted: false,
  radioOrderRequested: false,
  openFaqIndex: 0,
  openArtChannel: 'ooh',
  artSearch: '',
  artCategory: 'ooh',
  artAmbiente: 'all',
  artFormatDim: 'all',
  artMediaType: 'all',
  artViewMode: 'grid', // 'grid' | 'list'
  artSelectedIds: [],
  artExpandedListIds: {},
  activeArtModalFormatId: null,
  activeArtModalSection: 'general',
  activeArtPreviewChannel: null,
  radioSpecsOpen: false,
  mobileOohView: 'list', // 'list' | 'map' (mapa 100% inline no mobile, sem modal)
  mobileOohFocusedPin: null,
  mobileOohSavedScrollTop: 0,
  mobileFiltersOpen: false,
  mobileArtFiltersOpen: false
};

let desktopMap = null;
let mobileInlineMap = null;
let desktopMarkers = [];
let mobileInlineMarkers = [];

// Cores oficiais das badges de veículos do Design System Aqui Ads
const PORTAL_BADGE_CLASSES = {
  'g1': 'bg-[#CC092F] text-white',
  'ge': 'bg-[#00873D] text-white',
  'gshow': 'bg-[#F58220] text-white',
  'receitas': 'bg-[#BF57BF] text-white',
  'cartola': 'bg-[#E3672B] text-white',
  'globoplay': 'bg-[#CC092F] text-white',
  'globo.com': 'bg-[#0B66F6] text-white',
  'extra': 'bg-[#1F262E] text-white',
  'galileu': 'bg-[#334155] text-white',
  'globo rural': 'bg-[#378147] text-white',
  'o globo': 'bg-[#3A3B87] text-white'
};

function getPortalBadgeClass(name) {
  const key = String(name || '').trim().toLowerCase();
  return PORTAL_BADGE_CLASSES[key] || 'bg-[#64748B] text-white';
}

const fmtBRL = (val) => {
  const n = Number(val) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
const fmtInt = (val) => (Math.round(Number(val) || 0)).toLocaleString('pt-BR');
const fmtCompact = (val) => {
  const n = Number(val) || 0;
  if (n >= 1000000) return (n / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' mi';
  if (n >= 1000) return (n / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' mil';
  return fmtInt(n);
};
const fmtFreq = (val) => {
  const n = Number(val) || 0;
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function getOohCategoryIcon(catName) {
  const c = String(catName || '').toLowerCase();
  if (c.includes('banca')) return 'uil-newspaper';
  if (c.includes('relógio') || c.includes('relogio')) return 'uil-building';
  if (c.includes('elevador')) return 'uil-building';
  if (c.includes('tembici') || c.includes('bike')) return 'uil-bicycle';
  if (c.includes('aerop')) return 'uil-plane-departure';
  if (c.includes('shopping')) return 'uil-shopping-bag';
  if (c.includes('tv minuto') || c.includes('metrô') || c.includes('metro') || c.includes('trem') || c.includes('brt')) return 'uil-metro';
  if (c.includes('barbearia') || c.includes('salão') || c.includes('salao')) return 'uil-store';
  if (c.includes('academia')) return 'uil-dumbbell';
  return 'uil-building';
}

function normalizeMacroAmbiente(rawVertical, rawMidia) {
  // Cada vertical/mídia já é uma categoria direta (ex.: Elevadores Residenciais, Elevadores Comerciais, Tembici, Barbearia)
  return String(rawMidia || rawVertical || 'OOH').trim();
}

function computeCampaignDates(dateStartStr, durationDays) {
  if (!dateStartStr) return { start: '26/10/2026', end: '23/11/2026' };
  const isoPart = String(dateStartStr).split(' ')[0].split('T')[0];
  const [y, m, d] = isoPart.split('-').map(Number);
  if (!y || !m || !d) return { start: '26/10/2026', end: '23/11/2026' };
  const startObj = new Date(y, m - 1, d);
  const endObj = new Date(y, m - 1, d + (Number(durationDays) || 28));
  const pad = (n) => String(n).padStart(2, '0');
  return {
    start: `${pad(startObj.getDate())}/${pad(startObj.getMonth() + 1)}/${startObj.getFullYear()}`,
    end: `${pad(endObj.getDate())}/${pad(endObj.getMonth() + 1)}/${endObj.getFullYear()}`
  };
}

function classifyCartItem(item) {
  const p = item?.properties || {};
  if (
    p.is_radio_product === true ||
    p.product_type === 'radio' ||
    String(p.vertical || '').toLowerCase() === 'radio' ||
    String(p.exhibition_type || '').toLowerCase() === 'radio' ||
    String(p.type || '').toLowerCase() === 'audio'
  ) {
    return 'radio';
  }
  if (p.is_ads_product === true) {
    const groupChannel = String(p?.ads_product?.group_channel || p.group_channel || '').toLowerCase();
    const badge = String(p?.ads_product?.badge || p.badge || '').toLowerCase();
    const vertical = String(p.vertical || '').toLowerCase();
    if (groupChannel === 'editora' || badge === 'editoraweb' || vertical.includes('editora')) {
      return 'revistas';
    }
    return 'portais';
  }
  return 'ooh';
}

const OOH_PREVIEW_CDN = 'https://cdn.eletromidia.com.br/seahorse/repositorio/imagens_predios/smb';
const GLOBO_PREVIEW_CDN = 'https://storage.googleapis.com/elt-smb-prod/assets/propostas';

const ART_FORMATS_CATALOG = {
  '970x250': {
    title: 'Billboard',
    width: 970,
    height: 250,
    unit: 'px',
    isGlobo: true,
    isDigital: true,
    isStatic: false,
    category: 'digital',
    mediaType: 'digital',
    badgeLabel: 'display',
    badgeIcon: 'uil-window-grid',
    previewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    modalPreviewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    extensions: 'JPG, PNG',
    maxWeightImage: '250 KB',
    deviceLabel: 'Desktop',
    types: ['image']
  },
  '970x150': {
    title: 'Maxiboard',
    width: 970,
    height: 150,
    unit: 'px',
    isGlobo: true,
    isDigital: true,
    isStatic: false,
    category: 'digital',
    mediaType: 'digital',
    badgeLabel: 'display',
    badgeIcon: 'uil-window-grid',
    previewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    modalPreviewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-maxiboard-example.png`,
    extensions: 'JPG, PNG',
    maxWeightImage: '350 KB',
    deviceLabel: 'Desktop',
    types: ['image']
  },
  '300x250': {
    title: 'Retângulo Médio',
    width: 300,
    height: 250,
    unit: 'px',
    isGlobo: true,
    isDigital: true,
    isStatic: false,
    category: 'digital',
    mediaType: 'digital',
    badgeLabel: 'display',
    badgeIcon: 'uil-window-grid',
    previewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    modalPreviewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-retangulo-medio.png`,
    extensions: 'JPG, PNG',
    maxWeightImage: '350 KB',
    deviceLabel: 'Desktop e Mobile',
    types: ['image']
  },
  '300x600': {
    title: 'Half Page',
    width: 300,
    height: 600,
    unit: 'px',
    isGlobo: true,
    isDigital: true,
    isStatic: false,
    category: 'digital',
    mediaType: 'digital',
    badgeLabel: 'display',
    badgeIcon: 'uil-window-grid',
    previewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    modalPreviewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-half-page-example.png`,
    extensions: 'JPG, PNG',
    maxWeightImage: '550 KB',
    deviceLabel: 'Desktop',
    types: ['image']
  },
  '320x50': {
    title: 'Mobile Banner',
    width: 320,
    height: 50,
    unit: 'px',
    isGlobo: true,
    isDigital: true,
    isStatic: false,
    category: 'digital',
    mediaType: 'digital',
    badgeLabel: 'display',
    badgeIcon: 'uil-window-grid',
    previewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    modalPreviewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    extensions: 'JPG, PNG',
    maxWeightImage: '250 KB',
    deviceLabel: 'Mobile',
    types: ['image']
  },
  '320x100': {
    title: 'Banner Mobile Médio',
    width: 320,
    height: 100,
    unit: 'px',
    isGlobo: true,
    isDigital: true,
    isStatic: false,
    category: 'digital',
    mediaType: 'digital',
    badgeLabel: 'display',
    badgeIcon: 'uil-window-grid',
    previewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    modalPreviewUrl: `${GLOBO_PREVIEW_CDN}/envio-criativo-billboard-example.png`,
    extensions: 'JPG, PNG',
    maxWeightImage: '250 KB',
    deviceLabel: 'Mobile',
    types: ['image']
  },
  '800x600': {
    defaultTitle: 'Elevadores Residenciais',
    width: 800,
    height: 600,
    unit: 'px',
    availableWidth: 800,
    availableHeight: 548,
    barHeight: 52,
    clipLength: 10,
    isGlobo: false,
    isDigital: true,
    isStatic: false,
    category: 'ooh',
    mediaType: 'digital',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/digital/800x600px_static.png`,
    extensions: 'JPG, PNG',
    videoExtensions: 'MP4',
    maxWeightImage: 'até 5 MB',
    maxWeightVideo: 'até 20 MB',
    types: ['image', 'video']
  },
  '1280x720': {
    defaultTitle: 'Elevadores Comerciais',
    width: 1280,
    height: 720,
    unit: 'px',
    availableWidth: 1280,
    availableHeight: 660,
    barHeight: 60,
    clipLength: 10,
    isGlobo: false,
    isDigital: true,
    isStatic: false,
    category: 'ooh',
    mediaType: 'digital',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/digital/1280x720px_static.png`,
    extensions: 'JPG, PNG',
    videoExtensions: 'MP4',
    maxWeightImage: 'até 5 MB',
    maxWeightVideo: 'até 20 MB',
    types: ['image', 'video']
  },
  '720x1280': {
    defaultTitle: 'Ponto de ônibus',
    width: 720,
    height: 1280,
    unit: 'px',
    availableWidth: 720,
    availableHeight: 1216,
    barHeight: 64,
    clipLength: 10,
    isGlobo: false,
    isDigital: true,
    isStatic: false,
    category: 'ooh',
    mediaType: 'digital',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/digital/720x1280px_static.png`,
    extensions: 'JPG, PNG',
    videoExtensions: 'MP4',
    maxWeightImage: 'até 5 MB',
    maxWeightVideo: 'até 20 MB',
    types: ['image', 'video']
  },
  '1080x1920': {
    defaultTitle: 'Ponto de ônibus',
    width: 1080,
    height: 1920,
    unit: 'px',
    availableWidth: 1080,
    availableHeight: 1836,
    barHeight: 84,
    clipLength: 10,
    isGlobo: false,
    isDigital: true,
    isStatic: false,
    category: 'ooh',
    mediaType: 'digital',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/digital/1080x1920px_static.png`,
    extensions: 'JPG, PNG',
    videoExtensions: 'MP4',
    maxWeightImage: 'até 5 MB',
    maxWeightVideo: 'até 20 MB',
    types: ['image', 'video']
  },
  '1920x1080': {
    defaultTitle: 'Academias',
    width: 1920,
    height: 1080,
    unit: 'px',
    availableWidth: 1920,
    availableHeight: 996,
    barHeight: 84,
    clipLength: 10,
    isGlobo: false,
    isDigital: true,
    isStatic: false,
    category: 'ooh',
    mediaType: 'digital',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/digital/1920x1080px_static.png`,
    extensions: 'JPG, PNG',
    videoExtensions: 'MP4',
    maxWeightImage: 'até 5 MB',
    maxWeightVideo: 'até 20 MB',
    types: ['image', 'video']
  },
  '3456x1152': {
    defaultTitle: 'Aerop. Santos Dumont',
    width: 3456,
    height: 1152,
    unit: 'px',
    availableWidth: 3456,
    availableHeight: 1072,
    barHeight: 80,
    clipLength: 10,
    isGlobo: false,
    isDigital: true,
    isStatic: false,
    category: 'ooh',
    mediaType: 'digital',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/digital/3456x1152px_static.png`,
    extensions: 'JPG, PNG',
    videoExtensions: 'MP4',
    maxWeightImage: 'até 5 MB',
    maxWeightVideo: 'até 20 MB',
    types: ['image', 'video']
  },
  '3400x1800': {
    defaultTitle: 'Bancas de Jornal',
    width: 3400,
    height: 1800,
    unit: 'mm',
    availableWidth: 3300,
    availableHeight: 1700,
    barHeight: 0,
    dpi: 300,
    colorProfile: 'CMYK (Impressão)',
    isGlobo: false,
    isDigital: false,
    isStatic: true,
    category: 'ooh',
    mediaType: 'static',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/static/340x180cm_static.png`,
    extensions: 'PDF',
    maxWeightPdf: 'até 80 MB',
    types: ['pdf']
  },
  '1200x1800': {
    defaultTitle: 'Relógios',
    width: 1200,
    height: 1800,
    unit: 'mm',
    availableWidth: 1120,
    availableHeight: 1720,
    barHeight: 0,
    dpi: 300,
    colorProfile: 'CMYK (Impressão)',
    isGlobo: false,
    isDigital: false,
    isStatic: true,
    category: 'ooh',
    mediaType: 'static',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/static/120x180cm_static.png`,
    extensions: 'PDF',
    maxWeightPdf: 'até 80 MB',
    types: ['pdf']
  },
  '3300x1750': {
    defaultTitle: 'VLT',
    width: 3300,
    height: 1750,
    unit: 'mm',
    availableWidth: 3300,
    availableHeight: 1750,
    barHeight: 0,
    dpi: 300,
    colorProfile: 'CMYK (Impressão)',
    isGlobo: false,
    isDigital: false,
    isStatic: true,
    category: 'ooh',
    mediaType: 'static',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/static/3300x1750mm_static.png`,
    extensions: 'PDF',
    maxWeightPdf: 'até 80 MB',
    types: ['pdf']
  },
  '2385x1125': {
    defaultTitle: 'CPTM',
    width: 2385,
    height: 1125,
    unit: 'mm',
    availableWidth: 2370,
    availableHeight: 1110,
    barHeight: 0,
    dpi: 300,
    colorProfile: 'CMYK (Impressão)',
    isGlobo: false,
    isDigital: false,
    isStatic: true,
    category: 'ooh',
    mediaType: 'static',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/static/2385x1125cm_static.png`,
    extensions: 'PDF',
    maxWeightPdf: 'até 80 MB',
    types: ['pdf']
  },
  '6000x8000': {
    defaultTitle: 'Grandes Formatos',
    width: 6000,
    height: 8000,
    unit: 'mm',
    availableWidth: 5950,
    availableHeight: 7950,
    barHeight: 0,
    dpi: 300,
    colorProfile: 'CMYK (Impressão)',
    isGlobo: false,
    isDigital: false,
    isStatic: true,
    category: 'ooh',
    mediaType: 'static',
    badgeIcon: 'uil-location-point',
    previewUrl: `${OOH_PREVIEW_CDN}/static/600x800cm_static.png`,
    extensions: 'PDF',
    maxWeightPdf: 'até 80 MB',
    types: ['pdf']
  }
};

// Ordem visual da vitrine de formatos (espelhando a hierarquia da aba Arte de produção)
const ART_FORMAT_SORT_ORDER = [
  '970x250', '970x150', '300x250',
  '800x600', '1280x720', '720x1280', '1080x1920', '1920x1080',
  '300x600', '320x50', '320x100', '3456x1152',
  '3400x1800', '1200x1800', '3300x1750', '2385x1125', '6000x8000'
];

function normalizeArtAmbienteLabel(rawCat) {
  const s = String(rawCat || '').trim();
  if (s === 'Gdes Form. de Rua') return 'Grandes Formatos';
  return s;
}

function buildCampaignArtFormats(campaign, oohRaw, portaisItems, revistasItems) {
  const rawFormatsObj = campaign?.formats || {};
  const dimToAmbientes = {};

  // Coleta ambientes reais dos itens de OOH da campanha por dimensão
  (oohRaw || []).forEach((it) => {
    const p = it.properties || {};
    const fmt = (p.format && p.format[0]) || {};
    if (fmt.width && fmt.height) {
      const key = `${fmt.width}x${fmt.height}`;
      if (!dimToAmbientes[key]) dimToAmbientes[key] = new Set();
      const midiaName = normalizeArtAmbienteLabel(p.midia || p.vertical || 'OOH');
      dimToAmbientes[key].add(midiaName);
    }
  });

  const hasOohItems = Array.isArray(oohRaw) && oohRaw.length > 0;
  const hasDigitalItems = (Array.isArray(portaisItems) && portaisItems.length > 0) || (Array.isArray(revistasItems) && revistasItems.length > 0);

  const formatKeysSet = new Set();
  Object.keys(rawFormatsObj).forEach((k) => {
    const rawF = rawFormatsObj[k] || {};
    const meta = ART_FORMATS_CATALOG[k] || {};
    const rawCats = Array.isArray(rawF.item_category) ? rawF.item_category.map(normalizeArtAmbienteLabel) : [];
    const isGloboFmt = Boolean(meta.isGlobo || rawCats.includes('Digital'));
    if (isGloboFmt && hasDigitalItems) formatKeysSet.add(k);
    if (!isGloboFmt && hasOohItems) formatKeysSet.add(k);
  });

  if (formatKeysSet.size === 0) {
    if (hasOohItems) {
      Object.keys(dimToAmbientes).forEach((k) => formatKeysSet.add(k));
    }
    if (hasDigitalItems) {
      ['970x250', '970x150', '300x250', '300x600', '320x50', '320x100'].forEach((k) => formatKeysSet.add(k));
    }
  }

  const keys = Array.from(formatKeysSet).sort((a, b) => {
    const ia = ART_FORMAT_SORT_ORDER.indexOf(a);
    const ib = ART_FORMAT_SORT_ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  return keys.map((key) => {
    const rawF = rawFormatsObj[key] || {};
    const meta = ART_FORMATS_CATALOG[key] || {};
    const [wStr, hStr] = key.split('x');
    const width = Number(rawF.width || meta.width || wStr || 800);
    const height = Number(rawF.height || meta.height || hStr || 600);
    const unit = rawF.unit || meta.unit || 'px';
    const rawCats = Array.isArray(rawF.item_category) ? rawF.item_category.map(normalizeArtAmbienteLabel) : [];
    const isGlobo = meta.isGlobo || rawCats.includes('Digital');

    const ambSet = new Set();
    if (isGlobo) {
      ambSet.add(meta.title || 'Digital');
    } else {
      rawCats.filter((c) => c !== 'Digital').forEach((c) => ambSet.add(c));
      if (dimToAmbientes[key]) {
        dimToAmbientes[key].forEach((c) => ambSet.add(c));
      }
      if (ambSet.size === 0 && meta.defaultTitle) {
        ambSet.add(meta.defaultTitle);
      }
    }
    const ambientes = Array.from(ambSet);
    const primaryAmbiente = isGlobo
      ? (meta.title || `Display ${width}x${height}`)
      : (rawCats[0] || ambientes[0] || meta.defaultTitle || 'OOH');

    return {
      id: key,
      title: primaryAmbiente,
      badgeLabel: isGlobo ? (meta.badgeLabel || 'display') : primaryAmbiente,
      badgeIcon: meta.badgeIcon || (isGlobo ? 'uil-window-grid' : 'uil-location-point'),
      dimensionsLabel: `(L)${width} x (A)${height}`,
      rawDimensions: `${width}x${height}`,
      width,
      height,
      unit,
      availableWidth: meta.availableWidth || null,
      availableHeight: meta.availableHeight || null,
      barHeight: meta.barHeight || 0,
      clipLength: meta.clipLength || (unit === 'px' && !isGlobo ? (rawF.duration || 10) : null),
      dpi: meta.dpi || null,
      colorProfile: meta.colorProfile || null,
      isGlobo,
      isDigital: meta.isDigital !== undefined ? meta.isDigital : unit === 'px',
      isStatic: meta.isStatic !== undefined ? meta.isStatic : unit === 'mm',
      category: isGlobo ? 'digital' : 'ooh',
      mediaType: (meta.isStatic || unit === 'mm') ? 'static' : 'digital',
      ambientes,
      previewUrl: meta.previewUrl || `${OOH_PREVIEW_CDN}/digital/800x600px_static.png`,
      modalPreviewUrl: meta.modalPreviewUrl || meta.previewUrl || `${OOH_PREVIEW_CDN}/digital/800x600px_static.png`,
      extensions: meta.extensions || (unit === 'mm' ? 'PDF' : 'JPG, PNG'),
      videoExtensions: meta.videoExtensions || 'MP4',
      maxWeightImage: meta.maxWeightImage || 'até 5 MB',
      maxWeightVideo: meta.maxWeightVideo || 'até 20 MB',
      maxWeightPdf: meta.maxWeightPdf || 'até 80 MB',
      types: meta.types || (unit === 'mm' ? ['pdf'] : ['image', 'video'])
    };
  });
}

function buildNormalizedModel(rawPayload) {
  const campaign = rawPayload?.campaign || {};
  const rawItems = campaign?.items || [];
  const durationDays = Number(campaign?.duration || 28);
  const weeks = Math.max(1, Math.round(durationDays / 7));
  const dateRange = computeCampaignDates(campaign.date_start || campaign.start_date, durationDays);

  const rawCondoMap = rawPayload?.condominiuns || {};
  const validCondoMap = {};
  Object.entries(rawCondoMap).forEach(([condoId, idsList]) => {
    const oohCodes = (idsList || []).filter((itemId) => {
      const found = rawItems.find((it) => (it?.properties?.id || it?.properties?.code) === itemId);
      return found && classifyCartItem(found) === 'ooh';
    });
    if (oohCodes.length > 1) {
      validCondoMap[condoId] = oohCodes;
    }
  });

  const oohRaw = [];
  const portaisItems = [];
  const revistasItems = [];
  const radioItems = [];

  rawItems.forEach((item) => {
    const ch = classifyCartItem(item);
    if (ch === 'ooh') oohRaw.push(item);
    else if (ch === 'portais') portaisItems.push(item);
    else if (ch === 'revistas') revistasItems.push(item);
    else if (ch === 'radio') radioItems.push(item);
  });

  const itemIdToCondoId = {};
  Object.entries(validCondoMap).forEach(([cId, itemIds]) => {
    itemIds.forEach((id) => { itemIdToCondoId[id] = cId; });
  });

  const inferOohZone = (district, city, stateUf) => {
    const d = String(district || '').toLowerCase();
    const c = String(city || '').toLowerCase();
    if (d.includes('pinheiros') || d.includes('perdizes') || d.includes('jardim paulista') || d.includes('itaim') || d.includes('butant') || d.includes('vila madalena')) return 'Zona Oeste';
    if (d.includes('bela vista') || d.includes('centro') || d.includes('consola') || d.includes('república') || d.includes('gamboa') || d.includes('santa cec')) return 'Centro';
    if (d.includes('vila mariana') || d.includes('moema') || d.includes('brooklin') || d.includes('santo amaro') || d.includes('botafogo') || d.includes('copacabana')) return 'Zona Sul';
    if (d.includes('brás') || d.includes('mooca') || d.includes('tatuapé') || d.includes('penha')) return 'Zona Leste';
    if (d.includes('santana') || d.includes('tucuruvi') || d.includes('vila guilherme')) return 'Zona Norte';
    if (d.includes('buritis')) return 'Zona Oeste';
    if (c.includes('osasco') || c.includes('barueri')) return 'Região Metropolitana';
    if (stateUf && stateUf !== 'SP') return `Praça ${stateUf}`;
    return 'Zona Central';
  };

  const inferOohSocialClass = (rawClass, district, vertical) => {
    const rc = String(rawClass || '').trim().toUpperCase();
    if (rc && rc !== 'NULL' && rc !== 'UNDEFINED') {
      return rc.startsWith('CLASSE') ? rc : `Classe ${rc}`;
    }
    const d = String(district || '').toLowerCase();
    const v = String(vertical || '').toLowerCase();
    if (d.includes('pinheiros') || d.includes('jardim paulista') || d.includes('perdizes') || d.includes('bela vista') || d.includes('buritis') || v.includes('aeroporto') || v.includes('comercia')) {
      return 'Classe A';
    }
    if (d.includes('centro') || d.includes('gamboa') || v.includes('shopping') || v.includes('residencia')) {
      return 'Classe AB';
    }
    return 'Classe B';
  };

  const normalizeCityName = (rawCity) => {
    const raw = String(rawCity || '').trim();
    if (!raw) return 'São Paulo';
    const key = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (key === 'sao paulo') return 'São Paulo';
    if (key === 'rio de janeiro') return 'Rio de Janeiro';
    if (key === 'belo horizonte') return 'Belo Horizonte';
    if (key === 'salvador') return 'Salvador';
    if (key === 'sorocaba') return 'Sorocaba';
    if (key === 'cuiaba') return 'Cuiabá';
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  };

  const oohDisplayGroups = [];
  const seenCondos = new Set();

  oohRaw.forEach((item) => {
    const p = item.properties || {};
    const itemId = p.id || p.code;
    const condoId = itemIdToCondoId[itemId];
    const coords = item?.geometry?.coordinates || [];
    const lng = Number(coords[0] || p.longitude || -46.68);
    const lat = Number(coords[1] || p.latitude || -23.56);

    if (condoId) {
      if (seenCondos.has(condoId)) return;
      seenCondos.add(condoId);

      const towerItems = oohRaw.filter((it) => itemIdToCondoId[it?.properties?.id || it?.properties?.code] === condoId);
      const firstProps = towerItems[0]?.properties || {};
      const firstCoords = towerItems[0]?.geometry?.coordinates || [];
      const rawName = firstProps.saved_name || firstProps.name || 'Condomínio Residencial';
      const baseCondoName = rawName.split(/\s*-\s*/)[0].trim();

      const totalScreens = towerItems.reduce((acc, it) => acc + (Number(it?.properties?.screens) || 1), 0);
      const totalInsertions = towerItems.reduce((acc, it) => acc + (Number(it?.properties?.period_insertions) || 0), 0);
      const rawCondoImpacts = towerItems.reduce((acc, it) => acc + (Number(it?.metrics?.impacts ?? it?.properties?.period_insertions) || 0), 0);
      const totalImpacts = rawCondoImpacts > 10 ? rawCondoImpacts : Math.max(3600, totalInsertions);
      const totalReach = Math.max(240, Math.round(totalImpacts / 3.40));
      const avgFrequency = +(totalImpacts / Math.max(1, totalReach)).toFixed(2);
      const totalOriginalPrice = towerItems.reduce((acc, it) => acc + (Number(it?.properties?.original_price || it?.total_price || it?.properties?.price) || 0), 0);
      const totalNetPrice = towerItems.reduce((acc, it) => acc + (Number(it?.total_price || it?.properties?.price) || 0), 0);
      const unitTowerPrice = Number(firstProps.price) || 441.60;

      const fmtObj = (firstProps.format && firstProps.format[0]) || {};
      const resolution = fmtObj.width && fmtObj.height ? `${fmtObj.width}x${fmtObj.height}` : '1280x720';
      const categoryLabel = firstProps.midia || firstProps.vertical || 'Elevadores Residenciais';
      const macroAmbiente = normalizeMacroAmbiente(firstProps.vertical, categoryLabel);
      const districtVal = firstProps.region || firstProps.district || 'Centro';
      const cityVal = normalizeCityName(firstProps.city);
      const stateVal = firstProps.state || 'SP';
      const zoneVal = inferOohZone(districtVal, cityVal, stateVal);
      const socialClassVal = inferOohSocialClass(firstProps.social_class, districtVal, categoryLabel);
      const towerCodesList = towerItems.map((t) => t?.properties?.id || t?.properties?.code).filter(Boolean);
      const displayCode = towerCodesList.length > 1
        ? `${towerCodesList[0]} +${towerCodesList.length - 1}`
        : (towerCodesList[0] || `CONDO_${condoId}`);
      const groupCode = `CONDO_${condoId}`;

      if (!state.removedItems[groupCode]) {
        oohDisplayGroups.push({
          kind: 'condo_group',
          condoId,
          code: groupCode,
          displayCode,
          searchCodes: `${towerCodesList.join(' ')} ${groupCode}`,
          name: baseCondoName,
          vertical: categoryLabel,
          macroAmbiente,
          exhibitionType: 'Digital',
          isStatic: false,
          address: `${firstProps.address || ''}${firstProps.number ? ', ' + firstProps.number : ''}`,
          district: districtVal,
          zone: zoneVal,
          socialClass: socialClassVal,
          city: cityVal,
          state: stateVal,
          latitude: Number(firstCoords[1] || lat),
          longitude: Number(firstCoords[0] || lng),
          photo: firstProps.photo,
          resolution,
          towersCount: towerItems.length,
          screens: totalScreens,
          periodInsertions: totalInsertions,
          dailyInsertions: Math.round(totalInsertions / durationDays),
          exhibitionLabel: fmtInt(totalInsertions),
          dailyExhibitionLabel: fmtInt(Math.round(totalInsertions / durationDays)),
          impacts: totalImpacts,
          reach: totalReach,
          frequency: avgFrequency,
          unitTowerPrice,
          originalPrice: totalOriginalPrice,
          netPrice: totalNetPrice,
          residentDiscount: Math.max(0, totalOriginalPrice - totalNetPrice),
          pricingRuleLabel: `${towerItems.length} torres × ${fmtBRL(unitTowerPrice)}`,
          towers: towerItems.map((t, idx) => {
            const tp = t.properties || {};
            const orig = Number(tp.original_price || t.total_price || tp.price) || 0;
            const net = Number(t.total_price || tp.price) || 0;
            const tIns = Number(tp.period_insertions) || 0;
            const tImp = Number(t?.metrics?.impacts ?? tIns) || 0;
            return {
              index: idx + 1,
              code: tp.id || tp.code,
              name: tp.saved_name || tp.name,
              screens: Number(tp.screens) || 1,
              periodInsertions: tIns,
              dailyInsertions: Math.round(tIns / durationDays),
              impacts: tImp,
              originalPrice: orig,
              netPrice: net
            };
          })
        });
      }
    } else {
      const orig = Number(p.original_price || item.total_price || p.price) || 0;
      const net = Number(item.total_price || p.price) || 0;
      const screens = Number(p.screens) || 1;
      const midiaLabel = p.midia || p.vertical || 'OOH';
      const macroAmbiente = normalizeMacroAmbiente(p.vertical, midiaLabel);
      const isCommercial = String(midiaLabel).toLowerCase().includes('comercia');
      const isResidential = String(midiaLabel).toLowerCase().includes('residencia');
      const hasResidentDiscount = orig > net && (orig - net) > 1;
      const rawExhType = String(p.exhibition_type || p.type || 'Digital');
      const isStatic = rawExhType.toLowerCase().includes('estático') || rawExhType.toLowerCase().includes('estatico') || rawExhType.toLowerCase().includes('impresso');

      const fmtObj = (p.format && p.format[0]) || {};
      const unitSuffix = fmtObj.unit && fmtObj.unit !== 'px' ? fmtObj.unit : '';
      const resolution = fmtObj.width && fmtObj.height ? `${fmtObj.width}x${fmtObj.height}${unitSuffix}` : '1080x1920';

      const unitAssetWord = isStatic ? (screens > 1 ? 'faces' : 'face') : (screens > 1 ? 'telas' : 'tela');
      let pricingRuleLabel = `${screens} ${unitAssetWord} · ${durationDays} dias`;
      if (hasResidentDiscount) {
        pricingRuleLabel = `Tarifa condômino (-${fmtBRL(orig - net)})`;
      } else if (isCommercial && screens > 1) {
        const perScreen = net / screens;
        pricingRuleLabel = `${screens} telas × ${fmtBRL(perScreen)}`;
      } else if (isResidential) {
        pricingRuleLabel = `1 torre (${screens} ${screens > 1 ? 'telas' : 'tela'})`;
      }

      const rawInsertions = Number(p.period_insertions) || 0;
      const rawImpacts = Number(item?.metrics?.impacts) || 0;
      // Em mídias estáticas (Bancas, VLT, Empena, CPTM, Relógios), a exibição diária e o número de exibições são Fixa
      const syntheticDigitalInsertions = Math.max(8500, Math.round(net * 3.55));
      const periodInsertions = isStatic
        ? 0
        : (rawInsertions > 0 ? rawInsertions : syntheticDigitalInsertions);
      const dailyInsertions = isStatic
        ? 0
        : Math.round(periodInsertions / durationDays);
      const itemImpacts = rawImpacts > 10
        ? rawImpacts
        : isStatic
        ? Math.round(syntheticDigitalInsertions * 0.55)
        : periodInsertions;
      const rawReach = Number(item?.metrics?.reach || p.weekly_reach || 0);
      const targetFreq = isStatic ? 1.61 : (isResidential ? 3.40 : 2.45);
      const itemReach = rawReach > 10
        ? rawReach
        : Math.max(150, Math.round(itemImpacts / targetFreq));
      const rawFreq = Number(item?.metrics?.frequency || 0);
      const itemFrequency = (rawFreq > 0 && rawFreq < 50)
        ? +rawFreq.toFixed(2)
        : +(itemImpacts / Math.max(1, itemReach)).toFixed(2);

      const districtVal = p.region || p.district || 'Centro';
      const cityVal = normalizeCityName(p.city);
      const stateVal = p.state || 'SP';
      const zoneVal = inferOohZone(districtVal, cityVal, stateVal);
      const socialClassVal = inferOohSocialClass(p.social_class, districtVal, midiaLabel);

      if (!state.removedItems[itemId]) {
        oohDisplayGroups.push({
          kind: 'single_ooh',
          condoId: p.condominium_id || null,
          code: itemId,
          displayCode: itemId,
          searchCodes: String(itemId || ''),
          name: p.saved_name || p.name,
          vertical: midiaLabel,
          macroAmbiente,
          exhibitionType: isStatic ? 'Impresso' : 'Digital',
          isStatic,
          address: `${p.address || ''}${p.number ? ', ' + p.number : ''}`,
          district: districtVal,
          zone: zoneVal,
          socialClass: socialClassVal,
          city: cityVal,
          state: stateVal,
          latitude: lat,
          longitude: lng,
          photo: p.photo,
          resolution,
          towersCount: 1,
          screens,
          periodInsertions,
          dailyInsertions,
          exhibitionLabel: isStatic ? 'Fixa' : fmtInt(periodInsertions),
          dailyExhibitionLabel: isStatic ? 'Fixa' : fmtInt(dailyInsertions),
          impacts: itemImpacts,
          reach: itemReach,
          frequency: itemFrequency,
          originalPrice: orig,
          netPrice: net,
          residentDiscount: hasResidentDiscount ? (orig - net) : 0,
          hasResidentDiscount,
          isCommercial,
          isResidential,
          pricingRuleLabel
        });
      }
    }
  });

  // Agrupamento hierárquico de OOH por Categoria (midia: até 21+ categorias) e por Macro-Ambiente (vertical: 6 macro-ambientes)
  const oohCategoriesMap = {};
  const oohMacroMap = {};
  oohDisplayGroups.forEach((g) => {
    const cat = g.vertical || 'OOH';
    const macro = g.macroAmbiente || 'Ambientes Urbanos';
    if (!oohCategoriesMap[cat]) {
      oohCategoriesMap[cat] = {
        name: cat,
        macroAmbiente: macro,
        points: 0,
        groups: 0,
        screens: 0,
        net: 0,
        gross: 0,
        discount: 0
      };
    }
    oohCategoriesMap[cat].points += g.towersCount;
    oohCategoriesMap[cat].groups += 1;
    oohCategoriesMap[cat].screens += g.screens;
    oohCategoriesMap[cat].net += g.netPrice;
    oohCategoriesMap[cat].gross += g.originalPrice;
    oohCategoriesMap[cat].discount += g.residentDiscount;

    if (!oohMacroMap[macro]) {
      oohMacroMap[macro] = {
        name: macro,
        points: 0,
        groups: 0,
        screens: 0,
        insertions: 0,
        impacts: 0,
        reach: 0,
        net: 0,
        categoriesSet: new Set(),
        citiesSet: new Set()
      };
    }
    oohMacroMap[macro].points += g.towersCount;
    oohMacroMap[macro].groups += 1;
    oohMacroMap[macro].screens += g.screens;
    oohMacroMap[macro].insertions += (g.periodInsertions || 0);
    oohMacroMap[macro].impacts += (g.impacts || 0);
    oohMacroMap[macro].reach += (g.reach || g.impacts || 0);
    oohMacroMap[macro].net += g.netPrice;
    oohMacroMap[macro].categoriesSet.add(cat);
    if (g.city) oohMacroMap[macro].citiesSet.add(g.city);
  });

  const oohCategoriesList = Object.values(oohCategoriesMap).sort((a, b) => b.net - a.net);
  const oohMacroAmbientesList = Object.values(oohMacroMap)
    .map((mItem) => ({
      name: mItem.name,
      points: mItem.points,
      groups: mItem.groups,
      screens: mItem.screens,
      insertions: mItem.insertions,
      impacts: mItem.impacts,
      reach: mItem.reach,
      net: mItem.net,
      categoriesCount: mItem.categoriesSet.size,
      categories: Array.from(mItem.categoriesSet),
      cities: Array.from(mItem.citiesSet)
    }))
    .sort((a, b) => b.net - a.net);

  const getDigitalItemInvestment = (it) => {
    const rootTot = Number(it?.total_price);
    if (Number.isFinite(rootTot) && rootTot > 0) return rootTot;
    return Number(it?.properties?.total_price || it?.properties?.price || 0);
  };

  const getDigitalItemCpm = (it) => {
    const cpmRaw = it?.properties?.ads_product?.cpm_value || it?.properties?.price || 0;
    return Number(String(cpmRaw).replace(',', '.')) || 0;
  };

  const getDigitalItemImpressions = (it) => {
    const inv = getDigitalItemInvestment(it);
    const cpm = getDigitalItemCpm(it);
    if (inv > 0 && cpm > 0) return Math.round((inv / cpm) * 1000);
    return Number(it?.properties?.period_insertions || 0);
  };

  const getRadioItemInvestment = (it) => {
    const rootTot = Number(it?.total_price || it?.investment);
    if (Number.isFinite(rootTot) && rootTot > 0) return rootTot;
    return Number(it?.properties?.price || 0);
  };

  const oohGross = +oohDisplayGroups.reduce((a, g) => a + g.originalPrice, 0).toFixed(2);
  const oohResidentDiscount = +oohDisplayGroups.reduce((a, g) => a + g.residentDiscount, 0).toFixed(2);
  const oohSubtotalBeforeCoupon = +oohDisplayGroups.reduce((a, g) => a + g.netPrice, 0).toFixed(2);
  const couponDiscount = state.simulateCoupon ? +(oohSubtotalBeforeCoupon * 0.10).toFixed(2) : 0;
  const oohNet = +(oohSubtotalBeforeCoupon - couponDiscount).toFixed(2);

  const portaisNet = +portaisItems.reduce((a, it) => a + getDigitalItemInvestment(it), 0).toFixed(2);
  const revistasNet = +revistasItems.reduce((a, it) => a + getDigitalItemInvestment(it), 0).toFixed(2);
  const digitalNet = +(portaisNet + revistasNet).toFixed(2);
  const radioNet = +radioItems.reduce((a, it) => a + getRadioItemInvestment(it), 0).toFixed(2);

  const onlinePayableNow = +(oohNet + digitalNet).toFixed(2);
  const trueProposalTotal = +(onlinePayableNow + radioNet).toFixed(2);
  const totalDiscounts = +(oohResidentDiscount + couponDiscount).toFixed(2);
  const totalGrossProposal = +(trueProposalTotal + totalDiscounts).toFixed(2);

  const hasRemovedOoh = Object.keys(state.removedItems).length > 0;
  const hasOohGroups = oohDisplayGroups.length > 0;
  const oohTotalScreens = !hasOohGroups
    ? 0
    : hasRemovedOoh
      ? oohDisplayGroups.reduce((a, g) => a + g.screens, 0)
      : Number(campaign?.items_summary?.total_screens || rawPayload?.metrics?.screens || oohDisplayGroups.reduce((a, g) => a + g.screens, 0));
  const oohTotalPoints = !hasOohGroups
    ? 0
    : hasRemovedOoh
      ? oohDisplayGroups.reduce((a, g) => a + g.towersCount, 0)
      : Number(campaign?.items_summary?.total_points || rawPayload?.metrics?.points || oohRaw.length);
  const oohStaticPointsCount = !hasOohGroups
    ? 0
    : oohDisplayGroups.filter((g) => g.isStatic).reduce((a, g) => a + g.towersCount, 0);
  const oohDigitalPointsCount = Math.max(0, oohTotalPoints - oohStaticPointsCount);
  const oohStaticScreensCount = !hasOohGroups
    ? 0
    : oohDisplayGroups.filter((g) => g.isStatic).reduce((a, g) => a + g.screens, 0);
  const oohDigitalScreensCount = Math.max(0, oohTotalScreens - oohStaticScreensCount);

  const oohTotalInsertions = !hasOohGroups
    ? 0
    : hasRemovedOoh
      ? oohDisplayGroups.reduce((a, g) => a + (g.isStatic ? 0 : g.periodInsertions), 0)
      : Number(campaign?.items_summary?.total_insertions || rawPayload?.metrics?.insertions || oohDisplayGroups.reduce((a, g) => a + (g.isStatic ? 0 : g.periodInsertions), 0));
  const oohDailyInsertions = !hasOohGroups ? 0 : Math.round(oohTotalInsertions / durationDays);

  const sumOohGroupImpacts = oohDisplayGroups.reduce((a, g) => a + (g.impacts || 0), 0);
  const oohImpacts = !hasOohGroups
    ? 0
    : hasRemovedOoh
      ? sumOohGroupImpacts
      : Math.max(Number(rawPayload?.metrics?.impacts || 0), sumOohGroupImpacts);

  const sumOohGroupReach = oohDisplayGroups.reduce((a, g) => a + (g.reach || 0), 0);
  const oohReach = !hasOohGroups
    ? 0
    : hasRemovedOoh
      ? sumOohGroupReach
      : Math.max(Number(rawPayload?.metrics?.reach || 0), Math.round(sumOohGroupReach * 0.85));

  const oohFrequency = (!hasOohGroups || oohReach <= 0)
    ? 0
    : +(oohImpacts / oohReach).toFixed(2);
  const oohCitiesList = Array.from(new Set(oohDisplayGroups.map((g) => g.city).filter(Boolean)));
  const oohCitiesCount = oohCitiesList.length;

  const portaisImpressions = portaisItems.reduce((a, it) => a + getDigitalItemImpressions(it), 0);
  const revistasImpressions = revistasItems.reduce((a, it) => a + getDigitalItemImpressions(it), 0);

  const radioNormalized = radioItems.map((it) => {
    const p = it.properties || {};
    const rp = p.radio_product || {};
    const netName = rp?.network?.name || 'CBN';
    const coverageLabel = rp.coverage_label || p.city || 'Nacional';
    const coverageUf = rp.coverage || p.state || 'BR';
    const weeklyIns = Number(rp.insertions || p.insertions || 7);
    const totalIns = weeklyIns * weeks;
    const timeWindow = rp.time_start && rp.time_end ? `${rp.time_start} às ${rp.time_end}` : 'Rotativo';
    const daysRaw = String(rp.days_of_week || p.days_of_week || 'seg_dom').toLowerCase();
    const frequencyDaysLabel = daysRaw.includes('seg_sex')
      ? 'Segunda a sexta'
      : daysRaw.includes('sab_dom')
        ? 'Sábado e domingo'
        : 'Segunda a domingo';
    const rawProgram = p.saved_name || rp.title || p.name || 'Programação Rádio';
    const cleanDaypart = rawProgram.split('|')[0].trim();
    const totalPrice = getRadioItemInvestment(it);
    return {
      code: p.id || p.code,
      itemKey: it._itemKey || `rad_${p.id || p.code}`,
      stationName: `Rádio ${netName}`,
      programLabel: rawProgram,
      cleanTitle: `Faixa ${cleanDaypart} — ${coverageLabel} (${coverageUf})`,
      city: coverageLabel,
      state: coverageUf,
      timeWindow,
      frequencyDaysLabel,
      spotDuration: Number(rp.spot_duration || 30),
      weeklyInsertions: weeklyIns,
      totalInsertions: totalIns,
      unitInsertionPrice: totalIns > 0 ? totalPrice / totalIns : totalPrice,
      totalPrice,
      vertical: 'Rádio'
    };
  });

  const radioWeeklyInsertions = radioNormalized.reduce((a, r) => a + r.weeklyInsertions, 0);
  const radioTotalInsertions = radioNormalized.reduce((a, r) => a + r.totalInsertions, 0);
  const artFormats = buildCampaignArtFormats(campaign, oohRaw, portaisItems, revistasItems);

  return {
    id: rawPayload.id || 743446,
    campaignName: campaign.name || 'Campanha Multicanal',
    startDate: dateRange.start,
    endDate: dateRange.end,
    durationDays,
    weeks,
    financials: {
      oohGross,
      oohResidentDiscount,
      couponDiscount,
      totalDiscounts,
      oohNet,
      portaisNet,
      revistasNet,
      digitalNet,
      radioNet,
      onlinePayableNow,
      trueProposalTotal,
      totalGrossProposal
    },
    counts: {
      totalItems: rawItems.length,
      oohGroupsCount: oohDisplayGroups.length,
      oohPointsCount: oohTotalPoints,
      oohScreensCount: oohTotalScreens,
      oohDigitalPointsCount,
      oohStaticPointsCount,
      oohDigitalScreensCount,
      oohStaticScreensCount,
      oohCategoriesCount: oohCategoriesList.length,
      oohMacroAmbientesCount: oohMacroAmbientesList.length,
      oohCitiesCount,
      oohCitiesList,
      oohTotalInsertions,
      oohDailyInsertions,
      oohImpacts,
      oohReach,
      oohFrequency,
      portaisCount: portaisItems.length,
      portaisImpressions,
      revistasCount: revistasItems.length,
      revistasImpressions,
      radioCount: radioNormalized.length,
      radioWeeklyInsertions,
      radioTotalInsertions,
      artFormatsCount: artFormats.length
    },
    artFormats,
    oohCategoriesList,
    oohMacroAmbientesList,
    oohDisplayGroups,
    portaisItems: portaisItems.map((it, idx) => {
      const p = it.properties || {};
      const ads = p.ads_product || {};
      const name = p.saved_name || p.name || 'Produto Digital Globo';
      const isStreaming = name.toLowerCase().includes('globoplay') || String(ads.group_channel).includes('globo_play');
      const isVideo = name.toLowerCase().includes('vídeo') || String(p.midia).toLowerCase().includes('vídeo');
      const intMode = String(ads.intervention_mode || '').toLowerCase();
      const interventionLabel = intMode === 'com_skip' ? 'Com skip' : intMode === 'sem_skip' ? 'Sem skip' : null;
      const baseTitle = name
        .replace(/\s*-\s*(Globoplay|Portais\s*Globo|Portais)$/i, '')
        .replace(/^Display$/i, 'Banners de alta visibilidade')
        .replace(/^Vídeo\s+de\s+/i, 'Inserção de ')
        .trim();
      const formatTagLabel = isVideo
        ? `Vídeo${interventionLabel ? ' · ' + interventionLabel : ''}`
        : 'Display Digital';
      return {
        code: p.id || p.code,
        itemKey: it._itemKey || `dig_${idx}`,
        name,
        cleanTitle: baseTitle,
        formatTagLabel,
        mediaTypeLabel: isVideo ? 'Vídeo' : 'Display',
        interventionLabel,
        channelTypeLabel: isStreaming ? 'Globoplay' : 'Portais Globo',
        subtitleContext: isStreaming
          ? 'Streaming sob demanda · Smart TVs, Web e Mobile'
          : 'Rede de portais · G1, GE, Gshow, Receitas, Cartola e Globo.com',
        techSpecFooter: isVideo ? 'Full HD 16:9 (1920×1080 px)' : '6 formatos web e mobile',
        vehicles: isStreaming ? ['globoplay'] : ['g1', 'ge', 'gshow', 'receitas', 'cartola', 'globo.com'],
        cpm: getDigitalItemCpm(it),
        impressions: getDigitalItemImpressions(it),
        totalPrice: getDigitalItemInvestment(it),
        vertical: 'Portais Globo e Globoplay'
      };
    }),
    revistasItems: revistasItems.map((it, idx) => {
      const p = it.properties || {};
      const name = p.saved_name || p.name || 'Display Editorial';
      const titleName = name.replace(/^Display\s*-\s*/i, '').trim();
      return {
        code: p.id || p.code,
        itemKey: it._itemKey || `rev_${idx}`,
        name,
        editorialTitle: titleName,
        cpm: getDigitalItemCpm(it),
        impressions: getDigitalItemImpressions(it),
        totalPrice: getDigitalItemInvestment(it),
        vertical: 'Editora Globo Digital'
      };
    }),
    radioItems: radioNormalized
  };
}

function ensureValidActiveChannel(model) {
  const c = model.counts;
  const available = [];
  if (c.oohPointsCount > 0) available.push('ooh');
  if (c.revistasCount > 0) available.push('revistas');
  if (c.portaisCount > 0) available.push('portais');
  if (c.radioCount > 0) available.push('radio');
  if (!available.includes(state.channelFilter)) {
    state.channelFilter = available[0] || 'ooh';
  }
}

function formatHumanAddress(addr, district, city, uf) {
  const preserveUpper = new Set([
    'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES', 'MT', 'MS', 'PA', 'AM', 'MA', 'PB', 'RN', 'AL', 'SE', 'PI', 'TO', 'RO', 'AC', 'AP', 'RR',
    'S/N', 'SN', 'KM', 'BR', 'CPTM', 'BRT', 'VLT', 'JK', 'II', 'III', 'IV', 'VI', 'L7', 'L8', 'L9', 'L11', 'L12'
  ]);
  const lowerPreps = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos']);

  const humanizePart = (raw) => {
    const cleaned = String(raw || '')
      .replace(/\s+,/g, ',')
      .replace(/,\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!cleaned) return '';
    return cleaned
      .split(' ')
      .map((word, idx) => {
        const cleanWord = word.replace(/[,.-]/g, '').toUpperCase();
        if (preserveUpper.has(cleanWord)) {
          return word.toUpperCase();
        }
        const lower = word.toLowerCase();
        if (idx > 0 && lowerPreps.has(lower)) {
          return lower;
        }
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ');
  };

  const streetPart = humanizePart(addr);
  const districtPart = humanizePart(district);
  const cityPart = humanizePart(city);
  const ufPart = String(uf || '').trim().toUpperCase();

  const locSuffix = [
    districtPart,
    cityPart ? (ufPart ? `${cityPart}/${ufPart}` : cityPart) : ufPart
  ].filter(Boolean).join(', ');

  if (streetPart && locSuffix) return `${streetPart} · ${locSuffix}`;
  return streetPart || locSuffix || 'Localização sob consulta';
}

function initApp() {
  // Registra cenários de canal único para simulação rápida (Só Digital, Só Revistas Digitais, Só Rádio)
  if (window.PROPOSAL_SCENARIOS && window.PROPOSAL_SCENARIOS.completo && !window.PROPOSAL_SCENARIOS.so_digital) {
    const basePayload = window.PROPOSAL_SCENARIOS.completo.payload;
    const buildSingleChannelScenario = (id, label, description, targetChannel, codeSuffix, customId) => {
      const cloned = JSON.parse(JSON.stringify(basePayload));
      cloned.id = customId;
      cloned.code = `${cloned.code || '743446'}-${codeSuffix}`;
      cloned.metrics = {};

      const sourceItems =
        cloned?.campaign?.items ||
        cloned?.campaigns?.Campaign_740747?.items ||
        cloned?.items ||
        [];
      const filteredItems = sourceItems.filter((it) => classifyCartItem(it) === targetChannel);

      if (cloned.campaign) {
        cloned.campaign.name = label.replace(/^\d+\.\s*/, '');
        cloned.campaign.items = filteredItems;
        cloned.campaign.items_summary = {};
        cloned.campaign.formats = {};
      }
      if (cloned.campaigns && cloned.campaigns.Campaign_740747) {
        cloned.campaigns.Campaign_740747.items = filteredItems;
        cloned.campaigns.Campaign_740747.items_summary = {};
        cloned.campaigns.Campaign_740747.formats = {};
      }
      cloned.items = filteredItems;

      return { id, label, description, payload: cloned };
    };

    window.PROPOSAL_SCENARIOS.so_digital = buildSingleChannelScenario(
      'so_digital',
      '5. Só Digital — Portais e Globoplay (5 formatos)',
      'Campanha exclusiva em Portais Globo (G1, GE, Gshow, Receitas, Cartola) e Globoplay.',
      'portais',
      'DIG',
      743451
    );

    window.PROPOSAL_SCENARIOS.so_revistas = buildSingleChannelScenario(
      'so_revistas',
      '6. Só Revistas Digitais — Editora Globo (4 títulos)',
      'Campanha exclusiva em Revistas e Jornais Digitais (O Globo, Extra, Galileu, Globo Rural).',
      'revistas',
      'REV',
      743452
    );

    window.PROPOSAL_SCENARIOS.so_radio = buildSingleChannelScenario(
      'so_radio',
      '7. Só Rádio — Rádio CBN (4 faixas)',
      'Campanha exclusiva de spots 30" nas praças CBN São Paulo e Brasília.',
      'radio',
      'RAD',
      743453
    );
  }

  const params = new URLSearchParams(window.location.search);
  const urlScenario = params.get('scenario');
  if (urlScenario && window.PROPOSAL_SCENARIOS[urlScenario]) {
    state.scenarioKey = urlScenario;
  }
  const urlStatus = params.get('status');
  if (urlStatus && ['awaiting', 'processing', 'completed'].includes(urlStatus)) {
    state.proposalStatus = urlStatus;
    const statusSel = document.getElementById('proposalStatusSelect');
    if (statusSel) statusSel.value = urlStatus;
  }
  if (params.get('coupon') === '1') {
    state.simulateCoupon = true;
    const couponChk = document.getElementById('toggleCoupon');
    if (couponChk) couponChk.checked = true;
  }
  if (params.get('unlogged') === '1') {
    state.simulateUnlogged = true;
    const unloggedChk = document.getElementById('toggleUnlogged');
    if (unloggedChk) unloggedChk.checked = true;
  }

  const select = document.getElementById('scenarioSelect');
  select.innerHTML = Object.values(window.PROPOSAL_SCENARIOS)
    .map((sc) => `<option value="${sc.id}">${sc.label}</option>`)
    .join('');
  select.value = state.scenarioKey;

  select.addEventListener('change', (e) => {
    state.scenarioKey = e.target.value;
    state.subFilter = 'all';
    state.searchQuery = '';
    state.ambienteFilter = '';
    state.categoriaFilter = '';
    state.geoFilter = '';
    state.selectedForRemoval = {};
    state.removedItems = {};
    state.expandedCardMetrics = {};
    state.oohHeroMacroFilter = 'all';
    state.oohHeroSearch = '';
    state.artSearch = '';
    state.artAmbiente = 'all';
    state.artFormatDim = 'all';
    state.artMediaType = 'all';
    state.artCategory = 'all';
    state.artSelectedIds = [];
    state.activeArtModalFormatId = null;
    renderAll();
  });

  document.getElementById('toggleCoupon').addEventListener('change', (e) => {
    state.simulateCoupon = e.target.checked;
    renderAll();
  });

  document.getElementById('toggleUnlogged').addEventListener('change', (e) => {
    state.simulateUnlogged = e.target.checked;
    state.billingUnlockedInline = false;
    renderAll();
  });

  document.addEventListener('click', (ev) => {
    const container = document.getElementById('exportDropdownContainer');
    const menu = document.getElementById('exportMenu');
    if (container && menu && !container.contains(ev.target)) {
      menu.classList.add('hidden');
    }
  });

  let lastMobileState = isMobileView();
  window.addEventListener('resize', () => {
    const nowMobile = isMobileView();
    if (nowMobile !== lastMobileState) {
      lastMobileState = nowMobile;
      renderAll();
    } else {
      syncMainTabLabels();
    }
  });

  const initialMode = params.get('mode') === 'pdf' ? 'pdf' : 'desktop';
  setViewportMode(initialMode);
  if (initialMode === 'pdf' && params.get('print') === '1') {
    setTimeout(() => {
      window.print();
    }, 350);
  }
}

function getCurrentModel() {
  const sc = window.PROPOSAL_SCENARIOS[state.scenarioKey] || window.PROPOSAL_SCENARIOS.completo;
  return buildNormalizedModel(sc.payload);
}

function isMobileView() {
  const wrapper = typeof document !== 'undefined' ? document.getElementById('viewportWrapper') : null;
  const hasSimClass = wrapper && wrapper.classList.contains('mobile-simulator-wrapper');
  return state.viewportMode === 'mobile' || hasSimClass || (typeof window !== 'undefined' && window.innerWidth <= 768);
}

function syncMainTabLabels() {
  const mobile = isMobileView();
  const headerBar = document.getElementById('mainTabsHeaderBar');
  const nav = document.getElementById('mainTabsNav');
  const lblPlano = document.getElementById('tabLabel-plano');
  const lblArte = document.getElementById('tabLabel-arte');
  const lblPag = document.getElementById('tabLabel-pagamento');
  const cntPlano = document.getElementById('tabCountPlano');
  const cntArte = document.getElementById('tabCountArte');

  if (headerBar) {
    headerBar.className = mobile
      ? 'border-b border-ds-border px-3 bg-ds-surface overflow-x-auto no-scrollbar'
      : 'border-b border-ds-border px-3.5 sm:px-6 bg-ds-surface overflow-x-auto no-scrollbar';
  }
  if (nav) {
    nav.className = mobile
      ? 'flex items-center justify-start gap-4 -mb-px w-full'
      : 'flex items-center justify-between sm:justify-start gap-3 sm:gap-8 -mb-px w-full';
  }
  if (lblPlano) lblPlano.textContent = mobile ? 'Plano' : 'Plano de mídia';
  if (lblArte) lblArte.textContent = mobile ? 'Artes' : 'Especificações de arte';
  if (lblPag) lblPag.textContent = mobile ? 'Pagamento' : 'Pagamento e aprovação';

  ['plano', 'arte', 'pagamento'].forEach((t) => {
    const btn = document.getElementById(`tabBtn-${t}`);
    if (!btn) return;
    const isActive = state.activeTab === t;
    const iconEl = btn.querySelector('i');
    if (iconEl) {
      const iconName = t === 'plano' ? 'uil-layer-group' : t === 'arte' ? 'uil-image-check' : 'uil-credit-card';
      iconEl.className = `uil ${iconName} ${mobile ? 'text-sm' : 'text-sm sm:text-lg'}`;
    }
    if (mobile) {
      btn.className = isActive
        ? 'py-2.5 px-1 border-b-2 border-primary text-primary font-display font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition focus:outline-none'
        : 'py-2.5 px-1 border-b-2 border-transparent text-ds-textSecondary hover:text-ds-textMain font-display font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition focus:outline-none';
    } else {
      btn.className = isActive
        ? 'py-3 sm:py-4 px-1 sm:px-2 border-b-2 border-primary text-primary font-display font-bold text-xs sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap transition focus:outline-none'
        : 'py-3 sm:py-4 px-1 sm:px-2 border-b-2 border-transparent text-ds-textSecondary hover:text-ds-textMain font-display font-bold text-xs sm:text-base flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap transition focus:outline-none';
    }
  });

  if (cntPlano) {
    cntPlano.className = mobile
      ? 'hidden'
      : state.activeTab === 'plano'
      ? 'px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-primary-light text-primary'
      : 'px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-ds-bg text-ds-textSecondary';
  }
  if (cntArte) {
    cntArte.className = mobile
      ? 'hidden'
      : state.activeTab === 'arte'
      ? 'px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-primary-light text-primary'
      : 'px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-ds-bg text-ds-textSecondary';
  }

  const heroEl = document.getElementById('proposalHeroSection');
  const metricsEl = document.getElementById('modularMetricsSection');
  if (heroEl) heroEl.classList.remove('hidden');
  if (metricsEl) metricsEl.classList.remove('hidden');

  syncMobileHoverElimination();
}

function syncMobileHoverElimination() {
  if (typeof document === 'undefined') return;
  const wrapper = document.getElementById('viewportWrapper');
  if (!wrapper) return;
  const mobile = isMobileView();

  const allNodes = wrapper.querySelectorAll('*');
  allNodes.forEach((el) => {
    if (mobile) {
      if (el.hasAttribute('title')) {
        el.setAttribute('data-desktop-title', el.getAttribute('title') || '');
        el.removeAttribute('title');
      }
      if (el.classList && el.classList.length > 0) {
        const toRemove = [];
        el.classList.forEach((cls) => {
          if (cls.startsWith('hover:') || cls.startsWith('group-hover') || cls === 'cursor-help') {
            toRemove.push(cls);
          }
        });
        if (toRemove.length > 0) {
          const prev = el.getAttribute('data-desktop-hover-classes');
          const merged = prev ? Array.from(new Set([...prev.split(' '), ...toRemove])).join(' ') : toRemove.join(' ');
          el.setAttribute('data-desktop-hover-classes', merged);
          toRemove.forEach((cls) => el.classList.remove(cls));
        }
      }
    } else {
      if (el.hasAttribute('data-desktop-title')) {
        const savedTitle = el.getAttribute('data-desktop-title');
        if (savedTitle) el.setAttribute('title', savedTitle);
        el.removeAttribute('data-desktop-title');
      }
      if (el.hasAttribute('data-desktop-hover-classes')) {
        const savedClasses = (el.getAttribute('data-desktop-hover-classes') || '').split(' ').filter(Boolean);
        savedClasses.forEach((cls) => el.classList.add(cls));
        el.removeAttribute('data-desktop-hover-classes');
      }
    }
  });
}

function renderAll() {
  const model = getCurrentModel();
  ensureValidActiveChannel(model);
  syncMainTabLabels();
  renderJourneyStepper(model);
  renderHeroSection(model);
  renderModularMetrics(model);
  renderFilterBar(model);
  renderMediaPlanList(model);
  renderArtTab(model);
  renderPaymentTab(model);
  renderFaqSection(model);
  renderPdfDocument(model);
  syncMobileHoverElimination();

  document.getElementById('tabCountPlano').textContent = model.counts.totalItems;
  document.getElementById('tabCountArte').textContent = model.artFormats.length;

  if (state.viewportMode !== 'pdf') {
    setTimeout(() => {
      updateLeafletMap(model);
    }, 60);
  }
}

/**
 * ============================================================================
 * 0. STEPPER DE JORNADA DO TOPO (FIGMA 3387-12075: 1. Resumo — 2. Pagamento — 3. Ativar campanha)
 * ============================================================================
 */
function renderJourneyStepper() {
  const isPaidOrDone = state.proposalStatus === 'processing' || state.proposalStatus === 'completed' || state.orderSubmitted;
  const step = isPaidOrDone ? 3 : state.activeTab === 'pagamento' ? 2 : 1;

  const step3Label = state.proposalStatus === 'completed'
    ? 'Concluída'
    : isPaidOrDone
    ? 'Ativa'
    : 'Ativar';
  const step3FullLabel = state.proposalStatus === 'completed'
    ? 'Campanha concluída'
    : isPaidOrDone
    ? 'Campanha ativa'
    : 'Ativar campanha';

  const steps = [
    { num: 1, label: 'Resumo', action: "goToJourneyStep(1)" },
    { num: 2, label: 'Pagamento', action: "goToJourneyStep(2)" },
    { num: 3, label: step3Label, fullLabel: step3FullLabel, action: "goToJourneyStep(3)" }
  ];

  const buildStepperHtml = (compact = false) => `
    <div class="inline-flex items-center ${compact ? 'w-full justify-between bg-white px-3.5 py-2 rounded-xl border border-ds-border shadow-sm' : 'gap-2.5'} text-xs">
      ${steps.map((s, idx) => {
        const isDone = step > s.num || (isPaidOrDone && s.num === 3);
        const isCurrent = step === s.num && !isDone;
        const circleClass = isDone
          ? 'bg-emerald-600 text-white'
          : isCurrent
          ? 'bg-primary text-white shadow-sm'
          : 'bg-ds-bg text-ds-textMuted border border-ds-borderStrong';
        const labelClass = isCurrent
          ? 'font-display font-bold text-ds-textMain'
          : isDone
          ? 'font-semibold text-emerald-700'
          : 'font-medium text-ds-textMuted';

        return `
          <button onclick="${s.action}" class="inline-flex items-center gap-1.5 group transition whitespace-nowrap">
            <span class="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-display font-bold text-[11px] transition ${circleClass}">
              ${isDone ? '<i class="uil uil-check text-xs"></i>' : s.num}
            </span>
            <span class="${labelClass} group-hover:text-primary transition">${compact && s.fullLabel ? s.label : (s.fullLabel || s.label)}</span>
          </button>
          ${idx < steps.length - 1 ? `
            <span class="${compact ? 'flex-1 mx-2' : 'w-8'} h-[1.5px] ${step > s.num ? 'bg-emerald-500' : 'bg-ds-borderStrong'}"></span>
          ` : ''}
        `;
      }).join('')}
    </div>
  `;

  const desktopEl = document.getElementById('journeyStepperContainer');
  const mobileEl = document.getElementById('journeyStepperMobileContainer');
  if (desktopEl) desktopEl.innerHTML = buildStepperHtml(false);
  if (mobileEl) mobileEl.innerHTML = buildStepperHtml(true);
}

function setProposalStatus(newStatus) {
  state.proposalStatus = newStatus || 'awaiting';
  state.orderSubmitted = state.proposalStatus === 'processing' || state.proposalStatus === 'completed';
  if (state.proposalStatus !== 'awaiting') {
    state.pixGenerated = false;
    state.boletoGenerated = false;
  }
  const sel = document.getElementById('proposalStatusSelect');
  if (sel && sel.value !== state.proposalStatus) {
    sel.value = state.proposalStatus;
  }
  const currentModel = getCurrentModel();
  renderJourneyStepper();
  renderHeroSection(currentModel);
  renderPaymentTab(currentModel);
  renderPdfDocument(currentModel);
}

function cycleProposalStatus() {
  const order = ['awaiting', 'processing', 'completed'];
  const nextIdx = (order.indexOf(state.proposalStatus) + 1) % order.length;
  const next = order[nextIdx];
  setProposalStatus(next);
  const labels = {
    awaiting: 'Status: Aguardando pagamento',
    processing: 'Status: Campanha ativa (pagamento compensado)',
    completed: 'Status: Campanha concluída'
  };
  showToast(labels[next]);
}

function getDisplayProposalId(m) {
  const model = m || getCurrentModel();
  return state.clonedScenariosCount > 0 ? `${model.id}-R${state.clonedScenariosCount}` : String(model.id);
}

function renewCampaignProposal(proposalId) {
  const id = proposalId || getDisplayProposalId(getCurrentModel());
  goToAdDetailingStep(id, 'renovar');
}

function scrollActiveViewportToTop(smooth = true) {
  const behavior = smooth ? 'smooth' : 'auto';
  const wrapper = document.getElementById('viewportWrapper');
  if (wrapper && wrapper.classList.contains('mobile-simulator-wrapper')) {
    wrapper.scrollTo({ top: 0, behavior });
  }
  window.scrollTo({ top: 0, behavior });
}

function goToJourneyStep(stepNum) {
  if (stepNum === 1) {
    switchMainTab('plano');
    scrollActiveViewportToTop(true);
  } else if (stepNum === 2) {
    if (state.proposalStatus !== 'awaiting') {
      setProposalStatus('awaiting');
    }
    goToPaymentAnchor();
  } else if (stepNum === 3) {
    if (state.proposalStatus === 'awaiting') {
      setProposalStatus('processing');
    }
    goToPaymentAnchor();
  }
  const currentModel = getCurrentModel();
  renderJourneyStepper();
  renderHeroSection(currentModel);
  renderPaymentTab(currentModel);
  renderPdfDocument(currentModel);
}

/**
 * ============================================================================
 * 1. HERO DA PROPOSTA & RESUMO FINANCEIRO (MANUAL DE MARCA + FIGMA 3387-12075)
 * - No Mobile, quantidades de itens ficam empilhadas abaixo do título do canal.
 * - Suporta os 3 status da proposta:
 *   1) Aguardando pagamento
 *   2) Em processamento (seção de pagamento reduzida visualmente)
 *   3) Proposta concluída (seção reduzida + item "Renovar campanha")
 * ============================================================================
 */
function renderHeroSection(m) {
  const f = m.financials;
  const c = m.counts;
  const hasRadio = c.radioCount > 0;
  const hasDiscounts = f.totalDiscounts > 0;
  const mobile = isMobileView();

  const channelRows = [];

  if (c.oohPointsCount > 0) {
    channelRows.push(`
      <button
        type="button"
        onclick="jumpToChannelFromHero('ooh')"
        class="w-full text-left flex items-center justify-between gap-2 ${mobile ? 'py-2.5 px-3' : 'py-3 px-4'} hover:bg-ds-bg/60 transition group"
      >
        ${mobile ? `
          <div class="min-w-0">
            <div class="font-display font-bold text-xs text-ds-textMain group-hover:text-primary transition truncate leading-tight">OOH</div>
            <div class="text-[11px] text-ds-textSecondary leading-tight mt-0.5">${c.oohPointsCount} ${c.oohPointsCount > 1 ? 'pontos' : 'ponto'}</div>
          </div>
        ` : `
          <div class="flex items-baseline gap-1.5 min-w-0 truncate">
            <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain group-hover:text-primary transition truncate">OOH</span>
            <span class="text-[11px] text-ds-textSecondary shrink-0">· ${c.oohPointsCount} ${c.oohPointsCount > 1 ? 'pontos' : 'ponto'}</span>
          </div>
        `}
        <div class="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain">${fmtBRL(f.oohNet)}</span>
          <i class="uil uil-angle-right text-sm text-ds-textMuted group-hover:text-primary transition"></i>
        </div>
      </button>
    `);
  }

  if (c.portaisCount > 0) {
    channelRows.push(`
      <button
        type="button"
        onclick="jumpToChannelFromHero('portais')"
        class="w-full text-left flex items-center justify-between gap-2 ${mobile ? 'py-2.5 px-3' : 'py-3 px-4'} hover:bg-ds-bg/60 transition group"
      >
        ${mobile ? `
          <div class="min-w-0">
            <div class="font-display font-bold text-xs text-ds-textMain group-hover:text-primary transition truncate leading-tight">Portais e Globoplay</div>
            <div class="text-[11px] text-ds-textSecondary leading-tight mt-0.5">${c.portaisCount} ${c.portaisCount > 1 ? 'produtos' : 'produto'}</div>
          </div>
        ` : `
          <div class="flex items-baseline gap-1.5 min-w-0 truncate">
            <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain group-hover:text-primary transition truncate">Portais e Globoplay</span>
            <span class="text-[11px] text-ds-textSecondary shrink-0">· ${c.portaisCount} ${c.portaisCount > 1 ? 'produtos' : 'produto'}</span>
          </div>
        `}
        <div class="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain">${fmtBRL(f.portaisNet)}</span>
          <i class="uil uil-angle-right text-sm text-ds-textMuted group-hover:text-primary transition"></i>
        </div>
      </button>
    `);
  }

  if (c.revistasCount > 0) {
    channelRows.push(`
      <button
        type="button"
        onclick="jumpToChannelFromHero('revistas')"
        class="w-full text-left flex items-center justify-between gap-2 ${mobile ? 'py-2.5 px-3' : 'py-3 px-4'} hover:bg-ds-bg/60 transition group"
      >
        ${mobile ? `
          <div class="min-w-0">
            <div class="font-display font-bold text-xs text-ds-textMain group-hover:text-primary transition truncate leading-tight">Revistas e Jornais</div>
            <div class="text-[11px] text-ds-textSecondary leading-tight mt-0.5">${c.revistasCount} ${c.revistasCount > 1 ? 'títulos' : 'título'}</div>
          </div>
        ` : `
          <div class="flex items-baseline gap-1.5 min-w-0 truncate">
            <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain group-hover:text-primary transition truncate">Revistas e Jornais</span>
            <span class="text-[11px] text-ds-textSecondary shrink-0">· ${c.revistasCount} ${c.revistasCount > 1 ? 'títulos' : 'título'}</span>
          </div>
        `}
        <div class="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain">${fmtBRL(f.revistasNet)}</span>
          <i class="uil uil-angle-right text-sm text-ds-textMuted group-hover:text-primary transition"></i>
        </div>
      </button>
    `);
  }

  if (hasRadio) {
    channelRows.push(`
      <button
        type="button"
        onclick="jumpToChannelFromHero('radio')"
        class="w-full text-left flex items-center justify-between gap-2 ${mobile ? 'py-2.5 px-3' : 'py-3 px-4'} hover:bg-ds-bg/60 transition group"
      >
        ${mobile ? `
          <div class="min-w-0">
            <div class="font-display font-bold text-xs text-ds-textMain group-hover:text-primary transition truncate leading-tight">Rádio CBN</div>
            <div class="text-[11px] text-ds-textSecondary leading-tight mt-0.5">${c.radioCount} ${c.radioCount > 1 ? 'programas' : 'programa'}</div>
          </div>
        ` : `
          <div class="flex items-baseline gap-1.5 min-w-0 truncate">
            <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain group-hover:text-primary transition truncate">Rádio CBN</span>
            <span class="text-[11px] text-ds-textSecondary shrink-0">· ${c.radioCount} ${c.radioCount > 1 ? 'programas' : 'programa'}</span>
          </div>
        `}
        <div class="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain">${fmtBRL(f.radioNet)}</span>
          <i class="uil uil-angle-right text-sm text-ds-textMuted group-hover:text-primary transition"></i>
        </div>
      </button>
    `);
  }

  // Rodapé fluido de Cupom de Desconto (exibido apenas enquanto Aguardando pagamento)
  const heroCouponFooterHtml = state.simulateCoupon ? `
    <div class="pt-1 flex items-center justify-between gap-2 text-xs">
      <span class="inline-flex items-center gap-1.5 text-emerald-800 font-bold truncate">
        <i class="uil uil-ticket text-emerald-700 text-base"></i>
        Cupom ${state.couponCode} (-${fmtBRL(f.couponDiscount)})
      </span>
      <button onclick="toggleCouponSimulation(false)" class="text-[11px] font-bold text-ds-textSecondary hover:text-rose-700 underline shrink-0">
        remover
      </button>
    </div>
  ` : `
    <div class="pt-1 space-y-2">
      <div class="flex items-center justify-between gap-2 text-xs">
        <span class="inline-flex items-center gap-1.5 text-ds-textSecondary font-medium">
          <i class="uil uil-ticket text-primary text-base"></i>
          <span>Tem um cupom?</span>
        </span>
        <button onclick="toggleHeroCouponDrawer()" class="font-display font-bold text-ds-textMain hover:text-primary transition whitespace-nowrap">
          ${state.heroCouponOpen ? 'cancelar' : '+ digitar cupom'}
        </button>
      </div>
      ${state.heroCouponOpen ? `
        <div class="flex items-center gap-2">
          <input
            id="heroCouponInput"
            type="text"
            value="${state.couponCode}"
            oninput="state.couponCode = this.value.toUpperCase()"
            placeholder="Ex: AQUIADS10"
            class="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-ds-borderStrong bg-ds-surface text-xs font-bold text-ds-textMain uppercase focus:outline-none focus:bg-white focus:border-primary"
          />
          <button onclick="applyHeroCoupon()" class="px-3.5 py-1.5 rounded-lg bg-primary text-white font-display font-bold text-xs hover:opacity-95 transition shrink-0">
            aplicar
          </button>
        </div>
      ` : ''}
    </div>
  `;

  const displayProposalId = state.clonedScenariosCount > 0 ? `${m.id}-R${state.clonedScenariosCount}` : m.id;

  const statusMeta = state.proposalStatus === 'completed'
    ? {
        label: 'Campanha concluída',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-600'
      }
    : state.proposalStatus === 'processing'
    ? {
        label: 'Campanha ativa',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
        dotClass: 'bg-sky-600'
      }
    : {
        label: 'Aguardando pagamento',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500'
      };

  const paymentMethodSummaryLabel = state.paymentMethod === 'pix'
    ? 'PIX à vista'
    : state.paymentMethod === 'boleto'
    ? 'Boleto bancário'
    : `Cartão de crédito (${state.selectedInstallments}x s/ juros)`;

  // Coluna direita do Hero: reduzida visualmente quando paga ('processing') ou concluída ('completed')
  let heroRightColumnHtml = '';
  if (state.proposalStatus === 'processing') {
    heroRightColumnHtml = `
      <div class="${mobile ? '' : 'lg:col-span-5'} h-full bg-white rounded-[14px] border border-ds-borderStrong ${mobile ? 'p-3.5 space-y-3' : 'p-5 space-y-3.5'} flex flex-col justify-between shadow-xs">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-normal text-ds-textSecondary">Investimento total</span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
              Campanha ativa
            </span>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="font-display font-extrabold ${mobile ? 'text-2xl' : 'text-[28px]'} text-ds-textMain tracking-tight leading-none">${fmtBRL(f.trueProposalTotal)}</div>
              <div class="text-[11px] text-ds-textSecondary mt-1">Valor pago · ${paymentMethodSummaryLabel}</div>
            </div>
            <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <i class="uil uil-check-circle text-base"></i>
            </span>
          </div>
        </div>

        <div class="pt-1">
          <button type="button" onclick="goToPaymentAnchor()" class="inline-flex items-center gap-1 text-xs font-display font-bold text-ds-textMain hover:text-primary transition">
            <span>ver detalhes do pagamento</span>
            <i class="uil uil-angle-right text-sm text-primary"></i>
          </button>
        </div>
      </div>
    `;
  } else if (state.proposalStatus === 'completed') {
    heroRightColumnHtml = `
      <div class="${mobile ? '' : 'lg:col-span-5'} h-full bg-white rounded-[14px] border border-ds-borderStrong ${mobile ? 'p-3.5 space-y-3' : 'p-5 space-y-3.5'} flex flex-col justify-between shadow-xs">
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] sm:text-xs font-normal text-ds-textSecondary">Investimento total</span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
              <i class="uil uil-check-circle text-xs"></i>
              Campanha concluída
            </span>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="font-display font-extrabold ${mobile ? 'text-2xl' : 'text-[28px]'} text-ds-textMain tracking-tight leading-none">${fmtBRL(f.trueProposalTotal)}</div>
              <div class="text-[11px] text-ds-textSecondary mt-1">Valor pago · ${paymentMethodSummaryLabel}</div>
            </div>
            <span class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <i class="uil uil-check-circle text-base"></i>
            </span>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-primary-light/50 border border-primary/20 space-y-2">
          <div class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <div class="font-display font-bold text-xs text-ds-textMain">Quer veicular novamente?</div>
              <div class="text-[11px] text-ds-textSecondary leading-tight">Reative os mesmos canais para um novo período.</div>
            </div>
          </div>
          <button
            type="button"
            onclick="renewCampaignProposal('${displayProposalId}')"
            data-route="/campanhas/${displayProposalId}/detalhamento-anuncio"
            class="w-full py-2.5 px-4 rounded-xl bg-aqui-grad text-white font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition"
          >
            <i class="uil uil-redo text-sm"></i>
            <span>renovar campanha</span>
          </button>
        </div>
      </div>
    `;
  } else {
    heroRightColumnHtml = `
      <div class="${mobile ? '' : 'lg:col-span-5'} h-full bg-white rounded-[14px] border border-ds-borderStrong ${mobile ? 'p-3.5 space-y-3' : 'p-5 space-y-4'} flex flex-col justify-between shadow-xs">
        
        <div class="space-y-3">
          <!-- Bloco Principal: Investimento total -->
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] sm:text-xs font-normal text-ds-textSecondary">
                Investimento total
              </span>
              ${hasDiscounts ? `
                <span class="text-[11px] font-semibold text-[#199958] whitespace-nowrap">
                  Desc. -${fmtBRL(f.totalDiscounts)}
                </span>
              ` : ''}
            </div>

            ${hasDiscounts ? `
              <div class="text-[11px] text-ds-textMuted line-through leading-none mt-1">
                ${fmtBRL(f.totalGrossProposal)}
              </div>
            ` : ''}

            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-1">
              <span class="font-display font-extrabold ${mobile ? 'text-2xl' : 'text-[28px]'} text-ds-textMain tracking-tight leading-none">
                ${fmtBRL(f.trueProposalTotal)}
              </span>
              ${!hasRadio ? `
                <span class="text-[11px] text-ds-textSecondary">em até 6x de <strong class="text-ds-textMain">${fmtBRL(f.onlinePayableNow / 6)}</strong> s/ juros</span>
              ` : ''}
            </div>
          </div>

          <!-- Divisão de Etapas de Pagamento (Agrupada em box suave apenas quando há Rádio) -->
          ${hasRadio && f.onlinePayableNow > 0 ? `
            <div class="rounded-xl bg-ds-surface border border-ds-border p-2.5 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-xs font-bold text-ds-textMain leading-tight">Checkout imediato</div>
                  <div class="text-[10px] text-ds-textSecondary leading-tight mt-0.5">Até 6x s/ juros, Pix ou Boleto</div>
                </div>
                <strong class="font-display font-extrabold text-sm text-[#199958] whitespace-nowrap shrink-0">${fmtBRL(f.onlinePayableNow)}</strong>
              </div>

              <div class="border-t border-ds-border pt-2 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-xs font-semibold text-ds-textSecondary leading-tight">Pós-reserva (Rádio)</div>
                  <div class="text-[10px] text-ds-textMuted leading-tight mt-0.5">Boleto após confirmar grade</div>
                </div>
                <strong class="font-display font-bold text-xs sm:text-sm text-ds-textMain whitespace-nowrap shrink-0">${fmtBRL(f.radioNet)}</strong>
              </div>
            </div>
          ` : hasRadio ? `
            <div class="rounded-xl bg-ds-surface border border-ds-border p-3 space-y-1">
              <div class="flex items-center gap-1.5 text-xs font-bold text-ds-textMain leading-tight">
                <i class="uil uil-info-circle text-primary text-sm shrink-0"></i>
                <span>Faturamento à parte</span>
              </div>
              <p class="text-[11px] text-ds-textSecondary leading-snug">
                Rádio tem um processo de faturamento à parte, nosso time de especialistas vai entrar em contato para combinar o pagamento.
              </p>
            </div>
          ` : ''}

          <!-- Cupom de desconto -->
          ${heroCouponFooterHtml}
        </div>

        <div class="space-y-2 pt-0.5">
          <!-- Botão CTA Primário -->
          <button onclick="goToPaymentAnchor()" class="w-full py-3 px-4 rounded-xl bg-aqui-grad text-white font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs">
            <span>efetuar pagamento</span>
          </button>

          <!-- Selo informativo enxuto -->
          <div class="flex items-center justify-center gap-1 text-[10px] sm:text-[11px] text-ds-textSecondary select-none cursor-default">
            <i class="uil uil-padlock text-xs text-ds-textMuted"></i>
            <span>Pagamento seguro · Homologado pela</span>
            <span class="font-display font-extrabold text-[11px] text-[#00A868] tracking-tight">stone</span>
          </div>
        </div>

      </div>
    `;
  }

  const html = `
    <div class="bg-white rounded-[20px] border border-ds-border shadow-aqui-card ${mobile ? 'p-3.5 space-y-3' : 'p-6 sm:p-7 space-y-5'}">
      
      <!-- TOPO DA PROPOSTA (Enxuto, apenas Proposta #... em tom suave + Status + Botão alinhado à direita) -->
      <div class="flex items-center justify-between gap-2 w-full">
        <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <h1 class="font-display font-bold ${mobile ? 'text-base' : 'text-2xl sm:text-3xl'} text-ds-textMain truncate">
            Proposta <span class="text-ds-textMuted font-medium">#${displayProposalId}</span>
          </h1>
          <button
            type="button"
            onclick="cycleProposalStatus()"
            title="Clique para alternar o status da proposta"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${statusMeta.badgeClass} text-[10px] sm:text-[11px] font-bold border whitespace-nowrap shrink-0 cursor-pointer hover:opacity-90 transition"
          >
            <span class="w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}"></span>
            <span>${statusMeta.label}</span>
          </button>
          ${state.clonedScenariosCount > 0 ? `
            <span class="px-2 py-0.5 rounded-full bg-primary-light text-primary text-[10px] font-bold whitespace-nowrap shrink-0">
              Renovada
            </span>
          ` : ''}
        </div>

        ${mobile ? `
          <div class="flex items-center gap-1 shrink-0 ml-auto">
            ${state.proposalStatus === 'completed' ? `
              <button
                type="button"
                onclick="renewCampaignProposal('${displayProposalId}')"
                data-route="/campanhas/${displayProposalId}/detalhamento-anuncio"
                class="px-2.5 h-7 rounded-lg bg-primary text-white font-display font-bold text-[11px] inline-flex items-center gap-1"
                title="Renovar campanha"
              >
                <i class="uil uil-redo text-xs"></i>
                <span>Renovar</span>
              </button>
            ` : `
              <button onclick="showToast('Modo de edição do plano acionado')" class="w-7 h-7 rounded-lg border border-ds-borderStrong bg-ds-surface text-ds-textSecondary hover:text-ds-textMain inline-flex items-center justify-center" title="Alterar proposta">
                <i class="uil uil-pen text-xs"></i>
              </button>
            `}
          </div>
        ` : `
          <div class="flex items-center gap-2 shrink-0 ml-auto">
            ${state.proposalStatus === 'completed' ? `
              <button
                type="button"
                onclick="renewCampaignProposal('${displayProposalId}')"
                data-route="/campanhas/${displayProposalId}/detalhamento-anuncio"
                class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-white hover:opacity-95 font-display font-bold text-xs transition shadow-2xs"
              >
                <i class="uil uil-redo text-sm"></i>
                <span>renovar campanha</span>
              </button>
            ` : `
              <button onclick="showToast('Modo de edição do plano acionado')" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-ds-borderStrong bg-ds-surface hover:bg-ds-bg text-ds-textMain font-bold text-xs transition">
                <i class="uil uil-pen text-sm text-primary"></i>
                <span>alterar proposta</span>
              </button>
            `}
          </div>
        `}
      </div>

      <!-- CORPO DO RESUMO: 2 COLUNAS COM SEMÂNTICA DISTINTA E LEVEZA VISUAL -->
      <div class="grid ${mobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 lg:grid-cols-12 gap-6'} items-stretch sim-grid-1">
        
        <!-- Coluna Esquerda (7 cols): 2 Cards separados (Dados de campanha + Dados de faturamento) -->
        <div class="${mobile ? '' : 'lg:col-span-7'} flex flex-col ${mobile ? 'gap-3' : 'gap-4'} h-full">
          <!-- Card 1: Dados de campanha -->
          <div class="bg-white rounded-[14px] border border-ds-borderStrong ${mobile ? 'p-3.5' : 'p-5'} shadow-xs flex-1 flex flex-col justify-between">
            <div class="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-ds-border">
              <h2 class="font-display font-bold text-xs sm:text-sm text-ds-textMain">
                Dados de campanha
              </h2>
              <span class="text-[11px] font-medium text-ds-textSecondary bg-ds-surface border border-ds-border px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                Mix: ${c.totalItems} ${c.totalItems === 1 ? 'produto contratado' : 'produtos contratados'}
              </span>
            </div>

            <!-- Linha 1: Código da proposta e Nome da campanha (um em cima do outro no mobile) -->
            <div class="grid ${mobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5'} sim-grid-1 text-xs">
              <div>
                <div class="text-[11px] text-ds-textSecondary">Código da proposta</div>
                <div class="font-display font-bold text-sm text-ds-textMain mt-0.5">#${displayProposalId}</div>
              </div>
              <div class="min-w-0">
                <div class="text-[11px] text-ds-textSecondary">Nome da campanha</div>
                <div class="font-bold text-ds-textMain mt-0.5 ${mobile ? 'break-words' : 'truncate'}" title="${escapeHtml(m.campaignName)}">${escapeHtml(m.campaignName)}</div>
              </div>
            </div>

            <!-- Linha 2: Duração da campanha e Período de veiculação (um em cima do outro no mobile) -->
            <div class="mt-3 pt-3 border-t border-ds-border grid ${mobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5'} sim-grid-1 text-xs">
              <div>
                <div class="text-[11px] text-ds-textSecondary">Duração da campanha</div>
                <div class="font-bold text-ds-textMain mt-0.5 whitespace-nowrap">${m.durationDays} dias corridos</div>
              </div>
              <div>
                <div class="text-[11px] text-ds-textSecondary">Período de veiculação</div>
                <div class="font-bold text-ds-textMain mt-0.5 whitespace-nowrap">${m.startDate} a ${m.endDate}</div>
              </div>
            </div>
          </div>

          <!-- Card 2: Dados de faturamento -->
          <div class="bg-white rounded-[14px] border border-ds-borderStrong ${mobile ? 'p-3.5' : 'p-5'} shadow-xs flex flex-col justify-between">
            <div class="pb-2.5 mb-3 border-b border-ds-border">
              <h2 class="font-display font-bold text-xs sm:text-sm text-ds-textMain">
                Dados de faturamento
              </h2>
            </div>
            ${state.simulateUnlogged && !state.billingUnlockedInline ? `
              <div class="text-xs text-ds-textSecondary py-0.5">
                Dados de faturamento ainda não cadastrados.
              </div>
            ` : `
              <div class="grid ${mobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5'} sim-grid-1 text-xs">
                <div class="min-w-0">
                  <div class="text-[11px] text-ds-textSecondary">Razão social / Anunciante</div>
                  <div class="font-bold text-ds-textMain mt-0.5 ${mobile ? 'break-words' : 'truncate'}">${escapeHtml(state.billingCompany)}</div>
                </div>
                <div>
                  <div class="text-[11px] text-ds-textSecondary">CNPJ de faturamento</div>
                  <div class="font-mono font-bold text-ds-textMain mt-0.5 whitespace-nowrap">${escapeHtml(state.billingDoc)}</div>
                </div>
              </div>
            `}
          </div>
        </div>

        <!-- Coluna Direita (5 cols): Resumo Financeiro e Status de Pagamento -->
        ${heroRightColumnHtml}

      </div>
    </div>
  `;

  document.getElementById('proposalHeroSection').innerHTML = html;
}

/**
 * ============================================================================
 * 2. ESTIMATIVA DE ENTREGA POR CANAL (ALINHAMENTO VERTICAL ESTRITO ENTRE CARDS)
 * - Valor principal e linha divisória horizontal permanecem exatamente na mesma
 *   altura em todos os cards, com 2 linhas enxutas no rodapé e popover no hover/toque
 *   para listas de veículos/títulos (+N).
 * ============================================================================
 */
function renderCompactItemsPopover(items, visibleCount, popoverTitle, popKey) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return '<strong class="text-ds-textMain font-semibold">—</strong>';
  const visible = list.slice(0, visibleCount);
  const remaining = list.slice(visibleCount);

  if (remaining.length === 0) {
    return `<strong class="text-ds-textMain font-semibold whitespace-nowrap">${visible.join(', ')}</strong>`;
  }

  return `
    <div class="relative inline-flex items-center gap-1.5 group/veh" data-metric-popover="${popKey}">
      <strong class="text-ds-textMain font-semibold whitespace-nowrap">${visible.join(', ')}</strong>
      <button
        type="button"
        onclick="toggleMetricVehiclesPopover(event, '${popKey}')"
        class="px-1.5 py-0.5 rounded-md text-[11px] leading-none font-bold bg-[#E2E5E9] text-[#38414E] hover:bg-primary-light hover:text-primary transition-colors cursor-pointer"
        aria-label="Ver todos (${list.length})">
        +${remaining.length}
      </button>
      <div
        id="metricPopover-${popKey}"
        class="metric-items-popover invisible opacity-0 pointer-events-none group-hover/veh:visible group-hover/veh:opacity-100 group-hover/veh:pointer-events-auto absolute right-0 bottom-full mb-2 w-56 p-3 rounded-xl bg-white border border-ds-border shadow-xl z-30 transition-all duration-150 text-left">
        <div class="text-[10px] font-bold uppercase tracking-wider text-ds-textMuted mb-2">
          ${popoverTitle} (${list.length})
        </div>
        <div class="flex flex-wrap gap-1.5">
          ${list.map((item) => `
            <span class="px-2 py-0.5 rounded-md bg-ds-surface border border-ds-border text-[11px] font-semibold text-ds-textMain whitespace-nowrap">
              ${item}
            </span>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  syncMobileHoverElimination();
}

function toggleMetricVehiclesPopover(event, popKey) {
  if (event) event.stopPropagation();
  const target = document.getElementById(`metricPopover-${popKey}`);
  if (!target) return;
  const isOpen = target.getAttribute('data-open') === 'true';

  document.querySelectorAll('.metric-items-popover').forEach((el) => {
    el.setAttribute('data-open', 'false');
    el.classList.add('invisible', 'opacity-0', 'pointer-events-none');
  });

  if (!isOpen) {
    target.setAttribute('data-open', 'true');
    target.classList.remove('invisible', 'opacity-0', 'pointer-events-none');
  }
}

if (typeof window !== 'undefined' && !window.__metricPopoverListenerBound) {
  window.__metricPopoverListenerBound = true;
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-metric-popover]')) {
      document.querySelectorAll('.metric-items-popover[data-open="true"]').forEach((el) => {
        el.setAttribute('data-open', 'false');
        el.classList.add('invisible', 'opacity-0', 'pointer-events-none');
      });
    }
  });
}

function renderModularMetrics(m) {
  const c = m.counts;
  const mobile = isMobileView();
  const activeChannelsCount =
    (c.oohPointsCount > 0 ? 1 : 0) +
    (c.portaisCount > 0 ? 1 : 0) +
    (c.revistasCount > 0 ? 1 : 0) +
    (c.radioCount > 0 ? 1 : 0);

  let cards = [];
  const cardPad = mobile ? 'p-4' : 'p-5';
  let singleChannelTitle = 'Estimativa de entrega do plano';

  const portaisVehiclesList = ['g1', 'ge', 'gshow', 'globoplay', 'receitas', 'cartola', 'globo.com'];
  const revistasTitlesList = Array.from(
    new Set((m.revistasItems || []).map((item) => item.editorialTitle).filter(Boolean))
  );
  const effectiveRevistasTitles = revistasTitlesList.length > 0
    ? revistasTitlesList
    : ['O Globo', 'Extra', 'Galileu', 'Globo Rural'];

  // =========================================================================
  // CASO 1A: CAMPANHA ÚNICA — SOMENTE OOH (6 métricas principais de OOH)
  // =========================================================================
  if (activeChannelsCount === 1 && c.oohPointsCount > 0) {
    singleChannelTitle = 'Estimativa de entrega — OOH';
    const staticCount = c.oohStaticPointsCount ?? m.oohDisplayGroups.filter((g) => g.isStatic).reduce((acc, g) => acc + g.towersCount, 0);
    const digitalCount = c.oohDigitalPointsCount ?? Math.max(0, c.oohPointsCount - staticCount);

    cards = [
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Pontos</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.oohPointsCount)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Locais selecionados</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Telas</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.oohScreensCount)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Ativas na campanha</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Exibições</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${digitalCount > 0 ? fmtInt(c.oohTotalInsertions) : 'Fixa'}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Total no período</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Alcance</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.oohReach || c.oohImpacts)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Pessoas únicas</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Impacto</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.oohImpacts)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Volume no período</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Frequência</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtFreq(c.oohFrequency || 1.88)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Média por pessoa</div>
          </div>
        </div>
      `
    ];

  // =========================================================================
  // CASO 1B: CAMPANHA ÚNICA — SÓ DIGITAL (PORTAIS E GLOBOPLAY)
  // =========================================================================
  } else if (activeChannelsCount === 1 && c.portaisCount > 0) {
    singleChannelTitle = 'Estimativa de entrega — Portais e Globoplay';
    const avgCpm = c.portaisImpressions > 0 ? (m.financials.portaisNet / (c.portaisImpressions / 1000)) : 31.6;

    cards = [
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Impressões</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.portaisImpressions)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Vídeo e Display</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Portais</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-xl sm:text-2xl text-ds-textMain leading-tight">${portaisVehiclesList.length} veículos</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">${renderCompactItemsPopover(portaisVehiclesList, 3, 'Veículos contemplados', 'portais-single')}</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">CPM</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtBRL(avgCpm)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Custo por mil impressões</div>
          </div>
        </div>
      `
    ];

  // =========================================================================
  // CASO 1C: CAMPANHA ÚNICA — SÓ REVISTAS DIGITAIS (EDITORA GLOBO)
  // =========================================================================
  } else if (activeChannelsCount === 1 && c.revistasCount > 0) {
    singleChannelTitle = 'Estimativa de entrega — Revistas e Jornais';
    const avgCpm = c.revistasImpressions > 0 ? (m.financials.revistasNet / (c.revistasImpressions / 1000)) : 9.6;

    cards = [
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Impressões</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.revistasImpressions)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Editora Globo Digital</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Portais</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-xl sm:text-2xl text-ds-textMain leading-tight">${c.revistasCount} ${c.revistasCount > 1 ? 'títulos' : 'título'}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">${renderCompactItemsPopover(effectiveRevistasTitles, 2, 'Títulos contemplados', 'revistas-single')}</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">CPM</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtBRL(avgCpm)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Custo por mil impressões</div>
          </div>
        </div>
      `
    ];

  // =========================================================================
  // CASO 1D: CAMPANHA ÚNICA — SÓ RÁDIO CBN
  // =========================================================================
  } else if (activeChannelsCount === 1 && c.radioCount > 0) {
    singleChannelTitle = 'Estimativa de entrega — Rádio CBN';
    const radioDurationsLabel = Array.from(new Set((m.radioItems || []).map((r) => `Spot de ${r.spotDuration || 30}s`))).join(' · ') || 'Spot de 30s';

    cards = [
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Inserções</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.radioTotalInsertions)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Total no período</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Rádio/programa</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.radioCount)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Grade selecionada</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Inserções/semana</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight">${fmtInt(c.radioWeeklyInsertions)}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Ritmo semanal</div>
          </div>
        </div>
      `,
      `
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col justify-between h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Duração</h3>
          </div>
          <div class="mt-3">
            <div class="font-display font-extrabold text-xl sm:text-2xl text-ds-textMain leading-tight">${radioDurationsLabel}</div>
            <div class="text-xs text-ds-textSecondary mt-1 leading-normal">Formato comercial</div>
          </div>
        </div>
      `
    ];
  } else {
    // CASO 2: Múltiplos canais -> Apenas as principais métricas como no PDF (sem excesso de linhas)
    const f = m.financials;
    const oohStaticPts = c.oohStaticPointsCount ?? m.oohDisplayGroups.filter((g) => g.isStatic).reduce((acc, g) => acc + g.towersCount, 0);
    const oohDigitalPts = c.oohDigitalPointsCount ?? Math.max(0, c.oohPointsCount - oohStaticPts);
    const oohStaticScr = c.oohStaticScreensCount ?? m.oohDisplayGroups.filter((g) => g.isStatic).reduce((acc, g) => acc + g.screens, 0);
    const oohDigScr = Math.max(0, (c.oohScreensCount || 0) - oohStaticScr);

    if (c.oohPointsCount > 0) {
      const oohExhibitionsVal = oohDigitalPts > 0
        ? fmtInt(c.oohTotalInsertions)
        : 'Fixa';

      cards.push(`
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">OOH</h3>
          </div>

          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight whitespace-nowrap">
              ${fmtInt(c.oohImpacts)}
            </div>
            <div class="text-xs text-ds-textSecondary mt-0.5 leading-normal">Impacto no período</div>
          </div>

          <div class="mt-3.5 pt-3 border-t border-ds-border space-y-1.5 text-xs">
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Pontos</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${fmtInt(c.oohPointsCount)}</strong>
            </div>
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Telas</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${fmtInt(c.oohScreensCount)}</strong>
            </div>
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Exibições</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${oohExhibitionsVal}</strong>
            </div>
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Alcance</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${fmtInt(c.oohReach || c.oohImpacts)}</strong>
            </div>
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Frequência</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${fmtFreq(c.oohFrequency || 1.88)}</strong>
            </div>
          </div>
        </div>
      `);
    }

    if (c.portaisCount > 0) {
      const portaisCpms = Array.from(new Set((m.portaisItems || []).map((it) => it.cpm).filter((v) => v > 0)));
      const portaisAvgCpm = c.portaisImpressions > 0 ? (f.portaisNet / (c.portaisImpressions / 1000)) : (portaisCpms[0] || 0);
      const portaisCpmLabel = portaisCpms.length === 1 ? fmtBRL(portaisCpms[0]) : fmtBRL(portaisAvgCpm);

      cards.push(`
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Portais e Globoplay</h3>
          </div>

          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight whitespace-nowrap">
              ${fmtInt(c.portaisImpressions)}
            </div>
            <div class="text-xs text-ds-textSecondary mt-0.5 leading-normal">Impressões contratadas</div>
          </div>

          <div class="mt-3.5 pt-3 border-t border-ds-border space-y-1.5 text-xs">
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Portais</span>
              ${renderCompactItemsPopover(portaisVehiclesList, 2, 'Veículos contemplados', 'portais-multi')}
            </div>
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">CPM</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${portaisCpmLabel}</strong>
            </div>
          </div>
        </div>
      `);
    }

    if (c.revistasCount > 0) {
      const revistasCpms = Array.from(new Set((m.revistasItems || []).map((it) => it.cpm).filter((v) => v > 0)));
      const revistasAvgCpm = c.revistasImpressions > 0 ? (f.revistasNet / (c.revistasImpressions / 1000)) : (revistasCpms[0] || 0);
      const revistasCpmLabel = revistasCpms.length === 1 ? fmtBRL(revistasCpms[0]) : fmtBRL(revistasAvgCpm);

      cards.push(`
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Revistas e Jornais</h3>
          </div>

          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight whitespace-nowrap">
              ${fmtInt(c.revistasImpressions)}
            </div>
            <div class="text-xs text-ds-textSecondary mt-0.5 leading-normal">Impressões contratadas</div>
          </div>

          <div class="mt-3.5 pt-3 border-t border-ds-border space-y-1.5 text-xs">
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Portais</span>
              ${renderCompactItemsPopover(effectiveRevistasTitles, 2, 'Títulos contemplados', 'revistas-multi')}
            </div>
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">CPM</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${revistasCpmLabel}</strong>
            </div>
          </div>
        </div>
      `);
    }

    if (c.radioCount > 0) {
      const radioDurationsLabel = Array.from(new Set((m.radioItems || []).map((r) => `Spot de ${r.spotDuration || 30}s`))).join(' · ') || 'Spot de 30s';

      cards.push(`
        <div class="bg-white rounded-2xl ${cardPad} border border-ds-border shadow-sm flex flex-col h-full">
          <div class="min-w-0">
            <h3 class="font-display font-bold text-base text-ds-textMain leading-snug truncate">Rádio CBN</h3>
          </div>

          <div class="mt-3">
            <div class="font-display font-extrabold text-2xl sm:text-3xl text-ds-textMain leading-tight whitespace-nowrap">
              ${fmtInt(c.radioTotalInsertions)}
            </div>
            <div class="text-xs text-ds-textSecondary mt-0.5 leading-normal">Inserções no período</div>
          </div>

          <div class="mt-3.5 pt-3 border-t border-ds-border space-y-1.5 text-xs">
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Rádio/programa</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${fmtInt(c.radioCount)}</strong>
            </div>
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Inserções/semana</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${fmtInt(c.radioWeeklyInsertions)}</strong>
            </div>
            <div class="min-h-[20px] flex items-center justify-between gap-2 whitespace-nowrap">
              <span class="text-ds-textMuted shrink-0">Duração</span>
              <strong class="text-ds-textMain font-semibold whitespace-nowrap">${radioDurationsLabel}</strong>
            </div>
          </div>
        </div>
      `);
    }
  }

  const colsClass =
    cards.length === 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 sim-grid-1' :
    cards.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sim-grid-1' :
    cards.length === 3 ? 'grid-cols-1 sm:grid-cols-3 sim-grid-1' :
    cards.length === 2 ? 'grid-cols-1 sm:grid-cols-2 sim-grid-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sim-grid-1';

  document.getElementById('modularMetricsSection').innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="font-display font-bold text-base sm:text-lg text-ds-textMain">
          ${activeChannelsCount === 1 ? singleChannelTitle : 'Estimativa de entrega por canal'}
        </h2>
        <span class="text-xs text-ds-textSecondary">
          Projeção para ${m.durationDays} dias de campanha
        </span>
      </div>
      <div class="grid ${colsClass} gap-3.5 sm:gap-4 items-stretch">
        ${cards.join('')}
      </div>
    </div>
  `;
}

/**
 * ============================================================================
 * 3. BARRA DE FILTROS E BUSCA INTELIGENTE (EXEMPLO 4: POR ABA + BUSCA DIRETA + AMBIENTES + CATEGORIA)
 * - Navegação por aba de canal (sem "Todos"): OOH (32), Revistas (4), Portais e Globoplay (5), Rádio (4)
 * - Aviso de disponibilidade conforme Exemplo 4
 * - 3 Controles inteligentes lado a lado: [ Buscar 🔍 ] + [ Ambientes ⌄ ] + [ Categoria ⌄ ]
 * - Busca direta cross-canal: avisa se o termo digitado encontrou itens em outras abas!
 * ============================================================================
 */
function matchOohGeoFilter(g, geoVal) {
  if (!geoVal) return true;
  if (geoVal.startsWith('zona:')) return g.zone === geoVal.slice(5);
  if (geoVal.startsWith('classe:')) return g.socialClass === geoVal.slice(7);
  if (geoVal.startsWith('bairro:')) return String(g.district || '').toLowerCase() === geoVal.slice(7).toLowerCase();
  return true;
}

function renderFilterBar(m) {
  const c = m.counts;
  const mobile = isMobileView();

  const channelPills = [
    { key: 'ooh', icon: 'uil-building', shortName: 'OOH', count: c.oohPointsCount, label: `OOH (\u2060${c.oohPointsCount}\u2060)`, show: c.oohPointsCount > 0 },
    { key: 'revistas', icon: 'uil-book-open', shortName: 'Revistas', count: c.revistasCount, label: `Revistas (\u2060${c.revistasCount}\u2060)`, show: c.revistasCount > 0 },
    { key: 'portais', icon: 'uil-globe', shortName: 'Portais', count: c.portaisCount, label: `Portais e Globoplay (\u2060${c.portaisCount}\u2060)`, show: c.portaisCount > 0 },
    { key: 'radio', icon: 'uil-microphone', shortName: 'Rádio', count: c.radioCount, label: `Rádio (\u2060${c.radioCount}\u2060)`, show: c.radioCount > 0 }
  ].filter((p) => p.show);

  // Opções dinâmicas de "Categoria" (1º filtro), "Tipo de exibição" (2º filtro) e "Geolocalização" (3º filtro OOH)
  let firstFilterMarker = 'Categoria';
  let firstFilterDefaultMobile = 'Categorias';
  let firstFilterDefaultDesktop = 'Todas as categorias';
  let secondFilterMarker = 'Tipo de exibição';
  let secondFilterDefaultMobile = 'Exibição';
  let secondFilterDefaultDesktop = 'Todos os tipos';
  let ambienteOptions = [];
  let categoriaOptions = [];
  let geoFilterGroups = [];
  let searchPlaceholder = 'Buscar por nome, código, endereço, cidade, categoria ou veículo...';

  if (state.channelFilter === 'ooh') {
    searchPlaceholder = mobile
      ? 'Buscar nome, código (ex: PR32569) ou bairro...'
      : 'Buscar por nome, código (ex: PR32569, CI6), bairro, zona ou categoria...';
    firstFilterMarker = 'Categoria';
    firstFilterDefaultMobile = `Categorias (\u2060${(m.oohCategoriesList || []).length}\u2060)`;
    firstFilterDefaultDesktop = `Todas as categorias (\u2060${(m.oohCategoriesList || []).length}\u2060)`;
    ambienteOptions = (m.oohCategoriesList || []).map((cat) => ({
      value: cat.name,
      label: `${cat.name} (\u2060${cat.points}\u2060)`
    }));

    // 2º filtro em cascata: Tipo de exibição (Digital vs Impresso) dentro da Categoria selecionada
    const groupsByCat = m.oohDisplayGroups.filter(
      (g) => !state.ambienteFilter || g.vertical === state.ambienteFilter
    );
    const digitalPts = groupsByCat.filter((g) => !(g.isStatic || g.periodInsertions === 0)).reduce((acc, g) => acc + g.towersCount, 0);
    const impressoPts = groupsByCat.filter((g) => g.isStatic || g.periodInsertions === 0).reduce((acc, g) => acc + g.towersCount, 0);
    categoriaOptions = [
      { value: 'Digital', label: `Digital (\u2060${digitalPts}\u2060)`, count: digitalPts },
      { value: 'Impresso', label: `Impresso (\u2060${impressoPts}\u2060)`, count: impressoPts }
    ].filter((o) => o.count > 0);
    secondFilterMarker = 'Tipo de exibição';
    secondFilterDefaultMobile = `Exibição (\u2060${categoriaOptions.length}\u2060)`;
    secondFilterDefaultDesktop = `Todos os tipos (\u2060${categoriaOptions.length}\u2060)`;

    // 3º filtro OOH (Sugestão Comercial): Geolocalização por Bairro, Zona e Classe Social
    const zoneMap = new Map();
    const classMap = new Map();
    const districtMap = new Map();
    groupsByCat.forEach((g) => {
      if (g.zone) zoneMap.set(g.zone, (zoneMap.get(g.zone) || 0) + g.towersCount);
      if (g.socialClass) classMap.set(g.socialClass, (classMap.get(g.socialClass) || 0) + g.towersCount);
      const cleanDist = String(g.district || '').trim();
      if (cleanDist) districtMap.set(cleanDist, (districtMap.get(cleanDist) || 0) + g.towersCount);
    });
    geoFilterGroups = [
      {
        marker: 'Zona',
        options: Array.from(zoneMap.entries()).map(([z, cnt]) => ({ value: `zona:${z}`, label: `${z} (\u2060${cnt}\u2060)` }))
      },
      {
        marker: 'Classe social',
        options: Array.from(classMap.entries()).map(([cl, cnt]) => ({ value: `classe:${cl}`, label: `${cl} (\u2060${cnt}\u2060)` }))
      },
      {
        marker: 'Bairro',
        options: Array.from(districtMap.entries()).map(([d, cnt]) => ({ value: `bairro:${d}`, label: `${d} (\u2060${cnt}\u2060)` }))
      }
    ].filter((grp) => grp.options.length > 0);
  } else if (state.channelFilter === 'portais') {
    searchPlaceholder = mobile
      ? 'Buscar produto digital ou veículo...'
      : 'Buscar produto digital, formato ou veículo (ex: Globoplay, g1, Sem skip)...';
    const portaisGloboCount = m.portaisItems.filter((p) => p.channelTypeLabel === 'Portais Globo').length;
    const globoplayCount = m.portaisItems.filter((p) => p.channelTypeLabel === 'Globoplay').length;
    ambienteOptions = [
      { value: 'Portais Globo', label: `Portais Globo (\u2060${portaisGloboCount}\u2060)`, count: portaisGloboCount },
      { value: 'Globoplay', label: `Globoplay (\u2060${globoplayCount}\u2060)`, count: globoplayCount }
    ].filter((o) => o.count > 0);
    firstFilterMarker = 'Categoria';
    firstFilterDefaultMobile = `Categorias (\u2060${ambienteOptions.length}\u2060)`;
    firstFilterDefaultDesktop = `Todas as categorias (\u2060${ambienteOptions.length}\u2060)`;

    const itemsByCat = m.portaisItems.filter((p) => !state.ambienteFilter || p.channelTypeLabel === state.ambienteFilter);
    const videoCount = itemsByCat.filter((p) => p.mediaTypeLabel === 'Vídeo').length;
    const displayCount = itemsByCat.filter((p) => p.mediaTypeLabel === 'Display').length;
    categoriaOptions = [
      { value: 'Vídeo', label: `Vídeo (\u2060${videoCount}\u2060)`, count: videoCount },
      { value: 'Display', label: `Display (\u2060${displayCount}\u2060)`, count: displayCount }
    ].filter((o) => o.count > 0);
    secondFilterMarker = 'Tipo de exibição';
    secondFilterDefaultMobile = `Exibição (\u2060${categoriaOptions.length}\u2060)`;
    secondFilterDefaultDesktop = `Todos os tipos (\u2060${categoriaOptions.length}\u2060)`;
  } else if (state.channelFilter === 'revistas') {
    searchPlaceholder = mobile
      ? 'Buscar publicação...'
      : 'Buscar publicação (ex: O Globo, Extra, Galileu, Globo Rural)...';
    ambienteOptions = m.revistasItems.map((r) => ({
      value: r.editorialTitle,
      label: `${r.editorialTitle} (\u20601\u2060)`
    }));
    firstFilterMarker = 'Categoria';
    firstFilterDefaultMobile = `Categorias (\u2060${ambienteOptions.length}\u2060)`;
    firstFilterDefaultDesktop = `Todas as categorias (\u2060${ambienteOptions.length}\u2060)`;

    categoriaOptions = [{ value: 'Display', label: `Display (\u2060${state.ambienteFilter ? 1 : c.revistasCount}\u2060)` }];
    secondFilterMarker = 'Tipo de exibição';
    secondFilterDefaultMobile = `Exibição (1)`;
    secondFilterDefaultDesktop = `Todos os tipos (1)`;
  } else if (state.channelFilter === 'radio') {
    searchPlaceholder = mobile
      ? 'Buscar praça ou faixa horária...'
      : 'Buscar praça, emissora ou faixa horária (ex: São Paulo, BH, Brasília, Nacional)...';
    ambienteOptions = m.radioItems.map((rd) => ({
      value: rd.city,
      label: `${rd.city} - ${rd.state}`
    }));
    firstFilterMarker = 'Praça';
    firstFilterDefaultMobile = `Praças (\u2060${ambienteOptions.length}\u2060)`;
    firstFilterDefaultDesktop = `Todas as praças (\u2060${ambienteOptions.length}\u2060)`;

    const radioByCity = m.radioItems.filter((rd) => !state.ambienteFilter || rd.city === state.ambienteFilter);
    const uniqueWindows = Array.from(new Set(radioByCity.map((rd) => rd.timeWindow)));
    categoriaOptions = uniqueWindows.map((w) => ({
      value: w,
      label: `Faixa ${w}`
    }));
    secondFilterMarker = 'Faixa horária';
    secondFilterDefaultMobile = `Faixas (\u2060${categoriaOptions.length}\u2060)`;
    secondFilterDefaultDesktop = `Todas as faixas (\u2060${categoriaOptions.length}\u2060)`;
  }

  const hasActiveFilters = Boolean(state.searchQuery.trim() || state.ambienteFilter || state.categoriaFilter || state.geoFilter);

  // Calcula sugestões de busca direta em outras abas quando o usuário digita algo
  let crossChannelBannerHtml = '';
  const q = state.searchQuery.trim().toLowerCase();
  if (q.length >= 2) {
    const otherMatches = [];
    if (state.channelFilter !== 'ooh') {
      const cnt = m.oohDisplayGroups.filter((g) =>
        `${g.name} ${g.code} ${g.displayCode} ${g.searchCodes} ${g.address} ${g.district} ${g.zone} ${g.socialClass} ${g.city} ${g.vertical}`.toLowerCase().includes(q)
      ).length;
      if (cnt > 0) otherMatches.push({ key: 'ooh', label: `OOH (${cnt})` });
    }
    if (state.channelFilter !== 'portais') {
      const cnt = m.portaisItems.filter((p) =>
        `${p.name} ${p.code} ${p.mediaTypeLabel} ${p.interventionLabel || ''} ${p.channelTypeLabel} ${p.vehicles.join(' ')}`.toLowerCase().includes(q)
      ).length;
      if (cnt > 0) otherMatches.push({ key: 'portais', label: `Portais e Globoplay (${cnt})` });
    }
    if (state.channelFilter !== 'revistas') {
      const cnt = m.revistasItems.filter((r) =>
        `${r.name} ${r.code} ${r.editorialTitle} Display Editora Globo`.toLowerCase().includes(q)
      ).length;
      if (cnt > 0) otherMatches.push({ key: 'revistas', label: `Revistas (${cnt})` });
    }
    if (state.channelFilter !== 'radio') {
      const cnt = m.radioItems.filter((rd) =>
        `${rd.stationName} ${rd.code} ${rd.programLabel} ${rd.city} ${rd.state} ${rd.timeWindow}`.toLowerCase().includes(q)
      ).length;
      if (cnt > 0) otherMatches.push({ key: 'radio', label: `Rádio (${cnt})` });
    }

    if (otherMatches.length > 0) {
      crossChannelBannerHtml = `
        <div class="px-3.5 py-2 rounded-xl bg-primary-light/70 border border-primary/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span class="text-ds-textMain font-medium flex items-center gap-1.5">
            <i class="uil uil-search-plus text-primary text-sm"></i>
            <span>Também encontramos <strong>"${state.searchQuery}"</strong> em:</span>
          </span>
          <div class="flex flex-wrap items-center gap-1.5">
            ${otherMatches.map((om) => `
              <button onclick="switchChannelPreservingSearch('${om.key}')" class="px-2.5 py-1 rounded-full bg-white hover:bg-primary hover:text-white text-primary border border-primary/40 font-bold text-[11px] transition">
                ${om.label} →
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  const renderGeoSelectOptions = (defaultLabel) => `
    <option value="" ${!state.geoFilter ? 'selected' : ''}>${defaultLabel}</option>
    ${geoFilterGroups.map((grp) => `
      <option value="__marker_${grp.marker}__" disabled>── ${grp.marker} ──</option>
      ${grp.options.map((opt) => `
        <option value="${opt.value}" ${state.geoFilter === opt.value ? 'selected' : ''}>
          ${opt.label}
        </option>
      `).join('')}
    `).join('')}
  `;

  const renderChannelSelectOptions = (prefixDesktop = false) => `
    <option value="__marker__" disabled>── Canal de mídia ──</option>
    ${channelPills.map((p) => `
      <option value="${p.key}" ${state.channelFilter === p.key ? 'selected' : ''}>
        ${prefixDesktop ? `Canal: ${p.label}` : p.label}
      </option>
    `).join('')}
  `;

  const activeSecondaryCount =
    (state.ambienteFilter ? 1 : 0) +
    (state.categoriaFilter ? 1 : 0) +
    (state.geoFilter ? 1 : 0);

  document.getElementById('mediaPlanFilterBar').innerHTML = `
    <div class="${mobile ? 'space-y-2' : 'space-y-2.5'}">
      <!-- Barra de Busca + Canal de mídia (Select) + Filtros secundários -->
      ${mobile ? `
        <!-- Mecânica Mobile Aqui Ads: Card limpo com Busca no topo + [Canal (Select)] e botão [🎚️ filtrar] lado a lado -->
        <div class="rounded-2xl border border-ds-borderStrong bg-white p-3 shadow-xs space-y-2.5">
          <!-- Linha 1 do Card Mobile: Busca limpa -->
          <div class="relative flex items-center border-b border-ds-border pb-2">
            <i class="uil uil-search text-ds-textSecondary text-base mr-2 shrink-0"></i>
            <input
              id="mediaPlanSearchInput"
              type="text"
              value="${state.searchQuery}"
              oninput="setSearchQuery(this.value)"
              placeholder="${searchPlaceholder}"
              class="w-full pr-7 py-0.5 bg-transparent text-xs text-ds-textMain placeholder:text-ds-textMuted focus:outline-none"
            />
            ${state.searchQuery ? `
              <button
                type="button"
                onclick="setSearchQuery('')"
                class="text-ds-textSecondary hover:text-ds-textMain text-base leading-none shrink-0"
                title="Limpar busca"
              >
                <i class="uil uil-backspace"></i>
              </button>
            ` : ''}
          </div>

          <!-- Linha 2 do Card Mobile: Select Principal (Canal) + Botão "🎚️ filtrar" -->
          <div class="flex items-center gap-2.5">
            <div class="flex-1 min-w-0">
              <select
                onchange="setChannelFilter(this.value)"
                class="w-full px-3 py-2 rounded-xl border border-ds-borderStrong bg-white font-normal text-ds-textMain text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                title="Selecionar canal de mídia"
              >
                ${renderChannelSelectOptions(false)}
              </select>
            </div>

            <button
              type="button"
              onclick="toggleMobileFiltersDrawer()"
              class="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border ${
                state.mobileFiltersOpen || activeSecondaryCount > 0
                  ? 'border-ds-textMain bg-ds-surface text-ds-textMain font-normal'
                  : 'border-transparent bg-transparent hover:bg-ds-surface text-ds-textMain font-normal'
              } text-xs transition"
              aria-expanded="${state.mobileFiltersOpen ? 'true' : 'false'}"
            >
              <i class="uil uil-sliders-v-alt text-base leading-none"></i>
              <span>filtrar</span>
              ${activeSecondaryCount > 0 ? `
                <span class="ml-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold inline-flex items-center justify-center leading-none">
                  ${activeSecondaryCount}
                </span>
              ` : ''}
            </button>
          </div>

          <!-- Gaveta Colapsável de Filtros Secundários (abre sob demanda ao tocar em "filtrar") -->
          ${state.mobileFiltersOpen ? `
            <div class="pt-2.5 border-t border-ds-border space-y-2 animate-fadeIn">
              <div class="flex items-center justify-between text-[11px] text-ds-textSecondary px-0.5">
                <span class="font-normal text-[11px]">Refinar visualização</span>
                ${hasActiveFilters ? `
                  <button type="button" onclick="clearAllMediaFilters()" class="font-normal text-rose-700 hover:underline">
                    Limpar filtros
                  </button>
                ` : ''}
              </div>
              <div class="grid grid-cols-2 gap-2">
                <select
                  onchange="setAmbienteFilter(this.value)"
                  class="w-full px-2.5 py-2 rounded-xl border ${state.ambienteFilter ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white font-normal text-ds-textMain'} text-[11px] focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="__marker__" disabled>── ${firstFilterMarker} ──</option>
                  <option value="" ${!state.ambienteFilter ? 'selected' : ''}>${firstFilterDefaultMobile}</option>
                  ${ambienteOptions.map((opt) => `
                    <option value="${opt.value}" ${state.ambienteFilter === opt.value ? 'selected' : ''}>
                      ${opt.label}
                    </option>
                  `).join('')}
                </select>
                <select
                  onchange="setCategoriaFilter(this.value)"
                  class="w-full px-2.5 py-2 rounded-xl border ${state.categoriaFilter ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white font-normal text-ds-textMain'} text-[11px] focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="__marker__" disabled>── ${secondFilterMarker} ──</option>
                  <option value="" ${!state.categoriaFilter ? 'selected' : ''}>${secondFilterDefaultMobile}</option>
                  ${categoriaOptions.map((opt) => `
                    <option value="${opt.value}" ${state.categoriaFilter === opt.value ? 'selected' : ''}>
                      ${opt.label}
                    </option>
                  `).join('')}
                </select>
                ${state.channelFilter === 'ooh' ? `
                  <select
                    onchange="setGeoFilter(this.value)"
                    class="col-span-2 w-full px-2.5 py-2 rounded-xl border ${state.geoFilter ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white font-normal text-ds-textMain'} text-[11px] focus:outline-none focus:border-primary transition cursor-pointer"
                  >
                    ${renderGeoSelectOptions('Bairro / Zona / Classe social')}
                  </select>
                ` : ''}
              </div>
            </div>
          ` : activeSecondaryCount > 0 ? `
            <div class="pt-2 border-t border-ds-border flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-1.5 flex-wrap">
                ${state.ambienteFilter ? `
                  <button type="button" onclick="setAmbienteFilter('')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-[11px] font-normal">
                    <span>${state.ambienteFilter}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
                ${state.categoriaFilter ? `
                  <button type="button" onclick="setCategoriaFilter('')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-[11px] font-normal">
                    <span>${state.categoriaFilter}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
                ${state.geoFilter ? `
                  <button type="button" onclick="setGeoFilter('')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-[11px] font-normal">
                    <span>${state.geoFilter.replace(/^(zona|classe|bairro):/, '')}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
              </div>
              <button type="button" onclick="clearAllMediaFilters()" class="text-[11px] font-normal text-rose-700 hover:underline">
                Limpar
              </button>
            </div>
          ` : ''}
        </div>
      ` : `
        <div class="space-y-2.5">
          <!-- Linha Principal Desktop: Busca ampla + Canal (Select) + Botão "🎚️ filtrar" (mesma economia de espaço do Mobile) -->
          <div class="flex items-center gap-2.5">
            <div class="flex-1 min-w-0 relative">
              <input
                id="mediaPlanSearchInput"
                type="text"
                value="${state.searchQuery}"
                oninput="setSearchQuery(this.value)"
                placeholder="${searchPlaceholder}"
                class="w-full h-10 pl-4 pr-10 rounded-xl border border-ds-borderStrong bg-white text-xs sm:text-sm text-ds-textMain placeholder:text-ds-textMuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
              />
              ${state.searchQuery ? `
                <button onclick="setSearchQuery('')" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ds-textMuted hover:text-ds-textMain text-sm" title="Limpar busca">
                  <i class="uil uil-times"></i>
                </button>
              ` : `
                <i class="uil uil-search absolute right-3.5 top-1/2 -translate-y-1/2 text-ds-textSecondary text-sm pointer-events-none"></i>
              `}
            </div>

            <div class="w-[195px] sm:w-[220px] shrink-0 relative">
              <select
                onchange="setChannelFilter(this.value)"
                class="w-full h-10 px-3 rounded-xl border border-ds-borderStrong bg-white font-normal text-ds-textMain text-xs sm:text-sm focus:outline-none focus:border-primary transition cursor-pointer"
                title="Selecionar canal de mídia"
              >
                ${renderChannelSelectOptions(true)}
              </select>
            </div>

            <button
              type="button"
              onclick="toggleMobileFiltersDrawer()"
              class="shrink-0 h-10 inline-flex items-center gap-1.5 px-4 rounded-xl border ${
                state.mobileFiltersOpen || activeSecondaryCount > 0
                  ? 'border-ds-textMain bg-ds-surface text-ds-textMain font-normal'
                  : 'border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textMain font-normal'
              } text-xs sm:text-sm transition cursor-pointer"
              aria-expanded="${state.mobileFiltersOpen ? 'true' : 'false'}"
              title="Abrir filtros secundários"
            >
              <i class="uil uil-sliders-v-alt text-base leading-none"></i>
              <span>filtrar</span>
              ${activeSecondaryCount > 0 ? `
                <span class="ml-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold inline-flex items-center justify-center leading-none">
                  ${activeSecondaryCount}
                </span>
              ` : ''}
            </button>
          </div>

          <!-- Gaveta Colapsável de Filtros Secundários no Desktop (abre sob demanda ao clicar em "filtrar") -->
          ${state.mobileFiltersOpen ? `
            <div class="p-3 rounded-xl bg-ds-surface/70 border border-ds-border space-y-2 animate-fadeIn">
              <div class="flex items-center justify-between text-xs text-ds-textSecondary px-0.5">
                <span class="font-normal text-xs">Refinar visualização</span>
                ${hasActiveFilters ? `
                  <button type="button" onclick="clearAllMediaFilters()" class="font-normal text-rose-700 hover:underline text-xs">
                    Limpar filtros
                  </button>
                ` : ''}
              </div>
              <div class="grid grid-cols-1 ${state.channelFilter === 'ooh' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5">
                <select
                  onchange="setAmbienteFilter(this.value)"
                  class="w-full h-9 px-3 rounded-xl border ${state.ambienteFilter ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white font-normal text-ds-textMain'} text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="__marker__" disabled>── ${firstFilterMarker} ──</option>
                  <option value="" ${!state.ambienteFilter ? 'selected' : ''}>${firstFilterDefaultDesktop}</option>
                  ${ambienteOptions.map((opt) => `
                    <option value="${opt.value}" ${state.ambienteFilter === opt.value ? 'selected' : ''}>
                      ${opt.label}
                    </option>
                  `).join('')}
                </select>

                <select
                  onchange="setCategoriaFilter(this.value)"
                  class="w-full h-9 px-3 rounded-xl border ${state.categoriaFilter ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white font-normal text-ds-textMain'} text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="__marker__" disabled>── ${secondFilterMarker} ──</option>
                  <option value="" ${!state.categoriaFilter ? 'selected' : ''}>${secondFilterDefaultDesktop}</option>
                  ${categoriaOptions.map((opt) => `
                    <option value="${opt.value}" ${state.categoriaFilter === opt.value ? 'selected' : ''}>
                      ${opt.label}
                    </option>
                  `).join('')}
                </select>

                ${state.channelFilter === 'ooh' ? `
                  <select
                    onchange="setGeoFilter(this.value)"
                    class="w-full h-9 px-3 rounded-xl border ${state.geoFilter ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white font-normal text-ds-textMain'} text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                  >
                    ${renderGeoSelectOptions('Bairro / Zona / Classe')}
                  </select>
                ` : ''}
              </div>
            </div>
          ` : activeSecondaryCount > 0 ? `
            <div class="flex items-center justify-between gap-2 flex-wrap pt-0.5">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[11px] font-normal text-ds-textSecondary mr-0.5">Filtros ativos:</span>
                ${state.ambienteFilter ? `
                  <button type="button" onclick="setAmbienteFilter('')" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary-light transition">
                    <span>${state.ambienteFilter}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
                ${state.categoriaFilter ? `
                  <button type="button" onclick="setCategoriaFilter('')" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary-light transition">
                    <span>${state.categoriaFilter}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
                ${state.geoFilter ? `
                  <button type="button" onclick="setGeoFilter('')" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary-light transition">
                    <span>${state.geoFilter.replace(/^(zona|classe|bairro):/, '')}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
              </div>
              <button type="button" onclick="clearAllMediaFilters()" class="text-xs font-bold text-rose-700 hover:underline">
                Limpar filtros
              </button>
            </div>
          ` : ''}
        </div>
      `}

      ${crossChannelBannerHtml}
    </div>
  `;
  syncMobileHoverElimination();
}

/**
 * ============================================================================
 * 4. LISTA DO PLANO DE MÍDIA — HIERARQUIA GESTALT + REGRAS VISUAIS COMERCIAL
 * - Código do produto (#PR...) visível para identificação interna e reserva de estáticos.
 * - Busca por nome e código + Geolocalização por Bairro, Zona e Classe Social.
 * - Botão "Selecionar todos os pontos" (e seleção de torres em condomínios).
 * - Pontos selecionados no plano destacados em verde no mapa.
 * ============================================================================
 */
function renderMediaPlanList(m, preserveScroll = false) {
  const prevScrollBox = document.getElementById('mediaPlanScrollBox');
  const prevScrollTop = preserveScroll && prevScrollBox ? prevScrollBox.scrollTop : 0;

  const mobile = isMobileView();
  const scrollMaxHeightClass = mobile ? 'max-h-[520px]' : 'max-h-[580px]';

  const q = state.searchQuery.trim().toLowerCase();
  const matchSearch = (str) => !q || String(str || '').toLowerCase().includes(q);

  const mapCol = document.getElementById('mediaPlanMapColumn');
  const listCol = document.getElementById('mediaPlanListColumn');

  // Exibe o mapa lateral apenas no Desktop (>= 1024px) quando o canal selecionado é OOH
  if (state.channelFilter !== 'ooh' || m.counts.oohPointsCount === 0 || mobile) {
    mapCol.className = 'sim-hide-mobile hidden';
    listCol.className = 'lg:col-span-12';
  } else {
    mapCol.className = 'sim-hide-mobile hidden lg:block lg:col-span-5 sticky top-20';
    listCol.className = 'lg:col-span-7';
  }

  let contentHtml = '';

  // =========================================================================
  // CANAL 1: OOH — Padrão Pontooh Design System (Desktop lg-1024px & Mobile sm-640px)
  // =========================================================================
  if (state.channelFilter === 'ooh') {
    const filteredOoh = m.oohDisplayGroups.filter((g) => {
      const exhLabel = g.isStatic ? 'Impresso' : 'Digital';
      const okSearch = matchSearch(`${g.name} ${g.code} ${g.displayCode} ${g.searchCodes} ${g.address} ${g.district} ${g.zone} ${g.socialClass} ${g.city} ${g.vertical} ${exhLabel} ${g.kind === 'condo_group' ? 'condomínio torres' : ''}`);
      const okCat = !state.ambienteFilter || g.vertical === state.ambienteFilter;
      const okExh = !state.categoriaFilter || exhLabel === state.categoriaFilter;
      const okGeo = matchOohGeoFilter(g, state.geoFilter);
      return okSearch && okCat && okExh && okGeo;
    });

    const filteredPointsCount = filteredOoh.reduce((acc, g) => acc + g.towersCount, 0);
    const selectedOohGroups = filteredOoh.filter((g) => !!state.selectedForRemoval[g.code]);
    const selectedPointsCount = selectedOohGroups.reduce((acc, g) => acc + g.towersCount, 0);
    const selectedSubtotalValue = selectedOohGroups.reduce((acc, g) => acc + g.netPrice, 0);
    const allFilteredSelected = filteredOoh.length > 0 && selectedOohGroups.length === filteredOoh.length;
    const removedKeysCount = Object.keys(state.removedItems).filter((k) => !k.startsWith('rev_') && !k.startsWith('dig_') && !k.startsWith('rad_')).length;
    const filteredSubtotal = filteredOoh.reduce((acc, g) => acc + g.netPrice, 0);

    const oohCardsHtml = filteredOoh.map((g) => {
      const humanAddr = formatHumanAddress(g.address, g.district, g.city, g.state);
      const categoryLabel = g.vertical || 'OOH';
      const safeTitle = g.name.replace(/'/g, '');
      const safeAddr = humanAddr.replace(/'/g, '');
      const isStaticOoh = !!g.isStatic;
      const isSelectedForBulk = !!state.selectedForRemoval[g.code];

      // Subtítulo padronizado: Categoria • Endereço/Bairro, Cidade • Zona · Classe
      const locationPart = g.address ? `${g.address} (${g.district || g.city})` : `${g.district || ''}, ${g.city}`;
      const audiencePart = [g.zone, g.socialClass].filter(Boolean).join(' · ') || 'Audiência Qualificada';
      const subtitleDesktop = `${categoryLabel} • ${locationPart} • ${audiencePart}`;
      const subtitleMobile = `${categoryLabel} • ${humanAddr}`;
      const fullAddressTooltip = `${g.kind === 'condo_group' ? `Coletânea ${g.name}` : g.name} — ${humanAddr} (${categoryLabel} • ${audiencePart})`;

      // Tags de formato com cores do Design System (Zero tag preta!)
      const formatBadgeClass = isStaticOoh
        ? 'bg-[#F3E8FF] text-[#6D28D9] border border-[#DDD6FE]'
        : 'bg-[#EBF3FE] text-[#1D4ED8] border border-[#BFDBFE]';

      // Impacto estimado com número cheio (sem "mil" e sem "no período")
      const rightImpactLabel = 'IMPACTO ESTIMADO';
      const rightImpactValue = fmtInt(g.impacts);

      // Métricas detalhadas sob demanda (Hover no Web / Clique expansível no Mobile estilo "Torres")
      const freqFormatted = Number(g.frequency || 1.61).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const screensLabel = fmtInt(g.screens);
      const exhibitionsValue = isStaticOoh ? 'Fixa' : fmtInt(g.periodInsertions || g.impacts);
      const reachValue = fmtInt(g.reach);
      const isMetricsOpen = !!state.expandedCardMetrics[g.code];

      const metricsHoverPopoverHtml = `
        <div class="hidden group-hover/metrics:block absolute right-0 bottom-full mb-2 z-30 w-[230px] p-3 rounded-xl bg-[#1E293B] text-white text-[11px] leading-snug shadow-xl pointer-events-none text-left">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-300 pb-1.5 mb-1.5 border-b border-slate-700/80">
            Métricas estimadas
          </div>
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Telas:</span>
              <strong class="font-display font-bold text-white">${screensLabel}</strong>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Exibições:</span>
              <strong class="font-display font-bold text-white">${exhibitionsValue}</strong>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Alcance:</span>
              <strong class="font-display font-bold text-white">${reachValue}</strong>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Frequência:</span>
              <strong class="font-display font-bold text-white">${freqFormatted}</strong>
            </div>
          </div>
        </div>
      `;

      const metricsDrawerHtml = isMetricsOpen ? `
        <div class="bg-ds-bg border-t border-ds-border px-3.5 py-2.5 text-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-ds-textSecondary flex items-center gap-1">
              <i class="uil uil-chart-bar text-xs text-ds-textMain"></i>
              Detalhamento de métricas
            </span>
            <button type="button" onclick="toggleCardMetrics('${g.code}')" class="text-[11px] font-semibold text-ds-textSecondary hover:text-ds-textMain">
              Ocultar
            </button>
          </div>
          <div class="grid ${mobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'} gap-2">
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Telas</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${screensLabel}</div>
            </div>
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Exibições</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${exhibitionsValue}</div>
            </div>
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Alcance</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${reachValue}</div>
            </div>
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Frequência</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${freqFormatted}</div>
            </div>
          </div>
        </div>
      ` : '';

      // Desconto abreviado ("Desc. condo.") exclusivamente em verde (#199958) ao lado do valor riscado
      const discountText = g.hasResidentDiscount
        ? `Desc. condo. (-${fmtBRL(g.residentDiscount)})`
        : '';

      if (g.kind === 'condo_group') {
        const isOpen = !!state.expandedCondos[g.condoId];

        return `
          <div id="condoCard-${g.condoId}" data-ooh-card="${g.code}" class="rounded-[16px] border ${
            isSelectedForBulk
              ? 'border-primary bg-[#FFF9F5] ring-1 ring-primary/20'
              : 'border-ds-borderStrong bg-white hover:border-[#B8AEA2]'
          } transition shadow-xs">
            <div class="${mobile ? 'p-3' : 'p-4 sm:p-5'}">
              ${mobile ? `
                <!-- ================= LAYOUT MOBILE (sm — 640px: Header com Impacto inline + Título e Endereço 100% full-width sem truncar) ================= -->
                <div>
                  <!-- Linha 1: Checkbox + Badge + ID + Torres à esquerda | Impacto Estimado à direita -->
                  <div class="flex items-center justify-between gap-1.5 mb-1.5">
                    <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <button
                        type="button"
                        onclick="toggleSelectCardForRemoval('${g.code}')"
                        class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                          isSelectedForBulk
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                        }"
                        title="Selecionar para exclusão em massa"
                      >
                        <i class="uil uil-check text-[11px] leading-none"></i>
                      </button>
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider ${formatBadgeClass}">
                        ${isStaticOoh ? 'IMPRESSO' : 'DIGITAL'}
                      </span>
                      <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                        #${g.displayCode}
                      </span>
                      <span class="px-1.5 py-0.5 rounded-[5px] text-[10px] font-semibold bg-[#F3ECE4] text-[#56514B]">
                        ${g.towersCount} torres
                      </span>
                    </div>

                    <div class="text-right shrink-0 flex items-baseline gap-1">
                      <span class="font-display font-extrabold text-[13px] text-[#1E293B] leading-none whitespace-nowrap">${rightImpactValue}</span>
                      <span class="text-[10px] font-normal text-ds-textSecondary leading-none">impacto</span>
                    </div>
                  </div>

                  <!-- Linha 2: Título com 100% da largura do card -->
                  <h4 class="font-display font-bold text-ds-textMain text-[14px] leading-snug line-clamp-2" title="${fullAddressTooltip}">
                    Coletânea ${g.name}
                  </h4>

                  <!-- Linha 3: Subtítulo/Endereço com 100% da largura do card -->
                  <p class="text-[11px] text-ds-textSecondary mt-0.5 leading-snug line-clamp-2" title="${fullAddressTooltip}">
                    ${subtitleMobile}
                  </p>
                </div>

                <!-- Divisor Horizontal -->
                <div class="my-2.5 border-t border-ds-border"></div>

                <!-- Zona Inferior Mobile: Desconto em linha superior dedicada (zero colisão) + Preço à esquerda e Ações à direita -->
                <div>
                  ${g.hasResidentDiscount ? `
                    <div class="flex items-center gap-1.5 mb-1 text-[11px] leading-none">
                      <span class="text-ds-textMuted line-through">${fmtBRL(g.originalPrice)}</span>
                      <span class="font-semibold text-[#199958]">${discountText}</span>
                    </div>
                  ` : ''}
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-baseline gap-1 whitespace-nowrap">
                      <span class="font-display font-extrabold text-[15px] text-ds-textMain leading-none">
                        ${fmtBRL(g.netPrice)}
                      </span>
                      <span class="text-[11px] font-normal text-ds-textSecondary">
                        / ${m.durationDays}d
                      </span>
                    </div>

                    <div class="flex items-center gap-1 shrink-0 ml-auto">
                      <button
                        type="button"
                        onclick="toggleCardMetrics('${g.code}')"
                        class="w-8 h-8 rounded-[8px] border ${
                          isMetricsOpen
                            ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                            : 'border-ds-borderStrong bg-white text-ds-textSecondary'
                        } inline-flex items-center justify-center transition shrink-0"
                        aria-label="Ver métricas detalhadas"
                      >
                        <i class="uil uil-chart-bar text-base"></i>
                      </button>
                      <button
                        type="button"
                        onclick="toggleCondoGroup('${g.condoId}')"
                        class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white text-ds-textSecondary font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1 transition whitespace-nowrap shrink-0"
                      >
                        <span>${isOpen ? 'Ocultar' : `${g.towersCount} torres`}</span>
                        <i class="uil ${isOpen ? 'uil-angle-up' : 'uil-angle-down'} text-xs"></i>
                      </button>
                      <button
                        type="button"
                        onclick="focusMapPin(${g.latitude}, ${g.longitude}, '${safeTitle}', '${safeAddr}', '${fmtBRL(g.netPrice)}', '${categoryLabel}')"
                        class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white text-ds-textSecondary font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1 transition whitespace-nowrap shrink-0"
                        aria-label="Ver localização no mapa"
                      >
                        <i class="uil uil-map-marker text-xs"></i>
                        <span>Mapa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ` : `
                <!-- ================= LAYOUT DESKTOP (lg — 1024px) — CONDOMÍNIO ================= -->
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0 flex-1 max-w-[360px] xl:max-w-[410px] group/addr relative">
                    <div class="flex flex-wrap items-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onclick="toggleSelectCardForRemoval('${g.code}')"
                        class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                          isSelectedForBulk
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                        }"
                        title="Selecionar para exclusão em massa"
                      >
                        <i class="uil uil-check text-[11px] leading-none"></i>
                      </button>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider ${formatBadgeClass}">
                        ${isStaticOoh ? 'IMPRESSO' : 'DIGITAL'}
                      </span>
                      <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                        ID: #${g.displayCode}
                      </span>
                      <span class="px-2 py-0.5 rounded-[5px] text-[10px] font-semibold bg-[#F3ECE4] text-[#56514B]">
                        ${g.towersCount} torres
                      </span>
                      ${isSelectedForBulk ? `
                        <span class="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-primary-light text-primary border border-primary/30">
                          Selecionado
                        </span>
                      ` : ''}
                    </div>

                    <h4
                      class="font-display font-bold text-ds-textMain text-base sm:text-[17px] leading-snug truncate cursor-help"
                      title="${fullAddressTooltip}"
                    >
                      Coletânea ${g.name}
                    </h4>

                    <p
                      class="text-xs text-ds-textSecondary leading-relaxed mt-1 truncate cursor-help"
                      title="${fullAddressTooltip}"
                    >
                      ${subtitleDesktop}
                    </p>

                    <!-- Tooltip Web ao passar o mouse para ver endereço completo sem invadir o card -->
                    <div class="hidden group-hover/addr:block absolute left-0 top-full mt-1.5 z-30 w-max max-w-[390px] px-3 py-2 rounded-lg bg-[#1E293B] text-white text-[11px] leading-snug shadow-lg whitespace-normal pointer-events-none">
                      <div class="font-bold text-white mb-0.5">Coletânea ${g.name}</div>
                      <div class="text-slate-200">${humanAddr}</div>
                      <div class="text-slate-300 mt-0.5">${categoryLabel} • ${audiencePart}</div>
                    </div>
                  </div>

                  <!-- LADO DIREITO PADRONIZADO: IMPACTO ESTIMADO (número cheio, sem "no período") -->
                  <div class="text-right shrink-0 self-center">
                    <div class="text-[10px] font-normal uppercase tracking-wider text-ds-textSecondary">
                      ${rightImpactLabel}
                    </div>
                    <div class="font-display font-extrabold text-base sm:text-[19px] text-[#1E293B] leading-tight mt-0.5 whitespace-nowrap">
                      ${rightImpactValue}
                    </div>
                  </div>
                </div>

                <!-- LINHA DIVISÓRIA DO DESIGN SYSTEM -->
                <div class="my-3.5 border-t border-ds-border"></div>

                <!-- ZONA INFERIOR DESKTOP (Padrão Design System lg — 1024px) -->
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    ${g.hasResidentDiscount ? `
                      <div class="flex items-center gap-1.5 mb-0.5">
                        <span class="text-[11px] text-ds-textMuted line-through leading-none">${fmtBRL(g.originalPrice)}</span>
                        <span class="text-[11px] font-semibold text-[#199958] leading-none whitespace-nowrap">${discountText}</span>
                      </div>
                    ` : ''}
                    <div class="flex items-baseline gap-1 flex-wrap">
                      <span class="font-display font-extrabold text-base sm:text-[17px] text-ds-textMain leading-none">
                        ${fmtBRL(g.netPrice)}
                      </span>
                      <span class="text-xs font-normal text-ds-textSecondary">
                        / ${m.durationDays} dias
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-1.5 ml-auto shrink-0">
                    <div class="relative group/metrics">
                      <button
                        type="button"
                        onclick="toggleCardMetrics('${g.code}')"
                        class="w-8 h-8 rounded-[8px] border ${
                          isMetricsOpen
                            ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                            : 'border-[#B8AEA2] bg-[#F3ECE4] text-ds-textMain hover:bg-[#282E38] hover:border-[#282E38] hover:text-white'
                        } inline-flex items-center justify-center transition shrink-0"
                        aria-label="Ver métricas detalhadas"
                      >
                        <i class="uil uil-chart-bar text-base"></i>
                      </button>
                      ${metricsHoverPopoverHtml}
                    </div>
                    <button
                      type="button"
                      onclick="toggleCondoGroup('${g.condoId}')"
                      class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center gap-1 transition whitespace-nowrap"
                    >
                      <span>${isOpen ? 'Ocultar torres' : `Ver ${g.towersCount} torres`}</span>
                      <i class="uil ${isOpen ? 'uil-angle-up' : 'uil-angle-down'} text-xs"></i>
                    </button>
                    <button
                      type="button"
                      onclick="focusMapPin(${g.latitude}, ${g.longitude}, '${safeTitle}', '${safeAddr}', '${fmtBRL(g.netPrice)}', '${categoryLabel}')"
                      class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center gap-1 transition whitespace-nowrap"
                      title="Ver localização no mapa"
                    >
                      <i class="uil uil-map-marker text-xs"></i>
                      <span>Ver no mapa</span>
                    </button>
                  </div>
                </div>
              `}
            </div>

            ${metricsDrawerHtml}

            ${isOpen ? `
              <div class="bg-ds-bg border-t border-ds-border divide-y divide-ds-border rounded-b-[16px] overflow-hidden">
                ${g.towers.map((t) => `
                  <div class="px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-[11px] font-mono font-semibold text-ds-textSecondary shrink-0">ID: #${t.code}</span>
                      <span class="font-semibold text-ds-textMain truncate">${t.name}</span>
                    </div>
                    <div class="flex items-center gap-3 shrink-0">
                      <span class="text-ds-textSecondary whitespace-nowrap">${fmtInt(t.periodInsertions)} exib.</span>
                      <strong class="font-display font-bold text-ds-textMain whitespace-nowrap">${fmtBRL(t.netPrice)}</strong>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }

      return `
        <div data-ooh-card="${g.code}" class="rounded-[16px] border ${
          isSelectedForBulk
            ? 'border-primary bg-[#FFF9F5] ring-1 ring-primary/20'
            : 'border-ds-borderStrong bg-white hover:border-[#B8AEA2]'
        } shadow-xs transition">
          <div class="${mobile ? 'p-3' : 'p-4 sm:p-5'}">
            ${mobile ? `
              <!-- ================= LAYOUT MOBILE (sm — 640px: Header com Impacto inline + Título e Endereço 100% full-width sem truncar) ================= -->
              <div>
                <!-- Linha 1: Checkbox + Badge + ID à esquerda | Impacto Estimado à direita -->
                <div class="flex items-center justify-between gap-1.5 mb-1.5">
                  <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <button
                      type="button"
                      onclick="toggleSelectCardForRemoval('${g.code}')"
                      class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelectedForBulk
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                      }"
                      title="Selecionar para exclusão em massa"
                    >
                      <i class="uil uil-check text-[11px] leading-none"></i>
                    </button>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider ${formatBadgeClass}">
                      ${isStaticOoh ? 'IMPRESSO' : 'DIGITAL'}
                    </span>
                    <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                      ID: #${g.displayCode}
                    </span>
                  </div>

                  <div class="text-right shrink-0 flex items-baseline gap-1">
                    <span class="font-display font-extrabold text-[13px] text-[#1E293B] leading-none whitespace-nowrap">${rightImpactValue}</span>
                    <span class="text-[10px] font-normal text-ds-textSecondary leading-none">impacto</span>
                  </div>
                </div>

                <!-- Linha 2: Título com 100% da largura do card -->
                <h4 class="font-display font-bold text-ds-textMain text-[14px] leading-snug line-clamp-2" title="${fullAddressTooltip}">
                  ${g.name}
                </h4>

                <!-- Linha 3: Subtítulo/Endereço com 100% da largura do card -->
                <p class="text-[11px] text-ds-textSecondary mt-0.5 leading-snug line-clamp-2" title="${fullAddressTooltip}">
                  ${subtitleMobile}
                </p>
              </div>

              <!-- Divisor Horizontal -->
              <div class="my-2.5 border-t border-ds-border"></div>

              <!-- Zona Inferior Mobile: Desconto em linha superior dedicada (zero colisão) + Preço à esquerda e Ações à direita -->
              <div>
                ${g.hasResidentDiscount ? `
                  <div class="flex items-center gap-1.5 mb-1 text-[11px] leading-none">
                    <span class="text-ds-textMuted line-through">${fmtBRL(g.originalPrice)}</span>
                    <span class="font-semibold text-[#199958]">${discountText}</span>
                  </div>
                ` : ''}
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-baseline gap-1 whitespace-nowrap">
                    <span class="font-display font-extrabold text-[15px] text-ds-textMain leading-none">
                      ${fmtBRL(g.netPrice)}
                    </span>
                    <span class="text-[11px] font-normal text-ds-textSecondary">
                      / ${m.durationDays}d
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5 shrink-0 ml-auto">
                    <button
                      type="button"
                      onclick="toggleCardMetrics('${g.code}')"
                      class="w-8 h-8 rounded-[8px] border ${
                        isMetricsOpen
                          ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                          : 'border-ds-borderStrong bg-white text-ds-textSecondary'
                      } inline-flex items-center justify-center transition shrink-0"
                      aria-label="Ver métricas detalhadas"
                    >
                      <i class="uil uil-chart-bar text-base"></i>
                    </button>
                    <button
                      type="button"
                      onclick="focusMapPin(${g.latitude}, ${g.longitude}, '${safeTitle}', '${safeAddr}', '${fmtBRL(g.netPrice)}', '${categoryLabel}')"
                      class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white text-ds-textSecondary font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1 transition whitespace-nowrap shrink-0"
                      aria-label="Ver localização no mapa"
                    >
                      <i class="uil uil-map-marker text-xs"></i>
                      <span>Mapa</span>
                    </button>
                  </div>
                </div>
              </div>
            ` : `
              <!-- ================= LAYOUT DESKTOP (lg — 1024px) ================= -->
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1 max-w-[360px] xl:max-w-[410px] group/addr relative">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <button
                      type="button"
                      onclick="toggleSelectCardForRemoval('${g.code}')"
                      class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelectedForBulk
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                      }"
                      title="Selecionar para exclusão em massa"
                    >
                      <i class="uil uil-check text-[11px] leading-none"></i>
                    </button>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider ${formatBadgeClass}">
                      ${isStaticOoh ? 'IMPRESSO' : 'DIGITAL'}
                    </span>
                    <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                      ID: #${g.displayCode}
                    </span>
                    ${isSelectedForBulk ? `
                      <span class="px-2 py-0.5 rounded-[5px] text-[10px] font-bold bg-primary-light text-primary border border-primary/30">
                        Selecionado
                      </span>
                    ` : ''}
                  </div>

                  <h4
                    class="font-display font-bold text-ds-textMain text-base sm:text-[17px] leading-snug truncate cursor-help"
                    title="${fullAddressTooltip}"
                  >
                    ${g.name}
                  </h4>

                  <p
                    class="text-xs text-ds-textSecondary leading-relaxed mt-1 truncate cursor-help"
                    title="${fullAddressTooltip}"
                  >
                    ${subtitleDesktop}
                  </p>

                  <!-- Tooltip Web ao passar o mouse para ver endereço completo sem invadir o card -->
                  <div class="hidden group-hover/addr:block absolute left-0 top-full mt-1.5 z-30 w-max max-w-[390px] px-3 py-2 rounded-lg bg-[#1E293B] text-white text-[11px] leading-snug shadow-lg whitespace-normal pointer-events-none">
                    <div class="font-bold text-white mb-0.5">${g.name}</div>
                    <div class="text-slate-200">${humanAddr}</div>
                    <div class="text-slate-300 mt-0.5">${categoryLabel} • ${audiencePart}</div>
                  </div>
                </div>

                <!-- LADO DIREITO PADRONIZADO: IMPACTO ESTIMADO (número cheio, sem "no período") -->
                <div class="text-right shrink-0 self-center">
                  <div class="text-[10px] font-normal uppercase tracking-wider text-ds-textSecondary">
                    ${rightImpactLabel}
                  </div>
                  <div class="font-display font-extrabold text-base sm:text-[19px] text-[#1E293B] leading-tight mt-0.5 whitespace-nowrap">
                    ${rightImpactValue}
                  </div>
                </div>
              </div>

              <!-- LINHA DIVISÓRIA DO DESIGN SYSTEM -->
              <div class="my-3.5 border-t border-ds-border"></div>

              <!-- ZONA INFERIOR DESKTOP (Padrão Design System lg — 1024px) -->
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  ${g.hasResidentDiscount ? `
                    <div class="flex items-center gap-1.5 mb-0.5">
                      <span class="text-[11px] text-ds-textMuted line-through leading-none">${fmtBRL(g.originalPrice)}</span>
                      <span class="text-[11px] font-semibold text-[#199958] leading-none whitespace-nowrap">${discountText}</span>
                    </div>
                  ` : ''}
                  <div class="flex items-baseline gap-1 flex-wrap">
                    <span class="font-display font-extrabold text-base sm:text-[17px] text-ds-textMain leading-none">
                      ${fmtBRL(g.netPrice)}
                    </span>
                    <span class="text-xs font-normal text-ds-textSecondary">
                      / ${m.durationDays} dias
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 ml-auto shrink-0">
                  <div class="relative group/metrics">
                    <button
                      type="button"
                      onclick="toggleCardMetrics('${g.code}')"
                      class="w-8 h-8 rounded-[8px] border ${
                        isMetricsOpen
                          ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                          : 'border-[#B8AEA2] bg-[#F3ECE4] text-ds-textMain hover:bg-[#282E38] hover:border-[#282E38] hover:text-white'
                      } inline-flex items-center justify-center transition shrink-0"
                      aria-label="Ver métricas detalhadas"
                    >
                      <i class="uil uil-chart-bar text-base"></i>
                    </button>
                    ${metricsHoverPopoverHtml}
                  </div>
                  <button
                    type="button"
                    onclick="focusMapPin(${g.latitude}, ${g.longitude}, '${safeTitle}', '${safeAddr}', '${fmtBRL(g.netPrice)}', '${categoryLabel}')"
                    class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center gap-1 transition whitespace-nowrap"
                    title="Ver localização no mapa"
                  >
                    <i class="uil uil-map-marker text-xs"></i>
                    <span>Ver no mapa</span>
                  </button>
                </div>
              </div>
            `}
          </div>

          ${metricsDrawerHtml}
        </div>
      `;
    }).join('');

    const subtotalDisplay = fmtBRL(filteredSubtotal);
    const isMobileMapActive = mobile && state.mobileOohView === 'map';
    const fp = state.mobileOohFocusedPin;

    contentHtml = `
      <div id="oohChannelCardBox" class="${mobile ? '' : 'bg-ds-surface rounded-2xl border border-ds-borderStrong overflow-hidden'}">
        <!-- Cabeçalho da Seção OOH: no Mobile fica em 1 linha única (Selecionar todos + Switcher Lista|Mapa) sem caixa extra aninhada -->
        <div class="${mobile ? 'pb-2.5 mb-2.5 border-b border-ds-border flex items-center justify-between gap-2' : 'px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-ds-border flex flex-wrap items-center justify-between gap-2'}">
          ${mobile ? `
            <div class="flex items-center gap-2 min-w-0">
              ${selectedOohGroups.length === 0 ? `
                <button
                  type="button"
                  onclick="selectAllVisibleOohForRemoval()"
                  class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                >
                  <span class="w-3.5 h-3.5 rounded-[4px] border border-ds-borderStrong bg-white inline-flex items-center justify-center shrink-0"></span>
                  <span>Selecionar todos (${filteredPointsCount})</span>
                </button>
              ` : `
                <span class="font-display font-bold text-ds-textMain text-xs whitespace-nowrap">
                  OOH (${filteredPointsCount} pontos)
                </span>
              `}
              ${removedKeysCount > 0 ? `
                <button
                  type="button"
                  onclick="restoreAllRemovedPlanItems()"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition whitespace-nowrap"
                >
                  <i class="uil uil-history text-xs"></i>
                  <span>Restaurar (${removedKeysCount})</span>
                </button>
              ` : ''}
            </div>
          ` : `
            <div class="flex items-center gap-2.5 flex-wrap min-w-0">
              <h3 class="font-display font-bold text-ds-textMain text-sm sm:text-base whitespace-nowrap">
                OOH (${filteredPointsCount} pontos)
              </h3>
              ${selectedOohGroups.length === 0 ? `
                <button
                  type="button"
                  onclick="selectAllVisibleOohForRemoval()"
                  class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap"
                >
                  <span class="w-3.5 h-3.5 rounded-[4px] border border-ds-borderStrong bg-white inline-flex items-center justify-center shrink-0"></span>
                  <span>Selecionar todos os pontos</span>
                </button>
              ` : ''}
              ${removedKeysCount > 0 ? `
                <button
                  type="button"
                  onclick="restoreAllRemovedPlanItems()"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition"
                >
                  <i class="uil uil-history text-xs"></i>
                  <span>Restaurar ${removedKeysCount} ${removedKeysCount > 1 ? 'excluídos' : 'excluído'}</span>
                </button>
              ` : ''}
            </div>
          `}

          ${mobile ? `
            <!-- Segmented Switcher Inline Lista ↔ Mapa (Zero Modal no Mobile!) -->
            <div class="p-0.5 rounded-xl bg-ds-bg border border-ds-borderStrong inline-flex items-center shrink-0">
              <button
                type="button"
                onclick="setMobileOohView('list')"
                class="px-2.5 py-1 rounded-lg font-display font-bold text-[11px] inline-flex items-center gap-1 transition ${
                  !isMobileMapActive
                    ? 'bg-white text-ds-textMain shadow-xs'
                    : 'text-ds-textSecondary hover:text-ds-textMain'
                }"
              >
                <i class="uil uil-list-ul text-xs"></i>
                <span>Lista</span>
              </button>
              <button
                type="button"
                onclick="setMobileOohView('map')"
                class="px-2.5 py-1 rounded-lg font-display font-bold text-[11px] inline-flex items-center gap-1 transition ${
                  isMobileMapActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-ds-textSecondary hover:text-ds-textMain'
                }"
              >
                <i class="uil uil-map text-xs"></i>
                <span>Mapa</span>
              </button>
            </div>
          ` : `
            <span class="text-xs font-normal text-ds-textSecondary whitespace-nowrap">
              Subtotal: <strong class="font-bold text-ds-textMain">${subtotalDisplay}</strong>
            </span>
          `}
        </div>

        <!-- BARRA VISUAL DE EXCLUSÃO EM MASSA (Aparece automaticamente quando 1 ou mais cards são selecionados) -->
        ${selectedOohGroups.length > 0 ? `
          <div class="${mobile ? 'px-3 py-2 mb-2.5 rounded-xl border border-primary/30' : 'px-3 sm:px-4 py-2.5 border-b border-primary/30'} bg-[#FFF4ED] flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-display font-bold text-ds-textMain">
                ${selectedPointsCount} ${selectedPointsCount > 1 ? 'pontos selecionados' : 'ponto selecionado'} (${fmtBRL(selectedSubtotalValue)})
              </span>
              ${!allFilteredSelected ? `
                <button
                  type="button"
                  onclick="selectAllVisibleOohForRemoval()"
                  class="text-[11px] font-semibold text-primary hover:underline ml-1"
                >
                  Selecionar todos (${filteredPointsCount})
                </button>
              ` : `
                <button
                  type="button"
                  onclick="clearBulkSelection()"
                  class="text-[11px] font-semibold text-ds-textSecondary hover:text-ds-textMain underline ml-1"
                >
                  Desmarcar todos
                </button>
              `}
            </div>

            <button
              type="button"
              onclick="confirmBulkRemoveSelectedItems()"
              class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition"
            >
              <i class="uil uil-trash-alt text-sm"></i>
              <span>Excluir selecionados da proposta</span>
            </button>
          </div>
        ` : ''}

        ${isMobileMapActive ? `
          <!-- MAPA INTERATIVO 100% INLINE NO MOBILE -->
          <div class="space-y-2.5 bg-white">
            <div class="flex items-center justify-between gap-2 text-[11px] text-ds-textSecondary px-0.5">
              <span>Toque no pino para ver o card do ponto</span>
            </div>

            <div id="mobileInlineLeafletMap" class="w-full h-[360px] rounded-xl border border-ds-borderStrong overflow-hidden z-10"></div>

            <button
              type="button"
              onclick="setMobileOohView('list')"
              class="w-full py-2.5 px-3 rounded-xl bg-ds-surface hover:bg-ds-bg border border-ds-borderStrong text-ds-textMain font-display font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <i class="uil uil-arrow-left text-sm"></i>
              <span>Voltar para a lista (${filteredPointsCount})</span>
            </button>
          </div>
        ` : `
          <div id="mediaPlanScrollBox" class="${mobile ? 'space-y-2.5' : `p-3.5 space-y-3 ${scrollMaxHeightClass} overflow-y-auto bounded-scroll`}">
            ${oohCardsHtml || `<div class="p-6 text-center text-xs text-ds-textSecondary">Nenhum ponto OOH encontrado para os filtros selecionados.</div>`}
          </div>
        `}
      </div>
    `;
  }

  // =========================================================================
  // CANAL 2: REVISTAS E JORNAIS — Padrão Pontooh Design System (Desktop & Mobile)
  // =========================================================================
  if (state.channelFilter === 'revistas') {
    const filteredRevistas = m.revistasItems.filter((r) => {
      const okSearch = matchSearch(`${r.name} ${r.editorialTitle} Display Editora Globo`);
      const okCat = !state.ambienteFilter || r.editorialTitle === state.ambienteFilter;
      return okSearch && okCat;
    });

    const selectedRevistas = filteredRevistas.filter((r) => !!state.selectedForRemoval[r.itemKey]);
    const selectedRevistasSubtotal = selectedRevistas.reduce((acc, r) => acc + r.totalPrice, 0);

    const revistasCardsHtml = filteredRevistas.map((r, idx) => {
      const itemKey = r.itemKey || `rev_${idx}`;
      const isSelectedForBulk = !!state.selectedForRemoval[itemKey];
      const estReach = Math.round(r.impressions * 0.62);
      const revSubtitle = `Editora Globo • Cobertura Nacional • CPM ${fmtBRL(r.cpm)}`;
      const isMetricsOpen = !!state.expandedCardMetrics[itemKey];

      const revMetricsPopoverHtml = `
        <div class="hidden group-hover/metrics:block absolute right-0 bottom-full mb-2 z-30 w-[235px] p-3 rounded-xl bg-[#1E293B] text-white text-[11px] leading-snug shadow-xl pointer-events-none text-left">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-300 pb-1.5 mb-1.5 border-b border-slate-700/80">
            Detalhamento de métricas
          </div>
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Portais:</span>
              <strong class="font-display font-bold text-white">1 portal (${r.editorialTitle})</strong>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">CPM:</span>
              <strong class="font-display font-bold text-white">${fmtBRL(r.cpm)}</strong>
            </div>
          </div>
        </div>
      `;

      const revMetricsDrawerHtml = isMetricsOpen ? `
        <div class="bg-ds-bg border-t border-ds-border px-3.5 py-2.5 text-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-ds-textSecondary flex items-center gap-1">
              <i class="uil uil-chart-bar text-xs text-ds-textMain"></i>
              Detalhamento de métricas
            </span>
            <button type="button" onclick="toggleCardMetrics('${itemKey}')" class="text-[11px] font-semibold text-ds-textSecondary hover:text-ds-textMain">
              Ocultar
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Portais</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">1 portal (${r.editorialTitle})</div>
            </div>
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">CPM</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${fmtBRL(r.cpm)}</div>
            </div>
          </div>
        </div>
      ` : '';

      return `
        <div class="rounded-[16px] border ${
          isSelectedForBulk
            ? 'border-primary bg-[#FFF9F5] ring-1 ring-primary/20'
            : 'border-ds-borderStrong bg-white hover:border-[#B8AEA2]'
        } shadow-xs transition">
          <div class="${mobile ? 'p-3' : 'p-4 sm:p-5'}">
            ${mobile ? `
              <!-- ================= LAYOUT MOBILE (sm — 640px) ================= -->
              <div>
                <div class="flex items-center justify-between gap-1.5 mb-1.5">
                  <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <button
                      type="button"
                      onclick="toggleSelectCardForRemoval('${itemKey}')"
                      class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelectedForBulk
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                      }"
                    >
                      <i class="uil uil-check text-[11px] leading-none"></i>
                    </button>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#EBF3FE] text-[#1D4ED8] border border-[#BFDBFE]">
                      DISPLAY
                    </span>
                    <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                      ID: #REV-0${idx + 1}
                    </span>
                  </div>

                  <div class="text-right shrink-0 flex items-baseline gap-1">
                    <span class="font-display font-extrabold text-[13px] text-[#1E293B] leading-none whitespace-nowrap">${fmtInt(r.impressions)}</span>
                    <span class="text-[10px] font-normal text-ds-textSecondary leading-none">impressões</span>
                  </div>
                </div>
                <h4 class="font-display font-bold text-ds-textMain text-[14px] leading-snug line-clamp-2" title="${r.editorialTitle} — ${revSubtitle}">
                  ${r.editorialTitle}
                </h4>
                <p class="text-[11px] text-ds-textSecondary mt-0.5 leading-snug line-clamp-2" title="${r.editorialTitle} — ${revSubtitle}">
                  Editora Globo • Cobertura Nacional
                </p>
              </div>
              <div class="my-2.5 border-t border-ds-border"></div>
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-baseline gap-1 whitespace-nowrap">
                  <span class="font-display font-extrabold text-[15px] text-ds-textMain leading-none">${fmtBRL(r.totalPrice)}</span>
                  <span class="text-[11px] text-ds-textSecondary">/ ${m.durationDays}d</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    onclick="toggleCardMetrics('${itemKey}')"
                    class="w-8 h-8 rounded-[8px] border ${
                      isMetricsOpen
                        ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                        : 'border-ds-borderStrong bg-white text-ds-textSecondary'
                    } inline-flex items-center justify-center transition shrink-0"
                    aria-label="Ver métricas detalhadas"
                  >
                    <i class="uil uil-chart-bar text-base"></i>
                  </button>
                </div>
              </div>
            ` : `
              <!-- ================= LAYOUT DESKTOP (lg — 1024px) ================= -->
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1 max-w-[360px] xl:max-w-[410px] group/addr relative">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <button
                      type="button"
                      onclick="toggleSelectCardForRemoval('${itemKey}')"
                      class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelectedForBulk
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                      }"
                    >
                      <i class="uil uil-check text-[11px] leading-none"></i>
                    </button>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#EBF3FE] text-[#1D4ED8] border border-[#BFDBFE]">
                      DISPLAY
                    </span>
                    <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                      ID: #REV-0${idx + 1}
                    </span>
                  </div>
                  <h4 class="font-display font-bold text-ds-textMain text-base sm:text-[17px] leading-snug truncate cursor-help" title="${r.editorialTitle} — ${revSubtitle}">
                    ${r.editorialTitle}
                  </h4>
                  <p class="text-xs text-ds-textSecondary mt-1 truncate cursor-help" title="${r.editorialTitle} — ${revSubtitle}">
                    ${revSubtitle}
                  </p>
                  <div class="hidden group-hover/addr:block absolute left-0 top-full mt-1.5 z-30 w-max max-w-[390px] px-3 py-2 rounded-lg bg-[#1E293B] text-white text-[11px] leading-snug shadow-lg whitespace-normal pointer-events-none">
                    <div class="font-bold text-white mb-0.5">${r.editorialTitle}</div>
                    <div class="text-slate-200">${revSubtitle}</div>
                  </div>
                </div>
                <div class="text-right shrink-0 self-center">
                  <div class="text-[10px] font-normal uppercase tracking-wider text-ds-textSecondary">
                    IMPRESSÕES ESTIMADAS
                  </div>
                  <div class="font-display font-extrabold text-base sm:text-[19px] text-[#1E293B] leading-tight mt-0.5 whitespace-nowrap">
                    ${fmtInt(r.impressions)}
                  </div>
                </div>
              </div>
              <div class="my-3.5 border-t border-ds-border"></div>
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-baseline gap-1 flex-wrap">
                    <span class="font-display font-extrabold text-base sm:text-[17px] text-ds-textMain leading-none">
                      ${fmtBRL(r.totalPrice)}
                    </span>
                    <span class="text-xs font-normal text-ds-textSecondary">
                      / ${m.durationDays} dias
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2 ml-auto shrink-0">
                  <div class="relative group/metrics">
                    <button
                      type="button"
                      onclick="toggleCardMetrics('${itemKey}')"
                      class="w-8 h-8 rounded-[8px] border ${
                        isMetricsOpen
                          ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                          : 'border-[#B8AEA2] bg-[#F3ECE4] text-ds-textMain hover:bg-[#282E38] hover:border-[#282E38] hover:text-white'
                      } inline-flex items-center justify-center transition shrink-0"
                      aria-label="Ver métricas detalhadas"
                    >
                      <i class="uil uil-chart-bar text-base"></i>
                    </button>
                    ${revMetricsPopoverHtml}
                  </div>
                </div>
              </div>
            `}
          </div>
          ${revMetricsDrawerHtml}
        </div>
      `;
    }).join('');

    contentHtml = `
      <div class="${mobile ? '' : 'bg-ds-surface rounded-2xl border border-ds-borderStrong overflow-hidden'}">
        <div class="${mobile ? 'pb-2.5 mb-2.5 border-b border-ds-border flex items-center justify-between' : 'px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-ds-border flex items-center justify-between'}">
          <h3 class="font-display font-bold text-ds-textMain text-xs sm:text-base">
            Revistas (${filteredRevistas.length})
          </h3>
          <span class="text-xs font-normal text-ds-textSecondary whitespace-nowrap">${mobile ? `<strong class="font-bold text-ds-textMain">${fmtBRL(m.financials.revistasNet)}</strong>` : `Subtotal: <strong class="font-bold text-ds-textMain">${fmtBRL(m.financials.revistasNet)}</strong>`}</span>
        </div>

        ${selectedRevistas.length > 0 ? `
          <div class="${mobile ? 'px-3 py-2 mb-2.5 rounded-xl border border-primary/30' : 'px-3 sm:px-4 py-2.5 border-b border-primary/30'} bg-[#FFF4ED] flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-display font-bold text-ds-textMain">${selectedRevistas.length} ${selectedRevistas.length > 1 ? 'selecionados' : 'selecionado'} (${fmtBRL(selectedRevistasSubtotal)})</span>
              ${selectedRevistas.length < filteredRevistas.length ? `
                <button type="button" onclick="selectAllVisibleChannelItems('revistas')" class="text-[11px] font-semibold text-primary hover:underline ml-1">Selecionar todos (${filteredRevistas.length})</button>
              ` : `
                <button type="button" onclick="clearBulkSelection()" class="text-[11px] font-semibold text-ds-textSecondary hover:text-ds-textMain underline ml-1">Desmarcar todos</button>
              `}
            </div>
            <button type="button" onclick="confirmBulkRemoveSelectedItems()" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition">
              <i class="uil uil-trash-alt text-sm"></i>
              <span>Excluir selecionados da proposta</span>
            </button>
          </div>
        ` : ''}

        <div id="mediaPlanScrollBox" class="${mobile ? 'space-y-2.5' : `p-3.5 space-y-3 ${scrollMaxHeightClass} overflow-y-auto bounded-scroll`}">
          ${revistasCardsHtml || `<div class="p-6 text-center text-xs text-ds-textSecondary">Nenhum título encontrado para os filtros selecionados.</div>`}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // CANAL 3: PORTAIS E GLOBOPLAY — Padrão Pontooh Design System (Desktop & Mobile)
  // =========================================================================
  if (state.channelFilter === 'portais') {
    const filteredPortais = m.portaisItems.filter((p) => {
      const okSearch = matchSearch(`${p.name} ${p.cleanTitle} ${p.mediaTypeLabel} ${p.interventionLabel || ''} ${p.channelTypeLabel} ${p.vehicles.join(' ')}`);
      const okAmbiente = !state.ambienteFilter || p.channelTypeLabel === state.ambienteFilter;
      const okCategoria = !state.categoriaFilter || p.mediaTypeLabel === state.categoriaFilter;
      return okSearch && okAmbiente && okCategoria;
    });

    const selectedPortais = filteredPortais.filter((p) => !!state.selectedForRemoval[p.itemKey]);
    const selectedPortaisSubtotal = selectedPortais.reduce((acc, p) => acc + p.totalPrice, 0);

    const portaisCardsHtml = filteredPortais.map((p, idx) => {
      const itemKey = p.itemKey || `dig_${idx}`;
      const isSelectedForBulk = !!state.selectedForRemoval[itemKey];
      const estReach = Math.round(p.impressions * 0.62);
      const digSubtitle = `${p.channelTypeLabel} • ${p.interventionLabel || 'Clicável'} • ${p.vehicles.join(', ')}`;
      const isMetricsOpen = !!state.expandedCardMetrics[itemKey];
      const digChannelsLabel = `${p.vehicles.length} ${p.vehicles.length > 1 ? 'portais' : 'portal'}`;

      const digMetricsPopoverHtml = `
        <div class="hidden group-hover/metrics:block absolute right-0 bottom-full mb-2 z-30 w-[235px] p-3 rounded-xl bg-[#1E293B] text-white text-[11px] leading-snug shadow-xl pointer-events-none text-left">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-300 pb-1.5 mb-1.5 border-b border-slate-700/80">
            Detalhamento de métricas
          </div>
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Portais:</span>
              <strong class="font-display font-bold text-white">${digChannelsLabel}</strong>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">CPM:</span>
              <strong class="font-display font-bold text-white">${fmtBRL(p.cpm)}</strong>
            </div>
          </div>
        </div>
      `;

      const digMetricsDrawerHtml = isMetricsOpen ? `
        <div class="bg-ds-bg border-t border-ds-border px-3.5 py-2.5 text-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-ds-textSecondary flex items-center gap-1">
              <i class="uil uil-chart-bar text-xs text-ds-textMain"></i>
              Detalhamento de métricas
            </span>
            <button type="button" onclick="toggleCardMetrics('${itemKey}')" class="text-[11px] font-semibold text-ds-textSecondary hover:text-ds-textMain">
              Ocultar
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Portais</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${digChannelsLabel}</div>
            </div>
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">CPM</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${fmtBRL(p.cpm)}</div>
            </div>
          </div>
        </div>
      ` : '';

      return `
        <div class="rounded-[16px] border ${
          isSelectedForBulk
            ? 'border-primary bg-[#FFF9F5] ring-1 ring-primary/20'
            : 'border-ds-borderStrong bg-white hover:border-[#B8AEA2]'
        } shadow-xs transition">
          <div class="${mobile ? 'p-3' : 'p-4 sm:p-5'}">
            ${mobile ? `
              <!-- ================= LAYOUT MOBILE (sm — 640px) ================= -->
              <div>
                <div class="flex items-center justify-between gap-1.5 mb-1.5">
                  <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <button
                      type="button"
                      onclick="toggleSelectCardForRemoval('${itemKey}')"
                      class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelectedForBulk
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                      }"
                    >
                      <i class="uil uil-check text-[11px] leading-none"></i>
                    </button>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#EBF3FE] text-[#1D4ED8] border border-[#BFDBFE]">
                      ${p.mediaTypeLabel.toUpperCase()}
                    </span>
                    <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                      ID: #DIG-0${idx + 1}
                    </span>
                  </div>

                  <div class="text-right shrink-0 flex items-baseline gap-1">
                    <span class="font-display font-extrabold text-[13px] text-[#1E293B] leading-none whitespace-nowrap">${fmtInt(p.impressions)}</span>
                    <span class="text-[10px] font-normal text-ds-textSecondary leading-none">impressões</span>
                  </div>
                </div>
                <h4 class="font-display font-bold text-ds-textMain text-[14px] leading-snug line-clamp-2" title="${p.cleanTitle} — ${digSubtitle}">
                  ${p.cleanTitle}
                </h4>
                <p class="text-[11px] text-ds-textSecondary mt-0.5 leading-snug line-clamp-2" title="${p.cleanTitle} — ${digSubtitle}">
                  ${p.channelTypeLabel} • ${p.vehicles.join(', ')}
                </p>
              </div>
              <div class="my-2.5 border-t border-ds-border"></div>
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-baseline gap-1 whitespace-nowrap">
                  <span class="font-display font-extrabold text-[15px] text-ds-textMain leading-none">${fmtBRL(p.totalPrice)}</span>
                  <span class="text-[11px] text-ds-textSecondary">/ ${m.durationDays}d</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    onclick="toggleCardMetrics('${itemKey}')"
                    class="w-8 h-8 rounded-[8px] border ${
                      isMetricsOpen
                        ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                        : 'border-ds-borderStrong bg-white text-ds-textSecondary'
                    } inline-flex items-center justify-center transition shrink-0"
                    aria-label="Ver métricas detalhadas"
                  >
                    <i class="uil uil-chart-bar text-base"></i>
                  </button>
                </div>
              </div>
            ` : `
              <!-- ================= LAYOUT DESKTOP (lg — 1024px) ================= -->
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1 max-w-[360px] xl:max-w-[410px] group/addr relative">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <button
                      type="button"
                      onclick="toggleSelectCardForRemoval('${itemKey}')"
                      class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelectedForBulk
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                      }"
                    >
                      <i class="uil uil-check text-[11px] leading-none"></i>
                    </button>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#EBF3FE] text-[#1D4ED8] border border-[#BFDBFE]">
                      ${p.mediaTypeLabel.toUpperCase()}
                    </span>
                    <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                      ID: #DIG-0${idx + 1}
                    </span>
                  </div>
                  <h4 class="font-display font-bold text-ds-textMain text-base sm:text-[17px] leading-snug truncate cursor-help" title="${p.cleanTitle} — ${digSubtitle}">
                    ${p.cleanTitle}
                  </h4>
                  <p class="text-xs text-ds-textSecondary mt-1 truncate cursor-help" title="${p.cleanTitle} — ${digSubtitle}">
                    ${digSubtitle}
                  </p>
                  <div class="hidden group-hover/addr:block absolute left-0 top-full mt-1.5 z-30 w-max max-w-[390px] px-3 py-2 rounded-lg bg-[#1E293B] text-white text-[11px] leading-snug shadow-lg whitespace-normal pointer-events-none">
                    <div class="font-bold text-white mb-0.5">${p.cleanTitle}</div>
                    <div class="text-slate-200">${digSubtitle}</div>
                  </div>
                </div>
                <div class="text-right shrink-0 self-center">
                  <div class="text-[10px] font-normal uppercase tracking-wider text-ds-textSecondary">
                    IMPRESSÕES ESTIMADAS
                  </div>
                  <div class="font-display font-extrabold text-base sm:text-[19px] text-[#1E293B] leading-tight mt-0.5 whitespace-nowrap">
                    ${fmtInt(p.impressions)}
                  </div>
                </div>
              </div>
              <div class="my-3.5 border-t border-ds-border"></div>
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-baseline gap-1 flex-wrap">
                    <span class="font-display font-extrabold text-base sm:text-[17px] text-ds-textMain leading-none">
                      ${fmtBRL(p.totalPrice)}
                    </span>
                    <span class="text-xs font-normal text-ds-textSecondary">
                      / ${m.durationDays} dias
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2 ml-auto shrink-0">
                  <div class="relative group/metrics">
                    <button
                      type="button"
                      onclick="toggleCardMetrics('${itemKey}')"
                      class="w-8 h-8 rounded-[8px] border ${
                        isMetricsOpen
                          ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                          : 'border-[#B8AEA2] bg-[#F3ECE4] text-ds-textMain hover:bg-[#282E38] hover:border-[#282E38] hover:text-white'
                      } inline-flex items-center justify-center transition shrink-0"
                      aria-label="Ver métricas detalhadas"
                    >
                      <i class="uil uil-chart-bar text-base"></i>
                    </button>
                    ${digMetricsPopoverHtml}
                  </div>
                </div>
              </div>
            `}
          </div>
          ${digMetricsDrawerHtml}
        </div>
      `;
    }).join('');

    contentHtml = `
      <div class="${mobile ? '' : 'bg-ds-surface rounded-2xl border border-ds-borderStrong overflow-hidden'}">
        <div class="${mobile ? 'pb-2.5 mb-2.5 border-b border-ds-border flex items-center justify-between gap-2' : 'px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-ds-border flex items-center justify-between gap-2'}">
          <h3 class="font-display font-bold text-ds-textMain text-xs sm:text-base">
            Portais e Globoplay (${filteredPortais.length})
          </h3>
          <span class="text-xs font-normal text-ds-textSecondary whitespace-nowrap">${mobile ? `<strong class="font-bold text-ds-textMain">${fmtBRL(m.financials.portaisNet)}</strong>` : `Subtotal: <strong class="font-bold text-ds-textMain">${fmtBRL(m.financials.portaisNet)}</strong>`}</span>
        </div>

        ${selectedPortais.length > 0 ? `
          <div class="${mobile ? 'px-3 py-2 mb-2.5 rounded-xl border border-primary/30' : 'px-3 sm:px-4 py-2.5 border-b border-primary/30'} bg-[#FFF4ED] flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-display font-bold text-ds-textMain">${selectedPortais.length} ${selectedPortais.length > 1 ? 'selecionados' : 'selecionado'} (${fmtBRL(selectedPortaisSubtotal)})</span>
              ${selectedPortais.length < filteredPortais.length ? `
                <button type="button" onclick="selectAllVisibleChannelItems('portais')" class="text-[11px] font-semibold text-primary hover:underline ml-1">Selecionar todos (${filteredPortais.length})</button>
              ` : `
                <button type="button" onclick="clearBulkSelection()" class="text-[11px] font-semibold text-ds-textSecondary hover:text-ds-textMain underline ml-1">Desmarcar todos</button>
              `}
            </div>
            <button type="button" onclick="confirmBulkRemoveSelectedItems()" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition">
              <i class="uil uil-trash-alt text-sm"></i>
              <span>Excluir selecionados da proposta</span>
            </button>
          </div>
        ` : ''}

        <div id="mediaPlanScrollBox" class="${mobile ? 'space-y-2.5' : `p-3.5 space-y-3 ${scrollMaxHeightClass} overflow-y-auto bounded-scroll`}">
          ${portaisCardsHtml || `<div class="p-6 text-center text-xs text-ds-textSecondary">Nenhum produto encontrado para os filtros selecionados.</div>`}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // CANAL 4: RÁDIO CBN — Padrão Pontooh Design System (Desktop & Mobile)
  // =========================================================================
  if (state.channelFilter === 'radio') {
    const filteredRadio = m.radioItems.filter((rd) => {
      const okSearch = matchSearch(`${rd.stationName} ${rd.programLabel} ${rd.cleanTitle} ${rd.city} ${rd.state} ${rd.timeWindow} ${rd.frequencyDaysLabel}`);
      const okAmbiente = !state.ambienteFilter || rd.city === state.ambienteFilter;
      const okCategoria = !state.categoriaFilter || rd.timeWindow === state.categoriaFilter;
      return okSearch && okAmbiente && okCategoria;
    });

    const selectedRadio = filteredRadio.filter((rd) => !!state.selectedForRemoval[rd.itemKey]);
    const selectedRadioSubtotal = selectedRadio.reduce((acc, rd) => acc + rd.totalPrice, 0);

    const radioCardsHtml = filteredRadio.map((rd, idx) => {
      const itemKey = rd.itemKey || `rad_${idx}`;
      const isSelectedForBulk = !!state.selectedForRemoval[itemKey];
      const estImpacts = rd.totalInsertions * 18500;
      const estReach = Math.round(estImpacts * 0.58);
      const radSubtitle = `${rd.stationName} • ${rd.city}, ${rd.state} • Faixa ${rd.timeWindow}`;
      const isMetricsOpen = !!state.expandedCardMetrics[itemKey];
      const spotsLabel = `${fmtInt(rd.totalInsertions)} (${fmtInt(rd.weeklyInsertions)}/sem)`;

      const radMetricsPopoverHtml = `
        <div class="hidden group-hover/metrics:block absolute right-0 bottom-full mb-2 z-30 w-[235px] p-3 rounded-xl bg-[#1E293B] text-white text-[11px] leading-snug shadow-xl pointer-events-none text-left">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-300 pb-1.5 mb-1.5 border-b border-slate-700/80">
            Detalhamento de métricas
          </div>
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Frequência:</span>
              <strong class="font-display font-bold text-white">${rd.frequencyDaysLabel}</strong>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Faixa horária:</span>
              <strong class="font-display font-bold text-white">${rd.timeWindow}</strong>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-300">Duração:</span>
              <strong class="font-display font-bold text-white">${rd.spotDuration}s</strong>
            </div>
          </div>
        </div>
      `;

      const radMetricsDrawerHtml = isMetricsOpen ? `
        <div class="bg-ds-bg border-t border-ds-border px-3.5 py-2.5 text-xs">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-ds-textSecondary flex items-center gap-1">
              <i class="uil uil-chart-bar text-xs text-ds-textMain"></i>
              Detalhamento de métricas
            </span>
            <button type="button" onclick="toggleCardMetrics('${itemKey}')" class="text-[11px] font-semibold text-ds-textSecondary hover:text-ds-textMain">
              Ocultar
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Frequência</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${rd.frequencyDaysLabel}</div>
            </div>
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Faixa horária</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${rd.timeWindow}</div>
            </div>
            <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border">
              <div class="text-[10px] text-ds-textSecondary">Duração</div>
              <div class="font-display font-bold text-ds-textMain text-xs mt-0.5">${rd.spotDuration}s</div>
            </div>
          </div>
        </div>
      ` : '';

      return `
        <div class="rounded-[16px] border ${
          isSelectedForBulk
            ? 'border-primary bg-[#FFF9F5] ring-1 ring-primary/20'
            : 'border-ds-borderStrong bg-white hover:border-[#B8AEA2]'
        } shadow-xs transition">
          <div class="${mobile ? 'p-3' : 'p-4 sm:p-5'}">
            ${mobile ? `
              <!-- ================= LAYOUT MOBILE (sm — 640px) ================= -->
              <div>
                <div class="flex items-center justify-between gap-1.5 mb-1.5">
                  <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                    <button
                      type="button"
                      onclick="toggleSelectCardForRemoval('${itemKey}')"
                      class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelectedForBulk
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                      }"
                    >
                      <i class="uil uil-check text-[11px] leading-none"></i>
                    </button>
                    <span class="inline-flex items-center px-1.5 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                      SPOT ${rd.spotDuration}S
                    </span>
                    <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                      ID: #CBN-0${idx + 1}
                    </span>
                  </div>

                  <div class="text-right shrink-0 flex items-baseline gap-1">
                    <span class="font-display font-extrabold text-[13px] text-[#1E293B] leading-none whitespace-nowrap">${fmtInt(rd.totalInsertions)}</span>
                    <span class="text-[10px] font-normal text-ds-textSecondary leading-none">inserções</span>
                  </div>
                </div>
                <h4 class="font-display font-bold text-ds-textMain text-[14px] leading-snug line-clamp-2" title="${rd.cleanTitle} — ${radSubtitle}">
                  ${rd.cleanTitle}
                </h4>
                <p class="text-[11px] text-ds-textSecondary mt-0.5 leading-snug line-clamp-2" title="${rd.cleanTitle} — ${radSubtitle}">
                  ${radSubtitle}
                </p>
              </div>
              <div class="my-2.5 border-t border-ds-border"></div>
              <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-baseline gap-1 whitespace-nowrap">
                    <span class="font-display font-extrabold text-[15px] text-ds-textMain leading-none">${fmtBRL(rd.totalPrice)}</span>
                    <span class="text-[11px] text-ds-textSecondary">/ ${m.durationDays}d</span>
                  </div>
                  <div class="text-[10px] font-semibold text-amber-800 leading-tight mt-0.5">Faturado à parte</div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    onclick="toggleCardMetrics('${itemKey}')"
                    class="w-8 h-8 rounded-[8px] border ${
                      isMetricsOpen
                        ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                        : 'border-ds-borderStrong bg-white text-ds-textSecondary'
                    } inline-flex items-center justify-center transition shrink-0"
                    aria-label="Ver métricas detalhadas"
                  >
                    <i class="uil uil-chart-bar text-base"></i>
                  </button>
                </div>
              </div>
            ` : `
              <!-- ================= LAYOUT DESKTOP (lg — 1024px) ================= -->
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1 max-w-[360px] xl:max-w-[410px] group/addr relative">
                  <div class="flex flex-wrap items-center gap-2 mb-1.5">
                    <button
                      type="button"
                      onclick="toggleSelectCardForRemoval('${itemKey}')"
                      class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${
                        isSelectedForBulk
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'
                      }"
                    >
                      <i class="uil uil-check text-[11px] leading-none"></i>
                    </button>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                      SPOT ${rd.spotDuration}S
                    </span>
                    <span class="text-[11px] font-mono font-semibold text-ds-textSecondary">
                      ID: #CBN-0${idx + 1}
                    </span>
                  </div>
                  <h4 class="font-display font-bold text-ds-textMain text-base sm:text-[17px] leading-snug truncate cursor-help" title="${rd.cleanTitle} — ${radSubtitle}">
                    ${rd.cleanTitle}
                  </h4>
                  <p class="text-xs text-ds-textSecondary mt-1 truncate cursor-help" title="${rd.cleanTitle} — ${radSubtitle}">
                    ${radSubtitle}
                  </p>
                  <div class="hidden group-hover/addr:block absolute left-0 top-full mt-1.5 z-30 w-max max-w-[390px] px-3 py-2 rounded-lg bg-[#1E293B] text-white text-[11px] leading-snug shadow-lg whitespace-normal pointer-events-none">
                    <div class="font-bold text-white mb-0.5">${rd.cleanTitle}</div>
                    <div class="text-slate-200">${radSubtitle}</div>
                  </div>
                </div>
                <div class="text-right shrink-0 self-center">
                  <div class="text-[10px] font-normal uppercase tracking-wider text-ds-textSecondary">
                    INSERÇÕES
                  </div>
                  <div class="font-display font-extrabold text-base sm:text-[19px] text-[#1E293B] leading-tight mt-0.5 whitespace-nowrap">
                    ${fmtInt(rd.totalInsertions)}
                  </div>
                </div>
              </div>
              <div class="my-3.5 border-t border-ds-border"></div>
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-baseline gap-1 flex-wrap">
                    <span class="font-display font-extrabold text-base sm:text-[17px] text-ds-textMain leading-none">
                      ${fmtBRL(rd.totalPrice)}
                    </span>
                    <span class="text-xs font-normal text-ds-textSecondary">
                      / ${m.durationDays} dias
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2 shrink-0 whitespace-nowrap">
                  <span class="px-2.5 py-1.5 rounded-[8px] bg-amber-50 border border-amber-200 text-amber-900 font-display font-bold text-xs inline-flex items-center whitespace-nowrap">
                    Faturado à parte
                  </span>
                  <div class="relative group/metrics">
                    <button
                      type="button"
                      onclick="toggleCardMetrics('${itemKey}')"
                      class="w-8 h-8 rounded-[8px] border ${
                        isMetricsOpen
                          ? 'border-[#282E38] bg-[#282E38] text-white shadow-xs'
                          : 'border-[#B8AEA2] bg-[#F3ECE4] text-ds-textMain hover:bg-[#282E38] hover:border-[#282E38] hover:text-white'
                      } inline-flex items-center justify-center transition shrink-0"
                      aria-label="Ver métricas detalhadas"
                    >
                      <i class="uil uil-chart-bar text-base"></i>
                    </button>
                    ${radMetricsPopoverHtml}
                  </div>
                </div>
              </div>
            `}
          </div>
          ${radMetricsDrawerHtml}
        </div>
      `;
    }).join('');

    contentHtml = `
      <div class="${mobile ? '' : 'bg-ds-surface rounded-2xl border border-ds-borderStrong overflow-hidden'}">
        <div class="${mobile ? 'pb-2.5 mb-2.5 border-b border-ds-border flex items-center justify-between gap-2' : 'px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-b border-ds-border flex items-center justify-between gap-2'}">
          <div class="flex items-center gap-1.5 min-w-0">
            <h3 class="font-display font-bold text-ds-textMain text-xs sm:text-base whitespace-nowrap">
              Rádio (${filteredRadio.length})
            </h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 whitespace-nowrap">
              ${mobile ? 'À parte' : 'Faturado à parte'}
            </span>
          </div>
          <span class="text-xs font-normal text-ds-textSecondary whitespace-nowrap">${mobile ? `<strong class="font-bold text-ds-textMain">${fmtBRL(m.financials.radioNet)}</strong>` : `Subtotal: <strong class="font-bold text-ds-textMain">${fmtBRL(m.financials.radioNet)}</strong>`}</span>
        </div>

        ${selectedRadio.length > 0 ? `
          <div class="${mobile ? 'px-3 py-2 mb-2.5 rounded-xl border border-primary/30' : 'px-3 sm:px-4 py-2.5 border-b border-primary/30'} bg-[#FFF4ED] flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-display font-bold text-ds-textMain">${selectedRadio.length} ${selectedRadio.length > 1 ? 'selecionados' : 'selecionado'} (${fmtBRL(selectedRadioSubtotal)})</span>
              ${selectedRadio.length < filteredRadio.length ? `
                <button type="button" onclick="selectAllVisibleChannelItems('radio')" class="text-[11px] font-semibold text-primary hover:underline ml-1">Selecionar todos (${filteredRadio.length})</button>
              ` : `
                <button type="button" onclick="clearBulkSelection()" class="text-[11px] font-semibold text-ds-textSecondary hover:text-ds-textMain underline ml-1">Desmarcar todos</button>
              `}
            </div>
            <button type="button" onclick="confirmBulkRemoveSelectedItems()" class="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition">
              <i class="uil uil-trash-alt text-sm"></i>
              <span>Excluir selecionados da proposta</span>
            </button>
          </div>
        ` : ''}

        <div id="mediaPlanScrollBox" class="${mobile ? 'space-y-2.5' : `p-3.5 space-y-3 ${scrollMaxHeightClass} overflow-y-auto bounded-scroll`}">
          ${radioCardsHtml || `<div class="p-6 text-center text-xs text-ds-textSecondary">Nenhuma praça de rádio encontrada para os filtros selecionados.</div>`}
        </div>
      </div>
    `;
  }

  contentHtml += `
    <div class="mt-2.5 px-2 flex items-start sm:items-center gap-1.5 text-[11px] sm:text-xs text-ds-textSecondary leading-snug">
      <i class="uil uil-info-circle text-xs sm:text-sm text-ds-textMuted shrink-0 mt-0.5 sm:mt-0"></i>
      <span>Os planos de mídia podem sofrer alteração de valores e/ou disponibilidade de pontos sem aviso prévio.</span>
    </div>
  `;

  document.getElementById('mediaPlanListColumn').innerHTML = contentHtml;

  // Se estiver no modo Mapa Inline no mobile, inicializa/atualiza o Leaflet inline imediatamente
  if (mobile && state.channelFilter === 'ooh' && state.mobileOohView === 'map') {
    setTimeout(() => updateMobileInlineMap(m), 40);
  }

  // Restaura o scroll exato do container ao expandir/recolher condomínio ou voltar do mapa inline
  if (preserveScroll) {
    const newScrollBox = document.getElementById('mediaPlanScrollBox');
    if (newScrollBox) {
      newScrollBox.scrollTop = prevScrollTop || state.mobileOohSavedScrollTop || 0;
    }
  }
  syncOohMapCardHeight();
  syncMobileHoverElimination();
}

/**
 * ============================================================================
 * 5. ABA ESPECIFICAÇÕES DE ARTE — VITRINE VISUAL DE FORMATOS (GRADE / LISTA + MODAL)
 * - Cards visuais com mockups de Display (Billboard, Maxiboard, Retângulo Médio, etc.)
 *   e telas/totens OOH com réguas de Largura e Altura (DimensionIndicator).
 * - Filtros por Busca, Ambiente de exibição, Formato, Tipo de mídia e Categoria.
 * - Alternância Grade / Lista + Seleção de itens para baixar gabaritos em PDF.
 * - Modal de Detalhes Técnicos ("ver detalhes") com Área Segura, Barra de Informações e Gabaritos.
 * ============================================================================
 */
function renderDimensionRulerHorizontal(width, unit) {
  return `
    <div class="pointer-events-none absolute -top-[34px] left-0 right-0 flex flex-col items-center select-none">
      <div class="flex flex-col items-center leading-[1.05] text-[10px] font-semibold text-ds-textSecondary mb-1">
        <span>largura</span>
        <span class="font-bold text-ds-textMain">${width} ${unit}</span>
      </div>
      <div class="relative w-full h-[7px] flex items-center">
        <div class="w-full h-[1px] bg-[#94A3B8]"></div>
        <div class="absolute left-0 top-0 bottom-0 w-[1px] bg-[#94A3B8]"></div>
        <div class="absolute right-0 top-0 bottom-0 w-[1px] bg-[#94A3B8]"></div>
      </div>
    </div>
  `;
}

function renderDimensionRulerVertical(height, unit) {
  return `
    <div class="pointer-events-none absolute -right-[52px] top-0 bottom-0 flex items-center select-none">
      <div class="relative h-full w-[7px] flex justify-center mr-1.5">
        <div class="h-full w-[1px] bg-[#94A3B8]"></div>
        <div class="absolute top-0 left-0 right-0 h-[1px] bg-[#94A3B8]"></div>
        <div class="absolute bottom-0 left-0 right-0 h-[1px] bg-[#94A3B8]"></div>
      </div>
      <div class="flex flex-col items-start leading-[1.08] text-[10px] font-semibold text-ds-textSecondary whitespace-nowrap">
        <span>altura</span>
        <span class="font-bold text-ds-textMain">${height} ${unit}</span>
      </div>
    </div>
  `;
}

function ensureValidArtFilterState(m) {
  const all = m.artFormats || [];
  const hasOoh = all.some((f) => f.category === 'ooh');
  const hasDigital = all.some((f) => f.category === 'digital');

  if (state.artCategory !== 'ooh' && state.artCategory !== 'digital') {
    state.artCategory = hasOoh ? 'ooh' : 'digital';
  }
  if (state.artCategory === 'ooh' && !hasOoh && hasDigital) {
    state.artCategory = 'digital';
  } else if (state.artCategory === 'digital' && !hasDigital && hasOoh) {
    state.artCategory = 'ooh';
  }

  const catFormats = all.filter((f) => f.category === state.artCategory);

  // Valida se o ambiente/subcategoria atual pertence à categoria principal selecionada
  if (state.artAmbiente !== 'all') {
    const ambValid = catFormats.some((f) => (f.ambientes || []).includes(state.artAmbiente));
    if (!ambValid) state.artAmbiente = 'all';
  }

  // Valida se o tamanho (formato) atual pertence ao escopo (categoria + ambiente)
  if (state.artFormatDim !== 'all') {
    const dimValid = catFormats.some(
      (f) =>
        f.id === state.artFormatDim &&
        (state.artAmbiente === 'all' || (f.ambientes || []).includes(state.artAmbiente))
    );
    if (!dimValid) state.artFormatDim = 'all';
  }

  // Valida se o tipo de exibição atual pertence ao escopo (categoria + ambiente + tamanho)
  if (state.artMediaType !== 'all') {
    const typeValid = catFormats.some(
      (f) =>
        f.mediaType === state.artMediaType &&
        (state.artAmbiente === 'all' || (f.ambientes || []).includes(state.artAmbiente)) &&
        (state.artFormatDim === 'all' || f.id === state.artFormatDim)
    );
    if (!typeValid) state.artMediaType = 'all';
  }
}

function getFilteredArtFormats(m) {
  ensureValidArtFilterState(m);
  const all = m.artFormats || [];
  const q = String(state.artSearch || '').trim().toLowerCase();

  return all.filter((fmt) => {
    if (fmt.category !== state.artCategory) {
      return false;
    }
    if (state.artAmbiente !== 'all' && !fmt.ambientes.includes(state.artAmbiente)) {
      return false;
    }
    if (state.artFormatDim !== 'all' && fmt.id !== state.artFormatDim) {
      return false;
    }
    if (state.artMediaType !== 'all' && fmt.mediaType !== state.artMediaType) {
      return false;
    }
    if (q) {
      const hay = [
        fmt.title,
        fmt.badgeLabel,
        fmt.mediaTypeLabel || '',
        fmt.mediaType === 'static' ? 'estático impresso' : 'digital vídeo display',
        fmt.rawDimensions,
        fmt.dimensionsLabel,
        `${fmt.width}x${fmt.height}`,
        `${fmt.width}×${fmt.height}`,
        fmt.unit || '',
        fmt.extensions || '',
        fmt.videoExtensions || '',
        ...(fmt.ambientes || [])
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function getVisibleFormatAmbienteTitle(fmt) {
  if (state.artAmbiente !== 'all' && fmt.ambientes.includes(state.artAmbiente)) {
    return state.artAmbiente;
  }
  return fmt.title;
}

function getArtFormatFallbackSvg(fmt) {
  const w = Number(fmt.width) || 1080;
  const h = Number(fmt.height) || 1920;
  const isHorizontal = w >= h;
  const rectW = isHorizontal ? 120 : Math.max(46, Math.round((w / h) * 96));
  const rectH = isHorizontal ? Math.max(38, Math.round((h / w) * 120)) : 96;
  const rx = Math.round((160 - rectW) / 2);
  const ry = Math.round((120 - rectH) / 2);
  const dimText = `${w}x${h} ${fmt.unit || 'px'}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" viewBox="0 0 160 120"><rect width="160" height="120" rx="8" fill="#F8FAFC"/><rect x="${rx}" y="${ry}" width="${rectW}" height="${rectH}" rx="4" fill="#FFF3ED" stroke="#F15A22" stroke-width="2"/><text x="80" y="64" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#C84312">${dimText}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function renderArtTab(m) {
  const mobile = isMobileView();
  const allFormats = m.artFormats || [];
  const filtered = getFilteredArtFormats(m);
  const selectedSet = new Set(state.artSelectedIds || []);
  const selectedCount = selectedSet.size;
  const allFilteredSelected = filtered.length > 0 && filtered.every((f) => selectedSet.has(f.id));

  // Contagem por Região de Categoria Macro (1º filtro que determina todo o resto)
  const oohFormatsAll = allFormats.filter((f) => f.category === 'ooh');
  const digitalFormatsAll = allFormats.filter((f) => f.category === 'digital');
  const categoryFormats = allFormats.filter((f) => f.category === state.artCategory);

  // Opções dependentes (Cascading Filters) estritamente subordinadas à categoria principal ativa:
  // 1) Subcategorias / Ambientes válidos para (artCategory + artMediaType + artFormatDim)
  const ambientesSet = new Set();
  categoryFormats
    .filter(
      (f) =>
        (state.artMediaType === 'all' || f.mediaType === state.artMediaType) &&
        (state.artFormatDim === 'all' || f.id === state.artFormatDim)
    )
    .forEach((f) => (f.ambientes || []).forEach((a) => ambientesSet.add(a)));
  const availableAmbientes = Array.from(ambientesSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  // 2) Tamanhos (Formatos) válidos para (artCategory + artAmbiente + artMediaType)
  const availableFormatsForDim = categoryFormats.filter(
    (f) =>
      (state.artAmbiente === 'all' || (f.ambientes || []).includes(state.artAmbiente)) &&
      (state.artMediaType === 'all' || f.mediaType === state.artMediaType)
  );

  // 3) Tipos de exibição válidos para (artCategory + artAmbiente + artFormatDim)
  const mediaTypesSet = new Set();
  categoryFormats
    .filter(
      (f) =>
        (state.artAmbiente === 'all' || (f.ambientes || []).includes(state.artAmbiente)) &&
        (state.artFormatDim === 'all' || f.id === state.artFormatDim)
    )
    .forEach((f) => mediaTypesSet.add(f.mediaType));
  const availableMediaTypes = [
    { value: 'digital', label: 'Digital' },
    { value: 'static', label: 'Estático' }
  ].filter((t) => mediaTypesSet.has(t.value));

  const activeArtSecondaryCount =
    (state.artAmbiente !== 'all' ? 1 : 0) +
    (state.artFormatDim !== 'all' ? 1 : 0) +
    (state.artMediaType !== 'all' ? 1 : 0);

  const hasSecondaryArtFilters =
    activeArtSecondaryCount > 0 ||
    Boolean(state.artSearch.trim());

  const artSearchPlaceholder =
    state.artCategory === 'ooh'
      ? (mobile
          ? 'Buscar formato, dimensão ou ambiente...'
          : 'Buscar formato, dimensão ou ambiente (ex: 1080x1920, Elevadores, Banca)...')
      : (mobile
          ? 'Buscar formato digital ou veículo...'
          : 'Buscar formato digital, dimensão ou veículo (ex: 300x250, Billboard, Globoplay)...');

  // Sugestão cruzada entre canais de Arte (OOH <-> Digital) quando o usuário pesquisa algo
  let crossArtCategoryBannerHtml = '';
  const qArt = String(state.artSearch || '').trim().toLowerCase();
  if (qArt.length >= 2) {
    const otherCatKey = state.artCategory === 'ooh' ? 'digital' : 'ooh';
    const otherCatLabel = otherCatKey === 'ooh' ? 'OOH' : 'Digital';
    const otherCatMatches = allFormats.filter((fmt) => {
      if (fmt.category !== otherCatKey) return false;
      const hay = [
        fmt.title,
        fmt.badgeLabel,
        fmt.mediaTypeLabel || '',
        fmt.mediaType === 'static' ? 'estático impresso' : 'digital vídeo display',
        fmt.rawDimensions,
        fmt.dimensionsLabel,
        `${fmt.width}x${fmt.height}`,
        `${fmt.width}×${fmt.height}`,
        fmt.unit || '',
        fmt.extensions || '',
        fmt.videoExtensions || '',
        ...(fmt.ambientes || [])
      ].join(' ').toLowerCase();
      return hay.includes(qArt);
    });

    if (otherCatMatches.length > 0) {
      crossArtCategoryBannerHtml = `
        <div class="mt-2.5 px-3.5 py-2 rounded-xl bg-primary-light/70 border border-primary/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span class="text-ds-textMain font-medium flex items-center gap-1.5">
            <i class="uil uil-search-plus text-primary text-sm"></i>
            <span>Também encontramos <strong>"${state.artSearch}"</strong> em:</span>
          </span>
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" onclick="switchArtCategoryPreservingSearch('${otherCatKey}')" class="px-2.5 py-1 rounded-full bg-white hover:bg-primary hover:text-white text-primary border border-primary/40 font-bold text-[11px] transition">
              ${otherCatLabel} (${otherCatMatches.length}) →
            </button>
          </div>
        </div>
      `;
    }
  }

  const selectedDimFormatObj =
    state.artFormatDim !== 'all'
      ? categoryFormats.find((f) => f.id === state.artFormatDim)
      : null;
  const selectedDimChipLabel = selectedDimFormatObj
    ? `${selectedDimFormatObj.width}x${selectedDimFormatObj.height} ${selectedDimFormatObj.unit}`
    : state.artFormatDim;
  const selectedMediaTypeObj =
    state.artMediaType !== 'all'
      ? availableMediaTypes.find((t) => t.value === state.artMediaType)
      : null;
  const selectedMediaTypeChipLabel = selectedMediaTypeObj
    ? selectedMediaTypeObj.label
    : (state.artMediaType === 'static' ? 'Estático' : 'Digital');

  // 1. Bloco Locução para Rádio (quando há Rádio na proposta)
  const radioBlockHtml = m.counts.radioCount > 0 ? `
    <div class="bg-white rounded-2xl border border-ds-borderStrong ${mobile ? 'p-3.5 mb-3.5' : 'p-6 mb-5'} shadow-card">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 class="font-display font-bold ${mobile ? 'text-sm' : 'text-lg'} text-ds-textMain">Locução para Rádio</h3>
          <p class="text-xs text-ds-textSecondary">Formatos aceitos para veiculação nas ${m.counts.radioCount} emissoras da sua proposta.</p>
        </div>
        <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] whitespace-nowrap">
          SPOT 30S
        </span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 sim-grid-1 gap-3">
        <div class="rounded-xl border border-ds-border bg-ds-surface/60 p-3.5 flex flex-col justify-between gap-2.5">
          <div>
            <div class="flex items-center gap-2 font-display font-bold text-sm text-ds-textMain mb-1">
              <i class="uil uil-microphone text-primary text-base"></i>
              <span>Locutor da rádio</span>
            </div>
            <p class="text-xs text-ds-textSecondary leading-relaxed">
              Envie o texto que você quer anunciar e um locutor oficial da rádio grava seu anúncio com qualidade profissional, sem nenhum custo adicional.
            </p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#F3ECE4] text-[#56514B]">
              ATÉ 30S
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#F3ECE4] text-[#56514B]">
              65 A 75 PALAVRAS
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#F3ECE4] text-[#56514B]">
              TOM NATURAL
            </span>
          </div>
        </div>
        <div class="rounded-xl border border-ds-border bg-ds-surface/60 p-3.5 flex flex-col justify-between gap-2.5">
          <div>
            <div class="flex items-center gap-2 font-display font-bold text-sm text-ds-textMain mb-1">
              <i class="uil uil-Subway text-primary text-base"></i>
              <span>Áudio próprio</span>
            </div>
            <p class="text-xs text-ds-textSecondary leading-relaxed">
              Já tem o áudio pronto? Envie o arquivo direto, sem passar pela locução da rádio. Recomendamos uma gravação profissional para manter a qualidade do anúncio.
            </p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#F3ECE4] text-[#56514B]">
              ATÉ 30S
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#F3ECE4] text-[#56514B]">
              MP3
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider bg-[#F3ECE4] text-[#56514B]">
              320 KBPS
            </span>
          </div>
        </div>
      </div>
    </div>
  ` : '';

  // 2. Cards Visuais no modo Grade (1 coluna no mobile, 3 colunas no desktop)
  const renderGridCardsHtml = () => {
    if (filtered.length === 0) {
      return `
        <div class="py-10 px-4 text-center rounded-xl border border-dashed border-ds-borderStrong bg-ds-surface/50">
          <i class="uil uil-search text-2xl text-ds-textMuted mb-1 block"></i>
          <p class="font-display font-bold text-sm text-ds-textMain">Nenhum formato encontrado para os filtros selecionados</p>
          <button type="button" onclick="resetArtFilters()" class="mt-2 inline-flex items-center gap-1 text-xs font-display font-bold text-primary hover:underline">
            Limpar filtros de arte
          </button>
        </div>
      `;
    }

    return `
      <div id="artFormatsScrollBox" class="${mobile ? 'max-h-[500px]' : 'max-h-[840px]'} overflow-y-auto bounded-scroll pr-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sim-grid-1 gap-3.5">
          ${filtered.map((fmt) => {
            const isSelected = selectedSet.has(fmt.id);
            const visibleTitle = getVisibleFormatAmbienteTitle(fmt);
            // Tag de topo no mesmo padrão visual do Plano de Mídia (sem ícones redundantes)
            const badgeText = fmt.isGlobo
              ? fmt.badgeLabel
              : (fmt.isStatic ? 'IMPRESSO' : 'DIGITAL');
            const formatTagClass = fmt.isStatic
              ? 'bg-[#F3E8FF] text-[#6D28D9] border border-[#DDD6FE]'
              : 'bg-[#EBF3FE] text-[#1D4ED8] border border-[#BFDBFE]';
            const fallbackSvg = getArtFormatFallbackSvg(fmt);

            return `
              <div onclick="openArtFormatModal('${fmt.id}')" class="group rounded-xl border p-3.5 flex flex-col justify-between transition-all cursor-pointer ${isSelected ? 'border-primary bg-[#FFF9F5] shadow-sm' : 'border-[#E2E5E9] bg-white hover:border-ds-borderStrong hover:shadow-card'}">
                <!-- Topo do Card: Tag de Canal/Mídia à esquerda + Checkbox à direita -->
                <div class="flex items-start justify-between gap-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider ${formatTagClass}">
                    ${badgeText}
                  </span>
                  <button
                    type="button"
                    onclick="event.stopPropagation(); toggleArtSelectFormat('${fmt.id}')"
                    aria-label="Selecionar formato ${visibleTitle}"
                    class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'}"
                  >
                    <i class="uil uil-check text-[11px] leading-none"></i>
                  </button>
                </div>

                <!-- Centro do Card: Mockup Visual Sempre Visível (Display Globo ou OOH com Réguas) -->
                ${fmt.isGlobo ? `
                  <div class="my-3 h-[160px] sm:h-[180px] p-2 flex items-center justify-center rounded-xl overflow-hidden bg-[#F8FAFC] border border-ds-border/70">
                    <img
                      src="${fmt.previewUrl}"
                      onerror="this.onerror=null;this.src='${fallbackSvg}'"
                      alt="${visibleTitle}"
                      loading="lazy"
                      class="block max-h-full max-w-full w-auto h-auto object-contain rounded"
                    />
                  </div>
                ` : `
                  <div class="my-3 flex ${mobile ? 'h-[165px]' : 'h-[185px]'} w-full items-center justify-center rounded-xl bg-[#F8FAFC] border border-ds-border/70 pr-[52px] pt-[32px] pb-2 pl-3">
                    <div class="relative inline-flex items-center justify-center">
                      <img
                        src="${fmt.previewUrl}"
                        onerror="this.onerror=null;this.src='${fallbackSvg}'"
                        alt="${visibleTitle}"
                        loading="lazy"
                        class="block ${mobile ? 'max-h-[110px] max-w-[160px]' : 'max-h-[135px] max-w-[195px]'} w-auto object-contain rounded-[2px]"
                      />
                      ${renderDimensionRulerHorizontal(fmt.width, fmt.unit)}
                      ${renderDimensionRulerVertical(fmt.height, fmt.unit)}
                    </div>
                  </div>
                `}

                <!-- Rodapé do Card: Título em 100% da largura + Linha inferior com Dimensões e Botão "Ver detalhes" (Padrão Ver no mapa) -->
                <div class="pt-2.5 border-t border-ds-border/60 space-y-1.5">
                  <div class="font-display font-bold text-sm sm:text-[15px] text-ds-textMain leading-snug">
                    ${visibleTitle}
                  </div>
                  <div class="flex items-center justify-between gap-2">
                    <div class="text-xs font-normal text-ds-textSecondary whitespace-nowrap">
                      (L) ${fmt.width} × (A) ${fmt.height} ${fmt.unit}
                    </div>
                    <button
                      type="button"
                      onclick="event.stopPropagation(); openArtFormatModal('${fmt.id}')"
                      class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1 transition whitespace-nowrap shrink-0"
                    >
                      <span>Ver detalhes</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  // 3. Modo Lista (TechSpecsListView) — Sem tags redundantes (Imagem 4), sem truncamento e com Miniatura Visível!
  const renderListRowsHtml = () => {
    if (filtered.length === 0) {
      return renderGridCardsHtml();
    }
    return `
      <div id="artFormatsScrollBox" class="${mobile ? 'max-h-[500px]' : 'max-h-[840px]'} overflow-y-auto bounded-scroll space-y-2.5 pr-1">
        ${filtered.map((fmt) => {
          const isSelected = selectedSet.has(fmt.id);
          const isExpanded = !!state.artExpandedListIds[fmt.id];
          const visibleTitle = getVisibleFormatAmbienteTitle(fmt);
          const fallbackSvg = getArtFormatFallbackSvg(fmt);

          return `
            <div class="rounded-xl border transition-all ${isSelected ? 'border-primary bg-[#FFF9F5]' : 'border-[#E2E5E9] bg-white'} overflow-hidden">
              <div
                onclick="toggleArtListExpand('${fmt.id}')"
                class="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-ds-surface/60 transition"
              >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <!-- Checkbox -->
                  <button
                    type="button"
                    onclick="event.stopPropagation(); toggleArtSelectFormat('${fmt.id}')"
                    class="w-4 h-4 rounded flex items-center justify-center border transition shrink-0 ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-ds-borderStrong text-transparent hover:border-primary'}"
                  >
                    <i class="uil uil-check text-[11px] leading-none"></i>
                  </button>

                  <!-- Miniatura Visual Sempre Visível na Lista -->
                  <div class="w-14 h-12 sm:w-16 sm:h-14 rounded-lg bg-[#F8FAFC] border border-ds-border p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src="${fmt.previewUrl}"
                      onerror="this.onerror=null;this.src='${fallbackSvg}'"
                      alt="${visibleTitle}"
                      loading="lazy"
                      class="max-h-full max-w-full w-auto h-auto object-contain rounded-[2px]"
                    />
                  </div>

                  <!-- Título e Dimensão Limpos (Sem Tag Redundante e Sem Truncar!) -->
                  <div class="min-w-0 flex-1">
                    <div class="font-display font-bold text-xs sm:text-sm text-ds-textMain leading-snug">
                      ${visibleTitle}
                    </div>
                    <div class="text-[11px] sm:text-xs font-normal text-ds-textSecondary mt-0.5 whitespace-nowrap">
                      (L) ${fmt.width} × (A) ${fmt.height} (${fmt.unit})
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  ${!mobile ? `
                    <button
                      type="button"
                      onclick="event.stopPropagation(); openArtFormatModal('${fmt.id}')"
                      class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1 transition whitespace-nowrap"
                    >
                      <span>Ver detalhes</span>
                    </button>
                  ` : ''}
                  <i class="uil ${isExpanded ? 'uil-angle-up' : 'uil-angle-down'} text-xl text-ds-textSecondary"></i>
                </div>
              </div>

              ${isExpanded ? `
                <div class="px-3.5 pb-3.5 pt-2.5 border-t border-ds-border grid grid-cols-1 md:grid-cols-12 sim-grid-1 gap-3 items-center bg-ds-surface/30">
                  <div class="md:col-span-5 flex items-center justify-center p-3 bg-white rounded-xl border border-ds-border">
                    ${fmt.isGlobo ? `
                      <img src="${fmt.modalPreviewUrl}" onerror="this.onerror=null;this.src='${fallbackSvg}'" alt="${visibleTitle}" class="max-h-[150px] w-auto object-contain rounded" />
                    ` : `
                      <div class="py-5 pr-12 flex items-center justify-center">
                        <div class="relative inline-flex items-center justify-center">
                          <img src="${fmt.previewUrl}" onerror="this.onerror=null;this.src='${fallbackSvg}'" alt="${visibleTitle}" class="max-h-[120px] w-auto object-contain" />
                          ${renderDimensionRulerHorizontal(fmt.width, fmt.unit)}
                          ${renderDimensionRulerVertical(fmt.height, fmt.unit)}
                        </div>
                      </div>
                    `}
                  </div>
                  <div class="md:col-span-7 space-y-2 text-xs">
                    <div class="grid grid-cols-2 sim-grid-2 gap-2">
                      <div class="p-2 rounded-lg bg-white border border-ds-border">
                        <span class="text-[10px] text-ds-textSecondary block">Dimensão total</span>
                        <strong class="font-display text-ds-textMain">${fmt.width} × ${fmt.height} ${fmt.unit}</strong>
                      </div>
                      ${fmt.availableWidth ? `
                        <div class="p-2 rounded-lg bg-white border border-ds-border">
                          <span class="text-[10px] text-ds-textSecondary block">Área segura</span>
                          <strong class="font-display text-ds-textMain">${fmt.availableWidth} × ${fmt.availableHeight} ${fmt.unit}</strong>
                        </div>
                      ` : ''}
                      <div class="p-2 rounded-lg bg-white border border-ds-border">
                        <span class="text-[10px] text-ds-textSecondary block">Formatos aceitos</span>
                        <strong class="font-display text-ds-textMain">${fmt.types.includes('video') ? `${fmt.extensions}, ${fmt.videoExtensions}` : fmt.extensions}</strong>
                      </div>
                      <div class="p-2 rounded-lg bg-white border border-ds-border">
                        <span class="text-[10px] text-ds-textSecondary block">Tamanho máximo</span>
                        <strong class="font-display text-ds-textMain">${fmt.isStatic ? fmt.maxWeightPdf : fmt.maxWeightImage}</strong>
                      </div>
                    </div>
                    <div class="flex items-center justify-between sm:justify-end gap-2 pt-1">
                      ${mobile ? `
                        <button
                          type="button"
                          onclick="openArtFormatModal('${fmt.id}')"
                          class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1 transition whitespace-nowrap"
                        >
                          <span>Ver detalhes</span>
                        </button>
                      ` : ''}
                      <button
                        type="button"
                        onclick="downloadSingleArtGabarito('${fmt.id}')"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary-light text-primary font-display font-bold text-xs hover:bg-primary hover:text-white transition"
                      >
                        <i class="uil uil-import"></i> Baixar gabarito (.PDF)
                      </button>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  document.getElementById('tabContent-arte').innerHTML = `
    ${radioBlockHtml}

    <div class="${mobile ? '' : 'bg-white rounded-2xl border border-ds-borderStrong p-6 shadow-card'}">
      <!-- Cabeçalho da Seção Arte -->
      <div class="mb-3.5">
        <h2 class="font-display font-bold ${mobile ? 'text-base' : 'text-xl'} text-ds-textMain">Arte</h2>
        <p class="text-xs text-ds-textSecondary mt-0.5">
          Aqui você encontra os formatos e especificações para criar sua arte do anúncio.
        </p>
      </div>

      <!-- Barra de Busca + Canal + Filtros Secundários (Mesma lógica e arquitetura da página principal Plano de Mídia) -->
      ${mobile ? `
        <!-- Mecânica Mobile Aqui Ads: Card limpo com Busca no topo + [Canal (Select)] + [🎚️ filtrar] + Switcher Grade/Lista -->
        <div class="rounded-2xl border border-ds-borderStrong bg-white p-3 shadow-xs space-y-2.5 mb-3">
          <!-- Linha 1 do Card Mobile: Busca limpa -->
          <div class="relative flex items-center border-b border-ds-border pb-2">
            <i class="uil uil-search text-ds-textSecondary text-base mr-2 shrink-0"></i>
            <input
              id="artSearchInput"
              type="text"
              value="${state.artSearch.replace(/"/g, '&quot;')}"
              oninput="handleArtSearchInput(this.value)"
              placeholder="${artSearchPlaceholder}"
              class="w-full pr-7 py-0.5 bg-transparent text-xs text-ds-textMain placeholder:text-ds-textMuted focus:outline-none"
            />
            ${state.artSearch ? `
              <button
                type="button"
                onclick="handleArtSearchInput('')"
                class="text-ds-textSecondary hover:text-ds-textMain text-base leading-none shrink-0"
                title="Limpar busca"
              >
                <i class="uil uil-backspace"></i>
              </button>
            ` : ''}
          </div>

          <!-- Linha 2 do Card Mobile: Select Principal (Canal) + Botão "🎚️ filtrar" + Switcher Grid/Lista com alvos de toque amplos -->
          <div class="flex items-center gap-2">
            <div class="flex-1 min-w-0">
              <select
                onchange="setArtFilter('artCategory', this.value)"
                aria-label="Selecionar canal de mídia"
                class="w-full h-10 px-3 rounded-xl border border-ds-borderStrong bg-white font-normal text-ds-textMain text-xs focus:outline-none focus:border-primary transition cursor-pointer"
              >
                <option value="" disabled>── Canal de mídia ──</option>
                ${oohFormatsAll.length > 0 ? `<option value="ooh" ${state.artCategory === 'ooh' ? 'selected' : ''}>OOH (\u2060${oohFormatsAll.length}\u2060)</option>` : ''}
                ${digitalFormatsAll.length > 0 ? `<option value="digital" ${state.artCategory === 'digital' ? 'selected' : ''}>Digital (\u2060${digitalFormatsAll.length}\u2060)</option>` : ''}
              </select>
            </div>

            <button
              type="button"
              onclick="toggleMobileArtFiltersDrawer()"
              class="shrink-0 h-10 inline-flex items-center gap-1.5 px-3.5 rounded-xl border ${
                state.mobileArtFiltersOpen || activeArtSecondaryCount > 0
                  ? 'border-ds-textMain bg-ds-surface text-ds-textMain font-normal'
                  : 'border-ds-borderStrong bg-ds-surface/60 hover:bg-ds-surface text-ds-textMain font-normal'
              } text-xs transition"
              aria-expanded="${state.mobileArtFiltersOpen ? 'true' : 'false'}"
            >
              <i class="uil uil-sliders-v-alt text-base leading-none"></i>
              <span>filtrar</span>
              ${activeArtSecondaryCount > 0 ? `
                <span class="ml-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold inline-flex items-center justify-center leading-none">
                  ${activeArtSecondaryCount}
                </span>
              ` : ''}
            </button>

            <div class="inline-flex items-center h-10 rounded-xl border border-ds-borderStrong bg-ds-surface/60 p-1 shrink-0">
              <button
                type="button"
                onclick="setArtViewMode('grid')"
                class="w-8 h-8 inline-flex items-center justify-center rounded-lg text-sm font-normal transition ${state.artViewMode === 'grid' ? 'bg-white text-ds-textMain shadow-xs border border-ds-border/80' : 'text-ds-textSecondary hover:text-ds-textMain'}"
                title="Visualização em grade"
                aria-label="Visualização em grade"
              >
                <i class="uil uil-apps"></i>
              </button>
              <button
                type="button"
                onclick="setArtViewMode('list')"
                class="w-8 h-8 inline-flex items-center justify-center rounded-lg text-sm font-normal transition ${state.artViewMode === 'list' ? 'bg-white text-ds-textMain shadow-xs border border-ds-border/80' : 'text-ds-textSecondary hover:text-ds-textMain'}"
                title="Visualização em lista"
                aria-label="Visualização em lista"
              >
                <i class="uil uil-list-ul"></i>
              </button>
            </div>
          </div>

          <!-- Gaveta Colapsável de Filtros Secundários (abre sob demanda ao tocar em "filtrar") -->
          ${state.mobileArtFiltersOpen ? `
            <div class="pt-2.5 border-t border-ds-border space-y-2 animate-fadeIn">
              <div class="flex items-center justify-between text-[11px] text-ds-textSecondary px-0.5">
                <span class="font-normal uppercase tracking-wider text-[10px]">Refinar visualização</span>
                ${hasSecondaryArtFilters ? `
                  <button type="button" onclick="resetArtFilters()" class="font-bold text-rose-700 hover:underline">
                    Limpar filtros
                  </button>
                ` : ''}
              </div>
              <div class="grid grid-cols-2 gap-2">
                <select
                  onchange="setArtFilter('artAmbiente', this.value)"
                  aria-label="Ambiente ou categoria de exibição"
                  class="col-span-2 w-full px-2.5 py-2 rounded-xl border ${state.artAmbiente !== 'all' ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white text-ds-textMain font-normal'} text-[11px] focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="" disabled>── Categoria / Ambiente ──</option>
                  <option value="all" ${state.artAmbiente === 'all' ? 'selected' : ''}>Ambientes (\u2060${availableAmbientes.length}\u2060)</option>
                  ${availableAmbientes.map((amb) => `<option value="${amb}" ${state.artAmbiente === amb ? 'selected' : ''}>${amb}</option>`).join('')}
                </select>
                <select
                  onchange="setArtFilter('artFormatDim', this.value)"
                  aria-label="Tamanho do formato"
                  class="w-full px-2.5 py-2 rounded-xl border ${state.artFormatDim !== 'all' ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white text-ds-textMain font-normal'} text-[11px] focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="" disabled>── Tamanho (Formato) ──</option>
                  <option value="all" ${state.artFormatDim === 'all' ? 'selected' : ''}>Tamanhos (\u2060${availableFormatsForDim.length}\u2060)</option>
                  ${availableFormatsForDim.map((f) => `<option value="${f.id}" ${state.artFormatDim === f.id ? 'selected' : ''}>${f.width}x${f.height} ${f.unit}</option>`).join('')}
                </select>
                <select
                  onchange="setArtFilter('artMediaType', this.value)"
                  aria-label="Tipo de exibição"
                  class="w-full px-2.5 py-2 rounded-xl border ${state.artMediaType !== 'all' ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white text-ds-textMain font-normal'} text-[11px] focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="" disabled>── Tipo de exibição ──</option>
                  <option value="all" ${state.artMediaType === 'all' ? 'selected' : ''}>Exibição (\u2060${availableMediaTypes.length}\u2060)</option>
                  ${availableMediaTypes.map((t) => `<option value="${t.value}" ${state.artMediaType === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
                </select>
              </div>
            </div>
          ` : activeArtSecondaryCount > 0 ? `
            <div class="pt-2 border-t border-ds-border flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-1.5 flex-wrap">
                ${state.artAmbiente !== 'all' ? `
                  <button type="button" onclick="setArtFilter('artAmbiente', 'all')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-[11px] font-semibold">
                    <span>${state.artAmbiente}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
                ${state.artFormatDim !== 'all' ? `
                  <button type="button" onclick="setArtFilter('artFormatDim', 'all')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-[11px] font-semibold">
                    <span>${selectedDimChipLabel}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
                ${state.artMediaType !== 'all' ? `
                  <button type="button" onclick="setArtFilter('artMediaType', 'all')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-[11px] font-semibold">
                    <span>${selectedMediaTypeChipLabel}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
              </div>
              <button type="button" onclick="resetArtFilters()" class="text-[11px] font-bold text-rose-700 hover:underline">
                Limpar
              </button>
            </div>
          ` : ''}

          ${crossArtCategoryBannerHtml}
        </div>
      ` : `
        <div class="pb-1 space-y-2.5">
          <!-- Linha Principal Desktop: Busca ampla + Canal (Select) + Botão "🎚️ filtrar" + Switcher Grade/Lista -->
          <div class="flex items-center gap-2.5">
            <div class="flex-1 min-w-0 relative">
              <input
                id="artSearchInput"
                type="text"
                value="${state.artSearch.replace(/"/g, '&quot;')}"
                oninput="handleArtSearchInput(this.value)"
                placeholder="${artSearchPlaceholder}"
                class="w-full h-10 pl-4 pr-10 rounded-xl border border-ds-borderStrong bg-white text-xs sm:text-sm text-ds-textMain placeholder:text-ds-textMuted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
              />
              ${state.artSearch ? `
                <button type="button" onclick="handleArtSearchInput('')" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-ds-textMuted hover:text-ds-textMain text-sm" title="Limpar busca">
                  <i class="uil uil-times"></i>
                </button>
              ` : `
                <i class="uil uil-search absolute right-3.5 top-1/2 -translate-y-1/2 text-ds-textSecondary text-sm pointer-events-none"></i>
              `}
            </div>

            <div class="w-[195px] sm:w-[220px] shrink-0 relative">
              <select
                onchange="setArtFilter('artCategory', this.value)"
                aria-label="Selecionar canal de mídia"
                title="Selecionar canal de mídia"
                class="w-full h-10 px-3 rounded-xl border border-ds-borderStrong bg-white font-normal text-ds-textMain text-xs sm:text-sm focus:outline-none focus:border-primary transition cursor-pointer"
              >
                <option value="" disabled>── Canal de mídia ──</option>
                ${oohFormatsAll.length > 0 ? `<option value="ooh" ${state.artCategory === 'ooh' ? 'selected' : ''}>Canal: OOH (\u2060${oohFormatsAll.length}\u2060)</option>` : ''}
                ${digitalFormatsAll.length > 0 ? `<option value="digital" ${state.artCategory === 'digital' ? 'selected' : ''}>Canal: Digital (\u2060${digitalFormatsAll.length}\u2060)</option>` : ''}
              </select>
            </div>

            <button
              type="button"
              onclick="toggleMobileArtFiltersDrawer()"
              class="shrink-0 h-10 inline-flex items-center gap-1.5 px-4 rounded-xl border ${
                state.mobileArtFiltersOpen || activeArtSecondaryCount > 0
                  ? 'border-ds-textMain bg-ds-surface text-ds-textMain font-normal'
                  : 'border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textMain font-normal'
              } text-xs sm:text-sm transition cursor-pointer"
              aria-expanded="${state.mobileArtFiltersOpen ? 'true' : 'false'}"
              title="Abrir filtros secundários"
            >
              <i class="uil uil-sliders-v-alt text-base leading-none"></i>
              <span>filtrar</span>
              ${activeArtSecondaryCount > 0 ? `
                <span class="ml-0.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold inline-flex items-center justify-center leading-none">
                  ${activeArtSecondaryCount}
                </span>
              ` : ''}
            </button>

            <div class="inline-flex items-center h-10 rounded-xl border border-ds-borderStrong bg-ds-surface p-1 shrink-0">
              <button
                type="button"
                onclick="setArtViewMode('grid')"
                class="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-normal transition ${state.artViewMode === 'grid' ? 'bg-white text-ds-textMain shadow-xs border border-ds-border/80' : 'text-ds-textSecondary hover:text-ds-textMain'}"
              >
                <i class="uil uil-apps"></i>
                <span>grade</span>
              </button>
              <button
                type="button"
                onclick="setArtViewMode('list')"
                class="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-normal transition ${state.artViewMode === 'list' ? 'bg-white text-ds-textMain shadow-xs border border-ds-border/80' : 'text-ds-textSecondary hover:text-ds-textMain'}"
              >
                <i class="uil uil-list-ul"></i>
                <span>lista</span>
              </button>
            </div>
          </div>

          <!-- Gaveta Colapsável de Filtros Secundários no Desktop (abre sob demanda ao clicar em "filtrar") -->
          ${state.mobileArtFiltersOpen ? `
            <div class="p-3 rounded-xl bg-ds-surface/70 border border-ds-border space-y-2 animate-fadeIn">
              <div class="flex items-center justify-between text-xs text-ds-textSecondary px-0.5">
                <span class="font-normal uppercase tracking-wider text-[10px]">Refinar visualização</span>
                ${hasSecondaryArtFilters ? `
                  <button type="button" onclick="resetArtFilters()" class="font-bold text-rose-700 hover:underline text-xs">
                    Limpar filtros
                  </button>
                ` : ''}
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <select
                  onchange="setArtFilter('artAmbiente', this.value)"
                  aria-label="Ambiente ou categoria de exibição"
                  class="w-full h-9 px-3 rounded-xl border ${state.artAmbiente !== 'all' ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white text-ds-textMain font-normal'} text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="" disabled>── Categoria / Ambiente ──</option>
                  <option value="all" ${state.artAmbiente === 'all' ? 'selected' : ''}>Todos os ambientes (\u2060${availableAmbientes.length}\u2060)</option>
                  ${availableAmbientes.map((amb) => `<option value="${amb}" ${state.artAmbiente === amb ? 'selected' : ''}>${amb}</option>`).join('')}
                </select>

                <select
                  onchange="setArtFilter('artFormatDim', this.value)"
                  aria-label="Tamanho do formato"
                  class="w-full h-9 px-3 rounded-xl border ${state.artFormatDim !== 'all' ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white text-ds-textMain font-normal'} text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="" disabled>── Tamanho (Formato) ──</option>
                  <option value="all" ${state.artFormatDim === 'all' ? 'selected' : ''}>Todos os tamanhos (\u2060${availableFormatsForDim.length}\u2060)</option>
                  ${availableFormatsForDim.map((f) => `<option value="${f.id}" ${state.artFormatDim === f.id ? 'selected' : ''}>${f.width}x${f.height} ${f.unit}</option>`).join('')}
                </select>

                <select
                  onchange="setArtFilter('artMediaType', this.value)"
                  aria-label="Tipo de exibição"
                  class="w-full h-9 px-3 rounded-xl border ${state.artMediaType !== 'all' ? 'border-primary bg-primary-light/20 font-normal text-primary' : 'border-ds-borderStrong bg-white text-ds-textMain font-normal'} text-xs focus:outline-none focus:border-primary transition cursor-pointer"
                >
                  <option value="" disabled>── Tipo de exibição ──</option>
                  <option value="all" ${state.artMediaType === 'all' ? 'selected' : ''}>Todos os tipos (\u2060${availableMediaTypes.length}\u2060)</option>
                  ${availableMediaTypes.map((t) => `<option value="${t.value}" ${state.artMediaType === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
                </select>
              </div>
            </div>
          ` : activeArtSecondaryCount > 0 ? `
            <div class="flex items-center justify-between gap-2 flex-wrap pt-0.5">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[11px] font-semibold text-ds-textSecondary mr-0.5">Filtros ativos:</span>
                ${state.artAmbiente !== 'all' ? `
                  <button type="button" onclick="setArtFilter('artAmbiente', 'all')" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary-light transition">
                    <span>${state.artAmbiente}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
                ${state.artFormatDim !== 'all' ? `
                  <button type="button" onclick="setArtFilter('artFormatDim', 'all')" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary-light transition">
                    <span>${selectedDimChipLabel}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
                ${state.artMediaType !== 'all' ? `
                  <button type="button" onclick="setArtFilter('artMediaType', 'all')" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light/40 border border-primary/30 text-primary text-xs font-semibold hover:bg-primary-light transition">
                    <span>${selectedMediaTypeChipLabel}</span>
                    <i class="uil uil-times text-xs"></i>
                  </button>
                ` : ''}
              </div>
              <button type="button" onclick="resetArtFilters()" class="text-xs font-bold text-rose-700 hover:underline">
                Limpar filtros
              </button>
            </div>
          ` : ''}

          ${crossArtCategoryBannerHtml}
        </div>
      `}

      <!-- Sub-barra de Seleção e Contagem: Limpa, sem elementos redundantes e com botões de toque amplos -->
      <div class="py-3 flex flex-wrap items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <span class="font-display font-bold text-xs sm:text-sm text-ds-textMain">
            ${filtered.length} ${filtered.length === 1 ? 'formato encontrado' : 'formatos encontrados'}
          </span>
          ${selectedCount > 0 ? `
            <span class="px-2.5 py-0.5 rounded-full bg-primary-light text-primary font-display font-bold text-xs">
              ${selectedCount} ${selectedCount === 1 ? 'selecionado' : 'selecionados'}
            </span>
          ` : ''}
        </div>

        <div class="flex flex-wrap items-center gap-2">
          ${selectedCount === 0 ? `
            <button
              type="button"
              onclick="selectAllArtFormats()"
              class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap"
            >
              <span class="w-3.5 h-3.5 rounded-[4px] border border-ds-borderStrong bg-white inline-flex items-center justify-center shrink-0"></span>
              <span>Selecionar todos</span>
            </button>
          ` : `
            ${!allFilteredSelected ? `
              <button
                type="button"
                onclick="selectAllArtFormats()"
                class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap"
              >
                <span class="w-3.5 h-3.5 rounded-[4px] border border-ds-borderStrong bg-white inline-flex items-center justify-center shrink-0"></span>
                <span>Selecionar todos</span>
              </button>
            ` : `
              <button
                type="button"
                onclick="clearArtSelectedFormats()"
                class="h-8 px-2.5 rounded-[8px] border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textSecondary hover:text-ds-textMain font-sans font-medium text-[11px] inline-flex items-center justify-center gap-1 transition whitespace-nowrap"
              >
                <i class="uil uil-times text-xs leading-none"></i>
                <span>Desmarcar todos</span>
              </button>
            `}
            <button
              type="button"
              onclick="downloadSelectedArtTemplates()"
              class="h-8 px-3 rounded-[8px] bg-primary text-white font-display font-bold text-[11px] shadow-xs hover:bg-primary-hover inline-flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <i class="uil uil-import text-xs leading-none"></i>
              <span>Baixar (${selectedCount})</span>
            </button>
          `}
        </div>
      </div>

      <!-- Lista ou Grade de Cards -->
      ${state.artViewMode === 'list' ? renderListRowsHtml() : renderGridCardsHtml()}
    </div>

    <!-- Modal de Detalhes Técnicos ("ver detalhes") -->
    ${renderArtDetailsModalHtml(m)}
  `;
  syncMobileHoverElimination();
}

function renderArtDetailsModalHtml(m) {
  if (!state.activeArtModalFormatId) return '';
  const fmt = (m.artFormats || []).find((f) => f.id === state.activeArtModalFormatId);
  if (!fmt) return '';

  const visibleTitle = getVisibleFormatAmbienteTitle(fmt);
  const badgeText = fmt.isGlobo
    ? fmt.badgeLabel
    : (fmt.isStatic ? 'IMPRESSO' : 'DIGITAL');
  const formatTagClass = fmt.isStatic
    ? 'bg-[#F3E8FF] text-[#6D28D9] border border-[#DDD6FE]'
    : 'bg-[#EBF3FE] text-[#1D4ED8] border border-[#BFDBFE]';
  const sec = state.activeArtModalSection || 'general';
  const fallbackSvg = getArtFormatFallbackSvg(fmt);

  return `
    <div
      onclick="closeArtFormatModal()"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onclick="event.stopPropagation()"
        class="bg-white rounded-2xl border border-ds-borderStrong shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <!-- Header do Modal -->
        <div class="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-ds-border flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider ${formatTagClass} shrink-0">
              ${badgeText}
            </span>
            <h3 class="font-display font-bold text-sm sm:text-lg text-ds-textMain truncate">
              ${visibleTitle} — ${fmt.width}×${fmt.height} ${fmt.unit}
            </h3>
          </div>
          <button
            type="button"
            onclick="closeArtFormatModal()"
            class="w-8 h-8 rounded-lg border border-ds-border flex items-center justify-center text-ds-textSecondary hover:text-ds-textMain hover:bg-ds-surface transition shrink-0"
          >
            <i class="uil uil-times text-lg"></i>
          </button>
        </div>

        <!-- Corpo 2 Colunas: Preview Visual à esquerda + Acordeão de Especificações à direita -->
        <div class="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          <!-- Coluna Esquerda: Preview Visual com Réguas + Alerta de Área Segura -->
          <div class="md:col-span-7 flex flex-col items-center justify-center bg-[#F8FAFC] rounded-xl border border-ds-border p-4 sm:p-6">
            ${fmt.isGlobo ? `
              <img
                src="${fmt.modalPreviewUrl}"
                onerror="this.onerror=null;this.src='${fallbackSvg}'"
                alt="${visibleTitle}"
                class="max-h-[260px] sm:max-h-[300px] w-auto object-contain rounded-lg shadow-xs"
              />
              <p class="text-[11px] text-ds-textSecondary mt-3 text-center">
                Exemplo de aplicação do formato <strong>${visibleTitle} (${fmt.width}×${fmt.height} px)</strong> nos portais e propriedades digitais.
              </p>
            ` : `
              <div class="py-6 sm:py-8 pr-12 sm:pr-14 flex items-center justify-center">
                <div class="relative inline-flex items-center justify-center">
                  <img
                    src="${fmt.previewUrl}"
                    onerror="this.onerror=null;this.src='${fallbackSvg}'"
                    alt="${visibleTitle}"
                    class="max-h-[200px] sm:max-h-[270px] w-auto object-contain rounded"
                  />
                  ${renderDimensionRulerHorizontal(fmt.width, fmt.unit)}
                  ${renderDimensionRulerVertical(fmt.height, fmt.unit)}
                </div>
              </div>
              ${fmt.barHeight > 0 ? `
                <div class="mt-3 w-full rounded-lg bg-amber-50/90 border border-amber-200 px-3.5 py-2.5 text-xs text-amber-950 flex items-start gap-2">
                  <i class="uil uil-exclamation-triangle text-amber-600 text-base shrink-0 mt-0.5"></i>
                  <div>
                    <strong>Importante:</strong> Deixe um espaço livre de <strong>${fmt.barHeight}${fmt.unit}</strong> na parte inferior da arte para a exibição da barra de informações.
                  </div>
                </div>
              ` : ''}
            `}
          </div>

          <!-- Coluna Direita: Acordeão de Especificações Técnicas e Gabarito -->
          <div class="md:col-span-5 space-y-2.5">
            <!-- 1. Especificações gerais -->
            <div class="rounded-xl border border-ds-borderStrong overflow-hidden">
              <button
                type="button"
                onclick="setArtModalAccordion('general')"
                class="w-full px-4 py-3 bg-ds-surface flex items-center justify-between text-left font-display font-bold text-xs sm:text-sm text-ds-textMain"
              >
                <span class="flex items-center gap-2"><i class="uil uil-sliders-v-alt text-primary"></i> Especificações gerais</span>
                <i class="uil ${sec === 'general' ? 'uil-angle-up' : 'uil-angle-down'} text-lg"></i>
              </button>
              ${sec === 'general' ? `
                <div class="p-3.5 divide-y divide-ds-border text-xs bg-white">
                  <div class="py-2 flex justify-between gap-2">
                    <span class="text-ds-textSecondary">Formato (Área total)</span>
                    <strong class="text-ds-textMain">${fmt.width} × ${fmt.height} ${fmt.unit}</strong>
                  </div>
                  ${fmt.availableWidth ? `
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Área útil (Segura)</span>
                      <strong class="text-ds-textMain">${fmt.availableWidth} × ${fmt.availableHeight} ${fmt.unit}</strong>
                    </div>
                  ` : ''}
                  ${fmt.barHeight > 0 ? `
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Barra inferior</span>
                      <strong class="text-ds-textMain">${fmt.width} × ${fmt.barHeight} ${fmt.unit}</strong>
                    </div>
                  ` : ''}
                  ${fmt.clipLength ? `
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Secundagem / Duração</span>
                      <strong class="text-ds-textMain">${fmt.clipLength} segundos</strong>
                    </div>
                  ` : ''}
                  <div class="py-2 flex justify-between gap-2">
                    <span class="text-ds-textSecondary">Tipo de mídia</span>
                    <strong class="text-ds-textMain">${fmt.isStatic ? 'Estático (Impressão)' : 'Digital'}</strong>
                  </div>
                  ${fmt.ambientes && fmt.ambientes.length > 0 ? `
                    <div class="py-2 flex flex-col gap-1">
                      <span class="text-ds-textSecondary">Ambientes nesta proposta</span>
                      <div class="flex flex-wrap gap-1 mt-0.5">
                        ${fmt.ambientes.map((a) => `<span class="px-2 py-0.5 rounded bg-ds-surface border border-ds-border text-[11px] font-semibold text-ds-textMain">${a}</span>`).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            </div>

            <!-- 2. Imagem / Impressão -->
            <div class="rounded-xl border border-ds-borderStrong overflow-hidden">
              <button
                type="button"
                onclick="setArtModalAccordion('image')"
                class="w-full px-4 py-3 bg-ds-surface flex items-center justify-between text-left font-display font-bold text-xs sm:text-sm text-ds-textMain"
              >
                <span class="flex items-center gap-2"><i class="uil uil-image text-primary"></i> ${fmt.isStatic ? 'Arquivo de Impressão (PDF)' : 'Imagem Estática'}</span>
                <i class="uil ${sec === 'image' ? 'uil-angle-up' : 'uil-angle-down'} text-lg"></i>
              </button>
              ${sec === 'image' ? `
                <div class="p-3.5 divide-y divide-ds-border text-xs bg-white">
                  <div class="py-2 flex justify-between gap-2">
                    <span class="text-ds-textSecondary">Extensões aceitas</span>
                    <strong class="text-ds-textMain">${fmt.extensions}</strong>
                  </div>
                  ${fmt.dpi ? `
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Resolução mínima</span>
                      <strong class="text-ds-textMain">${fmt.dpi} DPI</strong>
                    </div>
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Perfil de cores</span>
                      <strong class="text-ds-textMain">${fmt.colorProfile}</strong>
                    </div>
                  ` : ''}
                  <div class="py-2 flex justify-between gap-2">
                    <span class="text-ds-textSecondary">Tamanho máximo</span>
                    <strong class="text-ds-textMain">${fmt.isStatic ? fmt.maxWeightPdf : fmt.maxWeightImage}</strong>
                  </div>
                </div>
              ` : ''}
            </div>

            <!-- 3. Vídeo (quando aplicável) -->
            ${fmt.types.includes('video') ? `
              <div class="rounded-xl border border-ds-borderStrong overflow-hidden">
                <button
                  type="button"
                  onclick="setArtModalAccordion('video')"
                  class="w-full px-4 py-3 bg-ds-surface flex items-center justify-between text-left font-display font-bold text-xs sm:text-sm text-ds-textMain"
                >
                  <span class="flex items-center gap-2"><i class="uil uil-video text-primary"></i> Vídeo</span>
                  <i class="uil ${sec === 'video' ? 'uil-angle-up' : 'uil-angle-down'} text-lg"></i>
                </button>
                ${sec === 'video' ? `
                  <div class="p-3.5 divide-y divide-ds-border text-xs bg-white">
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Extensão</span>
                      <strong class="text-ds-textMain">MP4 (Codec H.264)</strong>
                    </div>
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Áudio</span>
                      <strong class="text-ds-textMain">Sem áudio (OOH)</strong>
                    </div>
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Duração exata</span>
                      <strong class="text-ds-textMain">${fmt.clipLength || 10} segundos</strong>
                    </div>
                    <div class="py-2 flex justify-between gap-2">
                      <span class="text-ds-textSecondary">Tamanho máximo</span>
                      <strong class="text-ds-textMain">${fmt.maxWeightVideo}</strong>
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <!-- 4. Gabaritos para Download -->
            <div class="rounded-xl border border-ds-borderStrong p-3.5 bg-ds-surface/60 flex items-center justify-between gap-3">
              <div>
                <div class="font-display font-bold text-xs sm:text-sm text-ds-textMain flex items-center gap-1.5">
                  <i class="uil uil-file-download-alt text-primary text-base"></i>
                  <span>Gabarito oficial (.PDF)</span>
                </div>
                <p class="text-[11px] text-ds-textSecondary">Guia com margens de segurança e sangria</p>
              </div>
              <button
                type="button"
                onclick="downloadSingleArtGabarito('${fmt.id}')"
                class="px-3.5 py-2 rounded-lg bg-primary text-white font-display font-bold text-xs hover:bg-primary-hover transition shrink-0"
              >
                Baixar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  syncMobileHoverElimination();
}

function handleArtSearchInput(val) {
  state.artSearch = val;
  renderArtTab(getCurrentModel());
  const input = document.getElementById('artSearchInput');
  if (input) {
    input.focus();
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }
}

function setArtFilter(field, val) {
  if (!val) return;
  state[field] = val;
  if (field === 'artCategory') {
    // Ao mudar a região de categoria principal (ex: OOH <-> Digital), reseta os filtros dependentes
    state.artAmbiente = 'all';
    state.artFormatDim = 'all';
    state.artMediaType = 'all';
  }
  const m = getCurrentModel();
  ensureValidArtFilterState(m);
  renderArtTab(m);
}

function switchArtCategoryPreservingSearch(targetCategory) {
  if (!targetCategory) return;
  state.artCategory = targetCategory;
  state.artAmbiente = 'all';
  state.artFormatDim = 'all';
  state.artMediaType = 'all';
  const m = getCurrentModel();
  ensureValidArtFilterState(m);
  renderArtTab(m);
}

function resetArtFilters() {
  state.artSearch = '';
  state.artAmbiente = 'all';
  state.artFormatDim = 'all';
  state.artMediaType = 'all';
  renderArtTab(getCurrentModel());
}

function setArtViewMode(mode) {
  state.artViewMode = mode;
  renderArtTab(getCurrentModel());
}

function toggleArtSelectFormat(formatId) {
  const scrollBox = document.getElementById('artFormatsScrollBox');
  const prevScroll = scrollBox ? scrollBox.scrollTop : 0;
  const set = new Set(state.artSelectedIds || []);
  if (set.has(formatId)) set.delete(formatId);
  else set.add(formatId);
  state.artSelectedIds = Array.from(set);
  renderArtTab(getCurrentModel());
  const newScrollBox = document.getElementById('artFormatsScrollBox');
  if (newScrollBox) newScrollBox.scrollTop = prevScroll;
}

function selectAllArtFormats() {
  const m = getCurrentModel();
  const filtered = getFilteredArtFormats(m);
  const set = new Set(state.artSelectedIds || []);
  filtered.forEach((f) => set.add(f.id));
  state.artSelectedIds = Array.from(set);
  renderArtTab(m);
}

function clearArtSelectedFormats() {
  state.artSelectedIds = [];
  renderArtTab(getCurrentModel());
}

function toggleSelectAllArtCheckbox() {
  const m = getCurrentModel();
  const filtered = getFilteredArtFormats(m);
  const set = new Set(state.artSelectedIds || []);
  const allSelected = filtered.length > 0 && filtered.every((f) => set.has(f.id));
  if (allSelected) {
    filtered.forEach((f) => set.delete(f.id));
  } else {
    filtered.forEach((f) => set.add(f.id));
  }
  state.artSelectedIds = Array.from(set);
  renderArtTab(m);
}

function toggleArtListExpand(formatId) {
  const scrollBox = document.getElementById('artFormatsScrollBox');
  const prevScroll = scrollBox ? scrollBox.scrollTop : 0;
  state.artExpandedListIds[formatId] = !state.artExpandedListIds[formatId];
  renderArtTab(getCurrentModel());
  const newScrollBox = document.getElementById('artFormatsScrollBox');
  if (newScrollBox) newScrollBox.scrollTop = prevScroll;
}

function openArtFormatModal(formatId) {
  state.activeArtModalFormatId = formatId;
  state.activeArtModalSection = 'general';
  renderArtTab(getCurrentModel());
}

function closeArtFormatModal() {
  state.activeArtModalFormatId = null;
  renderArtTab(getCurrentModel());
}

function setArtModalAccordion(sectionKey) {
  state.activeArtModalSection = state.activeArtModalSection === sectionKey ? '' : sectionKey;
  renderArtTab(getCurrentModel());
}

function downloadSingleArtGabarito(formatId) {
  const m = getCurrentModel();
  const fmt = (m.artFormats || []).find((f) => f.id === formatId);
  const label = fmt ? `${fmt.title} (${fmt.width}x${fmt.height}${fmt.unit})` : formatId;
  showToast(`Gabarito PDF de "${label}" baixado com sucesso!`);
}

function downloadSelectedArtTemplates() {
  const count = (state.artSelectedIds || []).length;
  if (!count) return;
  showToast(`Baixando pacote com ${count} ${count === 1 ? 'gabarito oficial' : 'gabaritos oficiais'} em PDF...`);
}


/**
 * ============================================================================
 * 6. ABA PAGAMENTO E APROVAÇÃO (LAYOUT FIEL AO FIGMA 3387-12075: ↪ Payment)
 * - Coluna Esquerda (lg:col-span-7):
 *     • Acordeão de Radio Cards Conectados com Linha Guia Vertical Laranja
 *     • Cartão de Crédito: alternância entre Cartão Salvo (Mastercard •••• 7492 • principal)
 *       e Formulário de Novo Cartão completo
 *     • PIX: passo a passo numerado de 4 etapas + geração de QR Code e Copia e Cola
 *     • Boleto Bancário: passo a passo numerado de 4 etapas + geração de Linha Digitável
 *     • Estado Pós-Envio (Passo 3 — "Seu pedido já está em processamento" + "Acompanhe seu pedido")
 *     • Card dedicado de Faturamento de Rádio CBN (quando há Rádio na proposta)
 * - Coluna Direita (lg:col-span-5 Sticky):
 *     • Card "Resumo da campanha" idêntico ao Figma (Campanha, Faturamento c/ ✎ alterar,
 *       Cupom inline, Valor total em verde #1B5E20, Selo Rede Itaú e CTAs em minúsculas)
 * ============================================================================
 */
function renderPaymentTab(m) {
  const f = m.financials;
  const c = m.counts;
  const mobile = isMobileView();
  const hasRadio = c.radioCount > 0;
  const hasDiscounts = f.totalDiscounts > 0;
  const onlineChannelsLabel = c.portaisCount + c.revistasCount > 0 ? 'OOH + Digital' : 'OOH';
  const needsBillingWarning = state.simulateUnlogged && !state.billingUnlockedInline;
  const displayProposalId = state.clonedScenariosCount > 0 ? `${m.id}-R${state.clonedScenariosCount}` : m.id;

  // Linhas estruturadas das verticais/canais no Resumo da campanha (no Mobile, quantidade vai para baixo do título)
  const verticalSummaryRows = [];
  if (c.oohPointsCount > 0) {
    verticalSummaryRows.push(`
      <div class="flex ${mobile ? 'items-start' : 'items-center'} justify-between gap-2 py-1.5">
        <div class="flex ${mobile ? 'items-start' : 'items-center'} gap-2 min-w-0">
          <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ${mobile ? 'mt-1.5' : ''}"></span>
          ${mobile ? `
            <div class="min-w-0">
              <div class="font-semibold text-ds-textMain leading-tight">OOH</div>
              <div class="text-[11px] text-ds-textMuted leading-tight mt-0.5">${c.oohPointsCount} ${c.oohPointsCount > 1 ? 'pontos' : 'ponto'}</div>
            </div>
          ` : `
            <span class="font-semibold text-ds-textMain">OOH</span>
            <span class="text-ds-textMuted truncate">· ${c.oohPointsCount} ${c.oohPointsCount > 1 ? 'pontos' : 'ponto'}</span>
          `}
        </div>
        <span class="font-display font-bold text-ds-textMain whitespace-nowrap">${fmtBRL(f.oohNet)}</span>
      </div>
    `);
  }
  if (c.portaisCount > 0) {
    verticalSummaryRows.push(`
      <div class="flex ${mobile ? 'items-start' : 'items-center'} justify-between gap-2 py-1.5">
        <div class="flex ${mobile ? 'items-start' : 'items-center'} gap-2 min-w-0">
          <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ${mobile ? 'mt-1.5' : ''}"></span>
          ${mobile ? `
            <div class="min-w-0">
              <div class="font-semibold text-ds-textMain leading-tight truncate">Portais e Globoplay</div>
              <div class="text-[11px] text-ds-textMuted leading-tight mt-0.5">${c.portaisCount} ${c.portaisCount > 1 ? 'formatos' : 'formato'}</div>
            </div>
          ` : `
            <span class="font-semibold text-ds-textMain truncate">Portais e Globoplay</span>
            <span class="text-ds-textMuted shrink-0">· ${c.portaisCount} ${c.portaisCount > 1 ? 'formatos' : 'formato'}</span>
          `}
        </div>
        <span class="font-display font-bold text-ds-textMain whitespace-nowrap">${fmtBRL(f.portaisNet)}</span>
      </div>
    `);
  }
  if (c.revistasCount > 0) {
    verticalSummaryRows.push(`
      <div class="flex ${mobile ? 'items-start' : 'items-center'} justify-between gap-2 py-1.5">
        <div class="flex ${mobile ? 'items-start' : 'items-center'} gap-2 min-w-0">
          <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ${mobile ? 'mt-1.5' : ''}"></span>
          ${mobile ? `
            <div class="min-w-0">
              <div class="font-semibold text-ds-textMain leading-tight">Revistas</div>
              <div class="text-[11px] text-ds-textMuted leading-tight mt-0.5">${c.revistasCount} ${c.revistasCount > 1 ? 'títulos' : 'título'}</div>
            </div>
          ` : `
            <span class="font-semibold text-ds-textMain">Revistas</span>
            <span class="text-ds-textMuted">· ${c.revistasCount} ${c.revistasCount > 1 ? 'títulos' : 'título'}</span>
          `}
        </div>
        <span class="font-display font-bold text-ds-textMain whitespace-nowrap">${fmtBRL(f.revistasNet)}</span>
      </div>
    `);
  }

  // CHECKOUT À PARTE DE RÁDIO CBN (ENXUTO E COM ESTRUTURA DE CHECKOUT DEDICADO)
  const radioDedicatedCardHtml = hasRadio ? `
    <div class="bg-white rounded-[18px] border border-ds-borderStrong ${mobile ? 'p-4' : 'p-6'} shadow-aqui-card space-y-3.5 flex flex-col justify-between">
      <div class="flex items-center justify-between gap-2 pb-3 border-b border-ds-border">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center text-base shrink-0">
            <i class="uil uil-microphone"></i>
          </div>
          <div class="min-w-0">
            <h3 class="font-display font-bold text-sm sm:text-base text-ds-textMain truncate">Rádio CBN</h3>
            <p class="text-[11px] text-ds-textSecondary truncate">${c.radioCount} ${c.radioCount > 1 ? 'praças' : 'praça'} · Faturamento após confirmação de grade</p>
          </div>
        </div>
        <span class="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-display font-bold text-[11px] shrink-0">
          Checkout à parte
        </span>
      </div>

      <div class="flex ${mobile ? 'flex-col items-stretch' : 'flex-col sm:flex-row sm:items-center justify-between'} gap-3 pt-0.5">
        <div>
          <div class="text-xs text-ds-textSecondary">Valor faturado à parte</div>
          <div class="font-display font-extrabold text-lg sm:text-xl text-ds-textMain">${fmtBRL(f.radioNet)}</div>
        </div>

        <button
          type="button"
          onclick="requestRadioBilling()"
          data-hubspot-action="create-radio-order"
          class="${mobile ? 'w-full' : 'w-full sm:w-auto'} px-4 py-2.5 rounded-xl ${
            state.radioOrderRequested
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-ds-textMain hover:bg-primary text-white shadow-xs'
          } font-display font-bold text-xs transition inline-flex items-center justify-center gap-2 shrink-0"
        >
          <i class="uil ${state.radioOrderRequested ? 'uil-check-circle' : 'uil-envelope-send'} text-sm"></i>
          <span>${state.radioOrderRequested ? 'Faturamento solicitado' : 'Solicitar faturamento de Rádio'}</span>
        </button>
      </div>
    </div>
  ` : '';

  // ==========================================================================
  // SEÇÃO REDUZIDA QUANDO A PROPOSTA ESTÁ PAGA ("EM PROCESSAMENTO") OU "PROPOSTA CONCLUÍDA"
  // ==========================================================================
  if (state.proposalStatus === 'processing' || state.proposalStatus === 'completed') {
    const isCompleted = state.proposalStatus === 'completed';
    const lockedMethodLabel = state.paymentMethod === 'pix'
      ? 'PIX à vista'
      : state.paymentMethod === 'boleto'
      ? 'Boleto bancário'
      : `Cartão de crédito · ${state.selectedInstallments}x de ${fmtBRL(f.onlinePayableNow / state.selectedInstallments)} s/ juros`;

    document.getElementById('tabContent-pagamento').innerHTML = `
      <div id="paymentStatusTopAnchor" class="space-y-4">
        <div class="${hasRadio ? `grid grid-cols-1 lg:grid-cols-12 ${mobile ? 'gap-4' : 'gap-6'} items-stretch sim-grid-1` : 'max-w-3xl mx-auto'}">
          <div class="${hasRadio ? 'lg:col-span-7' : ''} h-full bg-white rounded-[18px] border border-ds-borderStrong ${mobile ? 'p-4 space-y-4' : 'p-6 space-y-5'} shadow-aqui-card flex flex-col justify-between">
            <!-- Cabeçalho no mesmo padrão visual dos demais títulos da proposta -->
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-ds-border pb-3.5">
              <h3 class="font-display font-bold ${mobile ? 'text-base' : 'text-lg'} text-ds-textMain">
                Pagamento da proposta <span class="text-ds-textMuted font-medium">#${displayProposalId}</span>
              </h3>

              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-sky-50 text-sky-800 border border-sky-200'
              } font-display font-bold text-xs">
                <span class="w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-sky-600'}"></span>
                <span>${isCompleted ? 'Campanha concluída' : 'Campanha ativa'}</span>
              </span>
            </div>

            <!-- Resumo reduzido do pagamento (apenas valor pago e forma de pagamento) -->
            <div class="p-3.5 sm:p-4 rounded-xl bg-ds-surface border border-ds-border flex ${mobile ? 'flex-col items-start' : 'flex-col sm:flex-row sm:items-center justify-between'} gap-3">
              <div class="space-y-0.5">
                <div class="text-xs text-ds-textSecondary">
                  Forma de pagamento: <strong class="text-ds-textMain">${lockedMethodLabel}</strong>
                </div>
                <div class="text-[11px] text-ds-textMuted">
                  Faturamento: ${state.billingCompany} (CNPJ ${state.billingDoc})
                </div>
              </div>
              <div class="${mobile ? 'pt-2.5 border-t border-ds-border w-full' : 'sm:text-right'}">
                <div class="text-[11px] text-ds-textSecondary">Valor pago (${onlineChannelsLabel})</div>
                <div class="font-display font-extrabold text-xl sm:text-2xl text-aqui-green leading-tight">${fmtBRL(f.onlinePayableNow)}</div>
              </div>
            </div>

            ${isCompleted ? `
              <!-- Item de "Renovar campanha" quando a proposta está concluída -->
              <div class="p-4 rounded-xl bg-primary-light/40 border border-primary/25 flex ${mobile ? 'flex-col items-stretch' : 'flex-col sm:flex-row sm:items-center justify-between'} gap-3">
                <div class="space-y-0.5">
                  <div class="font-display font-bold text-sm text-ds-textMain flex items-center gap-1.5">
                    <i class="uil uil-redo text-primary text-base"></i>
                    <span>Renovar campanha</span>
                  </div>
                  <p class="text-xs text-ds-textSecondary">
                    Esta campanha já foi encerrada. Reative o mesmo plano de mídia (${c.totalItems} ativos) para um novo período.
                  </p>
                </div>
                <button
                  type="button"
                  onclick="renewCampaignProposal('${displayProposalId}')"
                  data-route="/campanhas/${displayProposalId}/detalhamento-anuncio"
                  class="${mobile ? 'w-full' : 'w-full sm:w-auto'} px-5 py-2.5 rounded-xl bg-aqui-grad text-white font-display font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 transition shrink-0"
                >
                  <i class="uil uil-redo text-base"></i>
                  <span>renovar campanha</span>
                </button>
              </div>
            ` : `
              <div class="flex ${mobile ? 'flex-col items-stretch gap-3' : 'flex-col sm:flex-row sm:items-center justify-between gap-3'} pt-1">
                <button
                  type="button"
                  onclick="goToAdDetailingStep('${displayProposalId}')"
                  data-route="/campanhas/${displayProposalId}/detalhamento-anuncio"
                  class="${mobile ? 'w-full justify-center py-2.5' : 'w-full sm:w-auto justify-center py-2'} px-4 rounded-xl bg-aqui-grad text-white font-display font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs hover:opacity-95 transition"
                >
                  <span>enviar criativos da campanha</span>
                  <i class="uil uil-image-upload text-sm"></i>
                </button>
                <button type="button" onclick="switchMainTab('plano')" class="${mobile ? 'w-full justify-center py-1' : ''} inline-flex items-center gap-1 text-xs font-display font-semibold text-ds-textSecondary hover:text-primary transition">
                  <i class="uil uil-arrow-left text-sm"></i>
                  <span>voltar para a proposta</span>
                </button>
              </div>
            `}
          </div>

          ${hasRadio ? `<div class="lg:col-span-5 flex flex-col h-full [&>div]:h-full">${radioDedicatedCardHtml}</div>` : ''}
        </div>
      </div>
    `;
    return;
  }

  // ==========================================================================
  // ESTADO "AGUARDANDO PAGAMENTO" (CHECKOUT COMPLETO + PIX GERADO COM SCROLL)
  // ==========================================================================
  const pixCodeString = `00020126580014BR.GOV.BCB.PIX0136aquiads-proposta-${m.id}-eletromidia5204000053039865408${f.onlinePayableNow.toFixed(2)}5802BR5918AQUI ADS GLOBO ELE6009SAO PAULO62070503***6304ABCD`;
  const boletoLineString = `34191.79001 01043.510047 91020.150008 8 989500000${Math.round(f.onlinePayableNow)}`;

  const leftPaymentColumnHtml = `
    <div class="bg-white rounded-[18px] border border-ds-borderStrong ${mobile ? 'p-3.5 space-y-3.5' : 'p-6 space-y-5'} shadow-aqui-card">
      <div class="border-b border-ds-border pb-3">
        <h3 class="font-display font-bold text-ds-textMain ${mobile ? 'text-base' : 'text-xl'}">
          Escolha a forma de pagamento
        </h3>
        <p class="text-xs text-ds-textSecondary mt-0.5">
          Selecione como deseja pagar os canais de ativação online (${onlineChannelsLabel})
        </p>
      </div>

      <div class="space-y-3">

        <!-- OPÇÃO 1: CARTÃO DE CRÉDITO -->
        <div class="space-y-2.5">
          <button
            type="button"
            onclick="setPaymentMethod('card')"
            class="w-full ${mobile ? 'p-3.5' : 'p-4'} rounded-[14px] border text-left flex items-center justify-between gap-2.5 transition ${
              state.paymentMethod === 'card'
                ? 'border-2 border-primary bg-white shadow-xs'
                : 'border-ds-borderStrong bg-ds-surface/40 hover:bg-white'
            }"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                state.paymentMethod === 'card' ? 'border-primary' : 'border-ds-textMuted'
              }">
                ${state.paymentMethod === 'card' ? '<span class="w-2.5 h-2.5 rounded-full bg-primary"></span>' : ''}
              </span>
              <div class="min-w-0">
                <div class="font-display font-bold text-sm sm:text-base text-ds-textMain">Cartão de crédito</div>
                <div class="text-xs text-ds-textSecondary">Até 6x sem juros</div>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
              state.paymentMethod === 'card'
                ? 'bg-primary-light text-primary'
                : 'bg-ds-bg text-ds-textSecondary'
            }">
              ${state.paymentMethod === 'card' ? 'Selecionado' : 'Até 6x s/ juros'}
            </span>
          </button>

          ${state.paymentMethod === 'card' ? `
            <div class="${mobile ? 'ml-3 pl-3' : 'ml-4 pl-4'} border-l-2 border-dashed border-amber-400/90 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-ds-textSecondary">
                  Meus cartões
                </span>
                ${state.cardMode === 'saved' ? `
                  <button type="button" onclick="setCardMode('new')" class="text-[11px] font-bold text-primary hover:underline">
                    + cadastrar novo cartão
                  </button>
                ` : `
                  <button type="button" onclick="setCardMode('saved')" class="text-[11px] font-bold text-primary hover:underline">
                    ← usar cartão salvo
                  </button>
                `}
              </div>

              <div class="rounded-[14px] border border-ds-borderStrong bg-white ${mobile ? 'p-3.5 space-y-3' : 'p-4 space-y-3.5'}">
                ${state.cardMode === 'saved' ? `
                  <p class="text-xs text-ds-textSecondary">
                    Confirme o código de segurança e o parcelamento do seu cartão principal.
                  </p>

                  <div class="p-3 rounded-xl bg-ds-bg border border-ds-borderStrong flex items-center justify-between gap-2.5">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="px-2 py-1 rounded-md bg-white border border-ds-borderStrong flex items-center gap-1 shrink-0">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#EB001B] inline-block"></span>
                        <span class="w-2.5 h-2.5 rounded-full bg-[#F79E1B] -ml-1 inline-block opacity-90"></span>
                        <span class="font-display font-bold text-[10px] text-ds-textMain ml-0.5">Mastercard</span>
                      </div>
                      <div class="min-w-0">
                        <div class="font-display font-bold text-xs text-ds-textMain truncate">•••• 7492 · Principal</div>
                        <div class="text-[11px] text-ds-textSecondary truncate">Natalia Ferreira · Val. 08/29</div>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-12 gap-2.5 text-xs">
                    <div class="col-span-4">
                      <label class="block text-ds-textMain font-bold mb-1">CVV <span class="text-aqui-red">*</span></label>
                      <input type="text" maxlength="4" value="842" placeholder="000" class="w-full px-3 py-2 rounded-lg border border-ds-borderStrong bg-white focus:border-primary focus:outline-none font-mono font-bold text-ds-textMain text-xs" />
                    </div>
                    <div class="col-span-8">
                      <label class="block text-ds-textMain font-bold mb-1">Parcelar em <span class="text-aqui-red">*</span></label>
                      <select onchange="setInstallments(this.value)" class="w-full px-2.5 py-2 rounded-lg border border-ds-borderStrong bg-white focus:border-primary focus:outline-none font-bold text-ds-textMain text-xs">
                        ${[1, 2, 3, 4, 5, 6].map((n) => `
                          <option value="${n}" ${Number(state.selectedInstallments) === n ? 'selected' : ''}>
                            ${n}x de ${fmtBRL(f.onlinePayableNow / n)} s/ juros
                          </option>
                        `).join('')}
                      </select>
                    </div>
                  </div>

                  <div class="pt-1 space-y-2">
                    <button type="button" onclick="showToast('Cartão Mastercard •••• 7492 confirmado!')" class="w-full py-2.5 px-4 rounded-xl bg-ds-textMain hover:bg-black text-white font-display font-bold text-xs transition">
                      usar cartão selecionado
                    </button>
                    <button type="button" onclick="setCardMode('new')" class="w-full py-2.5 px-4 rounded-xl border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textMain font-display font-bold text-xs transition">
                      cadastrar novo cartão
                    </button>
                  </div>
                ` : `
                  <p class="text-xs text-ds-textSecondary">
                    Insira os dados do cartão que será usado nesta campanha.
                  </p>

                  <div class="space-y-3 text-xs">
                    <div>
                      <label class="block text-ds-textMain font-bold mb-1">Número do cartão <span class="text-aqui-red">*</span></label>
                      <input type="text" placeholder="0000 0000 0000 0000" class="w-full px-3 py-2.5 rounded-lg border border-ds-borderStrong bg-white focus:border-primary focus:outline-none text-xs" />
                    </div>

                    <div>
                      <label class="block text-ds-textMain font-bold mb-1">Nome impresso no cartão <span class="text-aqui-red">*</span></label>
                      <input type="text" placeholder="Ex: João da Silva" class="w-full px-3 py-2.5 rounded-lg border border-ds-borderStrong bg-white focus:border-primary focus:outline-none text-xs" />
                    </div>

                    <div class="grid grid-cols-12 gap-2">
                      <div class="col-span-4">
                        <label class="block text-ds-textMain font-bold mb-1 truncate">Validade <span class="text-aqui-red">*</span></label>
                        <input type="text" placeholder="mm/aa" class="w-full px-2.5 py-2 rounded-lg border border-ds-borderStrong bg-white focus:border-primary focus:outline-none text-xs" />
                      </div>
                      <div class="col-span-3">
                        <label class="block text-ds-textMain font-bold mb-1 truncate">CVV <span class="text-aqui-red">*</span></label>
                        <input type="text" maxlength="4" placeholder="000" class="w-full px-2.5 py-2 rounded-lg border border-ds-borderStrong bg-white focus:border-primary focus:outline-none text-xs" />
                      </div>
                      <div class="col-span-5">
                        <label class="block text-ds-textMain font-bold mb-1 truncate">Parcelar em <span class="text-aqui-red">*</span></label>
                        <select onchange="setInstallments(this.value)" class="w-full px-2 py-2 rounded-lg border border-ds-borderStrong bg-white focus:border-primary focus:outline-none font-bold text-ds-textMain text-xs">
                          ${[1, 2, 3, 4, 5, 6].map((n) => `
                            <option value="${n}" ${Number(state.selectedInstallments) === n ? 'selected' : ''}>
                              ${n}x de ${fmtBRL(f.onlinePayableNow / n)}
                            </option>
                          `).join('')}
                        </select>
                      </div>
                    </div>

                    <label class="flex items-center gap-2 pt-0.5 text-xs text-ds-textSecondary cursor-pointer select-none">
                      <input type="checkbox" checked class="rounded border-ds-borderStrong text-primary focus:ring-primary" />
                      <span>Salvar este cartão para próximas campanhas</span>
                    </label>

                    <div class="pt-1 space-y-2">
                      <button type="button" onclick="showToast('Novo cartão validado para esta campanha!')" class="w-full py-2.5 px-4 rounded-xl bg-ds-textMain hover:bg-black text-white font-display font-bold text-xs transition">
                        usar cartão selecionado
                      </button>
                      <button type="button" onclick="setCardMode('saved')" class="w-full py-2.5 px-4 rounded-xl border border-ds-borderStrong bg-white hover:bg-ds-surface text-ds-textMain font-display font-bold text-xs transition">
                        voltar para cartão salvo (•••• 7492)
                      </button>
                    </div>
                  </div>
                `}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- OPÇÃO 2: PIX (Com seção #generatedPixSection para onde a tela sobe ao clicar em "ativar minha campanha") -->
        <div class="space-y-2.5">
          <button
            type="button"
            onclick="setPaymentMethod('pix')"
            class="w-full ${mobile ? 'p-3.5' : 'p-4'} rounded-[14px] border text-left flex items-center justify-between gap-2.5 transition ${
              state.paymentMethod === 'pix'
                ? 'border-2 border-primary bg-white shadow-xs'
                : 'border-ds-borderStrong bg-ds-surface/40 hover:bg-white'
            }"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                state.paymentMethod === 'pix' ? 'border-primary' : 'border-ds-textMuted'
              }">
                ${state.paymentMethod === 'pix' ? '<span class="w-2.5 h-2.5 rounded-full bg-primary"></span>' : ''}
              </span>
              <div class="min-w-0">
                <div class="font-display font-bold text-sm sm:text-base text-ds-textMain">PIX</div>
                <div class="text-xs text-ds-textSecondary">Pagamento à vista com liberação imediata</div>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
              state.paymentMethod === 'pix'
                ? 'bg-primary-light text-primary'
                : 'bg-ds-bg text-ds-textSecondary'
            }">
              ${state.paymentMethod === 'pix' ? (state.pixGenerated ? (mobile ? 'Código gerado' : 'QR Code gerado') : 'Selecionado') : 'Aprovação imediata'}
            </span>
          </button>

          ${state.paymentMethod === 'pix' ? `
            <div id="generatedPixSection" class="${mobile ? 'ml-3 pl-3' : 'ml-4 pl-4'} border-l-2 border-dashed border-amber-400/90">
              ${state.pixGenerated ? `
                <div class="rounded-[14px] border-2 border-primary/40 bg-ds-surface p-3.5 space-y-3.5 shadow-sm">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <i class="uil ${mobile ? 'uil-copy' : 'uil-qrcode-scan'} text-xs"></i> Pix gerado · Aguardando pagamento
                      </span>
                      <h4 class="font-display font-bold text-sm text-ds-textMain mt-0.5">${mobile ? 'Copie o código Pix Copia e Cola' : 'Escaneie o QR Code ou copie o código'}</h4>
                    </div>
                    <span class="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">Expira em 15:00</span>
                  </div>

                  <div class="grid grid-cols-1 ${mobile ? '' : 'sm:grid-cols-12'} gap-3.5 items-center sim-grid-1">
                    ${!mobile ? `
                      <div class="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-ds-borderStrong sim-hide-mobile">
                        <svg class="w-24 h-24 text-ds-textMain" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="8" y="8" width="26" height="26" fill="none" stroke="currentColor" stroke-width="6"/>
                          <rect x="15" y="15" width="12" height="12"/>
                          <rect x="66" y="8" width="26" height="26" fill="none" stroke="currentColor" stroke-width="6"/>
                          <rect x="73" y="15" width="12" height="12"/>
                          <rect x="8" y="66" width="26" height="26" fill="none" stroke="currentColor" stroke-width="6"/>
                          <rect x="15" y="73" width="12" height="12"/>
                          <rect x="42" y="10" width="6" height="6"/><rect x="52" y="10" width="6" height="12"/>
                          <rect x="42" y="24" width="10" height="6"/><rect x="40" y="38" width="18" height="6"/>
                          <rect x="12" y="42" width="14" height="6"/><rect x="30" y="48" width="8" height="12"/>
                          <rect x="46" y="48" width="12" height="8"/><rect x="64" y="42" width="10" height="14"/>
                        </svg>
                      </div>
                    ` : ''}
                    <div class="${mobile ? 'col-span-1' : 'sm:col-span-8'} space-y-2">
                      <label class="block text-xs font-bold text-ds-textMain">Pix copia e cola</label>
                      <input type="text" readonly value="${pixCodeString}" class="w-full px-3 py-2 rounded-lg border border-ds-borderStrong bg-white font-mono text-[11px] text-ds-textSecondary select-all" />
                      <div class="flex flex-wrap items-center gap-2">
                        <button type="button" onclick="navigator.clipboard?.writeText('${pixCodeString}'); showToast('Código PIX copiado!')" class="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-ds-textMain hover:bg-black text-white font-display font-bold text-xs inline-flex items-center justify-center gap-1.5 transition">
                          <i class="uil uil-copy"></i>
                          <span>copiar código Pix</span>
                        </button>
                        <button type="button" onclick="confirmPixPaymentPaid()" class="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-display font-bold text-xs inline-flex items-center justify-center gap-1 transition">
                          <i class="uil uil-check-circle"></i>
                          <span>já paguei o Pix</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ` : `
                <div class="rounded-[14px] border border-ds-borderStrong bg-white p-3.5 text-xs text-ds-textSecondary leading-relaxed">
                  Ao clicar em <strong class="text-ds-textMain">ativar minha campanha</strong>, geraremos ${mobile ? 'o código Pix Copia e Cola' : 'o QR Code e o código Pix Copia e Cola'} com validade de 15 minutos.
                </div>
              `}
            </div>
          ` : ''}
        </div>

        <!-- OPÇÃO 3: BOLETO BANCÁRIO -->
        <div class="space-y-2.5">
          <button
            type="button"
            onclick="setPaymentMethod('boleto')"
            class="w-full ${mobile ? 'p-3.5' : 'p-4'} rounded-[14px] border text-left flex items-center justify-between gap-2.5 transition ${
              state.paymentMethod === 'boleto'
                ? 'border-2 border-primary bg-white shadow-xs'
                : 'border-ds-borderStrong bg-ds-surface/40 hover:bg-white'
            }"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                state.paymentMethod === 'boleto' ? 'border-primary' : 'border-ds-textMuted'
              }">
                ${state.paymentMethod === 'boleto' ? '<span class="w-2.5 h-2.5 rounded-full bg-primary"></span>' : ''}
              </span>
              <div class="min-w-0">
                <div class="font-display font-bold text-sm sm:text-base text-ds-textMain">Boleto bancário</div>
                <div class="text-xs text-ds-textSecondary">Compensação em até 2 dias úteis</div>
              </div>
            </div>
            ${state.paymentMethod === 'boleto' ? `
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-light text-primary shrink-0">
                ${state.boletoGenerated ? 'Boleto gerado' : 'Selecionado'}
              </span>
            ` : ''}
          </button>

          ${state.paymentMethod === 'boleto' ? `
            <div id="generatedBoletoSection" class="${mobile ? 'ml-3 pl-3' : 'ml-4 pl-4'} border-l-2 border-dashed border-amber-400/90">
              ${state.boletoGenerated ? `
                <div class="rounded-[14px] border-2 border-primary/40 bg-ds-surface p-3.5 space-y-3 shadow-sm">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <i class="uil uil-bill text-xs"></i> Boleto gerado · Aguardando pagamento
                      </span>
                      <h4 class="font-display font-bold text-sm text-ds-textMain mt-0.5">Linha digitável do Boleto</h4>
                    </div>
                    <span class="text-xs text-ds-textSecondary">Compensação em até 2 dias úteis</span>
                  </div>
                  <div class="p-2.5 bg-white rounded-lg border border-ds-borderStrong font-mono text-[11px] font-bold text-ds-textMain text-center select-all break-all">
                    ${boletoLineString}
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <button type="button" onclick="navigator.clipboard?.writeText('${boletoLineString}'); showToast('Linha digitável copiada!')" class="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-ds-textMain hover:bg-black text-white font-display font-bold text-xs inline-flex items-center justify-center gap-1.5 transition">
                      <i class="uil uil-copy"></i>
                      <span>copiar código do boleto</span>
                    </button>
                    <button type="button" onclick="confirmPixPaymentPaid()" class="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-display font-bold text-xs inline-flex items-center justify-center gap-1 transition">
                      <i class="uil uil-check-circle"></i>
                      <span>já paguei o boleto</span>
                    </button>
                  </div>
                </div>
              ` : `
                <div class="rounded-[14px] border border-ds-borderStrong bg-white p-3.5 text-xs text-ds-textSecondary leading-relaxed">
                  O boleto será emitido em nome de <strong class="text-ds-textMain">${state.billingCompany}</strong>. Você já pode adiantar os criativos enquanto aguarda a compensação.
                </div>
              `}
            </div>
          ` : ''}
        </div>

      </div>
    </div>
  `;

  // Bloco de Cupom no Resumo
  const paymentCouponBlockHtml = state.simulateCoupon ? `
    <div class="flex items-center justify-between gap-2 text-xs">
      <div class="inline-flex items-center gap-1.5 min-w-0">
        <i class="uil uil-ticket text-primary text-sm shrink-0"></i>
        <span class="text-ds-textSecondary truncate">Cupom <strong class="text-ds-textMain">${state.couponCode || 'AQUIADS10'}</strong></span>
        <button onclick="toggleCouponSimulation(false)" class="text-[11px] text-ds-textMuted hover:text-rose-700 underline shrink-0 ml-1">
          remover
        </button>
      </div>
      <span class="font-display font-bold text-emerald-700 whitespace-nowrap">- ${fmtBRL(f.couponDiscount)}</span>
    </div>
  ` : `
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2 text-xs">
        <span class="inline-flex items-center gap-1.5 text-ds-textSecondary font-medium">
          <i class="uil uil-ticket text-primary text-sm"></i>
          <span>Tem um cupom?</span>
        </span>
        <button onclick="toggleCouponDrawer()" class="font-display font-bold text-primary hover:underline transition whitespace-nowrap">
          ${state.couponDrawerOpen ? 'cancelar' : '+ digitar cupom'}
        </button>
      </div>

      ${state.couponDrawerOpen ? `
        <div class="flex items-center gap-2">
          <input id="inlineCouponInput" type="text" value="${state.couponCode || 'AQUIADS10'}" oninput="state.couponCode = this.value.toUpperCase()" placeholder="Código do cupom" class="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-ds-borderStrong bg-ds-surface text-xs font-bold uppercase focus:bg-white focus:border-primary focus:outline-none" />
          <button onclick="toggleCouponSimulation(true)" class="px-3.5 py-1.5 rounded-lg bg-primary text-white font-display font-bold text-xs shrink-0">
            aplicar
          </button>
        </div>
      ` : ''}
    </div>
  `;

  // ==========================================================================
  // COLUNA DIREITA: RESUMO DA CAMPANHA — HIERARQUIA VISUAL LIMPA
  // ==========================================================================
  const isAwaitingGeneratedPayment =
    (state.paymentMethod === 'pix' && state.pixGenerated) ||
    (state.paymentMethod === 'boleto' && state.boletoGenerated);
  const canActivateCampaign = Boolean(state.paymentMethod) && !isAwaitingGeneratedPayment;

  const rightSummaryColumnHtml = `
    <div class="bg-white rounded-[18px] border border-ds-borderStrong ${mobile ? 'p-4 space-y-4' : 'p-6 space-y-4'} shadow-aqui-card">
      
      <div class="space-y-4">
        <!-- Bloco 1: Cabeçalho + Verticais -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <div>
              <h3 class="font-display font-bold ${mobile ? 'text-base' : 'text-lg'} text-ds-textMain">Resumo da campanha</h3>
              <p class="text-[11px] sm:text-xs text-ds-textSecondary">${m.startDate} a ${m.endDate} (${m.durationDays} dias)</p>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-ds-bg border border-ds-borderStrong font-display font-bold text-xs text-ds-textSecondary shrink-0">
              #${displayProposalId}
            </span>
          </div>

          <!-- Verticais do checkout online -->
          <div class="pt-1 space-y-1 text-xs">
            ${verticalSummaryRows.join('')}
          </div>
        </div>

        <!-- Bloco 2: Faturamento -->
        <div class="text-xs">
          <div class="flex items-center justify-between gap-2">
            <span class="text-ds-textSecondary">Faturamento</span>
            <button onclick="toggleBillingDrawer()" class="text-primary font-bold hover:underline inline-flex items-center gap-1">
              <i class="uil uil-pen"></i>
              <span>${state.billingDrawerOpen ? 'fechar' : needsBillingWarning ? 'informar CNPJ' : 'alterar'}</span>
            </button>
          </div>
          ${needsBillingWarning && !state.billingDrawerOpen ? `
            <div class="mt-1.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <strong>Informe o CNPJ/CPF</strong> para emissão da nota fiscal.
            </div>
          ` : !state.billingDrawerOpen ? `
            <div class="mt-0.5 font-semibold text-ds-textMain truncate">${state.billingCompany}</div>
            <div class="text-[11px] text-ds-textMuted">CNPJ ${state.billingDoc}</div>
          ` : ''}

          ${state.billingDrawerOpen ? `
            <div class="mt-2 p-3 rounded-xl bg-ds-bg border border-ds-borderStrong space-y-2">
              <input id="inputBillingDoc" type="text" value="${state.billingDoc}" placeholder="CNPJ ou CPF" class="w-full px-3 py-1.5 rounded-lg border border-ds-borderStrong bg-white text-xs font-semibold" />
              <input id="inputBillingCompany" type="text" value="${state.billingCompany}" placeholder="Razão Social" class="w-full px-3 py-1.5 rounded-lg border border-ds-borderStrong bg-white text-xs font-semibold" />
              <button onclick="saveInlineBilling()" class="w-full py-1.5 rounded-lg bg-primary text-white font-display font-bold text-xs">
                Salvar faturamento
              </button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Bloco 3: Cupom + Fechamento de Checkout com Ponto Focal Único -->
      <div class="space-y-3.5">
        ${paymentCouponBlockHtml}

        <!-- 4.1 Protagonista: Total a pagar agora -->
        <div class="p-3.5 rounded-2xl bg-ds-surface/70 border border-ds-border space-y-1">
          <div class="text-xs font-semibold text-ds-textSecondary">
            Total a pagar agora <span class="text-ds-textMuted font-normal">(${onlineChannelsLabel})</span>
          </div>

          <div class="pt-0.5">
            ${hasDiscounts ? `
              <div class="text-xs text-ds-textMuted line-through leading-tight">
                ${fmtBRL(f.onlinePayableNow + f.totalDiscounts)}
              </div>
            ` : ''}
            <div class="font-display font-extrabold ${mobile ? 'text-2xl' : 'text-3xl'} text-aqui-green tracking-tight leading-tight">
              ${fmtBRL(f.onlinePayableNow)}
            </div>
          </div>

          <div class="text-xs text-ds-textSecondary pt-0.5">
            ${state.paymentMethod === 'card'
              ? `Em <strong class="text-ds-textMain font-semibold">${state.selectedInstallments}x de ${fmtBRL(f.onlinePayableNow / state.selectedInstallments)}</strong> sem juros no cartão`
              : state.paymentMethod === 'pix' || state.paymentMethod === 'boleto'
              ? `À vista no ${state.paymentMethod === 'pix' ? 'Pix' : 'Boleto'} <span class="text-ds-textMuted">· ou em até 6x de ${fmtBRL(f.onlinePayableNow / 6)} no cartão</span>`
              : `Em até <strong class="text-ds-textMain font-semibold">6x de ${fmtBRL(f.onlinePayableNow / 6)}</strong> sem juros no cartão, Pix ou Boleto`
            }
          </div>
        </div>

        <!-- 4.2 Ação Primária Única + Selo de Segurança Abaixo + Link Secundário Discreto -->
        <div class="space-y-2.5">
          <button
            id="activateCampaignBtn"
            type="button"
            onclick="${canActivateCampaign ? 'submitPaymentOrder()' : ''}"
            ${!canActivateCampaign ? 'disabled' : ''}
            aria-disabled="${!canActivateCampaign}"
            class="w-full py-3.5 px-5 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition ${
              canActivateCampaign
                ? 'bg-aqui-grad hover:opacity-95 text-white shadow-aqui-cta cursor-pointer'
                : 'bg-[#EFEFEF] text-[#9CA3AF] border border-[#E5E7EB] shadow-none cursor-not-allowed'
            }"
          >
            ${isAwaitingGeneratedPayment ? `
              <i class="uil uil-clock text-base"></i>
              <span>aguardando pagamento</span>
            ` : `
              <span>ativar minha campanha</span>
              <i class="uil uil-arrow-right text-base"></i>
            `}
          </button>

          <div class="flex items-center justify-center gap-1.5 text-[11px] text-ds-textSecondary select-none cursor-default">
            <i class="uil uil-padlock text-xs text-ds-textMuted"></i>
            <span>Ambiente 100% criptografado · Homologado pela</span>
            <span class="font-display font-extrabold text-xs text-[#00A868] tracking-tight">stone</span>
          </div>

          <div class="pt-1 text-center">
            <button type="button" onclick="switchMainTab('plano')" class="inline-flex items-center justify-center gap-1 text-xs font-display font-semibold text-ds-textSecondary hover:text-primary transition">
              <i class="uil uil-arrow-left text-sm"></i>
              <span>voltar para a revisão da campanha</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `;

  document.getElementById('tabContent-pagamento').innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 ${mobile ? 'gap-4' : 'gap-6'} items-start sim-grid-1">
      <div class="lg:col-span-7 flex flex-col gap-4">
        ${leftPaymentColumnHtml}
        ${!mobile ? radioDedicatedCardHtml : ''}
      </div>
      <div class="lg:col-span-5 flex flex-col gap-4">
        ${rightSummaryColumnHtml}
        ${mobile ? radioDedicatedCardHtml : ''}
      </div>
    </div>
  `;
  syncMobileHoverElimination();
}

function setCardMode(mode) {
  if (state.orderSubmitted) return;
  state.cardMode = mode;
  renderPaymentTab(getCurrentModel());
}

function setInstallments(val) {
  if (state.orderSubmitted) return;
  state.selectedInstallments = Number(val) || 6;
  renderPaymentTab(getCurrentModel());
}

function toggleCouponDrawer() {
  if (state.orderSubmitted) return;
  state.couponDrawerOpen = !state.couponDrawerOpen;
  renderPaymentTab(getCurrentModel());
}

function toggleCouponSimulation(enable) {
  if (state.orderSubmitted) {
    showToast('Não é possível alterar cupons após o pagamento ter sido confirmado.');
    return;
  }
  state.simulateCoupon = enable;
  state.couponDrawerOpen = false;
  const chk = document.getElementById('toggleCoupon');
  if (chk) chk.checked = enable;
  renderAll();
  showToast(enable ? 'Cupom AQUIADS10 (-10% em OOH) aplicado!' : 'Cupom removido');
}

function toggleBillingDrawer() {
  if (state.orderSubmitted) return;
  state.billingDrawerOpen = !state.billingDrawerOpen;
  renderPaymentTab(getCurrentModel());
}

function saveInlineBilling() {
  if (state.orderSubmitted) return;
  const docEl = document.getElementById('inputBillingDoc');
  const compEl = document.getElementById('inputBillingCompany');
  if (docEl && docEl.value.trim()) state.billingDoc = docEl.value.trim();
  if (compEl && compEl.value.trim()) state.billingCompany = compEl.value.trim();
  state.billingUnlockedInline = true;
  state.billingDrawerOpen = false;
  renderPaymentTab(getCurrentModel());
  showToast('Dados de faturamento atualizados com sucesso!');
}

function submitPaymentOrder() {
  if (!state.paymentMethod) {
    showToast('Escolha uma forma de pagamento para ativar sua campanha.');
    return;
  }
  if ((state.paymentMethod === 'pix' && state.pixGenerated) || (state.paymentMethod === 'boleto' && state.boletoGenerated)) {
    return;
  }

  if (state.simulateUnlogged && !state.billingUnlockedInline) {
    state.billingDrawerOpen = true;
    renderPaymentTab(getCurrentModel());
    showToast('Informe o CNPJ ou CPF de faturamento no Resumo para concluir.');
    return;
  }

  // Se for PIX, gera o código (e QR Code no desktop) e sobe a tela suavemente até a seção do Pix gerado (#generatedPixSection)
  if (state.paymentMethod === 'pix') {
    state.pixGenerated = true;
    renderPaymentTab(getCurrentModel());
    setTimeout(() => {
      const pixEl = document.getElementById('generatedPixSection');
      if (pixEl) {
        pixEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
    showToast(isMobileView() ? 'Código Pix Copia e Cola gerado! Copie o código para pagar.' : 'QR Code Pix gerado! Escaneie ou copie o código para pagar.');
    return;
  }

  // Se for Boleto, gera a linha digitável e sobe até a seção do Boleto gerado
  if (state.paymentMethod === 'boleto') {
    state.boletoGenerated = true;
    renderPaymentTab(getCurrentModel());
    setTimeout(() => {
      const bolEl = document.getElementById('generatedBoletoSection');
      if (bolEl) {
        bolEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
    showToast('Boleto gerado com sucesso!');
    return;
  }

  // Cartão de crédito aprova imediatamente e reduz a seção para o status "Campanha ativa"
  setProposalStatus('processing');
  setTimeout(() => {
    const topEl = document.getElementById('paymentStatusTopAnchor') || document.getElementById('tabContent-pagamento');
    if (topEl) {
      topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 60);
  showToast('Pagamento aprovado! Sua campanha está ativa.');
}

function confirmPixPaymentPaid() {
  setProposalStatus('processing');
  setTimeout(() => {
    const topEl = document.getElementById('paymentStatusTopAnchor') || document.getElementById('tabContent-pagamento');
    if (topEl) {
      topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 60);
  showToast('Pagamento confirmado! Sua campanha está ativa.');
}

function reopenPaymentSelection() {
  showToast('Após confirmar o pagamento, não é possível alterar a forma de pagamento.');
}

function goToAdDetailingStep(proposalId, context = 'criativos') {
  const id = proposalId || getDisplayProposalId(getCurrentModel());
  const route = `/campanhas/${id}/detalhamento-anuncio`;
  if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
    window.history.replaceState({ step: 'detalhamento-anuncio', action: context, proposalId: id }, '', `#${route}`);
  }
  if (context === 'renovar') {
    showToast(`Redirecionando para Detalhamento do anúncio para renovar a campanha (${route})`);
  } else {
    showToast(`Redirecionando para Detalhamento do anúncio (${route})`);
  }
}

function requestRadioBilling() {
  const m = getCurrentModel();
  const displayProposalId = getDisplayProposalId(m);
  state.radioOrderRequested = true;
  state.hubspotRadioOrder = {
    source: 'hubspot',
    pipeline: 'radio_cbn_checkout_dedicado',
    proposalId: displayProposalId,
    company: state.billingCompany,
    document: state.billingDoc,
    amount: m.financials.radioNet,
    itemsCount: m.counts.radioCount,
    createdAt: new Date().toISOString()
  };
  if (typeof window !== 'undefined') {
    window.lastHubspotRadioOrder = state.hubspotRadioOrder;
  }
  renderPaymentTab(m);
  showToast('Faturamento solicitado! Pedido de Rádio CBN criado no HubSpot.');
}

/**
 * ============================================================================
 * 6.1 SEÇÃO "TIRE SUAS DÚVIDAS" (ACORDEÃO FAQ DO FIGMA 3387-12075)
 * ============================================================================
 */
function renderFaqSection() {
  const faqs = [
    {
      q: 'Por que o valor de Rádio CBN é faturado separadamente do checkout online?',
      a: 'Os ativos de OOH (Eletromidia) e Digital/Impresso (Portais Globo, Globoplay e Editora Globo) possuem reserva e liquidação online imediata via Stone (Cartão em até 6x sem juros, PIX ou Boleto). Já as inserções em Rádio CBN passam por confirmação de grade horária por praça e seguem faturamento dedicado sem travar a ativação imediata do restante da sua campanha.'
    },
    {
      q: 'Quando e como envio as artes e vídeos da minha campanha?',
      a: 'Logo após a confirmação do pedido, a etapa "Envio de criativos" é liberada no painel. Você pode consultar todas as dimensões, formatos (MP4, JPG, PNG ou Spot 30s) e limites de peso na aba "Especificações de arte" desta proposta antes mesmo de efetuar o pagamento.'
    },
    {
      q: 'Como funciona o Desconto Condômino e o uso de cupons promocionais?',
      a: 'Pontos comerciais onde sua empresa já é condômina recebem desconto direto destacado no próprio card do edifício. Caso você também possua um cupom promocional de OOH, a plataforma aplica automaticamente a regra de maior vantagem para o seu bolso, sem acumular dois descontos sobre o mesmo ponto.'
    },
    {
      q: 'Posso compartilhar esta proposta com meu sócio ou financeiro antes de pagar?',
      a: 'Sim! Basta clicar em "Compartilhar link" no topo da página ou exportar o resumo em PDF/CSV. Quem abrir o link compartilhado visualizará todos os ativos, mapas e valores, podendo preencher os dados de CNPJ no próprio Resumo da Campanha na hora de finalizar.'
    }
  ];

  const container = document.getElementById('faqSection');
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-[20px] border border-ds-border shadow-aqui-card px-6 sm:px-10 py-8 sm:py-12">
      <div class="max-w-[960px] mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-12 sim-stack-mobile">
        <div class="shrink-0">
          <h2 class="font-display font-medium text-2xl sm:text-[32px] grad-text leading-tight">
            Perguntas frequentes
          </h2>
        </div>

        <div class="flex-1 w-full border-b border-[#EAEAEA] divide-y divide-[#EAEAEA]">
          ${faqs.map((item, idx) => {
            const isOpen = state.openFaqIndex === idx;
            return `
              <div>
                <button type="button" onclick="toggleFaqItem(${idx})" class="w-full ${idx === 0 ? 'pt-0.5 pb-4' : 'py-4'} text-left flex items-center justify-between gap-4 group">
                  <span class="font-display font-semibold text-sm sm:text-[15px] text-ds-textMain group-hover:text-primary transition">${item.q}</span>
                  <span class="w-7 h-7 rounded-full ${isOpen ? 'bg-aqui-grad text-white' : 'bg-[#F9FAFB] border border-[#EAEAEA] text-ds-textSecondary group-hover:border-primary group-hover:text-primary'} flex items-center justify-center shrink-0 transition">
                    <i class="uil ${isOpen ? 'uil-times' : 'uil-plus'} text-sm leading-none"></i>
                  </span>
                </button>
                ${isOpen ? `
                  <div class="pb-4 pr-10 text-xs sm:text-[13px] text-ds-textSecondary leading-relaxed">
                    ${item.a}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
  syncMobileHoverElimination();
}

function toggleFaqItem(idx) {
  state.openFaqIndex = state.openFaqIndex === idx ? -1 : idx;
  renderFaqSection();
}

/**
 * 7. MAPA LEAFLET (Esri World Topo Map) — Reflexo direto dos Cards Laterais e sincronizado com a lista
 */
function buildOohMapPinPopupHtml(g, m) {
  const isStaticOoh = Boolean(g.isStatic || g.periodInsertions === 0);
  const categoryLabel = g.vertical || 'Elevadores Comerciais';
  const humanAddr = formatHumanAddress(g.address, g.district);
  const cardTitle = g.kind === 'condo_group' ? `Coletânea ${g.name}` : g.name;
  const subtitleText = `${categoryLabel} • ${humanAddr}`;
  const safeTooltip = `${cardTitle} — ${subtitleText}`.replace(/"/g, '&quot;');
  const screensBadgeText = isStaticOoh
    ? '1 face'
    : `${g.screens} ${g.screens > 1 ? 'telas' : 'tela'}`;

  // Mesmo padrão exato de tag dos cards laterais (IMPRESSO roxo #F3E8FF/#6D28D9 | DIGITAL azul #EBF3FE/#1D4ED8)
  const badgeStyle = isStaticOoh
    ? 'background:#F3E8FF;color:#6D28D9;border:1px solid #DDD6FE;'
    : 'background:#EBF3FE;color:#1D4ED8;border:1px solid #BFDBFE;';

  return `
    <div style="padding:15px 17px;font-family:'Atkinson Hyperlegible','Rethink Sans',sans-serif;">
      <!-- Topo do Card do Mapa (Espelha exatamente as tags do Card Lateral, com espaço livre para o botão ×) -->
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding-right:26px;">
        <span style="display:inline-flex;align-items:center;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;${badgeStyle}">
          ${isStaticOoh ? 'IMPRESSO' : 'DIGITAL'}
        </span>
        <span style="font-family:monospace;font-size:11px;font-weight:600;color:#56514B;">
          ID: #${g.displayCode}
        </span>
        ${g.kind === 'condo_group' ? `
          <span style="padding:2px 6px;border-radius:5px;font-size:10px;font-weight:600;background:#F3ECE4;color:#56514B;">
            ${g.towersCount} torres
          </span>
        ` : ''}
      </div>

      <!-- Identificação Enxuta do Ativo (Título e Endereço colapsados em 1 linha cada para manter leveza visual) -->
      <div style="margin-top:9px;min-width:0;" title="${safeTooltip}">
        <div style="font-family:'Rethink Sans',sans-serif;font-weight:700;font-size:14px;color:#121212;line-height:1.3;letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${cardTitle}
        </div>
        <div style="font-size:12px;color:#56514B;line-height:1.4;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${subtitleText}
        </div>
      </div>

      <!-- Linha Divisória do Design System -->
      <div style="margin:11px 0;border-top:1px solid #ECE6DF;"></div>

      <!-- Rodapé Enxuto (Preço + Quantidade de telas) -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div style="display:flex;align-items:baseline;gap:4px;">
          <span style="font-family:'Rethink Sans',sans-serif;font-weight:800;font-size:15px;color:#121212;line-height:1;">
            ${fmtBRL(g.netPrice)}
          </span>
          <span style="font-size:11px;font-weight:400;color:#56514B;">
            / ${m.durationDays} dias
          </span>
        </div>
        <span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;background:#F3ECE4;color:#56514B;font-size:11px;font-weight:600;white-space:nowrap;">
          ${screensBadgeText}
        </span>
      </div>
    </div>
  `;
}

function highlightCardFromMap(code) {
  if (!code || isMobileView()) return;
  const scrollBox = document.getElementById('mediaPlanScrollBox');
  const cardEl = document.querySelector(`[data-ooh-card="${code}"]`);
  if (!cardEl) return;

  if (scrollBox) {
    const boxRect = scrollBox.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();
    const offset = cardRect.top - boxRect.top + scrollBox.scrollTop - 16;
    scrollBox.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  } else {
    cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  document.querySelectorAll('.map-synced-card-highlight').forEach((el) => {
    el.classList.remove('map-synced-card-highlight');
  });
  void cardEl.offsetWidth;
  cardEl.classList.add('map-synced-card-highlight');
}

let oohChannelResizeObserver = null;

function syncOohMapCardHeight() {
  if (isMobileView() || state.channelFilter !== 'ooh') return;
  const leftBox = document.getElementById('oohChannelCardBox');
  const mapCardBox = document.getElementById('oohMapCardBox');
  const mapHeader = document.getElementById('oohMapCardHeader');
  const mapEl = document.getElementById('oohLeafletMap');
  if (!leftBox || !mapCardBox || !mapEl) return;

  const applySync = () => {
    const leftHeight = leftBox.offsetHeight;
    if (!leftHeight || leftHeight < 200) return;
    const headerHeight = mapHeader ? mapHeader.offsetHeight : 64;
    const targetMapHeight = Math.max(260, leftHeight - headerHeight - 2);
    mapCardBox.style.height = `${leftHeight}px`;
    mapEl.style.height = `${targetMapHeight}px`;
    if (desktopMap) {
      desktopMap.invalidateSize();
    }
  };

  applySync();
  requestAnimationFrame(applySync);

  if (typeof ResizeObserver !== 'undefined') {
    if (oohChannelResizeObserver) {
      oohChannelResizeObserver.disconnect();
    }
    oohChannelResizeObserver = new ResizeObserver(() => {
      applySync();
    });
    oohChannelResizeObserver.observe(leftBox);
  }
}

window.addEventListener('resize', () => {
  syncOohMapCardHeight();
});

function updateLeafletMap(m) {
  const mapEl = document.getElementById('oohLeafletMap');
  if (!mapEl || m.oohDisplayGroups.length === 0 || state.channelFilter !== 'ooh') return;

  syncOohMapCardHeight();

  if (!desktopMap) {
    desktopMap = L.map('oohLeafletMap', { scrollWheelZoom: false }).setView([-23.565, -46.69], 12);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '&copy; Esri & OpenStreetMap'
    }).addTo(desktopMap);
  }

  desktopMarkers.forEach((mk) => desktopMap.removeLayer(mk));
  desktopMarkers = [];

  const q = state.searchQuery.trim().toLowerCase();
  const matchSearch = (str) => !q || String(str || '').toLowerCase().includes(q);

  const visibleGroups = m.oohDisplayGroups.filter((g) => {
    const exhLabel = (g.isStatic || g.periodInsertions === 0) ? 'Impresso' : 'Digital';
    const okSearch = matchSearch(`${g.name} ${g.code} ${g.displayCode} ${g.searchCodes} ${g.address} ${g.district} ${g.zone} ${g.socialClass} ${g.city} ${g.vertical} ${exhLabel}`);
    const okCat = !state.ambienteFilter || g.vertical === state.ambienteFilter;
    const okExh = !state.categoriaFilter || exhLabel === state.categoriaFilter;
    const okGeo = matchOohGeoFilter(g, state.geoFilter);
    return okSearch && okCat && okExh && okGeo;
  });

  const bounds = [];
  visibleGroups.forEach((g, idx) => {
    if (!g.latitude || !g.longitude) return;
    bounds.push([g.latitude, g.longitude]);

    const isSelectedForBulk = !!state.selectedForRemoval[g.code];
    const bgColor = isSelectedForBulk
      ? '#F15A22'
      : g.kind === 'condo_group'
      ? '#047857'
      : '#199958';
    const label = g.kind === 'condo_group' ? `${g.towersCount}T` : `${idx + 1}`;

    const icon = L.divIcon({
      className: '',
      html: `<div class="custom-pin" style="width:28px;height:28px;background:${bgColor};">${label}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });

    const marker = L.marker([g.latitude, g.longitude], { icon }).addTo(desktopMap);
    marker.bindPopup(buildOohMapPinPopupHtml(g, m), {
      className: 'aqui-map-popup',
      closeButton: true,
      maxWidth: 280,
      minWidth: 260
    });
    marker.on('click', () => {
      highlightCardFromMap(g.code);
    });
    desktopMarkers.push(marker);
  });

  if (bounds.length > 0) {
    desktopMap.invalidateSize();
    desktopMap.fitBounds(bounds, { padding: [35, 35], maxZoom: 15 });
  }
}

function resetMapBounds() {
  if (isMobileView() && state.mobileOohView === 'map') {
    updateMobileInlineMap(getCurrentModel());
    return;
  }
  updateLeafletMap(getCurrentModel());
}

function setMobileOohView(viewMode) {
  if (viewMode === 'map' && state.mobileOohView !== 'map') {
    const scrollBox = document.getElementById('mediaPlanScrollBox');
    if (scrollBox) {
      state.mobileOohSavedScrollTop = scrollBox.scrollTop;
    }
  }
  if (viewMode === 'list') {
    state.mobileOohView = 'list';
    renderMediaPlanList(getCurrentModel(), true);
    return;
  }
  state.mobileOohView = 'map';
  renderMediaPlanList(getCurrentModel(), false);
}

function resetMobileInlineMapBounds() {
  state.mobileOohFocusedPin = null;
  renderMediaPlanList(getCurrentModel(), false);
}

function focusMapPin(lat, lng, title, address, price, category) {
  if (isMobileView()) {
    const scrollBox = document.getElementById('mediaPlanScrollBox');
    if (scrollBox) {
      state.mobileOohSavedScrollTop = scrollBox.scrollTop;
    }
    state.mobileOohFocusedPin = {
      lat,
      lng,
      title: title || 'Ponto OOH',
      address: address || '',
      price: price || '',
      category: category || 'OOH'
    };
    state.mobileOohView = 'map';
    renderMediaPlanList(getCurrentModel(), false);
    return;
  }
  if (desktopMap && lat && lng) {
    desktopMap.setView([lat, lng], 16, { animate: true });
    desktopMarkers.forEach((mk) => {
      const pos = mk.getLatLng && mk.getLatLng();
      if (pos && Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001) {
        mk.openPopup();
      }
    });
    showToast(`Localizando no mapa: ${title}`);
  }
}

function updateMobileInlineMap(m) {
  const mapEl = document.getElementById('mobileInlineLeafletMap');
  if (!mapEl || !m || m.oohDisplayGroups.length === 0) return;

  if (mobileInlineMap && mobileInlineMap.getContainer() !== mapEl) {
    mobileInlineMap.remove();
    mobileInlineMap = null;
  }

  if (!mobileInlineMap) {
    mobileInlineMap = L.map('mobileInlineLeafletMap', { scrollWheelZoom: false }).setView([-23.565, -46.69], 12);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '&copy; Esri & OpenStreetMap'
    }).addTo(mobileInlineMap);
  }

  mobileInlineMarkers.forEach((mk) => mobileInlineMap.removeLayer(mk));
  mobileInlineMarkers = [];

  const q = state.searchQuery.trim().toLowerCase();
  const matchSearch = (str) => !q || String(str || '').toLowerCase().includes(q);

  const visibleGroups = m.oohDisplayGroups.filter((g) => {
    const exhLabel = (g.isStatic || g.periodInsertions === 0) ? 'Impresso' : 'Digital';
    const okSearch = matchSearch(`${g.name} ${g.code} ${g.displayCode} ${g.searchCodes} ${g.address} ${g.district} ${g.zone} ${g.socialClass} ${g.city} ${g.vertical} ${exhLabel}`);
    const okCat = !state.ambienteFilter || g.vertical === state.ambienteFilter;
    const okExh = !state.categoriaFilter || exhLabel === state.categoriaFilter;
    const okGeo = matchOohGeoFilter(g, state.geoFilter);
    return okSearch && okCat && okExh && okGeo;
  });

  const bounds = [];
  let focusedMarker = null;
  const fp = state.mobileOohFocusedPin;

  visibleGroups.forEach((g, idx) => {
    if (!g.latitude || !g.longitude) return;
    bounds.push([g.latitude, g.longitude]);

    const isSelectedForBulk = !!state.selectedForRemoval[g.code];
    const bgColor = isSelectedForBulk
      ? '#F15A22'
      : g.kind === 'condo_group'
      ? '#047857'
      : '#199958';
    const label = g.kind === 'condo_group' ? `${g.towersCount}T` : `${idx + 1}`;

    const icon = L.divIcon({
      className: '',
      html: `<div class="custom-pin" style="width:28px;height:28px;background:${bgColor};">${label}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });

    const marker = L.marker([g.latitude, g.longitude], { icon }).addTo(mobileInlineMap);
    marker.bindPopup(buildOohMapPinPopupHtml(g, m), {
      className: 'aqui-map-popup',
      closeButton: true,
      maxWidth: 272,
      minWidth: 250
    });
    mobileInlineMarkers.push(marker);

    if (fp && fp.lat && fp.lng && Math.abs(g.latitude - fp.lat) < 0.0001 && Math.abs(g.longitude - fp.lng) < 0.0001) {
      focusedMarker = marker;
    }
  });

  mobileInlineMap.invalidateSize();
  if (fp && fp.lat && fp.lng) {
    mobileInlineMap.setView([fp.lat, fp.lng], 16, { animate: true });
    if (focusedMarker) {
      setTimeout(() => focusedMarker.openPopup(), 120);
    }
  } else if (bounds.length > 0) {
    mobileInlineMap.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
  }
}

function switchMainTab(tab) {
  state.activeTab = tab;
  ['plano', 'arte', 'pagamento'].forEach((t) => {
    const content = document.getElementById(`tabContent-${t}`);
    if (!content) return;
    if (t === tab) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });
  syncMainTabLabels();
  renderJourneyStepper();
  if (tab === 'plano') {
    setTimeout(() => resetMapBounds(), 60);
  }
}

function goToPaymentAnchor() {
  switchMainTab('pagamento');
  const target = document.getElementById('mainTabsSection');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setViewportMode(mode) {
  state.viewportMode = mode;
  const wrapper = document.getElementById('viewportWrapper');
  const pdfWrapper = document.getElementById('pdfViewportWrapper');
  const btnDesktop = document.getElementById('btnViewDesktop');
  const btnMobile = document.getElementById('btnViewMobile');
  const btnPdf = document.getElementById('btnViewPdf');

  const activeBtnClass = 'px-3 py-1 rounded-md font-bold bg-primary text-white transition flex items-center gap-1';
  const inactiveBtnClass = 'px-3 py-1 rounded-md font-semibold text-ds-textSecondary hover:text-ds-textMain transition flex items-center gap-1';

  if (btnDesktop) btnDesktop.className = mode === 'desktop' ? activeBtnClass : inactiveBtnClass;
  if (btnMobile) btnMobile.className = mode === 'mobile' ? activeBtnClass : inactiveBtnClass;
  if (btnPdf) btnPdf.className = mode === 'pdf' ? activeBtnClass : inactiveBtnClass;

  if (mode === 'pdf') {
    if (wrapper) {
      wrapper.classList.remove('mobile-simulator-wrapper');
      wrapper.classList.add('hidden');
    }
    if (pdfWrapper) {
      pdfWrapper.classList.remove('hidden');
    }
  } else if (mode === 'mobile') {
    if (pdfWrapper) pdfWrapper.classList.add('hidden');
    if (wrapper) {
      wrapper.classList.remove('hidden');
      wrapper.classList.add('mobile-simulator-wrapper');
    }
  } else {
    if (pdfWrapper) pdfWrapper.classList.add('hidden');
    if (wrapper) {
      wrapper.classList.remove('hidden');
      wrapper.classList.remove('mobile-simulator-wrapper');
    }
  }

  renderAll();
  if (mode === 'desktop') {
    setTimeout(() => resetMapBounds(), 80);
  } else if (mode === 'mobile') {
    scrollActiveViewportToTop(false);
  } else if (mode === 'pdf') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function openPdfPreviewAndPrint() {
  const url = new URL(window.location.href);
  url.searchParams.set('mode', 'pdf');
  url.searchParams.set('print', '1');
  url.searchParams.set('scenario', state.scenarioKey || 'completo');
  url.searchParams.set('status', state.proposalStatus || 'awaiting');
  url.searchParams.set('coupon', state.simulateCoupon ? '1' : '0');
  url.searchParams.set('unlogged', state.simulateUnlogged ? '1' : '0');
  const newWin = window.open(url.toString(), '_blank');
  if (!newWin) {
    setViewportMode('pdf');
    setTimeout(() => {
      window.print();
    }, 180);
  }
}

/**
 * ============================================================================
 * 5. PDF COMERCIAL EXECUTIVO (LEVE, EM TABELAS POR CANAL, KV COMPACTO + BIG NUMBERS DISCRETOS)
 * - 1ª dobra enxuta com KV aplicado no gradiente Aqui Ads + logo "Aqui ads" branco + "Proposta Comercial"
 * - 4 Big Numbers discretos integrados na faixa inferior do KV (sem poluir nem gritar)
 * - Logo no 2º scroll: resumo da campanha, resumo financeiro reconciliado, entrega modular por canal
 * - Sem mapa interativo no PDF + disclaimer explícito: "Para ver o ponto no mapa, acesse essa proposta online."
 * - Tabelas leves separadas por canal (OOH & Condomínios, Portais & Globoplay, Revistas & Jornais, Rádio CBN e Especificações de Arte)
 * ============================================================================
 */
function escapeHtml(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPdfDocument(m) {
  const container = document.getElementById('pdfViewportWrapper');
  if (!container) return;

  const f = m.financials;
  const c = m.counts;
  const hasOoh = c.oohGroupsCount > 0;
  const hasPortais = c.portaisCount > 0;
  const hasRevistas = c.revistasCount > 0;
  const hasRadio = c.radioCount > 0;
  const hasDiscounts = f.totalDiscounts > 0;
  const installment6xVal = f.onlinePayableNow / 6;

  const proposalDisplayId = state.clonedScenariosCount > 0
    ? `#${m.id}-C${state.clonedScenariosCount}`
    : `#${m.id}`;

  const statusMetaMap = {
    awaiting: {
      label: 'Aguardando pagamento',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      dotClass: 'bg-amber-500'
    },
    processing: {
      label: 'Campanha ativa',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-500'
    },
    completed: {
      label: 'Campanha concluída',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
      dotClass: 'bg-blue-600'
    }
  };
  const statusMeta = statusMetaMap[state.proposalStatus] || statusMetaMap.awaiting;

  // Lista única de cidades/praças presentes na proposta
  const pracasSet = new Set();
  m.oohDisplayGroups.forEach((g) => {
    if (g.city) pracasSet.add(`${g.city}/${g.state || 'SP'}`);
  });
  m.radioItems.forEach((r) => {
    if (r.city) pracasSet.add(`${r.city}/${r.state || 'SP'}`);
  });
  if (hasPortais || hasRevistas) {
    pracasSet.add('Nacional / Segmentação Digital');
  }
  const pracasList = Array.from(pracasSet).join(' · ') || 'São Paulo/SP';

  const hasBilling = !state.simulateUnlogged || state.billingUnlockedInline;
  const billingCompany = hasBilling
    ? escapeHtml(state.billingCompany || 'Padaria & Confeitaria Bela Paulista LTDA')
    : 'A preencher no link online da proposta';
  const billingCnpj = hasBilling
    ? escapeHtml(state.billingDoc || '12.345.678/0001-99')
    : 'Pendente de identificação no checkout online';

  const onlineProposalUrl = typeof window !== 'undefined' && window.location && window.location.href
    ? window.location.href.split('#')[0]
    : 'https://aquiads.com.br/proposta/' + m.id;

  // Resumo modular por canal (100% nivelado linha a linha + métricas compiladas para tomada de decisão)
  const portaisVehicleNames = Array.from(new Set((m.portaisItems || []).map((it) => it.channelTypeLabel || 'Portais Globo')));
  const portaisVehiclesSummary = portaisVehicleNames.includes('Globoplay') && portaisVehicleNames.includes('Portais Globo')
    ? 'G1, GE, Globoplay +4'
    : portaisVehicleNames.includes('Globoplay')
      ? 'Globoplay Streaming'
      : 'G1, GE, Gshow +3';
  const revistasTitleNames = Array.from(new Set((m.revistasItems || []).map((it) => it.editorialTitle).filter(Boolean)));
  const revistasSummaryLabel = revistasTitleNames.length > 2
    ? `${revistasTitleNames.slice(0, 2).join(', ')} +${revistasTitleNames.length - 2}`
    : (revistasTitleNames.join(', ') || 'Editora Globo');
  const radioCitiesNames = Array.from(new Set((m.radioItems || []).map((it) => it.city).filter(Boolean)));
  const radioCoverageSummary = radioCitiesNames.length > 2
    ? `${radioCitiesNames.slice(0, 2).join(', ')} +${radioCitiesNames.length - 2}`
    : (radioCitiesNames.join(', ') || 'Emissoras CBN');

  const modularCardsHtml = [];
  const activeChannelsCount = (hasOoh ? 1 : 0) + (hasPortais ? 1 : 0) + (hasRevistas ? 1 : 0) + (hasRadio ? 1 : 0);
  const isSingleChannel = activeChannelsCount === 1;
  const oohStaticPts = c.oohStaticPointsCount ?? m.oohDisplayGroups.filter((g) => g.isStatic).reduce((acc, g) => acc + g.towersCount, 0);
  const oohDigitalPts = c.oohDigitalPointsCount ?? Math.max(0, c.oohPointsCount - oohStaticPts);
  const oohStaticScr = c.oohStaticScreensCount ?? m.oohDisplayGroups.filter((g) => g.isStatic).reduce((acc, g) => acc + g.screens, 0);
  const oohDigScr = Math.max(0, (c.oohScreensCount || 0) - oohStaticScr);
  const oohCities = Array.isArray(c.oohCitiesList) && c.oohCitiesList.length > 0 ? c.oohCitiesList : ['São Paulo'];
  const oohCitiesCount = c.oohCitiesCount || oohCities.length;

  if (hasOoh) {
    const oohTotalExhibitionsVal = oohDigitalPts > 0
      ? fmtInt(c.oohTotalInsertions)
      : 'Fixa';

    modularCardsHtml.push(`
      <div class="rounded-xl border border-ds-border overflow-hidden bg-white flex flex-col justify-between pdf-avoid-break">
        <div class="px-3 py-2.5 bg-white">
          <div class="font-display font-bold text-sm text-ds-textMain leading-snug">OOH</div>
          <div class="mt-1.5">
            <div class="font-display font-extrabold text-xl text-primary leading-tight">${fmtInt(c.oohImpacts)}</div>
            <div class="text-[11px] text-ds-textSecondary mt-0.5 leading-normal">Impacto no período</div>
          </div>
        </div>
        <div class="bg-[#F7F4EF] p-1.5 border-t border-ds-border grid grid-cols-5 gap-1.5 flex-1">
          <div class="bg-white rounded-lg px-2 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${fmtInt(c.oohPointsCount)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Pontos</div>
          </div>
          <div class="bg-white rounded-lg px-2 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${fmtInt(c.oohScreensCount)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Telas</div>
          </div>
          <div class="bg-white rounded-lg px-2 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${oohTotalExhibitionsVal}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Exibições</div>
          </div>
          <div class="bg-white rounded-lg px-2 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${fmtInt(c.oohReach || c.oohImpacts)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Alcance</div>
          </div>
          <div class="bg-white rounded-lg px-2 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${fmtFreq(c.oohFrequency || 1.88)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Frequência</div>
          </div>
        </div>
      </div>
    `);
  }

  if (hasPortais) {
    const portaisVehiclesSet = new Set();
    (m.portaisItems || []).forEach((it) => {
      (it.vehicles || []).forEach((v) => {
        const cleanV = v === 'g1' ? 'G1'
          : v === 'ge' ? 'GE'
          : v === 'gshow' ? 'Gshow'
          : v === 'receitas' ? 'Receitas'
          : v === 'cartola' ? 'Cartola'
          : v === 'globo.com' ? 'Globo.com'
          : v === 'globoplay' ? 'Globoplay'
          : v;
        portaisVehiclesSet.add(cleanV);
      });
    });
    const portaisListLabel = Array.from(portaisVehiclesSet).join(', ') || 'Portais Globo e Globoplay';
    const portaisCpms = Array.from(new Set((m.portaisItems || []).map((it) => it.cpm).filter((v) => v > 0)));
    const portaisAvgCpm = c.portaisImpressions > 0 ? (f.portaisNet / (c.portaisImpressions / 1000)) : (portaisCpms[0] || 0);
    const portaisCpmLabel = portaisCpms.length === 1 ? fmtBRL(portaisCpms[0]) : fmtBRL(portaisAvgCpm);

    modularCardsHtml.push(`
      <div class="rounded-xl border border-ds-border overflow-hidden bg-white flex flex-col justify-between pdf-avoid-break">
        <div class="px-3 py-2.5 bg-white">
          <div class="font-display font-bold text-sm text-ds-textMain leading-snug">Portais e Globoplay</div>
          <div class="mt-1.5">
            <div class="font-display font-extrabold text-xl text-primary leading-tight">${fmtInt(c.portaisImpressions)}</div>
            <div class="text-[11px] text-ds-textSecondary mt-0.5 leading-normal">Impressões contratadas</div>
          </div>
        </div>
        <div class="bg-[#F7F4EF] p-1.5 border-t border-ds-border grid grid-cols-2 gap-1.5 flex-1">
          <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${escapeHtml(portaisListLabel)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Portais</div>
          </div>
          <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${portaisCpmLabel}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">CPM</div>
          </div>
        </div>
      </div>
    `);
  }

  if (hasRevistas) {
    const revistasListLabel = revistasTitleNames.join(', ') || 'Editora Globo';
    const revistasCpms = Array.from(new Set((m.revistasItems || []).map((it) => it.cpm).filter((v) => v > 0)));
    const revistasAvgCpm = c.revistasImpressions > 0 ? (f.revistasNet / (c.revistasImpressions / 1000)) : (revistasCpms[0] || 0);
    const revistasCpmLabel = revistasCpms.length === 1 ? fmtBRL(revistasCpms[0]) : fmtBRL(revistasAvgCpm);

    modularCardsHtml.push(`
      <div class="rounded-xl border border-ds-border overflow-hidden bg-white flex flex-col justify-between pdf-avoid-break">
        <div class="px-3 py-2.5 bg-white">
          <div class="font-display font-bold text-sm text-ds-textMain leading-snug">Revistas e Jornais</div>
          <div class="mt-1.5">
            <div class="font-display font-extrabold text-xl text-primary leading-tight">${fmtInt(c.revistasImpressions)}</div>
            <div class="text-[11px] text-ds-textSecondary mt-0.5 leading-normal">Impressões contratadas</div>
          </div>
        </div>
        <div class="bg-[#F7F4EF] p-1.5 border-t border-ds-border grid grid-cols-2 gap-1.5 flex-1">
          <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${escapeHtml(revistasListLabel)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Portais</div>
          </div>
          <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${revistasCpmLabel}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">CPM</div>
          </div>
        </div>
      </div>
    `);
  }

  if (hasRadio) {
    const radioDurationsLabel = Array.from(new Set((m.radioItems || []).map((r) => `Spot de ${r.spotDuration || 30}s`))).join(' · ') || 'Spot de 30s';

    modularCardsHtml.push(`
      <div class="rounded-xl border border-ds-border overflow-hidden bg-white flex flex-col justify-between pdf-avoid-break">
        <div class="px-3 py-2.5 bg-white">
          <div class="font-display font-bold text-sm text-ds-textMain leading-snug">Rádio CBN</div>
          <div class="mt-1.5">
            <div class="font-display font-extrabold text-xl text-primary leading-tight">${fmtInt(c.radioTotalInsertions)}</div>
            <div class="text-[11px] text-ds-textSecondary mt-0.5 leading-normal">Inserções no período</div>
          </div>
        </div>
        <div class="bg-[#F7F4EF] p-1.5 border-t border-ds-border grid grid-cols-3 gap-1.5 flex-1">
          <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${fmtInt(c.radioCount)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Rádio/programa</div>
          </div>
          <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${fmtInt(c.radioWeeklyInsertions)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Inserções/semana</div>
          </div>
          <div class="bg-white rounded-lg px-2.5 py-1.5 border border-ds-border flex flex-col justify-between">
            <div class="font-display font-bold text-ds-textMain text-xs leading-snug">${escapeHtml(radioDurationsLabel)}</div>
            <div class="text-[10px] text-ds-textSecondary mt-0.5">Duração</div>
          </div>
        </div>
      </div>
    `);
  }

  const metricsGridColsClass = modularCardsHtml.length === 1
    ? 'grid-cols-1'
    : 'grid-cols-2';
  const firstRowMetricsCards = modularCardsHtml.slice(0, 2);
  const secondRowMetricsCards = modularCardsHtml.slice(2);
  const hasTwoMetricsRows = secondRowMetricsCards.length > 0;

  // 1. TABELA OOH & CONDOMÍNIOS (Sem cards internos — 100% Tabela com Exibição Diária e Exibições "Fixa" para Mídias Estáticas)
  const oohTableSectionHtml = hasOoh ? `
    <section class="mt-4">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5 pdf-keep-with-next">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-[#199958]"></span>
          <h2 class="font-display font-bold text-sm sm:text-base text-ds-textMain">
            OOH — Telas Digitais e Estáticas
          </h2>
        </div>
        <div class="text-xs font-bold text-ds-textMain">
          Subtotal OOH: <span class="text-primary">${fmtBRL(f.oohNet)}</span>
        </div>
      </div>

      <div class="overflow-hidden border border-ds-border rounded-2xl">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-ds-surface text-ds-textSecondary border-b border-ds-border font-display text-xs">
              <th class="py-2.5 px-2.5 font-bold w-[68px]">Código</th>
              <th class="py-2.5 px-3 font-bold w-[34%]">Ponto / Condomínio e endereço</th>
              <th class="py-2.5 px-2.5 font-bold w-[16%]">Categoria</th>
              <th class="py-2.5 px-2 font-bold text-center">Telas</th>
              <th class="py-2.5 px-2.5 font-bold text-right">Exibições</th>
              <th class="py-2.5 px-2.5 font-bold text-right">Alcance</th>
              <th class="py-2.5 px-2.5 font-bold text-right">Impacto</th>
              <th class="py-2.5 px-3 font-bold text-right">Valor líquido</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-slate-800">
            ${m.oohDisplayGroups.map((g, idx) => {
              const isStatic = Boolean(g.isStatic);
              const exhType = isStatic ? 'Estático' : 'DOOH';
              let towersNote = '';
              if (g.kind === 'condo_group' && g.towers && g.towers.length > 1) {
                const shortTowers = g.towers.map((t) => {
                  let rawName = String(t.name || '').trim();
                  if (g.name && rawName.toLowerCase().startsWith(g.name.toLowerCase())) {
                    rawName = rawName.slice(g.name.length).replace(/^[\s\-–—:·]+/, '').trim();
                  } else if (rawName.includes(' - ')) {
                    rawName = rawName.split(' - ').slice(1).join(' - ').trim();
                  }
                  return escapeHtml(rawName || t.name);
                });
                towersNote = `
                  <div class="mt-1 inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 leading-snug">
                    <span class="font-bold">${g.towersCount} torres:</span>
                    <span>${shortTowers.join(' · ')}</span>
                  </div>
                `;
              }
              const geoMeta = [g.district, g.city ? `${g.city}/${g.state || 'SP'}` : ''].filter(Boolean).join(', ');
              const reachVal = g.reach || 0;
              const impactVal = g.impacts || g.reach || 0;

              return `
                <tr class="${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}">
                  <td class="py-2.5 px-2.5 align-top font-mono font-bold text-[11px] text-slate-700 whitespace-nowrap">
                    <div>#${escapeHtml(g.displayCode || g.code)}</div>
                  </td>
                  <td class="py-2.5 px-3 align-top">
                    <div class="font-bold text-slate-900 leading-snug">${escapeHtml(g.name)}</div>
                    <div class="text-[11px] text-slate-500 leading-snug mt-0.5">${escapeHtml(g.address)}${geoMeta ? ` · ${escapeHtml(geoMeta)}` : ''}</div>
                    ${towersNote}
                  </td>
                  <td class="py-2.5 px-2.5 align-top">
                    <div class="font-semibold text-slate-800 leading-snug">${escapeHtml(g.vertical)}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5 whitespace-nowrap">${exhType} · ${escapeHtml(g.resolution || '1080x1920')}</div>
                  </td>
                  <td class="py-2.5 px-2 align-top text-center font-bold text-slate-800 whitespace-nowrap">${fmtInt(g.screens)}</td>
                  <td class="py-2.5 px-2.5 align-top text-right whitespace-nowrap">
                    <span class="font-semibold text-slate-900">${isStatic ? 'Fixa' : fmtInt(g.periodInsertions)}</span>
                  </td>
                  <td class="py-2.5 px-2.5 align-top text-right text-slate-700 whitespace-nowrap">${reachVal > 0 ? fmtInt(reachVal) : '—'}</td>
                  <td class="py-2.5 px-2.5 align-top text-right text-slate-700 whitespace-nowrap">${impactVal > 0 ? fmtInt(impactVal) : '—'}</td>
                  <td class="py-2.5 px-3 align-top text-right whitespace-nowrap">
                    ${g.residentDiscount > 0 ? `
                      <div class="text-[10px] text-slate-400 line-through leading-none mb-0.5">${fmtBRL(g.originalPrice)}</div>
                      <div class="text-[9.5px] font-semibold text-emerald-700 leading-none mb-0.5">Desc. condo. (-${fmtBRL(g.residentDiscount)})</div>
                    ` : ''}
                    <div class="font-bold text-slate-900">${fmtBRL(g.netPrice)}</div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot class="bg-ds-surface border-t border-ds-borderStrong font-bold text-ds-textMain text-xs">
            ${f.couponDiscount > 0 ? `
              <tr class="bg-emerald-50 text-emerald-900 border-b border-emerald-200">
                <td colspan="7" class="py-2 px-3 text-right font-semibold">
                  Cupom promocional aplicado em OOH (${escapeHtml(state.couponCode || 'AQUIADS10')} · -10% sobre subtotal líquido OOH):
                </td>
                <td class="py-2 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">- ${fmtBRL(f.couponDiscount)}</td>
              </tr>
            ` : ''}
            <tr>
              <td colspan="3" class="py-2.5 px-3">Total OOH</td>
              <td class="py-2.5 px-2 text-center whitespace-nowrap">${fmtInt(c.oohScreensCount)}</td>
              <td class="py-2.5 px-2.5 text-right whitespace-nowrap">${oohDigitalPts > 0 ? fmtInt(c.oohTotalInsertions) : 'Fixa'}</td>
              <td class="py-2.5 px-2.5 text-right whitespace-nowrap">${fmtInt(c.oohReach || c.oohImpacts)}</td>
              <td class="py-2.5 px-2.5 text-right whitespace-nowrap">${fmtInt(c.oohImpacts)}</td>
              <td class="py-2.5 px-3 text-right text-primary whitespace-nowrap">${fmtBRL(f.oohNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  ` : '';

  // 2. TABELA PORTAIS DIGITAIS GLOBO & GLOBOPLAY
  const portaisTableSectionHtml = hasPortais ? `
    <section class="mt-4">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5 pdf-keep-with-next">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-[#F15A22]"></span>
          <h2 class="font-display font-bold text-sm sm:text-base text-ds-textMain">
            Portais e Globoplay — Vídeo e Display
          </h2>
        </div>
        <div class="text-xs font-bold text-ds-textMain">
          Subtotal Portais e Globoplay: <span class="text-primary">${fmtBRL(f.portaisNet)}</span>
        </div>
      </div>

      <div class="overflow-hidden border border-ds-border rounded-2xl">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-ds-surface text-ds-textSecondary border-b border-ds-border font-display text-xs">
              <th class="py-2.5 px-2.5 font-bold w-[68px]">Código</th>
              <th class="py-2.5 px-3 font-bold">Produto / Formato</th>
              <th class="py-2.5 px-2.5 font-bold">Ambiente e veículos</th>
              <th class="py-2.5 px-2.5 font-bold">Especificação</th>
              <th class="py-2.5 px-2.5 font-bold">Abrangência</th>
              <th class="py-2.5 px-2.5 font-bold text-right">Impressões</th>
              <th class="py-2.5 px-2.5 font-bold text-right">CPM</th>
              <th class="py-2.5 px-3 font-bold text-right">Valor líquido</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-slate-800">
            ${m.portaisItems.map((p, idx) => `
              <tr class="${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}">
                <td class="py-2.5 px-2.5 align-top font-mono font-bold text-[11px] text-slate-700 whitespace-nowrap">#${escapeHtml(p.code)}</td>
                <td class="py-2.5 px-3 align-top">
                  <div class="font-bold text-slate-900">${escapeHtml(p.cleanTitle || p.name)}</div>
                  <div class="text-[11px] text-slate-500">${escapeHtml(p.subtitleContext || '')}</div>
                </td>
                <td class="py-2.5 px-2.5 align-top">
                  <div class="font-semibold text-slate-800">${escapeHtml(p.channelTypeLabel || p.vertical)}</div>
                  <div class="text-[10px] text-slate-500 uppercase">${escapeHtml((p.vehicles || []).join(', '))}</div>
                </td>
                <td class="py-2.5 px-2.5 align-top">
                  <span class="font-semibold text-slate-800">${escapeHtml(p.formatTagLabel || p.mediaTypeLabel)}</span>
                  <div class="text-[10px] text-slate-500">${escapeHtml(p.techSpecFooter || '')}</div>
                </td>
                <td class="py-2.5 px-2.5 align-top text-slate-700 whitespace-nowrap">Nacional / Seg.</td>
                <td class="py-2.5 px-2.5 align-top text-right font-semibold text-slate-900 whitespace-nowrap">${fmtInt(p.impressions)}</td>
                <td class="py-2.5 px-2.5 align-top text-right text-slate-600 whitespace-nowrap">${fmtBRL(p.cpm)}</td>
                <td class="py-2.5 px-3 align-top text-right font-bold text-slate-900 whitespace-nowrap">${fmtBRL(p.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot class="bg-ds-surface border-t border-ds-borderStrong font-bold text-ds-textMain text-xs">
            <tr>
              <td colspan="5" class="py-2.5 px-3">Total Portais e Globoplay</td>
              <td class="py-2.5 px-2.5 text-right whitespace-nowrap">${fmtInt(c.portaisImpressions)}</td>
              <td class="py-2.5 px-2.5 text-right">—</td>
              <td class="py-2.5 px-3 text-right text-primary whitespace-nowrap">${fmtBRL(f.portaisNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  ` : '';

  // 3. TABELA REVISTAS E JORNAIS DIGITAIS
  const revistasTableSectionHtml = hasRevistas ? `
    <section class="mt-4">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5 pdf-keep-with-next">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]"></span>
          <h2 class="font-display font-bold text-sm sm:text-base text-ds-textMain">
            Revistas e Jornais — Editora Globo Digital
          </h2>
        </div>
        <div class="text-xs font-bold text-ds-textMain">
          Subtotal Revistas e Jornais: <span class="text-primary">${fmtBRL(f.revistasNet)}</span>
        </div>
      </div>

      <div class="overflow-hidden border border-ds-border rounded-2xl">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-ds-surface text-ds-textSecondary border-b border-ds-border font-display text-xs">
              <th class="py-2.5 px-2.5 font-bold w-[68px]">Código</th>
              <th class="py-2.5 px-3 font-bold">Título editorial</th>
              <th class="py-2.5 px-2.5 font-bold">Formato e dimensão</th>
              <th class="py-2.5 px-2.5 font-bold">Posicionamento</th>
              <th class="py-2.5 px-2.5 font-bold">Abrangência</th>
              <th class="py-2.5 px-2.5 font-bold text-right">Impressões</th>
              <th class="py-2.5 px-2.5 font-bold text-right">CPM</th>
              <th class="py-2.5 px-3 font-bold text-right">Valor líquido</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-slate-800">
            ${m.revistasItems.map((r, idx) => `
              <tr class="${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}">
                <td class="py-2.5 px-2.5 align-top font-mono font-bold text-[11px] text-slate-700 whitespace-nowrap">#${escapeHtml(r.code)}</td>
                <td class="py-2.5 px-3 align-top font-bold text-slate-900">${escapeHtml(r.editorialTitle)}</td>
                <td class="py-2.5 px-2.5 align-top">
                  <div class="font-semibold text-slate-800">Display Editorial Multi-Formato</div>
                  <div class="text-[10px] text-slate-500">970×250, 300×250, 300×600, 320×50 px</div>
                </td>
                <td class="py-2.5 px-2.5 align-top text-slate-700">Capa e Editorias · Web & Mobile</td>
                <td class="py-2.5 px-2.5 align-top text-slate-700 whitespace-nowrap">Nacional / BR</td>
                <td class="py-2.5 px-2.5 align-top text-right font-semibold text-slate-900 whitespace-nowrap">${fmtInt(r.impressions)}</td>
                <td class="py-2.5 px-2.5 align-top text-right text-slate-600 whitespace-nowrap">${fmtBRL(r.cpm)}</td>
                <td class="py-2.5 px-3 align-top text-right font-bold text-slate-900 whitespace-nowrap">${fmtBRL(r.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot class="bg-ds-surface border-t border-ds-borderStrong font-bold text-ds-textMain text-xs">
            <tr>
              <td colspan="5" class="py-2.5 px-3">Total Revistas e Jornais</td>
              <td class="py-2.5 px-2.5 text-right whitespace-nowrap">${fmtInt(c.revistasImpressions)}</td>
              <td class="py-2.5 px-2.5 text-right">—</td>
              <td class="py-2.5 px-3 text-right text-primary whitespace-nowrap">${fmtBRL(f.revistasNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  ` : '';

  // 4. TABELA RÁDIO CBN
  const radioTableSectionHtml = hasRadio ? `
    <section class="mt-4">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5 pdf-keep-with-next">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <h2 class="font-display font-bold text-sm sm:text-base text-ds-textMain">
            Rádio CBN — Spots de 30 segundos
          </h2>
        </div>
        <div class="text-xs font-bold text-ds-textMain">
          Subtotal Rádio CBN: <span class="text-primary">${fmtBRL(f.radioNet)}</span>
        </div>
      </div>

      <div class="overflow-hidden border border-ds-border rounded-2xl">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-ds-surface text-ds-textSecondary border-b border-ds-border font-display text-xs">
              <th class="py-2.5 px-2.5 font-bold w-[68px]">Código</th>
              <th class="py-2.5 px-3 font-bold">Emissora e praça</th>
              <th class="py-2.5 px-2.5 font-bold">Programa / faixa horária</th>
              <th class="py-2.5 px-2.5 font-bold">Formato</th>
              <th class="py-2.5 px-2.5 font-bold text-right">Spots/sem.</th>
              <th class="py-2.5 px-2.5 font-bold text-right">Inserções</th>
              <th class="py-2.5 px-2.5 font-bold text-right">Valor unit.</th>
              <th class="py-2.5 px-3 font-bold text-right">Valor líquido</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-slate-800">
            ${m.radioItems.map((rd, idx) => `
              <tr class="${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}">
                <td class="py-2.5 px-2.5 align-top font-mono font-bold text-[11px] text-slate-700 whitespace-nowrap">#${escapeHtml(rd.code)}</td>
                <td class="py-2.5 px-3 align-top">
                  <div class="font-bold text-slate-900">${escapeHtml(rd.stationName)}</div>
                  <div class="text-[11px] text-slate-500">${escapeHtml(rd.city)}/${escapeHtml(rd.state)}</div>
                </td>
                <td class="py-2.5 px-2.5 align-top">
                  <div class="font-semibold text-slate-800">${escapeHtml(rd.cleanTitle || rd.programLabel)}</div>
                  <div class="text-[11px] text-slate-500">${escapeHtml(rd.frequencyDaysLabel)} · ${escapeHtml(rd.timeWindow)}</div>
                </td>
                <td class="py-2.5 px-2.5 align-top text-slate-700 whitespace-nowrap">Spot ${rd.spotDuration}"</td>
                <td class="py-2.5 px-2.5 align-top text-right font-semibold text-slate-800 whitespace-nowrap">${fmtInt(rd.weeklyInsertions)}/sem</td>
                <td class="py-2.5 px-2.5 align-top text-right font-bold text-slate-900 whitespace-nowrap">${fmtInt(rd.totalInsertions)} spots</td>
                <td class="py-2.5 px-2.5 align-top text-right text-slate-600 whitespace-nowrap">${fmtBRL(rd.unitInsertionPrice)}</td>
                <td class="py-2.5 px-3 align-top text-right font-bold text-slate-900 whitespace-nowrap">${fmtBRL(rd.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot class="bg-ds-surface border-t border-ds-borderStrong font-bold text-ds-textMain text-xs">
            <tr>
              <td colspan="4" class="py-2.5 px-3">Total Rádio CBN</td>
              <td class="py-2.5 px-2.5 text-right">${fmtInt(c.radioWeeklyInsertions)}</td>
              <td class="py-2.5 px-2.5 text-right">${fmtInt(c.radioTotalInsertions)}</td>
              <td class="py-2.5 px-2.5 text-right">—</td>
              <td class="py-2.5 px-3 text-right text-primary whitespace-nowrap">${fmtBRL(f.radioNet)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  ` : '';

  // 5. DIRECIONAMENTO MÍNIMO PARA A PROPOSTA VIRTUAL (UMA LINHA, ZERO CARGA COGNITIVA)
  const artTableSectionHtml = `
    <section class="mt-4 pdf-avoid-break">
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span class="font-semibold text-slate-700">
          Especificações técnicas e contratação disponíveis na proposta virtual.
        </span>
        <a
          href="${escapeHtml(onlineProposalUrl)}"
          onclick="if(!window.matchMedia('print').matches){ event.preventDefault(); setViewportMode('desktop'); switchMainTab('artes'); }"
          class="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-display font-bold text-[11px] transition inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap shadow-xs"
        >
          <span>Acessar proposta virtual</span>
          <i class="uil uil-external-link-alt text-xs"></i>
        </a>
      </div>
    </section>
  `;

  container.innerHTML = `
    <!-- BARRA DE AÇÕES DO PREVIEW DO PDF (OCULTA NA IMPRESSÃO) -->
    <div class="no-print max-w-[1140px] mx-auto mb-4 bg-white rounded-2xl border border-ds-borderStrong px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <span class="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center text-lg">
          <i class="uil uil-file-check-alt"></i>
        </span>
        <div>
          <div class="font-display font-bold text-xs sm:text-sm text-ds-textMain flex items-center gap-2">
            <span>Visualização do PDF Comercial Executivo</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">A4 Horizontal · Paisagem</span>
          </div>
          <p class="text-[11px] text-ds-textSecondary">
            Formato A4 horizontal (paisagem) para melhor aproveitamento de espaço nos cards e tabelas.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="setViewportMode('desktop')" class="px-3.5 py-2 rounded-full border border-ds-borderStrong bg-white hover:bg-ds-bg text-ds-textMain font-bold text-xs transition inline-flex items-center gap-1.5">
          <i class="uil uil-arrow-left text-sm"></i>
          <span>Voltar para Proposta Online</span>
        </button>
        <button onclick="window.print()" class="px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white font-display font-bold text-xs transition shadow-sm inline-flex items-center gap-1.5">
          <i class="uil uil-file-download-alt text-sm"></i>
          <span>Baixar PDF</span>
        </button>
      </div>
    </div>

    <!-- FOLHA DO DOCUMENTO PDF (A4 HORIZONTAL / PAISAGEM) -->
    <article aria-hidden="true" class="pdf-page-sheet max-w-[1140px] mx-auto bg-white rounded-[20px] shadow-xl border border-slate-200 overflow-hidden text-slate-900">

      <!-- 1. HEADER KV COMPACTO NO GRADIENTE AQUI ADS + LOGO BRANCO + BIG NUMBERS DISCRETOS -->
      <header class="pdf-header-kv relative overflow-hidden text-white" style="background: linear-gradient(90deg, #F7980F 0%, #F15A22 38%, #E83C39 100%);">
        <!-- KV do executivo segurando a esfera Globo com tela OOH à esquerda -->
        <div class="relative min-h-[156px] flex flex-col justify-between">
          <img
            src="assets/kv-proposta-bg.jpg"
            alt=""
            class="absolute left-0 bottom-0 h-full w-auto max-w-none object-contain object-left-bottom pointer-events-none select-none"
          />

          <!-- Conteúdo alinhado à direita do KV (deixando o personagem + esfera Globo menores e bem enquadrados à esquerda) -->
          <div class="relative z-10 w-full pl-[26%] pr-5 py-3 flex flex-col justify-between min-h-[156px]">
            
            <!-- Topo Limpo: Apenas Logo "Aqui ads" Branco + Título "Proposta Comercial" -->
            <div class="my-auto">
              <div>
                <div class="flex items-center">
                  <!-- Logo Oficial Aqui ads 100% Branco -->
                  <svg class="h-6 w-auto" viewBox="0 0 740.84 182.70" role="img" aria-label="Aqui ads">
                    <path fill="#FFFFFF" d="M 597.46 143.41 C 591.15 138.92 587.05 132.61 585.16 124.47 C 584.98 123.58 585.15 122.86 585.65 122.3 C 586.15 121.74 586.87 121.46 587.81 121.46 L 598.08 121.46 C 599.61 121.46 600.74 122.23 601.44 123.76 C 603.15 127.95 605.6 130.95 608.79 132.74 C 611.97 134.54 616.55 135.44 622.51 135.44 C 627.58 135.44 631.5 134.63 634.28 133.01 C 637.05 131.39 638.44 129.01 638.44 125.88 C 638.44 123.53 637.64 121.61 636.05 120.13 C 634.45 118.66 632.12 117.48 629.05 116.59 C 625.99 115.71 621.98 114.91 617.02 114.2 C 606.46 112.73 598.66 110.1 593.61 106.32 C 588.57 102.55 586.04 97.09 586.04 89.95 C 586.04 85.23 587.39 80.99 590.07 77.21 C 592.76 73.44 596.5 70.48 601.31 68.36 C 606.12 66.24 611.59 65.18 617.73 65.18 C 627.17 65.18 634.97 67.42 641.13 71.9 C 647.3 76.38 651.24 82.52 652.95 90.31 C 653.12 91.25 652.98 91.99 652.51 92.52 C 652.03 93.05 651.3 93.32 650.29 93.32 L 640.38 93.32 C 639.62 93.32 638.98 93.14 638.48 92.79 C 637.98 92.43 637.55 91.84 637.2 91.02 C 635.37 86.95 632.92 84.07 629.85 82.39 C 626.78 80.71 622.51 79.86 617.02 79.86 C 612 79.86 608.21 80.68 605.65 82.3 C 603.08 83.92 601.8 86.3 601.8 89.42 C 601.8 92.32 603.26 94.44 606.18 95.79 C 609.1 97.15 613.24 98.27 618.61 99.16 C 626.58 100.52 633.02 102.02 637.95 103.67 C 642.87 105.32 646.84 107.88 649.85 111.33 C 652.86 114.78 654.36 119.45 654.36 125.36 C 654.36 130.13 653.04 134.41 650.38 138.18 C 647.73 141.96 643.95 144.9 639.06 146.99 C 634.16 149.09 628.52 150.13 622.15 150.13 C 612 150.13 603.77 147.89 597.46 143.41 M 513.04 121.95 C 515.22 126.16 518.21 129.44 522.02 131.77 C 525.82 134.1 530.06 135.27 534.72 135.27 C 539.56 135.27 543.91 134.22 547.77 132.13 C 551.63 130.03 554.67 126.9 556.89 122.74 C 559.1 118.58 560.21 113.55 560.21 107.66 C 560.21 101.7 559.1 96.65 556.89 92.52 C 554.67 88.39 551.65 85.28 547.82 83.18 C 543.98 81.09 539.62 80.04 534.72 80.04 C 530.47 80.04 526.44 81.11 522.64 83.23 C 518.83 85.35 515.74 88.5 513.35 92.65 C 510.96 96.81 509.76 101.81 509.76 107.66 C 509.76 112.96 510.85 117.73 513.04 121.95 M 513.61 144.78 C 507.51 141.21 502.68 136.21 499.14 129.78 C 495.6 123.35 493.83 115.97 493.83 107.66 C 493.83 99.51 495.63 92.21 499.23 85.75 C 502.83 79.29 507.7 74.25 513.83 70.62 C 519.97 66.99 526.69 65.18 534.01 65.18 C 539.73 65.18 544.81 66.18 549.23 68.18 C 553.66 70.19 557.2 72.96 559.85 76.5 L 559.85 35.62 C 559.85 34.73 560.1 34.04 560.6 33.54 C 561.1 33.04 561.8 32.79 562.68 32.79 L 572.95 32.79 C 573.83 32.79 574.53 33.04 575.03 33.54 C 575.53 34.04 575.78 34.73 575.78 35.62 L 575.78 145.88 C 575.78 146.77 575.53 147.46 575.03 147.96 C 574.53 148.46 573.83 148.71 572.95 148.71 L 562.86 148.71 C 561.98 148.71 561.28 148.46 560.78 147.96 C 560.28 147.46 560.03 146.77 560.03 145.88 L 560.03 138.63 C 557.49 142.17 553.95 144.97 549.41 147.04 C 544.86 149.1 539.67 150.13 533.83 150.13 C 526.46 150.13 519.72 148.35 513.61 144.78 M 420.83 121.95 C 423.01 126.16 426 129.44 429.81 131.77 C 433.61 134.1 437.85 135.27 442.51 135.27 C 447.34 135.27 451.7 134.22 455.56 132.13 C 459.42 130.03 462.46 126.9 464.68 122.74 C 466.89 118.58 467.99 113.55 467.99 107.66 C 467.99 101.7 466.89 96.65 464.68 92.52 C 462.46 88.39 459.44 85.28 455.6 83.18 C 451.77 81.09 447.4 80.04 442.51 80.04 C 438.26 80.04 434.23 81.11 430.43 83.23 C 426.62 85.35 423.52 88.5 421.13 92.65 C 418.74 96.81 417.55 101.81 417.55 107.66 C 417.55 112.96 418.64 117.73 420.83 121.95 M 421.71 144.78 C 415.51 141.21 410.62 136.21 407.02 129.78 C 403.42 123.35 401.62 115.97 401.62 107.66 C 401.62 99.51 403.44 92.21 407.06 85.75 C 410.69 79.29 415.63 74.25 421.89 70.62 C 428.14 66.99 435.07 65.18 442.68 65.18 C 448.29 65.18 453.3 66.18 457.73 68.18 C 462.15 70.19 465.69 72.96 468.35 76.5 L 468.35 69.42 C 468.35 68.54 468.6 67.84 469.1 67.34 C 469.6 66.84 470.3 66.59 471.18 66.59 L 481.09 66.59 C 481.98 66.59 482.67 66.84 483.17 67.34 C 483.67 67.84 483.92 68.54 483.92 69.42 L 483.92 145.88 C 483.92 146.77 483.67 147.46 483.17 147.96 C 482.67 148.46 481.98 148.71 481.09 148.71 L 471.18 148.71 C 470.3 148.71 469.6 148.46 469.1 147.96 C 468.6 147.46 468.35 146.77 468.35 145.88 L 468.35 138.1 C 465.75 141.87 462.21 144.82 457.73 146.95 C 453.24 149.07 448.17 150.13 442.51 150.13 C 434.84 150.13 427.9 148.35 421.71 144.78 M 334.72 147.83 C 334.13 147.24 333.83 146.47 333.83 145.53 L 333.83 69.07 C 333.83 68.07 334.13 67.29 334.72 66.72 C 335.31 66.16 336.07 65.88 337.02 65.88 L 355.43 65.88 C 356.43 65.88 357.21 66.16 357.77 66.72 C 358.33 67.29 358.61 68.07 358.61 69.07 L 358.61 145.53 C 358.61 146.47 358.33 147.24 357.77 147.83 C 357.21 148.42 356.43 148.71 355.43 148.71 L 337.02 148.71 C 336.07 148.71 335.31 148.42 334.72 147.83 M 335.38 54.2 C 332.58 51.49 331.18 48 331.18 43.76 C 331.18 40.98 331.81 38.52 333.08 36.37 C 334.35 34.21 336.13 32.52 338.43 31.28 C 340.73 30.04 343.33 29.42 346.22 29.42 C 349.11 29.42 351.71 30.04 354.01 31.28 C 356.31 32.52 358.09 34.21 359.36 36.37 C 360.63 38.52 361.27 40.98 361.27 43.76 C 361.27 48 359.86 51.49 357.06 54.2 C 354.26 56.91 350.65 58.27 346.22 58.27 C 341.8 58.27 338.18 56.91 335.38 54.2 M 250.34 141.15 C 245.23 135.16 242.68 126.59 242.68 115.44 L 242.68 69.07 C 242.68 68.07 242.98 67.29 243.57 66.72 C 244.15 66.16 244.92 65.88 245.87 65.88 L 264.45 65.88 C 265.46 65.88 266.24 66.16 266.8 66.72 C 267.36 67.29 267.64 68.07 267.64 69.07 L 267.64 110.48 C 267.64 115.56 268.67 119.45 270.74 122.17 C 272.8 124.88 275.84 126.24 279.85 126.24 C 284.22 126.24 287.61 124.84 290.03 122.04 C 292.45 119.23 293.66 115.32 293.66 110.31 L 293.66 69.07 C 293.66 68.07 293.95 67.29 294.54 66.72 C 295.13 66.16 295.9 65.88 296.84 65.88 L 315.43 65.88 C 316.43 65.88 317.21 66.16 317.77 66.72 C 318.33 67.29 318.61 68.07 318.61 69.07 L 318.61 145.53 C 318.61 146.47 318.33 147.24 317.77 147.83 C 317.21 148.42 316.43 148.71 315.43 148.71 L 298.26 148.71 C 297.31 148.71 296.55 148.42 295.96 147.83 C 295.37 147.24 295.07 146.47 295.07 145.53 L 295.07 139.34 C 292.59 142.7 289.39 145.34 285.47 147.25 C 281.55 149.17 277.13 150.13 272.24 150.13 C 262.74 150.13 255.44 147.14 250.34 141.15 M 169.89 117.17 C 171.52 120.09 173.68 122.36 176.4 123.98 C 179.11 125.61 182.09 126.41 185.34 126.41 C 188.76 126.41 191.84 125.63 194.58 124.07 C 197.33 122.51 199.48 120.29 201.05 117.43 C 202.61 114.57 203.39 111.2 203.39 107.3 C 203.39 103.46 202.61 100.1 201.05 97.21 C 199.48 94.32 197.33 92.09 194.58 90.53 C 191.84 88.96 188.76 88.18 185.34 88.18 C 182.15 88.18 179.2 88.96 176.49 90.53 C 173.77 92.09 171.59 94.32 169.94 97.21 C 168.29 100.1 167.46 103.46 167.46 107.3 C 167.46 110.96 168.27 114.25 169.89 117.17 M 203.74 181.86 C 203.15 181.3 202.86 180.52 202.86 179.51 L 202.86 141.11 C 200.56 143.88 197.55 146.08 193.83 147.7 C 190.11 149.32 185.75 150.13 180.73 150.13 C 173.65 150.13 167.21 148.27 161.4 144.56 C 155.59 140.84 151.01 135.72 147.68 129.2 C 144.35 122.68 142.68 115.38 142.68 107.3 C 142.68 99.39 144.39 92.17 147.81 85.62 C 151.23 79.07 155.88 73.91 161.75 70.13 C 167.62 66.36 174.07 64.47 181.09 64.47 C 186.22 64.47 190.76 65.43 194.72 67.34 C 198.67 69.26 201.8 71.84 204.1 75.09 L 204.1 69.07 C 204.1 68.07 204.39 67.29 204.98 66.72 C 205.57 66.16 206.34 65.88 207.28 65.88 L 224.63 65.88 C 225.63 65.88 226.41 66.16 226.97 66.72 C 227.53 67.29 227.82 68.07 227.82 69.07 L 227.82 179.51 C 227.82 180.52 227.53 181.3 226.97 181.86 C 226.41 182.42 225.63 182.7 224.63 182.7 L 206.04 182.7 C 205.1 182.7 204.33 182.42 203.74 181.86 M 119.43 13.89 C 118.36 4.75 114.76 0.24 105.41 0.24 L 40.12 0.24 C 40.12 0.24 34.58 0 26.57 0.43 C 18.26 1.41 15.74 5.39 14.75 13.89 L 13.2 26.45 L 0.17 144.43 C 0 145.98 1.22 147.33 2.78 147.33 L 24.21 147.33 C 25.55 147.33 26.67 146.33 26.82 145 L 31.42 103.32 L 31.42 103.32 C 31.52 102.4 34.81 72.63 34.9 71.77 L 39.61 29.13 L 39.62 29.13 C 39.62 28.88 39.65 28.64 39.69 28.4 L 39.7 28.29 C 40.09 26.41 41.76 25 43.77 25 L 90.11 25 C 92.11 25 93.78 26.41 94.16 28.29 L 94.18 28.4 C 94.22 28.64 94.25 28.88 94.25 29.13 L 94.26 29.13 L 98.97 71.77 C 99.06 72.63 98.16 73.33 97.28 73.33 L 50.31 67.03 C 48.76 66.86 47.4 68.07 47.4 69.63 L 45.21 92.33 C 45.21 93.66 46.21 94.79 47.55 94.93 L 100.76 101.67 C 100.77 101.67 100.78 101.68 100.78 101.68 C 101.69 101.79 102.36 102.4 102.45 103.32 L 102.45 103.32 L 107.05 145 C 107.2 146.33 108.32 147.33 109.66 147.33 L 131.4 147.33 C 132.96 147.33 134.18 145.98 134.01 144.43 L 120.98 26.45 Z M 701.02 56.17 C 710.1 56.17 717.11 48.84 717.11 40 C 717.11 31.24 710.1 23.91 701.02 23.91 C 691.94 23.91 684.93 31.24 684.93 40 C 684.93 48.84 691.94 56.17 701.02 56.17 M 728.18 58.79 C 719.5 59.75 710.1 59.99 701.02 59.99 C 691.94 59.99 682.54 59.75 673.78 58.79 C 671.31 58.55 670.04 57.92 669.72 55.29 C 669.24 50.27 669.24 45.18 669.24 40 C 669.24 34.9 669.24 29.8 669.72 24.79 C 670.04 22.16 671.31 21.52 673.78 21.28 C 682.54 20.32 691.94 20.09 701.02 20.09 C 710.1 20.09 719.5 20.32 728.18 21.28 C 730.73 21.52 732 22.16 732.32 24.79 C 732.72 29.8 732.72 34.9 732.72 40 C 732.72 45.18 732.72 50.27 732.32 55.29 C 732 57.92 730.73 58.55 728.18 58.79 M 701.02 0.25 C 679.12 0.25 661.28 18.09 661.28 40 C 661.28 61.98 679.12 79.82 701.02 79.82 C 722.92 79.82 740.84 61.98 740.84 40 C 740.84 18.09 722.92 0.25 701.02 0.25"></path>
                  </svg>
                </div>
                <h1 class="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white mt-1 leading-tight">
                  Proposta Comercial
                </h1>
              </div>
            </div>

            <!-- Faixa Inferior: Os 4 Big Numbers (tipografia branca limpa sobre o gradiente, sem fundo de card e sem ícones) -->
            <div class="mt-2.5 pt-2.5 border-t border-[#F7875B] grid grid-cols-4 divide-x divide-[#F7875B]">
              <div class="pr-4">
                <div class="font-display font-extrabold text-base sm:text-lg text-white leading-none tracking-tight">10K+</div>
                <div class="text-[11px] font-medium text-[#FFF5EE] mt-1 leading-snug whitespace-nowrap">Marcas anunciando pelo Aqui ads</div>
              </div>
              <div class="px-4">
                <div class="font-display font-extrabold text-base sm:text-lg text-white leading-none tracking-tight">100%</div>
                <div class="text-[11px] font-medium text-[#FFF5EE] mt-1 leading-snug whitespace-nowrap">do território brasileiro coberto</div>
              </div>
              <div class="px-4">
                <div class="font-display font-extrabold text-base sm:text-lg text-white leading-none tracking-tight">123.000+</div>
                <div class="text-[11px] font-medium text-[#FFF5EE] mt-1 leading-snug whitespace-nowrap">telas de OOH pelo Brasil</div>
              </div>
              <div class="pl-4">
                <div class="font-display font-extrabold text-base sm:text-lg text-white leading-none tracking-tight">136M</div>
                <div class="text-[11px] font-medium text-[#FFF5EE] mt-1 leading-snug whitespace-nowrap">pessoas que assistem TV Globo</div>
              </div>
            </div>

          </div>
        </div>
      </header>

      <!-- 2. CORPO DO DOCUMENTO: INFORMAÇÕES DA CAMPANHA LOGO NO SEGUNDO SCROLL -->
      <div class="pdf-body-content p-3.5 sm:p-4">

        <!-- GRID EXECUTIVO: DADOS DA CAMPANHA (ESQUERDA) + RECONCILIAÇÃO FINANCEIRA (DIREITA) -->
        <div class="grid grid-cols-12 gap-3.5 items-stretch pdf-avoid-break">

          <!-- Dados de Campanha e Faturamento (7 colunas — 2 cards separados) -->
          <div class="col-span-7 flex flex-col gap-2.5 h-full">
            <!-- Card 1: Dados de campanha -->
            <div class="rounded-2xl border border-ds-border bg-white p-3.5 flex-1 flex flex-col justify-between">
              <div class="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-ds-border">
                <h2 class="font-display font-bold text-sm text-ds-textMain">
                  Dados de campanha
                </h2>
                <span class="text-[11px] font-medium text-ds-textSecondary bg-ds-surface border border-ds-border px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                  Mix: ${c.totalItems} ${c.totalItems === 1 ? 'produto contratado' : 'produtos contratados'}
                </span>
              </div>

              <!-- Linha 1: Código da proposta (esq) e Nome da campanha (dir) -->
              <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div>
                  <div class="text-[11px] text-ds-textSecondary">Código da proposta</div>
                  <div class="font-display font-bold text-sm text-ds-textMain mt-0.5">${proposalDisplayId}</div>
                </div>
                <div class="min-w-0">
                  <div class="text-[11px] text-ds-textSecondary">Nome da campanha</div>
                  <div class="font-bold text-ds-textMain mt-0.5 truncate" title="${escapeHtml(m.campaignName)}">${escapeHtml(m.campaignName)}</div>
                </div>
              </div>

              <!-- Linha 2: Duração da campanha (esq) e Período de veiculação (dir) -->
              <div class="mt-2 pt-2 border-t border-ds-border grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div>
                  <div class="text-[11px] text-ds-textSecondary">Duração da campanha</div>
                  <div class="font-bold text-ds-textMain mt-0.5 whitespace-nowrap">${m.durationDays} dias corridos</div>
                </div>
                <div>
                  <div class="text-[11px] text-ds-textSecondary">Período de veiculação</div>
                  <div class="font-bold text-ds-textMain mt-0.5 whitespace-nowrap">${m.startDate} a ${m.endDate}</div>
                </div>
              </div>
            </div>

            <!-- Card 2: Dados de faturamento -->
            <div class="rounded-2xl border border-ds-border bg-white p-3.5 flex flex-col justify-between">
              <div class="pb-2 mb-2 border-b border-ds-border">
                <h2 class="font-display font-bold text-sm text-ds-textMain">
                  Dados de faturamento
                </h2>
              </div>
              ${!hasBilling ? `
                <div class="text-xs text-ds-textSecondary py-0.5">
                  Dados de faturamento ainda não cadastrados.
                </div>
              ` : `
                <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div class="min-w-0">
                    <div class="text-[11px] text-ds-textSecondary">Razão social / Anunciante</div>
                    <div class="font-bold text-ds-textMain mt-0.5">${billingCompany}</div>
                  </div>
                  <div>
                    <div class="text-[11px] text-ds-textSecondary">CNPJ de faturamento</div>
                    <div class="font-mono font-bold text-ds-textMain mt-0.5 whitespace-nowrap">${billingCnpj}</div>
                  </div>
                </div>
              `}
            </div>
          </div>

          <!-- Resumo Financeiro (5 colunas — seguindo exatamente a estrutura e hierarquia visual do checkout oficial) -->
          <div class="col-span-5 h-full rounded-2xl border border-ds-border bg-white p-3.5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-normal text-ds-textSecondary">Investimento total</span>
                ${hasDiscounts ? `
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                    Desc. -${fmtBRL(f.totalDiscounts)}
                  </span>
                ` : ''}
              </div>
              <div class="mt-1">
                ${hasDiscounts ? `
                  <div class="text-[11px] text-ds-textMuted line-through font-medium leading-none mb-1">${fmtBRL(f.totalGrossProposal)}</div>
                ` : ''}
                <div class="font-display font-extrabold text-2xl text-ds-textMain tracking-tight leading-none">${fmtBRL(f.trueProposalTotal)}</div>
              </div>
            </div>

            ${hasRadio && f.onlinePayableNow <= 0 ? `
              <div class="mt-2.5 rounded-xl bg-ds-surface border border-ds-border p-2.5 space-y-1">
                <div class="flex items-center gap-1.5 text-xs font-bold text-ds-textMain leading-tight">
                  <i class="uil uil-info-circle text-primary text-sm shrink-0"></i>
                  <span>Faturamento à parte</span>
                </div>
                <p class="text-[11px] text-ds-textSecondary leading-snug">
                  Rádio tem um processo de faturamento à parte, nosso time de especialistas vai entrar em contato para combinar o pagamento.
                </p>
              </div>
            ` : `
              <div class="mt-2.5 rounded-xl bg-ds-surface border border-ds-border p-2.5 space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-ds-textMain leading-tight">Checkout imediato</div>
                    <div class="text-[11px] text-ds-textSecondary leading-tight mt-0.5">Até 6x s/ juros, Pix ou Boleto</div>
                  </div>
                  <strong class="font-display font-extrabold text-sm text-[#199958] whitespace-nowrap shrink-0">${fmtBRL(f.onlinePayableNow)}</strong>
                </div>
                ${hasRadio ? `
                  <div class="border-t border-ds-border pt-2 flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <div class="text-xs font-semibold text-ds-textSecondary leading-tight">Pós-reserva (Rádio)</div>
                      <div class="text-[11px] text-ds-textMuted leading-tight mt-0.5">Boleto após confirmar grade</div>
                    </div>
                    <strong class="font-display font-bold text-sm text-ds-textMain whitespace-nowrap shrink-0">${fmtBRL(f.radioNet)}</strong>
                  </div>
                ` : ''}
              </div>
            `}
          </div>

        </div>

        <!-- DETALHAMENTO DE MÉTRICAS (1ª LINHA NA PÁGINA 1; QUANDO HÁ 4 CARDS, QUEBRA EXATAMENTE NO MEIO PARA A PÁGINA 2) -->
        <div class="mt-2.5 rounded-2xl border border-ds-border bg-white p-3 text-xs pdf-metrics-container ${hasTwoMetricsRows ? '' : 'pdf-avoid-break'}">
          <div class="pdf-avoid-break">
            <div class="flex items-center justify-between gap-2 mb-2">
              <h2 class="font-display font-bold text-sm text-ds-textMain">
                Detalhamento de métricas
              </h2>
            </div>
            <div class="grid ${metricsGridColsClass} gap-2.5 items-stretch">
              ${firstRowMetricsCards.join('')}
            </div>
          </div>
          ${hasTwoMetricsRows ? `
            <div class="grid ${secondRowMetricsCards.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2.5 items-stretch mt-2.5 pdf-break-before-print pdf-avoid-break">
              ${secondRowMetricsCards.join('')}
            </div>
          ` : ''}
        </div>

        <!-- DISCLAIMER DO MAPA INTERATIVO (COMPACTO EM UMA LINHA) -->
        ${hasOoh ? `
          <div class="mt-2.5 rounded-lg border border-orange-200 bg-[#FFF7ED] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] pdf-avoid-break">
            <div class="flex items-center gap-1.5 text-slate-700">
              <i class="uil uil-map-marker-info text-primary text-xs shrink-0"></i>
              <span class="font-semibold text-slate-800">Para ver o ponto no mapa, acesse essa proposta online.</span>
            </div>
            <a
              href="${escapeHtml(onlineProposalUrl)}"
              onclick="if(!window.matchMedia('print').matches){ event.preventDefault(); setViewportMode('desktop'); }"
              class="font-display font-bold text-[11px] text-primary hover:underline inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
            >
              <span>Acessar proposta online</span>
              <i class="uil uil-external-link-alt text-xs"></i>
            </a>
          </div>
        ` : ''}

        <!-- TABELAS LEVES SEPARADAS POR CANAL -->
        ${oohTableSectionHtml}
        ${portaisTableSectionHtml}
        ${revistasTableSectionHtml}
        ${radioTableSectionHtml}
        ${artTableSectionHtml}

        <!-- ÚLTIMA PÁGINA DO PDF: PROVA SOCIAL (+23% & DEPOIMENTOS) + BANNER "SUA MARCA NO LUGAR CERTO" EM PÁGINA ÚNICA -->
        <section class="mt-6 pt-2 pdf-break-before-print pdf-avoid-break flex flex-col justify-between">
          
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

          <!-- 2. BANNER INSTITUCIONAL DE FECHAMENTO ("SUA MARCA NO LUGAR CERTO.") -->
          <div
            class="mt-3.5 rounded-2xl relative overflow-hidden text-white min-h-[176px] flex items-center"
            style="background: linear-gradient(90deg, #E83C39 0%, #F15A22 55%, #F7980F 100%);"
          >
            <img
              src="assets/kv-closing-shapes.png"
              alt="Aqui ads"
              class="absolute right-0 bottom-0 h-full w-auto object-contain object-right-bottom pointer-events-none select-none"
            />
            <div class="relative z-10 px-8 py-5 max-w-[60%]">
              <h2 class="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
                Sua marca no<br />lugar certo.
              </h2>
              <p class="text-xs text-[#FFF8F3] mt-1.5 leading-relaxed max-w-[360px]">
                Escolha onde aparecer, envie sua arte e acompanhe tudo no seu painel.
              </p>
              <div class="mt-4 flex flex-wrap items-center gap-4">
                <a
                  href="${escapeHtml(onlineProposalUrl)}"
                  onclick="if(!window.matchMedia('print').matches){ event.preventDefault(); setViewportMode('desktop'); }"
                  class="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-900 font-display font-bold text-xs transition shadow-xs inline-flex items-center justify-center"
                >
                  anunciar agora
                </a>
                <a
                  href="${escapeHtml(onlineProposalUrl)}"
                  onclick="if(!window.matchMedia('print').matches){ event.preventDefault(); setViewportMode('desktop'); }"
                  class="inline-flex items-center gap-1.5 text-white font-display font-bold text-xs hover:underline"
                >
                  <i class="uil uil-comment-dots text-sm"></i>
                  <span>falar com especialista</span>
                </a>
              </div>
            </div>
          </div>

          <!-- RODAPÉ EXECUTIVO DE VALIDADE E GOVERNANÇA (INTEGRADO NA MESMA PÁGINA FINAL) -->
          <footer class="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
            <div>
              <strong>Aqui ads</strong> · Proposta comercial sujeita à disponibilidade de inventário no momento da confirmação do pagamento.
            </div>
            <div>
              Documento gerado eletronicamente · Proposta ${proposalDisplayId}
            </div>
          </footer>

        </section>

      </div>
    </article>
  `;
}

// ============================================================================
// HANDLERS DO HERO (NAVEGAÇÃO DIRETA PARA O CANAL + CUPOM DE DESCONTO + COPIAR PLANO)
// ============================================================================
function duplicateCurrentMediaPlan() {
  state.clonedScenariosCount = (state.clonedScenariosCount || 0) + 1;
  const m = getCurrentModel();
  renderHeroSection(m);
  showToast(`Plano copiado! Cenário #${m.id}-C${state.clonedScenariosCount} criado para testar variações sem refazer.`);
}

function jumpToChannelFromHero(ch) {
  switchMainTab('plano');
  state.channelFilter = ch;
  state.ambienteFilter = '';
  state.categoriaFilter = '';
  state.geoFilter = '';
  state.searchQuery = '';
  const m = getCurrentModel();
  renderFilterBar(m);
  renderMediaPlanList(m);
  setTimeout(() => {
    resetMapBounds();
    const target = document.getElementById('mainTabsSection');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

function toggleHeroCouponDrawer() {
  if (state.orderSubmitted) return;
  state.heroCouponOpen = !state.heroCouponOpen;
  renderHeroSection(getCurrentModel());
}

function applyHeroCoupon() {
  if (state.orderSubmitted) return;
  const inputEl = document.getElementById('heroCouponInput');
  const code = (inputEl ? inputEl.value : state.couponCode || 'AQUIADS10').trim().toUpperCase();
  state.couponCode = code || 'AQUIADS10';
  state.heroCouponOpen = false;
  toggleCouponSimulation(true);
}

// ============================================================================
// HANDLERS DA BUSCA INTELIGENTE E EXCLUSÃO EM MASSA / INDIVIDUAL (PADRÃO SEM SELECT INICIAL)
// ============================================================================
function toggleMobileFiltersDrawer() {
  state.mobileFiltersOpen = !state.mobileFiltersOpen;
  renderFilterBar(getCurrentModel());
}

function toggleMobileArtFiltersDrawer() {
  state.mobileArtFiltersOpen = !state.mobileArtFiltersOpen;
  renderArtTab(getCurrentModel());
}

function setChannelFilter(ch) {
  state.channelFilter = ch;
  state.searchQuery = '';
  state.ambienteFilter = '';
  state.categoriaFilter = '';
  state.geoFilter = '';
  const m = getCurrentModel();
  renderFilterBar(m);
  renderMediaPlanList(m);
  setTimeout(() => resetMapBounds(), 60);
}

function switchChannelPreservingSearch(ch) {
  state.channelFilter = ch;
  state.ambienteFilter = '';
  state.categoriaFilter = '';
  state.geoFilter = '';
  const m = getCurrentModel();
  renderFilterBar(m);
  renderMediaPlanList(m);
  setTimeout(() => resetMapBounds(), 60);
}

function setAmbienteFilter(val) {
  state.ambienteFilter = val;
  state.categoriaFilter = '';
  const m = getCurrentModel();
  renderFilterBar(m);
  renderMediaPlanList(m);
  if (state.channelFilter === 'ooh') setTimeout(() => resetMapBounds(), 50);
}

function setCategoriaFilter(val) {
  state.categoriaFilter = val;
  const m = getCurrentModel();
  renderFilterBar(m);
  renderMediaPlanList(m);
  if (state.channelFilter === 'ooh') setTimeout(() => resetMapBounds(), 50);
}

function setGeoFilter(val) {
  state.geoFilter = val;
  const m = getCurrentModel();
  renderFilterBar(m);
  renderMediaPlanList(m);
  if (state.channelFilter === 'ooh') setTimeout(() => resetMapBounds(), 50);
}

function toggleSelectCardForRemoval(code) {
  if (state.selectedForRemoval[code]) {
    delete state.selectedForRemoval[code];
  } else {
    state.selectedForRemoval[code] = true;
  }
  const m = getCurrentModel();
  renderMediaPlanList(m, true);
  resetMapBounds();
}

function selectAllVisibleOohForRemoval() {
  const m = getCurrentModel();
  const q = state.searchQuery.trim().toLowerCase();
  const matchSearch = (str) => !q || String(str || '').toLowerCase().includes(q);
  const filteredOoh = m.oohDisplayGroups.filter((g) => {
    const exhLabel = (g.isStatic || g.periodInsertions === 0) ? 'Impresso' : 'Digital';
    const okSearch = matchSearch(`${g.name} ${g.code} ${g.displayCode} ${g.searchCodes} ${g.address} ${g.district} ${g.zone} ${g.socialClass} ${g.city} ${g.vertical} ${exhLabel} ${g.kind === 'condo_group' ? 'condomínio torres' : ''}`);
    const okCat = !state.ambienteFilter || g.vertical === state.ambienteFilter;
    const okExh = !state.categoriaFilter || exhLabel === state.categoriaFilter;
    const okGeo = matchOohGeoFilter(g, state.geoFilter);
    return okSearch && okCat && okExh && okGeo;
  });

  filteredOoh.forEach((g) => {
    state.selectedForRemoval[g.code] = true;
  });

  renderMediaPlanList(m, true);
  resetMapBounds();
}

function selectAllVisibleChannelItems(channel) {
  const m = getCurrentModel();
  const q = state.searchQuery.trim().toLowerCase();
  const matchSearch = (str) => !q || String(str || '').toLowerCase().includes(q);

  if (channel === 'revistas') {
    const filteredRevistas = m.revistasItems.filter((rev) => {
      const okSearch = matchSearch(`${rev.editorialTitle} ${rev.formatLabel} ${rev.cleanTitle} ${rev.positionLabel}`);
      const okAmbiente = !state.ambienteFilter || rev.editorialTitle === state.ambienteFilter;
      const okCategoria = !state.categoriaFilter || rev.formatLabel === state.categoriaFilter;
      return okSearch && okAmbiente && okCategoria;
    });
    filteredRevistas.forEach((rev, idx) => {
      state.selectedForRemoval[rev.itemKey || `rev_${idx}`] = true;
    });
  } else if (channel === 'portais') {
    const filteredPortais = m.portaisItems.filter((dig) => {
      const okSearch = matchSearch(`${dig.vehicleName} ${dig.formatLabel} ${dig.cleanTitle} ${dig.city} ${dig.state} ${dig.scopeLabel}`);
      const okAmbiente = !state.ambienteFilter || dig.vehicleName === state.ambienteFilter;
      const okCategoria = !state.categoriaFilter || dig.formatLabel === state.categoriaFilter;
      return okSearch && okAmbiente && okCategoria;
    });
    filteredPortais.forEach((dig, idx) => {
      state.selectedForRemoval[dig.itemKey || `dig_${idx}`] = true;
    });
  } else if (channel === 'radio') {
    const filteredRadio = m.radioItems.filter((rd) => {
      const okSearch = matchSearch(`${rd.stationName} ${rd.programLabel} ${rd.cleanTitle} ${rd.city} ${rd.state} ${rd.timeWindow} ${rd.frequencyDaysLabel}`);
      const okAmbiente = !state.ambienteFilter || rd.city === state.ambienteFilter;
      const okCategoria = !state.categoriaFilter || rd.timeWindow === state.categoriaFilter;
      return okSearch && okAmbiente && okCategoria;
    });
    filteredRadio.forEach((rd, idx) => {
      state.selectedForRemoval[rd.itemKey || `rad_${idx}`] = true;
    });
  }

  renderMediaPlanList(m, true);
}

function clearBulkSelection() {
  state.selectedForRemoval = {};
  const m = getCurrentModel();
  renderMediaPlanList(m, true);
  resetMapBounds();
}

function confirmBulkRemoveSelectedItems() {
  const keys = Object.keys(state.selectedForRemoval);
  if (keys.length === 0) return;
  keys.forEach((k) => {
    state.removedItems[k] = true;
  });
  state.selectedForRemoval = {};
  renderAll();
  setTimeout(() => resetMapBounds(), 50);
  showToast(`${keys.length} ${keys.length > 1 ? 'itens excluídos' : 'item excluído'} da proposta. Totais recalculados.`);
}

function removeSinglePlanItem(code) {
  state.removedItems[code] = true;
  delete state.selectedForRemoval[code];
  renderAll();
  setTimeout(() => resetMapBounds(), 50);
  showToast('Item excluído da proposta. Você pode restaurar a qualquer momento.');
}

function restoreAllRemovedPlanItems() {
  state.removedItems = {};
  state.selectedForRemoval = {};
  renderAll();
  setTimeout(() => resetMapBounds(), 50);
  showToast('Todos os pontos excluídos foram restaurados na proposta.');
}

function clearAllMediaFilters() {
  state.searchQuery = '';
  state.ambienteFilter = '';
  state.categoriaFilter = '';
  state.geoFilter = '';
  const m = getCurrentModel();
  renderFilterBar(m);
  renderMediaPlanList(m);
  if (state.channelFilter === 'ooh') setTimeout(() => resetMapBounds(), 50);
}

function setSearchQuery(q) {
  state.searchQuery = q;
  const m = getCurrentModel();
  renderFilterBar(m);
  renderMediaPlanList(m);
  if (state.channelFilter === 'ooh') setTimeout(() => resetMapBounds(), 50);

  // Restaura foco e posição do cursor no campo de busca após atualizar o banner cross-canal
  const input = document.getElementById('mediaPlanSearchInput');
  if (input) {
    input.focus();
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }
}

function toggleCondoGroup(condoId) {
  state.expandedCondos[condoId] = !state.expandedCondos[condoId];
  renderMediaPlanList(getCurrentModel(), true);
}

function toggleCardMetrics(code) {
  state.expandedCardMetrics[code] = !state.expandedCardMetrics[code];
  renderMediaPlanList(getCurrentModel(), true);
}

function setPaymentMethod(pm) {
  if (state.orderSubmitted) {
    showToast('Após gerar o pagamento, não é possível alterar a forma de pagamento.');
    return;
  }
  state.paymentMethod = pm;
  renderPaymentTab(getCurrentModel());
  if (pm === 'pix' && isMobileView() && !state.pixGenerated) {
    setTimeout(() => {
      const btn = document.getElementById('activateCampaignBtn');
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  }
}

function unlockInlineBilling() {
  state.billingUnlockedInline = true;
  renderPaymentTab(getCurrentModel());
  showToast('Dados de faturamento salvos.');
}

function toggleExportMenu() {
  document.getElementById('exportMenu').classList.toggle('hidden');
}

function showToast(msg) {
  const t = document.getElementById('toastNotification');
  document.getElementById('toastMessage').textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3200);
}

function copyShareLink() {
  navigator.clipboard?.writeText(window.location.href);
  showToast('Link da proposta copiado');
}

function autoFitSheetColumns(aoa, minFirstCol = 22) {
  const colWidths = [];
  (aoa || []).forEach((row, rowIdx) => {
    if (!Array.isArray(row)) return;
    // Ignora linhas de banner principal (0 e 1) no cálculo de largura da coluna A para não esticar artificialmente
    if (rowIdx <= 1 && row.length === 1) return;
    row.forEach((cell, colIdx) => {
      if (cell === null || cell === undefined) return;
      let text = '';
      if (typeof cell === 'number') {
        text = cell.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (Math.abs(cell) >= 100) text = `R$ ${text}`;
      } else {
        text = String(cell);
      }
      const minW = colIdx === 0 ? minFirstCol : 14;
      const len = Math.min(52, Math.max(minW, text.length + 5));
      if (!colWidths[colIdx] || len > colWidths[colIdx].wch) {
        colWidths[colIdx] = { wch: len };
      }
    });
  });
  return colWidths;
}

function applyStyledWorksheet(ws, cfg) {
  if (!ws || !window.XLSX || !window.XLSX.utils) return;
  const U = window.XLSX.utils;
  const rows = cfg.rows || [];
  const rowCount = rows.length;
  const colCount = cfg.colCount || Math.max(1, ...rows.map((r) => (Array.isArray(r) ? r.length : 0)));

  const borderThin = {
    top: { style: 'thin', color: { rgb: 'DED6CC' } },
    bottom: { style: 'thin', color: { rgb: 'DED6CC' } },
    left: { style: 'thin', color: { rgb: 'DED6CC' } },
    right: { style: 'thin', color: { rgb: 'DED6CC' } }
  };
  const borderHeader = {
    top: { style: 'thin', color: { rgb: 'B8AEA2' } },
    bottom: { style: 'medium', color: { rgb: 'B8AEA2' } },
    left: { style: 'thin', color: { rgb: 'C8BFB3' } },
    right: { style: 'thin', color: { rgb: 'C8BFB3' } }
  };
  const borderTotal = {
    top: { style: 'medium', color: { rgb: 'B8AEA2' } },
    bottom: { style: 'double', color: { rgb: 'B8AEA2' } },
    left: { style: 'thin', color: { rgb: 'DED6CC' } },
    right: { style: 'thin', color: { rgb: 'DED6CC' } }
  };
  const borderOrange = {
    top: { style: 'thin', color: { rgb: 'D54300' } },
    bottom: { style: 'thin', color: { rgb: 'D54300' } },
    left: { style: 'thin', color: { rgb: 'D54300' } },
    right: { style: 'thin', color: { rgb: 'D54300' } }
  };

  ws['!ref'] = U.encode_range({
    s: { r: 0, c: 0 },
    e: { r: Math.max(0, rowCount - 1), c: Math.max(0, colCount - 1) }
  });

  if (Array.isArray(cfg.merges) && cfg.merges.length > 0) {
    ws['!merges'] = cfg.merges;
  }

  if (cfg.autofilterRef) {
    ws['!autofilter'] = { ref: cfg.autofilterRef };
  }

  const rowHeights = [];
  const rowMetaMap = cfg.rowMeta || {};
  const currencyColsSet = new Set(cfg.currencyCols || []);
  const integerColsSet = new Set(cfg.integerCols || []);
  const centerColsSet = new Set(cfg.centerCols || []);

  for (let r = 0; r < rowCount; r++) {
    const rMeta = rowMetaMap[r] || { type: 'data' };
    const rType = rMeta.type;
    const activeCols = rMeta.maxCol || colCount;

    if (rType === 'orange_title') {
      rowHeights[r] = { hpt: 28 };
    } else if (rType === 'orange_subtitle' || rType === 'orange_section') {
      rowHeights[r] = { hpt: 23 };
    } else if (rType === 'table_header') {
      rowHeights[r] = { hpt: 25 };
    } else if (rType === 'total' || rType === 'highlight_total') {
      rowHeights[r] = { hpt: 23 };
    } else if (rType === 'spacer') {
      rowHeights[r] = { hpt: 12 };
    } else {
      rowHeights[r] = { hpt: 20 };
    }

    if (rType === 'spacer') continue;

    for (let c = 0; c < activeCols; c++) {
      const ref = U.encode_cell({ r, c });
      if (!ws[ref]) {
        ws[ref] = { t: 's', v: '' };
      }
      const cell = ws[ref];
      const isNum = cell.t === 'n' || (typeof cell.v === 'number' && Number.isFinite(cell.v));

      const isCurrency = Boolean(
        isNum && (
          rMeta.allNumericCurrency ||
          (Array.isArray(rMeta.currencyCols) ? rMeta.currencyCols.includes(c) : currencyColsSet.has(c))
        )
      );
      const isInt = Boolean(
        isNum && !isCurrency && (
          rMeta.allNumericInt ||
          (Array.isArray(rMeta.integerCols) ? rMeta.integerCols.includes(c) : integerColsSet.has(c))
        )
      );

      let numFmt = undefined;
      if (isCurrency) {
        numFmt = '"R$ "#,##0.00;-"R$ "#,##0.00;"R$ "0.00';
        cell.z = numFmt;
      } else if (isInt) {
        numFmt = '#,##0';
        cell.z = numFmt;
      }

      let horiz = 'left';
      if (isNum) {
        horiz = centerColsSet.has(c) && !isCurrency ? 'center' : 'right';
      } else if (centerColsSet.has(c) && rType !== 'orange_title' && rType !== 'orange_subtitle' && rType !== 'orange_section') {
        horiz = 'center';
      } else if (rType === 'table_header' && (currencyColsSet.has(c) || integerColsSet.has(c) || (Array.isArray(rMeta.rightHeaderCols) && rMeta.rightHeaderCols.includes(c)))) {
        horiz = centerColsSet.has(c) ? 'center' : 'right';
      }

      if (rType === 'orange_title') {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: 'F15A22' } },
          font: { name: 'Arial', sz: 13, bold: true, color: { rgb: 'FFFFFF' } },
          alignment: { vertical: 'center', horizontal: 'left' },
          border: borderOrange
        };
      } else if (rType === 'orange_subtitle') {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: 'F15A22' } },
          font: { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
          alignment: { vertical: 'center', horizontal: 'left' },
          border: borderOrange
        };
      } else if (rType === 'orange_section') {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: 'F15A22' } },
          font: { name: 'Arial', sz: 10.5, bold: true, color: { rgb: 'FFFFFF' } },
          alignment: { vertical: 'center', horizontal: 'left' },
          border: borderOrange
        };
      } else if (rType === 'table_header') {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: 'E8E0D5' } },
          font: { name: 'Arial', sz: 10, bold: true, color: { rgb: '121212' } },
          alignment: { vertical: 'center', horizontal: horiz, wrapText: true },
          border: borderHeader
        };
      } else if (rType === 'coupon') {
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: 'ECFDF5' } },
          font: { name: 'Arial', sz: 10, bold: true, color: { rgb: '047857' } },
          alignment: { vertical: 'center', horizontal: horiz },
          border: borderThin,
          ...(numFmt ? { numFmt } : {})
        };
      } else if (rType === 'total' || rType === 'highlight_total') {
        const isFinalNetCol = c === activeCols - 1 && isCurrency;
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: rType === 'highlight_total' ? 'FFF3EA' : 'F3ECE4' } },
          font: {
            name: 'Arial',
            sz: 10.5,
            bold: true,
            color: { rgb: isFinalNetCol ? 'F15A22' : '121212' }
          },
          alignment: { vertical: 'center', horizontal: horiz },
          border: borderTotal,
          ...(numFmt ? { numFmt } : {})
        };
      } else if (rType === 'kv_row') {
        const isKeyCol = c === 0;
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: isKeyCol ? 'FBF8F4' : 'FFFFFF' } },
          font: {
            name: 'Arial',
            sz: 10,
            bold: Boolean(isKeyCol || rMeta.boldValue),
            color: { rgb: '121212' }
          },
          alignment: { vertical: 'center', horizontal: horiz },
          border: borderThin,
          ...(numFmt ? { numFmt } : {})
        };
      } else {
        const isEvenData = (rMeta.dataIndex ?? r) % 2 === 1;
        const isBoldCol = Boolean(
          (Array.isArray(cfg.boldCols) && cfg.boldCols.includes(c)) ||
          (Array.isArray(rMeta.boldCols) && rMeta.boldCols.includes(c))
        );
        cell.s = {
          fill: { patternType: 'solid', fgColor: { rgb: isEvenData ? 'FAF7F2' : 'FFFFFF' } },
          font: {
            name: 'Arial',
            sz: 10,
            bold: isBoldCol,
            color: { rgb: '121212' }
          },
          alignment: { vertical: 'center', horizontal: horiz },
          border: borderThin,
          ...(numFmt ? { numFmt } : {})
        };
      }
    }
  }

  ws['!rows'] = rowHeights;
}

function exportFullCsv() {
  const m = getCurrentModel();
  const f = m.financials;
  const c = m.counts;
  const hasOoh = c.oohGroupsCount > 0;
  const hasPortais = c.portaisCount > 0;
  const hasRevistas = c.revistasCount > 0;
  const hasRadio = c.radioCount > 0;

  const proposalDisplayId = state.clonedScenariosCount > 0
    ? `#${m.id}-C${state.clonedScenariosCount}`
    : `#${m.id}`;

  const hasBilling = !state.simulateUnlogged || state.billingUnlockedInline;
  const billingCompany = hasBilling
    ? (state.billingCompany || 'Padaria & Confeitaria Bela Paulista LTDA')
    : 'Dados de faturamento ainda não cadastrados.';
  const billingCnpj = hasBilling
    ? (state.billingDoc || '12.345.678/0001-99')
    : '—';

  const oohStaticPts = c.oohStaticPointsCount ?? m.oohDisplayGroups.filter((g) => g.isStatic).reduce((acc, g) => acc + g.towersCount, 0);
  const oohDigitalPts = c.oohDigitalPointsCount ?? Math.max(0, c.oohPointsCount - oohStaticPts);

  // Portais e Revistas helpers iguais ao PDF
  const portaisVehiclesSet = new Set();
  (m.portaisItems || []).forEach((it) => {
    (it.vehicles || []).forEach((v) => {
      const cleanV = v === 'g1' ? 'G1'
        : v === 'ge' ? 'GE'
        : v === 'gshow' ? 'Gshow'
        : v === 'receitas' ? 'Receitas'
        : v === 'cartola' ? 'Cartola'
        : v === 'globo.com' ? 'Globo.com'
        : v === 'globoplay' ? 'Globoplay'
        : v;
      portaisVehiclesSet.add(cleanV);
    });
  });
  const portaisListLabel = Array.from(portaisVehiclesSet).join(', ') || 'Portais Globo e Globoplay';
  const portaisCpms = Array.from(new Set((m.portaisItems || []).map((it) => it.cpm).filter((v) => v > 0)));
  const portaisAvgCpm = c.portaisImpressions > 0 ? (f.portaisNet / (c.portaisImpressions / 1000)) : (portaisCpms[0] || 0);
  const portaisCpmLabel = portaisCpms.length === 1 ? fmtBRL(portaisCpms[0]) : fmtBRL(portaisAvgCpm);

  const revistasTitleNames = Array.from(new Set((m.revistasItems || []).map((it) => it.editorialTitle).filter(Boolean)));
  const revistasListLabel = revistasTitleNames.join(', ') || 'Editora Globo';
  const revistasCpms = Array.from(new Set((m.revistasItems || []).map((it) => it.cpm).filter((v) => v > 0)));
  const revistasAvgCpm = c.revistasImpressions > 0 ? (f.revistasNet / (c.revistasImpressions / 1000)) : (revistasCpms[0] || 0);
  const revistasCpmLabel = revistasCpms.length === 1 ? fmtBRL(revistasCpms[0]) : fmtBRL(revistasAvgCpm);

  const radioDurationsLabel = Array.from(new Set((m.radioItems || []).map((r) => `Spot de ${r.spotDuration || 30}s`))).join(' · ') || 'Spot de 30s';

  const sheetsData = [];

  // ==========================================================================
  // 1. ABA RESUMO DA PROPOSTA (Organizada visualmente com cabeçalhos laranja, títulos em bold e totais em bold)
  // ==========================================================================
  const resumoColsCount = 6;
  const resumoRows = [];
  const resumoMeta = {};
  const resumoMerges = [];

  const pushResumoRow = (arr, meta) => {
    const idx = resumoRows.length;
    resumoRows.push(arr);
    resumoMeta[idx] = meta;
    return idx;
  };

  const rTitleIdx = pushResumoRow(['PROPOSTA COMERCIAL — AQUI ADS'], { type: 'orange_title', maxCol: resumoColsCount });
  resumoMerges.push({ s: { r: rTitleIdx, c: 0 }, e: { r: rTitleIdx, c: resumoColsCount - 1 } });

  const rSubIdx = pushResumoRow([`${m.campaignName} · Proposta ${proposalDisplayId} · Período: ${m.startDate} a ${m.endDate} (${m.durationDays} dias)`], { type: 'orange_subtitle', maxCol: resumoColsCount });
  resumoMerges.push({ s: { r: rSubIdx, c: 0 }, e: { r: rSubIdx, c: resumoColsCount - 1 } });

  pushResumoRow([], { type: 'spacer' });

  // Bloco 1: Dados de Campanha
  const secCampIdx = pushResumoRow(['DADOS DE CAMPANHA'], { type: 'orange_section', maxCol: 2 });
  resumoMerges.push({ s: { r: secCampIdx, c: 0 }, e: { r: secCampIdx, c: 1 } });
  pushResumoRow(['Campo', 'Informação'], { type: 'table_header', maxCol: 2 });
  pushResumoRow(['Código da proposta', proposalDisplayId], { type: 'kv_row', maxCol: 2, boldValue: true });
  pushResumoRow(['Nome da campanha', m.campaignName], { type: 'kv_row', maxCol: 2 });
  pushResumoRow(['Duração da campanha', `${m.durationDays} dias corridos`], { type: 'kv_row', maxCol: 2 });
  pushResumoRow(['Período de veiculação', `${m.startDate} a ${m.endDate}`], { type: 'kv_row', maxCol: 2 });
  pushResumoRow(['Mix contratado', `${c.totalItems} ${c.totalItems === 1 ? 'produto contratado' : 'produtos contratados'}`], { type: 'kv_row', maxCol: 2 });

  pushResumoRow([], { type: 'spacer' });

  // Bloco 2: Dados de Faturamento
  const secFatIdx = pushResumoRow(['DADOS DE FATURAMENTO'], { type: 'orange_section', maxCol: 2 });
  resumoMerges.push({ s: { r: secFatIdx, c: 0 }, e: { r: secFatIdx, c: 1 } });
  pushResumoRow(['Campo', 'Informação'], { type: 'table_header', maxCol: 2 });
  pushResumoRow(['Razão social / Anunciante', billingCompany], { type: 'kv_row', maxCol: 2, boldValue: true });
  pushResumoRow(['CNPJ de faturamento', billingCnpj], { type: 'kv_row', maxCol: 2 });

  pushResumoRow([], { type: 'spacer' });

  // Bloco 3: Investimento Total e Subtotais
  const secInvIdx = pushResumoRow(['INVESTIMENTO TOTAL E SUBTOTAIS'], { type: 'orange_section', maxCol: 2 });
  resumoMerges.push({ s: { r: secInvIdx, c: 0 }, e: { r: secInvIdx, c: 1 } });
  pushResumoRow(['Item', 'Valor (R$)'], { type: 'table_header', maxCol: 2, rightHeaderCols: [1] });
  if (hasOoh) pushResumoRow(['Subtotal OOH — Telas Digitais e Estáticas', Number(f.oohNet.toFixed(2))], { type: 'data', dataIndex: 0, maxCol: 2, currencyCols: [1] });
  if (hasPortais) pushResumoRow(['Subtotal Portais e Globoplay — Vídeo e Display', Number(f.portaisNet.toFixed(2))], { type: 'data', dataIndex: 1, maxCol: 2, currencyCols: [1] });
  if (hasRevistas) pushResumoRow(['Subtotal Revistas e Jornais — Editora Globo Digital', Number(f.revistasNet.toFixed(2))], { type: 'data', dataIndex: 2, maxCol: 2, currencyCols: [1] });
  if (hasRadio) pushResumoRow(['Subtotal Rádio CBN — Spots de 30 segundos', Number(f.radioNet.toFixed(2))], { type: 'data', dataIndex: 3, maxCol: 2, currencyCols: [1] });
  pushResumoRow(['Valor bruto da proposta', Number(f.totalGrossProposal.toFixed(2))], { type: 'kv_row', maxCol: 2, currencyCols: [1] });
  if (f.totalDiscounts > 0) {
    pushResumoRow(['Descontos aplicados', Number((-f.totalDiscounts).toFixed(2))], { type: 'coupon', maxCol: 2, currencyCols: [1] });
  } else {
    pushResumoRow(['Descontos aplicados', 0], { type: 'kv_row', maxCol: 2, currencyCols: [1] });
  }
  pushResumoRow(['Investimento total líquido', Number(f.trueProposalTotal.toFixed(2))], { type: 'highlight_total', maxCol: 2, currencyCols: [1] });

  pushResumoRow([], { type: 'spacer' });

  // Bloco 4: Detalhamento de Métricas por Canal (Colunas organizadas sem colisão visual entre números e textos)
  const secMetIdx = pushResumoRow(['DETALHAMENTO DE MÉTRICAS POR CANAL'], { type: 'orange_section', maxCol: resumoColsCount });
  resumoMerges.push({ s: { r: secMetIdx, c: 0 }, e: { r: secMetIdx, c: resumoColsCount - 1 } });

  const metHeaderIdx = pushResumoRow([
    'Canal',
    'Unidade da Métrica',
    'Entrega Principal',
    'Inventário / Veículos',
    'Alcance / Frequência / CPM',
    'Subtotal Líquido (R$)'
  ], { type: 'table_header', maxCol: resumoColsCount, rightHeaderCols: [2, 5] });

  let metItemIdx = 0;
  if (hasOoh) {
    pushResumoRow([
      'OOH — Telas Digitais e Estáticas',
      'Impacto no período',
      c.oohImpacts,
      `${fmtInt(c.oohPointsCount)} pontos · ${fmtInt(c.oohScreensCount)} telas · ${oohDigitalPts > 0 ? `${fmtInt(c.oohTotalInsertions)} exibições` : 'Exibição fixa'}`,
      `Alcance: ${fmtInt(c.oohReach || c.oohImpacts)} · Frequência: ${fmtFreq(c.oohFrequency || 1.88)}`,
      Number(f.oohNet.toFixed(2))
    ], { type: 'data', dataIndex: metItemIdx++, maxCol: resumoColsCount, integerCols: [2], currencyCols: [5], boldCols: [0, 2, 5] });
  }
  if (hasPortais) {
    pushResumoRow([
      'Portais e Globoplay',
      'Impressões contratadas',
      c.portaisImpressions,
      `Portais: ${portaisListLabel}`,
      `CPM médio: ${portaisCpmLabel}`,
      Number(f.portaisNet.toFixed(2))
    ], { type: 'data', dataIndex: metItemIdx++, maxCol: resumoColsCount, integerCols: [2], currencyCols: [5], boldCols: [0, 2, 5] });
  }
  if (hasRevistas) {
    pushResumoRow([
      'Revistas e Jornais',
      'Impressões contratadas',
      c.revistasImpressions,
      `Títulos: ${revistasListLabel}`,
      `CPM médio: ${revistasCpmLabel}`,
      Number(f.revistasNet.toFixed(2))
    ], { type: 'data', dataIndex: metItemIdx++, maxCol: resumoColsCount, integerCols: [2], currencyCols: [5], boldCols: [0, 2, 5] });
  }
  if (hasRadio) {
    pushResumoRow([
      'Rádio CBN',
      'Inserções no período',
      c.radioTotalInsertions,
      `${fmtInt(c.radioCount)} praças/programas · ${fmtInt(c.radioWeeklyInsertions)} inserções/semana`,
      `Duração: ${radioDurationsLabel}`,
      Number(f.radioNet.toFixed(2))
    ], { type: 'data', dataIndex: metItemIdx++, maxCol: resumoColsCount, integerCols: [2], currencyCols: [5], boldCols: [0, 2, 5] });
  }

  const lastMetDataIdx = resumoRows.length - 1;
  pushResumoRow([
    'Total Geral da Proposta',
    `${c.totalItems} ${c.totalItems === 1 ? 'item no plano' : 'itens no plano'}`,
    '',
    '',
    '',
    Number(f.trueProposalTotal.toFixed(2))
  ], { type: 'highlight_total', maxCol: resumoColsCount, currencyCols: [5] });

  sheetsData.push({
    name: 'Resumo da Proposta',
    rows: resumoRows,
    colCount: resumoColsCount,
    merges: resumoMerges,
    rowMeta: resumoMeta,
    autofilterRef: lastMetDataIdx >= metHeaderIdx + 1
      ? `A${metHeaderIdx + 1}:F${lastMetDataIdx + 1}`
      : null,
    customCols: [
      { wch: 40 },
      { wch: 36 },
      { wch: 22 },
      { wch: 44 },
      { wch: 36 },
      { wch: 24 }
    ]
  });

  // ==========================================================================
  // 2. ABA OOH (Mesma tabela de OOH do PDF, com banner laranja, cabeçalho destacado, filtro e total em bold)
  // ==========================================================================
  if (hasOoh) {
    const oohColCount = 13;
    const oohRows = [
      ['OOH — Telas Digitais e Estáticas'],
      [`Subtotal OOH: ${fmtBRL(f.oohNet)}`],
      [],
      [
        'Código',
        'Ponto / Condomínio',
        'Endereço e Praça',
        'Torres',
        'Categoria',
        'Exibição e Resolução',
        'Telas',
        'Exibições',
        'Alcance',
        'Impacto',
        'Valor Bruto (R$)',
        'Desconto Condomínio (R$)',
        'Valor Líquido (R$)'
      ]
    ];
    const oohMeta = {
      0: { type: 'orange_title', maxCol: oohColCount },
      1: { type: 'orange_subtitle', maxCol: oohColCount },
      2: { type: 'spacer' },
      3: { type: 'table_header', maxCol: oohColCount }
    };

    m.oohDisplayGroups.forEach((g, idx) => {
      const isStatic = Boolean(g.isStatic);
      const exhType = isStatic ? 'Estático' : 'DOOH';
      let towersText = `${g.towersCount || 1} ${(g.towersCount || 1) === 1 ? 'torre' : 'torres'}`;
      if (g.kind === 'condo_group' && g.towers && g.towers.length > 1) {
        const shortTowers = g.towers.map((t) => {
          let rawName = String(t.name || '').trim();
          if (g.name && rawName.toLowerCase().startsWith(g.name.toLowerCase())) {
            rawName = rawName.slice(g.name.length).replace(/^[\s\-–—:·]+/, '').trim();
          } else if (rawName.includes(' - ')) {
            rawName = rawName.split(' - ').slice(1).join(' - ').trim();
          }
          return rawName || t.name;
        });
        towersText = `${g.towersCount} torres: ${shortTowers.join(' · ')}`;
      }
      const geoMeta = [g.district, g.city ? `${g.city}/${g.state || 'SP'}` : ''].filter(Boolean).join(', ');
      const fullAddress = `${g.address}${geoMeta ? ` · ${geoMeta}` : ''}`;
      const reachVal = g.reach || 0;
      const impactVal = g.impacts || g.reach || 0;

      const rIdx = oohRows.length;
      oohRows.push([
        `#${g.displayCode || g.code}`,
        g.name,
        fullAddress,
        towersText,
        g.vertical,
        `${exhType} · ${g.resolution || '1080x1920'}`,
        g.screens,
        isStatic ? 'Fixa' : g.periodInsertions,
        reachVal > 0 ? reachVal : '—',
        impactVal > 0 ? impactVal : '—',
        Number(g.originalPrice.toFixed(2)),
        Number((g.residentDiscount || 0).toFixed(2)),
        Number(g.netPrice.toFixed(2))
      ]);
      oohMeta[rIdx] = { type: 'data', dataIndex: idx, maxCol: oohColCount };
    });

    const lastOohItemRow1Based = oohRows.length; // 1-based Excel row of the last item

    if (f.couponDiscount > 0) {
      const cIdx = oohRows.length;
      oohRows.push([
        'Cupom OOH',
        `Cupom promocional aplicado em OOH (${state.couponCode || 'AQUIADS10'} · -10% sobre subtotal líquido OOH)`,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        Number(f.couponDiscount.toFixed(2)),
        Number((-f.couponDiscount).toFixed(2))
      ]);
      oohMeta[cIdx] = { type: 'coupon', maxCol: oohColCount };
    }

    const totOohIdx = oohRows.length;
    oohRows.push([
      'Total OOH',
      `${m.oohDisplayGroups.length} ${m.oohDisplayGroups.length === 1 ? 'ponto/condomínio' : 'pontos/condomínios'}`,
      '',
      '',
      '',
      '',
      c.oohScreensCount,
      oohDigitalPts > 0 ? c.oohTotalInsertions : 'Fixa',
      c.oohReach || c.oohImpacts,
      c.oohImpacts,
      Number(f.oohGross.toFixed(2)),
      Number((f.oohResidentDiscounts + f.couponDiscount).toFixed(2)),
      Number(f.oohNet.toFixed(2))
    ]);
    oohMeta[totOohIdx] = { type: 'total', maxCol: oohColCount };

    sheetsData.push({
      name: 'OOH',
      rows: oohRows,
      colCount: oohColCount,
      merges: [
        { s: { r: 0, c: 0 }, e: { r: 0, c: oohColCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: oohColCount - 1 } }
      ],
      rowMeta: oohMeta,
      integerCols: [6, 7, 8, 9],
      currencyCols: [10, 11, 12],
      centerCols: [0, 6],
      boldCols: [0, 1, 12],
      autofilterRef: `A4:M${lastOohItemRow1Based}`
    });
  }

  // ==========================================================================
  // 3. ABA PORTAIS E GLOBOPLAY
  // ==========================================================================
  if (hasPortais) {
    const portaisColCount = 11;
    const portaisRows = [
      ['Portais e Globoplay — Vídeo e Display'],
      [`Subtotal Portais e Globoplay: ${fmtBRL(f.portaisNet)}`],
      [],
      [
        'Código',
        'Produto / Formato',
        'Contexto',
        'Ambiente',
        'Veículos',
        'Especificação',
        'Detalhes Técnicos',
        'Abrangência',
        'Impressões',
        'CPM (R$)',
        'Valor Líquido (R$)'
      ]
    ];
    const portaisMeta = {
      0: { type: 'orange_title', maxCol: portaisColCount },
      1: { type: 'orange_subtitle', maxCol: portaisColCount },
      2: { type: 'spacer' },
      3: { type: 'table_header', maxCol: portaisColCount }
    };

    m.portaisItems.forEach((p, idx) => {
      const rIdx = portaisRows.length;
      portaisRows.push([
        `#${p.code}`,
        p.cleanTitle || p.name,
        p.subtitleContext || '',
        p.channelTypeLabel || p.vertical,
        (p.vehicles || []).join(', ').toUpperCase(),
        p.formatTagLabel || p.mediaTypeLabel,
        p.techSpecFooter || '',
        'Nacional / Seg.',
        p.impressions,
        Number(p.cpm.toFixed(2)),
        Number(p.totalPrice.toFixed(2))
      ]);
      portaisMeta[rIdx] = { type: 'data', dataIndex: idx, maxCol: portaisColCount };
    });

    const lastPortaisItemRow1Based = portaisRows.length;
    const totPortaisIdx = portaisRows.length;
    portaisRows.push([
      'Total Portais e Globoplay',
      `${m.portaisItems.length} ${m.portaisItems.length === 1 ? 'formato' : 'formatos'}`,
      '',
      '',
      '',
      '',
      '',
      '',
      c.portaisImpressions,
      Number(portaisAvgCpm.toFixed(2)),
      Number(f.portaisNet.toFixed(2))
    ]);
    portaisMeta[totPortaisIdx] = { type: 'total', maxCol: portaisColCount };

    sheetsData.push({
      name: 'Portais e Globoplay',
      rows: portaisRows,
      colCount: portaisColCount,
      merges: [
        { s: { r: 0, c: 0 }, e: { r: 0, c: portaisColCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: portaisColCount - 1 } }
      ],
      rowMeta: portaisMeta,
      integerCols: [8],
      currencyCols: [9, 10],
      centerCols: [0, 7],
      boldCols: [0, 1, 10],
      autofilterRef: `A4:K${lastPortaisItemRow1Based}`
    });
  }

  // ==========================================================================
  // 4. ABA REVISTAS E JORNAIS
  // ==========================================================================
  if (hasRevistas) {
    const revistasColCount = 9;
    const revistasRows = [
      ['Revistas e Jornais — Editora Globo Digital'],
      [`Subtotal Revistas e Jornais: ${fmtBRL(f.revistasNet)}`],
      [],
      [
        'Código',
        'Título editorial',
        'Formato',
        'Dimensões',
        'Posicionamento',
        'Abrangência',
        'Impressões',
        'CPM (R$)',
        'Valor Líquido (R$)'
      ]
    ];
    const revistasMeta = {
      0: { type: 'orange_title', maxCol: revistasColCount },
      1: { type: 'orange_subtitle', maxCol: revistasColCount },
      2: { type: 'spacer' },
      3: { type: 'table_header', maxCol: revistasColCount }
    };

    m.revistasItems.forEach((r, idx) => {
      const rIdx = revistasRows.length;
      revistasRows.push([
        `#${r.code}`,
        r.editorialTitle,
        'Display Editorial Multi-Formato',
        '970×250, 300×250, 300×600, 320×50 px',
        'Capa e Editorias · Web & Mobile',
        'Nacional / BR',
        r.impressions,
        Number(r.cpm.toFixed(2)),
        Number(r.totalPrice.toFixed(2))
      ]);
      revistasMeta[rIdx] = { type: 'data', dataIndex: idx, maxCol: revistasColCount };
    });

    const lastRevistasItemRow1Based = revistasRows.length;
    const totRevistasIdx = revistasRows.length;
    revistasRows.push([
      'Total Revistas e Jornais',
      `${m.revistasItems.length} ${m.revistasItems.length === 1 ? 'título' : 'títulos'}`,
      '',
      '',
      '',
      '',
      c.revistasImpressions,
      Number(revistasAvgCpm.toFixed(2)),
      Number(f.revistasNet.toFixed(2))
    ]);
    revistasMeta[totRevistasIdx] = { type: 'total', maxCol: revistasColCount };

    sheetsData.push({
      name: 'Revistas e Jornais',
      rows: revistasRows,
      colCount: revistasColCount,
      merges: [
        { s: { r: 0, c: 0 }, e: { r: 0, c: revistasColCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: revistasColCount - 1 } }
      ],
      rowMeta: revistasMeta,
      integerCols: [6],
      currencyCols: [7, 8],
      centerCols: [0, 5],
      boldCols: [0, 1, 8],
      autofilterRef: `A4:I${lastRevistasItemRow1Based}`
    });
  }

  // ==========================================================================
  // 5. ABA RÁDIO CBN
  // ==========================================================================
  if (hasRadio) {
    const radioColCount = 10;
    const radioRows = [
      ['Rádio CBN — Spots de 30 segundos'],
      [`Subtotal Rádio CBN: ${fmtBRL(f.radioNet)}`],
      [],
      [
        'Código',
        'Emissora',
        'Praça (Cidade/UF)',
        'Programa',
        'Frequência e faixa horária',
        'Formato',
        'Spots/sem.',
        'Inserções',
        'Valor unit. (R$)',
        'Valor líquido (R$)'
      ]
    ];
    const radioMeta = {
      0: { type: 'orange_title', maxCol: radioColCount },
      1: { type: 'orange_subtitle', maxCol: radioColCount },
      2: { type: 'spacer' },
      3: { type: 'table_header', maxCol: radioColCount }
    };

    m.radioItems.forEach((rd, idx) => {
      const rIdx = radioRows.length;
      radioRows.push([
        `#${rd.code}`,
        rd.stationName,
        `${rd.city}/${rd.state}`,
        rd.cleanTitle || rd.programLabel,
        `${rd.frequencyDaysLabel} · ${rd.timeWindow}`,
        `Spot ${rd.spotDuration}"`,
        rd.weeklyInsertions,
        rd.totalInsertions,
        Number(rd.unitInsertionPrice.toFixed(2)),
        Number(rd.totalPrice.toFixed(2))
      ]);
      radioMeta[rIdx] = { type: 'data', dataIndex: idx, maxCol: radioColCount };
    });

    const lastRadioItemRow1Based = radioRows.length;
    const totRadioIdx = radioRows.length;
    radioRows.push([
      'Total Rádio CBN',
      `${m.radioItems.length} ${m.radioItems.length === 1 ? 'praça/programa' : 'praças/programas'}`,
      '',
      '',
      '',
      '',
      c.radioWeeklyInsertions,
      c.radioTotalInsertions,
      '—',
      Number(f.radioNet.toFixed(2))
    ]);
    radioMeta[totRadioIdx] = { type: 'total', maxCol: radioColCount };

    sheetsData.push({
      name: 'Rádio CBN',
      rows: radioRows,
      colCount: radioColCount,
      merges: [
        { s: { r: 0, c: 0 }, e: { r: 0, c: radioColCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: radioColCount - 1 } }
      ],
      rowMeta: radioMeta,
      integerCols: [6, 7],
      currencyCols: [8, 9],
      centerCols: [0, 5, 6],
      boldCols: [0, 1, 9],
      autofilterRef: `A4:J${lastRadioItemRow1Based}`
    });
  }

  // Exportação nativa em .xlsx estilizada via SheetJS (xlsx-js-style)
  if (typeof window !== 'undefined' && window.XLSX && window.XLSX.utils) {
    const wb = window.XLSX.utils.book_new();
    sheetsData.forEach((sheet) => {
      const ws = window.XLSX.utils.aoa_to_sheet(sheet.rows);
      applyStyledWorksheet(ws, sheet);
      ws['!cols'] = sheet.customCols || autoFitSheetColumns(sheet.rows, 16);
      window.XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
    });
    window.XLSX.writeFile(wb, `proposta_aquiads_${m.id}.xlsx`);
    showToast('Planilha Excel (.xlsx) exportada e estilizada com filtros');
    return;
  }

  // Fallback SpreadsheetML (.xls estilizado com múltiplas abas e AutoFilter) caso offline
  const xmlEsc = (v) => String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const worksheetsXml = sheetsData.map((sheet) => {
    const rowMetaMap = sheet.rowMeta || {};
    const rowsXml = sheet.rows.map((r, rIdx) => {
      const rType = (rowMetaMap[rIdx] && rowMetaMap[rIdx].type) || 'data';
      const styleId = (rType === 'orange_title' || rType === 'orange_subtitle' || rType === 'orange_section')
        ? 'sOrange'
        : rType === 'table_header'
          ? 'sHeader'
          : (rType === 'total' || rType === 'highlight_total')
            ? 'sTotal'
            : 'sData';
      const cellsXml = (r || []).map((cell) => {
        const isNum = typeof cell === 'number' && Number.isFinite(cell);
        return `<Cell ss:StyleID="${styleId}"><Data ss:Type="${isNum ? 'Number' : 'String'}">${xmlEsc(cell)}</Data></Cell>`;
      }).join('');
      return `<Row>${cellsXml}</Row>`;
    }).join('');
    return `<Worksheet ss:Name="${xmlEsc(sheet.name.slice(0, 31))}"><Table>${rowsXml}</Table></Worksheet>`;
  }).join('');

  const workbookXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="sOrange"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#F15A22" ss:Pattern="Solid"/></Style>
  <Style ss:ID="sHeader"><Font ss:Bold="1" ss:Color="#121212"/><Interior ss:Color="#E8E0D5" ss:Pattern="Solid"/></Style>
  <Style ss:ID="sTotal"><Font ss:Bold="1" ss:Color="#121212"/><Interior ss:Color="#F3ECE4" ss:Pattern="Solid"/></Style>
  <Style ss:ID="sData"><Font ss:Color="#121212"/></Style>
 </Styles>
 ${worksheetsXml}
</Workbook>`;

  const blob = new Blob([workbookXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `proposta_aquiads_${m.id}.xls`;
  link.click();
  showToast('Planilha Excel exportada com abas por canal');
}

function exportFullXml() {
  const m = getCurrentModel();
  const f = m.financials;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PropostaAquiAds id="${m.id}">
  <Cabecalho>
    <Periodo inicio="${m.startDate}" fim="${m.endDate}" dias="${m.durationDays}" />
  </Cabecalho>
  <ResumoFinanceiro moeda="BRL">
    <TotalBruto>${f.totalGrossProposal.toFixed(2)}</TotalBruto>
    <Descontos>${f.totalDiscounts.toFixed(2)}</Descontos>
    <ValorTotalProposta>${f.trueProposalTotal.toFixed(2)}</ValorTotalProposta>
    <PagoOnlineOohDigital>${f.onlinePayableNow.toFixed(2)}</PagoOnlineOohDigital>
    <FaturamentoDedicadoRadio>${f.radioNet.toFixed(2)}</FaturamentoDedicadoRadio>
  </ResumoFinanceiro>
</PropostaAquiAds>`;

  const blob = new Blob([xml], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `proposta_aquiads_${m.id}.xml`;
  link.click();
  showToast('Arquivo XML exportado com sucesso');
}

window.addEventListener('DOMContentLoaded', initApp);
