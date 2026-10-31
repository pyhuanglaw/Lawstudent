// 兩點半 Café 吧檯後面的店員（芷若，作息 act:'barista'，(-2.5,-5.15)）玩家和得到話（2026-10-14 v9.7 回歸 flow_first_meet C 抓到：
// 吧檯的點餐點 (-2.5,-3.2) 在玩家這一側，玩家站得到的地方點餐點永遠比較近，「和店員說話」從來不會出現——芷若在 Café 的第一次見面、
// 之後的點餐次數（CAFE_VISITS）、集點卡、店裡的聯絡方式都碰不到；2026-10-09 起就是這樣）。不需要瀏覽器：在 Node 裡建出 Café，照引擎的 nearestInteractable 檢查：
//   1. 店員在：吧檯前面站得住的地方有「和店員說話」（0.1 m 格點）；正前方 (-2.5,-3.2) 一帶就是；
//   2. 修正前的引擎（v9.7 候選 4 6ad0923）同樣的位置一處都沒有——這個測試在有 bug 的版本失敗；
//   3. 店員不在（不是她的班）：吧檯的點餐點照舊碰得到、位置不變；其他互動點（出口、座位）不受影響；
//   4. 只有標了 staff 的人會蓋過點餐點：一般的人（沒有 staff）站在同一個位置，點餐點照舊優先；
//   5. 原始碼：作息 barista 生出來的人有 staff；和店員說話先跑她的事件、約好的見面，沒有的話就是點餐（同一份菜單 CAFE_MENU）。
// 這是模擬（沒有畫面、沒有真的點按鈕）；瀏覽器版：tests/flow_first_meet.py 的 C。用法：node tests/cafe_barista_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const _warn=console.warn; console.warn=()=>{}; const _err=console.error; console.error=()=>{};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.cafe.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.fitSeatRadius) E.fitSeatRadius();
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const BX=-2.5, BZ=-5.15;
const mkNpc=(staff)=>({name:'林芷若',talkLabel:'和店員說話',talk(){},staff,obj:{position:new THREE.Vector3(BX,0,BZ)}});
function scan(nearest,who){ const hit=[], lab={}; for(let x=-8;x<=4+1e-6;x+=0.1) for(let zz=-7;zz<=-1+1e-6;zz+=0.1){ if(!E.canStand(x,zz,0.32,0)) continue; E.player.obj.position.set(x,0,zz); const it=nearest(); if(it&&who&&it.npc===who) hit.push([+x.toFixed(2),+zz.toFixed(2)]); if(Math.hypot(x-BX,zz-BZ)<2.2){ const L=it?it.label:'(none)'; lab[L]=(lab[L]||0)+1; } } return {hit,lab}; }
const bar=E.interactables.find(it=>it.counter==='cafe');
check('吧檯的點餐點還在原來的位置 (-2.5,-3.2)',!!bar&&bar.x===-2.5&&bar.z===-3.2,JSON.stringify(bar&&{x:bar.x,z:bar.z,r:bar.radius}));
// 1. 店員在
const staff=mkNpc('cafe'); E.npcs=[staff]; const A=scan(E.nearestInteractable,staff);
check('1. 店員在：吧檯前面有「和店員說話」',A.hit.length>=20,A.hit.length+' 處；店員 2.2 m 內看到的按鈕 '+JSON.stringify(A.lab));
check('1. 正前方 (-2.5,-3.2) 一帶（±0.5 m）就是「和店員說話」',A.hit.some(([x,zz])=>Math.abs(x-BX)<=0.5&&Math.abs(zz+3.2)<=0.5),JSON.stringify(A.hit.slice(0,6)));
{ E.player.obj.position.set(-2.5,0,-3.1); const it=E.nearestInteractable(); check('1. 站在點餐點正前方 (-2.5,-3.1)：按鈕是「和店員說話」',it&&it.npc===staff&&it.label==='和店員說話',it&&it.label); }
// 2. 修正前的引擎
{ let old=null; try{ old=cp.execSync('git show 6ad0923:src/engine3d.js',{cwd:ROOT,encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!old) console.log('（略過第 2 項：這個 checkout 沒有 6ad0923 的歷史）');
  else { const i=old.indexOf('E.nearestInteractable=function(){'), j=old.indexOf('return best; };',i)+'return best; };'.length; const src=old.slice(i,j).replace('E.nearestInteractable=function','return function');
    const oldNearest=vm.runInThisContext('(function(E){'+src+'})')(E); const B=scan(oldNearest,staff);
    check('2. 修正前的引擎（6ad0923）：同樣的位置一處「和店員說話」都沒有（有 bug 的版本在第 1 項失敗）',B.hit.length===0,B.hit.length+' 處；'+JSON.stringify(B.lab)); } }
// 3. 店員不在
E.npcs=[]; { E.player.obj.position.set(-2.5,0,-3.1); const it=E.nearestInteractable(); check('3. 店員不在：站在吧檯前面是「到吧檯點餐」',it&&it.counter==='cafe'&&it.label==='到吧檯點餐',it&&it.label); }
{ const ex=E.interactables.find(it=>it.exit); E.player.obj.position.set(ex.x,0,ex.z-0.6); const it=E.nearestInteractable(); check('3. 出口照舊（店員在不在都一樣）',it===ex,it&&it.label); E.npcs=[staff]; const it2=E.nearestInteractable(); check('3. 店員在的時候出口也照舊',it2===ex,it2&&it2.label); E.npcs=[]; }
// 4. 一般的人不會蓋過點餐點
{ const plain=mkNpc(undefined); E.npcs=[plain]; E.player.obj.position.set(-2.5,0,-3.1); const it=E.nearestInteractable(); check('4. 沒有 staff 的人站在同一個位置：點餐點照舊優先',it&&it.counter==='cafe',it&&it.label); E.npcs=[]; }
// 5. 原始碼
const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
check('5. 作息 barista 生出來的人標 staff',/act==='barista'\)\{[^\n]*n\.staff='cafe'/.test(st));
check('5. 作息 barista 生出來的人：認識了按鈕就是她的名字（「和林芷若說話」），不認識才是「和店員說話」（BB-B 10-31 n25_xinci_i；修改前生出來一律「和店員說話」）',/act==='barista'\)\{[^\n]*n\.talkLabel=SOCIAL\.has\(id,'FIRST_MET'\)\?'和'\+n\.name\+'說話':'和店員說話'/.test(st));
const tc=st.slice(st.indexOf('S.talkCharacter=async function'),st.indexOf('let GM_ref=null'));
const iEv=tc.indexOf('EVENTS.onInteract(id)'), iInv=tc.indexOf('INV.meetable(G,id)'), iStaff=tc.indexOf("n.staff==='cafe'");
check('5. 和店員說話：先跑她的事件、再看約好的見面、都沒有才點餐',iEv>0&&iInv>iEv&&iStaff>iInv,[iEv,iInv,iStaff].join(','));
check('5. 點餐用同一份菜單（吧檯點餐點和店員都是 CAFE_MENU）',/n\.staff==='cafe'\)\{ await counter\(GM_ref,'兩點半 Café',CAFE_MENU\)/.test(tc)&&/it\.counter==='cafe'\)\{ await counter\(GM,'兩點半 Café',CAFE_MENU\)/.test(st));
check('5. 和她說話跑了事件：演完（劇情結束）才更新按鈕上的名字（見過以後是「和林芷若說話」）',/if\(EVENTS\.onInteract\(id\)\)\{ const lab=\(\)=>\{ n\.name=SOCIAL\.npcName\(id\); n\.talkLabel=\(n\.staff&&!SOCIAL\.has\(id,'FIRST_MET'\)\)\?'和店員說話':'和'\+n\.name\+'說話'; \}; lab\(\); const w=setInterval\(\(\)=>\{ if\(!\(GM_ref\.D&&GM_ref\.D\.busyDepth>0\)\)\{ clearInterval\(w\); lab\(\); \} \},400\); return; \}/.test(tc));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
