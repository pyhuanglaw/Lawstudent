"""坐姿替身（seated_figures.py）擺好姿勢之後，手和頭在座位座標的位置 → desk_props.py 用來放「手裡的東西」（抄筆記的筆、滑手機的手機）。
  /opt/blenv/bin/python tools/blender/env_second/seated_hands.py
輸出 tools/blender/env_second/data/seated_hands.json：{底模: {姿勢: {骨頭名: [x, y, z]}}}（遊戲座標：座位原點、+z 朝前、公尺）。
姿勢的做法和 seated_figures.py 完全一樣（直接呼叫它的 import_base、apply_pose），所以改了姿勢要重跑這支、再跑 desk_props.py。"""
import json, os, sys
sys.argv = [sys.argv[0]]   # seated_figures 讀 sys.argv 的參數：這裡不用
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import seated_figures as SF   # noqa: E402

BONES = ['Hand', 'Middle1', 'Middle3', 'Index1', 'Index3', 'Little1', 'Thumb1', 'Thumb3']
OUT = os.path.join(HERE, 'data', 'seated_hands.json')


def tip(arm, name):
    return arm.pose.bones[name].tail.copy()


def main():
    res = {}
    for base in SF.BASES:
        arm, high = SF.import_base(base)
        res[base] = {}
        for pose in SF.POSES:
            T = SF.apply_pose(arm, high, pose)
            def g(a): return [round(-(a.x + T.x), 4), round(a.z + T.z, 4), round(a.y + T.y, 4)]   # 骨架座標 → 遊戲座標（和 posed_copy 的轉換一樣）
            d = {}
            for s in ('L', 'R'):
                for b in BONES:
                    n = f'J_Bip_{s}_{b}'
                    if n in arm.pose.bones:
                        d[f'{s}_{b}'] = g(SF.H(arm, n))
                        if b in ('Middle3', 'Index3', 'Thumb3'): d[f'{s}_{b}_tip'] = g(tip(arm, n))
            d['Head'] = g(SF.H(arm, 'J_Bip_C_Head')); d['Head_tip'] = g(tip(arm, 'J_Bip_C_Head'))
            res[base][pose] = d
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
    print('wrote', OUT)


if __name__ == '__main__':
    main()
