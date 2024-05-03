export type uwuConfig = {
  globalEnabled: boolean;
  blackListDomains: string[];
  logosUpdatedAt: string;
};

export type uwuResponse = uwuConfig & {
  isThisSiteIsBlackListed: boolean;
  version: string;
};

export type uwuLogoNodes = {
  [key: string]: {
    name: string;
    customCss?: string;
    replaceImageUrl?: [
      {
        replace: string;
        with: string;
      },
    ];
  };
};
