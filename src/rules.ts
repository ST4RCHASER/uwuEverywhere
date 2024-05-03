import { uwuConfig, uwuLogoNodes } from "./types";

export const makeRedirectRule = () => {
  const rules: chrome.declarativeNetRequest.Rule[] = [];
  return new Promise<chrome.declarativeNetRequest.Rule[]>((resolve) => {
    try {
      chrome.storage.local.get("uwuConfig", function (data) {
        const config = data.uwuConfig as uwuConfig;
        const isGlobalEnabled =
          typeof config === "undefined" ||
          typeof config.globalEnabled === "undefined" ||
          config === null
            ? true
            : config.globalEnabled;
        if (!isGlobalEnabled) {
          resolve([]);
        }
        chrome.storage.local.get("uwuLogos", (data) => {
          const logos = data.uwuLogos as uwuLogoNodes;
          const keys = Object.keys(logos);
          let id = 150000;
          for (const key of keys) {
            //If this is a blacklisted domain, skip
            if (config.blackListDomains.includes(key)) continue;
            const logo = logos[key];
            for (const replaceImageUrl of logo.replaceImageUrl || []) {
              rules.push({
                id: id++,
                priority: 1,
                action: {
                  type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
                  redirect: {
                    url: replaceImageUrl.with,
                  },
                },
                condition: {
                  urlFilter: replaceImageUrl.replace,
                  resourceTypes: [
                    chrome.declarativeNetRequest.ResourceType.IMAGE,
                    chrome.declarativeNetRequest.ResourceType.MEDIA,
                  ],
                },
              });
            }
            console.log("[uwuEverywhere] Rule created for:", rules);
          }
          resolve(rules);
        });
      });
    } catch (e) {
      console.error("[uwuEverywhere] Error making dynamic rules:", e);
      resolve([]);
    }
  });
};
