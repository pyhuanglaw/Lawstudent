#!/bin/bash
# 發布樹（v9.10.13 起；v9.10.20 以後連 lib 一起換）：開發分支上做一個 commit——遊戲檔案（src／tests／assets／lib／index.html）＝候選 $RC＋版本字樣，劇情匯入白名單也用候選那一份；其餘（docs 等）照開發分支。合進 main 以後下一個 commit 還原開發分支：git checkout <開發分支發布前的 SHA> -- src tests assets lib index.html docs/handoff/story_import_allow.json
# 用法：bash tools/handoff/mk_release_tree.sh <RC sha> <版本 9.10.13> <日期 2026-10-28>
set -e
RC=$1; VER=$2; DAY=$3
cd /home/user/Lawstudent
test -z "$(git status --porcelain)" || { echo "工作目錄不乾淨"; exit 1; }
DEV=$(git rev-parse --short=9 HEAD)
git rm -r -q src tests assets lib index.html
git checkout "$RC" -- src tests assets lib index.html docs/handoff/story_import_allow.json
OLD=$(grep -o '?v=[0-9.]*"' index.html | sort | uniq -c | sort -rn | head -1 | sed 's/.*?v=//; s/"//')
N=$(grep -c "?v=$OLD\"" index.html || true)
sed -i "s/?v=$OLD\"/?v=$VER\"/g" index.html
sed -i "s/版本 v[0-9.]*（[0-9-]*）/版本 v$VER（$DAY）/" index.html
echo "?v=$OLD → $VER（$N 行）；標題：$(grep -o '版本 v[0-9.]*（[0-9-]*）' index.html)"
git add -A src tests assets lib index.html docs/handoff/story_import_allow.json
# README 的版本區塊跟著 index.html 走（版本資訊單一來源，REL-PACKAGING-1111／X340；tests/readme_version_unit.js 會檢查）。失敗只提醒、不擋發布
if [ -f tools/release/sync_version.py ]; then { python3 tools/release/sync_version.py && git add README.md; } || echo "提醒：README.md 的版本區塊沒同步（python3 tools/release/sync_version.py）"; fi
echo "跟候選不同的遊戲檔案（應該只有 index.html）："; git diff --cached --stat "$RC" -- src tests assets lib index.html | tail -3
git diff "$RC" -- src tests assets lib | head -1 | grep -q . && { echo "src／tests／assets 跟候選不一樣"; exit 1; }
git commit -q -m "v$VER 發布樹：遊戲檔案（src／tests／assets／index.html）＝候選 $RC＋版本字樣（index.html ?v=$VER×$N、標題「版本 v$VER（$DAY）」），劇情匯入白名單也用候選那一份；其餘照開發分支 $DEV

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Eds6msqpsuzNEw98sdw8JX"
echo "發布樹 $(git rev-parse --short=9 HEAD)（父＝開發分支 $DEV）"
