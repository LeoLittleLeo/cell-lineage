import { useLanguage } from "../i18n/LanguageContext";

export function ATPIndicator({ value }: { value: number }) {
  const { isZh } = useLanguage();
  return (
    <div className="atp-indicator" aria-label={isZh ? `当前能量 ${value}` : `Current energy ${value}`} title={isZh ? "完成真实承诺会积累能量" : "Completing real commitments builds energy"}>
      <span className="atp-indicator__orb" aria-hidden="true" />
      <span>{isZh ? "能量" : "ENERGY"}</span><strong>{value}</strong>
    </div>
  );
}
