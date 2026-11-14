const locationNameInput = document.getElementById('locationName');
const latInput = document.getElementById('lat');
const lonInput = document.getElementById('lon');
const runBtn = document.getElementById('run');
const statusEl = document.getElementById('status');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const cropSelect = document.getElementById('crop');
const prevCropSelect = document.getElementById('prevCrop');

const CROP_DB = {
  maiz:     { label: 'Maíz',            family: 'graminea',      gwetRange: [0.40, 0.70], tempRange: [18, 27] },
  arroz:    { label: 'Arroz',           family: 'graminea',      gwetRange: [0.70, 1.00], tempRange: [22, 32] },
  trigo:    { label: 'Trigo',           family: 'graminea',      gwetRange: [0.30, 0.60], tempRange: [12, 24] },
  cebada:   { label: 'Cebada',          family: 'graminea',      gwetRange: [0.25, 0.50], tempRange: [10, 20] },
  avena:    { label: 'Avena',           family: 'graminea',      gwetRange: [0.30, 0.55], tempRange: [10, 20] },
  sorgo:    { label: 'Sorgo',           family: 'graminea',      gwetRange: [0.30, 0.55], tempRange: [20, 30] },
  mijo:     { label: 'Mijo',            family: 'graminea',      gwetRange: [0.30, 0.50], tempRange: [25, 35] },
  cana:     { label: 'Caña de azúcar',  family: 'graminea',      gwetRange: [0.60, 0.85], tempRange: [22, 32] },
  soja:     { label: 'Soja',            family: 'leguminosa',    gwetRange: [0.40, 0.70], tempRange: [20, 30] },
  girasol:  { label: 'Girasol',         family: 'asteracea',     gwetRange: [0.25, 0.55], tempRange: [18, 27] },
  mani:     { label: 'Maní',            family: 'leguminosa',    gwetRange: [0.35, 0.65], tempRange: [22, 30] },
  algodon:  { label: 'Algodón',         family: 'malvaceae',     gwetRange: [0.40, 0.65], tempRange: [25, 35] },
  palma:    { label: 'Palma aceitera',  family: 'arecaceae',     gwetRange: [0.50, 0.80], tempRange: [26, 32] },
  oliva:    { label: 'Oliva',           family: 'oleaceae',      gwetRange: [0.30, 0.50], tempRange: [15, 25] },
  frijol:   { label: 'Frijol',          family: 'leguminosa',    gwetRange: [0.40, 0.65], tempRange: [18, 25] },
  poroto:   { label: 'Poroto',          family: 'leguminosa',    gwetRange: [0.40, 0.65], tempRange: [18, 25] },
  lenteja:  { label: 'Lenteja',         family: 'leguminosa',    gwetRange: [0.30, 0.50], tempRange: [15, 22] },
  garbanzo: { label: 'Garbanzo',        family: 'leguminosa',    gwetRange: [0.30, 0.50], tempRange: [15, 25] },
  alfalfa:  { label: 'Alfalfa',         family: 'leguminosa',    gwetRange: [0.35, 0.65], tempRange: [15, 25] },
  papa:     { label: 'Papa',            family: 'solanacea',     gwetRange: [0.50, 0.75], tempRange: [15, 20] },
  yuca:     { label: 'Yuca / Mandioca', family: 'euphorbiaceae', gwetRange: [0.40, 0.70], tempRange: [22, 29] },
  camote:   { label: 'Camote',          family: 'convolvulaceae',gwetRange: [0.40, 0.65], tempRange: [20, 30] },
  tomate:   { label: 'Tomate',          family: 'solanacea',     gwetRange: [0.45, 0.70], tempRange: [18, 27] },
  pimiento: { label: 'Pimiento / Chile',family: 'solanacea',     gwetRange: [0.40, 0.65], tempRange: [18, 27] },
  cebolla:  { label: 'Cebolla',         family: 'alliaceae',     gwetRange: [0.35, 0.60], tempRange: [15, 25] },
  ajo:      { label: 'Ajo',             family: 'alliaceae',     gwetRange: [0.30, 0.50], tempRange: [12, 20] },
  zanahoria:{ label: 'Zanahoria',       family: 'apiaceae',      gwetRange: [0.40, 0.65], tempRange: [15, 22] },
  lechuga:  { label: 'Lechuga',         family: 'asteraceae',    gwetRange: [0.40, 0.65], tempRange: [10, 18] },
  sandia:   { label: 'Sandía',          family: 'cucurbitaceae', gwetRange: [0.45, 0.70], tempRange: [22, 30] },
  melon:    { label: 'Melón',           family: 'cucurbitaceae', gwetRange: [0.40, 0.65], tempRange: [20, 28] },
  calabaza: { label: 'Calabaza',        family: 'cucurbitaceae', gwetRange: [0.40, 0.65], tempRange: [18, 27] },
  cafe:     { label: 'Café',            family: 'rubiaceae',     gwetRange: [0.50, 0.75], tempRange: [18, 26] },
  banano:   { label: 'Banano',          family: 'musaceae',      gwetRange: [0.50, 0.80], tempRange: [26, 30] },
  cacao:    { label: 'Cacao',           family: 'malvaceae',     gwetRange: [0.50, 0.75], tempRange: [22, 28] },
  uva:      { label: 'Uva',             family: 'vitaceae',      gwetRange: [0.35, 0.55], tempRange: [15, 25] },
  tabaco:   { label: 'Tabaco',          family: 'solanacea',     gwetRange: [0.40, 0.65], tempRange: [18, 27] },
  pina:     { label: 'Piña',            family: 'bromeliaceae',  gwetRange: [0.45, 0.70], tempRange: [22, 30] },
  aguacate: { label: 'Aguacate',        family: 'lauraceae',     gwetRange: [0.45, 0.70], tempRange: [18, 26] },
  naranja:  { label: 'Naranja',         family: 'rutaceae',      gwetRange: [0.40, 0.65], tempRange: [15, 30] },
  manzana:  { label: 'Manzana',         family: 'rosaceae',      gwetRange: [0.35, 0.60], tempRange: [12, 24] },
  cardamomo:{ label: 'Cardamomo',       family: 'zingiberaceae', gwetRange: [0.50, 0.75], tempRange: [20, 28] },
  te:       { label: 'Té',             family: 'theaceae',      gwetRange: [0.50, 0.80], tempRange: [15, 30] },
  yute:     { label: 'Yute',           family: 'malvaceae',     gwetRange: [0.60, 0.90], tempRange: [25, 35] },
  caucho:   { label: 'Caucho',         family: 'euphorbiaceae', gwetRange: [0.60, 0.85], tempRange: [24, 32] },
  coco:     { label: 'Coco',           family: 'arecaceae',     gwetRange: [0.50, 0.80], tempRange: [22, 32] },
  datil:    { label: 'Dátil',          family: 'arecaceae',     gwetRange: [0.20, 0.45], tempRange: [25, 40] },
  colza:    { label: 'Colza',          family: 'brassicaceae',  gwetRange: [0.35, 0.60], tempRange: [8, 22] },
  remolacha:{ label: 'Remolacha',      family: 'amaranthaceae', gwetRange: [0.40, 0.70], tempRange: [10, 22] },
};

