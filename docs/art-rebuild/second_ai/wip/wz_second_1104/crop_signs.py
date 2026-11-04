import numpy as np
from PIL import Image
SP='/tmp/claude-0/-home-user-Lawstudent/b2086276-f771-5e36-88cb-063a8a6233cc/scratchpad'; R='/home/user/Lawstudent/docs/art-rebuild/second_ai/wip/wz_second_1104/ref'
def coeffs(dst, src):
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u); A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()
Q=[('changzai_laundry_ext','sign',[(375,392),(1508,192),(1508,378),(375,485)],1600,190),
   ('azhong_fruit_ext','sign',[(593,282),(1492,170),(1494,312),(593,386)],1600,200),
   ('summer_ice_ext','sign',[(396,156),(966,252),(966,335),(396,276)],1400,240),
   ('summer_ice_ext','menu',[(712,422),(813,427),(815,632),(712,630)],160,320),
   ('summer_ice_ext','flag',[(975,432),(1040,434),(1040,523),(975,520)],128,176),
   ('dida_tea_ext','sign',[(228,184),(992,306),(992,388),(228,338)],1600,200),
   ('dida_tea_ext','menu',[(243,403),(466,412),(462,662),(240,660)],224,256),
   ('dida_tea_ext','aboard',[(988,622),(1092,625),(1098,800),(984,800)],160,256),
   ('wenzhou_books_ext','sign',[(540,276),(1522,152),(1522,258),(540,384)],1600,150),
   ('wenzhou_books_ext','chalk',[(1033,672),(1141,668),(1150,840),(1040,843)],160,256)]
outs=[]
for n,p,q,w,h in Q:
    im=Image.open(f'{R}/{n}.webp').convert('RGB'); o=im.transform((w,h),Image.PERSPECTIVE,coeffs([(0,0),(w,0),(w,h),(0,h)],q),Image.BICUBIC)
    o.save(f'{SP}/w2crop/{n}_{p}.png'); outs.append(o)
W=800; rows=[o.resize((min(W,o.width*2) if o.width<400 else W, int(o.height*(min(W,o.width*2) if o.width<400 else W)/o.width))) for o in outs]
H=sum(r.height+6 for r in rows); M=Image.new('RGB',(W,H),'white'); y=0
for r in rows: M.paste(r,(0,y)); y+=r.height+6
M.save(f'{SP}/w2crop/mont.jpg',quality=85); print(M.size)
