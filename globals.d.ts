export {};

declare global {
  interface Window {
    /**
     * Google reCAPTCHA v3
     */
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };

    /**
     * Klaro cookie consent manager
     */
    klaro?: {
      show: () => void;
      hide: () => void;
      getManager: () => unknown;
      getConsent: () => Record<string, boolean>;
      setConsent: (service: string, value: boolean) => void;
      getAllConsents: () => Record<string, boolean>;
      updateManager: () => void;
    };
  }
}