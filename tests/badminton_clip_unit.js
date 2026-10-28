// 羽球小短片（BADMINTON-CLIP-1027，使用者 X106；演出 AA_485 第 2 節；LAWWW2-C 2026-10-27）——不需要瀏覽器（整段播放的瀏覽器量測：tools/shots/badminton_clip_run.py）。
//   ① BADCLIP 存在；揮拍三種（發球、高遠球、殺球）＋伸拍、揮空、平抽、放小球；每一種開頭、結尾是準備姿勢，擊球那一刻是擊球姿勢；
//   ② 球的弧線：起點、終點對、中間比兩端高、水平進度一路往前（不倒退）、往上衝得快（前半段走超過一半的水平距離）；
//   ③ 八種結尾：七位（以安、語彤、芷若、子晴、學姊、沛珊、可昕）各一種、其他人＝男生朋友那一種；台詞（以安、語彤、學姊、沛珊）照 AA_485，短片裡不說；
//   ④ 場地：新體育館 1F 北排中間那一面（gym_layout.js 的 courts.badminton[1]），在球場範圍裡、遠景機位不撞到大廳的隔牆；
//   ⑤ 接線：character3d.js 的疊加姿勢（u.overlay）、index.html 載入 src/badminton_clip3d.js、ASSETS 有 bldg.badminton_props，GLB 裡有兩支球拍、羽球、球網。
// 用法：node tests/badminton_clip_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.location={search:''}; global.navigator={userAgent:'node'};
for(const f of ['lib/three.bundle.js','src/data/gym_layout.js','src/assets3d.js','src/badminton_clip3d.js']){ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, near=(a,b)=>Object.keys(a).every(k=>!b[k]||a[k].every((v,i)=>Math.abs(v-b[k][i])<1e-6));
check('① BADCLIP 存在（play、LINES、揮拍資料）',typeof BADCLIP!=='undefined'&&typeof BADCLIP.play==='function'&&!!BADCLIP.SW&&!!BADCLIP.P);
{ const need=['serve','clear','smash','reach','whiff','drive','drop']; check('① 揮拍：發球、高遠球、殺球＋伸拍、揮空、平抽、放小球',need.every(k=>BADCLIP.SW[k]),need.filter(k=>!BADCLIP.SW[k]).join(' '));
  const bad=[]; for(const k of need){ const s=BADCLIP.SW[k]; if(!near(BADCLIP._pose(k,0),BADCLIP.P.ready)||!near(BADCLIP._pose(k,1),BADCLIP.P.ready)) bad.push(k+' 頭尾');
    if(s.hit>0){ const at=s.k.find(q=>Math.abs(q[0]-s.hit)<1e-9); if(!at||!['hit','smashHit','sv2','drive'].includes(at[1])||!near(BADCLIP._pose(k,s.hit),BADCLIP.P[at[1]])) bad.push(k+' 擊球'); } }
  check('① 每一種揮拍開頭、結尾是準備姿勢；擊球那一刻是擊球姿勢（高遠球、放小球＝hit、殺球＝smashHit、發球＝sv2、平抽＝drive）',!bad.length,bad.join(' '));
  check('① 揮空、伸拍沒有擊球（hit −1）',BADCLIP.SW.whiff.hit<0&&BADCLIP.SW.reach.hit<0); }
{ const A=new THREE.Vector3(0,2.4,4.4), B=new THREE.Vector3(0,2.4,-4.4), o=new THREE.Vector3(); const p0=BADCLIP._flight(A,B,6,0,o.clone()), p1=BADCLIP._flight(A,B,6,1,o.clone());
  let maxY=0, prevZ=Infinity, mono=true; const zs=[]; for(let u=0;u<=1.0001;u+=0.05){ const p=BADCLIP._flight(A,B,6,u,new THREE.Vector3()); maxY=Math.max(maxY,p.y); if(p.z>prevZ+1e-9) mono=false; prevZ=p.z; zs.push(p.z); }
  const mid=BADCLIP._flight(A,B,6,0.5,new THREE.Vector3());
  check('② 弧線：起點、終點對',p0.distanceTo(A)<1e-6&&p1.distanceTo(B)<1e-6,J([p0,p1]));
  check('② 弧線：中間比兩端高（最高 ≥ 5 m）、水平一路往前',maxY>=5&&mono,J({maxY:+maxY.toFixed(2),mono}));
  check('② 弧線：往上衝得快、落下陡（一半的時間走超過一半的水平距離）',Math.abs(mid.z-A.z)>Math.abs(B.z-A.z)*0.55,mid.z.toFixed(2)); }
{ const E=BADCLIP.ENDINGS, want=['heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan','kexin']; check('③ 七位各一種結尾（以安、語彤、芷若、子晴、學姊、沛珊、可昕），互不相同',want.every(k=>E[k])&&new Set(want.map(k=>E[k])).size===7,J(E));
  const L=BADCLIP.LINES; check('③ 台詞照 AA_485（以安、語彤、學姊、沛珊；芷若、子晴、可昕、男生朋友不說）',L.heroine_01==='替補也是校隊。'&&L.heroine_03==='……你說不笑的。'&&L.heroine_05==='發球我練過。後面的沒有。'&&L.classmate_peishan==='欸，剛剛那球怎麼打的？再一次！'&&!L.heroine_02&&!L.heroine_04&&!L.kexin);
  const src=fs.readFileSync(path.join(ROOT,'src/badminton_clip3d.js'),'utf8'); check('③ 短片裡不說話（沒有 GM.say）、其他人＝男生朋友那一種（default）',!/GM\.say\(/.test(src)&&/default:\s*\/\/ 男生朋友/.test(src)); }
{ const c=BADCLIP._court(), L=GYM_LAYOUT; check('④ 場地：1F 北排中間那一面 (0, −11.2)',c.x===0&&c.z===-11.2&&L.courts.badminton.some(q=>q[0]===c.x&&q[1]===c.z));
  const H=L.hall; check('④ 場地（13.4×6.1 m）、遠景機位（場地南邊 12.5 m、高 5.8 m）都在 1F 球場裡（不在大廳的隔牆後面）',c.z-6.7>H.z0&&c.z+6.7<H.z1&&c.z+12.5<H.z1-0.5&&5.8<H.h); }
{ const ch=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  check('⑤ character3d.js：疊加姿勢 u.overlay（x、z 乘 sx，slerp 比例 k）',/if\(u\.overlay&&u\.overlay\.bones\)\{[^\n]*OVE\.set\(r\[0\]\*sx,r\[1\],r\[2\]\*sx\)[^\n]*slerp\(OVQ,k\)/.test(ch));
  check('⑤ index.html 在 gym3d.js 後面載入 src/badminton_clip3d.js',ix.indexOf('src/badminton_clip3d.js')>ix.indexOf('src/gym3d.js')&&ix.indexOf('src/gym3d.js')>0);
  const m=ASSETS.manifest['bldg.badminton_props']; check('⑤ ASSETS.manifest 有 bldg.badminton_props（building、lazy）',!!m&&m.type==='building'&&m.lazy===true);
  const p=path.join(ROOT,'assets/models/env/second_ai/badminton_props.glb'); let names=[]; if(fs.existsSync(p)){ const b=fs.readFileSync(p); const jl=b.readUInt32LE(12); names=(JSON.parse(b.slice(20,20+jl).toString()).nodes||[]).map(n=>n.name); }
  check('⑤ badminton_props.glb 有兩支球拍、羽球、球網',['badminton_racket','badminton_racket_b','badminton_shuttle','badminton_net'].every(n=>names.includes(n)),names.slice(0,8).join(' ')); }
{ const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), m=g.match(/function staleCheck[\s\S]*?live=([^;]*);/);
  check('⑥ 卡住偵測（game3d.js staleCheck）：羽球短片在演的時候算「有東西在演」——短片約 13 秒、沒有對話，超過 10 秒會跳「畫面好像停住了」（真機也會）',!!m&&/BADCLIP\.busy/.test(m[1]),m?'':'找不到 staleCheck'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
