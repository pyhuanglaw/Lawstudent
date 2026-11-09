#!/bin/bash
# 3 間同時跑；每間一個 python（OMP 1 條執行緒）
S=/tmp/claude-0/-home-user-Lawstudent/62ca4225-4c3d-5d85-9e8d-40846d4f390f/scratchpad
cd /home/user/Lawstudent || exit 1
export OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1
printf '%s\n' second_ai/bb_support/ade second_ai/bb_support/corner second_ai/bb_support/dakou_1f second_ai/wz_teahouse_interior second_ai/dorm_room4 wancai_interior second_ai/dorm_205 second_ai/library_carrels second_ai/library_b1 second_ai/linze_5f second_ai/us_shared second_ai/us_apartment second_ai/gym_b1 | \
  xargs -P 3 -I{} bash -c 'ulimit -v 9000000; timeout 5400 python3 '$S'/scan204/scan.py {} '$S'/scan204/out > '$S'/scan204/out/$(echo {} | tr / _).log 2>&1; echo "完成 {} $?"'
echo 全部完成
