const p = document.getElementById('p');
const psvg = p.getElementsByTagName('svg')[0];
const sb = document.getElementById('sb');

function resize() {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const r = vw / vh;

  switch (true) {
    case r > 3   : console.log("ultra-wide"); break; // TODO : implement it
    case r > 2.1 : handleWide(); break;
    case r > 1.3 : handleHorizontal(); break;
    case r > 0.7 : handleAlmostSquare(); break;
    default      : handleVertical();
  }

  function handleWide() {
    const w = 161 - r * 30;
    sb.style.width = w + "%";
    sb.style.marginLeft = (100 - w) / 2 + "%";
    const w2 = 159.5 - r * 25;
    p.style.marginTop = r * -5 + 5 + "%";
    p.style.width = w2 + "%";
    p.style.marginLeft = (100 - w2) / 2 + "%";
  }

  function handleHorizontal() {
    sb.style.marginTop = 21 - r * 10 + "%";
    const w = 170 - r * 30;
    p.style.marginTop = r * -4 + 3.7 + "%";
    p.style.width = w + "%";
    p.style.marginLeft = (100 - w) / 2 + "%";
  }

  function handleAlmostSquare() {
    sb.style.marginTop = 86 - r * 60 + "%";
    const w = 235 - r * 80;
    p.style.marginTop = r * -3 + 2.4 + "%";
    p.style.width = w + "%";
    p.style.marginLeft = (100 - w) / 2 + "%";
  }

  function handleVertical() {
    sb.style.marginTop = 128 - r * 120 + "%";
    const w = 305 - r * 180;
    p.style.marginTop = r * -2 + 1.7 + "%";
    p.style.width = w + "%";
    p.style.marginLeft = (100 - w) / 2 + "%";
  }
}

const resizeObserver = new ResizeObserver(() => {
  resize()
});
resizeObserver.observe(document.body);

// Referenced by the movies list below, so it has to be initialised before it.
const defaultShow = async (run) => {
  await run(0, 0, 6)
  await run(5, 0, 18);
  await run(10, 0, 36);
  await run(15, 0, 54);
}

const movies = [
  { url: "https://febael.blogspot.com/2014/01/1945-children-of-paradise.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2014/04/1966-hudutlarn-kanunu.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2013/11/2011-le-havre.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2012/08/1962-seppuku.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2012/08/add-caption-mother-and-son-is.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2012/08/2005-le-temps-qui-reste.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2012/06/2010-film-socialisme.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2012/01/1931-dr-jekyll-and-mr-hyde.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2012/01/1985-kiss-of-spider-woman.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2011/12/1983-tchao-pantin.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2011/12/for-me-movie-is-greater-at-rate-it-is.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2011/11/one-of-my-favorite-movies-they-shoot.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2011/11/1974-zardoz.html", show: defaultShow },
  { url: "https://febael.blogspot.com/2011/11/1962-loneliness-of-long-distance-runner.html", show: defaultShow },
];

/**
 * Moves or resizes the visible circular area and returns a promise
 * Resolves immediately (and stops the chain) when isCurrent() says the reveal
 * has been superseded, i.e. the bubble was closed mid-animation.
 * @param {Element} frame - The iframe to unroll
 * @param {function(): boolean} isCurrent - False once this reveal is stale
 * @param {number} x - Horizontal center (%)
 * @param {number} y - Vertical center (%)
 * @param {number} r - Radius (%)
 * @returns {Promise} Resolves when the animation finishes
 */
function moveSpotlight(frame, isCurrent, pending, x, y, r = 30) {
  return new Promise((resolve) => {
    if (!frame || !isCurrent()) {
      resolve();
      return;
    }

    const settle = () => {
      frame.removeEventListener('transitionend', onEnd);
      pending.delete(settle);
      resolve();
    };
    function onEnd(e) {
      // Only resolve if the clip-path transition finished
      if (e.propertyName === 'clip-path') settle();
    }

    frame.addEventListener('transitionend', onEnd);
    pending.add(settle);
    frame.style.clipPath = `circle(${r}% at ${x}% ${y}%)`; // Trigger the change
  });
}

