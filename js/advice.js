/*
 * Advice engine: turns (your civ, enemy civ, map archetype, proximity)
 * into a build order suggestion, a unit-composition/counter suggestion,
 * and map-specific notes. Pure rules/heuristics, no external data.
 */

const BUILD_ORDERS = [
  {
    id: 'drush-scout-rush',
    name: 'Drush into Scout Rush',
    summary: 'Dark Age Militia harass, transition straight into Feudal Age Scout Cavalry to raid before the enemy walls up.',
    score(ctx) {
      let s = 0;
      if (ctx.proximity === 'close') s += 3;
      if (ctx.mapArchetype.tags.favorsRush) s += 2;
      if (ctx.yourCiv.tags.includes('fastFeudal')) s += 2;
      if (ctx.yourCiv.strongUnits.includes('scouts')) s += 1;
      if (ctx.proximity === 'water-separated') s -= 5;
      if (ctx.mapArchetype.tags.chokePoints) s -= 2;
      if (ctx.enemyCount >= 2) s -= 1; // overextending vs. one enemy is riskier when others are still coming
      return s;
    },
  },
  {
    id: 'maa-archers',
    name: 'Man-at-Arms into Archers',
    summary: 'Feudal Man-at-Arms to apply early pressure, then shift production to Archery Ranges for a sustained Feudal/Castle Age push.',
    score(ctx) {
      let s = 1;
      if (ctx.proximity === 'close' || ctx.proximity === 'medium') s += 2;
      if (ctx.mapArchetype.tags.favorsRush) s += 2;
      if (ctx.yourCiv.strongUnits.includes('archers')) s += 3;
      if (ctx.yourCiv.strongUnits.includes('infantry')) s += 1;
      if (ctx.proximity === 'water-separated') s -= 4;
      return s;
    },
  },
  {
    id: 'cavalry-rush',
    name: 'Fast Feudal Cavalry/Camel Rush',
    summary: 'Skip straight to Feudal Age and pump Scout Cavalry or Camels to constantly harass villagers and force defensive reactions.',
    score(ctx) {
      let s = 0;
      if (ctx.proximity === 'close') s += 3;
      if (ctx.yourCiv.tags.includes('cavalryCiv')) s += 2;
      if (ctx.yourCiv.strongUnits.includes('knights') || ctx.yourCiv.strongUnits.includes('camels')) s += 2;
      if (ctx.yourCiv.tags.includes('fastFeudal')) s += 2;
      if (ctx.mapArchetype.tags.chokePoints) s -= 2;
      if (ctx.proximity === 'water-separated') s -= 5;
      if (ctx.enemyCount >= 2) s -= 1;
      return s;
    },
  },
  {
    id: 'fast-castle-boom',
    name: 'Fast Castle Boom',
    summary: 'Minimal Feudal Age military, rush to Castle Age with extra Town Centers and villagers, then out-scale with a bigger economy.',
    score(ctx) {
      let s = 0;
      if (ctx.mapArchetype.tags.favorsBoom) s += 3;
      if (ctx.proximity === 'far' || ctx.proximity === 'water-separated') s += 2;
      if (ctx.yourCiv.tags.includes('boomer')) s += 3;
      if (ctx.proximity === 'close' && !ctx.mapArchetype.tags.chokePoints) s -= 3;
      if (ctx.allyCount >= 1) s += 1; // allies can help cover early defense
      return s;
    },
  },
  {
    id: 'turtle-siege',
    name: 'Turtle into Siege/Trebuchets',
    summary: 'Wall up early, invest in defensive buildings, and let the economy run while teching toward siege to break the stalemate on your terms.',
    score(ctx) {
      let s = 0;
      if (ctx.mapArchetype.tags.chokePoints) s += 3;
      if (ctx.yourCiv.tags.includes('turtle')) s += 3;
      if (ctx.yourCiv.tags.includes('siegeCiv')) s += 2;
      if (ctx.proximity === 'close' && ctx.mapArchetype.tags.chokePoints) s += 1;
      if (ctx.enemyCount >= 2) s += 1; // safer, defensive play scales better against multiple opponents
      return s;
    },
  },
  {
    id: 'trash-war-imperial',
    name: 'Scale to Imperial Trash Wars',
    summary: 'Play a patient mid-game, tech straight through to Imperial Age, and win the late-game war of Skirmishers, Hussars, and Halberdiers.',
    score(ctx) {
      let s = 0;
      if (ctx.mapArchetype.tags.favorsBoom) s += 2;
      if (ctx.yourCiv.tags.includes('trashWarCiv')) s += 3;
      if (ctx.yourCiv.tags.includes('lateGameSpike')) s += 2;
      if (ctx.proximity === 'close' && !ctx.mapArchetype.tags.chokePoints) s -= 2;
      return s;
    },
  },
  {
    id: 'fast-imperial-navy',
    name: 'Fast Naval Control',
    summary: 'Prioritize Docks and fishing early, contest the water first with Galleys/Fire Ships, then use naval dominance to control map tempo.',
    score(ctx) {
      let s = 0;
      if (ctx.mapArchetype.tags.waterHeavy) s += 4;
      if (ctx.yourCiv.tags.includes('navalCiv')) s += 3;
      if (!ctx.mapArchetype.waterRing) s -= 6;
      return s;
    },
  },
];

