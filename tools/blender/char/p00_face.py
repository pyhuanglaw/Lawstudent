"""祐廷（玩家）的臉：沿用沈以安的 h01_face（局部細分、空間變形、表面細節、法向量、貼圖重畫），參數換成男生的。
h01_face 的位置參數（下半臉加長的起點、細分範圍、前方門檻）是照沈以安的臉寫的絕對座標：
先把祐廷的臉（所有 shape key）以「眼睛中心、下巴、鼻尖深度」等比例對到沈以安的臉，做完再轉回來（等比例＋平移：法向量方向不變）。"""
import numpy as np
import common as C
import h01_face as F

REF = dict(ez=1.4717, chin=1.3920, tip_y=0.0968)     # 沈以安 stage0 之後的臉（Face 網格座標；h01_face 的記錄）

# 男生的參數（參考圖 02：細長的雙眼皮眼睛、直的濃眉、直挺的鼻樑、下顎線清楚、嘴唇自然色）
MALE = dict(D_CHIN=0.004, BROW_DROP=0.0035, EYE_SX=1.06, EYE_SZ=0.72, EYE_TILT=0.03, EYE_IN=0.0020, EYE_LIFT=0.0004,
            CHIN_WIDEN=0.55, JAW_OUT=0.0048, MOUTH_K=1.50, FACE_NARROW=0.965, LOWER_BACK=(0.0006, 0.0035), CHIN_FWD=0.0042,
            MOUTH_DOWN=0.0012, IRIS_FRAC=0.50, EYELINE_K=0.85, WING=0.0010, LASH_N=14, LASH_L=0.55, BROW_K=1.55, BROW_ARCH=0.45,
            BROW_COL=(0.14, 0.11, 0.10), LIP_OUT=(0.80, 0.60, 0.57), LIP_IN=(0.70, 0.47, 0.46), LIP_HI=(0.88, 0.73, 0.70), LIP_A=0.55)


def measure(f):
    B = C.co(f); R = F.rest_pose(f); loops = F.classify_loops(f)
    eyes = [F.eye_arcs(R, L) for L in loops['eye']]
    ez = float(np.mean([(E['up'].max() + E['lo'].min()) / 2 for E in eyes]))
    chin = float(B[(np.abs(B[:, 0]) < 0.002) & (B[:, 1] > 0.05), 2].min())
    tip_i = np.argmax(np.where(np.abs(B[:, 0]) < 0.002, B[:, 1], -1))
    return dict(ez=ez, chin=chin, tip_y=float(B[tip_i, 1]))


def apply(m):
    F.REST = {'Fcl_EYE_Close': 0.0}
    f = m['face']; cur = measure(f)
    s = (REF['ez'] - REF['chin']) / (cur['ez'] - cur['chin'])
    a0 = np.array([0.0, cur['tip_y'], cur['ez']]); a1 = np.array([0.0, REF['tip_y'], REF['ez']])
    print('  face(p00): measured', {k: round(v, 4) for k, v in cur.items()}, 'scale %.4f' % s)
    F.REST = {'Fcl_EYE_Close': 0.0}          # 男性樣本沒有 Fcl_EYE_Natural；眼型不烘（vrm_finish 用 MALE_EYES）
    for k, v in MALE.items(): setattr(F, k, v)
    C.warp(f, lambda P, B: a1 + (P - a0) * s)
    F.apply(m)
    C.warp(f, lambda P, B: a0 + (P - a1) / s)
