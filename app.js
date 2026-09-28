(() => {
  const state = {
    figure: 'atelier', skin: '#b77a57', artwork: '', artworkName: '', rotation: 0, text: '', textFont: 'serif', textColor: '#f4f0e7', textSize: 18, textPosition: {x:210,y:355},
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
    updatePersonalization();
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
      state.artwork = ''; state.artworkName = '';
      document.querySelector('#art-status').textContent = 'Using a Katran stencil.';
      document.querySelector('#art-upload').value = ''; 
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
    if (document.querySelector('#active-layer').value === 'text') {
      state.textPosition = {x:Math.max(110,Math.min(310,point.x)), y:Math.max(105,Math.min(440,point.y))};
      updatePreview(); saveStatus.textContent = 'Text position updated. Save to keep changes.'; return;
    }
    const size = 148 * (state.scale / 100);
    state.position.x = Math.max(110, Math.min(Math.max(110, 310 - size), point.x - size / 2));
    state.position.y = Math.max(98, Math.min(450 - size, point.y - size / 2));
    saveStatus.textContent = 'Stencil position updated.';
    updatePreview();
  }

  canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); moveStencil(event); });
  canvas.addEventListener('pointermove', event => { if (canvas.hasPointerCapture(event.pointerId)) moveStencil(event); });
  canvas.addEventListener('pointerup', event => { if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); });
  canvas.addEventListener('click', event => { if (event.detail !== 0) moveStencil(event); });
  canvas.addEventListener('keydown', (event) => {
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
      event.preventDefault();
      const target = document.querySelector('#active-layer').value === 'text' ? state.textPosition : state.position;
      const step = event.shiftKey ? 10 : 2;
      target.x = Math.max(110, Math.min(310, target.x + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0)));
      target.y = Math.max(98, Math.min(440, target.y + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0)));
      updatePreview(); saveStatus.textContent = 'Position updated. Save to keep changes.'; return;
    }
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

  // Rebuild a deliberately small SVG subset. Never insert uploaded markup into the page.
  function sanitizeArtwork(source) {
    if (new Blob([source]).size > 250000) throw new Error('Please choose an SVG smaller than 250 KB.');
    if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('SVG document entities are not supported.');
    const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
    if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') throw new Error('This file is not a valid SVG.');
    const allowed = new Set(['svg','g','path','rect','circle','ellipse','line','polyline','polygon','title','desc']);
    const attrs = new Set(['viewBox','width','height','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry','d','points','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','fill-rule','clip-rule','opacity','fill-opacity','stroke-opacity','transform','preserveAspectRatio']);
    if (doc.querySelectorAll('*').length > 1500) throw new Error('This artwork is too complex. Simplify it before uploading.');
    const output = document.implementation.createDocument('http://www.w3.org/2000/svg','svg');
    function copy(node, destination, depth=0) {
      if (depth > 40 || !allowed.has(node.localName) || node.namespaceURI !== 'http://www.w3.org/2000/svg') throw new Error('Use plain vector shapes. Outline text and flatten images, gradients and effects.');
      for (const attr of node.attributes) {
        if (attr.name === 'xmlns') continue;
        if (attr.name === 'id' || attr.name === 'class' || attr.name.startsWith('data-')) continue;
        if (!attrs.has(attr.name) || /url\s*\(|javascript:|data:|https?:|[<>]/i.test(attr.value)) throw new Error('Unsupported SVG styling or linked content. Export a plain SVG with inline fill and stroke attributes.');
        destination.setAttribute(attr.name,attr.value);
      }
      for (const child of node.children) { const next=output.createElementNS('http://www.w3.org/2000/svg',child.localName); copy(child,next,depth+1); destination.append(next); }
    }
    copy(doc.documentElement, output.documentElement);
    let box = (output.documentElement.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    if (box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0) {
      const width=Number(doc.documentElement.getAttribute('width')), height=Number(doc.documentElement.getAttribute('height'));
      if (!(width > 0 && height > 0 && Number.isFinite(width) && Number.isFinite(height))) throw new Error('SVG needs a valid viewBox or numeric width and height.');
      box=[0,0,width,height];
    }
    output.documentElement.setAttribute('viewBox',box.join(' '));
    output.documentElement.setAttribute('width','500'); output.documentElement.setAttribute('height','500');
    return new XMLSerializer().serializeToString(output);
  }

  let lastArtwork = null;
  function updatePersonalization() {
    const figure=document.querySelector('#fashion-figure');
    figure.setAttribute('display', state.figure === 'flat' ? 'none' : 'inline'); figure.setAttribute('fill',state.skin);
    document.querySelector('#figure-arms').setAttribute('d',state.figure === 'runway' ? 'M170 90Q149 90 140 127L117 217L124 250L134 248L133 217L161 146L178 109ZM248 91Q272 91 288 127L311 169L269 198L260 191L291 164L260 126L242 110Z' : 'M170 90Q149 90 140 127L117 217L124 250L134 248L133 217L161 146L178 109ZM248 91Q269 91 279 127L303 217L296 250L286 248L288 217L259 144L242 110Z');
    document.querySelector('#figure-legs').setAttribute('d',state.figure === 'runway' ? 'M170 442L204 506L205 528L223 528L218 502L202 442ZM218 442L201 500L184 519L194 527L218 510L248 442Z' : 'M170 442L171 508L163 526Q176 532 186 523L204 444ZM216 444L234 523Q245 532 258 526L249 508L249 442Z');
    const art=document.querySelector('#custom-art');
    if(lastArtwork !== state.artwork) { if(state.artwork) art.setAttribute('href','data:image/svg+xml;charset=utf-8,'+encodeURIComponent(state.artwork)); else art.removeAttribute('href'); lastArtwork=state.artwork; }
    art.setAttribute('display',state.artwork ? 'inline' : 'none'); stencilFill.setAttribute('display',state.artwork ? 'none' : 'inline');
    const size=148*state.scale/100;
    for(const element of [art,stencilFill]) {element.setAttribute('x',state.position.x);element.setAttribute('y',state.position.y);element.setAttribute('width',size);element.setAttribute('height',size);element.setAttribute('transform',`rotate(${state.rotation} ${state.position.x+size/2} ${state.position.y+size/2})`);}
    const text=document.querySelector('#dress-text');text.textContent=state.text;text.setAttribute('font-family',state.textFont);text.setAttribute('fill',state.textColor);text.setAttribute('font-size',state.textSize);text.setAttribute('x',state.textPosition.x);text.setAttribute('y',state.textPosition.y);
    document.querySelector('#remove-art').disabled=!state.artwork;
  }
  const bindings = [['figure','figure'],['skin-tone','skin'],['art-rotation','rotation'],['personal-text','text'],['text-font','textFont'],['text-color','textColor'],['text-size','textSize']];
  for(const [id,key] of bindings) document.getElementById(id).addEventListener('input',event=>{state[key]=['rotation','textSize'].includes(key)?Number(event.target.value):event.target.value;saveStatus.textContent='Unsaved changes';updatePreview();});
  let uploadSequence=0;
  document.querySelector('#art-upload').addEventListener('change',async event=>{
    const sequence=++uploadSequence; const file=event.target.files[0]; if(!file)return;
    try {
      if(file.size>250000)throw new Error('Please choose an SVG smaller than 250 KB.');
      const clean=sanitizeArtwork(await file.text()); if(sequence!==uploadSequence)return;
      state.artwork=clean;state.artworkName=file.name;
      setPressed(document.querySelectorAll('[data-pattern]'),null);
      document.querySelector('#art-status').textContent='Loaded: '+file.name+' · original artwork colours retained'; saveStatus.textContent='Artwork added. Save to keep it on this device.';updatePreview();
    }catch(error){if(sequence===uploadSequence)document.querySelector('#art-status').textContent=error.message;}
  });
  document.querySelector('#remove-art').addEventListener('click',()=>{uploadSequence++;state.artwork='';state.artworkName='';document.querySelector('#art-upload').value='';document.querySelector('#art-status').textContent='Artwork removed. Using your selected stencil.';setPressed(document.querySelectorAll('[data-pattern]'),document.querySelector(`[data-pattern="${state.pattern}"]`));saveStatus.textContent='Unsaved changes';updatePreview();});
  function restorePersonalization(saved) {
    if(['atelier','runway','flat'].includes(saved.figure))state.figure=saved.figure;
    for(const key of ['skin','textColor'])if(/^#[0-9a-f]{6}$/i.test(saved[key]))state[key]=saved[key];
    if(typeof saved.text==='string')state.text=saved.text.slice(0,32);
    if(['serif','sans-serif','cursive'].includes(saved.textFont))state.textFont=saved.textFont;
    if(Number.isFinite(saved.textSize))state.textSize=Math.max(10,Math.min(30,saved.textSize));
    if(Number.isFinite(saved.rotation))state.rotation=Math.max(-180,Math.min(180,saved.rotation));
    if(Number.isFinite(saved.textPosition?.x)&&Number.isFinite(saved.textPosition?.y))state.textPosition={x:Math.max(110,Math.min(310,saved.textPosition.x)),y:Math.max(98,Math.min(440,saved.textPosition.y))};
    if(typeof saved.artwork==='string'&&saved.artwork){try{state.artwork=sanitizeArtwork(saved.artwork);state.artworkName=typeof saved.artworkName==='string'?saved.artworkName:'Saved artwork';document.querySelector('#art-status').textContent='Restored: '+state.artworkName;setPressed(document.querySelectorAll('[data-pattern]'),null);}catch{document.querySelector('#art-status').textContent='Saved artwork could not be restored. Please upload a plain SVG.';}}
    for(const [id,key]of bindings)document.getElementById(id).value=state[key];
  }

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
      restorePersonalization(saved);
      saveStatus.textContent = 'Your saved design has been restored from this device.';
    }
  } catch { /* A missing or invalid local draft must not prevent using the studio. */ }


  updatePreview();
})();
