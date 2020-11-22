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

const updatePopup = (friction = 0) => {
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].style.visibility = i + 1 > friction ? "hidden" : "visible";
  }

  button.textContent = friction === 2 ? "Clear friction" : "Add friction";
};

const init = async () => {
  let { sites = [] } = await promisify(chrome.storage.local, "get", "sites");

  const tabs = await promisify(chrome.tabs, "query", {
    active: true,
    currentWindow: true,
  });

  const url = tabs[0] && trimUrl(tabs[0].url);
  if (!url) return;

  const storedSite = sites.find((s) => s.url === url) || {};

  updatePopup(storedSite.friction);

  button.addEventListener("click", async (e) => {
    const friction = ((storedSite.friction || 0) + 1) % 3;

    if (!storedSite.url) sites = sites.concat({ url, friction });
    else storedSite.friction = friction;

    chrome.storage.local.set({ sites });
  });
};

init();
