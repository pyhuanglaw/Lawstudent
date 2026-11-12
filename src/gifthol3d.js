/* ===== 節日、生日送禮（GIFT-HOLIDAY-1110；USER_WANTS X276、X277、X278、X291）=====
   使用者 11-10（經 LAWWW-B）：「應該要各個店都有東西可以買 選幾個特殊日子 聖誕節 情人節 生日 可以送禮? 不占那個時間一件事的slot 但同個節日除了生日應該只能送兩個人禮物」
   「好感度到一定程度 聖誕節或情人節(七夕還有2/14) 對方也會送我禮物 只限可攻略對象」「學姊很喜歡文具 山嵐書店要有文具區…特殊日子可以送學姊?」「已經買的禮物要出現物品欄位可以查看??」
   台詞：AA_732／AA_733／AA_734（AA 定稿 D109）——src/data/gift_holiday.js，tools/gift/import_gift_holiday.py 產生。這裡只有程式和系統字（價錢、「買禮物…」「送她禮物…」、包包的提示）。
   規則（AA_732 rules）：
   - 節日：聖誕（12/24、12/25 同一個節）、2/14、七夕（FEST_DATA.QIXI，AA_416 1-1）、她的生日（FEST_DATA.BDAY）。3/14 不在這套。平常日子沒有「送她禮物…」；可以先買。
   - 不扣時段、不算行動次數（不 GM.advance）。
   - 同一個節日最多送兩個人（聖誕、2/14、七夕各自算；生日不限）：第三個人的選項灰掉，按下去演 third 的旁白（輪流）。
   - 一個人一個節日只收一份；同一樣東西同一個人一輩子一次（送過的那一樣不列她）。
   - 誰：七位女主角＋芯慈（XCROM.ON）；朋友不能送；第 0 階（陌生人，SOCIAL.stage STRANGER）不列。
   - 怎麼送：節日那天當面說話（STORY.TALK_OPTS，story3d.js offerInvite）多「送她禮物…」→ 挑包包裡的一樣。視訊、電話不能送（那兩條路不走 TALK_OPTS）。
   - 節日約會（AA_416，fest3d.js FEST.gift）：1-8 的四樣改成「包包裡的禮物＋（沒有準備）」，反應照這份、不演 open；（沒有準備）照 AA_416 那一格；約會裡送的也算那個節的兩個人之一。
   - 可昕：那一天有她的專屬場次、場次裡有禮物＝這套不出現（S.kxSkip）。
   - 買：各店的點餐或互動多「買禮物…」（afar＝「選物…」）→ 那家店的東西、價錢、說明；錢不夠灰掉；包包最多 10 樣；不會過期。
   - 反應：band A＝第 1～2 階、B＝3～4、C＝5～6、D＝交往中（DATE.stageNum）。先 open[節][band]（約會裡送的不演）→ item[id][band 或 *]，沒有就照 love／ok／no[band]。
   - 好感（AA_416 1-7 送禮那兩列）：love＝她的戀愛 +2（認識以上就算，30c4cbd45）、信任 +3；ok＝信任 +2；no＝信任 +1。節日不受每天上限。
   - 記憶：love 的那一樣 GIFT_LOVE_<人物>（人物頁「她喜歡○○」）；送過的都記 GIFT_GIVEN_<人物>。special 兩樣不用買、只有那一位的選單會列。
   她送祐廷（AA_734）：gate（聖誕第 4 階以上 B／C／D／D2；2/14、七夕第 6 階或交往中 C／D／D2）、how（當面那天給；交往中沒見到＝7 天內第一次見到給、多一句 late；
     交往中她在國外／老家＝宿舍信箱包裹、卡片；existing＝那一年那個節照專屬場次）；收到的東西進宿舍房間的櫃子（STORY.ROOM_EXTRA）、人物頁「她送的」、選單「物品」。
   山嵐文具區學姊（AA_734 stationery）：學期中週六 15:00～16:00、隔週（上課週次單數）在文具區（STORY.SCHED_X）；走到文具區旁邊＝那一場（sl_sis_1／2／3／rot）；兩則提示。
   AA_732 rules 最後一條（d1bf75f6f，11-10 12:4x 補四問，AA 定）：
     ① 第三個人＝同一個節日第三個收禮人（S.capped，程式本來就對）；旁邊有沒有別人不影響。
     ② 圖書館讀書區「小聲」那套（D127；期末考前 EXLIB.talk 的點頭／（小聲）那幾句不走 offerInvite）：打完招呼多一個「送她禮物…」（S.libTalk，examlib3d.js 呼叫）；
        反應照一般的 open／item／love-ok-no，她的第一句前面加「（小聲）」（o.quiet：LIBQ.quiet，讀書區的 GM.say 本來就會整段加；A館 4F 不是 LIBQ 的區域＝只有第一句加）。
        平常（不是期末考前）的讀書區照舊走 offerInvite 的 TALK_OPTS，GM.say 的 LIBQ.whisper 自動加。
     ③ 芷若在吧檯上班（story3d.js counter，n.staff==='cafe'）：點餐選單多「送她禮物…」（S.counterOpt，條件同 S.talkOpts）；送出去以後演完加旁白 S.COUNTER_NARR。
     ④ 學姊生日原本的事件（sis_y2y3_events.js 2-4 bday：ev_sis_bday_y1／y2、ev_sis_bday_date_y1／y2；旗標 SIS_BDAY_Y1／Y2）演過＝那一天不出「送她禮物…」（S.sentThis）；
        選了遞茶葉（'tea'）＝那一年的生日禮物，記 sent（bday|年）＋GIFT_GIVEN_heroine_05（S.sisBdaySync）；沒演到（missed、沒有旗標）＝照一般送禮。
   存檔：G.flags.GIFTH＝{bag:[{id,day,shop}], given:{人物:[id]}, fest:{'節|年':[人物]}, sent:{'人物|節|年':id}, got:{'人物|節|年':{day,band,mode}}, recv:[{pid,k,y,band,item,line,day,mail}],
     mail:{'人物|節|年':{day,played}}, sl:{s1,s2,s3,rot,day}, hint:{'pen|年','case|年'}, third}；舊存檔沒有＝空的（讀的時候補）。
   測試：node tests/gift_holiday_unit.js */
