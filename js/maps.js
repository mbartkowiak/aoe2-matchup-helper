/*
 * Map archetypes.
 * These are original schematic representations of well-known AoE2 map
 * *styles* (not reproductions of the actual game art/textures — see
 * assets/maps/README.md if you want to swap in your own screenshots).
 *
 * Each archetype supports a few player-count "slot" layouts. Positions are
 * generated on a ring around the center; proximity between two slots is
 * derived from how many ring-steps apart they are.
 */

const MAP_ARCHETYPES = [
  {
    id: 'open-land',
    name: 'Open Land (Arabia-style)',
    description: 'Wide open plains, light woodlines, no natural chokepoints. Rushes and early aggression are strong.',
    slotCounts: [2, 4, 6, 8],
    waterRing: false,
    tags: { favorsRush: true, favorsBoom: false, waterHeavy: false, chokePoints: false },
  },
  {
    id: 'closed-land',
    name: 'Closed Land (Arena-style)',
    description: 'Each player starts walled in behind stone. Early aggression is very hard; the game is decided by who booms and times a push best.',
    slotCounts: [2, 4, 6, 8],
    waterRing: false,
    tags: { favorsRush: false, favorsBoom: true, waterHeavy: false, chokePoints: true },
  },
  {
    id: 'forest-maze',
    name: 'Forest Maze (Black Forest-style)',
    description: 'Dense forest separates every player. Extremely defensible, very slow to break open — booming and late-game tech usually wins.',
    slotCounts: [2, 4, 6, 8],
    waterRing: false,
    tags: { favorsRush: false, favorsBoom: true, waterHeavy: false, chokePoints: true },
  },
  {
    id: 'water-heavy',
    name: 'Water-Heavy (Islands-style)',
    description: 'Players are split across islands. Naval control usually decides the game before land armies matter much.',
    slotCounts: [2, 4, 6, 8],
    waterRing: true,
    tags: { favorsRush: false, favorsBoom: true, waterHeavy: true, chokePoints: false },
  },
  {
    id: 'hybrid',
    name: 'Hybrid (Continental-style)',
    description: 'A mix of land and water — some opponents are reachable by land, others only by sea.',
    slotCounts: [4, 6, 8],
    waterRing: true,
    tags: { favorsRush: true, favorsBoom: false, waterHeavy: true, chokePoints: false },
  },
];

function getMapArchetype(id) {
  return MAP_ARCHETYPES.find((m) => m.id === id);
}

// Compute ring positions (x,y in a 0-100 viewBox) for n slots, starting at the top and going clockwise.
function ringPositions(n, radius = 40, center = 50) {
  const positions = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    positions.push({
      slot: i,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    });
  }
  return positions;
}

// Ring-step distance between two slots out of n total, 0 = same slot, 1 = adjacent, etc.
function ringDistance(slotA, slotB, n) {
  const diff = Math.abs(slotA - slotB);
  return Math.min(diff, n - diff);
}

// Classify proximity for the advice engine.
function proximityLabel(slotA, slotB, n, mapArchetype) {
  const dist = ringDistance(slotA, slotB, n);
  const maxDist = Math.floor(n / 2);
  if (mapArchetype.waterRing && dist >= Math.ceil(maxDist / 2)) return 'water-separated';
  if (dist <= 1) return 'close';
  if (dist >= maxDist) return 'far';
  return 'medium';
}
