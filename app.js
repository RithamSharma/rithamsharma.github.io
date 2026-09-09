const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const menu = document.querySelector('.menu');
const nav = document.querySelector('#site-nav');
const progress = document.querySelector('.progress');
const wipe = document.querySelector('.page-wipe');
document.querySelector('.console-readout')?.setAttribute('aria-live', 'polite');
if (!document.querySelector('link[rel="canonical"]')) {
  const canonical = document.createElement('link');
  canonical.rel = 'canonical';
  canonical.href = `https://rithamsharma.github.io${location.pathname === '/index.html' ? '/' : location.pathname}`;
  document.head.append(canonical);
}
if (!document.querySelector('link[rel="icon"]')) {
  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.type = 'image/svg+xml';
  icon.href = 'assets/favicon.svg';
  document.head.append(icon);
}

// Keep the compact case-study documents aligned with the shared site shell.
const main = document.querySelector('main');
if (main && !main.id) main.id = 'main';
if (!document.querySelector('.skip')) {
  const skip = document.createElement('a');
  skip.className = 'skip';
  skip.href = '#main';
  skip.textContent = 'Skip to content';
  document.body.prepend(skip);
}
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  menu.textContent = open ? 'Menu' : 'Close';
  nav.classList.toggle('open', !open);
});

const splitHeadings = () => {
  document.querySelectorAll('[data-split]').forEach((heading) => {
    let index = 0;
    [...heading.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part.trim()) {
          fragment.append(part);
          return;
        }
        const span = document.createElement('span');
        span.className = 'split-word';
        span.style.setProperty('--i', index++);
        span.textContent = part;
        fragment.append(span);
      });
      node.replaceWith(fragment);
    });
  });
};
splitHeadings();
requestAnimationFrame(() => root.classList.add('ready'));

let scrollTick = 0;
const paintProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  scrollTick = 0;
};
addEventListener('scroll', () => {
  if (!scrollTick) scrollTick = requestAnimationFrame(paintProgress);
}, { passive: true });
paintProgress();

const revealTargets = document.querySelectorAll('.manifesto > *,.console-head > *,.console-shell,.ledger-project .project-number,.ledger-project .project-copy,.artifact-window,.practice-head > *,.practice-steps li,.home-profile > *,.about-facts > div,.work-row,.timeline article,.capabilities article,.case-body h2,.case-body .metrics,.case-body ul');
if (reduceMotion) {
  revealTargets.forEach((item) => item.classList.add('visible'));
} else {
  revealTargets.forEach((item) => item.classList.add('reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach((item) => observer.observe(item));
}

document.querySelectorAll('a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || link.target === '_blank') return;
  link.addEventListener('click', (event) => {
    if (reduceMotion || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    wipe.classList.add('leave');
    setTimeout(() => { location.href = href; }, 430);
  });
});

const lightbox = document.querySelector('.lightbox');
const openLightbox = (figure) => {
  if (!lightbox) return;
  const source = figure.querySelector('img');
  const target = lightbox.querySelector('img');
  target.src = source.src;
  target.alt = source.alt;
  lightbox.hidden = false;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('button').focus();
};
const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.hidden = true;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
};
document.querySelectorAll('.zoomable').forEach((figure) => {
  figure.tabIndex = 0;
  figure.setAttribute('role', 'button');
  figure.setAttribute('aria-label', `${figure.querySelector('figcaption')?.textContent || 'Project artifact'}. Open full size`);
  figure.addEventListener('click', () => openLightbox(figure));
  figure.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(figure); }
  });
});
lightbox?.querySelector('button')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
addEventListener('keydown', (event) => { if (event.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox(); });

if (!reduceMotion) {
  document.querySelectorAll('.artifact-window,.work-row').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - .5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - .5) * 8;
      card.querySelector('img').style.transform = `scale(1.025) translate3d(${x}px,${y}px,0)`;
    });
    card.addEventListener('pointerleave', () => { card.querySelector('img').style.transform = ''; });
  });
}