const FAMILY_LABEL = {
  graminea: 'gramínea', leguminosa: 'leguminosa', asteracea: 'asterácea',
  solanacea: 'solanácea', malvaceae: 'malvácea', alliaceae: 'aliácea',
  apiaceae: 'apiácea', cucurbitaceae: 'cucurbitácea', rubiaceae: 'rubiácea',
  musaceae: 'musácea', vitaceae: 'vitácea', oleaceae: 'oleácea',
  arecaceae: 'arecácea', euphorbiaceae: 'euforbiácea', convolvulaceae: 'convolvulácea',
  bromeliaceae: 'bromeliácea', lauraceae: 'laurácea', rutaceae: 'rutácea',
  rosaceae: 'rosácea', zingiberaceae: 'zingiberácea',
  theaceae: 'teácea', brassicaceae: 'brasicácea', amaranthaceae: 'amarantácea',
};

const COUNTRY_CROPS = {
  // Norte América
  US: ['maiz','soja','trigo','cebada','algodon','tabaco','uva','manzana','naranja','sandia','papa','cebolla','tomate'],
  CA: ['trigo','cebada','avena','colza','papa','frijol','zanahoria','manzana','uva'],
  MX: ['maiz','frijol','pimiento','aguacate','tomate','cafe','cana','algodon','sorgo','cebada','papa','cebolla','ajo','sandia','naranja','pina'],
  // Centroamérica
  BZ: ['cana','banano','naranja','maiz','arroz','papa','cebolla'],
  GT: ['maiz','frijol','cafe','cana','banano','palma','tomate','cebolla','cardamomo','pimiento'],
  HN: ['cafe','banano','palma','maiz','frijol','cana','sorgo','arroz','tomate','cebolla'],
  SV: ['maiz','cafe','cana','arroz','frijol','sorgo','papa','cebolla'],
  NI: ['cafe','cana','maiz','arroz','frijol','banano','palma','papa','tomate'],
  CR: ['banano','cafe','pina','palma','cana','arroz','frijol','papa','naranja'],
  PA: ['banano','cafe','cana','arroz','maiz','papa','cebolla','tomate','naranja'],
  // Caribe
  CU: ['cana','tabaco','cafe','arroz','maiz','frijol','yuca','papa','tomate','cebolla'],
  JM: ['cafe','banano','cana','pina','naranja','tabaco','aguacate'],
  HT: ['arroz','maiz','sorgo','frijol','yuca','banano','papa','cebolla'],
  DO: ['cana','arroz','maiz','banano','cafe','cacao','tabaco','frijol','pimiento','tomate'],
  PR: ['cafe','banano','pina','naranja','papa','cebolla','tomate'],
  BS: ['cana','naranja','aguacate','tomate','cebolla','papa','pimiento'],
  BB: ['cana','papa','cebolla','maiz','pimiento','naranja','lechuga'],
  TT: ['cana','cafe','cacao','arroz','uva','naranja','pimiento','tabaco'],
  AG: ['cana','banano','pina','naranja','maiz','tomate','cebolla'],
  DM: ['banano','naranja','pina','sandia','calabaza','cebolla','pimiento'],
  GD: ['cana','naranja','banano','cacao','pina','tomate'],
  KN: ['pina','naranja','banano','aguacate','tomate','cebolla','pimiento'],
  LC: ['banano','cana','pina','coco','aguacate','cacao','cebolla'],
  VC: ['banano','cana','coco','naranja','camote','cebolla','papa'],
  // Sudamérica
  AR: ['soja','maiz','trigo','girasol','mani','cebada','avena','sorgo','algodon','cana','uva','oliva','alfalfa','papa','tomate','cebolla','ajo','sandia','naranja','manzana'],
  BO: ['soja','cana','papa','maiz','arroz','frijol','trigo','cebada','cebolla','tomate','lenteja','garbanzo'],
  BR: ['soja','cafe','cana','maiz','algodon','arroz','frijol','palma','uva','trigo','cebada','tomate','papa','sandia','melon','pina','naranja','aguacate'],
  CL: ['uva','pina','manzana','trigo','maiz','avena','papa','arroz','cebada','tomate','cebolla','oliva','naranja'],
  CO: ['cafe','banano','cacao','arroz','maiz','papa','yuca','soja','frijol','pimiento','palma','tomate','cebolla','cana','aguacate','pina','sandia'],
  EC: ['banano','cafe','cacao','arroz','maiz','papa','yuca','cebolla','tomate','cana','naranja','pina'],
  GY: ['arroz','cana','banano','yuca','maiz','papa','naranja','coco'],
  PE: ['papa','maiz','arroz','yuca','cafe','banano','cana','oliva','uva','cebolla','tomate','frijol','aguacate','naranja'],
  PY: ['soja','maiz','girasol','algodon','cana','arroz','yuca','sorgo','mani'],
  SR: ['arroz','banano','pina','palma','maiz','naranja','cebolla'],
  UY: ['soja','arroz','trigo','maiz','cebada','girasol','alfalfa','cana'],
  VE: ['cana','arroz','maiz','cafe','banano','cacao','yuca','papa','tomate','cebolla','sorgo','pimiento','sandia','mani'],
  // Europa
  ES: ['trigo','cebada','avena','maiz','oliva','uva','girasol','arroz','papa','cebolla','tomate','pimiento','ajo','sandia','melon','naranja','manzana'],
  FR: ['trigo','uva','girasol','maiz','remolacha','cebada','avena','papa','cebolla','tomate','manzana','colza','zanahoria','lechuga'],
  IT: ['trigo','uva','oliva','maiz','tomate','pimiento','cebolla','ajo','sandia','melon','naranja','manzana','alfalfa','papa'],
  DE: ['trigo','cebada','remolacha','colza','papa','cebolla','maiz','tomate','zanahoria','manzana','uva'],
  PT: ['trigo','uva','oliva','maiz','tomate','cebolla','ajo','sandia','melon','naranja','manzana','cebada'],
  GB: ['trigo','cebada','avena','papa','cebolla','maiz','tomate','zanahoria','manzana','colza','lechuga'],
  NL: ['trigo','cebada','papa','cebolla','zanahoria','tomate','sandia','manzana','remolacha','colza'],
  BE: ['trigo','cebada','papa','cebolla','remolacha','colza','uva','lechuga','tomate'],
  PL: ['trigo','cebada','avena','papa','cebolla','maiz','colza','remolacha','manzana','sandia','girasol'],
  RO: ['trigo','maiz','girasol','uva','papa','cebolla','tomate','pimiento','ajo','manzana','cebada','soja'],
  GR: ['trigo','uva','oliva','arroz','cebolla','tomate','algodon','naranja','tabaco','cebada','maiz','papa'],
  UA: ['trigo','maiz','girasol','cebada','papa','cebolla','remolacha','uva','tabaco','sorgo','soja'],
  SE: ['trigo','cebada','avena','colza','papa','remolacha','uva','manzana'],
  DK: ['trigo','cebada','avena','colza','remolacha','papa','cebolla','maiz','zanahoria'],
  AT: ['trigo','cebada','maiz','uva','papa','cebolla','remolacha','colza','manzana'],
  CH: ['trigo','cebada','uva','manzana','maiz','remolacha','papa','cebolla','tomate','zanahoria'],
  HU: ['trigo','maiz','girasol','cebada','uva','papa','cebolla','remolacha','tabaco','sandia','melon'],
  CZ: ['trigo','cebada','remolacha','colza','papa','cebolla','maiz','manzana','soja','girasol'],
  IE: ['trigo','cebada','avena','colza','papa','remolacha','cebolla'],
  FI: ['trigo','cebada','avena','colza','papa','remolacha','manzana'],
  NO: ['trigo','cebada','avena','papa','colza','cebolla','zanahoria'],
  RS: ['trigo','maiz','girasol','cebada','papa','cebolla','remolacha','tabaco','uva','soja'],
  BG: ['trigo','girasol','maiz','uva','cebada','papa','cebolla','tomate','pimiento','ajo','soja','naranja'],
  HR: ['trigo','maiz','cebada','girasol','papa','uva','oliva','tabaco','colza','soja'],
  SK: ['trigo','cebada','maiz','girasol','papa','colza','remolacha','uva','soja'],
  LT: ['trigo','cebada','avena','remolacha','colza','papa','girasol','maiz','soja'],
  LV: ['trigo','cebada','avena','remolacha','colza','papa','girasol'],
  EE: ['trigo','cebada','avena','remolacha','colza','papa','cebolla'],
  SI: ['trigo','cebada','maiz','uva','papa','remolacha','tabaco','soja','girasol'],
  CY: ['trigo','cebada','uva','oliva','papa','cebolla','naranja','sandia'],
  MT: ['trigo','cebada','uva','oliva','papa','cebolla','naranja'],
  LU: ['trigo','cebada','uva','remolacha','papa','colza','avena','cebolla'],
  IS: ['trigo','cebada','avena','papa','zanahoria','cebolla'],
  AL: ['trigo','maiz','uva','oliva','tabaco','cebada','cebolla','tomate','papa','girasol','naranja'],
  BA: ['trigo','maiz','uva','papa','cebolla','cebada','tabaco','sorgo'],
  ME: ['maiz','tabaco','uva','oliva','papa','cebolla','trigo','cebada'],
  MK: ['trigo','maiz','uva','tabaco','papa','cebolla','cebada','girasol','soja'],
  XK: ['trigo','maiz','uva','tabaco','papa','cebolla','cebada','girasol','soja'],
  MD: ['girasol','maiz','trigo','uva','tabaco','papa','cebolla','soja','cebada'],
  BY: ['papa','trigo','cebada','maiz','colza','remolacha','girasol','avena','cebolla'],
  RU: ['trigo','cebada','remolacha','colza','girasol','avena','papa','maiz','uva','cebolla','soja','algodon'],
  // Medio Oriente
  TR: ['trigo','cebada','maiz','uva','algodon','naranja','tabaco','tomate','papa','cebolla','remolacha','oliva','pimiento','girasol','sandia'],
  SA: ['cana','trigo','cebada','datil','maiz','arroz','papa','tomate','cebolla','lechuga','naranja'],
  AE: ['datil','cana','trigo','cebada','maiz','tomate','papa','cebolla','lechuga','pimiento'],
  IQ: ['trigo','cebada','datil','arroz','maiz','papa','cebolla','tomate','uva','tabaco'],
  IR: ['trigo','cebada','datil','arroz','maiz','uva','papa','cebolla','pimiento','tabaco','te','naranja'],
  SY: ['trigo','cebada','datil','uva','algodon','arroz','maiz','papa','cebolla','tabaco','oliva'],
  JO: ['trigo','cebada','datil','uva','oliva','papa','cebolla','tomate','tabaco','naranja'],
  LB: ['uva','oliva','trigo','cebada','banano','papa','cebolla','tomate','maiz','naranja'],
  IL: ['tabaco','uva','papa','cebolla','tomate','trigo','lechuga','maiz','sandia','pimiento','naranja'],
  YE: ['datil','trigo','cebada','maiz','arroz','sorgo','papa','cebolla','tabaco'],
  OM: ['datil','cana','trigo','cebada','maiz','arroz','papa','cebolla','tomate','naranja'],
  KW: ['datil','cana','cebada','trigo','maiz','tomate','papa','cebolla'],
  QA: ['datil','cana','trigo','cebada','maiz','papa','cebolla','tomate'],
  BH: ['datil','cana','trigo','cebada','maiz','papa','cebolla','tomate'],
  // Asia Central
  TM: ['algodon','trigo','arroz','cebada','uva','datil','sorgo','papa','tabaco','tomate'],
  TJ: ['algodon','arroz','trigo','cebada','maiz','papa','cebolla','tabaco','uva','tomate'],
  KG: ['trigo','cebada','arroz','maiz','algodon','uva','papa','tabaco','remolacha','cebolla'],
  KZ: ['trigo','cebada','arroz','algodon','maiz','girasol','papa','uva','cebolla','tomate'],
  UZ: ['trigo','algodon','arroz','cebada','maiz','sorgo','uva','papa','tabaco','naranja','cebolla'],
  // Cáucaso
  GE: ['uva','maiz','trigo','cebada','cebolla','naranja','tabaco','te'],
  AM: ['uva','trigo','maiz','cebada','tabaco','papa','cebolla','naranja'],
  AZ: ['algodon','trigo','uva','maiz','cebada','tabaco','datil','te','papa','cebolla','tomate'],
  // Sur y Sudeste Asiático
  IN: ['arroz','trigo','maiz','soja','algodon','cebada','te','cafe','cana','papa','cebolla','frijol','lenteja','garbanzo','naranja'],
  CN: ['arroz','trigo','maiz','soja','algodon','cebada','avena','te','uva','manzana','sandia','papa','tabaco','remolacha','colza','cebolla'],
  JP: ['arroz','trigo','soja','cebada','uva','manzana','sandia','tabaco','papa','cebolla','avena','melon'],
  KR: ['arroz','trigo','soja','cebada','uva','manzana','tabaco','papa','cebolla','maiz','sandia','pimiento'],
  TH: ['arroz','caucho','maiz','cana','pina','yuca','pimiento','coco','palma','frijol','tabaco','manzana'],
  VN: ['arroz','cafe','caucho','maiz','papa','tabaco','mani','yuca','cebolla','sandia','pina','coco','naranja'],
  ID: ['arroz','palma','caucho','cafe','cacao','coco','maiz','papa','cebolla','tabaco','pina','yuca'],
  PH: ['arroz','coco','banano','cafe','palma','pina','cebolla','maiz','papa','tabaco','uva'],
  MY: ['palma','caucho','coco','arroz','tabaco','pina','cebolla','lechuga','pimiento','naranja'],
  PK: ['arroz','trigo','maiz','algodon','cana','cebada','frijol','papa','cebolla','te','garbanzo','naranja'],
  BD: ['arroz','yute','papa','tabaco','te','cana','frijol','cebolla','maiz','cebada'],
  LK: ['arroz','te','coco','papa','cebolla','pimiento','tabaco','cana','uva','manzana','pina'],
  NP: ['arroz','maiz','trigo','papa','cebolla','tabaco','pimiento','yuca','yute','te','lenteja'],
  MM: ['arroz','yute','maiz','frijol','sorgo','papa','cebolla','caucho','tabaco','coco','manzana'],
  KH: ['arroz','caucho','maiz','papa','yuca','tabaco','cebolla','coco','mani','pimiento'],
  TW: ['arroz','cana','tabaco','uva','papa','cebolla','maiz','sandia','manzana','naranja','pina'],
  LA: ['arroz','caucho','maiz','cafe','banano','papa','cebolla','tabaco','coco','yuca'],
  BN: ['palma','caucho','arroz','coco','papa','cebolla','tomate','maiz','naranja'],
  MN: ['trigo','cebada','maiz','papa','sorgo','cebolla','tomate','sandia'],
  AF: ['trigo','cebada','maiz','algodon','arroz','uva','papa','frijol','sorgo','naranja','datil'],
  // África del Norte
  DZ: ['cebada','trigo','uva','oliva','cebolla','naranja','datil','algodon','arroz','sorgo','papa','tomate'],
  EG: ['arroz','trigo','maiz','cebada','datil','algodon','uva','naranja','papa','cebolla','tabaco','tomate'],
  LY: ['oliva','cebada','trigo','uva','datil','naranja','papa','cebolla','tabaco'],
  MA: ['cebada','trigo','uva','oliva','cebolla','tomate','pimiento','naranja','tabaco','sandia','algodon','papa'],
  TN: ['cebada','trigo','uva','oliva','naranja','datil','papa','cebolla','tomate','sorgo','algodon'],
  SD: ['algodon','sorgo','mijo','arroz','maiz','trigo','cebada','papa','cebolla','tabaco','datil','frijol'],
  SS: ['sorgo','mijo','maiz','papa','cebolla','tabaco','arroz','yuca','frijol'],
  // África Occidental
  NG: ['maiz','yuca','sorgo','mijo','arroz','algodon','palma','mani','papa','cebolla','frijol','tabaco'],
  GH: ['cacao','maiz','yuca','banano','algodon','palma','sorgo','papa','cebolla','naranja','arroz'],
  CI: ['cafe','cacao','banano','palma','maiz','arroz','yuca','camote','algodon','cebolla','tomate'],
  SN: ['arroz','sorgo','mijo','maiz','algodon','mani','papa','cebolla','tabaco','hortalizas'],
  ML: ['algodon','arroz','maiz','sorgo','mijo','mani','papa','cebolla','tabaco','cebada'],
  BF: ['algodon','mani','sorgo','mijo','maiz','arroz','frijol','cebolla','tabaco','girasol'],
  NE: ['cebada','sorgo','mijo','arroz','maiz','papa','cebolla','frijol','tabaco','mani'],
  GN: ['cafe','cacao','palma','maiz','arroz','sorgo','papa','cebolla','pimiento','mani','uva'],
  GW: ['mani','arroz','maiz','sorgo','papa','cebolla','hortalizas','frijol'],
  SL: ['cafe','cacao','palma','arroz','maiz','sorgo','papa','cebolla','yuca','frijol','tabaco'],
  LR: ['caucho','cafe','palma','arroz','maiz','yuca','papa','cebolla','pimiento','coco'],
  TG: ['yuca','maiz','arroz','sorgo','papa','cebolla','frijol','algodon','mani','tomate'],
  BJ: ['maiz','yuca','algodon','mani','papa','cebolla','sorgo','mijo','arroz','naranja'],
  MR: ['arroz','sorgo','mijo','maiz','cebada','papa','cebolla','tabaco','datil','cebada'],
  CV: ['banano','maiz','frijol','papa','cebolla','tomate','naranja','yuca'],
  GM: ['maiz','sorgo','mijo','arroz','papa','cebolla','hortalizas','cebada'],
  // África Central
  CM: ['cafe','cacao','algodon','palma','maiz','yuca','banano','cebolla','sorgo','arroz','mani'],
  TD: ['algodon','sorgo','mijo','arroz','maiz','papa','cebolla','mani','naranja','cebada'],
  CF: ['algodon','cafe','tabaco','yuca','mijo','sorgo','maiz','banano','papa','cebolla'],
  CG: ['yuca','maiz','arroz','papa','cebolla','cafe','tabaco','banano','palma','sorgo'],
  CD: ['cafe','palma','caucho','cacao','yuca','arroz','maiz','banano','papa','cebolla','tabaco','algodon','pimiento','mani'],
  GA: ['palma','cacao','cafe','banano','maiz','yuca','papa','cebolla','sorgo','arroz'],
  GQ: ['cacao','palma','yuca','banano','cafe','maiz','papa','cebolla','tomate'],
  ST: ['cacao','papa','coco','banano','maiz','sorgo','cebolla','pimiento','tomate'],
  // África Oriental
  ET: ['cebada','cafe','sorgo','mijo','maiz','trigo','papa','cebolla','tabaco','algodon','arroz','te','garbanzo'],
  KE: ['cafe','te','maiz','sorgo','cana','papa','cebolla','tomate','pimiento','frijol','aguacate','cebada'],
  UG: ['cafe','maiz','arroz','sorgo','mijo','frijol','papa','cebolla','tabaco','soja','algodon','yuca','te'],
  TZ: ['maiz','sorgo','arroz','cafe','tabaco','algodon','papa','cebolla','frijol','banano','yuca','mani'],
  RW: ['cafe','tabaco','te','maiz','papa','cebolla','frijol','yuca','arroz','cebada'],
  BI: ['cafe','tabaco','arroz','maiz','frijol','yuca','papa','cebolla','banano','te'],
  SO: ['sorgo','mijo','cebada','maiz','banano','papa','cebolla','arroz','datil','naranja'],
  DJ: ['sorgo','mijo','banano','papa','cebolla','tomate','lechuga','cebada'],
  ER: ['sorgo','cebada','trigo','maiz','arroz','papa','cebolla','tabaco','uva'],
  // África Austral
  ZA: ['maiz','cebada','girasol','soja','sorgo','uva','trigo','papa','cebolla','naranja','tabaco','mani'],
  MZ: ['palma','caucho','algodon','maiz','sorgo','arroz','papa','cebolla','tabaco','frijol','mani'],
  ZW: ['maiz','tabaco','sorgo','soja','algodon','papa','cebolla','mijo','arroz','mani','frijol'],
  ZM: ['maiz','sorgo','algodon','soja','tabaco','papa','cebolla','frijol','arroz','mijo','mani'],
  BW: ['sorgo','maiz','mijo','mani','frijol','sandia','girasol','cebada','cebolla'],
  NA: ['sorgo','mijo','maiz','cebada','trigo','papa','cebolla','frijol','sandia','mani'],
  SZ: ['cana','sorgo','mijo','arroz','papa','cebolla','tabaco','naranja','maiz','frijol'],
  LS: ['trigo','cebada','maiz','sorgo','papa','cebolla','frijol','lechuga'],
  MG: ['arroz','cafe','maiz','sorgo','papa','cebolla','tabaco','banano','coco','palma','mani'],
  MW: ['maiz','sorgo','mijo','tabaco','arroz','papa','cebolla','frijol','soja','mani'],
  MU: ['cana','tabaco','arroz','frijol','papa','cebolla','pimiento','lechuga','naranja','uva'],
  KM: ['coco','banano','yuca','papa','cebolla','tomate','naranja','pimiento','arroz'],
  SC: ['coco','banano','papa','cebolla','pimiento','tomate','naranja','cana'],
  // Oceanía
  AU: ['trigo','cebada','colza','uva','manzana','papa','cebolla','algodon','avena','tomate','sandia'],
  NZ: ['trigo','cebada','avena','papa','cebolla','manzana','uva','colza','tomate','zanahoria'],
  FJ: ['cana','arroz','coco','banano','papa','cebolla','maiz','yuca','pina','pimiento'],
  PG: ['palma','caucho','cafe','cacao','coco','papa','cebolla','maiz','yuca','arroz','camote','tabaco'],
  SB: ['coco','papa','cebolla','arroz','banano','maiz','yuca','camote','cacao','pimiento'],
  VU: ['coco','banano','papa','cebolla','yuca','arroz','maiz','camote','cacao','pimiento'],
  WS: ['coco','banano','yuca','papa','cebolla','maiz','pina','pimiento','naranja'],
  TO: ['coco','yuca','banano','papa','cebolla','maiz','calabaza','pimiento','naranja'],
  FM: ['coco','papa','camote','banano','pimiento','cebolla','yuca','maiz'],
  PW: ['yuca','papa','camote','banano','coco','maiz','pimiento','cebolla','naranja'],
  MH: ['yuca','coco','papa','camote','banano','maiz','pimiento','cebolla'],
  NR: ['yuca','papa','camote','coco','banano','cebolla','pimiento'],
  KI: ['yuca','papa','coco','banano','maiz','camote','cebolla','pimiento'],
  TV: ['yuca','papa','coco','banano','cebolla','pimiento'],
  NC: ['papa','cebolla','palma','maiz','cana','uva','pimiento','tomate','naranja','coco','arroz'],
};

