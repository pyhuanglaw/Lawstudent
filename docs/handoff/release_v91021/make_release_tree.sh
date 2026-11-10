#!/bin/bash
# 用法：make_release_tree.sh <候選 commit> <版本> <日期 YYYY-MM-DD> [開發分支 commit，預設 HEAD]
# 只用 plumbing（暫時的 index），不動工作目錄：發布樹＝開發分支的樹，但 src／tests／assets／index.html、劇情匯入白名單換成候選的，index.html 加版本字樣。
# 印出發布樹 commit（父＝開發分支 commit）和「換回開發的遊戲檔案」commit（父＝發布樹、樹＝開發分支）。不 push。
set -euo pipefail
RC=$1; VER=$2; DAY=$3; R=/home/user/Lawstudent; cd $R
D=$(git rev-parse ${4:-HEAD}); RCF=$(git rev-parse $RC)
IDX=$(mktemp); export GIT_INDEX_FILE=$IDX
git read-tree $D
git rm --cached -r -q src tests assets index.html docs/handoff/story_import_allow.json
for p in src tests assets; do git read-tree --prefix=$p/ $RCF:$p; done
OLD=$(git show $RCF:index.html | grep -o '?v=[0-9.]*' | sort -u)
[ "$(echo "$OLD" | wc -l)" = 1 ] || { echo "候選的 index.html 版本字樣不只一種：$OLD"; exit 1; }
OV=${OLD#?v=}
TMP=$(mktemp)
git show $RCF:index.html | sed "s/?v=${OV//./\\.}/?v=$VER/g; s/版本 v[0-9.]*（[0-9-]*）/版本 v$VER（$DAY）/" > $TMP
N1=$(grep -c '<script src=' $TMP); N2=$(grep -c "?v=$VER\"" $TMP); grep -q "版本 v$VER（$DAY）" $TMP || { echo "標題版本字樣沒換到"; exit 1; }
[ "$N1" = "$N2" ] || { echo "script $N1 個、?v=$VER $N2 個，不一樣"; exit 1; }
B=$(git hash-object -w $TMP); git update-index --add --cacheinfo 100644,$B,index.html
B2=$(git rev-parse $RCF:docs/handoff/story_import_allow.json); git update-index --add --cacheinfo 100644,$B2,docs/handoff/story_import_allow.json
T=$(git write-tree); rm -f $IDX $TMP; unset GIT_INDEX_FILE
MSG="v$VER 發布樹：遊戲檔案（src／tests／assets／index.html）＝候選 $(git rev-parse --short=9 $RCF)＋版本字樣（index.html ?v=$VER×$N2、標題「版本 v$VER（$DAY）」），劇情匯入白名單也用候選那一份；其餘照開發分支 $(git rev-parse --short=9 $D)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Me1thu8Zn934H58kWKNfuF"
RT=$(git -c user.name=Claude -c user.email=noreply@anthropic.com commit-tree $T -p $D -m "$MSG")
MSG2="v$VER 發布後：開發分支換回開發的遊戲檔案（樹＝$(git rev-parse --short=9 $D)，發布樹 $(git rev-parse --short=9 $RT) 的父）

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Me1thu8Zn934H58kWKNfuF"
BK=$(git -c user.name=Claude -c user.email=noreply@anthropic.com commit-tree $D^{tree} -p $RT -m "$MSG2")
echo "DEV=$D"; echo "RELEASE_TREE=$RT"; echo "BACK=$BK"
echo "檢查：發布樹和候選的遊戲檔案差異（應該只有 index.html 版本字樣）："; git diff --stat $RCF $RT -- src tests assets index.html docs/handoff/story_import_allow.json | tail -3
