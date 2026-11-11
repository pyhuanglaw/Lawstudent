// 座位上課可以略過對話（BB 2026-11-11：課堂內容補寫後一堂 9～16 句，D118 不用反覆點）＋第一次答完課堂題提示去哪看。不需要瀏覽器。
//  1 game3d.js：GM.skipScope／略過鍵／skipOn 接在 showLine、dlgAdvance、choose（選項出來就停、玩家自己選）
//  2 用 game3d.js 的那幾段原始碼在假的 DOM 上跑：範圍外沒有按鈕；範圍內按了一路翻；選項出來 skip 關掉；範圍結束關掉
//  3 CLS.attend：開始 skipScope(true)、結束（含丟例外）skipScope(false)；出席照記
//  4 第一次答完課堂題：toast 一次（S.ASK_NOTE_HINT），第二次不再出
// 修改前（開發分支 29de0d987）：沒有 GM.skipScope → 1、2、3 FAIL；沒有提示 → 4 FAIL。
// 用法：node tests/class_skip_1111_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H;
const J=JSON.stringify, SRC=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'), CL=fs.readFileSync(path.join(H.ROOT,'src/classes3d.js'),'utf8');
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
const fresh=(d,h)=>{ const G=H.fresh('2026-01-01',h,'campus',{}); setDay(d,h); G.outings=[]; EVENTS.zoneChanged(); return G; };
(async()=>{
  check('1. game3d.js 有 GM.skipScope、skipOn 接在 showLine（自動翻）、dlgAdvance（打字中也接著翻）、choose（選項出來關掉）',
    /GM\.skipScope=function\(on\)\{ D\.skipOK=!!on; if\(!on\) D\.skip3d=false; skipBtnSync\(\); \}/.test(SRC)&&/skipBtnSync\(\); if\(skipOn\(\)\) setTimeout\(/.test(SRC)&&/if\(!skipOn\(\)\) return true;/.test(SRC)&&/ADV\.skip=false; if\(D\.skip3d\)\{ D\.skip3d=false; skipBtnSync\(\); \}/.test(SRC));
  /* 2：把 skipOn／skipBtnSync／GM.skipScope 三行原始碼拿出來，在假的 DOM 上跑 */
  { const m=/  const skipOn=[\s\S]*?GM\.skipping=\(\)=>skipOn\(\);\n/.exec(SRC); check('2. 取得到那一段原始碼',!!m);
    if(m){ const els={}, mk=id=>({id,style:{},children:[],listeners:{},appendChild(c){ this.children.push(c); if(c.id) els[c.id]=c; },addEventListener(t,f){ this.listeners[t]=f; }}); els.dlg=mk('dlg');
      const D={}, ADVx={active:false,skip:false}; let adv=0; const GMx={};
      const f=new Function('D','ADV','GM','$','document','dlgAdvance',m[0]+'\nreturn {skipOn,skipBtnSync};');
      const api=f(D,ADVx,GMx,id=>els[id]||null,{createElement:()=>mk('')},()=>{ adv++; });
      api.skipBtnSync(); check('2. 範圍外：不建按鈕、skipOn 是 false',!els.dlgSkip&&api.skipOn()===false);
      GMx.skipScope(true); const b=els.dlgSkip; check('2. 範圍內：按鈕出現（44px 高、字是「略過 »」、在對話框左上方——橫向時選單在右邊，不重疊；2026-11-11 BB：原本在右上方，收起來以後原位就是最下面的選項）',!!b&&b.style.display==='block'&&/height:44px/.test(b.style.cssText)&&/left:10px;top:-50px/.test(b.style.cssText)&&b.textContent==='略過 »');
      if(b){ b.listeners.pointerup({stopPropagation(){}}); check('2. 按了：skipOn 變 true、馬上翻一句、按鈕收起來',api.skipOn()===true&&adv===1&&b.style.display==='none');
        GMx.skipScope(false); check('2. 範圍結束：skip 關掉、按鈕不見',api.skipOn()===false&&b.style.display==='none');
        b.listeners.pointerup({stopPropagation(){}}); check('2. 範圍外按（殘留的事件）沒有作用',api.skipOn()===false&&adv===1);
        GMx.skipScope(true); D.menuOn=true; api.skipBtnSync(); check('2. 選項出來的時候（D.menuOn）：按鈕收起來；選完再出現',b.style.display==='none'&&(D.menuOn=false,api.skipBtnSync(),b.style.display==='block')); check('2. 原始碼：renderChoose 一開始設 D.menuOn＝true、done 設回 false',/shownAt=performance\.now\(\), guard=c\.guard\|\|TAP_GUARD; \$\('dlg'\)\.classList\.remove\('side'\); D\.menuOn=true; skipBtnSync\(\);/.test(SRC)&&/const done=\(i\)=>\{ D\.menuOn=false;/.test(SRC));
        GMx.skipScope(true); ADVx.active=true; api.skipBtnSync(); check('2. 2D 畫面（ADV）開著：不顯示這顆（用 2D 自己的「略過對話」）',b.style.display==='none'); ADVx.skip=true; check('2. ADV.skip 照舊算略過',api.skipOn()===true); } } }
  /* 3：CLS.attend 包著 skipScope */
  { let it=null, G=null, day=0; const d0=STORY.termDayIn('Y1S1',3,1);
    for(let d=d0; d<d0+7&&!it; d++){ G=fresh(d,8); const c=CLS.dayItems(G,d).find(x=>!x.exam&&x.c.kind!=='service'&&CLS.content(x).line&&x.c.syllabus); if(c){ it=c; day=d; } }
    const calls=[]; GM.skipScope=on=>calls.push(on);
    H.said=[]; H.opts=[]; H.picks=[0,0,0,0,0,0]; await CLS.attend(GM,it,{forced:true});
    check('3. CLS.attend：先 skipScope(true)、最後 skipScope(false)；出席照記',J(calls)===J([true,false])&&!!CLS.rec(H.G).done[it.key],J(calls));
    check('3. 原始碼：skipScope(false) 在 finally 裡（丟例外也會關）',/\} finally \{ if\(GM\.skipScope\) GM\.skipScope\(false\);/.test(CL));
    delete GM.skipScope; }
  /* 4：第一次答完課堂題的提示 */
  { const toasts=[]; const t0=GM.toast; GM.toast=(t)=>toasts.push(t);
    let done=0; for(const cid in SYLLABUS.courses){ if(done>=2) break; for(const w of SYLLABUS.courses[cid]){ if(done>=2) break; if(!w.ask) continue; const c=COURSES.list.find(x=>x.id===cid); if(!c) continue; const fake={c,week:w.w,term:'Y1S1',key:'t'+done,day:H.G.day}; if(!CLS.askOf(fake)) continue; H.said=[]; H.picks=[0]; await CLS.classAsk(GM,fake,null,{}); done++; } }
    check('4. 答了兩題：提示只出一次，字是 S.ASK_NOTE_HINT；旗標 ASK_NOTE_HINT 有記',done===2&&toasts.filter(t=>t===CLS.ASK_NOTE_HINT).length===1&&!!H.G.flags.ASK_NOTE_HINT,J([done,toasts]));
    GM.toast=t0; }
  H.done();
})();