let map, marker, currentCountryCode = null;

function initMap(){
  map = L.map('map', { zoomControl: true }).setView([-15, -60], 4);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri World Imagery',
    maxZoom: 18
  }).addTo(map);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri',
    maxZoom: 18,
    pane: 'overlayPane'
  }).addTo(map);

  marker = L.marker([-34.6037, -58.3816], { draggable: true }).addTo(map);
  marker.bindPopup('Arrastrá o hacé clic en el mapa');

  marker.on('dragend', function(e){
    const pos = e.target.getLatLng();
    updateCoords(pos.lat, pos.lng);
  });

  map.on('click', function(e){
    setMarker(e.latlng.lat, e.latlng.lng);
  });

  updateCoords(-34.6037, -58.3816);
}

function setMarker(lat, lng){
  marker.setLatLng([lat, lng]);
  marker.openPopup();
  updateCoords(lat, lng);
}

function updateCoords(lat, lng){
  latInput.value = lat.toFixed(4);
  lonInput.value = lng.toFixed(4);
  document.getElementById('terrenoPanel').style.display = 'none';
  detectCountry(lat, lng);
}

[latInput, lonInput].forEach(el => el.addEventListener('input', () => {
  document.getElementById('terrenoPanel').style.display = 'none';
}));

async function detectCountry(lat, lng){
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`);
    const data = await res.json();
    const countryCode = (data.address.country_code || '').toUpperCase();
    const countryName = data.address.country || 'Desconocido';

    let detailParts = [];
    if(data.address.state) detailParts.push(data.address.state);
    if(data.address.city || data.address.town || data.address.village){
      detailParts.push(data.address.city || data.address.town || data.address.village);
    }
    const detail = detailParts.length ? detailParts.join(', ') : '';

    const displayName = detail ? `${detail}, ${countryName}` : countryName;
    locationNameInput.value = displayName;

    const badge = document.getElementById('countryBadge');
    badge.innerHTML = `<span class="country-flag"></span> ${countryName}${detail ? ' — ' + detail : ''} (${countryCode})`;

    if(countryCode !== currentCountryCode){
      currentCountryCode = countryCode;
      loadCropsForCountry(countryCode);
    }
  } catch(err){
    document.getElementById('countryBadge').textContent = 'No se pudo detectar el país';
  }
}

function loadCropsForCountry(countryCode){
  const cropKeys = COUNTRY_CROPS[countryCode] || [];
  const sortedKeys = cropKeys.filter(k => CROP_DB[k]).sort((a,b) => CROP_DB[a].label.localeCompare(CROP_DB[b].label));

  cropSelect.innerHTML = '';
  if(sortedKeys.length === 0){
    cropSelect.innerHTML = '<option value="">No hay datos de cultivos para este país</option>';
  } else {
    sortedKeys.forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = CROP_DB[key].label;
      cropSelect.appendChild(opt);
    });
  }

  prevCropSelect.innerHTML = '<option value="ninguno">No sé / barbecho</option>';
  sortedKeys.forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = CROP_DB[key].label;
    prevCropSelect.appendChild(opt);
  });
}

async function searchLocation(){
  const query = searchInput.value.trim();
  if(!query) return;
  searchBtn.disabled = true;
  searchBtn.textContent = 'Buscando...';
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=es`);
    const data = await res.json();
    if(data.length > 0){
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      map.setView([lat, lon], 13);
      setMarker(lat, lon);
    } else {
      alert('No se encontró la ubicación. Intentá con otro nombre.');
    }
  } catch(err){
    alert('Error al buscar. Verificá tu conexión.');
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Buscar';
  }
}

