#!/bin/zsh
# Installs (or reinstalls) the weekly lifecycle-check LaunchAgent for the
# CURRENT repo location. Run again after moving the repository.
set -eu
REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
PLIST="$HOME/Library/LaunchAgents/com.oxot.conformity.lifecycle-check.plist"
mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"

cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.oxot.conformity.lifecycle-check</string>
  <key>ProgramArguments</key>
  <array>
    <string>${REPO_DIR}/scripts/ops/run_lifecycle_check.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Weekday</key><integer>1</integer>
    <key>Hour</key><integer>9</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>StandardOutPath</key><string>${HOME}/Library/Logs/oxot-lifecycle.launchd.log</string>
  <key>StandardErrorPath</key><string>${HOME}/Library/Logs/oxot-lifecycle.launchd.log</string>
</dict>
</plist>
PLIST_EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"
echo "Installed: $PLIST (weekly, Monday 09:00, repo: $REPO_DIR)"
echo "Log: ~/Library/Logs/oxot-lifecycle.log"
