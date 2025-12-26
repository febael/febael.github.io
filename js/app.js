function resize() {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const r = vw / vh;
  const pStyle = document.getElementById('p').style;
  const sb = document.getElementById('sb');

  switch (true) {
    case r > 3   : console.log("ultra-wide"); break; // TODO : implement it
    case r > 2.1 : handleWide(); break;
    case r > 1.3 : handleHorizontal(); break;
    case r > 0.7 : handleAlmostSquare(); break;
    default      : handleVertical();
  }
  recreateClickAreas();

  function handleWide() {
    const w = 161 - r * 30;
    sb.style.width = w + "%";
    sb.style.marginLeft = (100 - w) / 2 + "%";
    const w2 = 159.5 - r * 25;
    pStyle.marginTop = r * -5 + 5 + "%";
    pStyle.width = w2 + "%";
    pStyle.marginLeft = (100 - w2) / 2 + "%";
  }

  function handleHorizontal() {
    sb.style.marginTop = 21 - r * 10 + "%";
    const w = 170 - r * 30;
    pStyle.marginTop = r * -4 + 3.7 + "%";
    pStyle.width = w + "%";
    pStyle.marginLeft = (100 - w) / 2 + "%";
  }

  function handleAlmostSquare() {
    sb.style.marginTop = 86 - r * 60 + "%";
    const w = 235 - r * 80;
    pStyle.marginTop = r * -3 + 2.4 + "%";
    pStyle.width = w + "%";
    pStyle.marginLeft = (100 - w) / 2 + "%";
  }

  function handleVertical() {
    sb.style.marginTop = 128 - r * 120 + "%";
    const w = 305 - r * 180;
    pStyle.marginTop = r * -2 + 1.7 + "%";
    pStyle.width = w + "%";
    pStyle.marginLeft = (100 - w) / 2 + "%";
  }

  function recreateClickAreas() {
    const sbsvg = sb.querySelector("svg");
  }
}



const resizeObserver = new ResizeObserver(() => {
  resize()
});
resizeObserver.observe(document.body);
