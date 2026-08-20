/* UI wiring: map rendering, roster management, click handling, advice rendering. */

const TEAM_COLORS = { you: '#3d8ff2', ally: '#3ecf7a', enemy: '#f2543d' };
const TEAM_LETTERS = { you: 'Y', ally: 'A', enemy: 'E' };

const state = {
  mapId: MAP_ARCHETYPES[0].id,
  slotCount: 4,
  placing: 'you', // 'you' | 'ally' | 'enemy'
  players: [], // { slot, team: 'you'|'ally'|'enemy', civId: string|null }
};

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(c));
  return node;
}

function playersOfTeam(team) {
  return state.players.filter((p) => p.team === team).sort((a, b) => a.slot - b.slot);
}

function civOptionsHtml(selectedId) {
  const sorted = [...CIVS].sort((a, b) => a.name.localeCompare(b.name));
  let html = `<option value="">-- choose a civilization --</option>`;
  sorted.forEach((c) => {
    html += `<option value="${c.id}"${c.id === selectedId ? ' selected' : ''}>${c.name}</option>`;
  });
  return html;
}

function populateMapSelect() {
  const sel = document.getElementById('map-select');
  sel.innerHTML = '';
  MAP_ARCHETYPES.forEach((m) => sel.appendChild(el('option', { value: m.id, text: m.name })));
  sel.value = state.mapId;
}

function populateSlotCountSelect() {
  const sel = document.getElementById('slot-count-select');
  const archetype = getMapArchetype(state.mapId);
  sel.innerHTML = '';
  archetype.slotCounts.forEach((n) => sel.appendChild(el('option', { value: n, text: `${n} players` })));
  if (!archetype.slotCounts.includes(state.slotCount)) state.slotCount = archetype.slotCounts[0];
  sel.value = state.slotCount;
}

function renderMap() {
  const archetype = getMapArchetype(state.mapId);
  const n = state.slotCount;
  const positions = ringPositions(n);

  const bgColors = {
    'open-land': '#2f4a2f',
    'closed-land': '#4a3f2f',
    'forest-maze': '#1e3320',
    'water-heavy': '#1c3a52',
    'hybrid': '#274a52',
  };

  let svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect x="0" y="0" width="100" height="100" fill="${bgColors[archetype.id] || '#2f4a2f'}" />`;

  if (archetype.waterRing) {
    svg += `<circle cx="50" cy="50" r="30" fill="#123047" stroke="#1c4a6b" stroke-width="1" />`;
  }
  if (archetype.tags.chokePoints && !archetype.waterRing) {
    svg += `<circle cx="50" cy="50" r="28" fill="none" stroke="#7a6a4f" stroke-width="2" stroke-dasharray="3,2" />`;
  }
  if (archetype.id === 'forest-maze') {
    for (let i = 0; i < 40; i++) {
      const rx = 10 + Math.random() * 80;
      const ry = 10 + Math.random() * 80;
      if (Math.hypot(rx - 50, ry - 50) < 12) continue;
      svg += `<circle cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="1.4" fill="#14261a" />`;
    }
  }
  if (archetype.id === 'open-land') {
    for (let i = 0; i < 10; i++) {
      const rx = 10 + Math.random() * 80;
      const ry = 10 + Math.random() * 80;
      svg += `<circle cx="${rx.toFixed(1)}" cy="${ry.toFixed(1)}" r="2.2" fill="#3d5c3d" opacity="0.6" />`;
    }
  }

  // Stable per-team ordinal labels (A1, A2, E1, E2...) based on slot order.
  const ordinal = {};
  ['you', 'ally', 'enemy'].forEach((team) => {
    playersOfTeam(team).forEach((p, i) => { ordinal[p.slot] = i + 1; });
  });

  positions.forEach((p) => {
    if (archetype.waterRing) {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="9" fill="#5c4a30" />`;
    }
    const player = state.players.find((pl) => pl.slot === p.slot);
    let fill = '#3a4550';
    let label = String(p.slot + 1);
    if (player) {
      fill = TEAM_COLORS[player.team];
      label = player.team === 'you' ? 'Y' : `${TEAM_LETTERS[player.team]}${ordinal[p.slot]}`;
    }
    svg += `<g class="map-slot" data-slot="${p.slot}">
      <circle class="slot-base" cx="${p.x}" cy="${p.y}" r="6" fill="${fill}" stroke="#0a0e12" stroke-width="0.6" />
      <text x="${p.x}" y="${p.y}">${label}</text>
    </g>`;
  });

  svg += `</svg>`;

  const wrap = document.getElementById('map-svg-wrap');
  wrap.innerHTML = svg;
  wrap.querySelectorAll('.map-slot').forEach((node) => {
    node.addEventListener('click', () => onSlotClick(Number(node.dataset.slot)));
  });

  document.getElementById('map-desc').textContent = archetype.description;
}

