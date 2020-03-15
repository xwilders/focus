const MAX_DELAY = 10;
const MAX_READING = 60 * 5;

const updateInitialTimer = (div, interval, delay = 0) => {
  div.innerHTML = `<div style="font-size:40px; text-align: center; padding: 200px;">${delay}</div>`;

  if (delay >= 10) {
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

const setClock = () => {
  const clockDiv = document.createElement("div");
  document.body.appendChild(clockDiv);
  clockDiv.style =
    "position: fixed; z-index: 999999; background: white; right: 0; top: 0;";

  const startTime = new Date();
  let nextDelay = MAX_READING;
  let blink = false;
  const clockTimerInterval = setInterval(() => {
    const timeElapsed = Math.floor((new Date() - startTime) / 1000);
    const formattedTime =
      timeElapsed > 60
        ? `${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s`
        : `${timeElapsed}s`;

    if (timeElapsed > nextDelay - 20) {
      blink = !blink;
    }
    clockDiv.innerHTML = !blink
      ? `<div style="font-size:20px; text-align: center;">${formattedTime}</div>`
      : "<div />";

    if (timeElapsed > nextDelay - 1) {
      blink = false;
      nextDelay += MAX_READING;
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

chrome.storage.local.get(
  ["sites", "friction_amount"],
  ({ sites = [], friction_amount = 0 }) => {
    const url = trimUrl(document.location.origin);

    if (sites.length && sites.includes(url)) {
      setClock();
      if (friction_amount === 2) delaySite();
    }
  }
);
