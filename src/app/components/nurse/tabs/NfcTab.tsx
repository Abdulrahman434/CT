import { NfcCardManager } from "../NfcCardManager";

export function NfcTab() {
  return (
    <div className="space-y-5">
      <div className="nurse-card">
        <NfcCardManager />
      </div>
    </div>
  );
}
