#!/bin/zsh
# Weekly local lifecycle check (task 19.3) — runs the same guard CI runs
# (scripts/check_lifecycle.mjs: every Corrected/Modified/Repealed-by relation
# on each act's EUR-Lex ALL view must be accounted for in corpus metadata),
# so a change in Brussels surfaces within a week even with no push happening.
#
# Installed as a macOS LaunchAgent by install_lifecycle_launchagent.sh.
# Logs to ~/Library/Logs/oxot-lifecycle.log; posts a user notification on
# failure. NOTE: the LaunchAgent pins the repo path — re-run the installer
# after moving the repository.
set -u
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LOG="$HOME/Library/Logs/oxot-lifecycle.log"

{
  echo "===== $(date '+%Y-%m-%d %H:%M:%S %z') lifecycle check ($REPO_DIR)"
  cd "$REPO_DIR" || exit 1
  node scripts/check_lifecycle.mjs
  rc=$?
  echo "exit=$rc"
  if [ $rc -ne 0 ]; then
    osascript -e 'display notification "check_lifecycle.mjs FAILED — an act may have moved. See ~/Library/Logs/oxot-lifecycle.log" with title "OXOT lifecycle guard"' || true
  fi
  exit $rc
} >> "$LOG" 2>&1
