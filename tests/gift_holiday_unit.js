// 節日、生日送禮（GIFT-HOLIDAY-1110；USER_WANTS X276、X277、X278、X291）——不需要瀏覽器（D131）。
// 台詞 AA_732／AA_733（1edb14888）、AA_734（246ef6735），一律從 src/data/gift_holiday.js 讀來比對（不寫死台詞）。檢查：
//   0. gift_holiday.js 和白名單上的三份一致（import_gift_holiday.py --check）；14 家店（山嵐分書架、文具區）57 樣＋special 2 樣；八位反應、八位她送的
//   1. 買：各店「買禮物…」（afar「選物…」）；扣錢、放進包包、記哪裡買；錢不夠灰掉、選了不扣；包包 10 樣滿＝灰掉；暖暖包只有冬天
//   2. 平常日沒有「送她禮物…」、節日有（聖誕兩天、2/14、七夕、她的生日）；陌生人、朋友、芯慈線關著不列
//   3. 送：不扣時段；open＋item（band 那一格或 *）／love／ok／no；好感 love／ok／no（她的戀愛認識以上就算）；記 GIFT_LOVE／GIFT_GIVEN；包包少一樣
//   4. 一人一節一份；同一樣同一個人一輩子一次（隔年不再列）；以安 2028 情人節的鋼筆（AN_VDAY_GIFT pen）算送過
//   5. 同一節最多兩個人：第三個人灰掉、按下去演 third（輪流）；生日不限
//   6. band：第 1～2 階 A、3～4 B、5～6 C、交往中 D
//   7. 舊存檔（沒有 G.flags.GIFTH、沒有 G.fest）讀得進來、包包空的
//   8. 她送祐廷：門檻（聖誕第 4 階起、2/14 七夕第 6 階或交往中）；你沒送＝C／D 多 youHadNone；你先送＝反應演完接著演、沒有 youHadNone；
//      交往中沒見到＝7 天內 late、第 8 天沒有；還沒交往的隔天沒有；交往中她不在臺北＝信箱包裹（宿舍演）；交往第二年聖誕 D2
//   9. 節日約會（FEST.gift）：包包裡的＋（沒有準備）、不演 open、算兩個人之一；（沒有準備）照 AA_416 那一格、她接著給
//  10. 可昕專屬場次那一天不出現；special 只有那一位的選單會列
//  11. 山嵐文具區學姊：學期中週六 15～16、隔週；sl_sis_1／2／3／rot 的挑法；sl_sis_3 扣 250、錢不夠她付；作息 SCHED_X；提示一年一次
//  12. 物品分頁、人物頁、宿舍櫃子
//  13. AA_732 rules 最後一條（d1bf75f6f，11-10 12:4x 四問；5acf44bbc 補：芷若兩點半店員事件也能送、學姊生日只有遞茶葉算送過）：
//      ② 圖書館讀書區「小聲」那套：期末考前 EXLIB.talk（打完招呼）多「送她禮物…」；她的第一句加（小聲）（讀書區 LIBQ 本來就整段加；A館 4F 只有第一句）；第一次只點頭不出；平常日子沒有
//      ③ 芷若在吧檯上班（點餐那套）：節日點餐選單多「送她禮物…」，送完演完加「（她把東西收到吧檯下面。）」；平常日子沒有；送滿兩個人＝third、不加那句
//      ④ 學姊生日原本的事件（SIS_BDAY_Y1／Y2）演過＝那一天沒有「送她禮物…」；遞茶葉（tea）記 sent＋GIFT_GIVEN（那一天）；沒演到（missed、沒有旗標）照一般；2028 照一般
//      山嵐文具區學姊的站位離「看文具」≥1.2 m（BUG-SHANLAN-SIS-STEAL-1110；真的導航在 tests/shanlan_unit.js ⑪）
// 用法：node tests/gift_holiday_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); return true; };
let okF=false, okG=false, err=''; try{ okF=load('src/data/fest_events.js')&&load('src/fest3d.js'); okG=load('src/data/gift_holiday.js')&&load('src/gifthol3d.js'); }catch(e){ err=String(e&&e.stack||e); }
const J=JSON.stringify;
const AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin', XC='classmate_xinci';
const D=k=>H.D(k);
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:(n>=2?25:10)),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const date=(id,since)=>{ H.G.flags['dating_'+id]=true; const R=ROM.get(H.G,id); R.status='dating'; if(since!=null) R.sinceDay=since; };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'campus',o.flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=o.money!=null?o.money:5000;
  for(const [id,n] of Object.entries(o.lv||{})){ lv(id,n==='dt'?6:n); if(n==='dt') date(id,o.since); } if(STORY._bindGM) STORY._bindGM(GM); return G; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
let toasts=[]; GM.toast=t=>toasts.push(t);
GM.money=n=>{ H.G.money+=n; };
const said=()=>H.said.map(s=>s.t);
const rel=id=>Object.assign({},SOCIAL.rel(id));
const dRel=(id,a)=>{ const b=rel(id), o={}; for(const k of ['fam','trust','comf','npcRom','rom']) if((b[k]|0)!==(a[k]|0)) o[k]=(b[k]|0)-(a[k]|0); return o; };
const who=id=>({name:SOCIAL.displayName(id),charId:id});
const T=GIFTH.text;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const run=async(fn,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); toasts=[]; const r=await fn(); return {r,L:said(),O:H.opts.slice()}; };
const opt=id=>GIFTH.talkOpts(H.G,id)[0]||null;
const buy=(gid)=>{ const it=GIFT_HOLIDAY.items[gid]; GIFTH.rec(H.G).bag.push({id:gid,day:H.G.day,shop:it.shop}); };
const play=(G,lines)=>lines.map(t=>T(G,t)).join('');
const flat=L=>L.join('');

