const NOME_DB = 'FercayoChecklist';
const VERSAO_DB = 1;
let db = null;
let todasObras    = [];
let obraAtual     = null;
let itemAtual     = null;
let filtroEstado  = 'todos';
let itensObra     = [];
let itensPrevImport = [];
let obraImport    = null;
let obraRelatorio = null;

const OBRAS_DEFAULT = [
  {id:'012_23',codigo:'012_23',nome:'CCR · Villas Caramujas · Povoa Varzim',orc:''},
  {id:'015_23',codigo:'015_23',nome:'Valentim José luis e Filhos · Jardins do Metro · PV',orc:''},
  {id:'044_23',codigo:'044_23',nome:'Sylagroup · Nuno Coelho · Varandas da graça · PV',orc:''},
  {id:'063_23',codigo:'063_23',nome:'CCR · Conj Habitacional · Custió',orc:''},
  {id:'109_23',codigo:'109_23',nome:'Craveiro Mobiliario · Assistên gerais',orc:''},
  {id:'124_24',codigo:'124_24',nome:'CCR Eng Construção Sa (Várias)',orc:''},
  {id:'127_24',codigo:'127_24',nome:'Betcons · Moradia Mindelo',orc:''},
  {id:'129_24',codigo:'129_24',nome:'CCR · 76 Habitações VC',orc:''},
  {id:'131_24',codigo:'131_24',nome:'Betcons · Lote4 Oceanus · PV',orc:''},
  {id:'138_24',codigo:'138_24',nome:'CCR · Nova Sede',orc:''},
  {id:'146_24',codigo:'146_24',nome:'CCR · Skyline · Maia',orc:''},
  {id:'156_24',codigo:'156_24',nome:'Teixeira Duarte · Andar Mod KORI · Cama',orc:''},
  {id:'157_24',codigo:'157_24',nome:'Curralo · De Langsdorff',orc:''},
  {id:'159_24',codigo:'159_24',nome:'CJR · Hospital Veterinário – Azurém',orc:''},
  {id:'160_24',codigo:'160_24',nome:'Carla Guimarães · Moradia Lavra',orc:''},
  {id:'161_24',codigo:'161_24',nome:'Proimpo · Povoa Beach Fase 4',orc:''},
  {id:'170_24',codigo:'170_24',nome:'Confraria Sabores Poveiros · Móvel',orc:''},
  {id:'173_24',codigo:'173_24',nome:'Bairro do Cerco · LT2-BL21, 22, 30',orc:''},
  {id:'176_24',codigo:'176_24',nome:'Sousa Lopes Arqº · Loja Penafiel',orc:''},
  {id:'177_24',codigo:'177_24',nome:'CJR · Lar de Idosos de Garfe',orc:''},
  {id:'179_24',codigo:'179_24',nome:'Sousa Lopes Arqº · Loja Barcelos',orc:''},
  {id:'180_24',codigo:'180_24',nome:'Sousa Lopes Arqº · Loja Vila Real',orc:''},
  {id:'182_24',codigo:'182_24',nome:'Arq Sandra Casinha · Feel Ocean · VNG',orc:''},
  {id:'188_24',codigo:'188_24',nome:'Dds · Ginásio Element · Águas Santas',orc:''},
  {id:'190_24',codigo:'190_24',nome:'Cadosi Lda · Otica Penafiel',orc:''},
  {id:'192_24',codigo:'192_24',nome:'CCR · Ed Lumina · Aguas Santas',orc:''},
  {id:'193_24',codigo:'193_24',nome:'Constru PAV · R Barranha 964 · Sra Hora',orc:''},
  {id:'195_24',codigo:'195_24',nome:'Curralo Intérieurs · Zouari',orc:''},
  {id:'196_24',codigo:'196_24',nome:'Curralo Intérieurs · Raphael Benchimol',orc:''},
  {id:'197_24',codigo:'197_24',nome:'Curralo Intérieurs · Kevin Ferreira',orc:''},
  {id:'198_24',codigo:'198_24',nome:'Carlos Miranda · Carpintarias-Sintra',orc:''},
  {id:'200_25',codigo:'200_25',nome:'Fernando Gonçalves · Rua da Mata · Aver',orc:''},
  {id:'201_25',codigo:'201_25',nome:'CCR · Jardins D\'Avenida · Piso 6 e 7',orc:''},
  {id:'203_25',codigo:'203_25',nome:'Craveiro Mobiliário · PascalDeheegher',orc:''},
  {id:'206_25',codigo:'206_25',nome:'Visão Pioneira · Otica Ovar',orc:''},
  {id:'207_25',codigo:'207_25',nome:'Inna · Vitor Marques · PV',orc:''},
  {id:'208_25',codigo:'208_25',nome:'Carlos Fernandes · Roupeiro',orc:''},
  {id:'209_25',codigo:'209_25',nome:'CCR · INVEST · POS VENDA',orc:''},
  {id:'210_25',codigo:'210_25',nome:'Dds · Ginásio Element-Castelo Branco',orc:''},
  {id:'211_25',codigo:'211_25',nome:'Edinorte · Antiga Fábrica do Prado',orc:''},
  {id:'212_25',codigo:'212_25',nome:'Paulos Silva · Reparação PS',orc:''},
  {id:'213_25',codigo:'213_25',nome:'DDS · Tedi · Fátima',orc:''},
  {id:'214_25',codigo:'214_25',nome:'Visão Pioneira · Otica Vila N.de Gaia',orc:''},
  {id:'215_25',codigo:'215_25',nome:'Visão Pioneira · Otica Felgueiras',orc:''},
  {id:'216_25',codigo:'216_25',nome:'Visão Pioneira · Otica Portimão',orc:''},
  {id:'217_25',codigo:'217_25',nome:'Betcons · ApartamentoT2 Vila do Conde',orc:''},
  {id:'218_25',codigo:'218_25',nome:'Betcons · ApartamentoT1 Póvoa Varzim',orc:''},
  {id:'219_25',codigo:'219_25',nome:'Pedro Barbosa · Moradia em Aveleda VC',orc:''},
  {id:'220_25',codigo:'220_25',nome:'Dds · Quinta do Portal · Adega-Celeiros',orc:''},
  {id:'221_25',codigo:'221_25',nome:'Teixeira Duarte · Edifício Kori Lt 16',orc:''},
  {id:'222_25',codigo:'222_25',nome:'Cláudia Alves · R das Musas 177 · Porto',orc:''},
  {id:'223_25',codigo:'223_25',nome:'Marta Patrão · 2 portas Betula',orc:''},
  {id:'224_25',codigo:'224_25',nome:'Valentim · Edif Manel da Venda · PV',orc:''},
  {id:'225_25',codigo:'225_25',nome:'Jorge Silva · Moradia Airó · Forn',orc:''},
  {id:'226_25',codigo:'226_25',nome:'CCR · Habitação Municipal – Barreiros',orc:''},
  {id:'227_25',codigo:'227_25',nome:'CCR · Hab.Municipal Lt C · Berlarmino',orc:''},
  {id:'228_25',codigo:'228_25',nome:'CCR · Empr.Freiras Santa Clara-2ªFase',orc:''},
  {id:'229_25',codigo:'229_25',nome:'Westview · Mercado Municipal Angeiras',orc:''},
  {id:'230_25',codigo:'230_25',nome:'LSM · Edif.Matias Albuquerque · Porto',orc:''},
  {id:'231_25',codigo:'231_25',nome:'Oficina de Imagem · Peças Mdf',orc:''},
  {id:'232_25',codigo:'232_25',nome:'Craveiro Mob · Mód Madeira Carvalho',orc:''},
  {id:'233_25',codigo:'233_25',nome:'DDs · Hotel Aeroporto · Maia',orc:''},
  {id:'234_25',codigo:'234_25',nome:'Marcelo Cruz · Tampos Fenólico',orc:''},
  {id:'235_25',codigo:'235_25',nome:'António Novo da Silva · Armários',orc:''},
  {id:'236_25',codigo:'236_25',nome:'Lígia e Vitor · Habitação Unifamiliar',orc:''},
  {id:'237_25',codigo:'237_25',nome:'Francisco · Habitação Unifamiliar PV',orc:''},
  {id:'238_25',codigo:'238_25',nome:'Jorge Silva · Moradia Beiriz',orc:''},
  {id:'239_25',codigo:'239_25',nome:'DDS · Moradia Lavra',orc:''},
  {id:'240_25',codigo:'240_25',nome:'Pedro Falcão · Móvel Aparador',orc:''},
  {id:'241_25',codigo:'241_25',nome:'CCR · Esc Música e Museu d Arte Rates',orc:''},
  {id:'242_25',codigo:'242_25',nome:'Visão Pioneira · Otica Castelo Branco',orc:''},
  {id:'243_25',codigo:'243_25',nome:'Visão Pioneira · Otica Guimarães',orc:''},
  {id:'244_25',codigo:'244_25',nome:'Visão Pioneira · Otica Braga',orc:''},
  {id:'245_25',codigo:'245_25',nome:'Dds · Ginásio Element · Covilhã',orc:''},
  {id:'246_25',codigo:'246_25',nome:'Dds · Ginásio Element – Coimbra',orc:''},
  {id:'247_25',codigo:'247_25',nome:'João Magalhães · Complemento p Roupeiros',orc:''},
  {id:'248_25',codigo:'248_25',nome:'CCR · Empreend Dário Valongueiro · VCD',orc:''},
  {id:'249_25',codigo:'249_25',nome:'Westview · Globale Rc',orc:''},
  {id:'250_25',codigo:'250_25',nome:'Visão Pioneira · Otica Cacém',orc:''},
  {id:'251_25',codigo:'251_25',nome:'Visão Pioneira · Otica Setúbal',orc:''},
  {id:'252_25',codigo:'252_25',nome:'Visão Pioneira · Otica Viseu',orc:''},
  {id:'253_25',codigo:'253_25',nome:'Visão Pioneira · Otica Chaves',orc:''},
  {id:'254_25',codigo:'254_25',nome:'CCR · Sanipower · Placas Cofragem',orc:''},
  {id:'255_25',codigo:'255_25',nome:'José Pinhal · Porta multiusos',orc:''},
  {id:'256_25',codigo:'256_25',nome:'DDS · Element · Cedofeita',orc:''},
  {id:'257_25',codigo:'257_25',nome:'CCR · Alda Rodrigues · Placas Osb',orc:''},
  {id:'258_25',codigo:'258_25',nome:'CCR · Edif. E da Operação de Lordelo',orc:''},
  {id:'259_25',codigo:'259_25',nome:'David Oliveira · Porta Segurança',orc:''},
  {id:'260_25',codigo:'260_25',nome:'Greenvelvet · Tampas',orc:''},
  {id:'261_25',codigo:'261_25',nome:'Marta Martins · Proimpo D.3.1',orc:''},
  {id:'262_25',codigo:'262_25',nome:'Cristina Fernandes · Armár. c gavetas',orc:''},
  {id:'263_25',codigo:'263_25',nome:'António Garrido · Portas Mdf',orc:''},
  {id:'264_25',codigo:'264_25',nome:'Main & Fast · Móveis Wc',orc:''},
  {id:'265_25',codigo:'265_25',nome:'Betcons · Fração Comercial Perafita',orc:''},
  {id:'266_25',codigo:'266_25',nome:'Grauon · Novas Instalações Guimarães',orc:''},
  {id:'267_25',codigo:'267_25',nome:'Westview · Caixa Agricola · VC',orc:''},
  {id:'268_25',codigo:'268_25',nome:'Marco Almeida · Porta Segurança',orc:''},
  {id:'269_25',codigo:'269_25',nome:'LSM · Loja CP São Bento',orc:''},
  {id:'270_25',codigo:'270_25',nome:'Valentim · C.Ocup.Beiriz e Pav.Poliv',orc:''},
  {id:'271_25',codigo:'271_25',nome:'Rui Curval · Peças Wengue',orc:''},
  {id:'272_25',codigo:'272_25',nome:'Aníbal Gonçalves · Roupeiros+Coz',orc:''},
  {id:'273_25',codigo:'273_25',nome:'Márcia Soares · Armário Quarto',orc:''},
  {id:'274_25',codigo:'274_25',nome:'Westview · J.l Mons. Pires Quesado · PV',orc:''},
  {id:'275_25',codigo:'275_25',nome:'Susana Sousa · Assistência PS',orc:''},
  {id:'276_25',codigo:'276_25',nome:'CCR · Hab.Jovem Edif.A 72 Fogos · PV',orc:''},
  {id:'277_25',codigo:'277_25',nome:'Grownor · Montagem de pérgula',orc:''},
  {id:'278_25',codigo:'278_25',nome:'Ardesia Studio · Casa 70 · Lisboa',orc:''},
  {id:'279_26',codigo:'279_26',nome:'DDS Element · Guarda-Paineis',orc:''},
  {id:'280_26',codigo:'280_26',nome:'DDS Element · Trofa · Paineis',orc:''},
  {id:'281_26',codigo:'281_26',nome:'CCR · Jardins da Avenida · Ap 7.1',orc:''},
  {id:'282_26',codigo:'282_26',nome:'Westview · Reabilit. Casa R. Godinho',orc:'541_24_V03'},
  {id:'283_26',codigo:'283_26',nome:'Const Secular · C.A.Pe Porfírio Alves',orc:'677_24_V03'},
  {id:'284_26',codigo:'284_26',nome:'CCR · Edif. Lavandeira Green Terrace',orc:''},
  {id:'285_26',codigo:'285_26',nome:'Sandra Micaela Casinha · Mob. LOLIVE',orc:''},
  {id:'286_26',codigo:'286_26',nome:'Rebau · Messe Militar do Porto',orc:''},
  {id:'287_26',codigo:'287_26',nome:'Fercayo · Escritórios Fabrica',orc:''},
  {id:'288_26',codigo:'288_26',nome:'Manuel Castro · Proimpo 271 · 3ºEsq',orc:''},
  {id:'289_26',codigo:'289_26',nome:'CCR Residências · BNAUT Retorta – VC',orc:''},
  {id:'290_26',codigo:'290_26',nome:'CCR INVEST · Habit. Bifamiliar-Azurém',orc:''},
  {id:'291_26',codigo:'291_26',nome:'Moura Azevedo · Cristina · Pedro · Rodapé',orc:''},
  {id:'292_26',codigo:'292_26',nome:'CCR · Un.ResidencialCreche · Guilhabreu',orc:''},
  {id:'293_26',codigo:'293_26',nome:'Oficina d Imagem · SumolCompal · Lisboa',orc:''},
  {id:'294_25',codigo:'294_25',nome:'Maria Paula Barreiros · Rio Tinto',orc:''},
  {id:'295_26',codigo:'295_26',nome:'Alexandre Martins · Roupeiro',orc:''},
  {id:'296_26',codigo:'296_26',nome:'Prestige Home Group · Disentis A112',orc:''},
  {id:'297_26',codigo:'297_26',nome:'CCR · Delegação CentroSul Grupo CCR',orc:''},
  {id:'298_26',codigo:'298_26',nome:'João Paulo Ribeiro · R de São Brás PV',orc:''},
  {id:'299_26',codigo:'299_26',nome:'CCR · ERPI e UCC LAPA-SCM Vila Conde',orc:''},
  {id:'300_26',codigo:'300_26',nome:'CCR · Elementum Residences · Fase 12',orc:''},
  {id:'301_26',codigo:'301_26',nome:'Main & Fast · R. da Bandeirinha 67 1º',orc:'1080_25_V02'},
  {id:'302_26',codigo:'302_26',nome:'NOS · Cabines VAR',orc:''},
  {id:'303_26',codigo:'303_26',nome:'Oficina da Imagem · Display Ultimate',orc:''},
  {id:'304_26',codigo:'304_26',nome:'Bruno Pires · Móvel TV',orc:''},
  {id:'305_26',codigo:'305_26',nome:'Maria Céu Ribeiro · Moradia Lavra',orc:''},
];

