// 發行包的最小冒煙測試（REL-PACKAGING-1111）：用預裝的 Playwright（Node）開打包出來的網頁，看有沒有 404、載入失敗、JS 例外。
// 用法：先 `node tools/release/verify_dist.js dist/web --serve 8791`，再
//       node tools/release/smoke_dist.js http://127.0.0.1:8791/index.html [--json out.json] [--zones all|deploy|數字] [--budget 秒] [--from N]
// 做三件事：
//   A 開首頁 → 等載入畫面消失 → 讀標題的版本字樣、script 的 ?v=。
//   B 按「從法律系開始」開新遊戲（真的按按鈕）→ 等 25 秒 → 看進了哪一區、有沒有例外。
//   C 另開一頁，照 tests/deploy_check.py 的做法用 GAME.applySave 逐區進去（預設全部區域，有時間上限），記每一區有沒有進去、人物是不是正式 VRM。
// 這是雲端 headless Chromium（軟體算圖 SwiftShader，沒有顯示卡）的冒煙測試：只證明「這份包在瀏覽器裡載得起來、沒有缺檔」；
// 不是使用者電腦、不是 iPhone 實機、不看畫面對不對。正式的瀏覽器驗收歸 BB／CC（docs/RELEASE_PACKAGING.md 第 9 節）。
// 結束碼：0＝沒有本機資源載入失敗、沒有 JS 例外、標題與新遊戲正常；1＝有；2＝執行錯誤。
'use strict';
const fs=require('fs');
const args=process.argv.slice(2); const opt=n=>{ const i=args.indexOf(n); return i>=0?args[i+1]:null; };
const URL0=args.find((a,i)=>!a.startsWith('--')&&!['--json','--zones','--budget','--from'].includes(args[i-1]))||'http://127.0.0.1:8791/index.html';
const BUDGET=(Number(opt('--budget'))||780)*1000, ZMODE=opt('--zones')||'all';
const DEPLOY_ZONES=['campus','gongguan','wenzhou','classroom','wancai','library_hall','library','cafe','cvs','noodle','bookstore','dorm','lawlib','gongtong','boya','putong','soclib','dorm_hall','linze','gym','gym_b1','lane118','airport_dep','airport_arr','us_apartment','us_shared','us_outside','us_market','us_asian_market'];
const FLAGS={introDone:true,campusIntro:true,classDone:true,metAn:true,met_an:true,afternoonDone:true,lawclub:true,wenzhouLine:true};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const out={url:URL0,env:'雲端 headless Chromium（Playwright，軟體算圖）；不是使用者電腦、不是 iPhone 實機',startedAt:new Date().toISOString(),steps:[],bad:[],external:[],pageErrors:[],consoleErrors:[],zones:[],requests:0};
const log=(ok,name,info)=>{ out.steps.push({ok:!!ok,name,info:info||''}); console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); };
(async()=>{
  const {chromium}=require('playwright'); const t0=Date.now();
  const b=await chromium.launch(); const origin=new URL(URL0).origin; const reqs=new Set();
  const hook=pg=>{ const bad=(s,u)=>{ (u.startsWith(origin)?out.bad:out.external).push({status:s,url:u.replace(origin,'')}); };
    pg.on('response',r=>{ if(r.status()>=400) bad(r.status(),r.url()); }); pg.on('requestfailed',r=>bad('FAILED '+((r.failure()||{}).errorText||''),r.url()));
    pg.on('request',r=>reqs.add(r.url())); pg.on('pageerror',e=>out.pageErrors.push(String(e&&e.message||e).slice(0,300))); pg.on('console',m=>{ if(m.type()==='error') out.consoleErrors.push(m.text().slice(0,300)); }); };
  const loaded=async pg=>{ for(let i=0;i<480;i++){ if(await pg.evaluate("!!(typeof GAME!=='undefined'&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')&&(!GAME.charsAllP||!!GAME.charsAll))").catch(()=>false)) return true; await sleep(500); } return false; };
  // A＋B：標題、新遊戲
  const pg=await b.newPage({viewport:{width:844,height:390}}); hook(pg);
  await pg.goto(URL0+(URL0.includes('?')?'&':'?')+'turbo');
  log(await loaded(pg),'A1 遊戲載入完成（載入畫面消失）',Math.round((Date.now()-t0)/1000)+' 秒');
  const info=await pg.evaluate("(()=>{ const v=document.getElementById('verLabel'); const ss=[...document.scripts].map(s=>s.getAttribute('src')).filter(Boolean); return {ver:v?v.textContent:null,title:!document.getElementById('titleScreen').classList.contains('hide'),scripts:ss.length,vers:[...new Set(ss.map(s=>(s.match(/[?&]v=([^&#]+)/)||[])[1]).filter(Boolean))]}; })()");
  out.title=info; log(info.title,'A2 標題畫面顯示'); log(!!info.ver,'A3 標題有版本字樣',String(info.ver));
  const lv=((info.ver||'').match(/v(\d+(?:\.\d+)+)/)||[])[1]; log(lv&&info.vers.length===1&&info.vers[0]===lv,'A4 '+info.scripts+' 支 script 的 ?v= 都和標題同一個版號',JSON.stringify(info.vers));
  /* 按鈕：先照一般的點法；軟體算圖一秒只有幾格，Playwright 等「畫面穩定」可能等不到 → 改成不等穩定的點法 → 再不行直接呼叫按鈕的 click()。用了哪一種寫進結果 */
  let started=false, how=''; const vis=await pg.evaluate("(()=>{ const b=document.getElementById('btnNewLaw'); if(!b) return null; const r=b.getBoundingClientRect(); const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2); return {w:Math.round(r.width),h:Math.round(r.height),top:e?(e.id||e.tagName):null,hit:!!(e&&(e===b||b.contains(e)))}; })()").catch(()=>null);
  try{ try{ await pg.click('#btnNewLaw',{timeout:8000}); how='一般點擊'; }catch(e1){ try{ await pg.click('#btnNewLaw',{timeout:8000,force:true}); how='點擊（不等畫面穩定）'; }catch(e2){ await pg.evaluate("document.getElementById('btnNewLaw').click()"); how='直接呼叫按鈕的 click()'; } }
    for(let i=0;i<180;i++){ if(await pg.evaluate("!!(typeof GAME!=='undefined'&&GAME.G&&GAME.running&&document.getElementById('titleScreen').classList.contains('hide'))").catch(()=>false)){ started=true; break; } await sleep(500); } }catch(e){ out.newGameErr=String(e&&e.message).slice(0,200); }
  out.newGameClick={how,button:vis};
  log(started,'B1 按「從法律系開始」→ 新遊戲開始（標題收起、GAME.running）',(how?'點法：'+how+'；':'')+'按鈕 '+JSON.stringify(vis)+(out.newGameErr?'；'+out.newGameErr:''));
  await sleep(25000);
  const st=await pg.evaluate("(()=>{ try{ const G=GAME.G,E=GAME.E; return {zone:G&&G.zone,day:G&&G.day,hour:G&&G.hour,npcs:E&&E.npcs?E.npcs.length:null,charFail:(window.CHAR&&CHAR.failures||[]).slice(0,10),assetErr:(window.ASSETS&&ASSETS.errors||[]).slice(0,10),dlg:!!(document.querySelector('#adv.on, #dialog.on, .dlg.on'))}; }catch(e){ return {err:String(e)}; } })()").catch(e=>({err:String(e)}));
  out.newGame=st; log(started&&st&&!st.err&&!!st.zone,'B2 新遊戲 25 秒後的狀態',JSON.stringify(st));
  log(!(st.charFail||[]).length&&!(st.assetErr||[]).length,'B3 新遊戲沒有退回備用模型、沒有資產載入錯誤（CHAR.failures、ASSETS.errors）',JSON.stringify({charFail:st.charFail,assetErr:st.assetErr}));
  await pg.close();
  // C：逐區
  const pg2=await b.newPage({viewport:{width:844,height:390}}); hook(pg2);
  await pg2.goto(URL0+(URL0.includes('?')?'&':'?')+'turbo'); log(await loaded(pg2),'C0 第二頁載入完成');
  let zones=await pg2.evaluate("Object.keys(Z3.ZONES)").catch(()=>[]); out.zonesTotal=zones.length;
  if(ZMODE==='deploy') zones=DEPLOY_ZONES.filter(z=>zones.includes(z)); else if(/^\d+$/.test(ZMODE)) zones=zones.slice(0,Number(ZMODE)); else zones=DEPLOY_ZONES.filter(z=>zones.includes(z)).concat(zones.filter(z=>!DEPLOY_ZONES.includes(z)));
  if(opt('--from')){ out.zonesFrom=Number(opt('--from'))||0; zones=zones.slice(out.zonesFrom); }   /* 上一次因為時間上限沒測完的，從第 N 區接著測 */
  for(const z of zones){ if(Date.now()-t0>BUDGET){ out.zones.push({zone:z,skipped:'時間上限'}); continue; }
    const s={zone:z,hour:11.0,day:8,weekday:6,weather:'sunny',pos:null,flags:FLAGS}; const tz=Date.now();
    const r=await Promise.race([pg2.evaluate(async st=>{ try{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); return {ok:GAME.G.zone===st.zone}; }catch(e){ return {ok:false,err:String(e).slice(0,200)}; } },s).catch(e=>({ok:false,err:String(e).slice(0,200)})),sleep(90000).then(()=>({ok:false,err:'90 秒沒進去'}))])||{ok:false,err:'沒有回傳'};
    await sleep(1500);
    const d=await pg2.evaluate("(()=>{ try{ const E=GAME.E; const drv=o=>{ let d=null; o.traverse(c=>{ if(!d&&c.userData&&c.userData.driver) d=c.userData.driver; }); return d||'none'; }; const npc={}; for(const n of E.npcs){ const k=drv(n.obj); npc[k]=(npc[k]||0)+1; } return {player:drv(E.player.obj),npc}; }catch(e){ return {err:String(e).slice(0,100)}; } })()").catch(()=>({}));
    out.zones.push(Object.assign({zone:z,ms:Date.now()-tz},r,d)); console.log((r.ok?'PASS ':'FAIL ')+'C 進入 '+z+'  '+JSON.stringify(Object.assign({},r,d))+'  '+(Date.now()-tz)+' ms'); }
  const zf=out.zones.filter(z=>!z.ok&&!z.skipped), zs=out.zones.filter(z=>z.skipped), zok=out.zones.filter(z=>z.ok);
  log(!zf.length,'C1 逐區進入：進去 '+zok.length+' 區、失敗 '+zf.length+' 區、因為時間上限沒測 '+zs.length+' 區（遊戲共 '+out.zonesTotal+' 區）',zf.map(z=>z.zone+'：'+(z.err||'')).join('；'));
  const end=await pg2.evaluate("({charFail:(window.CHAR&&CHAR.failures||[]).slice(0,20),assetErr:(window.ASSETS&&ASSETS.errors||[]).slice(0,20)})").catch(()=>({}));
  out.end=end; log(!(end.charFail||[]).length,'C2 沒有退回 placeholder 的人物模型（CHAR.failures）',JSON.stringify(end.charFail)); log(!(end.assetErr||[]).length,'C3 沒有資產載入錯誤（ASSETS.errors）',JSON.stringify(end.assetErr));
  await b.close(); out.requests=reqs.size; out.localRequests=[...reqs].filter(u=>u.startsWith(origin)).length;
  const uniq=[...new Set(out.bad.map(x=>x.status+' '+x.url))]; out.badUnique=uniq;
  log(!uniq.length,'D1 本機資源都載得到（共 '+out.localRequests+' 個本機網址）',uniq.slice(0,30).join('\n      '));
  log(!out.pageErrors.length,'D2 沒有 JS 例外',JSON.stringify(out.pageErrors.slice(0,5)));
  const ext=[...new Set(out.external.map(x=>x.status+' '+x.url))]; console.log('對外網路載入失敗（只列出，不算失敗；這台機器連不到 Google Fonts）：'+(ext.length?ext.slice(0,6).join('；'):'無'));
  console.log('console error（只列出）：'+(out.consoleErrors.length?JSON.stringify([...new Set(out.consoleErrors)].slice(0,8)):'無'));
  out.seconds=Math.round((Date.now()-t0)/1000); out.fail=out.steps.filter(s=>!s.ok).map(s=>s.name);
  if(opt('--json')) fs.writeFileSync(opt('--json'),JSON.stringify(out,null,1));
  console.log(out.fail.length?('FAIL：'+out.fail.length+' 項（'+out.seconds+' 秒）'):('ALL PASS（'+out.seconds+' 秒）')); process.exit(out.fail.length?1:0);
})().catch(e=>{ console.error('執行錯誤：'+(e&&e.stack||e)); process.exit(2); });
