(() => {
  const state = {
    silhouette: 'midi',
    silhouetteNames: { midi: 'Midi slip', wrap: 'Wrap dress', sundress: 'Sun dress' },
    basePrices: { midi: 1480, wrap: 1690, sundress: 1320 },
    fabricName: 'Fig leaf',
    fabric: '#435C45',
    pattern: 'flora',
    ink: '#D95735',
    scale: 100,
    position: { x: 136, y: 183 },
  };

  const dressFill = document.querySelector('#dress-fill');
  const stencilFill = document.querySelector('#stencil-fill');
  const svg = document.querySelector('#dress-svg');
  const canvas = document.querySelector('#dress-canvas');
  const price = document.querySelector('#price');
  const summary = document.querySelector('#summary-name');
  const fabricName = document.querySelector('#fabric-name');
  const scaleValue = document.querySelector('#scale-value');
  const saveStatus = document.querySelector('#save-status');
  const patternColors = document.querySelectorAll('.pattern-color');
  const patternStrokes = document.querySelectorAll('.pattern-stroke');
  const shapes = {
    midi: 'M181 73 C190 88 230 88 239 73 L267 99 L252 160 C263 193 288 300 310 462 L110 462 C132 300 157 193 168 160 L153 99 Z',
    wrap: 'M182 73 C190 88 230 88 238 73 L274 102 L249 170 L278 455 L108 455 L172 170 L146 102 Z',
    sundress: 'M177 75 L194 75 L195 100 L225 100 L226 75 L243 75 L258 112 L244 165 C254 216 285 348 302 462 L118 462 C135 348 166 216 176 165 L162 112 Z',
  };

  function setPressed(elements, active) {
    elements.forEach((element) => {
      const isActive = element === active;
      element.classList.toggle('active', isActive);
      element.setAttribute('aria-pressed', String(isActive));
    });
  }

  function formatRupees(value) {
    return `₹${value.toLocaleString('en-IN')}`;
  }

  function updateDressShape() {
    const path = shapes[state.silhouette];
    document.querySelector('#dress-shape-clip').setAttribute('d', path);
    dressFill.setAttribute('d', path);
    document.querySelector('#dress-outline').setAttribute('d', path);
    const detail = document.querySelector('#neck-detail');
    detail.setAttribute('d', state.silhouette === 'sundress' ? 'M194 76 L195 100 L225 100 L226 76' : 'M181 73 C190 88 230 88 239 73');
  }

  function updatePreview() {
    dressFill.setAttribute('fill', state.fabric);
    stencilFill.setAttribute('fill', `url(#${state.pattern}-pattern)`);
    stencilFill.setAttribute('x', state.position.x);
    stencilFill.setAttribute('y', state.position.y);
    const stencilSize = 148 * (state.scale / 100);
    stencilFill.setAttribute('width', stencilSize);
    stencilFill.setAttribute('height', stencilSize);
    patternColors.forEach((shape) => shape.setAttribute('fill', state.ink));
    patternStrokes.forEach((shape) => shape.setAttribute('stroke', state.ink));
    const stencilCost = 260 + Math.round((state.scale - 70) * 1.2);
    const estimate = state.basePrices[state.silhouette] + stencilCost + 200;
    price.textContent = formatRupees(estimate);
    summary.textContent = `${state.fabricName} ${state.silhouetteNames[state.silhouette].toLowerCase()}`;
    fabricName.textContent = state.fabricName;
    scaleValue.textContent = `${state.scale}%`;
    updateDressShape();
  }

  document.querySelectorAll('[data-silhouette]').forEach((button) => {
    button.addEventListener('click', () => {
      state.silhouette = button.dataset.silhouette;
      setPressed(document.querySelectorAll('[data-silhouette]'), button);
      saveStatus.textContent = '';
      updatePreview();
    });
  });

  document.querySelectorAll('[data-fabric]').forEach((button) => {
    button.addEventListener('click', () => {
      state.fabric = button.dataset.fabric;
      state.fabricName = button.dataset.fabricName;
      setPressed(document.querySelectorAll('[data-fabric]'), button);
      saveStatus.textContent = '';
      updatePreview();
    });
  });

  document.querySelectorAll('[data-pattern]').forEach((button) => {
    button.addEventListener('click', () => {
      state.pattern = button.dataset.pattern;
      setPressed(document.querySelectorAll('[data-pattern]'), button);
      saveStatus.textContent = '';
      updatePreview();
    });
  });

  document.querySelectorAll('[data-ink]').forEach((button) => {
    button.addEventListener('click', () => {
      state.ink = button.dataset.ink;
      setPressed(document.querySelectorAll('[data-ink]'), button);
      saveStatus.textContent = '';
      updatePreview();
    });
  });

  document.querySelector('#scale').addEventListener('input', (event) => {
    state.scale = Number(event.target.value);
    saveStatus.textContent = '';
    updatePreview();
  });

  function moveStencil(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const local = point.matrixTransform(matrix.inverse());
    point.x = local.x; point.y = local.y;
    const size = 148 * (state.scale / 100);
    state.position.x = Math.max(110, Math.min(Math.max(110, 310 - size), point.x - size / 2));
    state.position.y = Math.max(98, Math.min(450 - size, point.y - size / 2));
    saveStatus.textContent = 'Stencil position updated.';
    updatePreview();
  }

  canvas.addEventListener('click', event => { if (event.detail !== 0) moveStencil(event); });
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const current = { clientX: canvas.getBoundingClientRect().left + canvas.getBoundingClientRect().width / 2, clientY: canvas.getBoundingClientRect().top + canvas.getBoundingClientRect().height / 2 };
      moveStencil(current);
    }
  });

  document.querySelector('#save-design').addEventListener('click', () => {
    try {
      localStorage.setItem('katran-design-v1', JSON.stringify(state));
      saveStatus.textContent = 'Design saved on this device. Download the brief to share it with a maker.';
    } catch { saveStatus.textContent = 'Browser storage is unavailable. Download your design brief instead.'; }
  });

  document.querySelectorAll('.card-action').forEach((button, index) => {
    const key = 'katran-material-' + index;
    const render = saved => { button.textContent = saved ? 'Remove from board −' : 'Add to board +'; button.setAttribute('aria-pressed', String(saved)); };
    try { render(localStorage.getItem(key) === 'true'); } catch { render(false); }
    button.addEventListener('click', () => {
      const saved = button.getAttribute('aria-pressed') !== 'true';
      try { localStorage.setItem(key, String(saved)); render(saved); }
      catch { button.textContent = 'Storage unavailable'; }
    });
  });

  document.querySelector('#export-design').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({project:'Katran', ...state, estimatedPrice:price.textContent}, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'katran-design.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    saveStatus.textContent = 'Design brief downloaded. No order has been placed.';
  });

  try {
    const saved = JSON.parse(localStorage.getItem('katran-design-v1') || 'null');
    if (saved && Object.hasOwn(shapes, saved.silhouette)) {
      for (const [key, selector] of [['silhouette','[data-silhouette]'],['fabric','[data-fabric]'],['pattern','[data-pattern]'],['ink','[data-ink]']]) {
        const button = [...document.querySelectorAll(selector)].find(b => b.dataset[key] === saved[key]);
        if (button) button.click();
      }
      if (Number.isFinite(saved.scale)) state.scale = Math.max(70, Math.min(145, saved.scale));
      document.querySelector('#scale').value = state.scale;
      if (Number.isFinite(saved.position?.x) && Number.isFinite(saved.position?.y)) {
        state.position = {x:Math.max(110,Math.min(310,saved.position.x)), y:Math.max(98,Math.min(450,saved.position.y))};
      }
      saveStatus.textContent = 'Your saved design has been restored from this device.';
    }
  } catch { /* A missing or invalid local draft must not prevent using the studio. */ }


  updatePreview();
})();
