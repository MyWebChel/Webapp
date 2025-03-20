declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready(): void;
        close(): void;
        MainButton: {
          text: string;
          show(): void;
          hide(): void;
          onClick(fn: () => void): void;
          offClick(fn: () => void): void;
          enable(): void;
          disable(): void;
        };
        showPopup(params: {
          title?: string;
          message: string;
          buttons?: Array<{
            id: string;
            type?: string;
            text: string;
          }>;
        }): Promise<{button_id: string}>;
      };
    };
  }
}

export {};