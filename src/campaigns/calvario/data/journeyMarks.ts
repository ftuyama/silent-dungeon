import type { JourneyMarkDef } from '../../../engine/data/index.ts';

/**
 * Marcas da jornada (`state.marks`): texto para diário, toasts e badges.
 * Passivos de história do líder: `passives.ts` (`leadStoryPassives`) + `grantLeadStoryPassive`.
 */
export const journeyMarks: Record<string, JourneyMarkDef> = {
  world_wound_remembered: {
    name: 'Ferida do mundo',
    description:
      'Você lembrou o vilarejo antes do pulso verde: o que drena calor e nome, e o voto de descer até a raiz.',
  },
  act1_surface_whisper_intel: {
    name: 'Rumor que paga',
    description:
      'No subterrâneo da cidade, ouviste o que importa: nomes, horas, rotas — informação que vale ouro, sem pedir milagre.',
  },
  act1_surface_whisper_taint: {
    name: 'Riso na língua',
    description:
      'Algo na superfície devolveu um riso que não era seu; o eco ficou na boca como metal velho, e o subsolo lembrou-se do seu gosto.',
  },
  act1_wall_memory: {
    name: 'Memória da parede',
    description:
      'Tocou pedra que parecia carne fossilizada; o braço lembra o estremecer — a masmorra também toca de volta.',
  },
  act1_mirror_shard: {
    name: 'Caco no degrau',
    description:
      'Viu-se num fragmento de espelho: um estranho com o seu nome. O reflexo não absolve o próximo passo.',
  },
  act1_entrance_mirror: {
    name: 'Nicho partido',
    description:
      'Metade do rosto, metade do túnel — o mesmo corte. O vidro pediu escolha antes que o silêncio escolhesse por você.',
  },
  act1_hand_mirror: {
    name: 'Espelho de mão',
    description:
      'Segurou o espelho sem a água a mentir; só você e as promessas — sem absolvição barata.',
  },
  act1_door_runes: {
    name: 'Runas nos batentes',
    description:
      'Leu runas re-riscadas e o sino rudimentar do Terceiro Sino; a madeira úmida por dentro ainda respira.',
  },
  act2_rats_listen: {
    name: 'Chiar contado',
    description:
      'Ouviu o enxame em padrão — quase linguagem. Contou passos antes de avançar.',
  },
  act2_rats_smell: {
    name: 'Fedor de ninho',
    description:
      'Mofo, ferro e cobre quente: sangue antigo que nunca secou. O nariz pagou o preço.',
  },
  act2_cruzeiro_marks: {
    name: 'Marcas do cruzeiro',
    description:
      'Três sulcos, pegadas que voltam atrás, Morvayn e um sino fincado — o chão como mapa de quem desistiu a meio.',
  },
  act3_cult_flight: {
    name: 'Fuga sob capuzes',
    description:
      'Correste da emboscada com o Terceiro Sino na nuca: suprimento perdido, vigília desconfiada, e um naco de sombra a somar-se à corrupção.',
  },
  act3_well_truth: {
    name: 'Verdade no poço',
    description:
      'Viste o truque do espelho: o reflexo mentia, o caminho real abriu à esquerda. Sabes ler armadilhas que se fingem claridade.',
  },
  act3_well_snare: {
    name: 'Reflexo enganador',
    description:
      'Acreditaste no que o poço mostrou; o mapa mentiu. A próxima sala guarda a surpresa que escolheu não ver a tempo.',
  },
  act3_rune_tuned: {
    name: 'Ritmo de pedra domado',
    description:
      'Sintonizaste o pulso das runas; por instantes a tumba obedece à sua atenção, e o pensamento sobe mais limpo.',
  },
  act3_rune_jarred: {
    name: 'Eco nas runas',
    description:
      'O compasso das runas negou-te; um choque seco nos tendões, passos meio-tempo atrasados — a parede lembraste que apressar não é dominar.',
  },
  act6_memory_kept: {
    name: 'Memória intacta',
    description:
      'No julgamento do véu, escolheu não sangrar o que guarda; o preço foi outro, mas o núcleo ficou seu.',
  },
  act6_memory_spoiled: {
    name: 'Memória manchada',
    description:
      'Deixaste a prova rasgar o que eras; a lembrança saiu contaminada — útil talvez, mas já não inocente.',
  },
  act6_shadow_faced: {
    name: 'Sombra encarada',
    description:
      'No espelho final, não fugiu ao duplo; nomear o reflexo custou, mas arrancou presença ao vazio.',
  },
  act6_veil_aligned: {
    name: 'Véu alinhado',
    description:
      'No tímpano do real, escolheu foco em vez de fuga; o mundo continua mentiroso, mas você aprendeu onde pisa.',
  },
  act6_veil_broken: {
    name: 'Véu em estilhaços',
    description:
      'Preferiste estilhaçar a cortina; o ruído que entráveis não filtra bem — vês demais ou de menos, mas já não como antes.',
  },
  act6_void_pact_mark: {
    name: 'Marca do pacto vazio',
    description:
      'Você reivindicou o segredo do Vazio por nome; assinatura sem tinta, mas a narrativa lembra a quem cedeu o último grão.',
  },
  act6_will_direct: {
    name: 'Vontade à frente',
    description:
      'No desafio da vontade, cortaste em linha reta; pouca dança, muito embate — seu caminho não pediu permissão.',
  },
  act6_will_measured: {
    name: 'Vontade medida',
    description:
      'Trocaste ferro por cálculo; duelo limpo, passos contados — vitória que sabe a disciplina, não a sorte.',
  },
  act6_will_scattered: {
    name: 'Vontade em fuga',
    description:
      'A horda partiu sua concentração em retalhos; sobreviveste em dispersão — honra de quem atravessa caos sem fingir ordem.',
  },
  act7_bell_ate_promise: {
    name: 'Promessa digerida',
    description:
      'O sino silencioso ofereceu pacto em susurro; escolheu engolir a promessa — sabor de futuro que não descreve por palavras.',
  },
  act7_bell_paid_faith: {
    name: 'Sino pago em fé',
    description:
      'Pagaste o sino com o que não se pesa; a campainha mudou de dono e você ficaste com o eco na consciência.',
  },
  act7_broke_hollow_line: {
    name: 'Linha oca partida',
    description:
      'Partiste a formação do vazio armado; o que era parede tornou-se brecha — testemunha de quem não cedeu ao desfile.',
  },
  act7_cinder_burned: {
    name: 'Marca da cinza',
    description:
      'O dízimo de cinzas exigiu mais do que deste; queimaste na recusa ou na falha — pele lembra o forno que te mediu.',
  },
  act7_cinder_favored: {
    name: 'Favorecido pela cinza',
    description:
      'O dízimo aceitou seu tributo; favorecido pela corrente que consome — não é bênção limpa, é reconhecimento de quem paga.',
  },
  act7_ember_witness: {
    name: 'Testemunha do braseiro',
    description:
      'Seguiste o devorador de brasas até onde a narrativa arde; testemunhaste o fim sem virar cinza — susto que fica na retina.',
  },
  act7_heard_ash_sermon: {
    name: 'Sermão de cinza',
    description:
      'Ouviste os versículos do último pregador de cinzas; a homilia não pede amém, pede silêncio — e guardaste ambos.',
  },
  act7_last_train_rider: {
    name: 'Último trem',
    description:
      'Montaste o rumor do último trem; passageiro de uma linha que não existe no mapa — chegada onde o calendário desiste.',
  },
  act7_paid_sky_in_faith: {
    name: 'Céu pago em fé',
    description:
      'Antes do horizonte final, ofertaste convicção ao teto mentiroso; o céu ficou com dívida e você com o arranhão da troca.',
  },
  act7_sealed_in_ember: {
    name: 'Selado no braseiro',
    description:
      'Escolheste fechar o ciclo no calor que não perdoa; selo de brasas — menos palavra, mais cicatriz viva.',
  },
  act7_sky_stitch_torn: {
    name: 'Costura do céu rasgada',
    description:
      'A costura falhou; o pano do firmamento escapou entre seus dedos — vergonha de quem tentou remendar o impossível e ouviu o estoirar.',
  },
  act7_sky_stitch_true: {
    name: 'Costura verdadeira',
    description:
      'Puxaste o fio até ele obedecer; o céu não ficou perfeito, mas deixou de sangrar por essa frente — ofício de quem não desistiu.',
  },
  act7_walked_bare: {
    name: 'Passo nu',
    description:
      'Recusaste armadura narrativa diante do fim; caminhaste nu de metáforas — exposição que é coragem ou loucura, e talvez as duas.',
  },
  calvario_sealed: {
    name: 'Masmorra selada',
    description:
      'Você carregou o peso do selo em você; o subsolo cala — silêncio de pedra — porque assumiu o custo em fé e cicatriz, em vez de emprestar o rumor.',
  },
  fled_rats: {
    name: 'Retirada dos ratos',
    description:
      'Escolheste não medir forças com a maré de dentes; sobreviveste a custa de orgulho — quem foge hoje conta a história amanhã.',
  },
  act2_brazier_scar: {
    name: 'Cicatriz do braseiro',
    description:
      'Rasgaste o selo quente por mantimentos e deixaste fé na cera. Prova de que sobrevivência também cobra devoção.',
  },
  mira_camp_shadows: {
    name: 'Sombras com a Mira',
    description:
      'No acampamento, a Mira partilhou o que esconde sob o riso; confiança de quem vê no escuro sem pedir lanterna.',
  },
  mira_cruzeiro_confidencia: {
    name: 'Confidência no cruzeiro',
    description:
      'Trocamos verdades fracas no hub; ela guarda um lugar nseu mapa emocional que o mapa de pedra não tem.',
  },
  mira_frost_pact: {
    name: 'Pacto de geada',
    description:
      'No gelo, a Mira amarrou palavra com você; promessa que congela antes de partir — lealdade que não derrete com o primeiro sol.',
  },
  mira_void_endtalk: {
    name: 'Última conversa no vazio',
    description:
      'No fim do arco, ela falou como quem já despediu o corpo; ficaste com a frase que não cabe em inventário.',
  },
  monk_inner_peace: {
    name: 'Paz interior',
    description:
      'Na neve acima da tempestade, um monge sem rosto deixou-te um silêncio que não pede nome — encerramento, não promessa; o peito aprendeu a respirar sem truque.',
  },
  morvayn_slain: {
    name: 'Morvayn findado',
    description:
      'Ferro no trono; Morvayn caiu por sua mão. Carregas a limpeza suja de quem mata para calar um nome demais alto.',
  },
  pact_bound: {
    name: 'Pacto do Terceiro Sino',
    description:
      'Assinaste o silêncio em pele; o Culto inscreveu-se em corrupção que sobe como juro do que pediste em nome da cidade.',
  },
  soul_scarred_by_seal: {
    name: 'Alma cicatriz do selo',
    description:
      'O selo partiu mal; a alma ficou com a costura à mostra. Quem luta com você nota o eco que não fecha.',
  },
  title_fallen_god: {
    name: 'Título: deus caído',
    description:
      'Testemunhaste ou consumiste o título que o cume nega; nome que pesa como coroa de pedra negra — glória e maldição à vez.',
  },
  tomas_camp_oath: {
    name: 'Juramento com o Tomás',
    description:
      'Ao lume do acampamento, o escudeiro amarrou palavra com você; dever mútuo que cheira a ferro e pão partido.',
  },
  tomas_void_duty: {
    name: 'Dever no vazio',
    description:
      'No deserto final, o Tomás nomeou obrigação sem fanfarra; carregas dever que não pede aplauso, só cumprimento.',
  },
  vetrnax_slain: {
    name: 'Vetrnax findado',
    description:
      'O gelo perdeu o seu titã; a cordilheira lembra quem fechou o nome na neve com lâmina ou ritual.',
  },
  magma_lord_slain: {
    name: 'Senhor do Magma findado',
    description:
      'O fundo do eixo perdeu o seu senhor; o crisol ainda arde, mas sem vontade — o silêncio finalmente tem chão.',
  },
  wound_mire_leg: {
    name: 'Mordida do poço',
    description:
      'A sorte falhou no charco; a perna lembra dentes que não são seus — leme que tarda um segundo quando o perigo exige dois.',
  },
};
