export default function Slide2Challenge() {
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
          The Regulatory Pressure
        </h2>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", opacity: 0.65 }}>
          OXOT CONFORMITY — 02
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          padding: "5vh 8vw 4vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "3.5vh",
        }}
      >
        {/* Intro line */}
        <p
          style={{
            fontSize: "1.55vw",
            fontWeight: 400,
            color: "#5C6B89",
            margin: 0,
            lineHeight: 1.5,
            maxWidth: "72vw",
            textWrap: "pretty",
          }}
        >
          Manufacturers of products with digital elements face four major EU frameworks landing simultaneously — with overlapping obligations, shared technical themes, and hard statutory deadlines.
        </p>

        {/* Four regulation cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "2vw",
            flex: 1,
          }}
        >
          {/* CRA */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0.5vw",
              borderLeft: "0.4vw solid #1C2541",
              padding: "3vh 2vw",
              display: "flex",
              flexDirection: "column",
              gap: "1.5vh",
              boxShadow: "0 0.2vh 1.2vh rgba(28,37,65,0.07)",
            }}
          >
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em" }}>CRA</div>
            <div style={{ fontSize: "1.9vw", fontWeight: 800, color: "#1C2541", lineHeight: 1.1 }}>Cyber Resilience Act</div>
            <div style={{ fontSize: "1vw", color: "#5C6B89", lineHeight: 1.5, flex: 1 }}>Security-by-design, vulnerability handling, Art 13 notification gaps, Art 14 incident reporting tracks with 24h / 72h deadlines.</div>
            <div style={{ borderTop: "0.1vh solid #E0E0E0", paddingTop: "1.5vh", fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#1C2541", fontWeight: 600 }}>30 requirements</div>
          </div>

          {/* AI Act */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0.5vw",
              borderLeft: "0.4vw solid #5C6B89",
              padding: "3vh 2vw",
              display: "flex",
              flexDirection: "column",
              gap: "1.5vh",
              boxShadow: "0 0.2vh 1.2vh rgba(28,37,65,0.07)",
            }}
          >
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Act</div>
            <div style={{ fontSize: "1.9vw", fontWeight: 800, color: "#1C2541", lineHeight: 1.1 }}>EU Artificial Intelligence Act</div>
            <div style={{ fontSize: "1vw", color: "#5C6B89", lineHeight: 1.5, flex: 1 }}>Risk classification, transparency obligations, human oversight requirements, and conformity assessment for high-risk AI systems.</div>
            <div style={{ borderTop: "0.1vh solid #E0E0E0", paddingTop: "1.5vh", fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89", fontWeight: 600 }}>12 requirements</div>
          </div>

          {/* NIS2 */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0.5vw",
              borderLeft: "0.4vw solid #A0AABF",
              padding: "3vh 2vw",
              display: "flex",
              flexDirection: "column",
              gap: "1.5vh",
              boxShadow: "0 0.2vh 1.2vh rgba(28,37,65,0.07)",
            }}
          >
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em" }}>NIS2</div>
            <div style={{ fontSize: "1.9vw", fontWeight: 800, color: "#1C2541", lineHeight: 1.1 }}>Network & Information Security</div>
            <div style={{ fontSize: "1vw", color: "#5C6B89", lineHeight: 1.5, flex: 1 }}>Incident reporting obligations, supply-chain security measures, and governance requirements for essential and important entities.</div>
            <div style={{ borderTop: "0.1vh solid #E0E0E0", paddingTop: "1.5vh", fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#A0AABF", fontWeight: 600 }}>12 requirements</div>
          </div>

          {/* Machinery */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0.5vw",
              borderLeft: "0.4vw solid #F97316",
              padding: "3vh 2vw",
              display: "flex",
              flexDirection: "column",
              gap: "1.5vh",
              boxShadow: "0 0.2vh 1.2vh rgba(28,37,65,0.07)",
            }}
          >
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em" }}>Machinery</div>
            <div style={{ fontSize: "1.9vw", fontWeight: 800, color: "#1C2541", lineHeight: 1.1 }}>Machinery Regulation</div>
            <div style={{ fontSize: "1vw", color: "#5C6B89", lineHeight: 1.5, flex: 1 }}>Essential health and safety requirements for machinery with embedded software, including cybersecurity provisions under Annex I.</div>
            <div style={{ borderTop: "0.1vh solid #E0E0E0", paddingTop: "1.5vh", fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#F97316", fontWeight: 600 }}>8 requirements</div>
          </div>
        </div>

        {/* Also tracked */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2vw",
            paddingTop: "0.5vh",
          }}
        >
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>Also tracked:</div>
          <div style={{ display: "flex", gap: "1.5vw", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89", backgroundColor: "#EAECF0", padding: "0.4vh 0.8vw", borderRadius: "0.3vw" }}>IEC 62443</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89", backgroundColor: "#EAECF0", padding: "0.4vh 0.8vw", borderRadius: "0.3vw" }}>EN 18031</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89", backgroundColor: "#EAECF0", padding: "0.4vh 0.8vw", borderRadius: "0.3vw" }}>GDPR</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89", backgroundColor: "#EAECF0", padding: "0.4vh 0.8vw", borderRadius: "0.3vw" }}>Radio Equipment Directive</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89", backgroundColor: "#EAECF0", padding: "0.4vh 0.8vw", borderRadius: "0.3vw" }}>IEC 62368-1</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89", backgroundColor: "#EAECF0", padding: "0.4vh 0.8vw", borderRadius: "0.3vw" }}>ISO/IEC 27001</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89", backgroundColor: "#EAECF0", padding: "0.4vh 0.8vw", borderRadius: "0.3vw" }}>+ 4 more</span>
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
        <span>02</span>
      </div>
    </div>
  );
}