(async()=>{
  /* ======================= 0 資料 ======================= */
  await sec(0,async()=>{ let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/gift/import_gift_holiday.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. 載入 fest3d、gift_holiday.js、gifthol3d.js',okF&&okG&&typeof GIFTH!=='undefined',err.slice(0,300));
    check('0. gift_holiday.js 和白名單上的 AA_732（1ce262f616）、AA_733（6dbfe10d7e；2026-11-12 CANON-NO-ECON-1112 第五批：芯慈、可昕各一句，舊 88cfb1c74f）、AA_734（88cfb1c74f）一致（2026-11-12 重匯：上一任 AA 11-11 整理台詞）（import_gift_holiday.py --check）',ok&&J(GIFT_HOLIDAY.src)===J(['docs/story_planning/AA_732_gift_holiday_1.json@1ce262f616','docs/story_planning/AA_733_gift_holiday_2.json@6dbfe10d7e','docs/story_planning/AA_734_gift_holiday_3.json@88cfb1c74f']),out.trim().slice(0,200));
    const X=GIFT_HOLIDAY, n=Object.keys(X.items).filter(g=>X.items[g].shop!=='special').length;
    /* 2026-11-12（FLOWER-NOTES-1110）：花序 Flower Notes 照 AA_792（8475a3b85）多八樣（g_fn_*，都在 gg_flower）＝57＋8＝65；AA_732 的 57 樣一樣不少（tests/flower_notes_aa792_1112_unit.js 逐字對 AA_792）*/
    check('0. 14 家店（山嵐書架、文具區分開＝14 個 key）57 樣＋花序 AA_792 的八樣＝65 樣＋special 2 樣',Object.keys(X.shops).length===14&&n===65&&Object.keys(X.items).filter(g=>/^g_fn_/.test(g)).length===8&&X.items.g_test_report.shop==='special'&&X.items.g_no_edit.shop==='special',Object.keys(X.shops).length+' 店 '+n+' 樣');
    check('0. 八位都有反應（open 四個節 × A～D、love／ok／no）、八位都有她送的（聖誕 B～D2、2/14 C～D2、七夕 C／D）',GIFTH.PEOPLE.every(p=>X.react[p]&&['xmas','vday','qixi','bday'].every(k=>['A','B','C','D'].every(b=>X.react[p].open[k][b].length))&&X.give[p]&&X.give[p].xmas.B&&X.give[p].vday.C&&X.give[p].qixi.D));
    check('0. g_cvs_choco 的 no 有可昕（1edb14888 改的）',X.items.g_cvs_choco.no.includes(KX));
    /* 匯入工具：對不上就停下來 */
    const py=code=>{ try{ cp.execFileSync('python3',['-c',code],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); return 'ran'; }catch(e){ return String(e.stderr||''); } };
    const pre="import sys,json,subprocess;sys.path.insert(0,'tools/gift');import import_gift_holiday as M;g=lambda s,p:json.loads(subprocess.check_output(['git','show',s+':'+p]).decode());d1=g('1edb14888',M.P1);d2=g('1edb14888',M.P2);d3=g('246ef6735',M.P3);";
    const e1=py(pre+"d2['people']['heroine_01']['item']['g_nothing']={'*':['x']};M.build(d1,d2,d3,['a','b','c'])");
    const e2=py(pre+"d1['people']['heroine_05']['open']['xmas'].pop('D');M.build(d1,d2,d3,['a','b','c'])");
    const e3=py(pre+"d3['people']['kexin']['qixi']['D2']=d3['people']['kexin']['qixi']['D'];M.build(d1,d2,d3,['a','b','c'])");
    const e4=py(pre+"d1['people']['heroine_05']['love']['A'][0]='「x」';M.build(d1,d2,d3,['a','b','c'])");
    check('0. 匯入工具：反應的 item 不在清單、open 少一格、七夕多 D2、外面加「」→ 停下來',/g_nothing/.test(e1)&&/open\.xmas/.test(e2)&&/qixi/.test(e3)&&/TEXT-QUOTE/.test(e4),[e1,e2,e3,e4].map(s=>s.split('\n').filter(Boolean).pop()).join(' | ').slice(0,300)); });

  /* ======================= 1 買 ======================= */
  await sec(1,async()=>{ const G=setup('2025-10-15',15);
    const keys=['xs_shanlan','xs_shanlan_stationery','bookstore','corner_records','xs_tongxian','xs_nanyang','cafe','afar','aoki','xs_dabu','xs_haopai','bikeshop','cvs'];
    check('1. 各店都有「買禮物…」（afar＝「選物…」）',keys.every(k=>{ const o=GIFTH.shopOpt(G,k); return o&&o.t===(k==='afar'?'選物…':'買禮物…')&&!o.dim; }),keys.filter(k=>!GIFTH.shopOpt(G,k)).join('、'));
    { const o=GIFTH.shopOpt(G,'gg_flower'), L=GIFTH.sells(G,'gg_flower'), gH=G.hour;
      G.hour=15; const op=GIFTH.flowerOpen(G); G.hour=22; const cl=GIFTH.flowerOpen(G); G.hour=8.5; const cl2=GIFTH.flowerOpen(G); G.hour=gH;
      check('1. 公館站口花攤（GG-FLOWER-STALL-1110）：gg_flower 有「買禮物…」、賣花束和向日葵；09:00～21:00 開',o&&o.t==='買禮物…'&&L.indexOf('g_bouquet')>=0&&L.indexOf('g_sunflower')>=0&&op&&!cl&&!cl2,J(L)); }
    check('1. 店名不顯示企劃註記「新」（BB BUG-GIFT-SHOPNAME-NEW-1110）：山嵐書店（文具區）、afar café（選物櫃）、花序 Flower Notes（X325，11-10 改名）',GIFTH.shopName('xs_shanlan_stationery')==='山嵐書店（文具區）'&&GIFTH.shopName('afar')==='afar café（選物櫃）'&&GIFTH.shopName('gg_flower')==='花序 Flower Notes',[GIFTH.shopName('xs_shanlan_stationery'),GIFTH.shopName('afar'),GIFTH.shopName('gg_flower')].join('、'));
    { const mk=(x,z)=>({obj:{position:{x,z},rotation:{y:0}}}); const her=mk(4.15,6.5), P=Object.assign(mk(4.36,6.6),{lv:0}); const moved=GIFTH.slSpace({E:{player:P,canStand:()=>true}},her); const d=Math.hypot(P.obj.position.x-4.15,P.obj.position.z-6.5);
      const P2=Object.assign(mk(5.2,6.5),{lv:0}); const m2=GIFTH.slSpace({E:{player:P2,canStand:()=>true}},her);
      check('1. 山嵐文具區學姊開演：玩家離她 0.23 m → 退到 0.8 m、面對面；本來就 ≥0.6 m 的不搬（BB BUG-SHANLAN-SIS-OVERLAP-1110）',moved&&Math.abs(d-0.8)<1e-6&&!m2&&P2.obj.position.x===5.2,J({moved,d,m2})); }
    check('1. 沒有這家店的 key＝沒有（daybreak、yangyang）',!GIFTH.shopOpt(G,'daybreak')&&!GIFTH.shopOpt(G,'yangyang'));
    const m0=G.money; let r=await run(()=>GIFTH.buy(GM,'xs_shanlan_stationery'),['一盒綠色螢光筆']);
    const it=GIFT_HOLIDAY.items.g_green_hl;
    check('1. 買：列那家店的東西、價錢、說明（hint＝line）；扣錢、放進包包、記哪裡買',r.r==='g_green_hl'&&G.money===m0-it.price&&J(GIFTH.bag(G).map(b=>[b.id,b.shop]))===J([['g_green_hl','xs_shanlan_stationery']])&&r.O[0][0]===it.name+'　'+it.price+' 元',J(r.O[0].slice(0,3)));
    G.money=100; r=await run(()=>GIFTH.buy(GM,'xs_shanlan_stationery'),['一支好寫的鋼筆']);
    check('1. 錢不夠：那一樣灰掉、選了不扣錢、不放進包包',r.r==='poor'&&G.money===100&&GIFTH.bag(G).length===1&&toasts.includes('錢不夠'));
    G.money=99999; for(let i=0;i<9;i++) buy('g_tabs');
    const o=GIFTH.shopOpt(G,'cvs'); r=await run(()=>GIFTH.buy(GM,'cvs'),['一張卡片']);
    check('1. 包包最多 10 樣：滿了＝「買禮物…」灰掉、不能再買',GIFTH.bag(G).length===10&&o.dim&&r.r==null&&toasts.some(t=>/10 樣/.test(t)));
    const sum=GIFTH.sells(Object.assign({},G,{day:D('2026-07-10')}),'cvs'), win=GIFTH.sells(Object.assign({},G,{day:D('2026-01-10')}),'cvs');
    check('1. 暖暖包「冬天才有」：12～2 月才賣',!sum.includes('g_warmer')&&win.includes('g_warmer'));
    check('1. 禮物不會過期：隔了一年還在包包',(()=>{ G.day+=400; return GIFTH.bag(G).length===10; })());
    /* 店家選單接線：counter（便利商店、2:30 AM）、頁間書屋、afar、轉角、同弦、大步、南洋、慢輪、青木 */
    const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
    check('1. 各店選單都接了 GIFTH.shopOpt＋GIFTH.pick（story3d counter／bookshop、gg2shops afar／轉角、ggshops 青木、guitar 同弦、xsshop 大步好拍、nanyang、bikeshop）',
      /GIFTH\.shopOpt\(G,giftKey\)/.test(src('src/story3d.js'))&&/CAFE_MENU,'cafe'\)/.test(src('src/story3d.js'))&&/,'cvs'\);/.test(src('src/story3d.js'))&&/,'aoki'\);/.test(src('src/story3d.js'))&&/GIFTH\.shopOpt\(G,'bookstore'\)/.test(src('src/story3d.js'))&&/GIFTH\.shopOpt\(G,k\)/.test(src('src/gg2shops3d.js'))&&/GIFTH\.shopOpt\(G,'corner_records'\)/.test(src('src/gg2shops3d.js'))&&/GIFTH\.shopOpt\(G,'aoki'\)/.test(src('src/ggshops_sys3d.js'))&&/GIFTH\.shopOpt\(G,'xs_tongxian'\)/.test(src('src/guitar3d.js'))&&/GIFTH\.shopOpt\(G,'xs_'\+k\)/.test(src('src/xsshop_sys3d.js'))&&/GIFTH\.shopOpt\(G,'xs_nanyang'\)/.test(src('src/nanyang_sys3d.js'))&&/GIFTH\.shopOpt\(G,'bikeshop'\)/.test(src('src/bikeshop3d.js')));
    /* story3d.js 的 counter（便利商店）真的走一次：選「買禮物…」→ 買 */
    { const G2=setup('2025-10-15',15); const r2=await run(()=>STORY.interact({shop:'cvs'},GM),['買禮物…','一張卡片']);
      check('1. 便利商店結帳的選單多「買禮物…」，選了就是買（不扣時段）',GIFTH.bag(G2).some(b=>b.id==='g_card'&&b.shop==='cvs')&&r2.O[0].includes('買禮物…')&&G2.hour===15,J(r2.O[0])); }
    { const G3=setup('2025-10-15',15); G3.money=2000; const FL={kind:'gg_flower',label:'看看花攤',look:'晨露花舖'}; const r3=await run(()=>STORY.interact(FL,GM),['一束花']);
      check('1. 花攤：營業時間按「看看花攤」＝買花清單，買得到一束花、記 gg_flower、不扣時段',GIFTH.bag(G3).some(b=>b.id==='g_bouquet'&&b.shop==='gg_flower')&&G3.hour===15,J(r3.O)); } });

  /* ======================= 2 誰、哪一天 ======================= */
  await sec(2,async()=>{ const G=setup('2025-12-23',15,{lv:{[AN]:3,[ZR]:3}}); buy('g_law_book');
    check('2. 平常日（12/23）沒有「送她禮物…」',!opt(AN));
    at('2025-12-24',15); check('2. 聖誕 12/24 有',!!opt(AN)&&opt(AN).t==='送她禮物…');
    at('2025-12-25',15); check('2. 聖誕 12/25 也有（同一個節）',!!opt(AN));
    at('2026-02-14',15); check('2. 2/14 有',!!opt(AN));
    at('2026-03-14',15); check('2. 3/14 不在這套',!opt(AN));
    at('2026-08-19',15); check('2. 七夕（2026-08-19，FEST_DATA.QIXI）有',!!opt(AN));
    at('2026-09-15',15); check('2. 以安的生日 9/15 有、芷若沒有（她 9/28）',!!opt(AN)&&!opt(ZR));
    at('2025-12-24',15);
    const r=SOCIAL.rel(PS); Object.assign(r,{fam:0,trust:0,comf:0}); check('2. 第 0 階（陌生人）不列',SOCIAL.stage(PS)==='STRANGER'&&!opt(PS));
    lv('zhe',4); check('2. 朋友（阿哲）不能送',!opt('zhe')&&GIFTH.talkOpts(G,'zhe').length===0);
    lv(XC,3); global.XCROM={ON:false}; const off=!opt(XC); global.XCROM={ON:true}; const on=!!opt(XC); delete global.XCROM;
    check('2. 芯慈：XCROM.ON 才列',off&&on);
    check('2. 掛在 STORY.TALK_OPTS（當面說話的選單）',STORY.TALK_OPTS.some(f=>{ try{ const o=f(G,AN); return Array.isArray(o)&&o.some(x=>x&&x.t==='送她禮物…'); }catch(e){ return false; } })); });

  /* ======================= 3 送 ======================= */
  await sec(3,async()=>{ const G=setup('2025-12-24',15,{lv:{[SIS]:3}}); buy('g_green_hl'); buy('g_tape'); buy('g_drip');
    const R=GIFT_HOLIDAY.react[SIS], b=GIFTH.band(G,SIS), h0=G.hour, r0=rel(SIS);
    let r=await run(()=>opt(SIS).run(GM,who(SIS)),['一盒綠色螢光筆']);
    const want=['你把一盒綠色螢光筆遞給'+who(SIS).name+'。'].concat(R.open.xmas.B,R.item.g_green_hl.B||R.item.g_green_hl['*']).map(t=>T(G,t));
    check('3. 學姊第 3 階＝band B：遞給的那一句 → open[xmas][B] → item[g_green_hl][*]（沒有 B 那一格用 *）',b==='B'&&!R.item.g_green_hl.B&&J(r.L)===J(want),J(r.L).slice(0,300));
    check('3. love：信任 +3、她的戀愛 +2（第 3 階）；不扣時段',J(dRel(SIS,r0))===J({trust:3,npcRom:2})&&G.hour===h0,J(dRel(SIS,r0)));
    check('3. 記 GIFT_LOVE_heroine_05、GIFT_GIVEN_heroine_05；包包少一樣',SOCIAL.has(SIS,'GIFT_LOVE_'+SIS)&&SOCIAL.has(SIS,'GIFT_GIVEN_'+SIS)&&!GIFTH.bag(G).some(x=>x.id==='g_green_hl')&&GIFTH.bag(G).length===2);
    check('3. 一個人一個節日只收一份：送過以後今天不再有「送她禮物…」',!opt(SIS));
    /* no、ok、第 2 階的 love（她的戀愛不加）*/
    at('2026-02-14',15); const r1=rel(SIS); r=await run(()=>opt(SIS).run(GM,who(SIS)),['一個修正帶']);
    check('3. no：item[g_tape][*] 那一格、信任 +1',flat(r.L).indexOf(T(G,R.item.g_tape['*'][0]))>=0&&J(dRel(SIS,r1))===J({trust:1}),J(dRel(SIS,r1)));
    at('2026-06-02',15); const r2=rel(SIS); r=await run(()=>opt(SIS).run(GM,who(SIS)),['一盒濾掛咖啡']);
    check('3. 生日 open[bday][B]；濾掛咖啡（love）item 那一格',flat(r.L).indexOf(T(G,R.open.bday.B[0]))>=0&&flat(r.L).indexOf(T(G,R.item.g_drip['*'][0]))>=0&&J(dRel(SIS,r2))===J({trust:3,npcRom:2}));
    const G2=setup('2025-12-24',15,{lv:{[ZQ]:2}}); buy('g_capo'); buy('g_picks'); const r3=rel(ZQ); r=await run(()=>opt(ZQ).run(GM,who(ZQ)),['一組吉他彈片']);
    const RZ=GIFT_HOLIDAY.react[ZQ];
    check('3. 子晴第 2 階（A）收到 love（彈片）：信任 +3、她的戀愛 +2（認識以上就算，AA_732 30c4cbd45）',J(dRel(ZQ,r3))===J({trust:3,npcRom:2})&&flat(r.L).indexOf(T(G2,RZ.open.xmas.A[0]))>=0,J(dRel(ZQ,r3)));
    at('2026-02-14',15); const r4=rel(ZQ); r=await run(()=>opt(ZQ).run(GM,who(ZQ)),['一個移調夾']);
    check('3. ok（移調夾，沒寫 love／no）：ok[A]、信任 +2',flat(r.L).indexOf(T(G2,RZ.ok.A[0]))>=0&&J(dRel(ZQ,r4))===J({trust:2}),J(r.L)); });

  /* ======================= 4 一輩子一次、鋼筆 ======================= */
  await sec(4,async()=>{ const G=setup('2025-12-24',15,{lv:{[AN]:3}}); buy('g_law_book'); buy('g_law_book');
    await run(()=>opt(AN).run(GM,who(AN)),['一本商事法的書']);
    at('2026-02-14',15); const st=GIFTH.state(G,AN);
    check('4. 同一樣同一個人一輩子一次：包包還有一本，但隔年的節日不列她',GIFTH.bag(G).some(b=>b.id==='g_law_book')&&st&&!st.items.some(b=>b.id==='g_law_book'));
    check('4. 給別人照樣可以（芷若的選單有商事法的書）',(()=>{ lv(ZR,3); return GIFTH.state(G,ZR).items.some(b=>b.id==='g_law_book'); })());
    buy('g_fountain'); G.flags.AN_VDAY_GIFT='pen';
    check('4. 以安 2028 情人節的鋼筆（AN_VDAY_GIFT pen）＝送過了，不列她；芷若照樣列',!GIFTH.state(G,AN).items.some(b=>b.id==='g_fountain')&&GIFTH.state(G,ZR).items.some(b=>b.id==='g_fountain'));
    G.fest={gifts:{[ZR]:['poster']},done:{},bk:[],miss:{}}; buy('g_old_poster');
    check('4. AA_416 1-8 舊的送禮（G.fest.gifts 送過同名的老電影海報）＝送過了',!GIFTH.state(G,ZR).items.some(b=>b.id==='g_old_poster')); });

  /* ======================= 5 兩個人 ======================= */
  await sec(5,async()=>{ const G=setup('2026-02-14',15,{lv:{[AN]:3,[ZR]:3,[YT]:3}}); buy('g_law_book'); buy('g_mug'); buy('g_poems');
    await run(()=>opt(AN).run(GM,who(AN)),['商事法']); await run(()=>opt(ZR).run(GM,who(ZR)),['馬克杯']);
    const o=opt(YT); let r=await run(()=>o.run(GM,who(YT)));
    const TH=GIFT_HOLIDAY.third;
    check('5. 2/14 送了兩個人：第三個人的選項灰掉、按下去演 third 第一句、東西留著',o&&o.dim&&J(r.L)===J([TH[0]])&&GIFTH.bag(G).some(b=>b.id==='g_poems'),J(r.L));
    r=await run(()=>opt(YT).run(GM,who(YT))); check('5. third 輪流（第二次第二句）',J(r.L)===J([TH[1]]));
    at('2026-07-09',15); buy('g_umbrella'); r=await run(()=>opt(YT).run(GM,who(YT)),['詩集']);
    check('5. 生日不限（語彤 7/9）',r.r!=='third'&&r.L.some(t=>t.indexOf('遞給')>=0));
    const G2=setup('2025-12-24',15,{lv:{[AN]:3,[ZR]:3,[YT]:3}}); buy('g_law_book'); buy('g_mug');
    await run(()=>opt(AN).run(GM,who(AN)),['商事法']); at('2025-12-25',15); await run(()=>opt(ZR).run(GM,who(ZR)),['馬克杯']);
    check('5. 聖誕兩天算同一個節：24 號送一位、25 號送一位＝第三位灰掉',opt(YT)&&opt(YT).dim); });

  /* ======================= 6 band ======================= */
  await sec(6,async()=>{ const G=setup('2025-12-24',15,{lv:{[ZR]:1}});
    const B=n=>{ lv(ZR,n); return GIFTH.band(G,ZR); };
    const bs=[1,2,3,4,5,6].map(B).join(''); date(ZR);
    check('6. 第 1～2 階 A、3～4 B、5～6 C、交往中 D',bs==='AABBCC'&&GIFTH.band(G,ZR)==='D',bs);
    const G2=setup('2025-12-24',15,{lv:{[SIS]:'dt'}}); buy('g_fountain'); const R=GIFT_HOLIDAY.react[SIS];
    const r=await run(()=>opt(SIS).run(GM,who(SIS)),['鋼筆']);
    check('6. 交往中＝D：open[xmas][D]、鋼筆 item 有 D 那一格就用 D（不用 *）',r.L.join('').indexOf(T(G2,R.open.xmas.D[0]))>=0&&r.L.join('').indexOf(T(G2,R.item.g_fountain.D[1]))>=0&&r.L.join('').indexOf(T(G2,R.item.g_fountain['*'][1]))<0); });

  /* ======================= 7 舊存檔 ======================= */
  await sec(7,async()=>{ const G=setup('2025-12-24',15,{lv:{[AN]:3}}); delete G.flags.GIFTH; delete G.fest;
    check('7. 舊存檔（沒有 G.flags.GIFTH、G.fest）：包包空的、選項灰掉（店裡可以買）',GIFTH.bag(G).length===0&&opt(AN)&&opt(AN).dim&&/店裡可以買/.test(opt(AN).hint)&&J(Object.keys(G.flags.GIFTH).sort())===J(['bag','fest','given','got','hint','mail','recv','sent','sl','third']));
    G.flags.GIFTH='壞掉的'; check('7. 欄位壞掉（不是物件）＝重來一份空的',GIFTH.bag(G).length===0&&typeof G.flags.GIFTH==='object');
    const r=await run(()=>opt(AN).run(GM,who(AN))); check('7. 包包空的按下去：提示、不演',!r.L.length&&toasts.some(t=>/沒有可以送她/.test(t))); });

  /* ======================= 8 她送祐廷 ======================= */
  await sec(8,async()=>{ const P=GIFT_HOLIDAY.give;
    let G=setup('2025-12-24',15,{lv:{[AN]:3}});
    check('8. 聖誕第 3 階：她不送',!GIFTH.herDue(G,AN));
    lv(AN,4); let d=GIFTH.herDue(G,AN); check('8. 聖誕第 4 階＝B',d&&d.band==='B'&&!d.late);
    let r=await run(()=>GIFTH.afterTalk(GM,who(AN),AN));
    check('8. 你沒有送她：她給 scene＋lines；B 不多 youHadNone；記 GIFT_FROM、不加不扣好感',J(r.L)===J([P[AN].xmas.B.scene].concat(P[AN].xmas.B.lines).map(t=>T(G,t)))&&SOCIAL.has(AN,'GIFT_FROM_'+AN+'_xmas_2025')&&!GIFTH.herDue(G,AN),J(r.L));
    G=setup('2025-12-24',15,{lv:{[AN]:6}}); r=await run(()=>GIFTH.afterTalk(GM,who(AN),AN));
    check('8. 聖誕第 6 階＝C；你沒有送她＝最後多一句 youHadNone',r.L[r.L.length-1]===T(G,P[AN].youHadNone)&&r.L[0]===T(G,P[AN].xmas.C.scene),J(r.L));
    G=setup('2026-02-14',15,{lv:{[AN]:6}}); buy('g_law_book'); const rr=rel(AN);
    r=await run(()=>opt(AN).run(GM,who(AN)),['商事法']);
    const iS=r.L.indexOf(T(G,P[AN].vday.C.scene)), iR=r.L.findIndex(t=>t.indexOf('遞給')>=0);
    check('8. 你先送她：反應演完，接著演她的 scene＋lines；沒有 youHadNone；她送的不加不扣（只有你送的 love）',iR>=0&&iS>iR&&r.L.indexOf(T(G,P[AN].youHadNone))<0&&J(dRel(AN,rr))===J({trust:3,npcRom:2}),J(r.L).slice(0,200));
    r=await run(()=>STORY.offerInvite(GM,AN,null,who(AN)),['就這樣']); check('8. 給過了：說完話不再給',!r.L.some(t=>t===T(G,P[AN].vday.C.scene)));
    G=setup('2026-02-14',15,{lv:{[AN]:5}}); check('8. 2/14 第 5 階：不送',!GIFTH.herDue(G,AN));
    at('2026-02-15',15); lv(AN,6); check('8. 還沒交往：那一天沒見到，之後就沒有',!GIFTH.herDue(G,AN));
    G=setup('2027-02-16',15,{lv:{[AN]:'dt'},since:D('2026-10-01')}); d=GIFTH.herDue(G,AN);
    check('8. 交往中、2/14 沒見到：2/16 第一次見到＝late（交往第一年 D）',d&&d.late&&d.band==='D'&&d.k==='vday',J(d));
    r=await run(()=>GIFTH.afterTalk(GM,who(AN),AN)); check('8. late 那一句放最前面；沒送她＝youHadNone',r.L[0]===T(G,P[AN].late)&&r.L[r.L.length-1]===T(G,P[AN].youHadNone),J(r.L));
    G=setup('2027-02-22',15,{lv:{[AN]:'dt'},since:D('2026-10-01')}); check('8. 第 8 天（2/22）：不給了',!GIFTH.herDue(G,AN));
    G=setup('2027-12-24',15,{lv:{[YT]:'dt'},since:D('2026-10-01')}); d=GIFTH.herDue(G,YT);
    check('8. 交往第二個聖誕＝D2',d&&d.band==='D2',J(d&&d.band));
    G=setup('2028-02-14',15,{lv:{[ZR]:'dt'},since:D('2026-10-01')}); d=GIFTH.herDue(G,ZR); check('8. 交往第二個 2/14＝D2',d&&d.band==='D2');
    G=setup('2027-08-08',15,{lv:{[ZR]:'dt'},since:D('2026-10-01')}); d=GIFTH.herDue(G,ZR); check('8. 七夕交往中每年都是 D（2027）',d&&d.band==='D');
    /* 信箱 */
    G=setup('2027-08-08',15,{lv:{[PS]:'dt'},since:D('2026-10-01'),zone:'campus'}); const pres0=STORY.presence; STORY.presence=(id,g)=>id===PS?{here:false,kind:'home'}:pres0(id,g);
    try{ const n=GIFTH.mailMake(G); const k=PS+'|qixi|2027';
      check('8. 交往中、她不在臺北：那一天信箱多一個包裹（收到、記 got mail）',n===1&&GIFTH.rec(G).mail[k]&&GIFTH.rec(G).got[k].mode==='mail'&&!GIFTH.herDue(G,PS));
      G.zone='dorm_hall'; r=await run(()=>GIFTH.mailPlay(GM)); const c=P[PS].qixi.D;
      check('8. 回到宿舍：包裹的旁白＋卡片上的字（她說的那幾句）',r.L[0]===GIFTH.MAIL_NARR&&r.L.slice(1).every(t=>/^（卡片上寫著：「/.test(t))&&r.L.length===1+c.lines.filter(t=>!/^（/.test(t)).length,J(r.L));
      r=await run(()=>GIFTH.mailPlay(GM)); check('8. 包裹只演一次',!r.L.length);
      const G3=setup('2027-08-08',15,{lv:{[PS]:6}}); check('8. 還沒交往的不寄',GIFTH.mailMake(G3)===0); } finally { STORY.presence=pres0; }
    G=setup('2025-12-24',15,{lv:{[AN]:4}}); r=await run(()=>STORY.offerInvite(GM,AN,null,who(AN)),['就這樣']);
    check('8. 掛在說話選單的最後（STORY.offerInvite）：說完話她給',r.L.indexOf(T(G,P[AN].xmas.B.scene))>=0,J(r.L).slice(0,200)); });

  /* ======================= 9 節日約會 ======================= */
  await sec(9,async()=>{ const G=setup('2025-12-24',19,{lv:{[ZR]:5,[AN]:3,[YT]:3}}); buy('g_mug'); buy('g_film_book'); buy('g_law_book'); buy('g_poems');
    const R=GIFT_HOLIDAY.react[ZR]; let r=await run(()=>FEST.gift(GM,ZR,'xmas',2025),['馬克杯']);
    check('9. FEST.gift：選單是包包裡她可以收的＋（沒有準備）',J(r.O[0].slice(-1))===J(['（沒有準備）'])&&r.O[0].includes('一個馬克杯')&&r.O[0].includes('一本絕版的電影書'),J(r.O[0]));
    check('9. 約會裡送的不演 open、照 item 那一格；算這個節的兩個人之一',r.L.join('').indexOf(T(G,R.open.xmas.C[0]))<0&&r.L.join('').indexOf(T(G,R.item.g_mug?(R.item.g_mug.C||R.item.g_mug['*'])[0]:R.love.C[0]))>=0&&J(GIFTH.rec(G).fest['xmas|2025'])===J([ZR]));
    await run(()=>opt(AN).run(GM,who(AN)),['商事法']); const o3=opt(YT); r=await run(()=>o3.run(GM,who(YT)));
    check('9. 約會裡送的那一位＋另一位＝兩位：第三位灰掉、third',o3.dim&&J(r.L)===J([GIFT_HOLIDAY.third[0]]),J(r.L));
    const G2=setup('2025-12-24',19,{lv:{[ZR]:5}}); r=await run(()=>FEST.gift(GM,ZR,'xmas',2025),['（沒有準備）']);
    const P0=FEST_DATA.PEOPLE[ZR], none=(P0.noneBy&&P0.noneBy.xmas)||P0.none||[];
    check('9. （沒有準備）：AA_416 那一格照舊（先演），她接著給（C 多 youHadNone）',r.r==='none'&&none.length>0&&r.L.indexOf(T(G2,GIFT_HOLIDAY.give[ZR].youHadNone))>=0&&r.L.indexOf(T(G2,GIFT_HOLIDAY.give[ZR].xmas.C.scene))>0,J(r.L).slice(0,200));
    G2.fest={done:{[ZR+':xmas:2025']:'meet'},bk:[],gifts:{},miss:{}}; const G2b=G2; GIFTH.rec(G2b).got={};
    check('9. existing：芷若第 5 階以上、那一年聖誕約會演過（打烊以後的那杯拿鐵）＝這套她不再送',GIFTH.existing(G2b,ZR,'xmas',2025)&&!GIFTH.herDue(G2b,ZR)); });

  /* ======================= 10 可昕、special ======================= */
  await sec(10,async()=>{ const G=setup('2027-02-14',15,{lv:{[KX]:'dt'}}); buy('g_mirror');
    check('10. 可昕交往中的 2/14（專屬場次有禮物）：這套不出現，她也不另外送',!opt(KX)&&!GIFTH.herDue(G,KX));
    const G2=setup('2026-12-25',15,{lv:{[KX]:5},flags:{KX_XMAS_Y2:'yes'}}); buy('g_mirror'); check('10. AA_325 大二聖誕說了「好。」那天也不出現',!opt(KX));
    const G3=setup('2025-12-24',15,{lv:{[KX]:3}}); buy('g_mirror'); check('10. 沒有專屬場次的日子照常',!!opt(KX)&&!opt(KX).dim);
    const G4=setup('2025-12-24',15,{lv:{[ZQ]:3,[SIS]:3},flags:{ZQ_TB_PLAYED:D('2025-12-01')}});
    check('10. special：子晴的測試報告（玩過她的測試版）不用買、只有子晴的選單會列、不佔包包',GIFTH.state(G4,ZQ).items.some(b=>b.id==='g_test_report')&&!GIFTH.state(G4,SIS).items.some(b=>b.id==='g_test_report')&&GIFTH.bag(G4).length===0);
    const r=await run(()=>opt(ZQ).run(GM,who(ZQ)),['測試報告']); check('10. 送出去以後不再列',r.L.some(t=>t.indexOf('遞給')>=0)&&(at('2026-02-14',15),!GIFTH.state(G4,ZQ).items.some(b=>b.id==='g_test_report'))); });

  /* ======================= 11 山嵐文具區 ======================= */
  await sec(11,async()=>{ let sat=null; for(let d=D('2026-02-01');d<D('2026-07-01');d++) if(GIFTH.slDay({day:d},d)){ sat=d; break; }
    const k=CALENDAR.dateOf(sat).key; const G=setup(k,15.5,{lv:{[SIS]:2},zone:'xs_shanlan'});
    check('11. 學期中的週六、上課週次單數（'+k+'，第 '+CALENDAR.termOf(sat).week+' 週）15:30 她在文具區（SCHED_X）',CALENDAR.dateOf(sat).wd===6&&GIFTH.slOn(G)&&GIFTH.sched({id:SIS},G)===GIFTH.SL_SCHED&&GIFTH.sched({id:AN},G)==null);
    check('11. 隔週（下週六）不在、16:00 以後不在、2026-01 不在、2028-09 不在',!GIFTH.slDay(G,sat+7)&&(G.hour=16,!GIFTH.slOn(G))&&!GIFTH.slDay(G,D('2026-01-10'))&&!GIFTH.slDay(G,D('2028-09-16'))&&(G.hour=15.5,true));
    const S3=GIFT_HOLIDAY.stationery.scenes; let r=await run(()=>GIFTH.slPlay(GM,who(SIS)),['隨便看看']);
    check('11. 第 2 階第一次＝sl_sis_1（lines＋祐廷說選的那句＋她的回答）',r.r==='sl_sis_1'&&J(r.L)===J(S3[0].lines.concat([S3[0].choice[1].t],S3[0].choice[1].r).map(t=>T(G,t))),J(r.L));
    r=await run(()=>GIFTH.slPlay(GM,who(SIS))); check('11. 同一天不再演',r.r==null);
    G.day+=14; G.weekday=6; r=await run(()=>GIFTH.slPlay(GM,who(SIS)));
    check('11. 演過以後：輪流（第 2 階只有前兩則）',r.r==='sl_sis_rot'&&J(r.L)===J(S3[3].lines[0].map(t=>T(G,t))));
    G.day+=14; r=await run(()=>GIFTH.slPlay(GM,who(SIS))); G.day+=14; const r2=await run(()=>GIFTH.slPlay(GM,who(SIS)));
    check('11. 第 2 階輪不到第 3 則（叫名字那一則）',J(r.L)===J(S3[3].lines[1].map(t=>T(G,t)))&&J(r2.L)===J(S3[3].lines[0].map(t=>T(G,t))));
    lv(SIS,3); G.day+=14; r=await run(()=>GIFTH.slPlay(GM,who(SIS)),['這支好寫']); check('11. 第 3 階：sl_sis_2（她教你挑筆）',r.r==='sl_sis_2'&&r.L.indexOf(T(G,S3[1].choice[0].r[0]))>=0);
    date(SIS); G.day+=14; G.money=1000; r=await run(()=>GIFTH.slPlay(GM,who(SIS)));
    check('11. 交往中第一次：sl_sis_3、扣 250、你的那本進房間櫃子（不進包包）',r.r==='sl_sis_3'&&G.money===750&&GIFTH.recvList(G).some(x=>x.item==='她選的筆記本'&&x.room)&&!GIFTH.bag(G).length);
    const G2=setup(k,15.5,{lv:{[SIS]:'dt'},zone:'xs_shanlan'}); G2.money=100; r=await run(()=>GIFTH.slPlay(GM,who(SIS)));
    check('11. 錢不夠＝她付（「這次我來。」，不扣）',r.r==='sl_sis_3'&&G2.money===100&&r.L.includes('這次我來。'));
    /* 提示 */
    const G3=setup('2026-05-23',15,{lv:{[SIS]:3},zone:'xs_shanlan'}); r=await run(()=>GIFTH.hintPen(GM));
    check('11. 她生日前 14 天、一個人在文具區：鋼筆那一句（一年一次）',r.r===true&&J(r.L)===J([GIFTH.HINT_TEXT(0)])&&(await run(()=>GIFTH.hintPen(GM))).r===false&&/鋼筆/.test(GIFTH.HINT_TEXT(0)));
    GIFTH.rec(G3).given[SIS]=['g_leather_case']; r=await run(()=>GIFTH.hintCase(GM)); check('11. 皮的筆袋送過了＝不演',r.r===false);
    const G4=setup('2026-04-01',15,{lv:{[SIS]:3}}); check('11. 不在那 14 天＝不演',(await run(()=>GIFTH.hintPen(GM))).r===false);
    /* 「看文具」：她不在＝AA_695 那一句＋買禮物 */
    const G5=setup('2026-04-01',15,{lv:{[SIS]:3},zone:'xs_shanlan'}); GM.npc={};
    const look=(typeof SHL!=='undefined'&&SHL.lookText)?SHL.lookText({lv:0,x:4.5,z:6.5}):'（筆都可以試寫。試寫的那張紙已經寫滿了，大部分是名字。）';
    r=await run(()=>GIFTH.shanlan(GM,{label:'看文具',shlLook:look}),['買禮物…','一盒和紙膠帶']);
    check('11. 「看文具」：那一句旁白 → 買禮物（文具區的清單）',r.L[0]===look&&GIFTH.bag(G5).some(b=>b.id==='g_washi'&&b.shop==='xs_shanlan_stationery'),J(r.O)); });

  /* ======================= 12 物品、人物頁、房間 ======================= */
  await sec(12,async()=>{ const G=setup('2025-12-24',15,{lv:{[SIS]:4}}); buy('g_green_hl'); buy('g_tabs');
    await run(()=>opt(SIS).run(GM,who(SIS)),['螢光筆']);
    const h=GIFTH.bagHTML(G), it=GIFT_HOLIDAY.items.g_tabs;
    check('12. 物品分頁：包包裡的（品名、哪裡買、說明、幾樣／10）、她送的',h.indexOf('包包裡的禮物（1/10）')>=0&&h.indexOf(it.name)>=0&&h.indexOf(it.line)>=0&&h.indexOf('山嵐書店（文具區）')>=0&&h.indexOf('，新）')<0&&h.indexOf('她送的')>=0&&h.indexOf(GIFT_HOLIDAY.give[SIS].xmas.B.item)>=0);
    const p=GIFTH.personHTML(G,SIS); check('12. 人物頁：她喜歡（送過的 love）、她送的',p.indexOf('她喜歡')>=0&&p.indexOf('一盒綠色螢光筆')>=0&&p.indexOf(GIFT_HOLIDAY.give[SIS].xmas.B.item)>=0);
    const L=STORY.roomItemList(G), row=L.find(x=>x[0].indexOf(GIFT_HOLIDAY.give[SIS].xmas.B.item)===0);
    check('12. 宿舍房間的櫃子：她送的那一樣（名字＋lines 第一句）',!!row&&J(row[1])===J([GIFT_HOLIDAY.give[SIS].xmas.B.item+'。',T(G,GIFT_HOLIDAY.give[SIS].xmas.B.lines[0])]),J(row));
    const src=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), gsrc=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
    check('12. index.html：選單「物品」分頁、載入 gift_holiday.js、gifthol3d.js（在 fest3d.js 之後）',/data-tab="items">物品</.test(src)&&/id="itemsList"/.test(src)&&src.indexOf('src/gifthol3d.js')>src.indexOf('src/fest3d.js')&&src.indexOf('src/data/gift_holiday.js')<src.indexOf('src/gifthol3d.js')&&/GIFTH\.renderBag/.test(gsrc)&&/GIFTH\.personHTML/.test(gsrc)); });

  /* ======================= 13 AA_732 rules 最後一條（②③④）======================= */
  /* 這一節才載入 LIBQ、EXLIB（會包 STORY.talkCharacter）：放最後，前面各節不受影響 */
  let okQ=false, qerr=''; try{ okQ=load('src/libquiet3d.js')&&load('src/data/examlib_lines.js')&&load('src/examlib3d.js'); }catch(e){ qerr=String(e&&e.stack||e); }
  check('13. 載入 libquiet3d.js、examlib_lines.js、examlib3d.js',okQ&&typeof LIBQ!=='undefined'&&typeof EXLIB!=='undefined',qerr.slice(0,200));
  if(okQ&&EXLIB._bindGM) EXLIB._bindGM(GM);   /* STORY.talkCharacter 的 EXLIB 那一層讀 lastGM（平常由 populate 設）*/
  const say0=GM.say; GM.say=(w,t)=>say0(w,typeof LIBQ!=='undefined'?LIBQ.whisper(GM,w,t):t);   /* 同 game3d.js 的 say：讀書區自動加（小聲）*/
  const herSaid=(id)=>H.said.filter(x=>x.who===SOCIAL.displayName(id)).map(x=>x.t);
  const markUp=id=>{ for(let k=0;k<6&&SOCIAL.upLine&&SOCIAL.upLine(id);k++) SOCIAL.markUp(id,SOCIAL.upLine(id).k); };
  await sec('13②',async()=>{
    /* 期末考前（EXLIB 開著）的法圖：學姊生日 2026-06-02（大一下第 15 週；聖誕、2/14、七夕都在放假，期末考前那一段只碰得到生日）*/
    const G=setup('2026-06-02',15,{lv:{[SIS]:4},zone:'lawlib'}); markUp(SIS); GM.E.player.lv=1; buy('g_green_hl');
    check('13② 前提：2026-06-02 是她的生日、期末考前那一段（EXLIB.on）、法圖讀書區（EXLIB.here）、學姊在表上（法圖）',EXLIB.on(G)&&EXLIB.here(GM)&&!!EXLIB.inCast(G,SIS),J({on:EXLIB.on(G),here:EXLIB.here(GM)}));
    const n={obj:{position:{x:0,z:0},rotation:{y:0}},charId:SIS,seat:{x:0,z:0}};
    let r=await run(()=>STORY.talkCharacter(SIS,n));
    check('13② 這一段這一間第一次＝只點頭，不出「送她禮物…」',!r.O.length&&r.L.length===1&&r.L[0]===LIBQ.nodLine(SIS),J(r.L));
    r=await run(()=>STORY.talkCharacter(SIS,n),['送她禮物…','螢光筆']);
    const her=herSaid(SIS), P=EXAMLIB_LINES.people[SIS];
    check('13② 之後：先（小聲）那一句，再「送她禮物…」「就這樣」',r.O.length>=2&&J(r.O[0])===J(['送她禮物…','就這樣'])&&her[0]===P.lines[0][0],J(r.O)+' '+J(her.slice(0,2)));
    const firstHer=her[1];
    check('13② 送了：反應照一般的（「你把…遞給她。」＋open／item），她的第一句前面有「（小聲）」；她說的每一句都是小聲（讀書區 LIBQ）',GIFTH.sentThis(G,SIS,{k:'bday',y:2026})&&/^（[^）]*小聲/.test(firstHer)&&her.slice(1).every(t=>/小聲/.test(t))&&r.L.indexOf('你把一盒綠色螢光筆遞給'+SOCIAL.displayName(SIS)+'。')>=0,J(her.slice(1,4)));
    r=await run(()=>STORY.talkCharacter(SIS,n));
    check('13② 送過了：同一天再說話不再出「送她禮物…」',!r.O.some(o=>o.includes('送她禮物…')),J(r.O));
    /* 平常日子：沒有 */
    const G2=setup('2026-05-26',15,{lv:{[SIS]:4},zone:'lawlib'}); markUp(SIS); GM.E.player.lv=1; buy('g_green_hl'); EXLIB.nodRec(G2,'lawlib')[SIS]=1;
    r=await run(()=>STORY.talkCharacter(SIS,n));
    check('13② 平常日子（2026-05-26，期末考前那一段）：打招呼照舊、沒有「送她禮物…」',EXLIB.on(G2)&&!r.O.length&&herSaid(SIS).length===1,J(r.O)+J(r.L));
    /* A館 4F（EXLIB 的讀書區、不是 LIBQ 的區域）：只有她的第一句加（小聲） */
    const G3=setup('2025-12-24',15,{lv:{[ZQ]:4},zone:'linze_4f'}); buy('g_green_hl');
    r=await run(()=>GIFTH.libTalk(GM,who(ZQ),ZQ),['送她禮物…','螢光筆']); const hz=herSaid(ZQ);
    check('13② 不是 LIBQ 的讀書區（A館 4F）：她的第一句加（小聲）、其他照舊',hz.length>=2&&/^（[^）]*小聲/.test(hz[0])&&hz.slice(1).every(t=>!/^（小聲）/.test(t)),J(hz.slice(0,3)));
    /* 不送：選「就這樣」＝她照舊給（同 offerInvite 後面）*/
    const G4=setup('2025-12-24',15,{lv:{[SIS]:4},zone:'lawlib'}); GM.E.player.lv=1;
    r=await run(()=>GIFTH.libTalk(GM,who(SIS),SIS),['就這樣']);
    check('13② 選「就這樣」：不送，她照舊給（AA_734 聖誕第 4 階 B）',r.r==='skip'&&!GIFTH.sentThis(G4,SIS,{k:'xmas',y:2025})&&!!GIFTH.rec(G4).got[SIS+'|xmas|2025'],J(r.L.slice(0,3)));
    GM.E.player.lv=0; });
  await sec('13③',async()=>{
    const n={obj:{position:{x:0,z:0},rotation:{y:0}},charId:ZR,staff:'cafe'};
    /* 今天第一次跟吧檯的她說話是「兩點半的店員」那一段（ev_cafe_barista_zhiruo，一天一次）；第二次起＝點餐（story3d.js counter）——這裡測點餐那一套 */
    const cool=()=>{ const E0=H.G.events; E0.done.ev_cafe_barista_zhiruo=1; E0.last.ev_cafe_barista_zhiruo=H.G.day; };
    const G=setup('2025-12-24',15,{lv:{[ZR]:4},zone:'cafe'}); cool(); buy('g_green_hl'); const m0=G.money;
    let r=await run(()=>STORY.talkCharacter(ZR,n),['送她禮物…','螢光筆']);
    const narr=GIFTH.COUNTER_NARR;
    check('13③ 吧檯點餐選單：菜單、買禮物…、送她禮物…、不用了（送她禮物… 在「不用了」前面）',r.O[0]&&r.O[0].includes('送她禮物…')&&r.O[0].includes('買禮物…')&&r.O[0][r.O[0].length-1]==='不用了'&&r.O[0].indexOf('送她禮物…')===r.O[0].length-2,J(r.O[0]));
    check('13③ 送了：反應照一般的（open＋love／ok／no），演完最後一句是「（她把東西收到吧檯下面。）」；沒扣錢、沒點餐',GIFTH.sentThis(G,ZR,{k:'xmas',y:2025})&&r.L[r.L.length-1]===narr&&r.L.indexOf('你把一盒綠色螢光筆遞給'+SOCIAL.displayName(ZR)+'。')>=0&&G.money===m0&&narr==='（她把東西收到吧檯下面。）',J(r.L.slice(-3)));
    r=await run(()=>STORY.talkCharacter(ZR,n),['不用了']);
    check('13③ 送過了：同一天點餐選單沒有「送她禮物…」',!r.O[0].includes('送她禮物…'),J(r.O[0]));
    /* 點餐照舊（菜單第一項）*/
    const G2=setup('2025-12-17',15,{lv:{[ZR]:4},zone:'cafe'}); cool(); buy('g_green_hl'); const m2=G2.money;
    r=await run(()=>STORY.talkCharacter(ZR,n),[0]);
    check('13③ 平常日子：沒有「送她禮物…」；點餐照舊（扣錢）',!r.O[0].includes('送她禮物…')&&G2.money<m2,J(r.O[0]));
    /* 這個節日已經送了兩個人：灰掉、按下去 third、不加那句 */
    const G3=setup('2025-12-24',15,{lv:{[ZR]:4},zone:'cafe'}); cool(); buy('g_green_hl'); GIFTH.rec(G3).fest['xmas|2025']=[AN,ZQ];
    r=await run(()=>STORY.talkCharacter(ZR,n),['送她禮物…']);
    check('13③ 送滿兩個人：third 那一句，不加「（她把東西收到吧檯下面。）」',GIFT_HOLIDAY.third.includes(r.L[r.L.length-1])&&!r.L.includes(narr),J(r.L)); });
  await sec('13④',async()=>{
    const G=setup('2026-06-02',20,{lv:{[SIS]:3},flags:{SIS_BDAY_Y1:'tea'}});
    check('13④ 前提：2026-06-02 是她的生日（holOf bday）',J(GIFTH.holOf(SIS,G.day))===J({k:'bday',y:2026}));
    const o=opt(SIS), M=SOCIAL.memories(SIS).filter(m=>m.tag==='GIFT_GIVEN_'+SIS);
    check('13④ 原本的事件演過（遞茶葉 tea）：那一天沒有「送她禮物…」；記 sent（bday|2026）、GIFT_GIVEN（那一天、一包茶葉）',!o&&!!GIFTH.rec(G).sent[SIS+'|bday|2026']&&M.length===1&&M[0].day===G.day&&M[0].note==='一包茶葉',J(M));
    GIFTH.sisBdaySync(G); check('13④ 只記一次',SOCIAL.memories(SIS).filter(m=>m.tag==='GIFT_GIVEN_'+SIS).length===1);
    const G2=setup('2026-06-02',20,{lv:{[SIS]:3},flags:{SIS_BDAY_Y1:'water'}}); GIFTH.tick(GM);
    /* 2026-11-10 改期望（AA_732 5acf44bbc：只有遞茶葉算送過）：舊期望「選陪她裝熱水（water）那天也沒有送她禮物…」→ 新期望那天照樣有「送她禮物…」、不記 sent、不記 GIFT_GIVEN */
    { const hasFn=typeof GIFTH.barEventGift==='function', src=require('fs').readFileSync(require('path').join(H.ROOT,'src/gifthol3d.js'),'utf8');
      check('13③b 芷若「兩點半的店員」（ev_cafe_barista_zhiruo）演完接「送她禮物…／（就這樣）」（AA_732 5acf44bbc）：barEventGift 存在、EVENTS.run 包了那個事件 id',hasFn&&/ev\.id==='ev_cafe_barista_zhiruo'[\s\S]{0,80}barEventGift/.test(src)); }
    check('13④ 選陪她裝熱水（water）：沒給東西＝那一天照樣有「送她禮物…」；不記成送過、不記 GIFT_GIVEN（AA_732 5acf44bbc）',!!opt(SIS)&&!GIFTH.rec(G2).sent[SIS+'|bday|2026']&&!SOCIAL.memories(SIS).some(m=>m.tag==='GIFT_GIVEN_'+SIS));
    const G3=setup('2026-06-02',20,{lv:{[SIS]:3},flags:{SIS_BDAY_Y1:'missed'}}); buy('g_green_hl');
    check('13④ 沒演到（missed）：照一般送禮',!!opt(SIS)&&!opt(SIS).dim);
    const G4=setup('2026-06-02',17,{lv:{[SIS]:3}}); buy('g_green_hl'); let r=await run(()=>opt(SIS).run(GM,who(SIS)),['螢光筆']);
    check('13④ 還沒演（沒有旗標）：照一般送禮，送了記那一年的生日',GIFTH.sentThis(G4,SIS,{k:'bday',y:2026})&&GIFTH.rec(G4).sent[SIS+'|bday|2026']==='g_green_hl');
    const G5=setup('2027-06-02',20,{lv:{[SIS]:3},flags:{SIS_BDAY_Y1:'tea',SIS_BDAY_Y2:'tea'}});
    check('13④ 2027（SIS_BDAY_Y2）也一樣',!opt(SIS)&&!!GIFTH.rec(G5).sent[SIS+'|bday|2027']);
    const G6=setup('2027-06-02',20,{lv:{[SIS]:3},flags:{SIS_BDAY_Y1:'tea'}}); buy('g_green_hl');
    check('13④ 2026 演過、2027 沒演：2027 照一般送禮',!!opt(SIS));
    const G7=setup('2028-06-02',20,{lv:{[SIS]:3},flags:{SIS_BDAY_Y1:'tea',SIS_BDAY_Y2:'tea'}}); buy('g_green_hl');
    check('13④ 2028（沒有原本那個事件）：照一般送禮',!!opt(SIS)); });
  await sec('13山嵐',async()=>{ const at=GIFTH.SL_SCHED.at, d=Math.hypot(at[0]-GIFTH.SL_AT.x,at[1]-GIFTH.SL_AT.z);
    check('13 山嵐文具區學姊的站位離「看文具」≥1.2 m（BUG-SHANLAN-SIS-STEAL-1110；原本 (4.15, 6.5) 0.35 m）',d>=1.2,d.toFixed(2)); });
  GM.say=say0;

  H.done();
})();
