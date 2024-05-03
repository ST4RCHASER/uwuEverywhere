import { uwuConfig, uwuLogoNodes } from "./types";

const allResourceTypes = 
    Object.values(chrome.declarativeNetRequest.ResourceType);

export const makeRedirectRule = () => {
    const rules: chrome.declarativeNetRequest.Rule[] = [];
    return new Promise<chrome.declarativeNetRequest.Rule[]>((resolve) => {
        try {
            chrome.storage.local.get("uwuConfig", function (data) {
                const config = data.uwuConfig as uwuConfig;
                const isGlobalEnabled = typeof config === 'undefined' || typeof config.globalEnabled === 'undefined' || config === null ? true : config.globalEnabled
                if(!isGlobalEnabled){
                    resolve([])
                }
                chrome.storage.local.get("uwuLogos", (data) => {
                    const logos = data.uwuLogos as uwuLogoNodes
                    const keys = Object.keys(logos)
                    let id = 150000
                    for(const key of keys){
                        //If this is a blacklisted domain, skip
                        if(config.blackListDomains.includes(key)) continue
                        const logo = logos[key]
                        const replaceRequestUrls = Object.keys(logo.replaceRequestUrl)
                        for(const replaceRequestUrl of replaceRequestUrls){
                            const replace = logo.replaceRequestUrl[replaceRequestUrl].replace
                            const withUrl = logo.replaceRequestUrl[replaceRequestUrl].with
                            rules.push({
                                id: id++,
                                priority: -12,
                                action: {
                                    type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
                                    redirect: {
                                        url: withUrl
                                    },
                                },
                                condition: {
                                    urlFilter: replace,
                                    resourceTypes: allResourceTypes,
                                }
                            })
                        }
                    }
                })
                resolve(rules)
              });
        }catch(e){
            console.error('[uwuEverywhere] Error making dynamic rules:', e)
            resolve([])
        }
    })
}