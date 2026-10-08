#!/bin/bash
# 取得 tools/vroid_build.py 需要的 VRoid β 版 CC0 樣本模型（原始檔約 15–20 MB／個，不放進 repo）。
# 來源：github.com/madjin/vrm-samples（vroid/beta/）。授權：CC0（VRoid 官方說明；各檔 VRM meta licenseName=CC0）。
set -e
cd "$(dirname "$0")"
mkdir -p vroid_src
tmp=$(mktemp -d)
git clone --depth 1 --filter=blob:none --no-checkout https://github.com/madjin/vrm-samples "$tmp/vrm-samples"
cd "$tmp/vrm-samples"
for f in HairSample_Male HairSample_Female Sakurada_Fumiriya Sendagaya_Shibu Sendagaya_Shino Victoria_Rubin Vivi Vita Darkness_Shibu; do
  git checkout HEAD -- "vroid/beta/$f.vrm"
  cp "vroid/beta/$f.vrm" "$OLDPWD/vroid_src/"
done
cd - >/dev/null; rm -rf "$tmp"
ls -la vroid_src