const SEED_283_26 = [
  {obraId:'283_26',artigo:'7.1.4.3.3',descricao:'Rodapé em MDF Lacado, conforme pormenor tipo desenho A 07.06.00',tipo:'',dims:'82,90ml',ref:'',quant:82.9,unid:'ml',material:'MDF Lacado',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.1',descricao:'Porta de abrir esmaltada, incluindo todas as ferragens. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'800x2100mm',ref:'(002)',quant:2,unid:'un',material:'NCS S 1002 Y',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.2',descricao:'Porta de abrir esmaltada, incluindo todas as ferragens. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'700x2100mm',ref:'(104)',quant:1,unid:'un',material:'NCS S 1002 Y',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.3',descricao:'Porta de abrir esmaltada, incluindo todas as ferragens. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'900x2100mm',ref:'(106)',quant:1,unid:'un',material:'NCS S 1002 Y',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.4',descricao:'Porta de abrir esmaltada, incluindo todas as ferragens. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'800x2100mm',ref:'(201)',quant:2,unid:'un',material:'NCS S 1002 Y',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.7.1',descricao:'Porta existente a recuperar ou substituir. Takula RAL 9002, aro RAL 3009. Preço orientativo.',tipo:'Tipo G',dims:'1450x2730mm',ref:'(006)',quant:1,unid:'un',material:'Takula RAL 9002 / aro RAL 3009',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.7.2',descricao:'Porta existente a recuperar ou substituir. Takula RAL 9002, aro RAL 3009. Preço orientativo.',tipo:'Tipo G',dims:'1550x2230mm',ref:'(007)',quant:1,unid:'un',material:'Takula RAL 9002 / aro RAL 3009',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.7.3',descricao:'Porta existente a recuperar ou substituir. Takula RAL 9002, aro RAL 3009. Preço orientativo.',tipo:'Tipo G',dims:'1800x2730mm',ref:'(008)',quant:1,unid:'un',material:'Takula RAL 9002 / aro RAL 3009',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.10.1',descricao:'Porta armário uma folha, incluindo todas as ferragens. Ferragens standard Fercayo.',tipo:'Tipo L',dims:'800x2100mm',ref:'(003)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.14.1',descricao:'Porta de abrir de uma folha pivotante, esmaltada. Ferragens standard Fercayo.',tipo:'Tipo T',dims:'1280x2650mm',ref:'(112)',quant:1,unid:'un',material:'NCS S 1002-Y',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.15.1',descricao:'Porta de abrir de duas folhas pivotantes, esmaltada. Ferragens standard Fercayo.',tipo:'Tipo T1',dims:'1500x2650mm',ref:'(113)',quant:1,unid:'un',material:'NCS S 1002-Y',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.17.1',descricao:'Porta de duas folhas de abrir, esmaltada. Ferragens standard Fercayo.',tipo:'Tipo V',dims:'1800x2600mm',ref:'(004)',quant:2,unid:'un',material:'NCS S 1002-Y',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.17.2',descricao:'Porta de duas folhas de abrir, esmaltada. Ferragens standard Fercayo.',tipo:'Tipo V',dims:'1400x2600mm',ref:'(114)',quant:2,unid:'un',material:'NCS S 1002-Y',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.1.1',descricao:'Armário 1 Folha Tipo A-01. Portas MDF Lacado, interior melamina linho cancun.',tipo:'Tipo A-01',dims:'520x2200x320mm',ref:'(001)',quant:1,unid:'un',material:'MDF Lacado NCS S 1002 Y / melamina linho cancun',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.5.1',descricao:'Balcão Atendimento conforme desenho Tipo M-05.',tipo:'Tipo M-05',dims:'4300x450x1100mm',ref:'(063)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.6.1',descricao:'Estante Atendimento conforme desenho Tipo M-09.',tipo:'Tipo M-09',dims:'1600x600x750mm',ref:'(059)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.8.1',descricao:'Secretária Atendimento 02 conforme desenho Tipo M-11.',tipo:'Tipo M-11',dims:'1200x700x750mm',ref:'(073)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.9.1',descricao:'Secretária Atendimento 03 conforme desenho Tipo M-12.',tipo:'Tipo M-12',dims:'1200x700x750mm',ref:'(074)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.18.1.1',descricao:'Estante conforme desenho Tipo A.',tipo:'Tipo A',dims:'1550x1700x300mm',ref:'(E005)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.18.1.2',descricao:'Estante conforme desenho Tipo A.',tipo:'Tipo A',dims:'1640x1700x300mm',ref:'(E006)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.18.1.3',descricao:'Estante conforme desenho Tipo A.',tipo:'Tipo A',dims:'1640x1700x300mm',ref:'(E012)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.18.1.4',descricao:'Estante conforme desenho Tipo A.',tipo:'Tipo A',dims:'2590x3050x360mm',ref:'(E014)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Centro Paroquial',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.4.5.1',descricao:'Revestimento Tipo 5 — Ripado Valchromat 30x30mm, calços madeira 10x50mm, lã mineral 40mm. Ver A 07.07.00.',tipo:'Revestimento Tipo 5',dims:'94,00m2',ref:'',quant:94,unid:'m2',material:'Valchromat SC vermelho 30x30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.4.11.1',descricao:'Revestimento Tipo 11 — Ripado Valchromat 30x30mm, estrutura tubular ferro 20mm NCS S 2040-R. Ver A 07.08.00.',tipo:'Revestimento Tipo 11',dims:'177,91m2',ref:'',quant:177.91,unid:'m2',material:'Valchromat SC vermelho 30x30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.6.1',descricao:'Tetos em ripado 30x30 com calços de fixação. Apenas trabalhos de carpintaria.',tipo:'Teto ripado',dims:'231,49m2',ref:'',quant:231.49,unid:'m2',material:'Valchromat SC vermelho 30x30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.1',descricao:'Porta de abrir esmaltada. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'800x2100mm',ref:'(001)',quant:3,unid:'un',material:'NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.2',descricao:'Porta de abrir esmaltada. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'900x2100mm',ref:'(002)',quant:2,unid:'un',material:'NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.3',descricao:'Porta de abrir esmaltada. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'700x2100mm',ref:'(104)',quant:2,unid:'un',material:'NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.4',descricao:'Porta de abrir esmaltada. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'900x2100mm',ref:'(106)',quant:1,unid:'un',material:'NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.5',descricao:'Porta de abrir esmaltada. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'800x2100mm',ref:'(201)',quant:2,unid:'un',material:'NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.6',descricao:'Porta de abrir esmaltada. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'900x2100mm',ref:'(202)',quant:1,unid:'un',material:'NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.4.1',descricao:'Porta duas folhas de abrir, esmaltada. Ferragens standard Fercayo.',tipo:'Tipo C',dims:'1200x2100mm',ref:'(107)',quant:1,unid:'un',material:'NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.8.1',descricao:'Porta armário duas folhas. Ferragens standard Fercayo.',tipo:'Tipo H',dims:'1570x2280mm',ref:'(010)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.8.2',descricao:'Porta armário duas folhas. Ferragens standard Fercayo.',tipo:'Tipo H',dims:'1650x3230mm',ref:'(109)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.8.4',descricao:'Porta armário duas folhas. Ferragens standard Fercayo.',tipo:'Tipo H',dims:'1570x2280mm',ref:'(205)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.8.5',descricao:'Porta armário duas folhas. Ferragens standard Fercayo.',tipo:'Tipo H',dims:'1570x890mm',ref:'(209)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.9.1',descricao:'Porta 1 folha Valchromat. Desenho A 09.08.00.',tipo:'Tipo J',dims:'810x2060mm',ref:'(101)',quant:7,unid:'un',material:'Valchromat SC vermelho',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.9.2',descricao:'Porta 1 folha Valchromat. Desenho A 09.08.00.',tipo:'Tipo J',dims:'810x2060mm',ref:'(207)',quant:3,unid:'un',material:'Valchromat SC vermelho',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.10.2',descricao:'Porta armário uma folha. Ferragens standard Fercayo.',tipo:'Tipo L',dims:'800x2280mm',ref:'(013)',quant:2,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.10.3',descricao:'Porta armário uma folha. Ferragens standard Fercayo.',tipo:'Tipo L',dims:'800x2750mm',ref:'(111)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.10.4',descricao:'Porta armário uma folha. Ferragens standard Fercayo.',tipo:'Tipo L',dims:'800x2750mm',ref:'(204)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.16.1',descricao:'Porta de correr ripado 30x30mm, estrutura ferro 200mm NCS S 2040-R. Desenho A 09.12.00.',tipo:'Tipo U',dims:'7960x2300mm',ref:'(020)',quant:1,unid:'un',material:'Valchromat SC vermelho 30x30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.18.1',descricao:'Porta em fole takula esmaltada. Tipo Z, desenho A 09.10.00.',tipo:'Tipo Z',dims:'4920x2000mm',ref:'(103)',quant:1,unid:'un',material:'Takula NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.18.2',descricao:'Porta em fole takula esmaltada. Tipo Z, desenho A 09.10.00.',tipo:'Tipo Z',dims:'4920x2000mm',ref:'(105)',quant:1,unid:'un',material:'Takula NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.18.3',descricao:'Porta em fole takula esmaltada. Tipo Z, desenho A 09.10.00.',tipo:'Tipo Z',dims:'3830x2000mm',ref:'(108)',quant:1,unid:'un',material:'Takula NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.18.4',descricao:'Porta em fole takula esmaltada. Tipo Z, desenho A 09.10.00.',tipo:'Tipo Z',dims:'3830x2000mm',ref:'(206)',quant:1,unid:'un',material:'Takula NCS S 1002 Y',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.5.1',descricao:'Balcão Bar Tipo M-06. Exclui tampo granito, pio, torneira, eletrodomésticos.',tipo:'Tipo M-06',dims:'2200x600x1300mm',ref:'(064)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.6.1',descricao:'Bar Tipo M-13 — apenas tampo.',tipo:'Tipo M-13',dims:'2900x600x942mm',ref:'(076)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.7.1',descricao:'Balcão Entrada Tipo M-07.',tipo:'Tipo M-07',dims:'1300x300x750mm',ref:'(065)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.18.1.1',descricao:'Estante conforme desenho Tipo A.',tipo:'Tipo A',dims:'1600x3167x295mm',ref:'(E_008)',quant:1,unid:'un',material:'Valchromat SC vermelho 30mm',seccao:'Inclusão Inovação e Social',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.1.1',descricao:'Cozinha base. MDF lacado exterior, melamina interior.',tipo:'Base',dims:'600x450x900mm',ref:'B-001',quant:1,unid:'un',material:'MDF Lacado / melamina',seccao:'Cozinha',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.1.2',descricao:'Cozinha base. MDF lacado exterior, melamina interior.',tipo:'Base',dims:'600x600x900mm',ref:'B-002',quant:4,unid:'un',material:'MDF Lacado / melamina',seccao:'Cozinha',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.1.3',descricao:'Cozinha base. MDF lacado exterior, melamina interior.',tipo:'Base',dims:'600x300x900mm',ref:'B-005',quant:4,unid:'un',material:'MDF Lacado / melamina',seccao:'Cozinha',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.1.4',descricao:'Cozinha base. MDF lacado exterior, melamina interior.',tipo:'Base',dims:'450x300x900mm',ref:'B-004',quant:1,unid:'un',material:'MDF Lacado / melamina',seccao:'Cozinha',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.2.2',descricao:'Porta de abrir esmaltada. Ferragens standard Fercayo.',tipo:'Tipo A',dims:'900x2100mm',ref:'(-102)',quant:6,unid:'un',material:'NCS S 1002 Y',seccao:'Cozinha',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.5.1',descricao:'Porta duas folhas de abrir. Ferragens standard Fercayo.',tipo:'Tipo C',dims:'1220x1750mm',ref:'(-103)',quant:1,unid:'un',material:'NCS S 1002 Y',seccao:'Cozinha',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.1.1',descricao:'Cozinha base. MDF lacado exterior, melamina interior.',tipo:'Base',dims:'600x450x900mm',ref:'B-001',quant:10,unid:'un',material:'MDF Lacado / melamina',seccao:'Cozinha',nota:'',estado:'pendente'},
  {obraId:'283_26',artigo:'7.1.8.22.1.2',descricao:'Cozinha coluna. MDF lacado exterior, melamina interior.',tipo:'Coluna',dims:'600x600x2100mm',ref:'F-001',quant:13,unid:'un',material:'MDF Lacado / melamina',seccao:'Cozinha',nota:'',estado:'pendente'},
];

function abrirDB() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(NOME_DB, VERSAO_DB);
    pedido.onupgradeneeded = (evento) => {
      const bd = evento.target.result;
      if (!bd.objectStoreNames.contains('obras')) {
        bd.createObjectStore('obras', { keyPath: 'id' });
      }
      if (!bd.objectStoreNames.contains('itens')) {
        const store = bd.createObjectStore('itens', { keyPath: 'id', autoIncrement: true });
        store.createIndex('obraId', 'obraId', { unique: false });
      }
    };
    pedido.onsuccess = (e) => { db = e.target.result; resolve(); };
    pedido.onerror  = () => reject(pedido.error);
  });
}