function moveCinemaSpotlight(generation, x, y, r) {
  return moveSpotlight(cinemaFrame, () => generation === cinemaGeneration, cinemaPendingSpotlights, x, y, r);
}

const cinemaG = document.getElementById('cinema');
const hobbyText = cinemaG.querySelector('text:nth-of-type(3)');
let cinemaTimer = null;
let cinemaFrame = null;
let cinemaGeneration = 0;
// Each bubble owns its in-flight steps and fade-out timers, so closing one can
// never interrupt the other's reveal.
const cinemaPendingSpotlights = new Set();
const cinemaStaleFrames = new Set();

// Wait for page load to allow iframe visibility
let pageLoaded = false;
let clickHandler = ()=>{};
window.addEventListener('load', () => { pageLoaded = true; });

const hobbies = ['Sumo', 'Music', 'Reading', 'Coding', 'Football', 'Basketball'];

// Align iframe position to div #p's dimensions from handle functions
function alignFrame(frame) {
  const rect = psvg.getBoundingClientRect();
  frame.style.top = rect.top + "px";
  frame.style.left = rect.left + "px";
  frame.style.width = rect.width + "px";
  frame.style.height = rect.height + "px";
}

// A frame is created on hover and destroyed when the reveal is over (unhover /
// Esc), so every reveal starts on a brand new element in the default hidden
// state. The inline clip-path set by the spotlight chain outranks the class
// rules, so simply removing .active leaves the previous reveal in place: the
// next hover would animate 54% -> 6% -> 54%, which looks like a flicker from
// the second hover onwards. Rebuilding the frame (and fading the old one out)
// is what removes that state.
const FRAME_FADE_OUT_MS = 1000; // keep in sync with the opacity transition

/** Fresh hidden frame, with any still-fading one from the same bubble dropped. */
function createFrame(frameClass, staleFrames) {
  staleFrames.forEach((timer) => clearTimeout(timer));
  staleFrames.clear();
  document.querySelectorAll('.' + frameClass).forEach((stale) => stale.remove());

  const frame = document.createElement('iframe');
  frame.className = frameClass;
  document.body.appendChild(frame);
  return frame;
}

/** Release any in-flight step, fade the frame out, then drop it. */
function fadeOutFrame(frame, pending, staleFrames) {
  pending.forEach((settle) => settle());
  pending.clear();

  if (!frame) return;

  const fading = frame;
  fading.classList.remove('active');
  fading.classList.add('fading');
  fading.style.pointerEvents = 'none';

  const timer = setTimeout(() => {
    staleFrames.delete(timer);
    fading.src = 'about:blank';
    fading.remove();
  }, FRAME_FADE_OUT_MS);
  staleFrames.add(timer);
}

function destroyCinemaFrame() {
  cinemaGeneration += 1;
  fadeOutFrame(cinemaFrame, cinemaPendingSpotlights, cinemaStaleFrames);
  cinemaFrame = null;
}

function closeCinema() {
  clearTimeout(cinemaTimer);
  destroyCinemaFrame();
  cinemaG.removeEventListener('click', clickHandler);
  hobbyText.innerHTML = 'Cinema';
}

function showRandomMovie() {
  if (cinemaFrame) return;
  cinemaFrame = createFrame('cinema-frame', cinemaStaleFrames);
  const generation = cinemaGeneration;

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  cinemaFrame.src = randomMovie.url;
  cinemaG.removeEventListener('click', clickHandler);
  cinemaG.addEventListener('click', clickHandler = () => window.open(randomMovie.url, '_blank'));

  alignFrame(cinemaFrame);

  // Force a style resolution on the freshly inserted frame: without a computed
  // start value the fade-in would snap instead of transition.
  void cinemaFrame.offsetWidth;

  cinemaFrame.classList.add('active');
  randomMovie.show((x, y, r) => moveCinemaSpotlight(generation, x, y, r));
}