'use strict';
const GIFTH=(function(){
  const S={};
  const X=()=>typeof GIFT_HOLIDAY!=='undefined'?GIFT_HOLIDAY:null;
  S.on=()=>!!X();
  S.MAX=10; S.LABEL='買禮物…'; S.TALK='送她禮物…';
  S.SHOP_LABEL={afar:'選物…'};   /* AA_732：afar 櫃台旁邊的玻璃櫃＝新的點餐項目「選物」*/
  S.PEOPLE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin','classmate_xinci'];
  S.HER_K=['xmas','vday','qixi'];   /* 她送祐廷：聖誕、2/14、七夕（生日不送）*/
  /* 季節品：g_warmer「冬天才有。」（AA_732 line）——12～2 月才賣（同 gift3d.js 的冬天）*/
  S.SEASON={g_warmer:m=>m===12||(m>=1&&m<=2)};
  S.REL={love:{trust:3,npcRom:2},ok:{trust:2},no:{trust:1}};
  const F=G=>{ const f=G.flags||(G.flags={}); let r=f.GIFTH; if(!r||typeof r!=='object'||Array.isArray(r)) r=f.GIFTH={};
    if(!Array.isArray(r.bag)) r.bag=[]; if(!Array.isArray(r.recv)) r.recv=[];
    for(const k of ['given','fest','sent','got','mail','sl','hint']) if(!r[k]||typeof r[k]!=='object'||Array.isArray(r[k])) r[k]={};
    r.third=r.third|0; return r; };
  S.rec=F;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const ymd=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d):null;
  const FD=()=>typeof FEST_DATA!=='undefined'?FEST_DATA:{QIXI:{},BDAY:{},PEOPLE:{}};
  const pad=n=>String(n).padStart(2,'0');
  const romR=(G,id)=>((G&&G.flags&&G.flags.romance)||{})[id]||null;
  const dating=(G,id)=>{ const f=(G&&G.flags)||{}, R=romR(G,id); return f['dating_'+id]===true||!!(R&&R.status==='dating'); };
  const stageNum=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1;
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const pres=(G,id,day)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,day==null?G:Object.assign({},G,{day})):{here:true};
  const xcOn=()=>typeof XCROM!=='undefined'&&!!XCROM.ON;
  S.text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  S.who=(id,n)=>({name:nm(id),obj:n&&n.obj,charId:id,pose:n&&n.pose});
  /* 一句開頭是（動作）、後面接著講話的，拆成旁白＋她說的（字不改；同 gift3d.js）*/
  /* q＝{first:true}：她說的第一句前面加「（小聲）」（② 讀書區；LIBQ.quiet：已經是小聲的不重複），加過就清掉 */
  S.QUIET='（小聲）';
  const hush=(q,s)=>{ if(!q||!q.first) return s; q.first=false; return typeof LIBQ!=='undefined'&&LIBQ.quiet?LIBQ.quiet(s):(/小聲/.test(s)?s:S.QUIET+s); };
  const play=async(GM,who,lines,q)=>{ for(const t of lines||[]){ const s=S.text(GM.G,t), m=/^(（[^）]*）)(.+)$/.exec(s); if(m){ await GM.say(null,m[1]); await GM.say(who,hush(q,m[2])); } else if(/^（/.test(s)) await GM.say(null,s); else await GM.say(who,hush(q,s)); } };
  S.play=play;

  /* ---------------- 節日 ---------------- */
  S.KNAME={xmas:'聖誕節',vday:'情人節',qixi:'七夕',bday:'生日'};
  /* 那一天是不是她的送禮節日：{k,y}／null（聖誕兩天同一個節）*/
  S.holOf=function(pid,day){ const d=ymd(day); if(!d) return null; const md=pad(d.m)+'-'+pad(d.d);
    if(d.m===12&&(d.d===24||d.d===25)) return {k:'xmas',y:d.y};
    if(md==='02-14') return {k:'vday',y:d.y};
    const q=(FD().QIXI||{})[d.y]; if(q&&q===d.y+'-'+md) return {k:'qixi',y:d.y};
    const b=(FD().BDAY||{})[pid]; if(b&&b===md) return {k:'bday',y:d.y};
    return null; };
  /* 節日的第一天、最後一天（交往第幾年用）*/
  S.holSpan=function(k,y){ if(k==='xmas'){ const a=DK(y+'-12-24'); return a==null?null:[a,a+1]; } if(k==='vday'){ const a=DK(y+'-02-14'); return a==null?null:[a,a]; }
    if(k==='qixi'){ const q=(FD().QIXI||{})[y]; const a=q?DK(q):null; return a==null?null:[a,a]; } return null; };
  const hkey=(pid,k,y)=>pid+'|'+k+'|'+y;

  /* ---------------- 誰、band ---------------- */
  /* 可以送的對象：七位女主角＋芯慈（XCROM.ON）；第 0 階（陌生人）不列；交往中一定算 */
  S.canGet=function(G,pid){ if(!S.PEOPLE.includes(pid)) return false; if(pid==='classmate_xinci'&&!xcOn()) return false; if(!X()||!X().react[pid]) return false;
    if(dating(G,pid)) return true; if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return false; return SOCIAL.stage(pid)!=='STRANGER'; };
  S.band=(G,pid)=>{ if(dating(G,pid)) return 'D'; const n=stageNum(pid); return n>=5?'C':(n>=3?'B':'A'); };
  /* 可昕（rules 第 9 條）：那一天有她的專屬場次、場次裡有禮物＝這套不出現。AA_325 2-Y2-07 聖誕（說了「好。」）；AA_734 existing：交往中的 2/14（四年）、聖誕 2026～2028、七夕 2027 */
  S.kxSkip=function(G,k,y){ const f=(G&&G.flags)||{}; if(k==='xmas'&&y===2026&&f.KX_XMAS_Y2==='yes') return true; if(!dating(G,'kexin')) return false;
    return k==='vday'||(k==='xmas'&&y>=2026&&y<=2028)||(k==='qixi'&&y===2027); };

  /* ---------------- 包包 ---------------- */
  S.item=gid=>(X()&&X().items[gid])||null;
  S.SHOP_RENAME={gg_flower:'花序 Flower Notes'};   /* 使用者 2026-11-10（X325）：站口花攤升級成 G11 的「花序 Flower Notes」，店名是她給的；包包、送禮選單顯示新店名（舊存檔買過的花一樣）*/
  S.shopName=key=>{ if(S.SHOP_RENAME[key]) return S.SHOP_RENAME[key]; const s=X()&&X().shops[key]; return s?s.name.replace(/（新）$/,'').replace(/，新）$/,'）'):''; };   /* AA_732 店名後面的「新」是企劃註記（新店），畫面不顯示（BB 11-10 BUG-GIFT-SHOPNAME-NEW-1110）*/
  S.bag=G=>F(G).bag.filter(b=>b&&S.item(b.id));
  S.full=G=>S.bag(G).length>=S.MAX;
  /* AA_416 1-8 舊的送禮（G.fest.gifts）：同名的那一樣算送過了；以安 2028 情人節的鋼筆（AN_VDAY_GIFT pen，AA_733 reuse）*/
  const oldGiven=(G,pid,gid)=>{ const it=S.item(gid); if(!it) return false; if(pid==='heroine_01'&&gid==='g_fountain'&&G.flags&&G.flags.AN_VDAY_GIFT==='pen') return true;
    const ids=((G.fest&&G.fest.gifts)||{})[pid]||[]; if(!ids.length) return false; const P=(FD().PEOPLE||{})[pid]||{}; return (P.gifts||[]).some(g=>ids.includes(g.id)&&g.name===it.name); };
  /* made（FLOWER-CLASS-1112，AA_820）：花藝課自己做的成品——可以重複上課、重複送（稿：「之後再送照 give 的三句」），不套「同一樣同一個人一輩子一次」*/
  S.givenTo=(G,pid,gid)=>!(S.item(gid)||{}).made&&((F(G).given[pid]||[]).includes(gid)||oldGiven(G,pid,gid));
  /* special 兩樣（不用買、不佔包包）：子晴的測試報告（玩過她的測試版 ZQ_TB_PLAYED）、學姊的「今天先不改了」券（W8 以後 STORY.sisW8）*/
  S.SPECIAL_ON={g_test_report:G=>!!(G.flags&&G.flags.ZQ_TB_PLAYED!=null),g_no_edit:G=>typeof STORY!=='undefined'&&STORY.sisW8?!!STORY.sisW8(G):false};
  S.specials=G=>Object.keys(S.SPECIAL_ON).filter(gid=>S.item(gid)&&S.SPECIAL_ON[gid](G));
  /* 她可以收的：包包裡的（同一樣只列一次）＋她的 special；送過的那一樣不列 */
  S.givable=function(G,pid){ const out=[], seen=new Set();
    for(const b of S.bag(G)){ const it=S.item(b.id); if(seen.has(b.id)||(it.only&&!it.only.includes(pid))||S.givenTo(G,pid,b.id)) continue; seen.add(b.id); out.push({id:b.id,shop:b.shop}); }
    for(const gid of S.specials(G)){ const it=S.item(gid); if((it.only||[]).includes(pid)&&!S.givenTo(G,pid,gid)) out.push({id:gid,shop:'special',special:true}); }
    return out; };
  /* 這一樣對她：love／no／ok */
  S.cat=(pid,gid)=>{ const it=S.item(gid)||{}; return (it.love||[]).includes(pid)?'love':((it.no||[]).includes(pid)?'no':'ok'); };

  /* ---------------- 店：買禮物 ---------------- */
  S.sells=(G,key)=>{ const s=X()&&X().shops[key]; if(!s) return []; const m=(ymd(G.day)||{}).m||0; return s.items.filter(gid=>!S.SEASON[gid]||S.SEASON[gid](m)); };
  S.shopOpt=function(G,key){ if(!G||!S.sells(G,key).length) return null; const full=S.full(G);
    return {t:S.SHOP_LABEL[key]||S.LABEL,hint:full?'包包已經放了 '+S.MAX+' 樣':'節日、生日的時候送她（包包 '+S.bag(G).length+'/'+S.MAX+'）',dim:full,giftH:key}; };
  /* o.bought(gid)：付了錢、放進包包以後，「你買了…」以前演的（花序的花藝師包花那幾句，src/flower_notes_sys3d.js）*/
  S.buy=async function(GM,key,o){ const G=GM.G, L=S.sells(G,key); if(!L.length) return null; if(S.full(G)){ GM.toast&&GM.toast('包包已經放了 '+S.MAX+' 樣了'); return null; }
    const opts=L.map(gid=>{ const it=S.item(gid); return {t:it.name+'　'+it.price+' 元',hint:it.line,dim:(G.money|0)<it.price}; }); opts.push({t:'算了'});
    const i=await GM.choose(opts); const gid=L[i]; if(!gid) return null; const it=S.item(gid);
    if((G.money|0)<it.price){ GM.toast&&GM.toast('錢不夠'); return 'poor'; }
    if(GM.money) GM.money(-it.price,'禮物'); else G.money=(G.money|0)-it.price;
    F(G).bag.push({id:gid,day:G.day,shop:key}); if(o&&o.bought) await o.bought(gid); await GM.say(null,'你買了'+it.name+'，放進包包。'); if(GM.autosave) GM.autosave(); return gid; };
  /* 店家選單接一行：opts 裡有 S.shopOpt 的那一項被選到 → 買 */
  /* 公館站口花攤「晨露花舖」（GG-FLOWER-STALL-1110，LAWWW2 9356eeb39；AA_732 gg_flower）：09:00～21:00 開著，按「看看花攤」就是買花清單；沒開照舊是看（zones3d 的 look）*/
  /* 2026-11-12（FLOWER-NOTES-1110）：花攤升級成花序 Flower Notes——買花、營業時間（AA_792：10:00～21:00）、花藝師的句子在 src/flower_notes_sys3d.js（FNS，包在這一支的外面先接）；
     FNS 沒載入（只載這一支的測試）才走下面原本的 09:00～21:00 */
  S.flowerOpen=G=>{ if(typeof FNS!=='undefined'&&FNS.on&&FNS.on()) return FNS.open(G); const h=+G.hour||0; return h>=9&&h<21; };
  S.pick=async function(GM,o){ if(!o||!o.giftH) return false; if(o.dim){ GM.toast&&GM.toast(o.hint); return true; } await S.buy(GM,o.giftH); return true; };

  /* ---------------- 這個節日、她 ---------------- */
  S.capped=function(G,pid,h){ if(!h||h.k==='bday') return false; const L=F(G).fest[h.k+'|'+h.y]||[]; return L.length>=2&&!L.includes(pid); };
  S.sentThis=function(G,pid,h){ if(!h) return false; if(F(G).sent[hkey(pid,h.k,h.y)]) return true;
    if(pid==='heroine_05'&&h.k==='xmas'&&h.y===2025&&typeof FAMXMAS!=='undefined'&&FAMXMAS.gave&&FAMXMAS.gave(G)) return true;   /* AA_406：家族的那一份算那一年的聖誕禮物（同 fest3d.js）*/
    if(pid==='heroine_05'&&h.k==='bday'&&S.sisBdayPlayed(G,h.y)) return true;   /* ④ 她生日原本的事件演過了（AA_732 rules 最後一條）*/
    return false; };
  /* ④ 學姊生日原本的事件（sis_y2y3_events.js 2-4）：2026、2027 兩年；旗標 there／tea／water＝演過（missed＝沒演到）*/
  S.SIS_BDAY={2026:'SIS_BDAY_Y1',2027:'SIS_BDAY_Y2'};
  S.SIS_BDAY_PLAYED=['tea'];   /* AA_732 5acf44bbc：只有「遞茶葉」算送過（GIFT_GIVEN、當天不出送禮）；選「生日快樂」「陪她裝熱水」沒給東西，當天照樣可以送（原本三個都算）*/
  S.SIS_TEA='一包茶葉';   /* 原本事件的那一項「（遞給她一包茶葉）」*/
  S.sisBdayPlayed=(G,y)=>{ const f=S.SIS_BDAY[y]; return !!f&&S.SIS_BDAY_PLAYED.includes(((G&&G.flags)||{})[f]); };
  /* 今天是她的生日、原本的事件演過了：記成那一年的生日（sent bday|年）；遞茶葉＝記 GIFT_GIVEN（那一天那一筆）。只記一次 */
  S.sisBdaySync=function(G){ if(!S.on()||!G) return false; const pid='heroine_05', h=S.holOf(pid,G.day); if(!h||h.k!=='bday'||!S.sisBdayPlayed(G,h.y)) return false;
    const R=F(G), key=hkey(pid,h.k,h.y); if(R.sent[key]) return false; const v=G.flags[S.SIS_BDAY[h.y]]; R.sent[key]='sis_bday_'+v;
    if(v==='tea'&&typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(pid,'GIFT_GIVEN_'+pid,S.SIS_TEA);
    return true; };
  /* 當面說話時：今天能不能出「送她禮物…」——{h, items, capped}／null */
  S.state=function(G,pid){ if(!S.on()||!G||!S.canGet(G,pid)) return null; const h=S.holOf(pid,G.day); if(!h) return null; if(pid==='heroine_05') S.sisBdaySync(G);
    if(pid==='kexin'&&S.kxSkip(G,h.k,h.y)) return null; if(S.sentThis(G,pid,h)) return null;
    return {h,items:S.givable(G,pid),capped:S.capped(G,pid,h)}; };
  S.talkOpts=function(G,id){ const st=S.state(G,id); if(!st) return [];
    const hint=st.capped?'這個節日已經送了兩個人':(st.items.length?'包包裡有 '+st.items.length+' 樣可以送她':'包包裡沒有可以送她的（店裡可以買）');
    return [{t:S.TALK,hint,dim:st.capped||!st.items.length,run:async(GM,who)=>{ await S.giveTalk(GM,who||S.who(id),id); }}]; };
  S.thirdLine=async function(GM){ const R=F(GM.G), T=X().third; await GM.say(null,T[R.third%T.length]); R.third++; };
  S.giveTalk=async function(GM,who,pid,o){ const G=GM.G, st=S.state(G,pid); if(!st) return null; o=o||{};
    if(st.capped){ await S.thirdLine(GM); return 'third'; }
    if(!st.items.length){ GM.toast&&GM.toast('包包裡沒有可以送她的禮物'); return null; }
    const opts=st.items.map(b=>({t:S.item(b.id).name,hint:b.special?'':S.shopName(b.shop)})); opts.push({t:'算了'});
    const i=await GM.choose(opts), b=st.items[i]; if(!b) return null;
    const r=await S.hand(GM,who,pid,b.id,st.h,{quiet:!!o.quiet}); await S.herGive(GM,who,pid,{gave:true}); return r; };
  /* 交出去：記錄、演反應、好感、記憶。o.date＝節日約會裡（不演 open）*/
  S.hand=async function(GM,who,pid,gid,h,o){ const G=GM.G, R=F(G), it=S.item(gid); if(!it) return null; o=o||{};
    if(it.shop!=='special'){ const k=R.bag.findIndex(b=>b&&b.id===gid); if(k>=0) R.bag.splice(k,1); }
    (R.given[pid]||(R.given[pid]=[])).push(gid); if(h) R.sent[hkey(pid,h.k,h.y)]=gid;   /* h＝null：不是節日（只有 made 的成品，src/flower_class3d.js）*/
    if(h&&h.k!=='bday'){ const L=R.fest[h.k+'|'+h.y]||(R.fest[h.k+'|'+h.y]=[]); if(!L.includes(pid)) L.push(pid); }
    const T=X().react[pid], band=S.band(G,pid), cat=S.cat(pid,gid);
    const q=o.quiet?{first:true}:null;   /* ② 讀書區：她的第一句前面加「（小聲）」*/
    /* made 的成品（AA_820 花藝課）：反應照那份稿（S.MADE，src/flower_class3d.js 掛上來）——不演 item／love-ok-no 那幾格、不加一般送禮的好感（稿沒有寫的不加）；節日的 open 照演 */
    if(it.made&&typeof S.MADE==='function'){ await S.MADE(GM,who,pid,gid,{q,hand:()=>GM.say(null,'你把'+it.name+'遞給'+(who&&who.name||nm(pid))+'。'),open:()=>(h&&!o.date)?play(GM,who,T.open[h.k][band],q):null});
      if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(pid,'GIFT_GIVEN_'+pid,it.name); if(GM.autosave) GM.autosave(); return 'made'; }
    await GM.say(null,'你把'+it.name+'遞給'+(who&&who.name||nm(pid))+'。');
    if(!o.date) await play(GM,who,T.open[h.k][band],q);
    const ic=T.item[gid]; await play(GM,who,ic?(ic[band]||ic['*']):T[cat][band],q);
    S.adjust(G,pid,cat);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.remember){ if(cat==='love') SOCIAL.remember(pid,'GIFT_LOVE_'+pid,it.name); SOCIAL.remember(pid,'GIFT_GIVEN_'+pid,it.name); }
    if(pid==='heroine_02'&&gid==='g_old_poster'&&G.flags) G.flags.ZR_POSTER=true;   /* AA_416 1-8 的老電影海報（AA_524 Z8，src/aa524_3d.js）：送到的一樣記 */
    if(GM.autosave) GM.autosave(); return cat; };
  S.adjust=function(G,pid,cat){ if(typeof SOCIAL==='undefined'||!SOCIAL.adjust) return; const d=Object.assign({},S.REL[cat]||{});
    /* 她的戀愛：認識以上就算（AA_732 rules 第 12 條 30c4cbd45，照 X281／ROM-PRIVATE-DATE-1110；原本第 3 階以上才算）。第 0 階本來就不能送 */
    SOCIAL.adjust(pid,d); };

  /* ---------------- 節日約會（AA_416 1-8，fest3d.js FEST.gift）---------------- */
  S.festGift=async function(GM,id,k,y){ const G=GM.G;
    if(id==='heroine_05'&&k==='xmas'&&y===2025&&typeof FAMXMAS!=='undefined'&&FAMXMAS.gave&&FAMXMAS.gave(G)) return null;   /* 照舊（fest3d.js）*/
    if(!S.canGet(G,id)) return null; const h={k,y}; if(id==='kexin'&&S.kxSkip(G,k,y)) return null;
    const who=S.who(id), P=(FD().PEOPLE||{})[id]||{};
    if(S.sentThis(G,id,h)){ await S.herGive(GM,who,id,{gave:true}); return null; }   /* 今天已經送過她了（一個節日一份）：約會這裡不再問 */
    for(let guard=0;guard<10;guard++){ const L=S.givable(G,id), cap=S.capped(G,id,h);
      const opts=L.map(b=>({t:S.item(b.id).name,hint:cap?'這個節日已經送了兩個人':(b.special?'':S.shopName(b.shop)),dim:cap})).concat([{t:'（沒有準備）'}]);
      const i=await GM.choose(opts);
      if(i<0||i>=L.length){ if(typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines((P.noneBy&&P.noneBy[k])||P.none||[],{id:'fest_'+id,participants:[id]}); await S.herGive(GM,who,id,{gave:false}); return 'none'; }   /* AA_416 那一格的「沒有準備」照舊 */
      if(cap){ await S.thirdLine(GM); continue; }
      await S.hand(GM,who,id,L[i].id,h,{date:true}); await S.herGive(GM,who,id,{gave:true}); return L[i].id; }
    return null; };

  /* ---------------- 她送祐廷（AA_734）---------------- */
  /* 交往的第幾個這個節（第一年＝1）：交往開始以後、到今天為止的那幾次；可昕從開局就在交往（沒有 sinceDay）＝從遊戲開始算 */
  S.datingN=function(G,pid,k,day){ const R=romR(G,pid), since=R&&R.sinceDay!=null?R.sinceDay:-1e9; let n=0;
    for(let y=2025;y<=2030;y++){ const sp=S.holSpan(k,y); if(!sp) continue; if(sp[0]<=day&&sp[1]>=since) n++; } return n; };
  /* gate：聖誕第 4 階 B、5～6 C、交往中 D／D2（第二年 D2、第三年 D、第四年 D2）；2/14 第 6 階 C、交往中第一年 D、第二年起 D2；七夕第 6 階 C、交往中 D */
  S.herBand=function(G,pid,k,day){ const dt=dating(G,pid), n=stageNum(pid);
    if(k==='xmas'){ if(dt){ const c=S.datingN(G,pid,k,day); return c>=2&&c%2===0?'D2':'D'; } return n>=5?'C':(n>=4?'B':null); }
    if(k==='vday'){ if(dt) return S.datingN(G,pid,k,day)>=2?'D2':'D'; return n>=6?'C':null; }
    if(k==='qixi'){ if(dt) return 'D'; return n>=6?'C':null; }
    return null; };
  const festDone=(G,id,k,y)=>((G.fest&&G.fest.done)||{})[id+':'+k+':'+y]==='meet';
  const memYear=(id,tag,y)=>{ const M=(typeof SOCIAL!=='undefined'&&SOCIAL.memories)?SOCIAL.memories(id):[]; return (M||[]).some(m=>m&&m.tag===tag&&(ymd(m.day)||{}).y===y); };
  /* existing（AA_734 各人那一格）：那一年那個節已經有她送你的場次＝這套不再給 */
  S.EXISTING={
    heroine_01:(G,k,y)=>(k==='xmas'&&dating(G,'heroine_01')&&festDone(G,'heroine_01',k,y))||(k==='vday'&&memYear('heroine_01','AN_VDAY_TC',y)),
    heroine_02:(G,k,y)=>(k==='xmas'&&stageNum('heroine_02')>=5&&festDone(G,'heroine_02',k,y))||(k==='qixi'&&festDone(G,'heroine_02',k,y)),
    heroine_03:(G,k,y)=>k==='xmas'&&dating(G,'heroine_03')&&festDone(G,'heroine_03',k,y),
    heroine_04:(G,k,y)=>(k==='xmas'||k==='vday')&&festDone(G,'heroine_04',k,y),
    heroine_05:(G,k,y)=>{ const f=G.flags||{}; if(k==='xmas'&&y===2025&&typeof FAMXMAS!=='undefined'&&FAMXMAS.gave&&FAMXMAS.gave(G)) return true; if(k==='xmas'&&y===2026&&f.SIS_XMAS_Y2==='there') return true;
      return dating(G,'heroine_05')&&typeof FEST!=='undefined'&&FEST.dedicated&&!!FEST.dedicated(G,'heroine_05',k,y)&&!!(FEST.cell&&FEST.cell('heroine_05',k)); },
    classmate_peishan:(G,k,y)=>dating(G,'classmate_peishan')&&festDone(G,'classmate_peishan',k,y),
    kexin:(G,k,y)=>S.kxSkip(G,k,y),
    classmate_xinci:()=>false };
  S.existing=(G,pid,k,y)=>{ const f=S.EXISTING[pid]; return !!f&&!!f(G,k,y); };
  S.herCell=function(G,pid,k,y,day){ const P=X()&&X().give[pid]; if(!P||!P[k]) return null; if(pid==='classmate_xinci'&&!xcOn()) return null; if(!S.canGet(G,pid)) return null;
    if(S.existing(G,pid,k,y)) return null; const b=S.herBand(G,pid,k,day==null?G.day:day); if(!b) return null; const c=P[k][b]||(b==='D2'?P[k].D:null); return c?{band:b,cell:c}:null; };
  /* 今天見到她要不要給：{k,y,band,cell,late}／null。那一天＝當面；交往中、那一天沒見到＝之後 7 天內第一次見到（late）*/
  S.herDue=function(G,pid){ if(!S.on()||!G) return null; const R=F(G), h=S.holOf(pid,G.day);
    if(h&&S.HER_K.includes(h.k)&&!R.got[hkey(pid,h.k,h.y)]){ const c=S.herCell(G,pid,h.k,h.y); if(c) return Object.assign({k:h.k,y:h.y,late:false},c); }
    if(!dating(G,pid)) return null;
    for(let dd=1;dd<=7;dd++){ const d0=G.day-dd, h0=S.holOf(pid,d0); if(!h0||!S.HER_K.includes(h0.k)) continue; if(h&&h.k===h0.k&&h.y===h0.y) continue; if(R.got[hkey(pid,h0.k,h0.y)]) continue;
      const c=S.herCell(G,pid,h0.k,h0.y,d0); if(c) return Object.assign({k:h0.k,y:h0.y,late:true},c); }
    return null; };
  const recvAdd=(G,pid,d,mode)=>{ const R=F(G); R.got[hkey(pid,d.k,d.y)]={day:G.day,band:d.band,mode}; R.recv.push({pid,k:d.k,y:d.y,band:d.band,item:d.cell.item,line:d.cell.lines[0],day:G.day,mail:mode==='mail'});
    if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(pid,'GIFT_FROM_'+pid+'_'+d.k+'_'+d.y,d.cell.item); };   /* 她送你的時候不加不扣好感（AA_734 how 第 6 點）*/
  /* 當面給：你先送她＝反應演完接著演；你沒有送她＝她先給、C／D 多一句 youHadNone；late 那一句放最前面 */
  S.herGive=async function(GM,who,pid,o){ const G=GM.G, d=S.herDue(G,pid); if(!d) return null; o=o||{}; const P=X().give[pid];
    const gave=o.gave!=null?!!o.gave:!!F(G).sent[hkey(pid,d.k,d.y)];
    recvAdd(G,pid,d,d.late?'late':'meet');
    if(d.late) await play(GM,who,[P.late]);
    await play(GM,who,[d.cell.scene]); await play(GM,who,d.cell.lines);
    if(!gave&&/^(C|D|D2)$/.test(d.band)) await play(GM,who,[P.youHadNone]);
    if(GM.autosave) GM.autosave(); return d.band; };
  /* 說完話（offerInvite 的選單結束）還沒給的：她給（你今天沒有送她）*/
  S.afterTalk=async function(GM,who,pid){ if(!S.herDue(GM.G,pid)) return null; return S.herGive(GM,who||S.who(pid),pid,{}); };
  /* ② 圖書館讀書區「小聲」那套（examlib3d.js EXLIB.talk 打完招呼以後呼叫）：今天能送＝選單「送她禮物…」「就這樣」；送了照 giveTalk（她的第一句加（小聲））；
     沒送＝她給（同 offerInvite 後面的 S.afterTalk）。今天不能送＝什麼都不做（null）*/
  S.libTalk=async function(GM,who,pid){ const O=S.talkOpts(GM.G,pid); if(!O.length) return null; who=who||S.who(pid);
    const k=await GM.choose(O.map(o=>({t:o.t,hint:o.hint,dim:o.dim})).concat([{t:'就這樣'}]));
    if(k===0){ const r=await S.giveTalk(GM,who,pid,{quiet:true}); if(r==='love'||r==='ok'||r==='no') return r; }
    await S.afterTalk(GM,who,pid); return k===0?'none':'skip'; };
  /* ③ 芷若在吧檯上班（story3d.js counter 的點餐選單）：條件同 S.talkOpts；送出去以後演完加旁白 */
  S.COUNTER_NARR='（她把東西收到吧檯下面。）';
  S.counterOpt=function(G,pid){ const o=S.talkOpts(G,pid)[0]; return o?{t:o.t,hint:o.hint,dim:o.dim,giftHer:pid}:null; };
  /* ③b 每天第一次和她說話演的「兩點半的店員」（ev_cafe_barista_zhiruo，一天一次，有自己的點餐）：演完、能送的節日／她生日，接著問「送她禮物…／（就這樣）」（AA_732 5acf44bbc） */
  S.barEventGift=async function(GM){ const o=S.counterOpt(GM.G,'heroine_02'); if(!o||o.dim) return null; GM.sceneBegin&&GM.sceneBegin(); try{ const k=await GM.choose([{t:o.t,hint:o.hint},{t:'（就這樣）'}]); if(k===0) return await S.counterGive(GM,null,'heroine_02'); } finally { GM.sceneEnd&&GM.sceneEnd(); } return null; };
  S.counterGive=async function(GM,who,pid){ const r=await S.giveTalk(GM,who||S.who(pid),pid); if(r==='love'||r==='ok'||r==='no') await GM.say(null,S.COUNTER_NARR); return r; };
  /* 交往中、那一天她在國外／老家：宿舍信箱的包裹（還沒交往的不寄）*/
  S.MAIL_NARR='（宿舍的信箱裡有一個包裹，寄件人寫著她的名字。）';
  S.mailMake=function(G){ if(!S.on()||!G) return 0; const R=F(G); let n=0;
    for(const pid of S.PEOPLE){ if(!dating(G,pid)) continue; const h=S.holOf(pid,G.day); if(!h||!S.HER_K.includes(h.k)) continue; const key=hkey(pid,h.k,h.y); if(R.got[key]) continue;
      const p=pres(G,pid); if(p&&p.here!==false) continue; const c=S.herCell(G,pid,h.k,h.y); if(!c) continue;
      const d=Object.assign({k:h.k,y:h.y},c); recvAdd(G,pid,d,'mail'); R.mail[key]={day:G.day,played:false,band:c.band}; n++; }
    return n; };
  S.mailLines=function(cell){ const out=[S.MAIL_NARR]; for(const t of cell.lines) if(!/^（/.test(t)) out.push('（卡片上寫著：「'+t+'」）'); return out; };   /* 卡片上的字＝她說的那幾句；當面的動作（（…））不寫進卡片 */
  S.mailDue=G=>{ const R=F(G); return Object.keys(R.mail).filter(k=>R.mail[k]&&!R.mail[k].played); };
  S.DORM=/^dorm/;
  S.mailPlay=async function(GM){ const G=GM.G, R=F(G), L=S.mailDue(G); if(!L.length) return 0; GM.sceneBegin&&GM.sceneBegin();
    try{ for(const key of L){ const m=R.mail[key]; m.played=true; const [pid,k,y]=key.split('|'); const P=X().give[pid], cell=P&&P[k]&&(P[k][m.band]||P[k].D); if(!cell) continue; for(const t of S.mailLines(cell)) await GM.say(null,S.text(G,t)); } }
    finally { GM.sceneEnd&&GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return L.length; };

  /* ---------------- 山嵐文具區：學姊（AA_734 stationery）---------------- */
  S.SL_ZONE='xs_shanlan'; S.SL_AT={x:4.5,z:6.5,lv:0};   /* 配置 interact「看文具」(4.5, 6.5) */
  /* 她站的地方（BB P3 BUG-SHANLAN-SIS-STEAL-1110）：原本 (4.15, 6.5) 離「看文具」0.35 m——演完那一場玩家走到「看文具」，按鈕被「和溫書瑀說話」搶走（nearestInteractable 照距離）。
     改站兩張文具桌中間的走道 (5.8, 6.5)（桌子 z 6.95～7.85／5.15～6.05、東牆文具架 x 6.6 起；人物半徑 0.33 站得住，從店門走得到——tests/shanlan_unit.js），
     面向東牆的文具架；離「看文具」1.3 m（≥1.2）：站在「看文具」旁邊（0.6 m 內）一定是「看文具」，往她那邊走才是和她說話。S.slSpace 的 0.6 m 照留 */
  S.SL_SCHED={days:[6],from:15,to:16,zone:'xs_shanlan',act:'linger',at:[5.8,6.5,Math.PI/2,0],label:'山嵐書店（文具區）',note:'AA_734 stationery：學期中的週六 15:00～16:00、隔週一次'};
  /* 她在文具區的日子：學期中（CALENDAR.termOf）、週六、上課週次單數（隔週）、2026-02 起、她在美國（2028-08～12）不在；認識了、人在臺北 */
  S.slDay=function(G,day){ const d=day==null?G.day:day, D0=DK('2026-02-01'), U0=DK('2028-08-01'), U1=DK('2028-12-31'); if(D0==null||d<D0) return false; if(U0!=null&&U1!=null&&d>=U0&&d<=U1) return false;
    const w=(ymd(d)||{}).wd; if(w!==6) return false; const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(d):null; return !!t&&(t.week|0)%2===1; };
  S.slOn=function(G){ if(!S.on()||!G||!S.slDay(G)) return false; const h=+G.hour||0; if(h<15||h>=16) return false;
    if(typeof SOCIAL==='undefined'||!SOCIAL.has||!SOCIAL.has('heroine_05','FIRST_MET')) return false; const p=pres(G,'heroine_05'); return !p||p.here!==false; };
  S.sched=(c,G)=>c&&c.id==='heroine_05'&&S.slOn(G)?S.SL_SCHED:null;
  /* 這一次是哪一場：交往中第一次＝sl_sis_3；第 3 階以上第一次＝sl_sis_2；第 1～2 階第一次＝sl_sis_1；演過以後＝輪流（第 3 則只在第 3 階以上）*/
  S.slPick=function(G){ const R=F(G).sl, st=stageNum('heroine_05'), dt=dating(G,'heroine_05'); if(R.day===G.day) return null;
    if(dt&&R.s3==null) return 'sl_sis_3'; if((st>=3||dt)&&R.s2==null) return 'sl_sis_2'; if(R.s1==null&&R.s2==null) return 'sl_sis_1'; return 'sl_sis_rot'; };
  const scene=id=>X().stationery.scenes.find(s=>s.id===id);
  S.NB_PRICE=250;
  /* 開演那一刻：玩家離學姊不到 0.6 m 就沿「她→玩家」方向退到 0.8 m（站得住才退，站不住就試 0.7、0.6），兩個人面對面；只做這一次，不是每一格搬人（合作規則第 5 條） */
  S.slSpace=function(GM,who){ try{ const E=GM.E, P=E&&E.player, n=who&&(who.obj?who:(who.ent||null)); const no=n&&n.obj&&n.obj.position, po=P&&P.obj&&P.obj.position; if(!no||!po) return false;
      let dx=po.x-no.x, dz=po.z-no.z, d=Math.hypot(dx,dz); if(d>=0.6) { P.obj.rotation.y=Math.atan2(-dx,-dz); return false; } if(d<1e-3){ dx=1; dz=0; d=1; }
      for(const r of [0.8,0.7,0.6]){ const x=no.x+dx/d*r, z=no.z+dz/d*r; if(!E.canStand||E.canStand(x,z,0.3,P.lv|0)){ po.x=x; po.z=z; P.obj.rotation.y=Math.atan2(no.x-x,no.z-z); if(n.obj.rotation) n.obj.rotation.y=Math.atan2(x-no.x,z-no.z); return true; } }
    }catch(e){} return false; };
  S.slPlay=async function(GM,who){ const G=GM.G, R=F(G), id=S.slPick(G); if(!id) return null; R.sl.day=G.day; const sc=scene(id), st=stageNum('heroine_05'), dt=dating(G,'heroine_05');
    S.slSpace(GM,who);   /* BB 11-10 BUG-SHANLAN-SIS-OVERLAP-1110：開演前玩家離她至少 0.6 m（原本停在 0.23 m，背包穿進她身體） */
    if(id==='sl_sis_rot'){ const L=sc.lines, ok=L.map((_,i)=>i).filter(i=>i<2||st>=3||dt); const n=R.sl.rot|0, i=ok[n%ok.length]; R.sl.rot=n+1; await play(GM,who,L[i]); }
    else { await play(GM,who,sc.lines);
      if(sc.choice){ const k=await GM.choose(sc.choice.map(c=>({t:c.t}))); const c=sc.choice[k]||sc.choice[0]; await GM.say({name:G.name||'祐廷'},c.t); await play(GM,who,c.r); }
      if(id==='sl_sis_3'){ if((G.money|0)>=S.NB_PRICE){ if(GM.money) GM.money(-S.NB_PRICE,'禮物'); else G.money-=S.NB_PRICE; } else await play(GM,who,['這次我來。']);   /* AA_734 after：錢不夠＝她付 */
        R.recv.push({pid:'heroine_05',k:'sl',y:(ymd(G.day)||{}).y,item:'她選的筆記本',line:'',day:G.day,room:true}); }   /* AA_734 after：你的那本進房間的櫃子（不進包包）*/
      R.sl[{sl_sis_1:'s1',sl_sis_2:'s2',sl_sis_3:'s3'}[id]]=G.day; }
    await S.hintCase(GM);
    if(GM.autosave) GM.autosave(); return id; };
  /* 提示：她生日（6/2）、聖誕的前 14 天 */
  S.hintWin=function(G){ const d=ymd(G.day); if(!d) return null; for(const [k,md] of [['bday',(FD().BDAY||{}).heroine_05||'06-02'],['xmas','12-24']]){ const h=DK(d.y+'-'+md); if(h!=null&&G.day>=h-14&&G.day<h) return {k,y:d.y}; } return null; };
  S.hintPen=async function(GM){ const G=GM.G, w=S.hintWin(G); if(!w||S.givenTo(G,'heroine_05','g_fountain')) return false; const R=F(G).hint, k='pen|'+w.y; if(R[k]!=null) return false;
    if(typeof SOCIAL==='undefined'||!SOCIAL.has||!SOCIAL.has('heroine_05','FIRST_MET')) return false; const t=S.HINT_TEXT(0); if(!t) return false; R[k]=G.day; await GM.say(null,t); return true; };
  S.hintCase=async function(GM){ const G=GM.G, w=S.hintWin(G); if(!w||S.givenTo(G,'heroine_05','g_leather_case')) return false; const R=F(G).hint, k='case|'+w.y; if(R[k]!=null) return false; const t=S.HINT_TEXT(1); if(!t) return false; R[k]=G.day; await GM.say(null,t); return true; };
  S.HINT_TEXT=i=>{ const t=X().stationery.hint[i]; const m=/旁白「(（[^」]*）)」/.exec(t); return m?m[1]:null; };
  /* 她在文具區、你走到旁邊 */
  S.slNear=function(GM){ const G=GM.G, E=GM.E, P=E&&E.player; if(!G||G.zone!==S.SL_ZONE||!P||!S.slOn(G)) return false; const n=GM.npc&&(GM.npc.heroine_05||GM.npc.sis); if(!n) return false;
    const o=P.obj.position; return (P.lv|0)===S.SL_AT.lv&&Math.hypot(o.x-S.SL_AT.x,o.z-S.SL_AT.z)<2.5&&!!S.slPick(G); };
  let busy=false; (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['gifthol:busy']=()=>{ busy=false; };
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!S.on()) return false; if(GM.D&&GM.D.active) return false; if(GM.E&&GM.E.player&&GM.E.player.busy) return false;
    S.mailMake(G); S.sisBdaySync(G);   /* ④ 她生日原本的事件演完：記成那一年的生日禮物 */
    let f=null; if(S.DORM.test(String(G.zone||''))&&S.mailDue(G).length) f=()=>S.mailPlay(GM);
    else if(S.slNear(GM)) f=async()=>{ GM.sceneBegin&&GM.sceneBegin({adv:'heroine_05'}); try{ await S.slPlay(GM,S.who('heroine_05',GM.npc.heroine_05||GM.npc.sis)); } finally { GM.sceneEnd&&GM.sceneEnd(); } };
    if(!f) return false; busy=true; Promise.resolve(f()).catch(e=>console.warn('GIFTH.tick',e)).finally(()=>{ busy=false; }); return true; };

  /* 山嵐書店兩個互動點：「看文具」＝（她在、那一場還沒演）那一場；不然 AA_695 那一句（＋鋼筆的提示）→ 買禮物（文具區）；「結帳」＝買禮物（書架）／就這樣（AA_695 那一句）*/
  S.shanlan=async function(GM,it){ const G=GM.G, isStat=it.label==='看文具', key=isStat?'xs_shanlan_stationery':'xs_shanlan', o=S.shopOpt(G,key);
    GM.sceneBegin(); try{
      if(isStat){ const n=GM.npc&&(GM.npc.heroine_05||GM.npc.sis); if(n&&S.slOn(G)&&S.slPick(G)) await S.slPlay(GM,S.who('heroine_05',n)); else { await GM.say(null,it.shlLook); if(!n) await S.hintPen(GM); }
        if(o){ const k=await GM.choose([o,{t:'就這樣'}]); if(k===0) await S.pick(GM,o); } }
      else { if(!o){ await GM.say(null,it.shlLook); return true; } const k=await GM.choose([o,{t:'就這樣'}]); if(k===0) await S.pick(GM,o); else await GM.say(null,it.shlLook); }
    } finally { GM.sceneEnd(); } return true; };

  /* ---------------- 包包、人物頁、房間 ---------------- */
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  S.recvList=G=>F(G).recv.filter(r=>r&&r.item);
  /* 選單「物品」分頁（X291）：包包裡的禮物（品名、哪裡買、說明）＋她送的；今天帶在身上的飲料、早餐（gift3d.js）也列 */
  S.bagHTML=function(G){ let h='<div class="item"><b>包包裡的禮物（'+S.bag(G).length+'/'+S.MAX+'）</b><div class="muted">節日、她的生日當面見到她，說話的時候可以送。不會過期。</div></div>';
    const B=S.bag(G); if(!B.length) h+='<div class="item muted">還沒有買。各家店的「'+S.LABEL+'」可以買。</div>';
    for(const b of B){ const it=S.item(b.id); h+='<div class="item"><b>'+esc(it.name)+'</b><div class="muted">'+esc(S.shopName(b.shop))+(it.price!=null?'・'+it.price+' 元':'')+'</div><div>'+esc(it.line)+'</div></div>'; }
    for(const gid of S.specials(G)){ const it=S.item(gid); if(!(it.only||[]).some(p=>!S.givenTo(G,p,gid))) continue; h+='<div class="item"><b>'+esc(it.name)+'</b><div class="muted">'+esc(it.how||'')+'</div></div>'; }
    if(Array.isArray(G.carry)&&typeof GIFT!=='undefined'&&GIFT.carry){ const C=GIFT.carry(G); if(C.length) h+='<div class="item"><b>今天帶在身上的</b>'+C.map(c=>'<div>· '+esc(c.n)+'</div>').join('')+'<div class="muted">飲料、早餐放不到明天。</div></div>'; }
    const RV=S.recvList(G); h+='<div class="item"><b>她送的</b></div>'; if(!RV.length) h+='<div class="item muted">還沒有。</div>';
    for(const r of RV.slice().reverse()) h+='<div class="item"><b>'+esc(r.item)+'</b><div class="muted">'+esc(nm(r.pid))+(S.KNAME[r.k]?'・'+r.y+' 的'+S.KNAME[r.k]:'')+(r.mail?'・寄到宿舍':'')+'</div><div>'+esc(S.text(G,r.line||''))+'</div></div>';
    return h; };
  S.renderBag=function(el,G){ if(el&&G) el.innerHTML=S.bagHTML(G); };
  /* 人物頁（手機「朋友」的資料）：她喜歡的（送過、love 的那幾樣）、她送的 */
  S.personHTML=function(G,id){ if(!S.on()||!G||!S.PEOPLE.includes(id)) return ''; const R=F(G), love=(R.given[id]||[]).filter(g=>S.cat(id,g)==='love').map(g=>S.item(g).name), rv=S.recvList(G).filter(r=>r.pid===id);
    let h=''; if(love.length) h+='<div style="margin-top:4px"><span class="muted">她喜歡</span><div class="muted">· '+love.map(esc).join('、')+'</div></div>';
    if(rv.length) h+='<div style="margin-top:4px"><span class="muted">她送的</span>'+rv.map(r=>'<div class="muted">· '+esc(r.item)+(S.KNAME[r.k]?'（'+r.y+' 的'+S.KNAME[r.k]+'）':'')+'</div>').join('')+'</div>';
    return h; };
  /* 宿舍房間的櫃子（AA_734 how 第 5 點：點了看名字和那一句 lines 的第一句）*/
  S.roomExtra=function(G,L){ if(!S.on()||!G) return; for(const r of S.recvList(G)) L.push([r.item+'（'+nm(r.pid)+'送的）',[r.item+'。',S.text(G,r.line||'')].filter(Boolean)]); };

  /* ---------------- 記憶名稱（人物頁、朋友清單）---------------- */
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL){ const ML=SOCIAL.MEMORY_LABEL;
    for(const p of S.PEOPLE){ ML['GIFT_LOVE_'+p]=ML['GIFT_LOVE_'+p]||'她喜歡你送的禮物'; ML['GIFT_GIVEN_'+p]=ML['GIFT_GIVEN_'+p]||'送了她禮物';
      for(const k of S.HER_K) for(let y=2025;y<=2030;y++) ML['GIFT_FROM_'+p+'_'+k+'_'+y]=ML['GIFT_FROM_'+p+'_'+k+'_'+y]||(y+' 的'+S.KNAME[k]+'，她送你的禮物'); } }

  /* ---------------- 掛上去 ---------------- */
  if(typeof STORY!=='undefined'&&!STORY._gifth){ STORY._gifth=true;
    if(Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>S.talkOpts(G,id));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM));
    if(Array.isArray(STORY.SCHED_X)) STORY.SCHED_X.push(S.sched);
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,L)=>S.roomExtra(G,L));
    if(typeof STORY.offerInvite==='function'){ const oi=STORY.offerInvite; STORY.offerInvite=async function(GM,id,n,who){ const r=await oi.apply(this,arguments); try{ if(S.PEOPLE.includes(id)) await S.afterTalk(GM,who||S.who(id,n),id); }catch(e){ console.warn('GIFTH.afterTalk',e); } return r; }; }
    if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G; if(it&&it.shlLook&&G&&G.zone===S.SL_ZONE&&(it.label==='看文具'||it.label==='結帳')&&S.on()) return S.shanlan(GM,it); if(it&&it.kind==='gg_flower'&&G&&S.flowerOpen(G)){ const o=S.shopOpt(G,'gg_flower'); if(o){ await S.pick(GM,o); return true; } } return oi.apply(this,arguments); }; } }
  if(typeof EVENTS!=='undefined'&&EVENTS.run&&!EVENTS._gifth){ EVENTS._gifth=true; const r0=EVENTS.run; EVENTS.run=async function(ev){ const r=await r0.apply(this,arguments); try{ if(ev&&ev.id==='ev_cafe_barista_zhiruo'&&S.on()&&typeof GAME!=='undefined'&&GAME.G) await S.barEventGift(GAME); }catch(e){} return r; }; }   /* ③b：芷若「兩點半的店員」演完接送禮 */
  if(typeof FEST!=='undefined'&&FEST.gift&&!FEST._gifth){ FEST._gifth=true; const g0=FEST.gift; FEST.gift=async function(GM,id,k,y){ if(!S.on()) return g0.apply(this,arguments); return S.festGift(GM,id,k,y); }; }
  return S;
})();
