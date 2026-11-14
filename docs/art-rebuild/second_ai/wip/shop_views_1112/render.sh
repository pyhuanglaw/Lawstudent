# SHOP-INTERIOR-VIEW-1112：汀州路、公館新店的窗外照片（LAWWW2-C 2026-11-12）。在 repo 根目錄跑：bash docs/art-rebuild/second_ai/wip/shop_views_1112/render.sh 輸出資料夾
# 輸出 1024×512 PNG → 轉 webp 放 assets/models/env/views/<區域>_{day,night}.webp（不鏡像）。鏡頭＝店面玻璃中心、朝街上、水平 90°。
D=docs/art-rebuild/second_ai/wip/shop_views_1112; OUT=${1:?輸出資料夾}; mkdir -p "$OUT"; G=assets/models/env/second_ai
TZ="--glb $G/tingzhou_street.glb,$G/tingzhou_stalls.glb --slabs $D/tz_slabs.json"
# 公館：WINVIEW-AUDIT-1105（11-14）加校門、照遊戲位置種的樹（不然沒有校門圍牆、樹會疊在一起）、捷運出口放回遊戲位置。trees_gg.json 用 wip/gg_street_trees_1114/ggtrees.js 產生
T=docs/art-rebuild/second_ai/wip/gg_street_trees_1114/trees_gg.json
GG="--glb $G/gongguan_shops.glb,$G/gongguan_far.glb --gg-street --place $G/campus_gate.glb@0,0,-46,0 --place $G/gongguan_mrt_exit.glb@-36.6,0,11,1.5708 --trees $T"
shoot(){ n=$1; eye=$2; at=$3; shift 3
  timeout 1500 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --res 1024x512 --lens 18 --samples 40 "$@" --out "$OUT/${n}_day.png" --hour 14 2>&1 | grep -E "^OK|Traceback|Error" | sed "s/^/$n day: /"
  timeout 1500 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --res 1024x512 --lens 18 --samples 40 "$@" --out "$OUT/${n}_night.png" --night --lamp-k 4 --exposure -0.7 2>&1 | grep -E "^OK|Traceback|Error" | sed "s/^/$n night: /"; }
shoot tz_taimi -8.0,1.6,-1.0 30,1.6,-1.0 $TZ
shoot tz_xile 8.0,1.6,-5.5 -30,1.6,-5.5 $TZ
shoot tz_yindehao 8.0,1.6,5.75 -30,1.6,5.75 $TZ
shoot tz_limao 28.2,1.6,5.3 28.2,1.6,-30 $TZ
shoot tz_yuehaochi -5.25,1.6,29.0 30,1.6,29.0 $TZ
shoot tz_keju -5.25,1.6,23.25 30,1.6,23.25 $TZ
shoot tz_dongnan -5.25,1.6,16.75 30,1.6,16.75 $TZ
shoot tz_liantong -5.25,1.6,10.75 30,1.6,10.75 $TZ
shoot tz_wente -5.25,1.6,5.75 30,1.6,5.75 $TZ
shoot gg_antai -18.6,1.6,18.7 -18.6,1.6,-40 $GG
shoot gg_xianguo 19.6,1.6,18.7 19.6,1.6,-40 $GG
shoot gg_rongendian 64.1,1.6,18.7 64.1,1.6,-40 $GG
echo ALLDONE