cinemaG.addEventListener('mouseenter', () => {
  if (cinemaFrame || !pageLoaded) return;

  hobbyText.innerHTML = hobbies[Math.floor(Math.random() * hobbies.length)];
  setTimeout(() => hobbyText.innerHTML = 'Cinema', 100);

  cinemaTimer = setTimeout(() => {
    showRandomMovie();
  }, 3000); // 3 seconds delay
});

cinemaG.addEventListener('mouseleave', closeCinema);

window.addEventListener('keydown', (e) => {
  if (e.key === "Escape") closeCinema();
});

// --- softwareEngineer bubble -------------------------------------------------
// The cinema lifecycle copied verbatim: a frame is created on hover, unrolls
// with the same spotlight chain after the same 3s delay, and is destroyed on
// unhover / Esc. Nothing about the reveal is shared or reused between two
// hovers, which is exactly why the cinema cannot flicker, so this cannot either
// (an iframe is a document, not a property bag, so resetting its clip-path
// never made the leftover state go away).
//
// Two URLs, because they cannot be one. LinkedIn answers with
// x-frame-options: sameorigin and CSP frame-ancestors 'self' *.www.linkedin.com:*,
// so any browser refuses to frame it here (devtools reports it as blocked).
// So the reveal shows the same-origin image, and the click takes you to LinkedIn.
const engineerRevealUrl = './profile.html';
const engineerLinkUrl = 'https://www.linkedin.com/in/feritbaver/';
const engineerG = document.getElementById('softwareEngineer');
let engineerTimer = null;
let engineerFrame = null;
let engineerGeneration = 0;
const engineerPendingSpotlights = new Set();
const engineerStaleFrames = new Set();

function moveEngineerSpotlight(generation, x, y, r) {
  return moveSpotlight(engineerFrame, () => generation === engineerGeneration, engineerPendingSpotlights, x, y, r);
}

function destroyEngineerFrame() {
  engineerGeneration += 1;
  fadeOutFrame(engineerFrame, engineerPendingSpotlights, engineerStaleFrames);
  engineerFrame = null;
}

function showEngineer() {
  if (engineerFrame) return;
  engineerFrame = createFrame('engineer-frame', engineerStaleFrames);
  const generation = engineerGeneration;

  engineerFrame.src = engineerRevealUrl;
  engineerFrame.setAttribute('aria-label', 'LinkedIn profile of Ferit Baver Elhüseyni');

  alignFrame(engineerFrame);

  // Force a style resolution on the freshly inserted frame: without a computed
  // start value the fade-in would snap instead of transition.
  void engineerFrame.offsetWidth;

  engineerFrame.classList.add('active');
  defaultShow((x, y, r) => moveEngineerSpotlight(generation, x, y, r));
}

function hideEngineer() {
  clearTimeout(engineerTimer);
  destroyEngineerFrame();
}

engineerG.addEventListener('mouseenter', () => {
  if (engineerFrame || !pageLoaded) return;

  engineerTimer = setTimeout(() => {
    showEngineer();
  }, 3000); // 3 seconds delay, same as the cinema
});

engineerG.addEventListener('mouseleave', hideEngineer);

// Clicking the bubble opens LinkedIn in a new tab (the bubble lives in #sb,
// which sits above the frame, so it keeps receiving clicks).
engineerG.addEventListener('click', () => {
  window.open(engineerLinkUrl, '_blank', 'noopener');
});

window.addEventListener('keydown', (e) => {
  if (e.key === "Escape") hideEngineer();
});

// A frame that is mid-reveal follows the portrait, the same way the cinema
// frame does while it is alive.
const engineerResizeObserver = new ResizeObserver(() => {
  if (engineerFrame) alignFrame(engineerFrame);
});
engineerResizeObserver.observe(document.body);
