export default function Slide5Reports() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#F8F9FB",
        fontFamily: "'Inter', sans-serif",
        color: "#333333",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "16vh",
          backgroundColor: "#1C2541",
          color: "#FFFFFF",
          padding: "4vh 8vw",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <h2 style={{ fontSize: "2.8vw", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
          Executive Reporting Suite
        </h2>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", opacity: 0.65 }}>
          OXOT CONFORMITY — 05
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          padding: "5vh 8vw 3vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "3.5vh",
        }}
      >
        {/* Intro */}
        <p
          style={{
            fontSize: "1.5vw",
            fontWeight: 400,
            color: "#5C6B89",
            margin: 0,
            lineHeight: 1.5,
            maxWidth: "70vw",
            textWrap: "pretty",
          }}
        >
          Every assessment generates a board-ready or regulator-ready report — frozen to the assessment snapshot, AI-drafted, citation-backed, and finalized to a read-only record.
        </p>

        {/* Three format cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2vw" }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0.5vw",
              borderTop: "0.4vw solid #1C2541",
              padding: "2.5vh 2vw",
              boxShadow: "0 0.2vh 1vh rgba(28,37,65,0.07)",
              display: "flex",
              flexDirection: "column",
              gap: "1vh",
            }}
          >
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Format</div>
            <div style={{ fontSize: "1.6vw", fontWeight: 700, color: "#1C2541" }}>Executive Briefing</div>
            <div style={{ fontSize: "0.95vw", color: "#5C6B89", lineHeight: 1.55 }}>Concise board update — posture grade, key findings, top risks, and decisions requested. Audience-adapted for board vs. regulator.</div>
          </div>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0.5vw",
              borderTop: "0.4vw solid #5C6B89",
              padding: "2.5vh 2vw",
              boxShadow: "0 0.2vh 1vh rgba(28,37,65,0.07)",
              display: "flex",
              flexDirection: "column",
              gap: "1vh",
            }}
          >
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Format</div>
            <div style={{ fontSize: "1.6vw", fontWeight: 700, color: "#1C2541" }}>Full Compliance Report</div>
            <div style={{ fontSize: "0.95vw", color: "#5C6B89", lineHeight: 1.55 }}>Complete evidence register, requirement-by-requirement status, gap analysis, and incident detail with Art 14 track status.</div>
          </div>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0.5vw",
              borderTop: "0.4vw solid #F97316",
              padding: "2.5vh 2vw",
              boxShadow: "0 0.2vh 1vh rgba(28,37,65,0.07)",
              display: "flex",
              flexDirection: "column",
              gap: "1vh",
            }}
          >
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Format</div>
            <div style={{ fontSize: "1.6vw", fontWeight: 700, color: "#1C2541" }}>Regulatory Readout</div>
            <div style={{ fontSize: "0.95vw", color: "#5C6B89", lineHeight: 1.55 }}>Regulator-facing summary with compliance position, standards applied, open incidents, and corrective measures — citation-numbered throughout.</div>
          </div>
        </div>

        {/* Feature table */}
        <div style={{ display: "flex", flexDirection: "column", borderTop: "0.2vh solid #1C2541" }}>
          <div style={{ display: "flex", padding: "1.2vh 0", borderBottom: "0.1vh solid #E0E0E0" }}>
            <div style={{ width: "28vw", fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>Frozen data snapshot</div>
            <div style={{ flex: 1, fontSize: "0.95vw", color: "#5C6B89" }}>Assessment state is locked at creation — reports never drift after review or sign-off</div>
          </div>
          <div style={{ display: "flex", padding: "1.2vh 0", borderBottom: "0.1vh solid #E0E0E0" }}>
            <div style={{ width: "28vw", fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>AI-drafted prose, editable</div>
            <div style={{ flex: 1, fontSize: "0.95vw", color: "#5C6B89" }}>Every narrative section is AI-generated from the snapshot, citation-validated, and editable or regenerable before finalizing</div>
          </div>
          <div style={{ display: "flex", padding: "1.2vh 0", borderBottom: "0.1vh solid #E0E0E0" }}>
            <div style={{ width: "28vw", fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>Portfolio rollup</div>
            <div style={{ flex: 1, fontSize: "0.95vw", color: "#5C6B89" }}>Cross-product portfolio report with aggregated KPIs, risk horizon, and nearest statutory deadlines</div>
          </div>
          <div style={{ display: "flex", padding: "1.2vh 0" }}>
            <div style={{ width: "28vw", fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>Print-ready HTML export</div>
            <div style={{ flex: 1, fontSize: "0.95vw", color: "#5C6B89" }}>Server-side SVG charts, numbered citation registry, finalize-to-lock lifecycle — ready for audit or board pack</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: "7vh",
          padding: "0 8vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "0.1vh solid #E0E0E0",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.8vw",
          color: "#888888",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        <span>OXOT Conformity</span>
        <span>05</span>
      </div>
    </div>
  );
}
