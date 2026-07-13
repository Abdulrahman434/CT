export { };

declare global {
  interface Window {
    AndroidNFC?: {
      tagRead: (uid: string) => void;
      isEnabled: () => boolean;
    };
    __isLockActive?: () => boolean;
  }
}