searchBtn.addEventListener('click', () => { closeSuggestions(); searchLocation(); });

/* ---------- Autocompletado de ubicaciones (localidades, provincias/estados y países de todo el mundo) ----------
   Usa Photon (photon.komoot.io), un geocodificador público sobre datos de OpenStreetMap pensado para
   "buscar mientras se escribe". No requiere API key. */
const suggestionsBox = document.getElementById('searchSuggestions');
const SUGGEST_MIN_CHARS = 2;
const SUGGEST_DELAY_MS = 300;
const SUGGEST_LAYERS = ['country', 'state', 'county', 'city', 'district', 'locality'];
const SUGGEST_TYPE_LABEL = { country: 'País', state: 'Provincia / Estado', county: 'Departamento', city: 'Localidad', district: 'Localidad', locality: 'Localidad' };
const SUGGEST_ZOOM = { country: 4, state: 7, county: 9, city: 12, district: 13, locality: 13 };
// Abreviaturas frecuentes al escribir (ej.: "La Banda, Sgo del Estero")
const SUGGEST_ALIASES = [
  [/\bsgo\b\.?/gi, 'santiago'],
  [/\bbs\.?\s*as\b\.?/gi, 'buenos aires'],
  [/\bpcia\b\.?/gi, 'provincia'],
  [/\bcba\b\.?/gi, 'córdoba'],
  [/\bsta\b\.?/gi, 'santa'],
  [/\bgral\b\.?/gi, 'general']
];
let suggestTimer = null;
let suggestAbort = null;
let suggestItems = [];
let suggestActive = -1;
let regionNamesEs = null;
try { regionNamesEs = new Intl.DisplayNames(['es'], { type: 'region' }); } catch(e){ /* navegador sin soporte */ }

