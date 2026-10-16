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

const defaultShow = async (generation) => {
  await moveCinemaSpotlight(generation, 0, 0, 6)
  await moveCinemaSpotlight(generation, 5, 0, 18);
  await moveCinemaSpotlight(generation, 10, 0, 36);
  await moveCinemaSpotlight(generation, 15, 0, 54);
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
 * Resolves immediately (and stops the chain) when the generation is stale,
 * i.e. the cinema was closed while the animation was still running.
 * @param {number} generation - Cinema generation this animation belongs to
 * @param {number} x - Horizontal center (%)
 * @param {number} y - Vertical center (%)
 * @param {number} r - Radius (%)
 * @returns {Promise} Resolves when the animation finishes
 */
function moveCinemaSpotlight(generation, x, y, r = 30) {
  return new Promise((resolve) => {
    const frame = cinemaFrame;
    if (!frame || generation !== cinemaGeneration) {
      resolve();
      return;
    }

    const settle = () => {
      frame.removeEventListener('transitionend', onEnd);
      pendingSpotlights.delete(settle);
      resolve();
    };
    function onEnd(e) {
      // Only resolve if the clip-path transition finished
      if (e.propertyName === 'clip-path') settle();
    }

    frame.addEventListener('transitionend', onEnd);
    pendingSpotlights.add(settle);
    frame.style.clipPath = `circle(${r}% at ${x}% ${y}%)`; // Trigger the change
  });
}

const cinemaG = document.getElementById('cinema');
const hobbyText = cinemaG.querySelector('text:nth-of-type(3)');
let cinemaTimer = null;
let cinemaFrame = null;
let cinemaGeneration = 0;
const pendingSpotlights = new Set();

// Wait for page load to allow iframe visibility
let pageLoaded = false;
let clickHandler = ()=>{};
window.addEventListener('load', () => { pageLoaded = true; });

const hobbies = ['Sumo', 'Music', 'Reading', 'Coding', 'Football', 'Basketball'];

// A frame is created on hover and destroyed when a movie is done being shown
// (unhover / Esc), so every reveal starts from the default hidden state.
// The inline clip-path set by the spotlight chain outranks the class rules, so
// simply removing .active left the previous reveal in place: the next hover
// animated 54% -> 6% -> 54%, which looked like a flicker from the second hover
// onwards. Rebuilding the frame (and fading the old one out) removes that state.
const FRAME_FADE_OUT_MS = 1000; // keep in sync with the opacity transition
const fadeOutTimers = new Set();

function createCinemaFrame() {
  // Drop any frame that is still fading out so two never overlap.
  fadeOutTimers.forEach((timer) => clearTimeout(timer));
  fadeOutTimers.clear();
  document.querySelectorAll('.cinema-frame').forEach((stale) => stale.remove());

  const frame = document.createElement('iframe');
  frame.className = 'cinema-frame';
  document.body.appendChild(frame);
  return frame;
}

function destroyCinemaFrame() {
  cinemaGeneration += 1;
  pendingSpotlights.forEach((settle) => settle());
  pendingSpotlights.clear();

  if (!cinemaFrame) return;

  const fading = cinemaFrame;
  cinemaFrame = null;

  fading.classList.remove('active');
  fading.classList.add('fading');
  fading.style.pointerEvents = 'none';

  const timer = setTimeout(() => {
    fadeOutTimers.delete(timer);
    fading.src = 'about:blank';
    fading.remove();
  }, FRAME_FADE_OUT_MS);
  fadeOutTimers.add(timer);
}

function closeCinema() {
  clearTimeout(cinemaTimer);
  destroyCinemaFrame();
  cinemaG.removeEventListener('click', clickHandler);
  hobbyText.innerHTML = 'Cinema';
}

function showRandomMovie() {
  if (cinemaFrame) return;
  cinemaFrame = createCinemaFrame();
  const generation = cinemaGeneration;

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  cinemaFrame.src = randomMovie.url;
  cinemaG.removeEventListener('click', clickHandler);
  cinemaG.addEventListener('click', clickHandler = () => window.open(randomMovie.url, '_blank'));

  // Align iframe position to div #p's dimensions from handle functions
  const rect = psvg.getBoundingClientRect();
  cinemaFrame.style.top = rect.top + "px";
  cinemaFrame.style.left = rect.left + "px";
  cinemaFrame.style.width = rect.width + "px";
  cinemaFrame.style.height = rect.height + "px";

  // Force a style resolution on the freshly inserted frame: without a computed
  // start value the fade-in would snap instead of transition.
  void cinemaFrame.offsetWidth;

  cinemaFrame.classList.add('active');
  randomMovie.show(generation);
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
