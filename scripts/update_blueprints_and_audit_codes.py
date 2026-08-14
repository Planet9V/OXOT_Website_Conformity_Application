#!/usr/bin/env python3
"""
update_blueprints_and_audit_codes.py
Replaces EP_01..EP_50 references with canonical EP_S.EE codes across blueprints and audit files.
"""

import os
import re

DOCS_CRA = "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/cra_podcast"

SERIES_MAP = {
    1: {"name": "The Procurement & Contracting Crisis", "range": (1, 6)},
    2: {"name": "The System Integrator & EPC Shield", "range": (7, 13)},
    3: {"name": "Brownfield OT, Spare Parts & Maintenance", "range": (14, 19)},
    4: {"name": "Tier-2 Upstream Component Supplier Survival", "range": (20, 25)},
    5: {"name": "Critical Sector Deep Dives", "range": (26, 33)},
    6: {"name": "Vulnerability Operations, PSIRT & 24h Clocks", "range": (34, 39)},
    7: {"name": "Conformity Assessment, Audits & CE Marking", "range": (40, 45)},
    8: {"name": "Executive Liability, Penalties & Future Evolution", "range": (46, 50)},
}

def get_code(global_num):
    for s_id, s_info in SERIES_MAP.items():
        start, end = s_info["range"]
        if start <= global_num <= end:
            s_ep_num = global_num - start + 1
            return f"EP_{s_id}.{s_ep_num:02d}"
    return f"EP_1.{global_num:02d}"

# Update 02-CRA-MARKET-UNCERTAINTY-INDEX-AND-50-EPISODE-BLUEPRINTS.md
bp_file = os.path.join(DOCS_CRA, "02-CRA-MARKET-UNCERTAINTY-INDEX-AND-50-EPISODE-BLUEPRINTS.md")
if os.path.exists(bp_file):
    with open(bp_file, "r") as f:
        content = f.read()

    for g_num in range(1, 51):
        old_pattern = f"EP_{g_num:02d}"
        new_code = get_code(g_num)
        content = content.replace(f"Episode {g_num:02d}", f"{new_code} (Episode {g_num:02d})")
        content = content.replace(f"EP_{g_num:02d}:", f"{new_code}:")
        content = content.replace(f"EP_{g_num:02d}_", f"{new_code}_")
        content = content.replace(f"[EP {g_num:02d}]", f"[{new_code}]")
        content = content.replace(f"[EP_{g_num:02d}]", f"[{new_code}]")

    with open(bp_file, "w") as f:
        f.write(content)
    print("Updated 02-CRA-MARKET-UNCERTAINTY-INDEX-AND-50-EPISODE-BLUEPRINTS.md.")

# Update 03-CRA-50-EPISODES-QUALITY-AUDIT-AND-EXPERT-RATINGS.md
audit_file = os.path.join(DOCS_CRA, "03-CRA-50-EPISODES-QUALITY-AUDIT-AND-EXPERT-RATINGS.md")
if os.path.exists(audit_file):
    with open(audit_file, "r") as f:
        content = f.read()

    for g_num in range(1, 51):
        new_code = get_code(g_num)
        content = re.sub(rf"EP {g_num:02d}:", f"{new_code}:", content)
        content = re.sub(rf"EP_{g_num:02d}_", f"{new_code}_", content)
        content = re.sub(rf"EP {g_num:02d} \(", f"{new_code} (", content)

    with open(audit_file, "w") as f:
        f.write(content)
    print("Updated 03-CRA-50-EPISODES-QUALITY-AUDIT-AND-EXPERT-RATINGS.md.")
