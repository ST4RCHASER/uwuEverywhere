import { uwuConfig, uwuLogoNodes, uwuResponse } from "./types";
const manifestData = chrome.runtime.getManifest();

const doChangeScript = () => {
  chrome.storage.local.get("uwuConfig", function (data) {
    const config = data.uwuConfig as uwuConfig;
    const currentDomain = window.location.hostname;
    const isInBlackList = config.blackListDomains.includes(currentDomain);
    if (!isInBlackList && config.globalEnabled) {
      chrome.storage.local.get("uwuLogos", (data) => {
        const logos = data.uwuLogos as uwuLogoNodes;
        const currentDomainLogo = Object.keys(logos).find((logo) => {
          return new RegExp(logo).test(currentDomain);
        });
        if (currentDomainLogo) {
          const { css } = logos[currentDomainLogo];
          if (css) {
            //As regex support http and https endwith css
            const isUrl = new RegExp(/(http|https):\/\/[^ "]+\.css$/).test(css);
            if (isUrl) {
              const style = document.createElement("link");
              style.rel = "stylesheet";
              style.href = css;
              document.head.appendChild(style);
              return;
            }
            const style = document.createElement("style");
            style.innerHTML = css;
            document.head.appendChild(style);
          }
        }
      });
    }
  });
};

// For others site want to detect is uwu is on
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg === "uwu") {
    doChangeScript();
  }
  chrome.storage.local.get("uwuConfig", (data) => {
    const response: uwuResponse = {
      ...data.uwuConfig,
      isThisSiteIsBlackListed: data.uwuConfig.blackListDomains.includes(
        sender.url,
      ),
      version: manifestData.version,
    };
    sendResponse(response);
  });
});

// On load, set the background color to the saved value
doChangeScript();
