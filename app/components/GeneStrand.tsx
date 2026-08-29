import type { CSSProperties } from "react";

const BASES = ["A", "T", "C", "G"] as const;

function sequenceFrom(seed: string, weight: number, minutes: number, energy: number, length: number) {
  let hash = 2166136261;
  const encoded = `${seed}|${weight}|${minutes}|${energy}`;
  for (let index = 0; index < encoded.length; index += 1) {
    hash ^= encoded.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Array.from({ length }, (_, index) => BASES[Math.abs(hash + index * 13 + weight * 7 + energy * 11 + Math.round(minutes / 5)) % BASES.length]);
}

export function GeneStrand({ seed, weight = 2, minutes = 30, energy = 3, compact = false, className = "", label }: { seed: string; weight?: number; minutes?: number; energy?: number; compact?: boolean; className?: string; label?: string }) {
  const bases = sequenceFrom(seed, weight, minutes, energy, compact ? 9 : 14);
  return <div className={`gene-strand ${compact ? "gene-strand--compact" : ""} ${className}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <span className="gene-strand__rail gene-strand__rail--a" />
    <span className="gene-strand__rail gene-strand__rail--b" />
    <span className="gene-strand__pairs">
      {bases.map((base, index) => <i key={`${base}-${index}`} className={`base base--${base.toLowerCase()}`} style={{ "--base-index": index, "--base-tilt": `${(index % 4 - 1.5) * 7}deg` } as CSSProperties}><b>{base}</b><span /></i>)}
    </span>
  </div>;
}
