"""郭沛珊（classmate_peishan）的臉：沿用沈以安的 h01_face（p00_face.run），參數照參考圖 classmate_peishan.webp（BB_109 第 2 節）：
成人比例、安靜、常在想事情——下巴不尖的鵝蛋臉、眼睛比芯慈圓一點、外眼角幾乎不上揚（不像芯慈「客氣但有距離」，比較柔、比較收斂）、
**眉毛細**、淡淡的唇色、幾乎沒有腮紅。眼鏡是另外的配件（glasses_peishan.py）。"""
import p00_face as PF

# 使用者 10-22「林芷若3d好憨 沛珊也是」（LAWWW2 第二十七版）：第二十六版內眼角距離＝眼寬 1.45 倍（一般人約 1 倍）、眼高／眼寬 0.40、眉毛離眼睛遠、
# 下半臉長——眼睛小又分得開、套在大圓框裡像兩個點。改：EYE_IN 0.0026→0.0095（1.10 倍）、EYE_SX 1.00→1.10、EYE_SZ 0.70→0.80（0.46）、IRIS_FRAC 0.52→0.55、
# EYE_TILT 0.025→0.05、BROW_DROP 0.0042→0.0068、D_CHIN 0.008→0.003、MOUTH_DOWN（預設 0.0020）→0.0005、FACE_NARROW 0.96→0.92、MOUTH_K 1.50→1.60、EYELINE_K 0.9→1.1。
# 眼睛往中間移了：眼鏡（glasses_peishan.py）鏡片中心距 84→72.7 mm、鏡框半徑 23→21 mm。比較圖 docs/art-rebuild/second_ai/char_review/peishan_1022/
PEISHAN = dict(D_CHIN=0.003, BROW_DROP=0.0068, EYE_SX=1.10, EYE_SZ=0.80, EYE_TILT=0.05, EYE_IN=0.0095, EYE_LIFT=0.0004, CHEEK_TINT_K=0.6,
               CHIN_WIDEN=0.42, JAW_OUT=0.0030, MOUTH_K=1.60, FACE_NARROW=0.92, IRIS_FRAC=0.55, MOUTH_DOWN=0.0005,
               EYELINE_K=1.1, WING=0.0012, LASH_N=22, LASH_L=0.80, BROW_K=0.82, BROW_ARCH=0.30, BROW_COL=(0.10, 0.085, 0.080), BROW_A=0.88,
               LIP_OUT=(0.84, 0.60, 0.58), LIP_IN=(0.74, 0.46, 0.46), LIP_HI=(0.92, 0.76, 0.74), LIP_A=0.75)


# 試參數（使用者 10-22「好憨」，LAWWW2）：環境變數 FACE_OVERRIDE='{"BROW_DROP":0.006}' 蓋過上面的值，不改檔案就能一次只改一樣、同鏡頭比較
import json as _json, os as _os
PEISHAN.update(_json.loads(_os.environ.get('FACE_OVERRIDE') or '{}'))

def apply(m):
    PF.run(m, PEISHAN, {'Fcl_EYE_Natural': 0.5, 'Fcl_EYE_Close': 0.2})
