export function ATPIndicator({ value }: { value: number }) {
  return (
    <div className="atp-indicator" aria-label={`当前 ATP ${value}`} title="完成真实承诺会积累 ATP">
      <span className="atp-indicator__orb" aria-hidden="true" />
      <span>ATP</span><strong>{value}</strong>
    </div>
  );
}
