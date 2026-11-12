#!/usr/bin/env node
/* CC-C（帳號 C）11-04：EXAMLIB（期末考前的圖書館，EXAM-LIB-CROWD-1104）——照日期推的作息檢查（BB-C 17:29；規格 BB_260 第 1、2 節，e814965c2）。
   LAWWW 的 tests/exam_lib_crowd_unit.js（112 項）逐一測函式；這支補它沒測的：BB_260 第 1 節的作息表（BB-C 17:3x 才定，比 8215f8d53 晚）。
   做法：第 14～16 週每一天 08:00～22:00 每 30 分鐘問一次遊戲「這個人現在在哪」（STORY.schedEnt，包含 EXLIB.sched 那一層），對 BB_260 的表：
     - 表上的時段裡：原本作息（EXLIB.base）是上課、考試、劇情、約好的＝優先，另外記（不算沒到）；其他時間要在表上那一間＝「到」，不在＝「沒到」。
     - 第 16 週（考試週）照 BB_260「時段一樣，考試的時間優先」。
   T-e 子晴（一、三、五 13:00～17:30、六 10:00～15:00，總圖大廳二樓）、阿哲（一～四 10:40～16:30、日 13:00～18:00，總圖 B1）、Alison（一、二、四、五 11:00～17:00，總圖 B1）、
       明軒（一～四 13:00～19:00，法律系館A 4F）；阿哲、Alison、明軒是「大二以後」→ 用大二上（Y2S1）；子晴另外看大一上（Y1S1）。同一天同一間最多三位。
   T-f 舊序章系所那一年：舊序章同學 8～14（社科圖一樓）、舊序章同學 8～17（社科圖二樓；還沒有二樓＝一樓）、舊序章同學 8～12（總圖 B1），平日。
   BB_260：T-e 要等 LAWWW 照第 1 節補作息才能 PASS；補好以前先跑、FAIL 照實記。判定歸 BB。
   【前置／捷徑】pg_harness 的假 GM＋照 index.html 的順序載入其餘的檔（同 tests/exam_lib_crowd_unit.js 的載法）；直接設 G 的日期時間。
   r2（BB-C 17:34、17:35；37c354189）：只有原本空檔、wander、walk 的時段換成讀書（來源 bb260）；原本有事的照舊；不去的那天只看有沒有新加的；另加 BB-C 點名的五個時間點。
   用法：LW_ROOT=<開發分支 worktree> node cc_examlib_walk.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
require(path.join(ROOT,'tests','alison.js'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const J=JSON.stringify; let FAILS=0;
const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) FAILS++; return ok; };
const info=s=>console.log('INFO '+s);
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{}; console.warn=()=>{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
const loadErr=[];
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f); } }
const HAVE=typeof EXLIB!=='undefined';
const DK=k=>STORY.dayOfKey(k);
const setT=(d,h)=>{ H.G.day=d; H.G.hour=h; const w=CALENDAR.dateOf(d).wd; H.G.weekday=w===7?0:w; };
const WD=['','一','二','三','四','五','六','日'];
const hm=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0');
const daysOfWeek=(term,week)=>{ const r=CALENDAR.termDays(term), out=[]; for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week) out.push(d); } return out; };
const zoneNow=id=>{ const c=CHARACTERS[id]; if(!c) return {zone:null,why:'沒有這個人'}; let e=null; try{ e=STORY.schedEnt(c,H.G); }catch(err){ return {zone:null,why:'例外 '+String(err).slice(0,80)}; } return {zone:e&&e.zone||null,src:e&&e.exlib||null,act:e&&e.act||null}; };
const baseNow=id=>{ try{ return EXLIB.base(CHARACTERS[id],H.G); }catch(e){ return null; } };
const prior=b=>!!b&&(!!b.cls||b.act==='class'||b.act==='exam'||!!b.pri||!!b.talkEvent||!!b.invite||!!b.activity||!!b.spot||/work|job|shift/.test(String(b.act||'')));
/* r2（BB-C 17:34／17:35；37c354189）：只有原本是空檔、wander、walk 的時段才換成讀書（來源 'bb260'）；上課、吃飯、劇情、約好的照舊。
   「不去」那一天＝不新增（只看有沒有 'bb260'）；原本就有的讀書時段搬到表上那一間（來源 '3'）照 AA_669 本來就對 */
const fillable=b=>!b||((b.act==='wander'||b.act==='walk')&&!prior(b));

