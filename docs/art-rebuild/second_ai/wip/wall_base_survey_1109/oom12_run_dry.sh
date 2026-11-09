#!/bin/bash
# 11 間 lm_fill_covered --dry（分批版）；每間記秒數
cd /home/user/Lawstudent || exit 1
ulimit -v 9000000
while read -r g w; do echo "=== $g"; t0=$(date +%s); timeout 1500 python3 tools/blender/env_second/lightbake/lm_fill_covered.py "$g" "$w" --dry > "$2.tmp" 2>&1; r=$?; head -6 "$2.tmp"; echo "rc=$r $(( $(date +%s)-t0 )) s"; done < "$1"
rm -f "$2.tmp"; echo DONE
