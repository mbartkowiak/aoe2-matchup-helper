/*
 * Unit-class counter matrix.
 * Simplified, heuristic version of AoE2's rock-paper-scissors combat triangle —
 * good enough to drive advice, not a full damage-table simulation.
 *
 * BEATS[x] = classes that X is generally strong against.
 * "Counters" (what beats X) is derived from this table, not hand-duplicated,
 * so the two directions can never drift out of sync.
 */

const UNIT_CLASSES = {
  archers:        { label: 'Archers',              examples: ['Archer', 'Crossbowman', 'Arbalester'] },
  skirmishers:    { label: 'Skirmishers',           examples: ['Skirmisher', 'Elite Skirmisher'] },
  eagles:         { label: 'Eagle Warriors',        examples: ['Eagle Scout', 'Eagle Warrior', 'Elite Eagle Warrior'] },
  infantry:       { label: 'Infantry',              examples: ['Man-at-Arms', 'Long Swordsman', 'Two-Handed Swordsman', 'Champion'] },
  spearmen:       { label: 'Spearmen / Pikemen',    examples: ['Spearman', 'Pikeman', 'Halberdier'] },
  scouts:         { label: 'Scouts / Light Cavalry',examples: ['Scout Cavalry', 'Light Cavalry', 'Hussar'] },
  knights:        { label: 'Knights',               examples: ['Knight', 'Cavalier', 'Paladin'] },
  camels:         { label: 'Camels',                examples: ['Camel Rider', 'Heavy Camel Rider', 'Imperial Camel Rider'] },
  cavalryArchers: { label: 'Cavalry Archers',       examples: ['Cavalry Archer', 'Heavy Cavalry Archer'] },
  siege:          { label: 'Siege',                 examples: ['Mangonel', 'Onager', 'Siege Ram', 'Scorpion', 'Bombard Cannon', 'Trebuchet'] },
  monks:          { label: 'Monks',                 examples: ['Monk', 'Missionary'] },
  gunpowder:      { label: 'Gunpowder Infantry',    examples: ['Hand Cannoneer', 'Arquebusier'] },
  navy:           { label: 'Navy',                  examples: ['Galley', 'Fire Ship', 'Demolition Ship', 'Cannon Galleon'] },
};

const BEATS = {
  archers:        ['infantry', 'siege'],
  skirmishers:    ['archers', 'cavalryArchers'],
  eagles:         ['archers', 'monks', 'siege'],
  infantry:       ['siege', 'eagles'],
  spearmen:       ['knights', 'scouts', 'camels'],
  scouts:         ['archers', 'monks', 'siege', 'skirmishers'],
  knights:        ['archers', 'siege', 'infantry', 'monks'],
  camels:         ['knights', 'scouts'],
  cavalryArchers: ['infantry', 'siege', 'spearmen'],
  siege:          ['infantry', 'spearmen', 'archers'],
  monks:          ['knights', 'camels', 'siege'],
  gunpowder:      ['infantry', 'spearmen'],
  navy:           ['navy'],
};

// countersOf('knights') -> ['spearmen', 'camels', ...] i.e. classes that beat knights.
function countersOf(unitClass) {
  return Object.keys(BEATS).filter((k) => BEATS[k].includes(unitClass));
}

// These classes are only on some civs' tech trees (e.g. only Aztecs/Mayans/Incas get
// Eagle Warriors). Everything else (archers, infantry, spearmen, scouts, knights,
// siege, monks, navy...) is assumed to be available, in some form, to every civ.
const RESTRICTED_CLASSES = ['eagles', 'camels', 'cavalryArchers', 'gunpowder'];

// Whether recommending `unitClass` to `civ` actually makes sense given their tech tree.
function civCanUse(civ, unitClass) {
  if (!RESTRICTED_CLASSES.includes(unitClass)) return true;
  return civ.strongUnits.includes(unitClass) || civ.uniqueUnits.some((u) => u.class === unitClass);
}

// Given a list of enemy strong classes, return counter classes ranked by how many
// enemy strengths they answer (a class that counters 2 of their strengths ranks above one that counters 1).
function bestCountersFor(enemyClasses) {
  const score = {};
  enemyClasses.forEach((ec) => {
    countersOf(ec).forEach((counterClass) => {
      score[counterClass] = (score[counterClass] || 0) + 1;
    });
  });
  return Object.keys(score).sort((a, b) => score[b] - score[a]);
}
