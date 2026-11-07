#!/usr/bin/env python3
"""頭髮「泡麵感」：把頭髮的法線往一個膠囊狀的頭部外形混合（HAIR-NOODLE-1104，LAWWW2-B 2026-11-07）。
起因：使用者 11-04 13:2x 對 CC-C「人物的頭髮真的太像泡麵了」。BB-C 的診斷（BB_259 B 節）：
  VRoid 的每一束頭髮都是封閉圓管、法線是平滑的圓柱形，所以每一束各有一條自己的明暗（一根一根像麵）；
  她離線試過「整頭的法線換成以頭頂下 11.5 cm 為球心的球面法線」，後腦勺變成一整塊受光、最不像麵，
  但同時把 toon 的明暗邊界調硬（toony 0.9），側面、背面多了一條很硬的斜線。
這裡的做法：
  - 只改法線，不動幾何、權重、貼圖、材質（MToon 的 toony／shift 照舊，明暗邊界不會變硬）；
  - 外形是膠囊：頭頂下 DROP 公尺那一點以上是球面；以下是往下 0.8 m 的垂直軸（垂到肩膀、背後的長髮、馬尾照圓柱往外），兩段在交界連續；
  - 新法線＝normalize((1−k)·原本的法線＋k·外形的法線)：k＝1 整頭一塊、k＝0 照原本；保留一部分原本的法線，髮束之間還有一點層次。
  - 認頭髮：材質名字有 HAIR（和遊戲 character3d.js 的 /HAIR/ 一樣）；頭的位置：骨架裡 J_Bip_C_Head（或名字是 head 的骨頭）的綁定位置；
    頭頂：頭的垂直軸 15 cm 內最高的頭髮頂點。
用法：python3 tools/hair_normals.py --in <a.vrm> --out <b.vrm> [--k 0.6] [--drop 0.115]
     （同一個檔重跑會疊加：一律從沒有改過的 VRM 開始。檔案裡的 extras.hairNormals 會記 k、drop，重跑前會擋下來）
遊戲裡不用改程式。探針 docs/art-rebuild/second_ai/wip/hair_noodle_1107/ 的 HAIRFIX 在瀏覽器裡做同樣的事（給 CC 拍改前改後）。
"""
import os, sys, json, argparse
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vroid_build as VB

CAP = 0.08        # 頭的軸：頭頂往下這一段的頭髮頂點的 x、z 中心
CAPSULE = 0.8     # 膠囊往下多長（公尺）


def hair_prims(v):
    out = []
    for mi, m in enumerate(v.j['meshes']):
        for pi, p in enumerate(m['primitives']):
            mat = v.j['materials'][p['material']]['name'] if 'material' in p else ''
            if 'HAIR' in mat.upper(): out.append((mi, pi, p, mat))
    return out


def proxy_dirs(P, S, cap=CAPSULE):
    c = np.repeat(S[None, :], len(P), 0)
    c[:, 1] = np.clip(P[:, 1], S[1] - cap, S[1])
    d = P - c; L = np.linalg.norm(d, axis=1, keepdims=True)
    return d / np.maximum(L, 1e-6), L[:, 0]


def apply(v, k=0.6, drop=0.115):
    j = v.j; ex = (j.get('asset') or {}).get('extras') or {}
    assert 'hairNormals' not in ex, '這個 VRM 已經改過頭髮法線（extras.hairNormals=%s）：要從沒有改過的檔開始' % ex['hairNormals']
    H = hair_prims(v); assert H, '找不到頭髮（材質名字有 HAIR）'
    rep = {'k': k, 'drop': drop, 'prims': []}
    # 每一個 NORMAL accessor 只改一次：同一個 accessor 可能有好幾個 primitive 共用（VRoid 多材質網格）——只改頭髮用到的頂點，其他照舊
    by_acc = {}
    for mi, pi, p, mat in H:
        A = p['attributes']; idx = np.unique(v.acc(p['indices']).astype(np.int64)) if 'indices' in p else None
        e = by_acc.setdefault(A['NORMAL'], {'pos': A['POSITION'], 'verts': set(), 'prims': []})
        e['verts'].update((idx if idx is not None else np.arange(j['accessors'][A['POSITION']]['count'])).tolist()); e['prims'].append((mi, pi, mat))
    # 頭的中心只看頭髮的幾何（不用骨架；和探針 HAIRFIX 一樣）：頭頂＝所有頭髮頂點最高的一點，頭的軸＝頭頂往下 CAP m 內那一圈頂點的 x、z 中心；所有頭髮共用
    allP = np.concatenate([v.acc(e['pos']).astype(np.float64)[np.array(sorted(e['verts']), np.int64)] for e in by_acc.values()])
    top = allP[:, 1].max(); cap = allP[allP[:, 1] > top - CAP]
    S = np.array([cap[:, 0].mean(), top - drop, cap[:, 2].mean()]); rep['center'] = [round(x, 4) for x in S.tolist()]; rep['top'] = round(float(top), 4)
    for na, e in by_acc.items():
        P = v.acc(e['pos']).astype(np.float64); N = v.acc(na).astype(np.float64)
        sel = np.array(sorted(e['verts']), np.int64)
        D, L = proxy_dirs(P[sel], S)
        n0 = N[sel] / np.maximum(1e-8, np.linalg.norm(N[sel], axis=1, keepdims=True))
        n1 = (1 - k) * n0 + k * D; n1 /= np.maximum(1e-8, np.linalg.norm(n1, axis=1, keepdims=True))
        ang = np.degrees(np.arccos(np.clip((n0 * n1).sum(1), -1, 1)))
        Nn = N.copy(); Nn[sel] = n1
        new = v.add_acc(Nn.astype(np.float32), 5126, 'VEC3', target=34962)
        for m in j['meshes']:
            for p in m['primitives']:
                if p['attributes'].get('NORMAL') == na: p['attributes']['NORMAL'] = new
        rep['prims'].append({'mats': [x[2] for x in e['prims']], 'verts': int(len(sel)), 'turn_deg_median': round(float(np.median(ang)), 1),
                             'turn_deg_p90': round(float(np.percentile(ang, 90)), 1), 'below_center_pct': round(float((P[sel, 1] < S[1]).mean() * 100), 1)})
    j.setdefault('asset', {}).setdefault('extras', {})['hairNormals'] = {'k': k, 'drop': drop, 'tool': 'tools/hair_normals.py'}
    return rep


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--in', dest='inp', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--k', type=float, default=0.6); ap.add_argument('--drop', type=float, default=0.115)
    a = ap.parse_args()
    v = VB.VRM(a.inp)
    print(json.dumps(apply(v, a.k, a.drop), ensure_ascii=False, indent=1))
    n = v.save(a.out); print('saved', a.out, round(n / 1e6, 2), 'MB')
