#!/bin/bash
RESULTS_FILE="skill_test_results.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "{" > "$RESULTS_FILE"
echo "  \"timestamp\": \"$TIMESTAMP\"," >> "$RESULTS_FILE"
echo "  \"total_skills\": 0," >> "$RESULTS_FILE"
echo "  \"passed\": 0," >> "$RESULTS_FILE"
echo "  \"failed\": 0," >> "$RESULTS_FILE"
echo "  \"skills\": [" >> "$RESULTS_FILE"

SKILLS=(
  "apple-notes"
  "apple-reminders"
  "himalaya"
  "imsg"
  "github"
  "discord"
  "slack"
  "trello"
  "notion"
  "obsidian"
  "gemini"
  "weather"
  "spotify-player"
  "voice-call"
  "web-search"
  "goplaces"
  "bear-notes"
  "bird"
  "camsnap"
  "canvas"
  "coding-agent"
  "eightctl"
  "food-order"
  "gog"
  "local-places"
  "summarize"
  "tmux"
  "things-mac"
  "bitwarden"
  "1password"
  "blucli"
  "bluebubbles"
  "mcporter"
  "nano-pdf"
  "video-frames"
  "wacli"
  "blogwatcher"
  "openhue"
  "oracle"
  "remotion"
  "sherpa-onnx-tts"
  "skill-creator"
  "ordercli"
  "peekaboo"
)

TOTAL=0
PASSED=0
FAILED=0


# Capture 'skills check' output which lists Ready vs Missing skills
./alize.mjs skills check > /tmp/skills_check_output.txt 2>&1

# Helper to check if skill is ready
check_skill_status() {
    local skill_name=$1
    # Check if inside "Ready to use" block (before "Missing requirements")
    # We use sed to extract the Ready block
    sed -n '/Ready to use:/,/Missing requirements:/p' /tmp/skills_check_output.txt | grep -q " $skill_name"
    return $?
}

check_skill_missing() {
    local skill_name=$1
    # Check if listed in "Missing requirements"
    sed -n '/Missing requirements:/,$p' /tmp/skills_check_output.txt | grep -q " $skill_name"
    return $?
}

for skill in "${SKILLS[@]}"; do
  TOTAL=$((TOTAL + 1))
  
  if check_skill_status "$skill"; then
      echo "✅ $skill: PASS"
      PASSED=$((PASSED + 1))
      STATUS="pass"
  elif check_skill_missing "$skill"; then
      echo "⚠️ $skill: FAIL (Missing requirements)"
      FAILED=$((FAILED + 1))
      STATUS="fail_reqs"
  else
      echo "❌ $skill: FAIL (Not listed)"
      FAILED=$((FAILED + 1))
      STATUS="fail_list"
  fi
  
  if [ $TOTAL -gt 1 ]; then
    echo "    }," >> "$RESULTS_FILE"
  fi
  echo "    {" >> "$RESULTS_FILE"
  echo "      \"name\": \"$skill\"," >> "$RESULTS_FILE"
  echo "      \"status\": \"$STATUS\"" >> "$RESULTS_FILE"
done

echo "    }" >> "$RESULTS_FILE"
echo "  ]," >> "$RESULTS_FILE"
echo "  \"summary\": {" >> "$RESULTS_FILE"
echo "    \"total\": $TOTAL," >> "$RESULTS_FILE"
echo "    \"passed\": $PASSED," >> "$RESULTS_FILE"
echo "    \"failed\": $FAILED," >> "$RESULTS_FILE"
echo "    \"pass_rate\": \"$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)%\"" >> "$RESULTS_FILE"
echo "  }" >> "$RESULTS_FILE"
echo "}" >> "$RESULTS_FILE"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "RÉSULTATS: $PASSED/$TOTAL skills OK ($(echo "scale=1; $PASSED * 100 / $TOTAL" | bc)%)"
echo "═══════════════════════════════════════════════════════"

cat "$RESULTS_FILE"
