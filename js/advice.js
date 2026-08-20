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

function buildUnitCompAdvice(ctx) {
  const enemyClasses = civStrongClasses(ctx.enemyCiv);
  const rawCounters = bestCountersFor(enemyClasses);

  // Rank: counters your civ is actually strong with first, then any other viable counter,
  // skipping classes your civ notably lacks or can't even build (e.g. Eagles for non-Meso civs).
  const ranked = rawCounters
    .filter((c) => !ctx.yourCiv.weakUnits.includes(c) && civCanUse(ctx.yourCiv, c))
    .sort((a, b) => {
      const aStrong = ctx.yourCiv.strongUnits.includes(a) ? 1 : 0;
      const bStrong = ctx.yourCiv.strongUnits.includes(b) ? 1 : 0;
      return bStrong - aStrong;
    });

  const top = ranked.slice(0, 3);

  const uniqueCallouts = ctx.enemyCiv.uniqueUnits.map((uu) => {
    const counters = countersOf(uu.class).filter((c) => !ctx.yourCiv.weakUnits.includes(c) && civCanUse(ctx.yourCiv, c));
    if (counters.length === 0) return null;
    const label = UNIT_CLASSES[counters[0]].label;
    return `Their ${uu.name} (${UNIT_CLASSES[uu.class].label}) is best answered with ${label}.`;
  }).filter(Boolean);

  return { topClasses: top, uniqueCallouts, enemyClasses };
}

function buildMapNotes(ctx) {
  const notes = [ctx.mapArchetype.description];
  if (ctx.proximity === 'close') notes.push('You start close together — expect early contact. Scout aggressively and be ready to wall or fight in Feudal Age.');
  if (ctx.proximity === 'far') notes.push('You start far apart — early aggression is slow to land, so a safe boom is usually low-risk here.');
  if (ctx.proximity === 'medium') notes.push('A moderate distance apart — early raids are possible but take real travel time, so balance economy with some map awareness.');
  if (ctx.proximity === 'water-separated') notes.push('Water separates you — Fishing Ships and early Docks matter, and naval control will likely gate when land armies can even meet.');
  if (ctx.mapArchetype.tags.chokePoints) notes.push('Natural chokepoints make walling efficient — a small number of well-placed walls can neutralize most early aggression.');
  return notes;
}

function getAdvice({ yourCiv, enemyCiv, mapArchetype, proximity }) {
  const ctx = { yourCiv, enemyCiv, mapArchetype, proximity };
  const buildOrder = pickBuildOrder(ctx);
  const unitComp = buildUnitCompAdvice(ctx);
  const mapNotes = buildMapNotes(ctx);
  return { buildOrder, unitComp, mapNotes };
}
