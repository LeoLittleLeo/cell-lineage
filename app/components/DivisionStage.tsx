export function DivisionStage({ generation }: { generation: number }) {
  return (
    <section className="division-stage" aria-live="polite" aria-label={`正在形成第 ${generation} 代`}>
      <p className="eyebrow">承诺正在成形</p>
      <div className="mitosis" aria-hidden="true">
        <span className="mitosis__body" />
        <span className="mitosis__nucleus mitosis__nucleus--a" />
        <span className="mitosis__nucleus mitosis__nucleus--b" />
        <span className="mitosis__furrow" />
      </div>
      <p className="division-stage__caption">GENERATION {String(generation).padStart(2, "0")}</p>
    </section>
  );
}
