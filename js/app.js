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

const movies = [
  {
    url: "https://febael.blogspot.com/2014/01/1945-children-of-paradise.html",
    show: async () => {
      await moveCinemaSpotlight(0, 0, 15)
      await moveCinemaSpotlight(5, 0, 30);
      await moveCinemaSpotlight(10, 0, 45);
      await moveCinemaSpotlight(15, 0, 60);
    }
  }
];

/**
 * Moves or resizes the visible circular area and returns a promise
 * @param {number} x - Horizontal center (%)
 * @param {number} y - Vertical center (%)
 * @param {number} r - Radius (%)
 * @returns {Promise} Resolves when the animation finishes
 */
function moveCinemaSpotlight(x, y, r = 30) {
  return new Promise((resolve) => {
    const onEnd = (e) => {
      // Only resolve if the clip-path transition finished
      if (e.propertyName === 'clip-path') {
        cinemaFrame.removeEventListener('transitionend', onEnd);
        resolve();
      }
    };
    cinemaFrame.addEventListener('transitionend', onEnd);
    cinemaFrame.style.clipPath = `circle(${r}% at ${x}% ${y}%)`; // Trigger the change
  });
}

const cinemaG = document.getElementById('cinema');
let cinemaTimer = null;
let isCinemaOpen = false;

// Create and inject the iframe
const cinemaFrame = document.createElement('iframe');
cinemaFrame.id = 'cinema-frame';
document.body.appendChild(cinemaFrame);

// Wait for page load to allow iframe visibility
let pageLoaded = false;
let clickHandler = ()=>{};
window.addEventListener('load', () => { pageLoaded = true; });

cinemaG.addEventListener('mouseenter', () => {
  if (isCinemaOpen || !pageLoaded) return;

  cinemaTimer = setTimeout(() => {
    showRandomMovie();
  }, 3000); // 3 seconds delay
});

cinemaG.addEventListener('mouseleave', () => {
  clearTimeout(cinemaTimer);
  cinemaFrame.classList.remove('active');
  isCinemaOpen = false;
  cinemaG.removeEventListener('click', clickHandler);
});

function showRandomMovie() {
  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  cinemaFrame.src = randomMovie.url;
  cinemaG.removeEventListener('click', clickHandler);
  cinemaG.addEventListener('click', clickHandler = () => window.open(randomMovie.url, '_blank'));
  randomMovie.show();

  // Align iframe position to div #p's dimensions from handle functions
  const rect = psvg.getBoundingClientRect();
  cinemaFrame.style.top = rect.top + "px";
  cinemaFrame.style.left = rect.left + "px";
  cinemaFrame.style.width = rect.width + "px";
  cinemaFrame.style.height = rect.height + "px";

  cinemaFrame.classList.add('active');
  isCinemaOpen = true;
}

// Close cinema if clicking outside or handle with your own shrink logic
window.addEventListener('keydown', (e) => {
  if (e.key === "Escape" && isCinemaOpen) {
    cinemaFrame.classList.remove('active');
    cinemaFrame.src = "about:blank";
    isCinemaOpen = false;
  }
});
