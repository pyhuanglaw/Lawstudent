#!/bin/bash
# lm_fill_covered --dry 盤點（只讀，不寫檔）：每一間的第一行（被蓋住、會露出來的格子數／％）＋前 5 名
cd /home/user/Lawstudent || exit 1
while read -r g w; do echo "=== $g"; timeout 900 python3 tools/blender/env_second/lightbake/lm_fill_covered.py "$g" "$w" --dry 2>&1 | head -6; done < "$1"
echo DONE