const counters = document.querySelectorAll('[data-count]');
if (counters.length && !reduceMotion) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count);
      const decimals = Number(node.dataset.decimals || 0);
      const suffix = node.dataset.suffix || '';
      const pad = Number(node.dataset.pad || 0);
      const started = performance.now();
      const tick = (now) => {
        const progressValue = Math.min(1, (now - started) / 900);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        let value = (target * eased).toFixed(decimals);
        if (pad) value = value.padStart(pad, '0');
        node.textContent = value + suffix;
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(node);
    });
  }, { threshold: .5 });
  counters.forEach((counter) => counterObserver.observe(counter));
}

const systemData = {
  mayo: {
    clock: 'SCHEDULER / DETERMINISTIC', goal: 'Post-quantum signing', result: '9,232 cycles', link: 'mayo.html',
    flow: ['Message', 'SHAKE-256', 'GF(16)', 'Signature'], color: '#d9ff3f', mode: 'square'
  },
  visucore: {
    clock: 'CLK 100 MHz', goal: 'Visible RV32I execution', result: '+0.135 ns WNS', link: 'visucore.html',
    flow: ['Fetch', 'Decode', 'Execute', 'Retire'], color: '#ff6a31', mode: 'pulse'
  },
  rvtrace: {
    clock: 'UART 115,200 BAUD', goal: 'Portable control-flow trace', result: '160 B footprint', link: 'rvtrace.html',
    flow: ['Event', 'Encode', 'FIFO', 'Host decode'], color: '#55dcb8', mode: 'packet'
  },
  gem: {
    clock: 'CUDA / LEVELIZED WAVES', goal: 'Structured logic simulation', result: '4.62× speedup', link: 'gem.html',
    flow: ['Netlist', 'Native graph', 'GPU waves', 'Oracle check'], color: '#a996ff', mode: 'wave'
  }
};

const signalCanvas = document.querySelector('#signal-canvas');
const consoleButtons = document.querySelectorAll('[data-system]');
const consoleClock = document.querySelector('#console-clock');
const consoleGoal = document.querySelector('#console-goal');
const consoleResult = document.querySelector('#console-result');
const consoleLink = document.querySelector('#console-link');
const signalFlow = document.querySelector('#signal-flow');
const consoleReadout = document.querySelector('.console-readout');
let activeSystem = 'mayo';
let signalFrame = 0;
let signalVisible = true;
let lastFlowPulse = -1;

const resizeSignalCanvas = () => {
  if (!signalCanvas) return;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const rect = signalCanvas.getBoundingClientRect();
  signalCanvas.width = Math.max(1, Math.round(rect.width * ratio));
  signalCanvas.height = Math.max(1, Math.round(rect.height * ratio));
  signalCanvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
};

