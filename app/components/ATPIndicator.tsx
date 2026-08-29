export function ATPIndicator({ value }: { value: number }) {
  return (
    <div className="atp-indicator" aria-label={`当前能量 ${value}`} title="完成真实承诺会积累能量">
      <span className="atp-indicator__orb" aria-hidden="true" />
      <span>能量</span><strong>{value}</strong>
    </div>
  );
}