function expandAliases(text){
  return SUGGEST_ALIASES.reduce((t, [re, full]) => t.replace(re, full), text);
}

function countryNameEs(props){
  if(regionNamesEs && props.countrycode){
    try { return regionNamesEs.of(props.countrycode.toUpperCase()) || props.country; } catch(e){ /* código inválido */ }
  }
  return props.country || '';
}

function suggestionFromFeature(feature){
  const p = feature.properties || {};
  const coords = feature.geometry && feature.geometry.coordinates;
  if(!coords || !p.name) return null;
  // Entradas administrativas que duplican a la localidad (ej.: "Municipio de Clodomira")
  if(/^(municipio|comisi[oó]n de fomento|comisi[oó]n municipal) de /i.test(p.name)) return null;
  const type = p.type || 'city';
  const country = countryNameEs(p);
  let parts;
  if(type === 'country') parts = [country || p.name];
  else if(type === 'state') parts = [p.name, country];
  else parts = [p.name, p.state || p.county, country];
  const label = parts.filter((v, i) => v && parts.indexOf(v) === i).join(', ');
  return { label, type, lat: coords[1], lon: coords[0] };
}

async function fetchSuggestions(query){
  if(suggestAbort) suggestAbort.abort();
  suggestAbort = new AbortController();
  const params = new URLSearchParams({ q: expandAliases(query), limit: '10' });
  SUGGEST_LAYERS.forEach(l => params.append('layer', l));
  try {
    const res = await fetch(`https://photon.komoot.io/api/?${params}`, { signal: suggestAbort.signal });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const seen = new Set();
    const items = [];
    (data.features || []).forEach(f => {
      const s = suggestionFromFeature(f);
      if(!s || seen.has(s.label)) return;
      seen.add(s.label);
      items.push(s);
    });
    // Países y provincias primero, después localidades (manteniendo la relevancia dentro de cada grupo)
    const rank = t => (t === 'country' ? 0 : t === 'state' ? 1 : 2);
    items.sort((a, b) => rank(a.type) - rank(b.type));
    if(searchInput.value.trim() === query) renderSuggestions(items.slice(0, 8));
  } catch(err){
    if(err.name !== 'AbortError') closeSuggestions();
  }
}

