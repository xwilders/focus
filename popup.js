function trimUrl(url) {
  if (url.includes("www")) {
    url = url.split("www.")[1];
  } else {
    url = url.split("//")[1];
  }

  url = url.split(".com")[0];

  return url;
}

const promisify = (func, key, ...args) => {
  return new Promise((resolve, reject) => {
    func[key](...args, (...callbackArgs) => {
      resolve(...callbackArgs);
    });
  });
};

const button = document.querySelector("#btn");
const boxes = document.querySelectorAll(".box");

const updatePopup = friction_amount => {
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].style.visibility = i + 1 > friction_amount ? "hidden" : "visible";
  }

  button.textContent =
    friction_amount === 2 ? "Clear friction" : "Add friction";
};

const init = async () => {
  let { sites = [] } = await promisify(chrome.storage.local, "get", "sites");
  let { friction_amount = 0 } = await promisify(
    chrome.storage.local,
    "get",
    "friction_amount"
  );

  updatePopup(friction_amount);

  const tabs = await promisify(chrome.tabs, "query", {
    active: true,
    currentWindow: true
  });

  const url = tabs[0] && trimUrl(tabs[0].url);
  if (!url) return;

  button.addEventListener("click", async e => {
    friction_amount = (friction_amount + 1) % 3;

    if (!friction_amount) sites = sites.filter(site => site !== url);
    else if (friction_amount === 1) sites = sites.concat(url);

    chrome.storage.local.set({ sites, friction_amount });
  });
};

init();
