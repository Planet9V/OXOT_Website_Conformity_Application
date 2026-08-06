const base = import.meta.env.BASE_URL;

export default function Slide4Numbers() {
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
          Live Coverage — Portfolio View
        </h2>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", opacity: 0.65 }}>
          OXOT CONFORMITY — 04
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          padding: "4.5vh 8vw 3vh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "row",
          gap: "5vw",
          alignItems: "stretch",
        }}
      >
        {/* Left: KPI tiles + regulation list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "3vh",
            width: "34vw",
            flexShrink: 0,
          }}
        >
          {/* Four stat tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5vh 1.5vw",
            }}
          >
            <div style={{ backgroundColor: "#1C2541", borderRadius: "0.5vw", padding: "2.5vh 2vw" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75vw", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8vh" }}>Regulations</div>
              <div style={{ fontSize: "3.5vw", fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>11</div>
              <div style={{ fontSize: "0.85vw", color: "rgba(255,255,255,0.6)", marginTop: "0.5vh" }}>active frameworks</div>
            </div>
            <div style={{ backgroundColor: "#FFFFFF", border: "0.15vh solid #E0E0E0", borderRadius: "0.5vw", padding: "2.5vh 2vw", boxShadow: "0 0.2vh 0.8vh rgba(28,37,65,0.06)" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8vh" }}>Requirements</div>
              <div style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1C2541", lineHeight: 1 }}>89</div>
              <div style={{ fontSize: "0.85vw", color: "#5C6B89", marginTop: "0.5vh" }}>mapped obligations</div>
            </div>
            <div style={{ backgroundColor: "#FFFFFF", border: "0.15vh solid #E0E0E0", borderRadius: "0.5vw", padding: "2.5vh 2vw", boxShadow: "0 0.2vh 0.8vh rgba(28,37,65,0.06)" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75vw", color: "#888888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8vh" }}>Themes</div>
              <div style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1C2541", lineHeight: 1 }}>15</div>
              <div style={{ fontSize: "0.85vw", color: "#5C6B89", marginTop: "0.5vh" }}>cross-reg clusters</div>
            </div>
            <div style={{ backgroundColor: "#F97316", borderRadius: "0.5vw", padding: "2.5vh 2vw" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75vw", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8vh" }}>Mappings</div>
              <div style={{ fontSize: "3.5vw", fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>72</div>
              <div style={{ fontSize: "0.85vw", color: "rgba(255,255,255,0.8)", marginTop: "0.5vh" }}>shared obligations</div>
            </div>
          </div>

          {/* Regulation volume list */}
          <div style={{ display: "flex", flexDirection: "column", borderTop: "0.2vh solid #1C2541" }}>
            <div style={{ display: "flex", padding: "1.2vh 0", borderBottom: "0.1vh solid #E0E0E0", alignItems: "center" }}>
              <div style={{ flex: 1, fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>Cyber Resilience Act (CRA)</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89" }}>30 reqs</div>
            </div>
            <div style={{ display: "flex", padding: "1.2vh 0", borderBottom: "0.1vh solid #E0E0E0", alignItems: "center" }}>
              <div style={{ flex: 1, fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>IEC 62443 Series</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89" }}>27 reqs</div>
            </div>
            <div style={{ display: "flex", padding: "1.2vh 0", borderBottom: "0.1vh solid #E0E0E0", alignItems: "center" }}>
              <div style={{ flex: 1, fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>EU AI Act</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89" }}>12 reqs</div>
            </div>
            <div style={{ display: "flex", padding: "1.2vh 0", borderBottom: "0.1vh solid #E0E0E0", alignItems: "center" }}>
              <div style={{ flex: 1, fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>NIS2 Directive</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89" }}>12 reqs</div>
            </div>
            <div style={{ display: "flex", padding: "1.2vh 0", alignItems: "center" }}>
              <div style={{ flex: 1, fontSize: "1vw", fontWeight: 600, color: "#1C2541" }}>Machinery Regulation</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.85vw", color: "#5C6B89" }}>8 reqs</div>
            </div>
          </div>
        </div>

        {/* Right: dashboard screenshot */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1.5vh",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.8vw",
              color: "#888888",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Portfolio overview — live workbench
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: "0.6vw",
              overflow: "hidden",
              border: "0.15vh solid #E0E0E0",
              boxShadow: "0 0.4vh 2.5vh rgba(28,37,65,0.12)",
            }}
          >
            <img
              src={`${base}screen-dashboard.jpg`}
              crossOrigin="anonymous"
              alt="OXOT Conformity portfolio dashboard"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top left",
                display: "block",
              }}
            />
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
        <span>04</span>
      </div>
    </div>
  );
}