function renderSuggestions(items){
  suggestItems = items;
  suggestActive = -1;
  suggestionsBox.textContent = '';
  if(items.length === 0){
    const li = document.createElement('li');
    li.className = 'search-suggestion-empty';
    li.textContent = 'Sin coincidencias. Probá con otro nombre o tocá "Buscar".';
    suggestionsBox.appendChild(li);
  }
  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'search-suggestion';
    li.id = 'searchSuggestion' + i;
    li.setAttribute('role', 'option');
    const name = document.createElement('span');
    name.className = 'search-suggestion-name';
    name.textContent = item.label;
    const tag = document.createElement('span');
    tag.className = 'search-suggestion-type';
    tag.textContent = SUGGEST_TYPE_LABEL[item.type] || 'Lugar';
    li.append(name, tag);
    // mousedown (no click) para que se ejecute antes de que el input pierda el foco
    li.addEventListener('mousedown', (e) => { e.preventDefault(); chooseSuggestion(i); });
    suggestionsBox.appendChild(li);
  });
  suggestionsBox.hidden = false;
  searchInput.setAttribute('aria-expanded', 'true');
}

function closeSuggestions(){
  clearTimeout(suggestTimer);
  if(suggestAbort) suggestAbort.abort();
  suggestItems = [];
  suggestActive = -1;
  suggestionsBox.hidden = true;
  suggestionsBox.textContent = '';
  searchInput.setAttribute('aria-expanded', 'false');
  searchInput.removeAttribute('aria-activedescendant');
}

function highlightSuggestion(index){
  const nodes = suggestionsBox.querySelectorAll('.search-suggestion');
  nodes.forEach((n, i) => {
    n.classList.toggle('active', i === index);
    n.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });
  suggestActive = index;
  if(index >= 0 && nodes[index]){
    searchInput.setAttribute('aria-activedescendant', nodes[index].id);
    nodes[index].scrollIntoView({ block: 'nearest' });
  } else {
    searchInput.removeAttribute('aria-activedescendant');
  }
}

