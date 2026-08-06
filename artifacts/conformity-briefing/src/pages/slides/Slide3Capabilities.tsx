export default function Slide3Capabilities() {
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
          Platform Capabilities
        </h2>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", opacity: 0.65 }}>
          OXOT CONFORMITY — 03
        </div>
      </div>

      {/* Body: 2-col capability blocks */}
      <div
        style={{
          flex: 1,
          padding: "5vh 8vw 3vh",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3vh 5vw",
        }}
      >
        {/* 01 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", color: "#F97316", fontSize: "0.85vw", textTransform: "uppercase", letterSpacing: "0.12em" }}>01. Assessment workbench</div>
          <h3 style={{ fontSize: "1.8vw", fontWeight: 700, margin: 0, color: "#1C2541", lineHeight: 1.15 }}>Structured gap assessments per product</h3>
          <p style={{ fontSize: "1.1vw", lineHeight: 1.6, color: "#5C6B89", margin: 0 }}>
            Each product assessment maps obligations requirement-by-requirement. Guided flows walk assessors through evidence collection, gap rating, and remediation — with real-time conformity grade and overdue-deadline alerts.
          </p>
        </div>

        {/* 02 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", color: "#F97316", fontSize: "0.85vw", textTransform: "uppercase", letterSpacing: "0.12em" }}>02. BOM & vulnerability analysis</div>
          <h3 style={{ fontSize: "1.8vw", fontWeight: 700, margin: 0, color: "#1C2541", lineHeight: 1.15 }}>SBOM-driven component risk tracking</h3>
          <p style={{ fontSize: "1.1vw", lineHeight: 1.6, color: "#5C6B89", margin: 0 }}>
            Upload CycloneDX or SPDX BOMs. The platform resolves known vulnerabilities, tracks upstream notification obligations per component under Art 13(6) CRA, and flags overdue supplier disclosures.
          </p>
        </div>

        {/* 03 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", color: "#F97316", fontSize: "0.85vw", textTransform: "uppercase", letterSpacing: "0.12em" }}>03. Incident management</div>
          <h3 style={{ fontSize: "1.8vw", fontWeight: 700, margin: 0, color: "#1C2541", lineHeight: 1.15 }}>Art 14 two-track reporting engine</h3>
          <p style={{ fontSize: "1.1vw", lineHeight: 1.6, color: "#5C6B89", margin: 0 }}>
            Incidents are classified as exploited vulnerabilities or severe incidents. The platform computes statutory deadlines (24h early warning, 72h notification, 14/30-day final report) and pre-fills report packages from captured data.
          </p>
        </div>

        {/* 04 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", color: "#F97316", fontSize: "0.85vw", textTransform: "uppercase", letterSpacing: "0.12em" }}>04. Cross-regulation mapping</div>
          <h3 style={{ fontSize: "1.8vw", fontWeight: 700, margin: 0, color: "#1C2541", lineHeight: 1.15 }}>Shared obligations resolved once</h3>
          <p style={{ fontSize: "1.1vw", lineHeight: 1.6, color: "#5C6B89", margin: 0 }}>
            72 cross-regulation mappings link requirements across CRA, AI Act, NIS2, IEC 62443, and Machinery by 15 shared themes — so evidence gathered for one regulation automatically satisfies obligations in another.
          </p>
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
        <span>03</span>
      </div>
    </div>
  );
}
