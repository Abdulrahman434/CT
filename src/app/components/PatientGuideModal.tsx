import { useLocale } from "./i18n";
import { PdfReaderModal } from "./PdfReaderModal";

/**
 * Fullscreen viewer for a bundled patient-guide PDF.
 *
 * The kiosk WebView ships no PDF plugin, so an iframe would render nothing on
 * the bedside terminal. The file goes through the same pdf.js reader the
 * Reading library uses, which paints the pages itself.
 */
export function PatientGuideModal({ src, onClose }: { src: string; onClose: () => void }) {
  const { t } = useLocale();

  return (
    <PdfReaderModal
      onClose={onClose}
      pdfSource={src}
      title={t("shortcut.patientGuide")}
    />
  );
}