function onSlotClick(slot) {
  const existing = state.players.find((p) => p.slot === slot);

  if (state.placing === 'you') {
    state.players = state.players.filter((p) => p.team !== 'you' && p.slot !== slot);
    state.players.push({ slot, team: 'you', civId: null });
  } else if (existing) {
    if (existing.team === 'you') {
      // Don't let an ally/enemy click accidentally clobber the you-marker.
    } else if (existing.team === state.placing) {
      state.players = state.players.filter((p) => p.slot !== slot);
    } else {
      existing.team = state.placing;
    }
  } else {
    state.players.push({ slot, team: state.placing, civId: null });
  }

  renderMap();
  renderRoster();
  updateAdviceButtonState();
}

function removePlayer(slot) {
  state.players = state.players.filter((p) => p.slot !== slot);
  renderMap();
  renderRoster();
  updateAdviceButtonState();
}

function setPlayerCiv(slot, civId) {
  const player = state.players.find((p) => p.slot === slot);
  if (player) player.civId = civId || null;
  updateAdviceButtonState();
}

function renderRosterRow(player, showRemove) {
  const civ = getCiv(player.civId);
  const row = el('div', { class: 'roster-row' });
  const chip = el('span', { class: 'roster-chip', style: `background:${TEAM_COLORS[player.team]}` , text: `Slot ${player.slot + 1}` });
  row.appendChild(chip);

  const select = el('select', { 'data-slot': player.slot });
  select.innerHTML = civOptionsHtml(player.civId);
  select.addEventListener('change', (e) => setPlayerCiv(player.slot, e.target.value));
  row.appendChild(select);

  if (showRemove) {
    const removeBtn = el('button', { type: 'button', class: 'roster-remove', text: '×' });
    removeBtn.addEventListener('click', () => removePlayer(player.slot));
    row.appendChild(removeBtn);
  }

  if (civ) {
    const blurb = el('div', { class: 'civ-blurb' });
    const uu = civ.uniqueUnits.map((u) => `${u.name} (${UNIT_CLASSES[u.class].label})`).join(', ');
    blurb.innerHTML = `<div><b>${civ.name}</b> — ${civ.blurb}</div><div style="margin-top:6px;">Unique unit${civ.uniqueUnits.length > 1 ? 's' : ''}: ${uu}</div>`;
    row.appendChild(blurb);
  }

  return row;
}

function renderRoster() {
  const you = playersOfTeam('you')[0];
  const youWrap = document.getElementById('roster-you');
  youWrap.innerHTML = '';
  youWrap.appendChild(you
    ? renderRosterRow(you, true)
    : el('div', { class: 'empty-state', text: 'Click "Place: You" then click a map slot.' }));

  const alliesWrap = document.getElementById('roster-allies');
  alliesWrap.innerHTML = '';
  const allies = playersOfTeam('ally');
  if (allies.length === 0) {
    alliesWrap.appendChild(el('div', { class: 'empty-state', text: 'Optional — click "Place: Ally" then click map slots to add teammates.' }));
  } else {
    allies.forEach((p) => alliesWrap.appendChild(renderRosterRow(p, true)));
  }

  const enemiesWrap = document.getElementById('roster-enemies');
  enemiesWrap.innerHTML = '';
  const enemies = playersOfTeam('enemy');
  if (enemies.length === 0) {
    enemiesWrap.appendChild(el('div', { class: 'empty-state', text: 'Click "Place: Enemy" then click map slots to add opponents.' }));
  } else {
    enemies.forEach((p) => enemiesWrap.appendChild(renderRosterRow(p, true)));
  }
}