function chooseSuggestion(index){
  const item = suggestItems[index];
  if(!item) return;
  searchInput.value = item.label;
  closeSuggestions();
  map.setView([item.lat, item.lon], SUGGEST_ZOOM[item.type] || 12);
  setMarker(item.lat, item.lon);
}

searchInput.addEventListener('input', () => {
  clearTimeout(suggestTimer);
  const query = searchInput.value.trim();
  if(query.length < SUGGEST_MIN_CHARS){ closeSuggestions(); return; }
  suggestTimer = setTimeout(() => fetchSuggestions(query), SUGGEST_DELAY_MS);
});

searchInput.addEventListener('keydown', (e) => {
  const open = !suggestionsBox.hidden && suggestItems.length > 0;
  if(e.key === 'ArrowDown' && open){
    e.preventDefault();
    highlightSuggestion((suggestActive + 1) % suggestItems.length);
  } else if(e.key === 'ArrowUp' && open){
    e.preventDefault();
    highlightSuggestion((suggestActive - 1 + suggestItems.length) % suggestItems.length);
  } else if(e.key === 'Escape'){
    closeSuggestions();
  } else if(e.key === 'Enter'){
    if(open && suggestActive >= 0){
      e.preventDefault();
      chooseSuggestion(suggestActive);
    } else {
      closeSuggestions();
      searchLocation();
    }
  }
});

searchInput.addEventListener('blur', () => setTimeout(closeSuggestions, 150));

function fmtDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}${m}${day}`;
}

function evaluateCrop(cropKey, prevCropKey, avgSoilMoisture, avgTemp){
  const crop = CROP_DB[cropKey];
  if(!crop) return null;
  const [moistMin, moistMax] = crop.gwetRange;
  const [tempMin, tempMax] = crop.tempRange;

  const moistStatus = avgSoilMoisture < moistMin ? 'bajo' : (avgSoilMoisture > moistMax ? 'alto' : 'ok');
  const tempStatus = avgTemp < tempMin ? 'bajo' : (avgTemp > tempMax ? 'alto' : 'ok');

  const checklist = [];
  checklist.push(`Humedad de suelo (zona de raíces) actual: <b>${(avgSoilMoisture*100).toFixed(0)}%</b> — rango ideal para ${crop.label.toLowerCase()}: ${(moistMin*100).toFixed(0)}–${(moistMax*100).toFixed(0)}%.`);
  checklist.push(`Temperatura media actual: <b>${avgTemp.toFixed(1)}°C</b> — rango ideal: ${tempMin}–${tempMax}°C.`);

  let dotColor, dotLabel, verdict;
  const cropName = crop.label.toLowerCase();

  if(moistStatus === 'ok' && tempStatus === 'ok'){
    dotColor = 'var(--leaf)'; dotLabel = 'SEMBRAR';
    verdict = `Las condiciones actuales de humedad y temperatura están dentro del rango ideal para <b>${cropName}</b>. Es un buen momento para sembrar.`;
  } else if(moistStatus === 'bajo' && tempStatus !== 'alto'){
    dotColor = 'var(--amber)'; dotLabel = 'ESPERAR';
    verdict = `El suelo está más seco de lo ideal para <b>${cropName}</b>. Si tenés riego disponible, se puede compensar; si no, conviene esperar lluvia antes de sembrar, o considerar un cultivo más tolerante a sequía (ej. girasol).`;
  } else if(moistStatus === 'alto'){
    dotColor = cropKey === 'arroz' ? 'var(--leaf)' : 'var(--red)';
    dotLabel = cropKey === 'arroz' ? 'SEMBRAR' : 'RIESGO';
    verdict = cropKey === 'arroz'
      ? `El nivel de humedad es alto, lo cual es apto para arroz.`
      : `El suelo está saturado — riesgo de anegamiento para <b>${cropName}</b>. Conviene esperar a que drene antes de sembrar.`;
  } else if(tempStatus === 'bajo'){
    dotColor = 'var(--amber)'; dotLabel = 'ESPERAR';
    verdict = `La temperatura está por debajo del rango ideal para <b>${cropName}</b>. Conviene esperar a que suba, o evaluar un cultivo de estación fría (ej. trigo) para esta ventana.`;
  } else {
    dotColor = 'var(--red)'; dotLabel = 'CAMBIAR';
    verdict = `La temperatura está por encima del rango ideal para <b>${cropName}</b>. Puede haber estrés térmico — conviene esperar a una ventana más fresca o considerar un cultivo más tolerante al calor.`;
  }

  let rotationHtml = '';
  if(prevCropKey && prevCropKey !== 'ninguno'){
    const prev = CROP_DB[prevCropKey];
    if(!prev) return { dotColor, dotLabel, verdict, checklist, rotationHtml };

    const prevName = prev.label.toLowerCase();
    const prevFam = FAMILY_LABEL[prev.family] || prev.family;
    const cropFam = FAMILY_LABEL[crop.family] || crop.family;

    const GOOD_AFTER_LEGUME = ['maiz','trigo','cebada','girasol','sorgo','cana','tomate','papa','cebolla','ajo','pimiento','zanahoria','sandia','melon','calabaza','tabaco','cafe','aguacate','naranja','manzana'];
    const BAD_SAME_FAMILY = 'Misma familia: aumenta el riesgo de plagas y enfermedades compartidas, y compiten por los mismos nutrientes.';
    const LEGUME_BENEFIT = 'Las leguminosas fijan nitrógeno en el suelo mediante bacterias simbióticas, dejando la parcela en mejores condiciones para el cultivo siguiente.';

    const RULES = {
      'soja->maiz':    { ok: true,  msg: 'Excelente rotación: la soja aporta nitrógeno residual y el maíz lo aprovecha. Muy común en el sistema siembra directa.' },
      'soja->trigo':   { ok: true,  msg: 'Buena rotación: trigo de invierno aprovecha el nitrógeno fijado por la soja de verano.' },
      'maiz->soja':    { ok: true,  msg: 'Rotación clásica: el maíz deja residuos ricos en carbono, la soja los descompone y fija nitrógeno para el siguiente cultivo.' },
      'trigo->soja':   { ok: true,  msg: 'Buena secuencia: trigo de invierno seguido de soja de verano aprovecha todo el año agrícola.' },
      'soja->girasol': { ok: true,  msg: 'Alternancia buena: girasol tiene raíz pivotante profunda que mejora la estructura del suelo dejado por soja.' },
      'trigo->maiz':   { ok: true,  msg: 'Secuencia de invierno a verano: el maíz aprovecha la humedad residual del trigo.' },
      'soja->arroz':   { ok: true,  msg: 'Buena combinación: la soja deja el suelo con buen nivel de nitrógeno para el arroz.' },
      'arroz->soja':   { ok: true,  msg: 'Secuencia recomendada: después del arroz, la soja aprovecha la humedad residual y restaura el suelo.' },
      'papa->maiz':    { ok: true,  msg: 'Buena rotación: la papa afloja el suelo y el maíz aprovecha la estructura favorable.' },
      'frijol->maiz':  { ok: true,  msg: 'Clásica en Centroamérica: el frijol aporta nitrógeno que el maíz necesita en alta cantidad.' },
      'cafe->banano':  { ok: true,  msg: 'Sistema agroforestal: el banano ofrece sombra parcial al café y diversifica ingresos.' },
    };

    const ruleKey = `${prevCropKey}->${cropKey}`;
    const rule = RULES[ruleKey];

    if(rule){
      rotationHtml = `<div class="verdict-text" style="color:${rule.ok ? 'var(--leaf)' : 'var(--amber)'}">${rule.ok ? '✓' : '⚠'} ${rule.msg}</div>`;
    } else if(prev.family === crop.family){
      rotationHtml = `<div class="verdict-text" style="color:var(--amber)">⚠ ${BAD_SAME_FAMILY} ${prev.label} y ${crop.label} son ${prevFam}. Se recomienda rotar con una <b>leguminosa</b> (soja, frijol, alfalfa) para restaurar nitrógeno.</div>`;
    } else if(prev.family === 'leguminosa' && GOOD_AFTER_LEGUME.includes(cropKey)){
      rotationHtml = `<div class="verdict-text" style="color:var(--leaf)">✓ ${LEGUME_BENEFIT} Después de ${prev.label}, ${cropName} es una excelente elección.</div>`;
    } else if(crop.family === 'leguminosa'){
      rotationHtml = `<div class="verdict-text" style="color:var(--leaf)">✓ ${crop.label} es leguminosa — fijará nitrógeno en el suelo, beneficiando al cultivo futuro.</div>`;
    } else {
      rotationHtml = `<div class="verdict-text">Rotación ${prev.label} → ${crop.label}: familias distintas (${prevFam} → ${cropFam}). Revisá si hay conflictos de plagas o nematodos específicos de la zona.</div>`;
    }
  }

  return { dotColor, dotLabel, verdict, checklist, rotationHtml };
}

async function fetchPower(lat, lon, startDate, endDate){
  const params = new URLSearchParams({
    parameters: 'PRECTOTCORR,T2M,T2M_MIN,T2M_MAX,RH2M,GWETROOT,GWETTOP',
    community: 'AG',
    longitude: lon,
    latitude: lat,
    start: startDate,
    end: endDate,
    format: 'JSON'
  });
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?${params.toString()}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('La API de NASA POWER respondió con error ' + res.status);
  return res.json();
}

function average(obj){
  const vals = Object.values(obj).filter(v => v > -900);
  if(!vals.length) return null;
  return vals.reduce((a,b)=>a+b,0) / vals.length;
}

function sum(obj){
  return Object.values(obj).filter(v => v > -900).reduce((a,b)=>a+b,0);
}

function drawChart(precipObj){
  const svg = document.getElementById('chart');
  svg.innerHTML = '';
  const entries = Object.entries(precipObj);
  const w = 800, h = 220, padL = 34, padB = 26, padT = 10;
  const max = Math.max(1, ...entries.map(e => e[1]));
  const barW = (w - padL - 10) / entries.length;

  const ns = 'http://www.w3.org/2000/svg';
  entries.forEach(([date, val], i) => {
    const x = padL + i * barW + 3;
    const bh = ((h - padT - padB) * (val / max));
    const y = h - padB - bh;
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(barW - 6, 2));
    rect.setAttribute('height', Math.max(bh, 1));
    rect.setAttribute('rx', 2);
    rect.setAttribute('fill', val > 0 ? '#5fd48a' : '#24392e');
    svg.appendChild(rect);

    if(i % 2 === 0){
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', x + barW/2 - 3);
      label.setAttribute('y', h - 8);
      label.setAttribute('font-size', '9');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = date.slice(4);
      svg.appendChild(label);
    }
  });

  const axis = document.createElementNS(ns, 'line');
  axis.setAttribute('x1', padL); axis.setAttribute('x2', w-4);
  axis.setAttribute('y1', h-padB); axis.setAttribute('y2', h-padB);
  axis.setAttribute('stroke', '#24392e');
  svg.appendChild(axis);
}

runBtn.addEventListener('click', async () => {
  const lat = parseFloat(latInput.value);
  const lon = parseFloat(lonInput.value);
  if(isNaN(lat) || isNaN(lon)){
    statusEl.textContent = 'Ingresá coordenadas válidas.';
    return;
  }

  const cropKey = cropSelect.value;
  const prevCropKey = prevCropSelect.value;

  if(!cropKey || !CROP_DB[cropKey]){
    statusEl.textContent = 'Seleccioná un cultivo válido.';
    return;
  }

  runBtn.disabled = true;
  statusEl.textContent = 'Consultando NASA POWER…';
  ['resultPanel','statsPanel','cropPanel','strategyPanel','annualPanel','chartPanel','gapsPanel','terrenoPanel']
    .forEach(id => { document.getElementById(id).style.display = 'none'; });

  try {
    let st;
    try { st = getAverageSettings(); }
    catch(err){ statusEl.textContent = err.message; return; }
    const today = new Date();
    const end = new Date(today); end.setDate(end.getDate() - 3);
    const histStart = fetchStartFor(end, st);

    statusEl.textContent = `Consultando últimos ${st.days} días y promedio histórico de ${spanLabel(st.years, st.months)}…`;
    const data = await fetchPower(lat, lon, fmtDate(histStart), fmtDate(end));

    cacheRaw(data, end, histStart);
    const analysis = analyzeRaw(lastRaw, st);
    if(!analysis){
      throw new Error('NASA POWER no devolvió datos válidos para este punto (¿océano o fuera de cobertura?)');
    }

    setAnalysis(analysis, cropKey, prevCropKey);
    statusEl.textContent = `Listo — datos reales de NASA POWER para (${lat.toFixed(3)}, ${lon.toFixed(3)}).`;
  } catch (err) {
    statusEl.textContent = 'Error al consultar NASA POWER: ' + err.message + ' (revisá tu conexión o probá otra ubicación)';
  } finally {
    runBtn.disabled = false;
  }
});

document.addEventListener('DOMContentLoaded', initMap);
