# XS-WINCARD-1105 重拍窗外照片（LAWWW2-C 2026-11-05）。在 repo 根目錄跑：bash docs/art-rebuild/second_ai/wip/xs_wincard_1105/render.sh 輸出資料夾
# 場景資料（slabs／trees／lamps／pools.json）在這個資料夾；輸出 2048×1024 PNG，之後縮成 1024×512 webp 放進 assets/models/env/views/（不鏡像）。
D=docs/art-rebuild/second_ai/wip/xs_wincard_1105; OUT=${1:?輸出資料夾}; mkdir -p "$OUT"; G=assets/models/env/second_ai
C0="--res 2048x1024 --lens 18 --samples 48 --glb $G/xinsheng_street.glb --place $G/campus_moon.glb@159.4,0,-91.4,1.5708 --place $G/campus_gymext.glb@159.4,0,-91.4,1.5708 --slabs $D/slabs.json --trees $D/trees.json --lamps $D/lamps.json"
shoot(){ n=$1; eye=$2; at=$3; clip=${4:-0.3}   # clip：大口二樓 4.6（新生南路的外觀二樓蓋在騎樓上面、往外 3 m，要剪掉自己這一棟）
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --clip-start $clip $C0 --out "$OUT/${n}_day.png" --hour 14 2>&1 | grep -E "^OK|Traceback" | sed "s/^/$n day: /"
  timeout 1800 /opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --eye $eye --at $at --clip-start $clip $C0 --out "$OUT/${n}_night.png" --night --lamp-k 4 --exposure -0.7 --pools $D/pools.json --pool-w 220 2>&1 | grep -E "^OK|Traceback" | sed "s/^/$n night: /"; }
shoot xs_dabu -16.27,1.6,-16.6 30,1.6,-16.6
shoot xs_haopai -16.27,1.6,-23.2 30,1.6,-23.2
shoot xs_dakou -16.2,1.6,40.4 30,1.6,40.4
shoot xs_dakou_2f -16.1,5.2,40.4 30,5.2,40.4 4.6
# 大口西側不拍：外面 0.6 m 就是隔壁的牆（README 第三節）
echo ALLDONE
