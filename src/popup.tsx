import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { uwuConfig, uwuLogoNodes } from "./types";
const Popup = () => {
  const [version, setVersion] = useState<string>();
  const [logosUpdatedAt, setLogoUpdatedAt] = useState<string>();
  const [blackListDomains, setBlackListDomains] = useState<string[]>([]);
  const [globalEnabled, setGlobalEnabled] = useState<boolean>(true);
  const [isThisSiteIsBlackListed, setIsThisSiteIsBlackListed] =
    useState<boolean>(false);
  const [totalDomains, setTotalDomains] = useState<number>(0);
  const [currentHostname, setCurrentHostname] = useState<string>();

  useEffect(() => {
    chrome.runtime.getManifest().version &&
      setVersion(chrome.runtime.getManifest().version);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      //If is not url or extension page, return
      if (
        !tabs[0].url ||
        tabs[0].url.startsWith("chrome://") ||
        tabs[0].url.startsWith("chrome-extension://")
      )
        return;
      const url = new URL(tabs[0].url);
      setCurrentHostname(url.hostname);
    });
  }, []);

  useEffect(() => {
    if (currentHostname) {
      chrome.storage.local.get("uwuConfig", (data) => {
        const config: uwuConfig = data?.uwuConfig;
        const blacklist = config.blackListDomains || [];
        setLogoUpdatedAt(config?.logosUpdatedAt);
        setBlackListDomains(blacklist || []);
        setGlobalEnabled(config?.globalEnabled);
        setIsThisSiteIsBlackListed(blacklist.includes(currentHostname));
      });
      chrome.storage.local.get("uwuLogos", (data) => {
        const logos: uwuLogoNodes = data.uwuLogos;
        setTotalDomains(Object.keys(logos).length);
      });
    }
  }, [currentHostname]);

  const doSaveChanges = (enable: boolean, domains: string[], reload = true) => {
    chrome.storage.local.set(
      {
        uwuConfig: {
          globalEnabled: enable,
          blackListDomains: domains,
          logosUpdatedAt,
        },
      },
      () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
          if (tab.id) {
            setBlackListDomains(domains);
            setGlobalEnabled(enable);
            if (currentHostname) {
              setIsThisSiteIsBlackListed(domains.includes(currentHostname));
            }
            if (reload) {
              return chrome.tabs.reload(tab.id);
            }
            chrome.tabs.sendMessage(tab.id, "uwu");
          }
        });
      },
    );
  };

  const handleButton = (type: "ALL" | "SITE") => {
    switch (type) {
      case "ALL":
        doSaveChanges(!globalEnabled, blackListDomains);
        break;
      case "SITE":
        if (currentHostname) {
          doSaveChanges(
            globalEnabled,
            isThisSiteIsBlackListed
              ? blackListDomains.filter((domain) => domain !== currentHostname)
              : [...blackListDomains, currentHostname],
          );
        }
        break;
    }
  };

  return (
    <>
      {currentHostname ? (
        <div className="container">
          <img src="logo.png" alt="logo credit to @sawaratsuki1004" />
          <h1 className="title">(uwu) Everywhere</h1>
          <p className="info">
            Total loaded domains: <span id="info">{totalDomains}</span>
          </p>
          <div className="status-container">
            <button
              onClick={() => handleButton("SITE")}
              className={`toggle-button ${!isThisSiteIsBlackListed && "this"}`}
            >
              {isThisSiteIsBlackListed ? "Enable" : "Disable"} for this site
            </button>
            <button
              onClick={() => handleButton("ALL")}
              className={`toggle-button ${globalEnabled && "all"}`}
            >
              {globalEnabled ? "Disable" : "Enable"} for all sites
            </button>
          </div>
          <p className="version">
            {version || "?"}/{logosUpdatedAt || "?"}
          </p>
        </div>
      ) : (
        <div className="container">
          <h1 className="title">Not supported on this page</h1>
        </div>
      )}
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