function updateAdviceButtonState() {
  const you = playersOfTeam('you')[0];
  const enemies = playersOfTeam('enemy');
  const allPlaced = state.players.every((p) => p.civId);
  const ready = you && you.civId && enemies.length > 0 && allPlaced;
  document.getElementById('get-advice').disabled = !ready;
}

function renderAdvice() {
  const you = playersOfTeam('you')[0];
  const allies = playersOfTeam('ally').map((p) => ({ slot: p.slot, civ: getCiv(p.civId) }));
  const enemies = playersOfTeam('enemy').map((p) => ({ slot: p.slot, civ: getCiv(p.civId) }));
  const archetype = getMapArchetype(state.mapId);

  const advice = getAdvice({
    you: { slot: you.slot, civ: getCiv(you.civId) },
    allies,
    enemies,
    mapArchetype: archetype,
    slotCount: state.slotCount,
  });

  const panel = document.getElementById('advice-panel');
  panel.classList.remove('hidden');

  const proximityLabels = { close: 'Close', medium: 'Medium distance', far: 'Far apart', 'water-separated': 'Separated by water' };
  const enemyNames = enemies.map((e) => e.civ.name).join(', ');
  const allyNames = allies.map((a) => a.civ.name).join(', ');

  panel.innerHTML = `
    <h2>Advice: ${getCiv(you.civId).name} vs ${enemyNames}${allyNames ? ` (with ${allyNames})` : ''}</h2>
    <p class="map-desc">${archetype.name} · Nearest opponent: ${proximityLabels[advice.proximity]}</p>

    <div class="advice-section">
      <h3>Build Order</h3>
      <p><b>${advice.buildOrder.name}</b></p>
      <p>${advice.buildOrder.summary}</p>
    </div>

    <div class="advice-section">
      <h3>Unit Composition &amp; Counters</h3>
      <p>Enemy strengths: ${advice.unitComp.enemyClasses.map((c) => `<span class="pill">${UNIT_CLASSES[c].label}</span>`).join('') || '<span class="empty-state">none listed</span>'}</p>
      <p>Recommended focus: ${advice.unitComp.topClasses.map((c) => `<span class="pill">${UNIT_CLASSES[c].label}</span>`).join('') || '<span class="empty-state">no strong hard-counter found — play to your own civ\'s core strengths</span>'}</p>
      ${advice.unitComp.uniqueCallouts.length ? `<ul>${advice.unitComp.uniqueCallouts.map((c) => `<li>${c}</li>`).join('')}</ul>` : ''}
      ${advice.unitComp.allyStrengths.length ? `<p>Your allies already lean on: ${advice.unitComp.allyStrengths.map((c) => `<span class="pill">${UNIT_CLASSES[c].label}</span>`).join('')} — the recommendation above is nudged toward covering what they don't.</p>` : ''}
    </div>

    <div class="advice-section">
      <h3>Map Notes</h3>
      <ul>${advice.mapNotes.map((n) => `<li>${n}</li>`).join('')}</ul>
    </div>
  `;
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function init() {
  populateMapSelect();
  populateSlotCountSelect();
  renderMap();
  renderRoster();

  document.getElementById('map-select').addEventListener('change', (e) => {
    state.mapId = e.target.value;
    state.players = [];
    populateSlotCountSelect();
    renderMap();
    renderRoster();
    updateAdviceButtonState();
  });

  document.getElementById('slot-count-select').addEventListener('change', (e) => {
    state.slotCount = Number(e.target.value);
    state.players = [];
    renderMap();
    renderRoster();
    updateAdviceButtonState();
  });

  document.querySelectorAll('.place-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.placing = btn.dataset.marker;
      document.querySelectorAll('.place-toggle button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('get-advice').addEventListener('click', renderAdvice);

  updateAdviceButtonState();
}

document.addEventListener('DOMContentLoaded', init);
