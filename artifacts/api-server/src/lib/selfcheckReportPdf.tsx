import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReportPayload } from "./selfcheckReportPayload";

/**
 * The downloadable artifact of the 2-minute check — the same verdict the
 * visitor already saw on screen, as a document they can forward.
 *
 * Design follows the product collateral: navy ink, orange rules, Times for
 * display (react-pdf ships Times/Helvetica; no font files to deploy), table
 * rows for the facts. Deliberately one page: this is the *summary* they earned,
 * not the Annex VII technical file — that is what the engagement produces.
 */

const NAVY = "#12192a";
const ORANGE = "#e8700a";
const MUTED = "#5b6472";
const LINE = "#d8d3c8";

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 52, fontFamily: "Helvetica", fontSize: 10, color: NAVY },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  wordmark: { fontFamily: "Helvetica-Bold", fontSize: 12, letterSpacing: 3 },
  brandTag: { fontSize: 7.5, letterSpacing: 2, color: ORANGE },
  topRule: { height: 2, backgroundColor: NAVY, marginBottom: 22 },
  kicker: { fontSize: 8, letterSpacing: 2.4, color: ORANGE, marginBottom: 8, textTransform: "uppercase" },
  h1: { fontFamily: "Times-Bold", fontSize: 24, marginBottom: 4 },
  orangeRule: { width: 40, height: 3, backgroundColor: ORANGE, marginTop: 6, marginBottom: 14 },
  lede: { fontSize: 10.5, lineHeight: 1.5, color: MUTED, marginBottom: 18 },
  section: { fontSize: 8, letterSpacing: 2, color: NAVY, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6, textTransform: "uppercase" },
  sectionRule: { height: 1, backgroundColor: NAVY, marginBottom: 8 },
  row: { flexDirection: "row", borderBottomWidth: 0.75, borderBottomColor: LINE, paddingVertical: 6 },
  k: { width: 130, color: MUTED, fontSize: 9 },
  v: { flex: 1, fontSize: 9.5, lineHeight: 1.45 },
  vBold: { flex: 1, fontSize: 9.5, fontFamily: "Helvetica-Bold" },
  gapTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.5, marginBottom: 1.5 },
  gapBody: { fontSize: 9, lineHeight: 1.45, color: MUTED },
  gapItem: { marginBottom: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: ORANGE },
  next: { marginTop: 18, backgroundColor: "#f6f4ef", borderLeftWidth: 3, borderLeftColor: ORANGE, padding: 12 },
  nextH: { fontFamily: "Times-Bold", fontSize: 13, marginBottom: 4 },
  nextB: { fontSize: 9, lineHeight: 1.5, color: MUTED },
  footer: { position: "absolute", bottom: 28, left: 52, right: 52, borderTopWidth: 0.75, borderTopColor: LINE, paddingTop: 8, flexDirection: "row", justifyContent: "space-between" },
  footText: { fontSize: 7.5, color: MUTED }
});

