import { useState, useEffect } from "react";
import { useNurseStore } from "../components/NurseDataStore";
import { useLocale } from "../components/i18n";

export interface PatientInfoResult {
  patient: ReturnType<typeof useNurseStore>["patient"];
  displayName: string;
  displayMrn: string;
  displayRoom: string;
  displayBed: string;
  displayAdmit: string;
  displayDischarge: string;
  nameMode: string | null;
  fileName: string;
  customName: string;
}

export function usePatientInfo(): PatientInfoResult {
  const nurseStore = useNurseStore();
  const { t, isRTL } = useLocale();
  const p = nurseStore.patient;

  const [nameMode, setNameMode] = useState<string | null>(() =>
    localStorage.getItem("careinn-display-name-mode")
  );

  const [customNameEn, setCustomNameEn] = useState<string>(() =>
    localStorage.getItem("careinn-display-name") || ""
  );

  const [customNameAr, setCustomNameAr] = useState<string>(() =>
    localStorage.getItem("careinn-display-name-ar") || ""
  );

  useEffect(() => {
    const handler = () => {
      setNameMode(localStorage.getItem("careinn-display-name-mode"));
      setCustomNameEn(localStorage.getItem("careinn-display-name") || "");
      setCustomNameAr(localStorage.getItem("careinn-display-name-ar") || "");
    };
    window.addEventListener("display-name-changed", handler);
    return () => window.removeEventListener("display-name-changed", handler);
  }, []);

  const fileName = isRTL && p.nameAr
    ? p.nameAr
    : (p.nameKey ? t(p.nameKey) : p.name);

  const customName = isRTL
    ? (customNameAr || customNameEn || fileName)
    : (customNameEn || fileName);

  const displayName =
    nameMode === "skipped" ? "" :
    nameMode === "custom" ? (customName || fileName) :
    fileName;

  return {
    patient: p,
    displayName,
    displayMrn: p.mrn || "",
    displayRoom: p.room || "",
    displayBed: p.bed || "",
    displayAdmit: p.admissionDate || "",
    displayDischarge: p.dischargeDate || "",
    nameMode,
    fileName,
    customName,
  };
}
