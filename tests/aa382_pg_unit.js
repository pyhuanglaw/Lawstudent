// AA_382 畢業以後修正稿（企劃線 e6d4a198；任務 AA382-PG-FIX-1022）——不需要瀏覽器。
//   0  逐字對稿：從 git 讀 e6d4a198 的稿（第 1 節六句、第 4 節學姊看海、第 5 節明軒），和資料、程式裡的句子比
//   1  交換延畢的美國路線還要補修兩門課：撥穗後、6/3 的日期卡「還差一門實習和兩門課」；日本路線照舊；9/4「都是大四的學弟妹」；10/17「週二去法扶」；2/11「開學跟你沒有關係」
//   2  學姊 2030 年的生日（第 4 節）：畢業以後和學姊交往中＝6/1（六）21:00 私訊兩則＋「好。」／「明天不行。」；
//      「好。」＝6/2（日）09:00 她家樓下（跳過時間、睡覺會停：alarm），到了地點字幕「北海岸」（10:00）、海邊的背景、她的四句、兩個選項各自的回答、最後一句；SIS_BDAY_Y5 sea；15:00 不傳照片
//   3  沒去：「明天不行。」＝她回「好。……那我自己去。拍照給你。」、不排出遊、15:00「📷（照片：堤防上，一雙鞋）」「看到了。」、SIS_BDAY_Y5 alone；沒回、答應了沒到也一樣
//   4  沒有交往（朋友、分手過）＝沒有這一段；6/2 那天算有事（PGDATE.busyDays，還沒回私訊也一樣）
// 修改前（開發分支 6b6ecd80）：第 0 節第 4 節那幾項、第 1 節美國路線、第 2～4 節全部 FAIL。用法：node tests/aa382_pg_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), {execSync}=require('child_process');
const {check,GM}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY={};
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const DOC=execSync('git -c core.quotepath=false show e6d4a198:"docs/story_planning/AA_382_畢業以後_時間人在哪_修正稿_學姊2030生日.md"',{cwd:H.ROOT,encoding:'utf8'});
const sec=n=>{ const a=DOC.indexOf('\n## '+n+'.'), b=DOC.indexOf('\n## ',a+4); return a<0?'':DOC.slice(a,b<0?undefined:b); };
const q=s=>[...String(s).matchAll(/「([^」]*)」/g)].map(m=>m[1]);   /* 「」包起來的句子 */
const row=(s,k)=>{ const r=s.split('\n').find(l=>l.startsWith('| '+k+' |')); if(!r) throw new Error('企劃檔找不到第 '+k+' 列'); return r.split('|').map(x=>x.trim()); };
const D=H.D, T=(k,h)=>D(k)*24+h, J=JSON.stringify;
const Y=(typeof POSTGRAD_LINES!=='undefined'&&POSTGRAD_LINES.SEA_Y5)||{ask:[],opts:[],no:'',open:[],choose:[],close:[],alone:[]};   /* 修改前沒有：空的（照樣跑、照樣 FAIL）*/
const grad=(key,h,flags)=>{ const G=H.fresh(key,h==null?10:h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; return G; };
const sisTh=()=>H.msgs('p:heroine_05');
const sea=(more,rel)=>{ const G=grad('2030-06-01',20.9,more); (rel||(()=>{ H.FRIEND('heroine_05'); H.date('heroine_05'); }))(); H.tick(); PHONE.tick(G); return G; };   /* [前置] 6/1 20:54、畢業以後 */
const at=(k,h)=>{ H.at(k,h); H.tick(); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.cards=[]; H.bgs=[]; H.picks=picks||[]; if(!q) return false; await OUT.go(GM,q); return true; };
(async()=>{
  // ---- 0. 逐字對稿 ----
  { const s1=sec(1);
    const ch=k=>q(row(s1,k)[5]), us1=ch('1'), us2=ch('2'), k26=ch('3'), r4=ch('4'), r5=ch('5'), r6=ch('6');   /* 「改成」那一欄 */
    const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
    check('0. 第 1 節第 1 項：撥穗後美國路線那一句在 story3d.js（日本路線照舊那一句也還在）',us1.length===1&&src('src/story3d.js').includes("'"+us1[0]+"'")&&src('src/story3d.js').includes("'（還差一門實習，證書下學期才拿得到。）'"),J(us1));
    const C=PG.CARDS_DELAY||[], txt=a=>C.filter(x=>x[0]===a).map(x=>x[3]);
    check('0. 第 1 節第 2 項：6/3 的日期卡有日本路線（照舊）和美國路線（「'+us2[0]+'」）兩列',us2.length===1&&txt('2029-06-03').includes(us2[0])&&txt('2029-06-03').includes('（同屆的人都畢業了。你還差一門實習，九月再回學校。）'),J(txt('2029-06-03')));
    check('0. 第 1 節第 3 項：K26 交換延畢那一句換成「'+k26[0]+'」，舊的那一句不在了',k26.length===1&&src('src/r2y4b3d.js').includes("'"+k26[0]+"'")&&!src('src/r2y4b3d.js').includes('你還差一門實習。……那今天先慶祝我的。'));
    check('0. 第 1 節第 4～6 項：9/4、10/17、2/11 的日期卡照稿',r4.length===1&&r5.length===1&&r6.length===1&&txt('2029-09-04').includes(r4[0])&&txt('2029-10-17').includes(r5[0])&&txt('2030-02-11').includes(r6[0]),J([txt('2029-09-04'),txt('2029-10-17'),txt('2030-02-11')]));
    const s4=sec(4).split('\n').filter(l=>!l.startsWith('## ')&&!/^- (接的是|這個月的固定格)/.test(l)).join('\n'), want=q(s4);
    const t=x=>Array.isArray(x)?x[1]:x, got=[...Y.ask,...Y.opts,Y.no,'北海岸',...Y.open.map(t),...[].concat(...Y.choose.map(o=>[o.t,...o.say.map(t)])),...Y.close.map(t),...Y.alone];
    check('0. 第 4 節：私訊兩則、兩個選項、「明天不行。」的回答、地點字幕、海邊的四句、兩個選項和各自的回答、最後一句、沒去的兩則，照稿的順序一字不差',J(got)===J(want),J(got)+' ≠ '+J(want));
    const s5=q(row(sec(5),'`postgrad_lines.js` 尾聲 `mx.bar2030`')[4]);
    check('0. 第 5 節：明軒 2030 年放榜那天「'+s5[0]+'」',s5.length===1&&J(POSTGRAD_LINES.EPI&&POSTGRAD_LINES.EPI.mx&&POSTGRAD_LINES.EPI.mx.bar2030)===J([s5[0]]),J(POSTGRAD_LINES.EPI&&POSTGRAD_LINES.EPI.mx)); }
  // ---- 1. 交換延畢：美國路線兩門補修 ----
  { const r=(fl,a,b)=>PG.cardLine(grad(b,10,fl),D(a),D(b));
    const us=r({EXCHANGE_ROUTE:'US'},'2029-06-02','2029-06-28'), jp=r({EXCHANGE_ROUTE:'JP'},'2029-06-02','2029-06-28');
    check('1. 6/3 的日期卡：美國路線「還差一門實習和兩門課」、日本路線照舊「還差一門實習」',us==='（同屆的人都畢業了。你還差一門實習和兩門課，九月再回學校。）'&&jp==='（同屆的人都畢業了。你還差一門實習，九月再回學校。）',J([us,jp]));
    const u94=r({EXCHANGE_ROUTE:'US',Y5_DAYS:'work'},'2029-09-03','2029-09-11'), c=r({EXCHANGE_ROUTE:'JP'},'2029-10-16','2029-11-20'), f=r({EXCHANGE_ROUTE:'JP'},'2030-02-16','2030-03-15');
    check('1. 9/4 美國路線「都是大四的學弟妹」、10/17「週二去法扶」、2/11「開學跟你沒有關係」',u94==='（週一、週三補修兩門課。教室裡坐的，都是大四的學弟妹。）'&&c==='（週二去法扶。其他的日子，一天和一天很像。）'&&f==='（二月。學弟妹開學了。這是你第一次，開學跟你沒有關係。）',J([u94,c,f])); }
  // ---- 2. 學姊 2030 年的生日：去了 ----
  { const G=sea(); at('2030-06-01',21); const th=sisTh(), m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='pg_sis_sea');
    check('2. 6/1（六）21:00 學姊私訊兩則「'+Y.ask.join('」「')+'」，第二則可以回「好。」／「明天不行。」',J(th.slice(-2))===J(Y.ask)&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天不行。'])&&m.day===D('2030-06-01')&&Math.abs(m.h-21)<1e-6,J(th.slice(-3)));
    const a=PHONE.answer(G,'pg_sis_sea',0); H.tick(); const o=OUT.get(G,'pg_sis_sea');
    check('2. 回「好。」＝排出遊 6/2（日）09:00 她家樓下（跳過時間、睡覺停在出發前：alarm），她不另外回',!!a&&!!o&&o.state==='planned'&&o.day===D('2030-06-02')&&o.h===9&&o.alarm===true&&J(sisTh().slice(-1))===J(['好。'])&&typeof PGDATE!=='undefined'&&PGDATE.busyDays(G,D('2030-06-01'),D('2030-06-03')).has(D('2030-06-02')),J(o));
    H.at('2030-06-02',8.6); const due=OUT.due(G); await goOut('pg_sis_sea',['生日快樂']); const L=H.said.map(s=>s.t);
    const open=Y.open.map(x=>Array.isArray(x)?x[1]:x), exp=open.concat([Y.choose[0]&&Y.choose[0].say[0][1]],Y.close.map(x=>x[1]));
    check('2. 8:36 該出發了（OUT.due）；到了：地點字幕「北海岸」（6/2（日）10:00）、海邊的背景、她的四句→「生日快樂。」→「……嗯。今年這一句，聽得最清楚。」→「'+(Y.close[0]||[])[1]+'」',!!due&&due.id==='pg_sis_sea'&&H.cards.some(c=>c[1]==='北海岸'&&/^6\/2（日）10:00/.test(c[0]))&&H.bgs.some(b=>J(b)===J(OUT.bg('trip_sea')))&&J(L)===J(exp)&&J(H.opts[0])===J(Y.choose.map(x=>x.t)),J({cards:H.cards,bgs:H.bgs,L,opts:H.opts}));
    check('2. 演完：SIS_BDAY_Y5 sea、出遊 done；回到臺北的時間在 15:00 以前',G.flags.SIS_BDAY_Y5==='sea'&&o.state==='done'&&G.day===D('2030-06-02')&&G.hour<15,J([G.flags.SIS_BDAY_Y5,o.state,G.hour]));
    at('2030-06-02',15.1); PHONE.tick(G); check('2. 去了：15:00 不傳照片',!sisTh().includes(Y.alone[0])&&!sisTh().includes('看到了。'),J(sisTh().slice(-3))); }
  { const G=sea(); at('2030-06-01',21); PHONE.answer(G,'pg_sis_sea',0); H.tick(); H.at('2030-06-02',8.6); await goOut('pg_sis_sea',['坐到她旁邊']); const L=H.said.map(s=>s.t);
    check('2. 選「（坐到她旁邊，也把鞋子脫了）」＝「（浪打上來一次，兩個人都往後縮了一下。她笑出聲。）」、最後一句照樣；SIS_BDAY_Y5 sea',L.includes('（浪打上來一次，兩個人都往後縮了一下。她笑出聲。）')&&!L.includes('……嗯。今年這一句，聽得最清楚。')&&L[L.length-1]===(Y.close[0]||[])[1]&&G.flags.SIS_BDAY_Y5==='sea',J(L.slice(-3))); }
  // ---- 3. 沒去 ----
  { const G=sea(); at('2030-06-01',21); PHONE.answer(G,'pg_sis_sea',1); H.tick();
    check('3. 回「明天不行。」＝她「'+Y.no+'」、不排出遊',sisTh().slice(-1)[0]===Y.no&&!OUT.get(G,'pg_sis_sea'),J(sisTh().slice(-3)));
    at('2030-06-02',14.6); at('2030-06-02',15.1); PHONE.tick(G);
    check('3. 6/2 15:00 她傳「'+Y.alone.join('」「')+'」；SIS_BDAY_Y5 alone',J(sisTh().slice(-2))===J(Y.alone)&&G.flags.SIS_BDAY_Y5==='alone',J(sisTh().slice(-3))); }
  { const G=sea(); at('2030-06-01',21); at('2030-06-02',9.5); const m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='pg_sis_sea');
    check('3. 沒回：6/2 09:00 以後不能回了（不排出遊）',!!m&&!PHONE.askOpen(G,m)&&!PHONE.answer(G,'pg_sis_sea',0)&&!OUT.get(G,'pg_sis_sea'));
    at('2030-06-02',15.1); PHONE.tick(G); check('3. 沒回：15:00 一樣傳照片、SIS_BDAY_Y5 alone',J(sisTh().slice(-2))===J(Y.alone)&&G.flags.SIS_BDAY_Y5==='alone',J(sisTh().slice(-3))); }
  { const G=sea(); at('2030-06-01',21); PHONE.answer(G,'pg_sis_sea',0); H.tick(); H.at('2030-06-02',9.6); for(const o of OUT.expire(G)) OUT.onMissed(GM,o);
    at('2030-06-02',15.1); PHONE.tick(G); const o=OUT.get(G,'pg_sis_sea');
    check('3. 答應了沒到（9:30 以後）：出遊 missed、15:00 傳照片、SIS_BDAY_Y5 alone',!!o&&o.state==='missed'&&J(sisTh().slice(-2))===J(Y.alone)&&G.flags.SIS_BDAY_Y5==='alone',J([o&&o.state,sisTh().slice(-3)])); }
  // ---- 4. 沒有交往 ----
  { const G=sea({},()=>{ H.CLOSE('heroine_05'); }); at('2030-06-01',21); at('2030-06-02',15.1); PHONE.tick(G);
    check('4. 學姊是朋友（沒有交往）＝沒有 6/1 的私訊、沒有 15:00 的照片、沒有旗標；6/2 不算有事',!sisTh().includes(Y.ask[0]||'明天，計畫本上那一格是空的。……我故意的。')&&!sisTh().includes('看到了。')&&G.flags.SIS_BDAY_Y5==null&&typeof PGDATE!=='undefined'&&!PGDATE.busyDays(G,D('2030-06-01'),D('2030-06-03')).has(D('2030-06-02')),J(sisTh().slice(-2))); }
  { const G=sea({},()=>{ H.FRIEND('heroine_05'); H.date('heroine_05'); ROM.end(H.G,'heroine_05'); }); at('2030-06-01',21);
    check('4. 分手過＝沒有 6/1 的私訊',!sisTh().includes(Y.ask[0]||'明天，計畫本上那一格是空的。……我故意的。'),J(sisTh().slice(-2))); }
  { const G=sea(); check('4. 交往中：還沒到 6/1 21:00、還沒回私訊，6/2 就算有事（固定格不排在那天）',typeof PGDATE!=='undefined'&&PGDATE.busyDays(G,D('2030-06-01'),D('2030-06-03')).has(D('2030-06-02'))); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