function dbLerTudo(tabela) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(tabela, 'readonly').objectStore(tabela).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function dbEscrever(tabela, dados) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(tabela, 'readwrite').objectStore(tabela).put(dados);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function dbApagar(tabela, id) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(tabela, 'readwrite').objectStore(tabela).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

function dbLerPorIndice(tabela, indice, valor) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(tabela, 'readonly')
      .objectStore(tabela).index(indice).getAll(valor);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function exportarBackup() {
  const obras = await dbLerTudo('obras');
  const itens = await dbLerTudo('itens');
  const backup = {
    versao: 1,
    data: new Date().toISOString(),
    obras,
    itens
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `fercayo-backup-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importarBackup(evento) {
  const ficheiro = evento.target.files[0];
  if (!ficheiro) return;
  const texto  = await ficheiro.text();
  let backup;
  try {
    backup = JSON.parse(texto);
  } catch {
    alert('Ficheiro inválido. Certifica-te que é um backup gerado por esta app.');
    return;
  }
  if (!backup.obras || !backup.itens) {
    alert('Formato de backup não reconhecido.');
    return;
  }
  const confirmar = confirm(
    `Importar backup de ${backup.data?.slice(0,10) || 'data desconhecida'}?\n\n` +
    `${backup.obras.length} obras · ${backup.itens.length} itens\n\n` +
    `Os dados existentes serão substituídos.`
  );
  if (!confirmar) return;
  for (const obra of backup.obras) await dbEscrever('obras', obra);
  for (const item of backup.itens) await dbEscrever('itens', item);
  alert('✓ Backup importado com sucesso!');
  todasObras = await dbLerTudo('obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));
  renderizarObras();
  document.getElementById('cnt-obras').textContent = `${todasObras.length} obras`;
  obraAtual = null;
  itemAtual = null;
  itensObra = [];
  atualizarSummary();
}

async function iniciar() {
  await abrirDB();
  const obrasExistentes = await dbLerTudo('obras');
  if (obrasExistentes.length === 0) {
    for (const obra of OBRAS_DEFAULT) {
      await dbEscrever('obras', obra);
    }
  }
  todasObras = await dbLerTudo('obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));
  const itens283 = await dbLerPorIndice('itens', 'obraId', '283_26');
  if (itens283.length === 0) {
    for (const item of SEED_283_26) {
      item.criadoEm = Date.now();
      await dbEscrever('itens', item);
    }
  }
  renderizarObras();
  document.getElementById('cnt-obras').textContent = `${todasObras.length} obras`;
}

function renderizarObras(filtro = '') {
  const termo = filtro.toLowerCase();
  const lista = todasObras.filter(o =>
    o.codigo.toLowerCase().includes(termo) ||
    o.nome.toLowerCase().includes(termo)
  );
  document.getElementById('lista-obras').innerHTML = lista.map(obra => `
    <div class="obra-item ${obraAtual?.id === obra.id ? 'selected' : ''}"
         onclick="selecionarObra('${obra.id}')">
      <div class="obra-cod">${obra.codigo}${obra.orc ? ' · ' + obra.orc : ''}</div>
      <div class="obra-nm">${obra.nome}</div>
    </div>
  `).join('');
}

function filtrarObras(valor) {
  renderizarObras(valor);
}

async function selecionarObra(id) {
  obraAtual = todasObras.find(o => o.id === id);
  itemAtual = null;
  document.getElementById('breadcrumb').innerHTML =
    `<span>${obraAtual.codigo}</span> › ${obraAtual.nome}`;
  document.getElementById('add-row').style.display = 'flex';
  await carregarItens();
  renderizarEstadoVazio();
  renderizarObras(document.getElementById('search-obras').value);
}

async function carregarItens() {
  if (!obraAtual) return;
  itensObra = await dbLerPorIndice('itens', 'obraId', obraAtual.id);
  renderizarItens();
  atualizarSummary();
}

function renderizarItens() {
  const el = document.getElementById('lista-itens');
  const itensFiltrados = filtroEstado === 'todos'
    ? itensObra
    : itensObra.filter(i => i.estado === filtroEstado);
  document.getElementById('cnt-itens').textContent = `${itensObra.length} itens`;
  if (!itensFiltrados.length) {
    el.innerHTML = `<div class="empty-state">
      <div style="font-size:24px;opacity:.3">📦</div>
      ${obraAtual ? 'Sem itens neste filtro' : 'Seleciona uma obra'}
    </div>`;
    return;
  }
  el.innerHTML = itensFiltrados.map(item => `
    <div class="item-row s-${item.estado} ${itemAtual?.id === item.id ? 'selected' : ''}"
         onclick="selecionarItem(${item.id})">
      <div class="item-art">${item.artigo || '⚠ Extra'}</div>
      <div class="item-nm">${item.descricao || item.nome || '—'}</div>
      <div class="item-meta">${[item.tipo, item.dims].filter(Boolean).join(' · ')}</div>
      <span class="badge b-${item.estado}">${etiquetaEstado(item.estado)}</span>
    </div>
  `).join('');
}

function setFiltro(valor, botao) {
  filtroEstado = valor;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  botao.classList.add('active');
  renderizarItens();
}

function selecionarItem(id) {
  itemAtual = itensObra.find(i => i.id === id);
  renderizarItens();
  renderizarEstado();
}

function renderizarEstadoVazio() {
  document.getElementById('estado-body').innerHTML = `
    <div class="empty-state">
      <div style="font-size:32px;opacity:.3">🔍</div>
      Seleciona um item
    </div>`;
}

function renderizarEstado() {
  if (!itemAtual) { renderizarEstadoVazio(); return; }
  const item = itemAtual;
  const estados = [
    { k: 'pendente',  lbl: 'Pendente',          sub: 'Não conferido',                    ic: '○',  cor: 'var(--estado-pendente)' },
    { k: 'conferido', lbl: 'Conferido',          sub: 'Aprovado — pode produzir',         ic: '✔',  cor: 'var(--estado-conferido)' },
    { k: 'alteracao', lbl: 'Alteração em curso', sub: 'Requer nota explicativa',          ic: '⚠',  cor: 'var(--estado-alteracao)' },
    { k: 'anulado',   lbl: 'Anulado',            sub: 'Item cancelado / não se aplica',   ic: '✕',  cor: 'var(--estado-anulado)' },
    { k: 'extra',     lbl: 'Extra',              sub: 'Fora de ORC · orçamento em curso', ic: '＋', cor: 'var(--estado-extra)' },
  ];
  const mostrarNota = ['alteracao', 'extra'].includes(item.estado) || item.nota;
  document.getElementById('estado-body').innerHTML = `
    <div class="ec">
      <div class="ec-hdr">Informação</div>
      <div class="ec-body">
        ${item.estado === 'extra' ? `
          <div style="background:rgba(74,158,255,.08);border:1px solid var(--estado-extra);
                      border-radius:6px;padding:7px 10px;margin-bottom:10px;
                      font-size:11px;color:var(--estado-extra)">
            ＋ Item extra — fora do orçamento, necessita ser orçado
          </div>` : ''}
        <div class="info-grid">
          ${item.artigo  ? `<div class="info-field"><div class="info-label">Artigo</div><div class="info-val mono">${item.artigo}</div></div>` : ''}
          ${item.seccao  ? `<div class="info-field"><div class="info-label">Secção</div><div class="info-val">${item.seccao}</div></div>` : ''}
          ${item.tipo    ? `<div class="info-field"><div class="info-label">Tipo</div><div class="info-val">${item.tipo}</div></div>` : ''}
          ${item.dims    ? `<div class="info-field"><div class="info-label">Dimensões</div><div class="info-val mono">${item.dims}</div></div>` : ''}
          ${item.ref     ? `<div class="info-field"><div class="info-label">Referência</div><div class="info-val mono">${item.ref}</div></div>` : ''}
          ${item.quant   ? `<div class="info-field"><div class="info-label">Quantidade</div><div class="info-val mono">${item.quant} ${item.unid || ''}</div></div>` : ''}
          ${item.material? `<div class="info-field info-full"><div class="info-label">Material / Cor</div><div class="info-val">${item.material}</div></div>` : ''}
          <div class="info-field info-full">
            <div class="info-label">Descrição</div>
            <div class="info-val" style="font-size:12px;line-height:1.5">${item.descricao || item.nome || '—'}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="ec">
      <div class="ec-hdr">Estado</div>
      <div class="ec-body">
        ${estados.map(e => `
          <div class="pip-step ${item.estado === e.k ? 'ativo' : ''}"
               onclick="definirEstado('${e.k}')">
            <div class="pip-circle" style="${item.estado === e.k ? 'border-color:' + e.cor : ''}">
              <span style="color:${e.cor}">${e.ic}</span>
            </div>
            <div>
              <div class="pip-label" style="color:${e.cor}">${e.lbl}</div>
              <div class="pip-sub">${e.sub}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ${mostrarNota ? `
    <div class="ec">
      <div class="ec-hdr">
        ${item.estado === 'extra' ? 'Descrição do Item Extra' :
          item.estado === 'alteracao' ? 'Nota de Alteração' : 'Nota'}
      </div>
      <div class="ec-body">
        <textarea class="nota-ta" id="nota-ta"
          placeholder="${item.estado === 'extra'
            ? 'Descreve o item extra e o estado do orçamento…'
            : 'Descreve a alteração: dimensões, material, cor, ferragem…'
          }">${item.nota || ''}</textarea>
        <div style="margin-top:8px">
          <button class="abtn" onclick="guardarNota(document.getElementById('nota-ta').value)">
            💾 Guardar nota
          </button>
        </div>
      </div>
    </div>` : ''}
    <div class="ec">
      <div class="ec-hdr">Ações Rápidas</div>
      <div class="ec-body">
        <div class="acao-row">
          <button class="abtn" onclick="definirEstado('pendente')" style="border-color:var(--estado-pendente);color:var(--estado-pendente)">○ Pendente</button>
          <button class="abtn" onclick="definirEstado('conferido')" style="border-color:var(--estado-conferido);color:var(--estado-conferido)">✔ Conferido</button>
          <button class="abtn" onclick="definirEstado('alteracao')" style="border-color:var(--estado-alteracao);color:var(--estado-alteracao)">⚠ Alteração</button>
          <button class="abtn" onclick="definirEstado('anulado')"   style="border-color:var(--estado-anulado);color:var(--estado-anulado)">✕ Anulado</button>
          <button class="abtn" onclick="definirEstado('extra')"     style="border-color:var(--estado-extra);color:var(--estado-extra)">＋ Extra</button>
          <button class="abtn btn-danger" onclick="removerItem()">🗑 Remover</button>
        </div>
      </div>
    </div>
  `;
}

async function definirEstado(novoEstado) {
  if (!itemAtual) return;
  itemAtual.estado = novoEstado;
  await dbEscrever('itens', itemAtual);
  await carregarItens();
  renderizarEstado();
}

async function guardarNota(texto) {
  if (!itemAtual) return;
  itemAtual.nota = texto;
  await dbEscrever('itens', itemAtual);
}

async function removerItem() {
  if (!itemAtual) return;
  if (!confirm(`Remover "${itemAtual.descricao || itemAtual.nome}"?`)) return;
  await dbApagar('itens', itemAtual.id);
  itemAtual = null;
  await carregarItens();
  renderizarEstadoVazio();
}

async function adicionarItemExtra() {
  const input = document.getElementById('add-inp');
  const valor = input.value.trim();
  if (!valor || !obraAtual) return;
  await dbEscrever('itens', {
    obraId:    obraAtual.id,
    artigo:    '',
    descricao: valor,
    nome:      valor,
    tipo:      '',
    dims:      '',
    ref:       '',
    quant:     '',
    unid:      '',
    material:  '',
    seccao:    'Extra',
    nota:      '',
    estado:    'extra',
    criadoEm:  Date.now()
  });
  input.value = '';
  await carregarItens();
}

function abrirModal()  { document.getElementById('modal-overlay').classList.add('open'); }
function fecharModal() { document.getElementById('modal-overlay').classList.remove('open'); }

async function criarObra() {
  const codigo = document.getElementById('m-cod').value.trim().toUpperCase();
  const nome   = document.getElementById('m-nom').value.trim();
  const orc    = document.getElementById('m-orc').value.trim();
  if (!codigo || !nome) { alert('Código e nome são obrigatórios.'); return; }
  if (todasObras.find(o => o.id === codigo)) { alert('Código já existe.'); return; }
  await dbEscrever('obras', { id: codigo, codigo, nome, orc });
  todasObras = await dbLerTudo('obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));
  renderizarObras();
  document.getElementById('cnt-obras').textContent = `${todasObras.length} obras`;
  fecharModal();
  ['m-cod', 'm-nom', 'm-orc'].forEach(id => document.getElementById(id).value = '');
}

function filtrarDropdownObra(contexto) {
  const input = document.getElementById(`${contexto}-search`);
  const drop  = document.getElementById(`${contexto}-drop`);
  const termo = input.value.toLowerCase();
  const lista = todasObras
    .filter(o => o.codigo.toLowerCase().includes(termo) || o.nome.toLowerCase().includes(termo))
    .slice(0, 12);
  drop.innerHTML = lista.map(o => `
    <div class="obra-dd-item" onclick="selecionarObraContexto('${contexto}', '${o.id}')">
      <div class="obra-dd-cod">${o.codigo}${o.orc ? ' · ' + o.orc : ''}</div>
      <div class="obra-dd-nm">${o.nome}</div>
    </div>
  `).join('');
  drop.classList.add('open');
}

function abrirDropdown(contexto) {
  filtrarDropdownObra(contexto);
}

function selecionarObraContexto(contexto, id) {
  const obra = todasObras.find(o => o.id === id);
  document.getElementById(`${contexto}-search`).value = '';
  document.getElementById(`${contexto}-drop`).classList.remove('open');
  const tagHtml = `
    <div class="obra-tag">
      <span class="cod">${obra.codigo}</span>
      <span class="nm">${obra.nome}</span>
      <span class="clr" onclick="limparObraContexto('${contexto}')">✕</span>
    </div>`;
  document.getElementById(`${contexto}-obra-tag`).style.display = 'flex';
  document.getElementById(`${contexto}-obra-tag`).innerHTML = tagHtml;
  if (contexto === 'ext') {
    obraImport = obra;
    const tag2 = document.getElementById('ext-obra-tag2');
    if (tag2) {
      tag2.style.display = 'block';
      tag2.innerHTML = `<div class="obra-tag"><span class="cod">${obra.codigo}</span><span class="nm">${obra.nome}</span></div>`;
    }
  } else {
    obraRelatorio = obra;
    renderizarResumoRelatorio();
  }
}

function limparObraContexto(contexto) {
  document.getElementById(`${contexto}-obra-tag`).style.display = 'none';
  document.getElementById(`${contexto}-obra-tag`).innerHTML = '';
  if (contexto === 'ext') {
    obraImport = null;
  } else {
    obraRelatorio = null;
    document.getElementById('rel-resumo-card').style.display = 'none';
    document.getElementById('rel-acao').style.display = 'none';
  }
}

function setModoImport(modo) {
  const isPdf = modo === 'pdf';
  document.getElementById('mode-pdf').style.display  = isPdf ? 'block' : 'none';
  document.getElementById('mode-json').style.display = isPdf ? 'none'  : 'block';
  document.getElementById('tab-pdf').className  = 'mode-btn ' + (isPdf ? 'active' : 'inactive');
  document.getElementById('tab-json').className = 'mode-btn ' + (isPdf ? 'inactive' : 'active');
}

function processarTextoPDF() {
  if (!obraImport) { alert('Seleciona a obra de destino primeiro.'); return; }
  const texto = document.getElementById('txt-pdf').value.trim();
  if (!texto)  { alert('Cola o texto do PDF primeiro.'); return; }
  itensPrevImport = [];
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  const reArtigo = /^(\d+\.\d[\d.]*)/;
  for (const linha of linhas) {
    if (/total|iva|preço|fercayo|nipc|email|página|data:|artigo|designação|unid\.|parciais|capital social/i.test(linha)) continue;
    if (/^\d+[,.]?\d*\s*€/.test(linha)) continue;
    if (linha.length < 8) continue;
    const matchArtigo = linha.match(reArtigo);
    if (!matchArtigo) continue;
    const artigo = matchArtigo[1];
    const resto  = linha.slice(artigo.length).trim();
    const matchDims = resto.match(/(\d{3,4}[xX×]\d{3,4}(?:[xX×]\d{2,4})?(?:mm)?)/);
    const dims = matchDims ? matchDims[1] : '';
    const matchRef = resto.match(/\([-\w]+\)/);
    const ref = matchRef ? matchRef[0] : '';
    const matchQt = resto.match(/\b(\d+[,.]?\d*)\s*(un|ml|m2|m3)\b/i);
    const quant = matchQt ? matchQt[1] : '';
    const unid  = matchQt ? matchQt[2] : '';
    let descricao = resto
      .replace(/\b\d+[,.]?\d*\s*€/g, '')
      .replace(/\b(un|ml|m2|m3)\b.*$/i, '')
      .trim();
    if (descricao.length < 4) continue;
    itensPrevImport.push({
      obraId:    obraImport.id,
      artigo,
      descricao: descricao.substring(0, 150),
      nome:      descricao.substring(0, 150),
      tipo:      '',
      dims,
      ref,
      quant,
      unid,
      material:  '',
      seccao:    '',
      nota:      '',
      estado:    'pendente',
      criadoEm:  Date.now()
    });
  }
  mostrarPreVisualizacao();
}

function processarJSON() {
  if (!obraImport) { alert('Seleciona a obra de destino primeiro.'); return; }
  const texto = document.getElementById('txt-json').value.trim();
  if (!texto)  { alert('Cola o JSON primeiro.'); return; }
  let parsed;
  try {
    parsed = JSON.parse(texto);
  } catch (e) {
    alert('JSON inválido. Verifica o formato.\n\n' + e.message);
    return;
  }
  if (!Array.isArray(parsed)) {
    alert('O JSON deve ser uma lista (array) de itens.');
    return;
  }
  itensPrevImport = parsed.map(it => ({
    obraId:    obraImport.id,
    artigo:    it.artigo    || '',
    descricao: it.descricao || it.nome || '',
    nome:      it.descricao || it.nome || '',
    tipo:      it.tipo      || '',
    dims:      it.dims      || it.dimensoes || '',
    ref:       it.ref       || it.referencia || '',
    quant:     it.quant     || it.quantidade || '',
    unid:      it.unid      || it.unidade    || '',
    material:  it.material  || it.cor        || '',
    seccao:    it.seccao    || it.secção      || '',
    nota:      '',
    estado:    'pendente',
    criadoEm:  Date.now()
  }));
  mostrarPreVisualizacao();
}

function mostrarPreVisualizacao() {
  if (!itensPrevImport.length) {
    alert('Nenhum item reconhecido. Verifica o formato.');
    return;
  }
  document.getElementById('ext-cnt').textContent = `${itensPrevImport.length} itens`;
  document.getElementById('ext-prev-card').style.display = 'block';
  document.getElementById('ext-prev').innerHTML = itensPrevImport.map((item, idx) => `
    <div class="prev-item">
      <div class="prev-art">${item.artigo || '—'}</div>
      <div class="prev-nm">${(item.descricao || '').substring(0, 70)}</div>
      <div class="prev-dims">${item.dims}</div>
      <div class="prev-tipo">${item.tipo}</div>
      <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text2)">${item.quant} ${item.unid}</div>
      <button onclick="removerItemPreview(${idx})"
              style="background:none;border:none;color:var(--red);cursor:pointer;font-size:14px;padding:0">✕</button>
    </div>
  `).join('');
}

function removerItemPreview(indice) {
  itensPrevImport.splice(indice, 1);
  mostrarPreVisualizacao();
}

async function confirmarImportacao() {
  if (!itensPrevImport.length) return;
  for (const item of itensPrevImport) {
    await dbEscrever('itens', item);
  }
  const idObra = itensPrevImport[0].obraId;
  alert(`✓ ${itensPrevImport.length} itens importados para ${obraImport.codigo}!`);
  itensPrevImport = [];
  limparObraContexto('ext');
  document.getElementById('ext-prev-card').style.display = 'none';
  document.getElementById('txt-pdf').value  = '';
  document.getElementById('txt-json').value = '';
  obraAtual = todasObras.find(o => o.id === idObra);
  mostrarPainel('checklist');
  renderizarObras();
  await carregarItens();
}

function cancelarImportacao() {
  itensPrevImport = [];
  document.getElementById('ext-prev-card').style.display = 'none';
}

async function renderizarResumoRelatorio() {
  if (!obraRelatorio) return;
  const itens = await dbLerPorIndice('itens', 'obraId', obraRelatorio.id);
  const contadores = { pendente: 0, conferido: 0, alteracao: 0, anulado: 0, extra: 0 };
  itens.forEach(i => { if (contadores[i.estado] !== undefined) contadores[i.estado]++; });
  document.getElementById('rel-resumo-card').style.display = 'block';
  document.getElementById('rel-acao').style.display = 'flex';
  document.getElementById('rel-resumo-body').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px">
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-pendente)">${contadores.pendente}</div>
        <div style="font-size:10px;color:var(--text3)">Pendente</div>
      </div>
      <div style="background:var(--bg3);border:1px solid rgba(76,175,125,.3);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-conferido)">${contadores.conferido}</div>
        <div style="font-size:10px;color:var(--text3)">Conferido</div>
      </div>
      <div style="background:var(--bg3);border:1px solid rgba(224,138,60,.3);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-alteracao)">${contadores.alteracao}</div>
        <div style="font-size:10px;color:var(--text3)">Alteração</div>
      </div>
      <div style="background:var(--bg3);border:1px solid rgba(224,82,82,.3);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-anulado)">${contadores.anulado}</div>
        <div style="font-size:10px;color:var(--text3)">Anulado</div>
      </div>
      <div style="background:var(--bg3);border:1px solid rgba(74,158,255,.3);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-extra)">${contadores.extra}</div>
        <div style="font-size:10px;color:var(--text3)">Extra</div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text2)">
      <b>${itens.length}</b> itens ·
      <b style="color:var(--estado-conferido)">${contadores.conferido} Conferidos</b> ·
      <b style="color:var(--estado-alteracao)">${contadores.alteracao} Alterações</b> ·
      <b style="color:var(--estado-anulado)">${contadores.anulado} Anulados</b> ·
      <b style="color:var(--estado-extra)">${contadores.extra} Extra</b>
    </div>`;
}

async function gerarPDF() {
  if (!obraRelatorio) return;
  const obra  = obraRelatorio;
  const itens = await dbLerPorIndice('itens', 'obraId', obra.id);
  const hoje  = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const cont = { pendente: 0, conferido: 0, alteracao: 0, anulado: 0, extra: 0 };
  itens.forEach(i => { if (cont[i.estado] !== undefined) cont[i.estado]++; });
  const simbolo = { pendente: '○', conferido: '✓', alteracao: '△', anulado: '✕', extra: '+' };
  const etiqueta = { pendente: 'Pendente', conferido: 'Conferido', alteracao: 'Alteração', anulado: 'Anulado', extra: 'Extra' };
  const corPDF   = { pendente: '#aaa', conferido: '#4caf7d', alteracao: '#e08a3c', anulado: '#e05252', extra: '#4a9eff' };
  const seccoes = {};
  itens.forEach(i => {
    const s = i.seccao || 'Geral';
    if (!seccoes[s]) seccoes[s] = [];
    seccoes[s].push(i);
  });
  let linhasTabela = '';
  Object.entries(seccoes).forEach(([seccao, itensSeccao]) => {
    linhasTabela += `<tr><td colspan="6" class="sec-hdr">${seccao}</td></tr>`;
    itensSeccao.forEach((item, idx) => {
      const isConferido = item.estado === 'conferido';
      const isAnulado   = item.estado === 'anulado';
      const isExtra     = item.estado === 'extra';
      const classeRow   = isAnulado ? 'row-anulado' : isConferido ? 'row-conferido' : isExtra ? 'row-extra' : '';
      linhasTabela += `
        <tr class="${classeRow}">
          <td class="td-num">${idx + 1}</td>
          <td class="td-art">${item.artigo || '—'}</td>
          <td class="td-desc">
            <div class="desc-princ">${item.descricao || item.nome || '—'}</div>
            <div class="desc-meta">
              ${[item.tipo, item.dims, item.ref, item.material].filter(Boolean).join(' · ')}
            </div>
            ${item.nota ? `<div class="desc-nota nota-${item.estado}">📝 ${item.nota}</div>` : ''}
          </td>
          <td class="td-qt">${item.quant || '—'} ${item.unid || ''}</td>
          <td class="td-est" style="color:${corPDF[item.estado] || '#aaa'}">
            ${simbolo[item.estado] || '○'} ${etiqueta[item.estado] || ''}
          </td>
          <td class="td-check">
            <div class="chk">○ Conf.</div>
            <div class="chk">○ Alt.</div>
            <div class="chk">○ Anul.</div>
          </td>
        </tr>
        <tr class="linha-nota">
          <td colspan="6">
            ${item.nota
              ? `<div class="nota-impressa nota-${item.estado}">📝 ${item.nota}</div>`
              : `<div class="linha-ms">Nota: ___________________________________________________________________________________________________________</div>`
            }
          </td>
        </tr>`;
    });
  });
  const htmlPDF = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 12mm 10mm 14mm 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 9pt; color: #111; background: #fff; }
  .cabecalho { border-bottom: 2px solid #333E48; padding-bottom: 8px; margin-bottom: 8px; }
  .cab-top   { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .cab-logo  { font-size: 14pt; font-weight: 700; color: #333E48; letter-spacing: 2px; }
  .cab-sub   { font-size: 7pt; color: #6A7079; letter-spacing: 2px; }
  .cab-obra  { font-size: 12pt; font-weight: 700; color: #333E48; margin-bottom: 2px; }
  .cab-meta  { font-size: 8pt; color: #6A7079; display: flex; gap: 16px; flex-wrap: wrap; }
  .resumo { display: flex; gap: 6px; margin-bottom: 8px; }
  .res    { flex: 1; border: 1px solid #ddd; border-radius: 4px; padding: 5px 8px; text-align: center; }
  .res-n  { font-size: 14pt; font-weight: 700; }
  .res-l  { font-size: 7pt; color: #888; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; }
  th    { background: #333E48; color: #fff; font-size: 7.5pt; padding: 4px 5px; text-align: left; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  td    { border-bottom: 1px solid #e8e8e8; padding: 3px 5px; vertical-align: top; font-size: 8.5pt; }
  .sec-hdr  { background: #AF7C34; color: #fff; font-size: 8pt; font-weight: 700; padding: 4px 8px; letter-spacing: 1px; text-transform: uppercase; }
  .td-num   { color: #aaa; font-size: 7.5pt; width: 18px; text-align: center; }
  .td-art   { font-family: monospace; font-size: 7.5pt; color: #AF7C34; width: 70px; white-space: nowrap; }
  .td-qt    { font-family: monospace; font-size: 7.5pt; color: #555; width: 45px; text-align: center; white-space: nowrap; }
  .td-est   { font-size: 7.5pt; font-weight: 600; width: 60px; text-align: center; white-space: nowrap; }
  .td-check { width: 72px; padding: 2px 4px; }
  .desc-princ { font-size: 8.5pt; font-weight: 500; line-height: 1.3; }
  .desc-meta  { font-size: 7.5pt; color: #888; margin-top: 1px; font-family: monospace; }
  .chk { font-size: 7pt; color: #555; line-height: 1.5; }
  .linha-nota td { padding: 1px 5px 4px; border-bottom: 1px solid #f0f0f0; }
  .linha-ms   { font-size: 7.5pt; color: #ccc; }
  .nota-impressa  { font-size: 7.5pt; font-style: italic; padding: 2px 6px; border-radius: 2px; margin-top: 1px; }
  .nota-alteracao { color: #e08a3c; border-left: 2px solid #e08a3c; background: #fff8f0; }
  .nota-extra     { color: #4a9eff; border-left: 2px solid #4a9eff; background: #f0f7ff; }
  .nota-conferido { color: #4caf7d; border-left: 2px solid #4caf7d; background: #f0fff5; }
  .row-conferido .desc-princ { color: #aaa; }
  .row-conferido .td-art     { color: #ccc; }
  .row-conferido              { background: #f9fff9; }
  .row-anulado                { background: #fff5f5; opacity: .7; }
  .row-anulado .desc-princ   { text-decoration: line-through; color: #aaa; }
  .row-extra                  { background: #f5f9ff; }
  .row-extra .desc-princ     { color: #2a5f9f; font-weight: 600; }
  .assinaturas   { margin-top: 16px; border-top: 1px solid #333E48; padding-top: 10px; }
  .ass-titulo    { font-size: 8pt; font-weight: 700; color: #333E48; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .ass-grid      { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .ass-item      { display: flex; flex-direction: column; gap: 4px; }
  .ass-papel     { font-size: 7.5pt; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 1px; }
  .ass-linha     { border-bottom: 1px solid #333; height: 24px; margin: 12px 0 3px; }
  .ass-data      { font-size: 7pt; color: #aaa; }
  .rodape { margin-top: 10px; border-top: 1px solid #eee; padding-top: 5px; display: flex; justify-content: space-between; font-size: 7pt; color: #bbb; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="cabecalho">
    <div class="cab-top">
      <span class="cab-logo">FERCAYO</span>
      <span class="cab-sub">CARPINTARIAS</span>
    </div>
    <div class="cab-obra">${obra.codigo} · ${obra.nome}</div>
    <div class="cab-meta">
      ${obra.orc ? `<span>ORC: <b>${obra.orc}</b></span>` : ''}
      <span>Data: <b>${hoje}</b></span>
    </div>
  </div>
  <div class="resumo">
    <div class="res"><div class="res-n" style="color:#aaa">${cont.pendente}</div><div class="res-l">Pendente</div></div>
    <div class="res"><div class="res-n" style="color:#4caf7d">${cont.conferido}</div><div class="res-l">Conferido</div></div>
    <div class="res"><div class="res-n" style="color:#e08a3c">${cont.alteracao}</div><div class="res-l">Alteração</div></div>
    <div class="res"><div class="res-n" style="color:#e05252">${cont.anulado}</div><div class="res-l">Anulado</div></div>
    <div class="res"><div class="res-n" style="color:#4a9eff">${cont.extra}</div><div class="res-l">Extra</div></div>
    <div class="res"><div class="res-n" style="color:#333E48">${itens.length}</div><div class="res-l">Total</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:18px">#</th>
        <th style="width:70px">Artigo</th>
        <th>Descrição / Especificação</th>
        <th style="width:45px;text-align:center">Qt/Un</th>
        <th style="width:60px;text-align:center">Estado</th>
        <th style="width:72px;text-align:center">Verificação</th>
      </tr>
    </thead>
    <tbody>${linhasTabela}</tbody>
  </table>
  <div class="assinaturas">
    <div class="ass-titulo">Assinaturas</div>
    <div class="ass-grid">
      <div class="ass-item">
        <div class="ass-papel">Representante Fercayo</div>
        <div class="ass-linha"></div>
        <div class="ass-data">Data: _____ / _____ / _______</div>
      </div>
      <div class="ass-item">
        <div class="ass-papel">Responsável de Obra</div>
        <div class="ass-linha"></div>
        <div class="ass-data">Data: _____ / _____ / _______</div>
      </div>
    </div>
  </div>
  <div class="rodape">
    <span>Fercayo · Carpintarias, Lda · NIPC 517 016 338</span>
    <span>Rua Manuel José Moreira, 835 · 4570-366 Laúndos, Póvoa de Varzim</span>
    <span>geral@fercayo.pt · 252 601 189</span>
  </div>
</body></html>`;
  const janela = window.open('', '_blank');
  janela.document.write(htmlPDF);
  janela.document.close();
  setTimeout(() => janela.print(), 600);
}

function atualizarSummary() {
  const cont = { pendente: 0, conferido: 0, alteracao: 0, anulado: 0, extra: 0 };
  itensObra.forEach(i => { if (cont[i.estado] !== undefined) cont[i.estado]++; });
  document.getElementById('s-pend').textContent = cont.pendente;
  document.getElementById('s-conf').textContent = cont.conferido;
  document.getElementById('s-alt').textContent  = cont.alteracao;
  document.getElementById('s-anul').textContent = cont.anulado;
  document.getElementById('s-ext').textContent  = cont.extra;
  document.getElementById('s-total').textContent = `${itensObra.length} itens`;
}

function mostrarPainel(nome) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + nome).classList.add('active');
  document.querySelector(`.nav-btn[data-p="${nome}"]`)?.classList.add('active');
}

function etiquetaEstado(estado) {
  const mapa = {
    pendente:  '○ Pendente',
    conferido: '✔ Conferido',
    alteracao: '⚠ Alteração',
    anulado:   '✕ Anulado',
    extra:     '＋ Extra',
  };
  return mapa[estado] || estado;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { fecharModal(); return; }
  const tagActiva = document.activeElement.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagActiva)) return;
  if (!itemAtual || !obraAtual) return;
  const itensFiltrados = filtroEstado === 'todos'
    ? itensObra
    : itensObra.filter(i => i.estado === filtroEstado);
  const indiceActual = itensFiltrados.findIndex(i => i.id === itemAtual.id);
  if (e.key === 'ArrowDown' && indiceActual < itensFiltrados.length - 1) {
    e.preventDefault();
    selecionarItem(itensFiltrados[indiceActual + 1].id);
  }
  if (e.key === 'ArrowUp' && indiceActual > 0) {
    e.preventDefault();
    selecionarItem(itensFiltrados[indiceActual - 1].id);
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.obra-search-wrap')) {
    document.getElementById('ext-drop')?.classList.remove('open');
    document.getElementById('rel-drop')?.classList.remove('open');
  }
});

iniciar();
