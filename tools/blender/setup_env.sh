#!/bin/bash
# 美術工具一次裝好（Blender bpy 5.2.2、EEVEE 要的 EGL、VRM Add-on for Blender、VRoid CC0 樣本）。
# 雲端容器每次新開都是空的，這些不在 repo 裡；LAWWW2（和任何要做人物、算圖的職位）新容器第一件事跑這支。
# 這些是 2026-10-10 起一直在用、已經記在 LICENSES.md（VRM Add-on MIT、VRoid 樣本 CC0）、docs/rules/ROLE_LAWWW2.md 第 2 節（D33）
# 的工具，不是新決定：不用再問使用者（使用者 2026-11-10 16:2x：「不是早就應該已經裝了嗎？…為什麼每次都要重新講一次」）。
# 已經裝過的會跳過；最後印出 bpy 版本、VRM 外掛能不能啟用、VRoid 樣本幾個。
# 用法（repo 根目錄）：bash tools/blender/setup_env.sh
set -e
cd "$(dirname "$0")/../.."
if [ ! -x /opt/blenv/bin/python ]; then python3 -m venv /opt/blenv && /opt/blenv/bin/pip install -q bpy==5.2.2; fi
apt-get install -y -q libegl1 libegl-mesa0 libgl1-mesa-dri libgbm1 >/dev/null 2>&1 || (apt-get update -q >/dev/null 2>&1 && apt-get install -y -q libegl1 libegl-mesa0 libgl1-mesa-dri libgbm1 >/dev/null)
if [ ! -d /opt/vrmaddon/src ]; then git clone -q --depth 1 https://github.com/saturday06/VRM-Addon-for-Blender.git /opt/vrmaddon/src; fi
mkdir -p ~/.config/blender/5.2/scripts/addons && ln -sfn /opt/vrmaddon/src/src/io_scene_vrm ~/.config/blender/5.2/scripts/addons/io_scene_vrm
if [ ! -d tools/vroid_src ] || [ -z "$(ls tools/vroid_src 2>/dev/null)" ]; then bash tools/fetch_vroid_src.sh >/dev/null; fi
/opt/blenv/bin/python -c "import bpy,addon_utils; m=addon_utils.enable('io_scene_vrm', default_set=True); print('bpy', bpy.app.version_string, '／VRM 外掛', 'OK' if m else '沒有啟用')"
echo "VRoid 樣本 $(ls tools/vroid_src | wc -l) 個（應該 9 個）"
