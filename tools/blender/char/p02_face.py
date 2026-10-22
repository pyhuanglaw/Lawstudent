"""林芷若（heroine_02）的臉：沿用沈以安的 h01_face（p00_face.run：先等比例對到沈以安的臉、做完再轉回來），參數照參考圖 06：
溫和的鵝蛋臉（下巴圓、下顎線柔和）、眼睛比沈以安圓一點、外眼角不上揚（戴眼鏡、溫柔）、深色自然眉、自然玫瑰色嘴唇。"""
import p00_face as PF
import h01_face as F

# 使用者 10-22「林芷若3d好憨 沛珊也是」（LAWWW2）：第一版（10-10）的內眼角距離＝眼寬 1.28 倍、嘴寬 4.8 cm 又低（人中長）、下巴長——眼睛分得開、下半臉像馬臉。
# 改：EYE_IN 0.0028→0.0075（1.09 倍）、EYE_SX 1.02→1.06、EYE_SZ 0.66→0.74、IRIS_FRAC 0.50→0.54、BROW_DROP 0.0045→0.0060、MOUTH_K 1.65→1.25、
# MOUTH_DOWN（預設 0.0020）→0.0003、D_CHIN 0.007→0.002、FACE_NARROW 0.96→0.945。眼鏡（glasses_zhiruo.py）鏡片中心距 84→76.6 mm；瀏海（p02_hair.py V_A、V_Z）收進來。
LIN = dict(D_CHIN=0.002, BROW_DROP=0.0060, EYE_SX=1.06, EYE_SZ=0.74, EYE_TILT=0.05, EYE_IN=0.0075, EYE_LIFT=0.0005, CHEEK_TINT_K=0.7,   # 第二版：眼睛小一點（樣本的眼睛高 2.3 cm，第一版 ×0.80 還是動畫式的大圓眼）、腮紅拿掉 70%
           CHIN_WIDEN=0.55, JAW_OUT=0.0038, MOUTH_K=1.25, FACE_NARROW=0.945, IRIS_FRAC=0.54, MOUTH_DOWN=0.0003,
           EYELINE_K=0.95, WING=0.0022, LASH_N=26, LASH_L=0.9, BROW_K=1.1, BROW_ARCH=0.8, BROW_COL=(0.20, 0.15, 0.13), BROW_A=0.9,
           LIP_OUT=(0.86, 0.56, 0.56), LIP_IN=(0.76, 0.40, 0.44), LIP_HI=(0.94, 0.74, 0.74), LIP_A=0.85)


# 試參數（使用者 10-22「好憨」，LAWWW2）：環境變數 FACE_OVERRIDE='{"BROW_DROP":0.006}' 蓋過上面的值，不改檔案就能一次只改一樣、同鏡頭比較
import json as _json, os as _os
LIN.update(_json.loads(_os.environ.get('FACE_OVERRIDE') or '{}'))

def apply(m):
    PF.run(m, LIN, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})     # 女性樣本：和沈以安一樣的基本眼型（vrm_finish 的 FEMALE_EYES）
