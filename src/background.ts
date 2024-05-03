import { makeRedirectRule } from "./rules";
import { uwuLogoNodes } from "./types";

const setDefaultConfig = () => {
  chrome.storage.local.get("uwuConfig", (data) => {
    if (!data.uwuConfig) {
      chrome.storage.local.set({
        uwuConfig: {
          globalEnabled: true,
          blackListDomains: [],
          logosUpdatedAt: null,
        },
      });
    }
  });
  chrome.storage.local.get("uwuLogos", (data) => {
    if (!data.uwuLogos) {
      chrome.storage.local.set({ uwuLogos: {} });
    }
  });
};

const doUpdateLogos = () => {
  fetch(
    "https://github.com/ST4RCHASER/uwuEverywhere/blob/main/resources/logos.json?raw=true",
  )
    .then((response) => response.json())
    .then((data) => {
      saveLogosConfig(data);
    })
    .catch((error) => {
      console.error("[uwuEverywhere] Error fetching logos:", error);
    });
};

const saveLogosConfig = (data: uwuLogoNodes) => {
  // Save the downloaded data to the config
  chrome.storage.local.set({ uwuLogos: data }, () => {
    console.log("[uwuEverywhere] Logos updated successfully");
    chrome.storage.local.get("uwuConfig", (data) => {
      if (data.uwuConfig) {
        chrome.storage.local.set({
          uwuConfig: {
            ...data.uwuConfig,
            logosUpdatedAt: new Date().toLocaleString(),
          },
        });
      }
    });
  });
};

chrome.runtime.onStartup.addListener(() => {
  setDefaultConfig();
  doUpdateLogos();
});

//On extension install
chrome.runtime.onInstalled.addListener(() => {
  setDefaultConfig();
  doUpdateLogos();
});

//On extension update
chrome.runtime.onUpdateAvailable.addListener(() => {
  setDefaultConfig();
  doUpdateLogos();
});

//On extension enable
chrome.management.onEnabled.addListener(() => {
  setDefaultConfig();
  doUpdateLogos();
});

// Request edit
const updateDynamicRules = async () => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: await chrome.declarativeNetRequest
      .getDynamicRules()
      .then((rules) =>
        rules
          .filter(
            (rule) =>
              rule.priority === 1 &&
              rule.action.type ===
                chrome.declarativeNetRequest.RuleActionType.REDIRECT &&
              rule.id >= 150000,
          )
          .map((rule) => rule.id),
      ),
    addRules: await makeRedirectRule(),
  });
};

updateDynamicRules().then(() => console.log("DynamicRules Updated!"));