/* BB_260 第 1 節（照抄）：[人, 名字, 區域, [[星期 1～7, 從, 到], ...], 學期] */
const TABLE=[
  ['heroine_04','子晴','library_hall',[[1,13,17.5],[3,13,17.5],[5,13,17.5],[6,10,15]],['Y1S1','Y2S1']],
  ['zhe','阿哲','library_b1',[[1,10+40/60,16.5],[2,10+40/60,16.5],[3,10+40/60,16.5],[4,10+40/60,16.5],[7,13,18]],['Y2S1']],
  ['yu','Alison','library_b1',[[1,11,17],[2,11,17],[4,11,17],[5,11,17]],['Y2S1']],
  ['classmate_mingxuan','明軒','linze_4f',[[1,13,19],[2,13,19],[3,13,19],[4,13,19]],['Y2S1']] ];
const NOT={zhe:[5],yu:[3],classmate_mingxuan:[5]};   /* 「五不去」「三不去」——對上 4-1「不行」那幾句 */

(async()=>{
  check('載入：EXLIB、EXAMLIB_LINES 都在（照 index.html 順序）',HAVE&&typeof EXAMLIB_LINES!=='undefined',loadErr.length?'沒載進來的檔 '+loadErr.length+' 個（和這一批無關的可以略過）':'');
  if(!HAVE){ console.log('FAILED '+FAILS); process.exit(1); }
  const law0=key=>{ H.fresh(key,9,'dorm',{}); H.G.stage='law'; if(typeof EXLIB._reset==='function') EXLIB._reset(); };
  for(const [id,name,zone,slots,terms] of TABLE){
    for(const term of terms){
      const r=CALENDAR.termDays(term); law0(CALENDAR.dateOf(r.from).key);
      const res={hit:0,miss:0,prio:0,closed:0,ex:[],prioEx:[],notDay:{n:0,lib:0,ex:[]}};
      for(const week of [14,15,16]){
        for(const d of daysOfWeek(term,week)){
          const wd=CALENDAR.dateOf(d).wd;
          for(let h=8;h<22;h+=0.5){
            setT(d,h); const on=EXLIB.on(H.G,d,h); if(!on) continue;
            const s=slots.find(q=>q[0]===wd&&h>=q[1]&&h<q[2]); const now=zoneNow(id), b=baseNow(id);
            if(s){ if(!EXLIB.isOpen(zone,d,h)){ res.closed++; continue; }
              if(!fillable(b)){   /* 原本有事（上課、吃飯、劇情、約好的、原本就在讀書）＝照舊：不能被 bb260 蓋掉 */
                res.prio++; if(now.src==='bb260'){ res.over=(res.over||0)+1; if(res.ex.length<4) res.ex.push(CALENDAR.dateOf(d).key+'（'+WD[wd]+'）'+hm(h)+' 原本 '+(b.zone||'-')+'/'+(b.act||'-')+' 被換成讀書'); }
                else if(res.prioEx.length<3) res.prioEx.push(CALENDAR.dateOf(d).key+'（'+WD[wd]+'）'+hm(h)+' '+(b.zone||'')+'/'+(b.act||'')+'→'+(now.zone||'-'));
                continue; }
              if(now.zone===zone){ res.hit++; continue; }
              res.miss++; if(res.ex.length<4) res.ex.push(CALENDAR.dateOf(d).key+'（'+WD[wd]+'）'+hm(h)+' 在 '+(now.zone||'（不在場）')+(b?'（原本 '+(b.zone||'-')+'/'+(b.act||'-')+'）':'（原本沒有作息）'));
            } else if((NOT[id]||[]).includes(wd)){ res.notDay.n++; if(now.src==='bb260'){ res.notDay.lib++; if(res.notDay.ex.length<2) res.notDay.ex.push(CALENDAR.dateOf(d).key+' '+hm(h)); } else if(now.zone===zone) res.notDay.moved=(res.notDay.moved||0)+1; }
          }
        }
      }
      const tot=res.hit+res.miss;
      info('[T-e] '+name+'（'+id+'）'+term+' 第 14～16 週、表上的時段（每 30 分）：在 '+zone+' '+res.hit+'／'+tot+'；上課等優先 '+res.prio+'；那一間沒開 '+res.closed+(res.prioEx.length?'；優先例 '+J(res.prioEx):''));
      check('[T-e] '+name+' '+term+'：表上的時段、原本是空檔／wander／walk 的都在 '+zone,tot>0&&res.miss===0,res.miss?('沒到 '+res.miss+'／'+tot+'，例 '+J(res.ex.filter(x=>!/被換成讀書/.test(x)))):'');
      check('[T-e] '+name+' '+term+'：原本有事的時段照舊（沒有被換成讀書）',!res.over,res.over?(res.over+' 格，例 '+J(res.ex.filter(x=>/被換成讀書/.test(x)))):res.prio+' 格照舊');
      if(NOT[id]) check('[T-e] '+name+' '+term+'：星期'+NOT[id].map(w=>WD[w]).join('、')+'不新增讀書時段（沒有 bb260；原本的讀書搬過去 '+(res.notDay.moved||0)+' 格照 AA_669 算對）',res.notDay.lib===0,res.notDay.lib?J(res.notDay.ex):'');
    }
  }
  /* BB-C 17:34 點名的時間點（LAWWW 的做法：只填空檔）*/
  { const spot=(term,wd,h)=>{ const r=CALENDAR.termDays(term); for(const week of [14,15]) for(const d of daysOfWeek(term,week)) if(CALENDAR.dateOf(d).wd===wd) return [d,h]; return null; };
    const look=(id,term,wd,h)=>{ const r=CALENDAR.termDays(term); law0(CALENDAR.dateOf(r.from).key); const sp=spot(term,wd,h); if(!sp) return null; setT(sp[0],sp[1]); const n=zoneNow(id), b=baseNow(id);
      return {at:CALENDAR.dateOf(sp[0]).key+'（'+WD[wd]+'）'+hm(sp[1]), now:n.zone, src:n.src, act:n.act, base:b?(b.zone||'-')+'/'+(b.act||'-'):null}; };
    let r;
    r=look('zhe','Y2S1',1,11); check('[T-e] 阿哲 週一 11:00 照舊上課（不換）',!!r&&r.src!=='bb260'&&/class/.test(String(r.act)+String(r.base)),J(r));
    r=look('zhe','Y2S1',1,16); check('[T-e] 阿哲 週一 16:00 原本在校園晃 → 在 B1（bb260）',!!r&&r.now==='library_b1'&&r.src==='bb260',J(r));
    r=look('zhe','Y2S1',7,12); check('[T-e] 阿哲 週日 12:00 照舊在 118 巷吃飯（不換）',!!r&&r.src!=='bb260'&&r.now!=='library_b1',J(r));
    r=look('classmate_mingxuan','Y2S1',1,18); check('[T-e] 明軒 大二 週一 18:00 原本在 118 巷走路 → 在 A館 4F（bb260）',!!r&&r.now==='linze_4f'&&r.src==='bb260',J(r));
    r=look('classmate_mingxuan','Y1S1',1,18); check('[T-e] 明軒 大一 週一 18:00 不加（since Y2S1）',!!r&&r.src!=='bb260',J(r)); }
  /* 同一天同一間最多三位（表上的人＋第 3 節其他人；pool 不在 EXLIB 的名單裡、照 crowd3d）*/
  { const term='Y2S1'; let worst=null; for(const week of [14,15]) for(const d of daysOfWeek(term,week)) for(let h=8;h<22;h+=1){ setT(d,h); if(!EXLIB.on(H.G,d,h)) continue; const cnt={};
      for(const id of Object.keys(EXLIB.cast(H.G))){ if(!EXLIB.inCast(H.G,id)) continue; const z=zoneNow(id).zone; if(z&&EXLIB.isLib(z)) cnt[z]=(cnt[z]||0)+1; }
      for(const z in cnt) if(!worst||cnt[z]>worst.n) worst={n:cnt[z],z,at:CALENDAR.dateOf(d).key+' '+hm(h)}; }
    check('[T-e] 同一天同一間最多三位（第 3 節的名單；Y2S1 第 14～15 週每小時）',!worst||worst.n<=3,J(worst)); }
  /* ---------- T-f 舊序章系所那一年 ---------- */
  /* ECON=off（預設；BB-C 21:08 EXAMLIB_econ_off，f6e9df954：AA_669 第 5 節 11-04 17:2x 改「不用做」、AA-C 20:56）：舊序章系所那一年第 14～16 週——
     舊序章同學、舊序章同學、舊序章同學都沒有 exlib 的時段（schedEnt 的 exlib 欄、EXLIB.on 都是 false）、沒有「明天幫我占位子」（topicOk）、在家那幾天和進圖書館都沒有圖書館的旁白（atmosDue）。ECON=on＝原本的期望值（第 5 節的設計）*/
  if((process.env.ECON||'off')==='off'){ const ET=['Y0S1','Y0S2'].filter(t=>{ try{ const r=CALENDAR.termDays(t); return !!r&&r.to>r.from; }catch(e){ return false; } }); info('[T-f off] 舊序章系所的學期：'+J(ET));
    const Y0={econ_pinyu:'舊序章同學',econ_zhengxun:'舊序章同學',econ_weilun:'舊序章同學'};
    for(const term of ET){ const r=CALENDAR.termDays(term); H.fresh(CALENDAR.dateOf(r.from).key,9,'dorm',{}); H.G.stage='econ'; EXLIB._reset&&EXLIB._reset();
      const days=[14,15,16].flatMap(w=>daysOfWeek(term,w)); let on=0, cells=0;
      for(const [id,name] of Object.entries(Y0)){ let ex=0, exs=[], top=0, n=0;
        for(const d of days) for(let h=7;h<23.5;h+=0.5){ setT(d,h); n++; const z=zoneNow(id); if(z.src){ ex++; if(exs.length<3) exs.push(CALENDAR.dateOf(d).key+' '+hm(h)+' '+z.zone+'（'+z.src+'）'); } if(EXLIB.on(H.G,d,h)) on++; cells++;
          if(h>=18&&h<23&&EXLIB.topicOk&&EXLIB.topicOk(H.G,id)) top++; }
        check('[T-f off] '+term+' '+name+'：第 14～16 週沒有 exlib 的時段（'+days.length+' 天、每 30 分鐘）',ex===0,ex?(ex+' 格：'+J(exs)):(n+' 格都沒有'));
        check('[T-f off] '+term+' '+name+'：18:00～23:00 沒有「明天幫我占位子」這個話題（EXLIB.topicOk）',top===0,String(top)); }
      check('[T-f off] '+term+'：第 14～16 週 EXLIB.on 都是 false',on===0,on+'／'+cells);
      /* 在家那幾天（舊序章離校 Y0_LEFT 以後在家）、還有走進圖書館：都沒有圖書館的旁白 */
      let atm=0, atmEx=[]; const GMo=H.GM;
      for(const d of days) for(const zh of ['home','library_hall','soclib','library_b1']){ setT(d,10); H.G.zone=zh; H.G.flags.Y0_LEFT=(zh==='home'); let a=false; try{ a=!!EXLIB.atmosDue(GMo); }catch(e){ a=false; } if(a){ atm++; if(atmEx.length<3) atmEx.push(CALENDAR.dateOf(d).key+' '+zh); } }
      H.G.flags.Y0_LEFT=false; H.G.zone='dorm';
      check('[T-f off] '+term+'：在家那幾天、走進圖書館（大廳、社科圖、B1）都沒有圖書館的旁白（EXLIB.atmosDue）',atm===0,atm?J(atmEx):'');
    } }
  else { const ET=['Y0S1','Y0S2'].filter(t=>{ try{ const r=CALENDAR.termDays(t); return !!r&&r.to>r.from; }catch(e){ return false; } }); info('[T-f] 舊序章系所的學期（termDays 拿得到的）：'+J(ET));
    const Y0={econ_pinyu:['舊序章同學','soclib',8,14],econ_zhengxun:['舊序章同學','soclib',8,17],econ_weilun:['舊序章同學','library_b1',8,12]};
    for(const term of ET){
      const r=CALENDAR.termDays(term); if(!r) continue; H.fresh(CALENDAR.dateOf(r.from).key,9,'dorm',{}); H.G.stage='econ'; EXLIB._reset&&EXLIB._reset();
      for(const [id,[name,zone,f,t]] of Object.entries(Y0)){ let hit=0, tot=0, wk=0, ex=[];
        for(const d of daysOfWeek(term,14).concat(daysOfWeek(term,15))){ const wd=CALENDAR.dateOf(d).wd; for(let h=8;h<22;h+=0.5){ setT(d,h); if(!EXLIB.on(H.G,d,h)) continue; const z=zoneNow(id).zone;
          if(wd<=5&&h>=f&&h<t&&EXLIB.isOpen(zone,d,h)){ tot++; if(z===zone) hit++; else if(ex.length<3) ex.push(CALENDAR.dateOf(d).key+' '+hm(h)+' 在 '+(z||'（不在場）')); }
          if(wd>=6&&z&&EXLIB.isLib(z)) wk++; } }
        check('[T-f] '+term+' '+name+'：平日 '+f+'～'+t+' 在 '+zone,tot>0&&hit===tot,hit+'／'+tot+(ex.length?'，例 '+J(ex):''));
        check('[T-f] '+term+' '+name+'：週末不在圖書館（Y0_SLOTS 只有平日）',wk===0,String(wk));
        H.G.flags.Y0_LEFT=true; const ok=EXLIB.topicOk?EXLIB.topicOk(H.G,id):false; H.G.flags.Y0_LEFT=false;
        check('[T-f] '+term+' '+name+'：舊序章離校（Y0_LEFT）以後不能約（明天幫我占位子的話題不出）',!ok,J(ok)); }
    } }
  console.log(FAILS?('FAILED '+FAILS):'ALL PASS'); process.exit(FAILS?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
