import { uwuConfig, uwuLogoNodes, uwuResponse } from "./types";
const manifestData = chrome.runtime.getManifest();

const doChangeScript = () => {
  chrome.storage.local.get("uwuConfig", function (data) {
    const config = data.uwuConfig as uwuConfig;
    const currentDomain = window.location.hostname;
    const currentFullUrl = window.location.href;
    const isInBlackList = config.blackListDomains.includes(currentDomain);
    if (!isInBlackList && config.globalEnabled) {
      chrome.storage.local.get("uwuLogos", (data) => {
        const logos = data.uwuLogos as uwuLogoNodes;
        const currentDomainLogo = Object.keys(logos).find((logo) => {
          return new RegExp(logo).test(currentFullUrl);
        });
        if (currentDomainLogo) {
          const { name, css, js } = logos[currentDomainLogo];
          if (js) {
            const isUrl = new RegExp(/(http|https):\/\/[^ "]+\.js$/).test(js);
            console.log("[uwu] Script " + name + " attached");
            if (!isUrl) {
              const script = document.createElement("script");
              script.innerHTML = js;
              document.head.appendChild(script);
              return;
            }
            const script = document.createElement("script");
            script.src = js;
            document.head.appendChild(script);
          }
          if (css) {
            //As regex support http and https endwith css
            const isUrl = new RegExp(/(http|https):\/\/[^ "]+\.css$/).test(css);
            console.log("[uwu] Style " + name + " attached");
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
// Some site replace head content after load so we need to listen to multiple events and timeout
document.addEventListener("DOMContentLoaded", doChangeScript);
document.addEventListener("load", doChangeScript);
document.addEventListener("readystatechange", doChangeScript);
setTimeout(doChangeScript, 1000);
// On load, set the background color to the saved value
doChangeScript();
