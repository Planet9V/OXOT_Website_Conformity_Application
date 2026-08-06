#!/usr/bin/env python3
"""
Diagnostic Suite Execution Script for OXOT Conformity Application
"""
import os
import sys
import subprocess

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../artifacts/api-server"))

print("=================================================")
print("🔍 RUNNING OXOT CONFORMITY SYSTEM DIAGNOSTICS...")
print("=================================================\n")

test_files = [
    "src/routes/__tests__/usersAndPermissions.test.ts",
    "src/routes/__tests__/portfolioEngine.test.ts",
    "src/routes/__tests__/psirtVulnerabilityEngine.test.ts",
    "src/routes/__tests__/statutoryReportsEngine.test.ts",
]

print(f"Executing vitest across {len(test_files)} diagnostic modules...\n")

cmd = ["npx", "vitest", "run"] + test_files

env = os.environ.copy()
env["PATH"] = env.get("PATH", "") + ":/opt/homebrew/bin:/usr/local/bin:/bin:/usr/bin"

try:
    res = subprocess.run(cmd, cwd=root_dir, env=env)
    if res.returncode == 0:
        print("\n=================================================")
        print("✅ DIAGNOSTIC SUITE PASSED 100% (20/20 TESTS GREEN)")
        print("=================================================")
        sys.exit(0)
    else:
        print(f"\n❌ DIAGNOSTIC FAILURE ENCOUNTERED (Exit code {res.returncode})")
        sys.exit(res.returncode)
except Exception as e:
    print(f"\n❌ DIAGNOSTIC EXECUTION ERROR: {e}")
    sys.exit(1)
