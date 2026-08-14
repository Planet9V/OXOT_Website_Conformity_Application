# The CRA Briefing — 5-Part Executive News Stream Catalog

> **Series:** The CRA Briefing (News & Policy Stream)  
> **Presenter:** Jim Mckenney (Digital Product Security Consultant)  
> **Voice:** `Jim Mckenney English` (`fh7rGvh0nJR3MFMkM9yd`)  
> **Format:** 2-Minute Executive News Briefings

---

## 1. Catalog of News Briefing Scripts

| ID | Title | File Path | Focus |
|---|---|---|---|
| **NEWS 01** | *ENISA Single Reporting Platform & September 2026 Countdown* | `docs/cra_podcast/news_briefings/NEWS_01_ENISA_Reporting_Platform_2026.md` | Official Article 16 ENISA reporting platform, 24h early warning, 11 Sept 2026 deadline. |
| **NEWS 02** | *The PSIRT Mandate: Why Every OEM Needs a Product CSIRT Before 2026* | `docs/cra_podcast/news_briefings/NEWS_02_PSIRT_Mandate_for_OEMs.md` | Mandatory PSIRT/CSIRT setup, 24/7 incident response, security.txt, CVSS v4 triage. |
| **NEWS 03** | *Downstream Supply Chain Impact: What Component & Software Providers Must Deliver* | `docs/cra_podcast/news_briefings/NEWS_03_Downstream_Supplier_CRA_Impact.md` | Component/SDK/RTOS supplier obligations, contractual SBOM flow-downs, 24h disclosure SLAs. |
| **NEWS 04** | *CRA meets NIS2: Navigating Dual Incident Reporting Clocks* | `docs/cra_podcast/news_briefings/NEWS_04_CRA_meets_NIS2_Dual_Clocks.md` | Distinguishing entity operational security (NIS2) vs product security (CRA). |
| **NEWS 05** | *Harmonised European Standards: CEN/CENELEC Mandate M/596 Progress* | `docs/cra_podcast/news_briefings/NEWS_05_CEN_CENELEC_Standards_M596.md` | Presumption of conformity under Article 27, ETSI EN 303 645, IEC 62443 alignment. |

---

## 2. Command to Render News Briefings via ElevenLabs

Run the following command in your terminal to render any news briefing with your custom voice (`fh7rGvh0nJR3MFMkM9yd`):

```bash
cd /Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application

export ELEVENLABS_API_KEY=sk_10658a136015dc21fe2250aacd45f7a7305223f16a0afe6e

# Render News Briefing 01 via ElevenLabs
python3 docs/cra_podcast/scripts/elevenlabs_mcp_bridge.py generate_speech \
  --voice_id fh7rGvh0nJR3MFMkM9yd \
  --file docs/cra_podcast/news_briefings/NEWS_01_ENISA_Reporting_Platform_2026.md \
  --output_path docs/cra_podcast/news_briefings/NEWS_01_ENISA_Reporting_Platform_2026_SPOKEN.mp3
```