const drawSignals = (time = 0) => {
  if (!signalCanvas || !signalVisible) return;
  const context = signalCanvas.getContext('2d');
  const width = signalCanvas.clientWidth;
  const height = signalCanvas.clientHeight;
  const data = systemData[activeSystem];
  context.clearRect(0, 0, width, height);
  context.lineWidth = 2;
  context.strokeStyle = data.color;
  context.shadowColor = data.color;
  context.shadowBlur = 8;
  const phase = reduceMotion ? 0 : (time * .075) % 80;
  [0.25, 0.5, 0.75].forEach((track, trackIndex) => {
    const center = height * track;
    context.beginPath();
    for (let x = -80; x <= width + 80; x += 4) {
      const unit = x + phase + trackIndex * 23;
      let y;
      if (data.mode === 'wave') y = center + Math.sin(unit * .035) * (13 + trackIndex * 3);
      else if (data.mode === 'pulse') y = center + ((Math.floor(unit / 38) % 3 === 0) ? -17 : 12);
      else if (data.mode === 'packet') y = center + ((Math.floor(unit / 26) % 5 < 2) ? -14 : 10);
      else y = center + ((Math.floor(unit / 45) % 2) ? -15 : 15);
      if (x === -80) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.stroke();
  });
  context.shadowBlur = 0;
  context.fillStyle = '#80959e';
  context.font = '10px monospace';
  context.fillText('CH 1 / CONTROL', 14, 18);
  context.fillText('CH 2 / DATA', 14, height - 12);
  if (!reduceMotion) {
    const pulseIndex = Math.floor(time / 650) % 4;
    if (pulseIndex !== lastFlowPulse) {
      signalFlow?.querySelectorAll('span').forEach((node, index) => node.classList.toggle('pulse', index === pulseIndex));
      lastFlowPulse = pulseIndex;
    }
    signalFrame = requestAnimationFrame(drawSignals);
  }
};

const selectSystem = (key) => {
  activeSystem = key;
  const data = systemData[key];
  consoleButtons.forEach((button) => {
    const selected = button.dataset.system === key;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  if (consoleClock) consoleClock.textContent = data.clock;
  if (consoleGoal) consoleGoal.textContent = data.goal;
  if (consoleResult) consoleResult.textContent = data.result;
  if (consoleLink) consoleLink.href = data.link;
  if (signalFlow) signalFlow.innerHTML = data.flow.map((step, index) => `${index ? '<b>→</b>' : ''}<span>${step}</span>`).join('');
  consoleReadout?.classList.remove('swap');
  void consoleReadout?.offsetWidth;
  consoleReadout?.classList.add('swap');
  lastFlowPulse = -1;
  if (reduceMotion) drawSignals();
};

consoleButtons.forEach((button) => button.addEventListener('click', () => selectSystem(button.dataset.system)));
if (signalCanvas) {
  resizeSignalCanvas();
  addEventListener('resize', resizeSignalCanvas, { passive: true });
  const signalObserver = new IntersectionObserver(([entry]) => {
    signalVisible = entry.isIntersecting;
    cancelAnimationFrame(signalFrame);
    if (signalVisible) signalFrame = requestAnimationFrame(drawSignals);
  }, { threshold: .05 });
  signalObserver.observe(signalCanvas);
  selectSystem(activeSystem);
}

const projectSections = document.querySelectorAll('.ledger-project[id]');
const chapterLinks = document.querySelectorAll('.chapter-nav a');
if (projectSections.length) {
  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      projectSections.forEach((section) => section.classList.toggle('is-active', section === entry.target));
      chapterLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { threshold: .48 });
  projectSections.forEach((section) => chapterObserver.observe(section));
}

const caseDetails = {
  'mayo.html': {
    index: '01', stack: 'SystemVerilog / AES / SHAKE / GF(16)',
    label: 'MAYO / implementation anatomy',
    title: 'From message bytes to a verified signature.',
    summary: 'A parameterized post-quantum signature accelerator that coordinates cryptographic primitives, finite-field arithmetic and memory movement as one synthesizable RTL system.',
    artifactTitle: 'The benchmark report is part of the build.',
    artifactCopy: 'This generated report captures deterministic architecture-level cycle counts. It is the fastest way to audit what is implemented, what is parameterized and what remains beyond the current model.',
    artifactMeta: ['RTL regression', 'PDF output', 'Measured cycles'],
    path: ['Host + DMA', 'SHAKE / AES-CTR', 'Banked memory', 'GF(16) solver', 'Signature encode'],
    decisions: [
      ['Parameter sets are structural', 'Dimensions, widths and loop bounds are modeled as parameters so MAYO-1, -2, -3 and -5 share one architectural language.'],
      ['Transpose has a visible cost', 'Parallelism τ is tunable. Moving from τ=1 to τ=8 cuts the 64×72 transpose from 9,217 to 1,153 cycles at the cost of routing and storage.'],
      ['Evidence has a boundary', 'Cycle measurements are deterministic RTL results. Post-route timing, production datapath acknowledgement and side-channel hardening remain clearly identified work.']
    ],
    proof: ['FIPS-derived AES and SHAKE vectors', 'Five self-checking architecture tests', 'Deterministic KeyGen / Sign / Verify counts', 'Parameterized model coverage']
  },
  'visucore.html': {
    index: '02', stack: 'RV32I / FPGA / Python / UART',
    label: 'VisuCore / implementation anatomy',
    title: 'Execution stays visible from fetch to host.',
    summary: 'A five-stage RV32I processor, cache and trace transport designed together so execution can be understood on the FPGA and replayed away from it.',
    artifactTitle: 'A processor you can watch think.',
    artifactCopy: 'The dashboard is the actual Python replay interface running against a repository trace. Pipeline occupancy, registers, cache activity and retirement state share one inspection surface.',
    artifactMeta: ['Live replay', 'Pipeline state', 'Host tooling'],
    path: ['Instruction fetch', '5-stage pipeline', 'Write-back cache', 'Event FIFO', 'UART + dashboard'],
    decisions: [
      ['Observability is architectural', 'The trace packetizer is part of the system path, allowing pipeline, register and cache state to be inspected without inventing a separate demo layer.'],
      ['Hazards are handled explicitly', 'Forwarding, load-use interlocks, branch flushes and traps are named behaviors with focused checks rather than incidental pipeline side effects.'],
      ['Replay makes debugging repeatable', 'The same Python interface can consume a physical serial stream or a deterministic recording, preserving the debugging workflow without requiring the board.']
    ],
    proof: ['25 named hardware checks', '11 host-side Python tests', '17 firmware images', '100 MHz timing closure with +0.135 ns WNS']
  },
  'rvtrace.html': {
    index: '03', stack: 'RTL / FIFO / UART / Python',
    label: 'RV-TraceLite / implementation anatomy',
    title: 'A small hardware event becomes useful context.',
    summary: 'A compact processor-independent control-flow trace path spanning event capture, hardware buffering, serial transport and host reconstruction.',
    artifactTitle: 'Compression shown as measured data.',
    artifactCopy: 'The repository chart makes the result inspectable instead of reducing it to a marketing number. It sits alongside implementation timing and the actual hardware footprint.',
    artifactMeta: ['Measured chart', 'UART transport', 'Board evidence'],
    path: ['Retire event', 'Compact encoder', 'Trace FIFO', 'UART transport', 'Host reconstruction'],
    decisions: [
      ['The interface is processor-independent', 'The tracer observes architectural control-flow events instead of relying on the internal stages or signal names of one processor.'],
      ['Production and transport are decoupled', 'FIFO buffering absorbs short bursts so UART back-pressure does not immediately stall the trace producer.'],
      ['Compression is measured', 'The repository plot exposes real results while implementation timing and the 160-byte hardware footprint remain visible beside them.']
    ],
    proof: ['Physical-board trace capture', 'Decoded control-flow reconstruction', 'Zero implementation DRC violations', 'Measured compression artifact']
  },
  'gem.html': {
    index: '04', stack: 'Rust / CUDA / Yosys / FPGA primitives',
    label: 'GEM / implementation anatomy',
    title: 'Keep the FPGA structure the GPU can exploit.',
    summary: 'A heterogeneous simulator that preserves useful FPGA macros, schedules their dependency graph and executes levelized waves through a verified CUDA path.',
    artifactTitle: 'The execution model, documented.',
    artifactCopy: 'This report page explains primitive mapping, wave barriers and buffer placement. These decisions produced the measured speedups and documented adverse cases.',
    artifactMeta: ['Technical report', 'Wave scheduling', 'Buffer rationale'],
    path: ['Yosys netlist', 'Native primitive graph', 'Kahn levelization', 'CUDA wave execution', 'CPU oracle'],
    decisions: [
      ['Useful macros stay intact', 'DSP48E2, CARRY4 and SRLC32E become native graph vertices rather than exploding into one-bit gates.'],
      ['Scheduling is explicit', 'Kahn’s algorithm builds levelized waves so independent vertices can execute together on the GPU while dependencies remain ordered.'],
      ['Adverse cases remain in the report', 'The best case reaches 4.62×, while a deep dependency chain reaches 0.32×. Both results are part of the engineering conclusion.']
    ],
    proof: ['Aligned formatter / device ABI', 'CPU reference oracle', '77× graph-node reduction', 'Measured favorable and adverse benchmarks']
  }
};

const currentFile = location.pathname.split('/').pop() || 'index.html';
const currentCase = caseDetails[currentFile];
const caseBody = document.querySelector('.case-body');
if (currentCase && caseBody) {
  const caseHero = document.querySelector('.case-hero');
  const heroLead = caseHero?.querySelector(':scope > div');
  if (heroLead) {
    const summary = document.createElement('div');
    summary.className = 'case-summary';
    summary.innerHTML = `<span>PROJECT ${currentCase.index} / 04</span><p>${currentCase.summary}</p><small>${currentCase.stack}</small>`;
    heroLead.append(summary);
  }
  if (caseHero) caseHero.dataset.index = currentCase.index;

  const artifactStage = document.querySelector('.artifact-stage');
  if (artifactStage) {
    const artifactContext = document.createElement('div');
    artifactContext.className = 'artifact-context';
    artifactContext.innerHTML = `<span>PRIMARY ARTIFACT / ${currentCase.index}</span><h2>${currentCase.artifactTitle}</h2><p>${currentCase.artifactCopy}</p><ul>${currentCase.artifactMeta.map((item) => `<li>${item}</li>`).join('')}</ul><button type="button" class="artifact-open">Inspect full size ↗</button>`;
    artifactStage.prepend(artifactContext);
    artifactContext.querySelector('.artifact-open')?.addEventListener('click', () => {
      const figure = artifactStage.querySelector('.zoomable');
      if (figure) openLightbox(figure);
    });
  }

  const detailSection = document.createElement('section');
  detailSection.className = 'deep-dive';
  detailSection.innerHTML = `<div class="wrap">
    <div class="deep-intro"><p class="section-name">${currentCase.label}</p><h2>${currentCase.title}</h2></div>
    <ol class="architecture-chain">${currentCase.path.map((step, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><b>${step}</b></li>`).join('')}</ol>
    <div class="decision-grid">${currentCase.decisions.map(([title, copy], index) => `<article><span>DECISION ${String(index + 1).padStart(2, '0')}</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>
    <div class="proof-ledger"><div><small>Verification ledger</small><strong>What the repository can prove</strong></div><ul>${currentCase.proof.map((item) => `<li>${item}</li>`).join('')}</ul></div>
  </div>`;
  caseBody.insertAdjacentElement('afterend', detailSection);
}

if (document.body.dataset.page === 'about') {
  const contactBand = document.querySelector('.contact-band');
  const labSection = document.createElement('section');
  labSection.className = 'about-lab';
  labSection.innerHTML = `<div class="wrap"><div class="deep-intro"><p class="section-name">Engineering range</p><h2>One system, many layers.</h2><p>I’m most useful when a problem crosses boundaries: RTL needs a host tool, a benchmark needs an honest reference, or a fast kernel needs a memory layout that actually feeds it.</p></div><div class="range-grid"><article><span>01 / DEFINE</span><h3>Architecture</h3><p>Interfaces, data movement, state machines, pipeline structure and the constraints that decide whether a design is practical.</p></article><article><span>02 / BUILD</span><h3>Implementation</h3><p>SystemVerilog, C/C++, Rust, CUDA and Python used as parts of one system rather than isolated technologies.</p></article><article><span>03 / PRESSURE</span><h3>Verification</h3><p>Known-answer vectors, self-checking regressions, CPU oracles, deterministic recordings and adverse test cases.</p></article><article><span>04 / PROVE</span><h3>Measurement</h3><p>Cycle counts, timing slack, graph size, bandwidth, latency and physical-board behavior reported with their limits.</p></article></div></div>`;
  contactBand?.insertAdjacentElement('beforebegin', labSection);
}

const lateRevealTargets = document.querySelectorAll('.case-summary,.artifact-context,.deep-intro,.architecture-chain li,.decision-grid article,.proof-ledger,.range-grid article');
if (reduceMotion) {
  lateRevealTargets.forEach((item) => item.classList.add('visible'));
} else if (lateRevealTargets.length) {
  lateRevealTargets.forEach((item) => item.classList.add('reveal'));
  const lateObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      lateObserver.unobserve(entry.target);
    });
  }, { threshold: .14, rootMargin: '0px 0px -7% 0px' });
  lateRevealTargets.forEach((item) => lateObserver.observe(item));
}

const caseHeadings = document.querySelectorAll('[data-page="case"] h2');
if (caseHeadings.length) {
  const caseToc = document.createElement('nav');
  caseToc.className = 'case-toc';
  caseToc.setAttribute('aria-label', 'Case study sections');
  caseHeadings.forEach((heading, index) => {
    heading.id = heading.id || `section-${index + 1}`;
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><b>${heading.textContent}</b>`;
    caseToc.append(link);
  });
  document.body.append(caseToc);
  const tocLinks = caseToc.querySelectorAll('a');
  const tocObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      tocLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-20% 0px -65% 0px' });
  caseHeadings.forEach((heading) => tocObserver.observe(heading));
}

document.querySelectorAll('.year').forEach((item) => { item.textContent = new Date().getFullYear(); });
