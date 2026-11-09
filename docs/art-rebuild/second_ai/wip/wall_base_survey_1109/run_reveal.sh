#!/bin/bash
# lm_fade_reveal_check（只讀）：每一間的「露出」清單；記憶體上限 9 GB，超過就跳過（不讓 OOM 殺別的程序）
cd /home/user/Lawstudent || exit 1
while read -r g w; do echo "=== $g"; ( ulimit -v 9000000; timeout 900 python3 tools/blender/env_second/lightbake/lm_fade_reveal_check.py "$g" "$w" --samples 400 2>&1 | grep -E "露出|要修|Error|error" | head -40 ); done < "$1"
echo DONE
