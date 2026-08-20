/* UI wiring: map rendering, dropdowns, click handling, advice rendering. */

const state = {
  mapId: MAP_ARCHETYPES[0].id,
  slotCount: 4,
  placing: 'you', // 'you' | 'enemy'
  yourSlot: null,
  enemySlot: null,
  yourCivId: null,
  enemyCivId: null,
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

function populateCivSelects() {
  const sorted = [...CIVS].sort((a, b) => a.name.localeCompare(b.name));
  ['your-civ-select', 'enemy-civ-select'].forEach((id) => {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    sel.appendChild(el('option', { value: '', text: '-- choose a civilization --' }));
    sorted.forEach((c) => sel.appendChild(el('option', { value: c.id, text: c.name })));
  });
}

function renderCivBlurb(civId, targetId) {
  const target = document.getElementById(targetId);
  const civ = getCiv(civId);
  if (!civ) {
    target.innerHTML = '<span class="empty-state">Pick a civilization to see its bonuses.</span>';
    return;
  }
  const uu = civ.uniqueUnits.map((u) => `${u.name} (${UNIT_CLASSES[u.class].label})`).join(', ');
  target.innerHTML = `
    <div><b>${civ.name}</b> — ${civ.blurb}</div>
    <div style="margin-top:6px;">Unique unit${civ.uniqueUnits.length > 1 ? 's' : ''}: ${uu}</div>
    <div style="margin-top:4px;">${civ.bonuses.slice(0, 3).map((b) => `<span class="pill">${b}</span>`).join('')}</div>
  `;
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

  positions.forEach((p) => {
    if (archetype.waterRing) {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="9" fill="#5c4a30" />`;
    }
    let fill = '#3a4550';
    let label = String(p.slot + 1);
    if (state.yourSlot === p.slot) { fill = '#3d8ff2'; label = 'Y'; }
    if (state.enemySlot === p.slot) { fill = '#f2543d'; label = 'E'; }
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
  if (state.placing === 'you') {
    state.yourSlot = state.yourSlot === slot ? null : slot;
    if (state.enemySlot === slot) state.enemySlot = null;
  } else {
    state.enemySlot = state.enemySlot === slot ? null : slot;
    if (state.yourSlot === slot) state.yourSlot = null;
  }
  renderMap();
  updateAdviceButtonState();
}

function updateAdviceButtonState() {
  const ready = state.yourCivId && state.enemyCivId && state.yourSlot !== null && state.enemySlot !== null;
  document.getElementById('get-advice').disabled = !ready;
}

function renderAdvice() {
  const yourCiv = getCiv(state.yourCivId);
  const enemyCiv = getCiv(state.enemyCivId);
  const archetype = getMapArchetype(state.mapId);
  const proximity = proximityLabel(state.yourSlot, state.enemySlot, state.slotCount, archetype);
  const advice = getAdvice({ yourCiv, enemyCiv, mapArchetype: archetype, proximity });

  const panel = document.getElementById('advice-panel');
  panel.classList.remove('hidden');

  const proximityLabels = { close: 'Close', medium: 'Medium distance', far: 'Far apart', 'water-separated': 'Separated by water' };

  panel.innerHTML = `
    <h2>Advice: ${yourCiv.name} vs ${enemyCiv.name}</h2>
    <p class="map-desc">${archetype.name} · ${proximityLabels[proximity]}</p>

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
  populateCivSelects();
  renderMap();
  renderCivBlurb(null, 'your-civ-blurb');
  renderCivBlurb(null, 'enemy-civ-blurb');

  document.getElementById('map-select').addEventListener('change', (e) => {
    state.mapId = e.target.value;
    state.yourSlot = null;
    state.enemySlot = null;
    populateSlotCountSelect();
    renderMap();
    updateAdviceButtonState();
  });

  document.getElementById('slot-count-select').addEventListener('change', (e) => {
    state.slotCount = Number(e.target.value);
    state.yourSlot = null;
    state.enemySlot = null;
    renderMap();
    updateAdviceButtonState();
  });

  document.querySelectorAll('.place-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.placing = btn.dataset.marker;
      document.querySelectorAll('.place-toggle button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('your-civ-select').addEventListener('change', (e) => {
    state.yourCivId = e.target.value || null;
    renderCivBlurb(state.yourCivId, 'your-civ-blurb');
    updateAdviceButtonState();
  });

  document.getElementById('enemy-civ-select').addEventListener('change', (e) => {
    state.enemyCivId = e.target.value || null;
    renderCivBlurb(state.enemyCivId, 'enemy-civ-blurb');
    updateAdviceButtonState();
  });

  document.getElementById('get-advice').addEventListener('click', renderAdvice);

  updateAdviceButtonState();
}

document.addEventListener('DOMContentLoaded', init);
