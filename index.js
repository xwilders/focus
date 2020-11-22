const MAX_DELAY = 10;
const MAX_SCROLL = 3000;

const MINUTE = 60;

const showFriction = (friction = 0, showBelowTimer) => {
  const path = chrome.runtime.getURL("yoga16.png");

  for (let i = 0; i < friction; i++) {
    const img = document.createElement("img");
    img.src = path;

    document.body.appendChild(img);
    img.style = `position: fixed; z-index: 999999; right: ${i * 10}px; top: ${
      showBelowTimer ? 28 : 0
    }px; height: 10px; width: 10px;`;
  }
};

const updateInitialTimer = (div, interval, delay = 0) => {
  div.innerHTML = `<div style="font-size:40px; text-align: center; padding: 200px;">${delay}</div>`;

  if (delay >= MAX_DELAY) {
    clearInterval(interval);
    document.body.removeChild(div);
  }
};

const delaySite = () => {
  const div = document.createElement("div");
  document.body.appendChild(div);
  div.style =
    "position: fixed; z-index: 99999; height: 100%; width: 100%; background: white; left: 0; top: 0;";

  updateInitialTimer(div);

  let delay = 0;
  const initialTimerInterval = setInterval(
    () => updateInitialTimer(div, initialTimerInterval, ++delay),
    1000
  );
};

const setClock = (MAX_TIME) => {
  const clockDiv = document.createElement("div");
  document.body.appendChild(clockDiv);
  clockDiv.style =
    "position: fixed; z-index: 999999; background: white; right: 0; top: 0;";

  const startTime = new Date();
  let nextDelay = MAX_TIME;
  let blink = false;
  const clockTimerInterval = setInterval(() => {
    const timeElapsed = Math.floor((new Date() - startTime) / 1000);
    const formattedTime =
      timeElapsed > MINUTE
        ? `${Math.floor(timeElapsed / MINUTE)}m ${timeElapsed % MINUTE}s`
        : `${timeElapsed}s`;

    if (timeElapsed > nextDelay - 20) {
      blink = !blink;
    }
    clockDiv.innerHTML = !blink
      ? `<div style="font-size:20px; text-align: center;">${formattedTime}</div>`
      : "<div />";

    if (timeElapsed > nextDelay - 1) {
      blink = false;
      nextDelay += MAX_TIME;
      delaySite();
    }
  }, 500);
};

function trimUrl(url) {
  if (url.includes("www")) {
    url = url.split("www.")[1];
  } else {
    url = url.split("//")[1];
  }

  url = url.split(".com")[0];

  return url;
}

function runOnScroll(e) {
  const scrollAmount = window.pageYOffset;

  if (scrollAmount < MAX_SCROLL) document.body.style.opacity = 1;
  else
    document.body.style.opacity =
      1 - ((scrollAmount - MAX_SCROLL) * 2) / MAX_SCROLL;
}

chrome.storage.local.get(["sites"], ({ sites = [] }) => {
  const url = trimUrl(document.location.origin);

  const site = sites.find((s) => s.url === url) || {};

  if (!site.friction) return;

  showFriction(site.friction, site.friction === 2);

  window.addEventListener("scroll", runOnScroll, { passive: true });

  if (site.friction === 2) {
    setClock(5 * MINUTE);
    delaySite();
  }
});
