from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
import numpy as np, sys
S=sys.argv[1]; BG=sys.argv[2]; OUT=sys.argv[3]
W,H=1920,1080
bg=Image.open(BG).convert('RGBA').resize((W,H),Image.LANCZOS)
pxcm_front=540/166.0
back_k=0.94
FRONT_Y=985; BACK_Y=920
# (file, height cm, center x, row, extra scale)
back=[('cg69_mingxuan',178,612,1.0),('cg69_youchen',175,782,1.0),('cg69_player',175,952,1.0),('cg69_bohan',172,1120,1.015),('cg69_zhe',178,1300,0.965)]
front=[('cg69_peishan',163,690,1.0),('cg69_yu',163,872,1.0),('cg69_heroine_01',166,1052,1.0),('cg69_xinci',160,1232,1.0)]
def warm(im):
    a=np.asarray(im).astype(np.float32)
    a[...,0]*=1.035; a[...,1]*=1.01; a[...,2]*=0.95
    a[...,:3]=np.clip(a[...,:3]*1.02,0,255)
    return Image.fromarray(a.astype(np.uint8),'RGBA')
def shadow(layer,cx,fy,w,alpha=110):
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(sh)
    d.ellipse([cx-w*0.55, fy-10, cx+w*0.75, fy+14], fill=(40,30,30,alpha))
    sh=sh.filter(ImageFilter.GaussianBlur(9)); layer.alpha_composite(sh)
def place(layer,name,cm,cx,fy,pxcm,extra):
    im=Image.open(f'{S}/{name}.png').convert('RGBA')
    th=int(cm*pxcm*extra); s=th/im.height
    im=im.resize((max(1,int(im.width*s)),th),Image.LANCZOS)
    im=warm(im)
    # cast shadow: silhouette flipped down, squashed, sheared to the right (sun at upper-left)
    a=im.split()[3]
    sh_h=max(1,int(im.height*0.28))
    sil=a.transpose(Image.FLIP_TOP_BOTTOM).resize((im.width,sh_h))
    shear=0.9
    sil=sil.transform((im.width+int(sh_h*shear)+2,sh_h),Image.AFFINE,(1,-shear,0,0,1,0),resample=Image.BILINEAR)
    sil=sil.filter(ImageFilter.GaussianBlur(5)).point(lambda v:int(v*0.33))
    shl=Image.new('RGBA',sil.size,(35,28,30,0)); shl.putalpha(sil)
    layer.alpha_composite(shl,(int(cx-im.width/2),int(fy-3)))
    shadow(layer,cx,fy,im.width*0.45,alpha=120)
    layer.alpha_composite(im,(int(cx-im.width/2),int(fy-im.height)))
out=bg.copy()
for n,cm,cx,e in back: place(out,n,cm,cx,BACK_Y,pxcm_front*back_k,e)
for n,cm,cx,e in front: place(out,n,cm,cx,FRONT_Y,pxcm_front,e)
out.convert('RGB').save(OUT,quality=92)
print('saved',OUT)