function pickBuildOrder(ctx) {
  return [...BUILD_ORDERS].sort((a, b) => b.score(ctx) - a.score(ctx))[0];
}

function civStrongClasses(civ) {
  const classes = new Set(civ.strongUnits);
  civ.uniqueUnits.forEach((u) => classes.add(u.class));
  return Array.from(classes);
}

// class -> number of civs in the list that are strong in it (a class two enemies share is a bigger threat).
function classWeightsAcross(civList) {
  const weights = {};
  civList.forEach((civ) => {
    civStrongClasses(civ).forEach((c) => { weights[c] = (weights[c] || 0) + 1; });
  });
  return weights;
}

function buildUnitCompAdvice(ctx) {
  const enemyCivs = ctx.enemies.map((e) => e.civ);
  const allyCivs = ctx.allies.map((a) => a.civ);
  const enemyWeights = classWeightsAcross(enemyCivs);
  const allyWeights = classWeightsAcross(allyCivs);
  const rawScores = counterScores(enemyWeights);

  // Composite score per candidate counter-class: how big a threat it answers,
  // boosted if it's your civ's own strength, nudged down if an ally already covers it
  // (so the team naturally diversifies instead of everyone teching the same thing).
  const candidates = Object.keys(rawScores)
    .filter((c) => !ctx.yourCiv.weakUnits.includes(c) && civCanUse(ctx.yourCiv, c));

  const ranked = candidates
    .map((c) => ({
      cls: c,
      score: rawScores[c] + (ctx.yourCiv.strongUnits.includes(c) ? 2 : 0) - (allyWeights[c] ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((r) => r.cls);

  const top = ranked.slice(0, 3);

  const uniqueCallouts = [];
  ctx.enemies.forEach(({ civ }) => {
    civ.uniqueUnits.forEach((uu) => {
      const counters = countersOf(uu.class).filter((c) => !ctx.yourCiv.weakUnits.includes(c) && civCanUse(ctx.yourCiv, c));
      if (counters.length === 0) return;
      const label = UNIT_CLASSES[counters[0]].label;
      uniqueCallouts.push(`${civ.name}'s ${uu.name} (${UNIT_CLASSES[uu.class].label}) is best answered with ${label}.`);
    });
  });

  const allyStrengths = Array.from(new Set(allyCivs.flatMap((c) => civStrongClasses(c))));

  return {
    topClasses: top,
    uniqueCallouts: uniqueCallouts.slice(0, 5),
    enemyClasses: Object.keys(enemyWeights),
    allyStrengths,
  };
}

function buildMapNotes(ctx) {
  const notes = [ctx.mapArchetype.description];
  if (ctx.proximity === 'close') notes.push('Your closest opponent starts near you — expect early contact. Scout aggressively and be ready to wall or fight in Feudal Age.');
  if (ctx.proximity === 'far') notes.push('Your closest opponent starts far away — early aggression is slow to land, so a safe boom is usually low-risk here.');
  if (ctx.proximity === 'medium') notes.push('A moderate distance to your nearest opponent — early raids are possible but take real travel time, so balance economy with some map awareness.');
  if (ctx.proximity === 'water-separated') notes.push('Water separates you from your nearest opponent — Fishing Ships and early Docks matter, and naval control will likely gate when land armies can even meet.');
  if (ctx.mapArchetype.tags.chokePoints) notes.push('Natural chokepoints make walling efficient — a small number of well-placed walls can neutralize most early aggression.');
  if (ctx.enemyCount >= 2) notes.push(`You're facing ${ctx.enemyCount} opponents — prioritize whichever is closest/most aggressive first rather than spreading your army thin.`);
  if (ctx.allyCount >= 1) notes.push(`You have ${ctx.allyCount} ${ctx.allyCount === 1 ? 'ally' : 'allies'} — coordinate walls and timing pushes with them instead of playing purely 1v1.`);
  return notes;
}

// Pick the enemy with the smallest ring-distance to you, and use that pairing to
// classify overall proximity (closest opponent is what should drive early-game decisions).
function closestEnemy(youSlot, enemies, slotCount, mapArchetype) {
  let best = null;
  let bestDist = Infinity;
  enemies.forEach((e) => {
    const dist = ringDistance(youSlot, e.slot, slotCount);
    if (dist < bestDist) { bestDist = dist; best = e; }
  });
  return { enemy: best, proximity: proximityLabel(youSlot, best.slot, slotCount, mapArchetype) };
}

function getAdvice({ you, allies, enemies, mapArchetype, slotCount }) {
  const { enemy: nearestEnemy, proximity } = closestEnemy(you.slot, enemies, slotCount, mapArchetype);
  const ctx = {
    yourCiv: you.civ,
    allies,
    enemies,
    mapArchetype,
    proximity,
    enemyCount: enemies.length,
    allyCount: allies.length,
  };
  const buildOrder = pickBuildOrder(ctx);
  const unitComp = buildUnitCompAdvice(ctx);
  const mapNotes = buildMapNotes(ctx);
  return { buildOrder, unitComp, mapNotes, nearestEnemy, proximity };
}