const L = {
  en: {
    kicker: "CRA readiness — indicative result",
    title: "Your 2-minute check result",
    lede: (name: string, company: string | null) =>
      `Prepared for ${name}${company ? ` · ${company}` : ""}. The same verdict shown on screen, as a document you can keep and forward.`,
    facts: "Result",
    classification: "Indicative classification",
    readiness: "Readiness score",
    band: "Band",
    fineRisk: "Fine exposure (Art 61)",
    fineRiskText: "Up to €15,000,000 or 2.5% of global annual turnover for Annex I essential requirement non-compliance.",
    gaps: "Your gaps",
    noGaps: "No specific gaps were flagged by your answers.",
    next: "What happens next",
    nextBody:
      "This is an orientation, not the technical file. The route from here: a 45-minute walkthrough covering your classification, the evidence you already hold, and what a defensible Annex VII technical file looks like for your products — hand in hand with the three-phase CRA Readiness engagement and the CRA Conformance Application. Book at oxot.nl/en/contact.",
    disclaimer: "Indicative orientation based on Regulation (EU) 2024/2847 — not legal advice.",
    generated: (d: string) => `Generated ${d} · oxot.nl`
  },
  nl: {
    kicker: "CRA-gereedheid — indicatief resultaat",
    title: "Uw resultaat van de 2-minutencheck",
    lede: (name: string, company: string | null) =>
      `Opgesteld voor ${name}${company ? ` · ${company}` : ""}. Hetzelfde oordeel als op het scherm, als document om te bewaren en door te sturen.`,
    facts: "Resultaat",
    classification: "Indicatieve classificatie",
    readiness: "Gereedheidsscore",
    band: "Band",
    fineRisk: "Boeterisico (Art 61)",
    fineRiskText: "Tot € 15.000.000 of 2,5% van de wereldwijde jaaromzet bij niet-naleving van essentiële eisen (Bijlage I).",
    gaps: "Uw hiaten",
    noGaps: "Uw antwoorden brachten geen specifieke hiaten aan het licht.",
    next: "Wat er nu gebeurt",
    nextBody:
      "Dit is een oriëntatie, niet het technisch dossier. De route vanaf hier: een walkthrough van 45 minuten over uw classificatie, het bewijs dat u al heeft, en hoe een verdedigbaar technisch dossier (bijlage VII) er voor uw producten uitziet — hand in hand met het driefasen CRA Readiness-traject en de CRA Conformance Application. Boek via oxot.nl/nl/contact.",
    disclaimer: "Indicatieve oriëntatie op basis van Verordening (EU) 2024/2847 — geen juridisch advies.",
    generated: (d: string) => `Gegenereerd ${d} · oxot.nl`
  }
} as const;

export function SelfCheckReport({ data, generatedAt }: { data: ReportPayload; generatedAt: string }) {
  const t = L[data.locale];
  return (
    <Document title={`OXOT — ${t.title}`} author="OXOT" creator="oxot.nl">
      <Page size="A4" style={s.page}>
        <View style={s.brandRow}>
          <Text style={s.wordmark}>O X O T</Text>
          <Text style={s.brandTag}>CRA READINESS</Text>
        </View>
        <View style={s.topRule} />

        <Text style={s.kicker}>{t.kicker}</Text>
        <Text style={s.h1}>{t.title}</Text>
        <View style={s.orangeRule} />
        <Text style={s.lede}>{t.lede(data.name, data.company)}</Text>

        <Text style={s.section}>{t.facts}</Text>
        <View style={s.sectionRule} />
        <View style={s.row}>
          <Text style={s.k}>{t.classification}</Text>
          <Text style={s.vBold}>{data.resultTitle}</Text>
        </View>
        {data.resultBody ? (
          <View style={s.row}>
            <Text style={s.k}> </Text>
            <Text style={s.v}>{data.resultBody}</Text>
          </View>
        ) : null}
        <View style={s.row}>
          <Text style={s.k}>{t.readiness}</Text>
          <Text style={s.vBold}>{data.score} / 100</Text>
        </View>
        {data.bandLabel ? (
          <View style={s.row}>
            <Text style={s.k}>{t.band}</Text>
            <Text style={s.v}>{data.bandLabel}</Text>
          </View>
        ) : null}
        <View style={s.row}>
          <Text style={s.k}>{t.fineRisk}</Text>
          <Text style={s.v}>{t.fineRiskText}</Text>
        </View>

        <Text style={s.section}>{t.gaps}</Text>
        <View style={s.sectionRule} />
        {data.gaps.length === 0 ? (
          <Text style={s.gapBody}>{t.noGaps}</Text>
        ) : (
          data.gaps.map((g, i) => (
            <View key={i} style={s.gapItem} wrap={false}>
              <Text style={s.gapTitle}>{g.title}</Text>
              {g.body ? <Text style={s.gapBody}>{g.body}</Text> : null}
            </View>
          ))
        )}

        <View style={s.next} wrap={false}>
          <Text style={s.nextH}>{t.next}</Text>
          <Text style={s.nextB}>{t.nextBody}</Text>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footText}>{t.disclaimer}</Text>
          <Text style={s.footText}>{t.generated(generatedAt)}</Text>
        </View>
      </Page>
    </Document>
  );
}
