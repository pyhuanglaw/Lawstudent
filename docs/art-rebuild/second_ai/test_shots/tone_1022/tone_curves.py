# three.js r16x+ tonemapping_pars_fragment：ACESFilmic、Neutral（Khronos PBR Neutral）的 CPU 版，用來選 Neutral 的曝光倍數
import numpy as np
IN=np.array([[0.59719,0.07600,0.02840],[0.35458,0.90834,0.13383],[0.04823,0.01566,0.83777]])   # GLSL mat3 是 column-major：這是欄
OUT=np.array([[1.60475,-0.10208,-0.00327],[-0.53108,1.10813,-0.07276],[-0.07367,-0.00605,1.07602]])
def rrt(v): return (v*(v+0.0245786)-0.000090537)/(v*(0.983729*v+0.4329510)+0.238081)
def aces(c,e=1.0):
    c=np.asarray(c,float)*e/0.6
    c=IN.T@c if False else np.array([IN[0]@c*0+ (IN[:,0]@c), IN[:,1]@c, IN[:,2]@c]) if False else (IN.T.T@c)
    return c
def mat(m,c):   # GLSL m*c，m 用欄寫：結果 i = sum_j m[j][i]*c[j]
    return np.array([sum(m[j][i]*c[j] for j in range(3)) for i in range(3)])
def aces3(c,e=1.0):
    c=np.asarray(c,float)*e/0.6; c=mat(IN,c); c=rrt(c); c=mat(OUT,c); return np.clip(c,0,1)
def neutral(c,e=1.0):
    c=np.asarray(c,float)*e; start=0.8-0.04; desat=0.15
    x=min(c.min(),c.max()*0+min(c)); off=x-6.25*x*x if x<0.08 else 0.04; c=c-off
    peak=c.max()
    if peak<start: return np.clip(c,0,1)
    d=1-start; newPeak=1-d*d/(peak+d-start); c=c*(newPeak/peak)
    g=1-1/(desat*(peak-newPeak)+1); return np.clip(c*(1-g)+newPeak*g,0,1)
def srgb(x): x=np.clip(x,0,1); return np.where(x<=0.0031308,12.92*x,1.055*np.power(x,1/2.4)-0.055)
if __name__=='__main__':
    greys=[0.01,0.03,0.05,0.1,0.18,0.3,0.5,0.8,1.0,1.5,2.5]
    print('linear in → sRGB 8bit   ACES | Neutral K=1.0 1.2 1.3 1.4 1.5')
    for g in greys:
        a=srgb(aces3([g]*3))[0]*255; row=[srgb(neutral([g]*3,k))[0]*255 for k in (1.0,1.2,1.3,1.4,1.5)]
        print(f'{g:5.2f}  {a:6.1f} | '+' '.join(f'{r:6.1f}' for r in row))
    # 平均差：0.03～0.8 的灰（對數平均取樣）
    xs=np.exp(np.linspace(np.log(0.03),np.log(0.8),40))
    for k in np.arange(1.1,1.65,0.05):
        dif=[srgb(neutral([x]*3,k))[0]-srgb(aces3([x]*3))[0] for x in xs]
        print(f'K={k:.2f} mean diff {np.mean(dif)*255:+6.2f} max {np.max(np.abs(dif))*255:5.1f}')
    # 膚色（亮面、陰影）：彩度
    import colorsys
    for name,c in [('skin lit',[0.75,0.50,0.38]),('skin shade',[0.30,0.17,0.12]),('brick',[0.35,0.12,0.07]),('sky',[0.35,0.55,0.85]),('grass',[0.12,0.25,0.06]),('lamp warm',[1.6,1.1,0.6])]:
        a=srgb(aces3(c)); n=srgb(neutral(c,1.3))
        ha=colorsys.rgb_to_hsv(*a); hn=colorsys.rgb_to_hsv(*n)
        print(f'{name:10s} ACES {np.round(a*255).astype(int)} h{ha[0]*360:5.1f} s{ha[1]:.2f} v{ha[2]:.2f} | Neutral1.3 {np.round(n*255).astype(int)} h{hn[0]*360:5.1f} s{hn[1]:.2f} v{hn[2]:.2f}')
