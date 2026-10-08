/* ===== 08 職涯：律師／法官／檢察官／公司法務，進階階段，結局 ===== */
const ROLE_NAME={lawyer:'律師',judge:'法官',pros:'檢察官',legal:'公司法務'};
const CAREER_LIFE={
  chome:{ id:'chome', name:'回家', cat:'生活', scene:'home', pose:'sit', desc:'家常菜與親戚', energy:8, stress:-6 },
  cfriend:{ id:'cfriend', name:'和朋友吃飯', cat:'人際', scene:'restaurant', pose:'stand', desc:'老同學的人生', energy:-2, stress:-6, money:-800 },
  cpartner:{ id:'cpartner', name:'陪伴伴侶', cat:'人際', scene:'apt', pose:'sit', desc:'兩個人的晚上', energy:2, stress:-8, money:-500, need:'partner' },
  csport:{ id:'csport', name:'運動', cat:'生活', scene:'park', pose:'walk', desc:'下班後跑一圈', energy:5, stress:-7 },
  crest:{ id:'crest', name:'什麼都不做', cat:'生活', scene:'apt', pose:'sleep', desc:'回家，把包放下，坐在沙發上', energy:16, stress:-9 },
  chobby:{ id:'chobby', name:'興趣與閱讀', cat:'生活', scene:'apt', pose:'read', desc:'跟法律無關的書', energy:3, stress:-6 },
  ctravel:{ id:'ctravel', name:'休假旅行', cat:'生活', scene:'abroadTravel', pose:'walk', desc:'兩天一夜就好', energy:6, stress:-16, money:-9000 },
  ccat:{ id:'ccat', name:'照顧貓', cat:'生活', scene:'apt', pose:'sit', desc:'鏟砂、梳毛、被踩', energy:2, stress:-7, need:'cat' },
  cstudy:{ id:'cstudy', name:'進修', cat:'學習', scene:'library', pose:'read', desc:'外語、專業領域或再考照', energy:-6, stress:2 },
};
const ROLE_ACTS={
  lawyer:{
    research:{ name:'研究案件', matter:true, desc:'查判決、整理事實', energy:-7, stress:2, scene:'firm', pose:'type' },
    draft:{ name:'寫狀／草擬', matter:true, desc:'書狀或合約', energy:-9, stress:4, scene:'firm', pose:'type' },
    prep:{ name:'開庭準備', matter:true, desc:'爭點整理、證據、問題清單', energy:-8, stress:4, scene:'firm', pose:'read' },
    client:{ name:'當事人溝通', matter:true, desc:'期待管理、說明風險', energy:-5, stress:3, scene:'firm', pose:'stand' },
    consult:{ name:'新案諮詢', matter:false, desc:'評估要不要接', energy:-4, stress:1, scene:'firm', pose:'stand' },
    mentor:{ name:'向指導律師請益', matter:false, desc:'被改狀，但學到東西', energy:-3, stress:2, scene:'firm', pose:'stand' },
  },
  partner:{
    assign:{ name:'分配案件', matter:false, desc:'誰做什麼，誰能學到什麼', energy:-4, stress:2, scene:'firm', pose:'stand' },
    coach:{ name:'培養新人', matter:false, desc:'改狀、帶開庭', energy:-6, stress:2, scene:'firm', pose:'stand' },
    clients:{ name:'客戶關係', matter:false, desc:'吃飯、回訊息、聽抱怨', energy:-5, stress:3, scene:'restaurant', pose:'stand' },
    meeting:{ name:'合夥會議', matter:false, desc:'分潤、方向、人事', energy:-5, stress:5, scene:'firm', pose:'sit' },
    finance:{ name:'看報表', matter:false, desc:'成本、應收、現金', energy:-4, stress:3, scene:'firm', pose:'type' },
    owncase:{ name:'自己辦案', matter:true, desc:'手不能生', energy:-8, stress:3, scene:'court', pose:'stand' },
  },
  own:{
    source:{ name:'拓展案源', matter:false, desc:'朋友介紹、演講、社群', energy:-6, stress:3, scene:'restaurant', pose:'stand' },
    quote:{ name:'接案評估與報價', matter:false, desc:'評估時間、報酬、案情', energy:-4, stress:2, scene:'myfirm', pose:'sit' },
    collect:{ name:'收款', matter:false, desc:'最難開口的工作', energy:-3, stress:5, scene:'myfirm', pose:'type' },
    work:{ name:'辦案', matter:true, desc:'研究、書狀、開庭', energy:-9, stress:4, scene:'myfirm', pose:'type' },
    admin:{ name:'所務與人事', matter:false, desc:'租約、設備、助理', energy:-4, stress:3, scene:'myfirm', pose:'stand' },
    brand:{ name:'定位與經營', matter:false, desc:'精品所、在地所或其他', energy:-4, stress:1, scene:'myfirm', pose:'sit' },
  },
  judge:{
    read:{ name:'閱卷', matter:true, desc:'把卷讀完，事實才會出現', energy:-8, stress:3, scene:'chambers', pose:'read' },
    issues:{ name:'整理爭點', matter:true, desc:'雙方到底在爭什麼', energy:-6, stress:2, scene:'chambers', pose:'type' },
    hearing:{ name:'準備程序／開庭', matter:true, desc:'庭期到了就要開', energy:-9, stress:5, scene:'court', pose:'stand' },
    evaluate:{ name:'證據評價與研究', matter:true, desc:'矛盾的證據要怎麼看', energy:-7, stress:3, scene:'chambers', pose:'read' },
    write:{ name:'撰寫與修改裁判', matter:true, desc:'說理，然後再改', energy:-9, stress:4, scene:'chambers', pose:'type' },
    clerk:{ name:'與書記官排庭期', matter:false, desc:'小方什麼都知道', energy:-3, stress:1, scene:'chambers', pose:'stand' },
  },
  pros:{
    intake:{ name:'收案與初步判斷', matter:true, desc:'這件要往哪個方向', energy:-6, stress:2, scene:'prosec', pose:'read' },
    plan:{ name:'規劃偵查', matter:true, desc:'要查什麼、找誰、怎麼查', energy:-6, stress:2, scene:'prosec', pose:'type' },
    question:{ name:'訊問與調查', matter:true, desc:'問對問題', energy:-8, stress:4, scene:'prosec', pose:'stand' },
    evaluate:{ name:'評估證據', matter:true, desc:'夠不夠，哪裡不夠', energy:-7, stress:3, scene:'prosec', pose:'read' },
    dispose:{ name:'作成處分／出庭', matter:true, desc:'起訴、不起訴、緩起訴，或實行公訴', energy:-8, stress:4, scene:'court', pose:'stand' },
    police:{ name:'與司法警察協作', matter:false, desc:'阿豪又有新線索', energy:-4, stress:2, scene:'prosec', pose:'stand' },
  },
  legal:{
    review:{ name:'審合約', matter:true, desc:'附件共八十七頁', energy:-7, stress:3, scene:'meeting', pose:'type' },
    risk:{ name:'設計風險方案', matter:true, desc:'不是同意或不同意，是第三條路', energy:-6, stress:2, scene:'meeting', pose:'type' },
    internal:{ name:'跨部門溝通', matter:true, desc:'業務、財務、人資、主管', energy:-5, stress:4, scene:'meeting', pose:'stand' },
    negotiate:{ name:'對外談判', matter:true, desc:'條款、底線、關係', energy:-8, stress:5, scene:'meeting', pose:'stand' },
    project:{ name:'專案管理', matter:false, desc:'時程、外部律師、進度', energy:-6, stress:3, scene:'meeting', pose:'type' },
    team:{ name:'帶團隊', matter:false, desc:'分配、審核、教', energy:-5, stress:3, scene:'meeting', pose:'stand', need:'head' },
  },
};
const MATTER_TPL={
  lawyer:[
    { t:'lit', title:'借款返還', client:'一位退休老師', type:'民事訴訟', stages:['接案評估','研究','書狀','開庭準備','開庭','結案'], dl:9, cx:2, fee:60000, expect:70, subj:'civ' },
    { t:'lit', title:'車禍損害賠償', client:'一位外送員', type:'民事訴訟', stages:['接案評估','研究','書狀','開庭準備','開庭','結案'], dl:8, cx:1, fee:45000, expect:80, subj:'civ' },
    { t:'crim', title:'傷害案辯護', client:'一位夜市攤商', type:'刑事辯護', stages:['接案評估','閱卷研究','答辯狀','開庭準備','開庭','結案'], dl:7, cx:2, fee:70000, expect:60, subj:'crim' },
    { t:'biz', title:'經銷合約', client:'一間食品公司', type:'商務', stages:['評估','研究','合約草擬','談判','定稿'], dl:6, cx:2, fee:90000, expect:50, subj:'com' },
    { t:'fam', title:'離婚與監護', client:'一位國小老師', type:'家事', stages:['評估','當事人溝通','書狀','調解','結案'], dl:10, cx:3, fee:80000, expect:65, subj:'civ' },
    { t:'lit', title:'租屋押金糾紛', client:'一位大學生', type:'民事訴訟', stages:['接案評估','研究','書狀','開庭準備','開庭','結案'], dl:6, cx:1, fee:25000, expect:85, subj:'civ' },
    { t:'biz', title:'合夥拆夥', client:'兩位開咖啡店的朋友', type:'商務', stages:['評估','研究','協議草擬','談判','定稿'], dl:7, cx:3, fee:110000, expect:55, subj:'com' },
  ],
  judge:[
    { t:'civ', title:'河堤工程承攬爭議', party:'承攬人 vs 定作人', type:'民事', stages:['閱卷','整理爭點','準備程序','開庭','證據評價','撰寫裁判','修改','結案'], dl:14, cx:3, subj:'civ', hearingAt:3 },
    { t:'crim', title:'超商竊盜', party:'被告一人', type:'刑事', stages:['閱卷','整理爭點','準備程序','審理','證據評價','撰寫裁判','修改','結案'], dl:9, cx:1, subj:'crim', hearingAt:3 },
    { t:'crim', title:'酒駕致傷', party:'被告一人，告訴人一人', type:'刑事', stages:['閱卷','整理爭點','準備程序','審理','證據評價','撰寫裁判','修改','結案'], dl:10, cx:2, subj:'crim', hearingAt:3 },
    { t:'civ', title:'借名登記房屋', party:'原告 vs 被告與第三人', type:'民事', stages:['閱卷','整理爭點','準備程序','開庭','證據評價','撰寫裁判','修改','結案'], dl:13, cx:3, subj:'civ', hearingAt:3 },
    { t:'fam', title:'未成年子女會面交往', party:'父 vs 母', type:'家事', stages:['閱卷','整理爭點','調解','開庭','證據評價','撰寫裁判','修改','結案'], dl:11, cx:2, subj:'civ', hearingAt:2 },
    { t:'civ', title:'網購商品瑕疵', party:'消費者 vs 平台', type:'民事小額', stages:['閱卷','整理爭點','準備程序','開庭','證據評價','撰寫裁判','修改','結案'], dl:8, cx:1, subj:'civ', hearingAt:3 },
  ],
  pros:[
    { t:'fraud', title:'投資詐欺', party:'被害人六人', type:'詐欺', stages:['收案','初步判斷','規劃偵查','訊問與調查','評估證據','補充偵查','處分'], dl:12, cx:3, subj:'crim' },
    { t:'assault', title:'夜市鬥毆', party:'雙方互告', type:'傷害', stages:['收案','初步判斷','規劃偵查','訊問與調查','評估證據','補充偵查','處分'], dl:8, cx:1, subj:'crim' },
    { t:'arson', title:'夜市縱火', party:'嫌疑人一人', type:'公共危險', stages:['收案','初步判斷','規劃偵查','訊問與調查','評估證據','補充偵查','處分'], dl:11, cx:3, subj:'crim' },
    { t:'theft', title:'工地竊盜', party:'嫌疑人兩人', type:'竊盜', stages:['收案','初步判斷','規劃偵查','訊問與調查','評估證據','補充偵查','處分'], dl:7, cx:1, subj:'crim' },
    { t:'drug', title:'販賣毒品', party:'嫌疑人一人，通訊監察', type:'毒品', stages:['收案','初步判斷','規劃偵查','訊問與調查','評估證據','補充偵查','處分'], dl:10, cx:3, subj:'crimpro' },
    { t:'dv', title:'家庭暴力', party:'告訴人一人', type:'傷害', stages:['收案','初步判斷','規劃偵查','訊問與調查','評估證據','補充偵查','處分'], dl:8, cx:2, subj:'crim' },
  ],
  legal:[
    { t:'contract', title:'經銷合約（今晚要簽）', party:'業務部 Kevin', type:'合約審查', stages:['初審','風險盤點','內部溝通','談判','定稿'], dl:2, cx:2, risk:70 },
    { t:'contract', title:'雲端服務採購', party:'資訊部', type:'合約審查', stages:['初審','風險盤點','內部溝通','談判','定稿'], dl:5, cx:2, risk:50 },
    { t:'labor', title:'資遣爭議', party:'人資部', type:'勞資', stages:['釐清事實','法律評估','內部溝通','協商','收尾'], dl:4, cx:2, risk:65 },
    { t:'crisis', title:'客戶資料外洩', party:'總經理', type:'企業危機', stages:['釐清事實','對策','對外說明','主管機關','收尾'], dl:3, cx:3, risk:85 },
    { t:'project', title:'海外授權專案', party:'產品部與外部律師', type:'專案', stages:['範圍','外部律師','條款','談判','簽約'], dl:10, cx:3, risk:55 },
    { t:'contract', title:'八十七頁的附件', party:'業務部 Kevin', type:'合約審查', stages:['初審','風險盤點','內部溝通','談判','定稿'], dl:3, cx:2, risk:45 },
    { t:'gov', title:'董事會決議程序', party:'董事長室', type:'公司治理', stages:['盤點','法律評估','內部溝通','會議','紀錄'], dl:4, cx:2, risk:40 },
  ],
};
let _mid=1;
function newMatter(role){
  const pool=MATTER_TPL[role==='partner'||role==='own'?'lawyer':role]; const tpl=pick(pool);
  return { id:'m'+(G.career.mcount=(G.career.mcount||0)+1), tpl:tpl.t, title:tpl.title, who:tpl.client||tpl.party, type:tpl.type, stages:tpl.stages, stage:0, prog:0, dl:tpl.dl, dl0:tpl.dl, cx:tpl.cx, fee:tpl.fee||0, expect:tpl.expect||50, risk:tpl.risk||0, info:40, trust:50, quality:50, subj:tpl.subj||'civ', hearingAt:tpl.hearingAt, hearingIn: tpl.hearingAt?tpl.hearingAt+2:null, minis:{}, late:0, done:false };
}
function careerTimeLabel(){ const c=G.career; return c.title+'・第'+c.year+'年・第'+(c.quarter+1)+'季・第'+(c.week+1)+'週'; }
function careerTitle(){ const c=G.career; return c.title; }
const FIRMS={ sis:{name:'溫學姊的事務所',rel:'sis'}, big:{name:'大型事務所（正泰法律事務所）'}, small:{name:'小型事務所（明和法律事務所）'}, aid:{name:'法律扶助基金會'} };
const COMPANIES={ startup:{name:'阿凱的新創（Loop 科技）',type:'新創',desc:'人少、變動快、資源有限；合約都先用範本',salary:52000}, local:{name:'本土企業（永順食品）',type:'本土企業',desc:'長期合作關係與組織溝通',salary:50000}, mnc:{name:'跨國企業（Nordlicht 台灣分公司）',type:'跨國企業',desc:'外語合約與跨地區協作',salary:68000,needEn:55} };
function careerBegin(role, opts){
  opts=opts||{}; G.phase='career'; G.ctx='career'; G.postYears=(G.postYears||0);
  const c={ role, stage:'', title:'', week:0, quarter:0, year:1, docket:[], done:[], mcount:0, salary:0, metrics:{}, log:[], stageQuarters:0, offers:[], mgmt:0 };
  if(role==='lawyer'){ c.firm=opts.firm||G.firmPick||'small'; c.stage='associate'; c.title='新進律師'; c.salary= c.firm==='big'?70000:c.firm==='aid'?48000:55000; c.metrics={analysis:40,prep:40,comm:40,time:50,ethics:60,trust:50,rep:20,firmRel:40}; }
  if(role==='judge'){ c.stage='candidate'; c.title='候補法官'; c.salary=105000; c.metrics={procedure:45,evidence:40,reasoning:40,time:50,growth:30,rep:20}; }
  if(role==='pros'){ c.stage='candidate'; c.title='候補檢察官'; c.salary=105000; c.metrics={evidence:40,procedure:45,reasoning:40,time:50,coord:40,growth:30,rep:20}; }
  if(role==='legal'){ c.company=opts.company||'local'; c.stage='specialist'; c.title='法務專員'; c.salary=COMPANIES[c.company].salary; c.metrics={business:40,riskCtl:45,trustSales:45,trustFin:50,trustHR:50,trustBoss:50,rep:20,projects:0}; if(c.company==='startup') setFlag('kai_client'); }
  G.career=c; for(let i=0;i<(role==='legal'?2:2);i++) c.docket.push(newMatter(role));
  if(G.npcs.boss) G.npcs.boss.met= role==='lawyer'; if(G.npcs.clerk) G.npcs.clerk.met= role==='judge'; if(G.npcs.cop) G.npcs.cop.met= role==='pros'; if(G.npcs.sales) G.npcs.sales.met= role==='legal'; if(G.npcs.mgr) G.npcs.mgr.met= role==='legal';
  MAIN_NPCS.forEach(npcLifeUpdate);
  diary('開始'+c.title+'的生活'+(c.firm?'，在'+FIRMS[c.firm].name:c.company?'，在'+COMPANIES[c.company].name:'')+'。');
  G.sched=[]; G.screen='plan'; save();
}
function careerActs(){
  const c=G.career; const setKey= c.stage==='partner'?'partner':c.stage==='own'?'own':c.role;
  const work=Object.entries(ROLE_ACTS[setKey]).filter(([k,a])=>!(a.need==='head'&&!['head','cco'].includes(c.stage))).map(([k,a])=>({id:k,cat:'工作',...a}));
  const life=Object.values(CAREER_LIFE).filter(a=>!(a.need==='partner'&&!G.flags.yu_partner)&&!(a.need==='cat'&&!G.flags.has_cat));
  return work.concat(life);
}
function careerAct(id){ const c=G.career; const setKey= c.stage==='partner'?'partner':c.stage==='own'?'own':c.role; return (ROLE_ACTS[setKey]&&ROLE_ACTS[setKey][id])?{id,cat:'工作',...ROLE_ACTS[setKey][id]}:CAREER_LIFE[id]; }
function careerFreeSlots(){ return 6; }
function matterById(id){ return G.career.docket.find(m=>m.id===id); }
function careerPreview(){
  const c=G.career; const lines=[]; let en=0,st=0,mo=0; const per={}; let work=0, rest=0;
  for(const s of G.sched){ const a=careerAct(s.act); if(!a) continue; en+=a.energy; st+=a.stress; mo+=a.money||0; if(a.cat==='工作') work++; if(['crest','csport','ctravel'].includes(s.act)) rest++; if(s.course){ per[s.course]=(per[s.course]||0)+1; } }
  for(const id in per){ const m=matterById(id); if(!m) continue; const need=Math.ceil((100-m.prog)/22); lines.push('<b>'+esc(m.title)+'</b>：進度 <span class="arrow">↑</span>（約 '+per[id]+' 格，還需約 '+need+' 格完成）'+(m.dl<=per[id]?'':m.dl<=2?' <span class="arrow d">期限很近</span>':'')); }
  const urgent=c.docket.filter(m=>!m.done&&m.dl<=2&&!per[m.id]); if(urgent.length) lines.push('<span class="arrow d">這週沒碰但期限很近：'+urgent.map(m=>m.title).join('、')+'</span>');
  const hearings=c.docket.filter(m=>!m.done&&m.hearingIn!=null&&m.hearingIn<=1); if(hearings.length) lines.push('<span class="arrow d">這週有庭：'+hearings.map(m=>m.title).join('、')+'</span>');
  lines.push('精力 '+(en>=0?'+':'')+en+'　壓力 '+(st>=0?'+':'')+st+(mo?'　金錢 '+money(mo):''));
  if(work>=5&&rest===0) lines.push('<span class="arrow d">整週沒有任何自己的時間。</span>');
  if(work<=1&&c.docket.filter(m=>!m.done).length>=2) lines.push('<span class="sub">工作排得很少，案子會累積。</span>');
  return lines;
}
function workEff(){ let e=1; const p=G.player; if(p.energy<30) e*=0.7; else if(p.energy<50) e*=0.88; if(p.stress>80) e*=0.85; e*=Math.max(0.6,1-0.05*(G.career.streak||0)); return e; }
function skillFactor(role){ const p=G.player.skills; if(role==='legal') return 0.7+0.3*((p.judgment+p.express)/200); if(role==='judge') return 0.7+0.3*((p.structure+p.judgment)/200); if(role==='pros') return 0.7+0.3*((p.judgment+p.research)/200); return 0.7+0.3*((p.structure+p.judgment+p.express)/300); }
function careerResolve(){
  const c=G.career; const p=G.player; G.log=[]; const eff=workEff(); const sf=skillFactor(c.role); let work=0, rest=0;
  pushLog({kind:'n',scene:careerScene(),pose:'stand',t:careerTimeLabel()});
  // 值勤（檢察官）
  if(c.role==='pros'&&c.week%2===1){ const ev=pick(['相驗：凌晨三點，一件車禍。','聲請羈押：警方帶來一個嫌疑人，證據還在補。','突發：一件家暴案的保護令聲請。']); pushLog({kind:'loss',scene:'prosec',pose:'stand',t:'值勤：'+ev+' 這週少了一格自己的時間。'}); p.energy-=8; if(G.sched.length>=6) G.sched.pop(); }
  G.dynEvent=null; let minis=[];
  for(const s of G.sched){ const a=careerAct(s.act); if(!a) continue; let t=''; const m=s.course?matterById(s.course):null;
    if(a.cat==='工作'){ work++; const r=doWork(a,m,eff*sf); t=r.t; if(r.mini) minis.push(r.mini); }
    else { t=doLife(a); if(['crest','csport','ctravel'].includes(a.id)) rest++; }
    p.energy=clamp(p.energy+a.energy,0,100); p.stress=clamp(p.stress+a.stress,0,100); if(a.money) p.money+=a.money;
    pushLog({kind:a.cat==='工作'?'gain':'line',scene:a.scene,pose:a.pose,t});
  }
  // 期限與庭期
  for(const m of c.docket){ if(m.done) continue; m.dl--; if(m.hearingIn!=null){ m.hearingIn--; if(m.hearingIn===0){ const prepared=m.stage>=m.hearingAt; if(!prepared){ m.quality-=12; bump('time',-4); pushLog({kind:'loss',scene:'court',pose:'stand',t:'「'+m.title+'」開庭了，但你還沒準備到那裡。庭上有點狼狽。'}); } else { pushLog({kind:'line',scene:'court',pose:'stand',t:'「'+m.title+'」開庭。準備到位，該問的都問到了。'}); m.quality+=4; } m.hearingIn=null; } }
    if(m.dl===0&&m.prog<85){ m.late++; m.quality-=(m.late===1?8:3); bump('time',m.late===1?-4:-1); if(c.metrics.rep!=null&&m.late===1) c.metrics.rep=clamp(c.metrics.rep-2,0,100); pushLog({kind:'loss',scene:careerScene(),pose:'type',t:'「'+m.title+'」的期限到了，還沒完成。'+(c.role==='judge'?'裁判期限逼近，你申請了延長。':c.role==='legal'?'業務在群組裡問「法務還好嗎」。':'指導律師把你叫進辦公室。')}); m.dl=3; } }
  // 完成
  const finished=c.docket.filter(m=>m.prog>=100); for(const m of finished){ finishMatter(m); }
  c.docket=c.docket.filter(m=>!m.done);
  while(c.docket.length<(c.stage==='partner'?1:c.role==='legal'?3:2)){ c.docket.push(newMatter(c.role)); pushLog({kind:'n',scene:careerScene(),pose:'stand',t:'新案進來：「'+c.docket[c.docket.length-1].title+'」（'+c.docket[c.docket.length-1].who+'）。'}); }
  // 被動
  p.energy=clamp(p.energy+12,0,100); p.stress=clamp(p.stress-2,0,100);
  const weeklyIncome=careerIncome()/2; const living=14000+(G.flags.has_cat?800:0); p.money+=weeklyIncome-living;
  if(work>=5&&rest===0) c.streak=(c.streak||0)+1; else c.streak=0;
  for(const id of MAIN_NPCS){ const n=G.npcs[id]; if(n.met&&id!=='mom'&&id!=='cat') n.rel=Math.max(-20,n.rel-0.3); }
  G.time.absWeek++;
  pushLog({kind:'n',scene:'apt',pose:'sit',t:'這段時間收支：+'+money(weeklyIncome)+'／−'+money(living)+'（一回合約半個月）。餘額 '+money(p.money)+' 元。'});
  // 事件：先跑案件小互動，其次職涯事件
  minis=minis.filter(x=>matterById(x.mid)); if(minis.length){ G.dynEvent=minis[0]; G.pendingEvent='__dyn'; } else { G.pendingEvent=pickEvent(CAREER_EVENTS); }
  save();
}
function bump(k,v){ const m=G.career.metrics; if(m[k]!=null) m[k]=clamp(m[k]+v,0,100); }
function careerIncome(){ const c=G.career; if(c.stage==='own'){ return Math.max(0,(c.own.pipeline||0)*1400+(c.own.brand||0)*600-(c.own.rent||0)-(c.own.staff?45000:0)); } if(c.stage==='partner') return c.salary+Math.round((c.metrics.clients||40)*900); return c.salary; }
function doWork(a,m,eff){
  const c=G.career; const p=G.player; let t=''; let mini=null;
  if(a.matter&&!m){ const cand=c.docket.filter(x=>!x.done).sort((x,y)=>x.dl-y.dl)[0]; m=cand; }
  const adv=(base)=>{ if(!m) return; const before=m.stage; m.prog=clamp(m.prog+base*eff*(m.cx===3?0.8:m.cx===1?1.2:1),0,100); m.stage=Math.min(m.stages.length-1,Math.floor(m.prog/(100/m.stages.length))); if(m.stage>before){ const stg=m.stages[m.stage]; const mk=miniFor(c.role,m,stg); if(mk&&!m.minis[stg]){ m.minis[stg]=true; mini=mk; } } };
  const nm=m?'「'+m.title+'」':'';
  switch(a.id){
    // 律師
    case 'research': adv(26); bump('analysis',0.24); p.skills.research+=0.4; t='研究'+nm+'：判決查了一輪，事實時間軸整理出來了。'; break;
    case 'draft': adv(28); bump('prep',0.24); p.skills.structure+=0.5; t='寫狀'+nm+'：'+(p.skills.structure<40?'寫完自己讀一遍，發現三段在講同一件事。':'一稿寫完，改了兩次。'); break;
    case 'prep': adv(28); bump('prep',0.3); if(m) m.quality+=2; t='開庭準備'+nm+'：爭點、證據、問題清單。'; break;
    case 'client': adv(14); if(m){ m.trust=clamp(m.trust+8,0,100); m.expect=clamp(m.expect-6,0,100); m.info=clamp(m.info+15,0,100); } bump('comm',0.3); t='和當事人談'+nm+'：'+(m&&m.expect>70?'他覺得自己一定贏。你花了半小時講「贏」是什麼意思。':'期待對齊了一些，也多拿到幾份資料。'); break;
    case 'consult': { const nmatter=newMatter('lawyer'); c.offers.push(nmatter); t='新案諮詢：「'+nmatter.title+'」（'+nmatter.who+'）。報酬約 '+money(nmatter.fee)+'，預估 '+nmatter.dl+' 週，複雜度 '+'●'.repeat(nmatter.cx)+'。季末可以決定要不要接。'; break; }
    case 'mentor': bump('analysis',0.2); bump('prep',0.2); bump('firmRel',0.4); p.skills.judgment+=0.6; addRel('boss',2); t='高律師把你的狀改了四成。他說：「事實寫清楚，法律自然會出來。」'; break;
    // 合夥
    case 'assign': c.metrics.team=clamp((c.metrics.team||40)+2,0,100); c.mgmt=(c.mgmt||0)+1; t='分配案件：把一件家事案給了新人，她需要學。你留了一件商務案給自己。'; break;
    case 'coach': c.metrics.team=clamp((c.metrics.team||40)+3,0,100); c.mgmt=(c.mgmt||0)+1.5; t='改新人的狀。紅字比黑字多。你想起高律師。'; break;
    case 'clients': c.metrics.clients=clamp((c.metrics.clients||40)+3,0,100); t='和客戶吃飯。他抱怨了三十分鐘，最後又給了一件新案。'; break;
    case 'meeting': c.metrics.harmony=clamp((c.metrics.harmony||55)+2,0,100); c.mgmt=(c.mgmt||0)+0.5; t='合夥會議：分潤、要不要擴編、要不要換辦公室。三個小時，兩個決定。'; break;
    case 'finance': c.metrics.profit=clamp((c.metrics.profit||45)+2,0,100); t='看報表：應收帳款比想像中多。你在幾個名字旁邊畫了圈。'; break;
    case 'owncase': adv(28); bump('rep',0.1); t='自己辦案'+nm+'：手沒生。'; break;
    // 開業
    case 'source': c.own.pipeline=clamp((c.own.pipeline||20)+6,0,100); t='拓展案源：'+pick(['朋友介紹了一件案子，「不好意思收費」的那種。','去社區大學講了一堂課，有兩個人留下名片。','在網路上寫了一篇文章，三個月後有人因為那篇文章找上門。']); break;
    case 'quote': { const nmatter=newMatter('own'); c.offers.push(nmatter); t='評估新案「'+nmatter.title+'」：報酬 '+money(nmatter.fee)+'，'+nmatter.dl+' 週。季末決定。'; break; }
    case 'collect': { const due=c.own.receivable||0; const got=Math.round(due*0.5); c.own.receivable=due-got; p.money+=got; t='收款：收回 '+money(got)+' 元。'+(due>80000?'還有一筆很久了。':''); break; }
    case 'work': adv(28); t='辦案'+nm+'。'; break;
    case 'admin': c.own.ops=clamp((c.own.ops||40)+4,0,100); t='所務：印表機、租約、助理的加班費。'; break;
    case 'brand': c.own.brand=clamp((c.own.brand||20)+4,0,100); t='經營：你決定把'+(c.own.style||'家事與在地案件')+'放在名片上。'; break;
    // 法官
    case 'read': adv(28); bump('evidence',0.2); t='閱卷'+nm+'：卷讀到第三宗，事實才開始有形狀。'; break;
    case 'issues': adv(22); bump('reasoning',0.2); p.skills.structure+=0.4; t='整理爭點'+nm+'：雙方各說各話，你把真正的爭點壓成三個。'; break;
    case 'hearing': adv(22); if(m&&m.hearingIn!=null&&m.hearingIn<=1){ m.hearingIn=null; m.quality+=4; } bump('procedure',0.3); t='開庭'+nm+'：'+pick(['證人講到一半改口，你請書記官記明筆錄。','當事人在庭上情緒失控，你暫停了五分鐘。','律師聲請調查證據，你當庭裁定。']); break;
    case 'evaluate': adv(28); bump('evidence',0.3); t='證據評價'+nm+'：兩份鑑定報告結論相反。'; break;
    case 'write': adv(28); bump('reasoning',0.3); p.skills.structure+=0.5; t='撰寫裁判'+nm+'：'+(p.skills.structure<45?'寫了六頁，刪掉兩頁。':'說理的部分改了三次，每次都更短。'); break;
    case 'clerk': bump('time',0.4); addRel('clerk',3); for(const x of c.docket){ if(x.hearingIn!=null&&x.hearingIn<=1) x.hearingIn+=1; } t='和小方排庭期。她把下個月的庭排得剛好可以喘一口氣。'; break;
    // 檢察官
    case 'intake': adv(28); bump('evidence',0.2); t='收案初判'+nm+'：先看報案紀錄、筆錄、有沒有監視器。'; break;
    case 'plan': adv(22); bump('procedure',0.2); t='規劃偵查'+nm+'：要查金流、要傳誰、哪些要聲請。'; break;
    case 'question': adv(28); bump('evidence',0.3); p.skills.express+=0.5; t='訊問'+nm+'：'+pick(['嫌疑人的說法跟第一次筆錄不一樣。','證人很緊張，你先聊了五分鐘天氣。','律師在旁邊，你問得更謹慎。']); break;
    case 'evaluate': adv(28); bump('evidence',0.3); bump('reasoning',0.2); t='評估證據'+nm+'：夠嗎？哪裡不夠？'; break;
    case 'dispose': adv(28); bump('reasoning',0.3); t='處分／出庭'+nm+'：'+(m&&m.stage>=m.stages.length-1?'處分書寫完，主任看過。':'出庭實行公訴，交互詰問三個小時。'); break;
    case 'police': bump('coord',0.6); addRel('cop',3); for(const x of c.docket){ if(!x.done) x.info=clamp((x.info||40)+6,0,100); } t='和阿豪對案子。他帶來新的監視器畫面，也帶來新的問題。'; break;
    // 法務
    case 'review': adv(28); bump('riskCtl',0.24); t='審合約'+nm+'：'+(m&&m.risk>=65?'第 12 條有一個上限沒寫的賠償條款。':'幾個用語要改，其他還好。'); break;
    case 'risk': adv(22); bump('riskCtl',0.3); bump('business',0.2); p.skills.judgment+=0.5; t='設計風險方案'+nm+'：刪除、替代條款、上限、內部核准，你列了四條路。'; break;
    case 'internal': adv(20); bump('trustSales',0.3); bump('trustFin',0.2); bump('trustHR',0.2); p.skills.express+=0.4; t='跨部門溝通'+nm+'：'+pick(['業務說客戶今晚一定要簽。','財務問這條會不會影響認列。','人資說以前都這樣做。']); break;
    case 'negotiate': adv(26); bump('business',0.3); p.skills.express+=0.6; t='對外談判'+nm+'：對方律師先開高，你先談最重要的那條。'; break;
    case 'project': c.metrics.projects=(c.metrics.projects||0)+0.25; bump('business',0.2); bump('trustBoss',0.3); t='專案管理：時程表、外部律師的報價、下週的里程碑。'; break;
    case 'team': c.metrics.team=clamp((c.metrics.team||40)+3,0,100); c.mgmt=(c.mgmt||0)+1.5; t='帶團隊：你審了三份別人審過的合約，改了兩份。'; break;
  }
  return {t,mini};
}
function doLife(a){
  const p=G.player;
  switch(a.id){
    case 'chome': addRel('mom',3); return pick(['回家。媽媽問你要不要買房子，你說再看看。','回家。二舅的土地資料還在，他說「你現在可以看了吧」。','回家。你在自己以前的房間睡了十個小時。']);
    case 'cfriend': return friendDinner();
    case 'cpartner': addRel('yu',5); return pick(['兩個人的晚上。她說你今天講話比較像人。','你們去吃了大學附近那家火鍋。','什麼都沒做，就一起看了一部電影。']);
    case 'csport': return '下班後跑了一圈。';
    case 'crest': return pick(['回家，把包放下，吃東西，坐在沙發上。什麼事都沒發生。','睡到中午。手機關靜音。','洗了衣服，把冰箱清空，然後發呆一小時。']);
    case 'chobby': return pick(['讀了一本跟法律完全無關的小說。','打了兩小時電動，其中一小時在看別人打。','把以前彈的曲子重新彈了一遍，手指記得比腦袋多。']);
    case 'ctravel': { G.career.trips=(G.career.trips||0)+1; return pick(['兩天一夜。海邊。手機只開來拍照。','去了一個沒有法院的小鎮。','搭火車去東部，回來的時候覺得腦袋被洗過。']); }
    case 'ccat': addRel('cat',3); return pick(['貓踩在鍵盤上，打出了一段亂碼。你覺得比某些書狀好懂。','鏟砂、梳毛、被踩。','牠坐在你的卷宗上。你決定今天不看那宗。']);
    case 'cstudy': { p.skills.lang.en=clamp(p.skills.lang.en+1.5,0,100); p.skills.research+=0.6; if(G.career.role==='legal'&&!G.flags.bar_pass){ G.career.barPrep=(G.career.barPrep||0)+1; } return '進修。'+(G.career.role==='legal'&&!G.flags.bar_pass?'晚上讀了一點律師考試的東西。（累積 '+G.career.barPrep+'）':'外語或專業領域，慢慢累積。'); }
  }
  return '';
}
function friendDinner(){
  const cands=['an','zhe','sis','kai','yu'].filter(id=>G.npcs[id].met); if(!cands.length) return '和同事吃飯。';
  const id=pick(cands); addRel(id,5); const n=G.npcs[id]; const name=NPCS[id].name;
  const cb=callbackLine(id); const news=n.news?'她/他說：「'+n.news.replace(/^她說：|^他說：/,'')+'」':'';
  return '和'+name+'吃飯。'+name+'現在'+n.stage+'。'+(cb?' '+cb:'')+(chance(.5)&&news?' '+news:'');
}
function callbackLine(id){
  const F=G.flags; const opts=[];
  if(F.midnight_notes&&(id==='an'||id==='zhe')) opts.push(NPCS[id].name+'：「你還記得大一期中考前我們凌晨還在找那份筆記嗎？」你說記得。你們笑了很久。');
  if(F.help_zhe&&id==='zhe') opts.push('阿哲：「大一那份民總筆記我還留著。」');
  if(F.footnote&&(id==='an'||id==='zhe')) opts.push(NPCS[id].name+'：「第七頁的註腳。」你說：「不要再提了。」');
  if(F.exch_go&&id==='an') opts.push('小安：「你那時候從國外寄的明信片我還貼在冰箱上。」');
  if(F.sis_trust&&id==='sis') opts.push('溫學姊：「你大一補充的那一頁，我現在還在用。」');
  if(F.uncle_land&&id==='kai') opts.push('阿凱：「你二舅的土地後來怎麼了？」你說：「還在。」');
  if(F.yu_met&&id==='yu') opts.push('小語：「你還記得那份打工合約嗎？你看了三遍，其實看不懂。」你說：「現在看得懂了。」');
  if(F.refuse_zhe&&id==='zhe') opts.push('阿哲：「大學你都不跟我去夜唱。」');
  if(F.court_visit&&id==='an') opts.push('小安：「你大三老是去法院旁聽。」');
  return opts.length?pick(opts):'';
}
function miniFor(role,m,stg){
  if(role==='lawyer'||role==='own'||role==='partner'){ if(stg==='研究'||stg==='閱卷研究') return {tpl:'issue',mid:m.id}; if(stg==='開庭'||stg==='談判'||stg==='調解') return {tpl:'nego',mid:m.id}; if(stg==='開庭準備') return {tpl:'newfiles',mid:m.id}; if(stg==='當事人溝通') return {tpl:'winrate',mid:m.id}; }
  if(role==='judge'){ if(stg==='證據評價') return {tpl:'evidence',mid:m.id}; if(stg==='撰寫裁判') return {tpl:'reasoning',mid:m.id}; if(stg==='整理爭點') return {tpl:'issue',mid:m.id}; }
  if(role==='pros'){ if(stg==='評估證據') return {tpl:'charge',mid:m.id}; if(stg==='規劃偵查') return {tpl:'direction',mid:m.id}; if(stg==='訊問與調查') return {tpl:'detain',mid:m.id}; }
  if(role==='legal'){ if(stg==='風險盤點') return {tpl:'clause',mid:m.id}; if(stg==='內部溝通') return {tpl:'always',mid:m.id}; if(stg==='談判') return {tpl:'nego',mid:m.id}; }
  return null;
}
function buildDyn(d){
  const m=matterById(d.mid)||{title:'案件',subj:'civ',trust:50,expect:50}; const nm='「'+m.title+'」';
  const TPL={
    issue:()=>{ const cs=CASES[pick(SUBJ_CASE[m.subj]||SUBJ_CASE.civ)]; return { id:'dyn', title:nm+'：爭點辨識', scene:G.career.role==='judge'?'chambers':'firm', lines:[L('n','你把'+nm+'的卷讀到一個段落。事實整理如下，真正該先處理的問題是哪一個？'),L('n',cs.text)],
      options:cs.opts.map(o=>({label:o.t, do:()=>{ const v={core:1,sec:.7,tan:.4,irr:.15}[o.k]; m.quality+=Math.round(v*10-3); bump(G.career.role==='judge'?'reasoning':'analysis',v*3); if(v<.5) m.prog=Math.max(0,m.prog-6); return [L('n',o.why),L('n',v>=1?'方向對了，後面的工作省了很多時間。':v>=.7?'不算錯，但你先處理了第二重要的問題。':'方向錯了，這週有一部分工作要重來。')]; } })) }; },
    nego:()=>{ const legal=G.career.role==='legal'; return { id:'dyn', title:nm+'：'+(legal?'談判':'和解方案'), scene:legal?'meeting':'court', lines:[L('n',legal?'對方的法務先開口：「這一條我們不可能讓。」':'調解室裡，對造律師開出一個數字，比你們的底線高一些。'),L('n',legal?'你手上有三個方案。':'當事人在旁邊看著你。')],
      options:[
        {label:'先談最重要的那一條，其他暫時擱置', do:()=>{ m.quality+=8; bump(legal?'business':'comm',3); G.player.skills.express+=1; return [L('n','對方鬆了一口氣。你們花了四十分鐘談那一條，其他三條十分鐘就談完了。')]; }},
        {label:'提出一個整包方案，讓對方選', do:()=>{ m.quality+=5; bump(legal?'riskCtl':'analysis',2); return [L('n','對方看了很久。最後選了你最希望他選的那一個，但要求再降一點。')]; }},
        {label:'堅持底線，等對方讓步', do:()=>{ m.quality+=(chance(.4)?7:-4); m.dl-=1; return [L('n',chance(.5)?'對方讓了。但這一週的時間就這樣過去了。':'對方沒有讓。談判延到下週，當事人開始問你為什麼。')]; }} ] }; },
    newfiles:()=>({ id:'dyn', title:nm+'：新資料', scene:'firm', lines:[L('n','開庭前兩天，當事人傳訊息：「律師，我昨天想到一個非常重要的事情。」'),L('n','附件：27 個檔案。')],
      options:[
        {label:'全部看完，重排開庭策略', do:()=>{ m.info=clamp(m.info+20,0,100); m.quality+=6; G.player.energy-=10; G.player.stress+=6; return [L('n','27 個檔案裡有 3 個真的重要。你重寫了問題清單，凌晨兩點。')]; }},
        {label:'請他先說明哪三個最重要，再看', do:()=>{ m.info=clamp(m.info+10,0,100); m.trust=clamp(m.trust+4,0,100); bump('comm',2); G.player.skills.express+=0.8; return [L('n','他挑了五個。其中兩個真的有用。你多睡了三個小時。')]; }},
        {label:'開庭後再處理', do:()=>{ m.quality-=6; m.trust=clamp(m.trust-8,0,100); return [L('n','開庭時對造拿出了其中一份。你在庭上第一次看到它。')]; }} ] }),
    winrate:()=>({ id:'dyn', title:nm+'：勝率', scene:'firm', lines:[L('n','當事人問：「律師，你覺得我們勝率多少？」')],
      options:[
        {label:'「我不會給數字。我跟你講三個有利、兩個不利的地方。」', do:()=>{ m.expect=clamp(m.expect-15,0,100); m.trust=clamp(m.trust+8,0,100); bump('ethics',3); bump('comm',2); return [L('n','他聽完沉默了一下，然後說：「好，那我們要怎麼補那兩個？」你覺得這個案子從這一刻開始才真的開始。')]; }},
        {label:'「七成吧。」', do:()=>{ m.expect=clamp(m.expect+10,0,100); m.trust=clamp(m.trust+3,0,100); bump('ethics',-4); return [L('n','他很高興。你回到座位，開始擔心那三成。')]; }},
        {label:'「這種事不能講。」', do:()=>{ m.trust=clamp(m.trust-5,0,100); bump('comm',-2); return [L('n','他點頭，但你看得出來他覺得你在敷衍。')]; }} ] }),
    evidence:()=>({ id:'dyn', title:nm+'：矛盾的證據', scene:'chambers', lines:[L('n','兩份鑑定報告結論相反，證人的說法和監視器時間差了十五分鐘。'),L('clerk','法官，下週的庭期要不要先排？')],
      options:[
        {label:'再開一次庭，讓雙方就矛盾處表示意見', do:()=>{ m.quality+=8; m.dl-=1; bump('procedure',4); bump('evidence',2); return [L('n','程序多走了一週，但雙方都講了。裁判寫起來反而快。')]; }},
        {label:'依現有證據判斷，在裁判中說明取捨理由', do:()=>{ m.quality+=4; bump('reasoning',3); bump('evidence',1); return [L('n','你在裁判裡花了兩頁說明為什麼採信這一份。寫完再讀一次，覺得說得過去。')]; }},
        {label:'直接採信比較晚出具的那份', do:()=>{ m.quality-=6; bump('evidence',-3); return [L('n','寫得很快。但你自己也知道，理由那段站不住。')]; }} ] }),
    reasoning:()=>({ id:'dyn', title:nm+'：說理', scene:'chambers', lines:[L('n','裁判寫到「本院心證」那一段。你有三種寫法。')],
      options:[
        {label:'一個爭點一段：證據、理由、結論', do:()=>{ m.quality+=8; bump('reasoning',4); G.player.skills.structure+=1; return [L('n','八頁。每一段都能回答「為什麼」。')]; }},
        {label:'先寫結論，再補理由', do:()=>{ m.quality+=3; bump('reasoning',1); return [L('n','五頁。理由有點趕，但結論清楚。')]; }},
        {label:'引用實務見解為主，自己少寫', do:()=>{ m.quality+=1; bump('reasoning',-1); return [L('n','四頁。庭長看了一眼：「這件事實跟那則見解不太一樣。」')]; }} ] }),
    charge:()=>({ id:'dyn', title:nm+'：處分', scene:'prosec', lines:[L('n',nm+'的證據評估：'+(m.info>=70?'證據大致完整，但有一個環節只有一個證人。':'證據不足，關鍵的金流還沒查到。')),L('cop','檢座，可以起訴了吧？被害人一直打來。')],
      options:[
        {label:'補充偵查：先把缺的那一塊查清楚', do:()=>{ m.dl-=1; m.info=clamp(m.info+20,0,100); m.quality+=8; bump('evidence',4); bump('procedure',2); return [L('n','多花了一週。查到的東西改變了案子的形狀。')]; }},
        {label:'依現有證據起訴', do:()=>{ const ok=m.info>=70; m.quality+=ok?5:-8; bump('reasoning',ok?2:-3); return [L('n',ok?'起訴書寫得很紮實。':'起訴了。庭上，辯護人問了那個你自己也在意的問題。')]; }},
        {label:'不起訴，並在處分書中說明理由', do:()=>{ const ok=m.info<50; m.quality+=ok?6:-4; bump('reasoning',3); return [L('n',ok?'被害人不滿意。但你把理由寫清楚了，這是你能做的。':'主任看了處分書：「再查一下金流呢？」')]; }} ] }),
    direction:()=>({ id:'dyn', title:nm+'：偵查方向', scene:'prosec', lines:[L('cop','檢座，我們覺得就是他。'),L('n','你看了一下卷。確實很像，但有一個時間點對不上。')],
      options:[
        {label:'兩個方向都查：查他，也查那個對不上的時間點', do:()=>{ m.quality+=8; bump('evidence',3); bump('procedure',3); m.dl-=1; return [L('n','阿豪有點不服氣，但還是去查了。兩週後那個時間點解釋清楚了，也真的是他。')]; }},
        {label:'先集中查他', do:()=>{ m.quality+=2; bump('coord',3); return [L('n','效率很高。但你把那個時間點記在便利貼上，貼在螢幕邊。')]; }} ] }),
    detain:()=>({ id:'dyn', title:nm+'：聲押', scene:'prosec', lines:[L('cop','檢座，證據我們覺得夠了，要不要聲請羈押？'),L('n','你翻了卷。夠嗎？不太夠。')],
      options:[
        {label:'不聲押，改限制住居，繼續查', do:()=>{ bump('procedure',4); bump('coord',-1); m.quality+=4; return [L('n','阿豪沒說話。三天後他帶來一份新的監視器畫面。')]; }},
        {label:'聲請羈押', do:()=>{ const ok=m.info>=65; bump('procedure',ok?1:-4); m.quality+=ok?3:-5; return [L('n',ok?'法院准了。':'法院駁回了。你在回程的車上想，其實你早就知道。')]; }} ] }),
    clause:()=>({ id:'dyn', title:nm+'：那一條', scene:'meeting', lines:[L('sales','客戶今晚一定要簽，不然這季業績會掉。'),L('n','第 12 條：無上限的賠償責任。你有不只兩個選項。')],
      options:[
        {label:'要求刪除第 12 條', do:()=>{ m.quality+=2; bump('riskCtl',3); bump('trustSales',-5); return [L('sales','對方不會同意的……'),L('n','對方沒同意。合約延到下週。')]; }},
        {label:'提供替代條款：責任上限為合約總價', do:()=>{ m.quality+=8; bump('riskCtl',3); bump('business',3); bump('trustSales',3); return [L('n','對方接受了。Kevin 傳了三個感謝貼圖。你把這個條款存進範本。')]; }},
        {label:'先處理真正高風險的部分，其他留待後續補充協議', do:()=>{ m.quality+=6; bump('business',4); bump('riskCtl',1); return [L('n','今晚簽了。你在合約旁邊附了一頁清單，下週要補的三件事。')]; }},
        {label:'建議取得總經理核准後再簽', do:()=>{ m.quality+=4; bump('trustBoss',3); bump('trustSales',-2); return [L('n','總經理十分鐘就簽了核准。Kevin 說：「早知道直接找他。」')]; }},
        {label:'同意，這是業務的決定', do:()=>{ m.quality-=6; bump('riskCtl',-6); bump('trustSales',4); return [L('n','簽了。半年後那一條真的被觸發。')]; }} ] }),
    always:()=>({ id:'dyn', title:nm+'：以前都這樣做', scene:'meeting', lines:[L('mgr','以前都這樣做啊，沒出過事。')],
      options:[
        {label:'「以前沒出事不代表沒風險。我建議這次改一個地方就好。」', do:()=>{ m.quality+=6; bump('trustBoss',2); bump('riskCtl',3); G.player.skills.express+=1; return [L('mgr','……好啦，改哪裡？'),L('n','你只改了一處。他接受了。')]; }},
        {label:'照以前的做法，但留下書面建議', do:()=>{ m.quality+=1; bump('trustBoss',3); bump('riskCtl',-1); return [L('n','你寫了一封信，主管回了「收到」。')]; }},
        {label:'堅持全部照法律意見改', do:()=>{ m.quality+=3; bump('trustBoss',-6); bump('riskCtl',4); m.dl-=1; return [L('mgr','那你去跟總經理講。'),L('n','你去了。事情多花了一週。')]; }} ] }),
  };
  return TPL[d.tpl]?TPL[d.tpl]():null;
}
function finishMatter(m){
  const c=G.career; m.done=true; const q=clamp(m.quality+(m.late?-6:4),0,100); m.finalQ=q; c.done.push({title:m.title,q,type:m.type}); if(!m.late) bump('time',2.5);
  let t='';
  if(c.role==='lawyer'||c.stage==='partner'||c.stage==='own'){ const win=q>=60?chance(.6):chance(.3); const settle=q>=55&&chance(.4); t='「'+m.title+'」結案：'+(settle?'和解。當事人說「其實這樣也好」。':win?'勝訴。':'敗訴。')+(m.trust>=65?'當事人信任你。':m.trust<40?'當事人不太滿意。':''); bump('rep',q>=65?2.5:q<40?-2:1); bump('trust',m.trust>=60?1.5:-1); if(c.stage==='own'){ c.own.receivable=(c.own.receivable||0)+m.fee; } }
  if(c.role==='judge'){ t='「'+m.title+'」結案：'+(q>=65?'裁判說理完整。':q>=45?'結案了。':'結案了，但你知道理由那段站不住。')+(m.late?'期限延了一次。':''); bump('growth',q>=60?2:0.5); bump('rep',q>=65?1.5:0); }
  if(c.role==='pros'){ t='「'+m.title+'」處分：'+(q>=65?'程序完整，證據紮實。':q>=45?'結了。':'結了，但有些地方應該再查。'); bump('growth',q>=60?2:0.5); bump('rep',q>=65?1.5:0); }
  if(c.role==='legal'){ t='「'+m.title+'」結案：'+(q>=65?'業務推進了，風險也控制住了。':q>=45?'完成了。':'簽了，但有幾條你並不放心。'); bump('rep',q>=65?1.5:0); if(m.type==='專案') c.metrics.projects=(c.metrics.projects||0)+1; }
  pushLog({kind:q>=60?'gain':'loss',scene:careerScene(),pose:'stand',t}); diary(t);
}
function careerScene(){ const c=G.career; return c.stage==='own'?'myfirm':c.role==='lawyer'||c.stage==='partner'?'firm':c.role==='judge'?'chambers':c.role==='pros'?'prosec':'meeting'; }
function careerReport(){
  const c=G.career; const lines=[]; const goals=[]; const m=c.metrics;
  const names={analysis:'法律分析',prep:'準備品質',comm:'溝通',time:'時間管理',ethics:'專業倫理',trust:'客戶信任',rep:'聲譽',firmRel:'事務所關係',procedure:'程序保障',evidence:'證據判斷',reasoning:'說理',growth:'專業成長',coord:'與警協作',business:'商業成果',riskCtl:'風險控制',trustSales:'業務信任',trustFin:'財務信任',trustHR:'人資信任',trustBoss:'主管信任',team:'團隊',clients:'客戶',harmony:'合夥關係',profit:'獲利'};
  for(const m2 of c.docket.filter(x=>!x.done)){ lines.push('<b>'+esc(m2.title)+'</b>：'+m2.stages[m2.stage]+'，進度 '+Math.round(m2.prog)+'%，'+(m2.dl<=0?'<span class="arrow d">已逾期</span>':'期限 '+m2.dl+' 週'+(m2.dl<=2?' <span class="arrow d">很近</span>':''))+(m2.hearingIn!=null?'，庭期 '+m2.hearingIn+' 週後':'')); }
  const weak=Object.keys(m).filter(k=>names[k]&&k!=='projects').sort((a,b)=>m[a]-m[b])[0]; if(weak) lines.push('這季最弱的是<b>'+names[weak]+'</b>。');
  if(c.streak>=3) lines.push('<span class="arrow d">連續 '+c.streak+' 週沒有自己的時間。</span>');
  if(G.player.energy<30) lines.push('<span class="arrow d">精力很低，工作效率打折。</span>');
  goals.push('這一季還有 '+(6-c.week-1)+' 週。'+(c.offers.length?'季末有 '+c.offers.length+' 件新案要決定接不接。':''));
  return {lines,goals};
}
function careerNext(){
  const c=G.career; c.week++;
  if(c.week>=6){ c.week=0; c.quarter++; c.stageQuarters=(c.stageQuarters||0)+1; if(c.quarter>=4){ c.quarter=0; c.year++; G.careerYears=(G.careerYears||0)+1; G.postYears=(G.postYears||0)+1; c.salary=Math.round(c.salary*1.04); MAIN_NPCS.forEach(npcLifeUpdate); } careerQuarterReview(); return; }
  G.sched=[]; G.screen='plan'; save();
}
function careerQuarterReview(){
  const c=G.career; const r={lines:[],options:[]}; const m=c.metrics;
  const done=c.done.slice(-8); const avgQ=done.length?done.reduce((a,x)=>a+x.q,0)/done.length:50;
  r.lines.push('這一季結了 '+done.length+' 件，平均品質 '+Math.round(avgQ)+'。');
  // 進階判定
  if(c.role==='lawyer'&&c.stage==='associate'&&c.stageQuarters>=6&&m.rep>=40){ r.options.push({k:'senior',t:'升為資深律師：獨立承辦、帶實習生，薪水上調',hint:'聲譽已經夠了'}); }
  if(c.role==='lawyer'&&c.stage==='senior'&&c.stageQuarters>=4&&m.rep>=60&&m.firmRel>=55){ r.options.push({k:'partner',t:'合夥人邀請：加入合夥，開始管理事務所',hint:'分潤、團隊、合夥關係'}); }
  if(c.role==='lawyer'&&(c.stage==='senior'||c.stage==='associate'&&c.stageQuarters>=8)&&G.player.money>=400000){ r.options.push({k:'own',t:'自行開業：用存款開一間自己的事務所',hint:'存款 '+money(G.player.money)}); }
  if(c.role==='lawyer'&&c.stageQuarters>=4&&G.npcs.kai.met&&G.careerYears>=3&&!G.flags.career_switch){ r.options.push({k:'toLegal',t:'轉任公司法務：阿凱的公司在找法務',hint:'薪水先降，生活會不一樣'}); }
  if(c.role==='judge'){ if(c.stage==='candidate'&&c.stageQuarters>=8) r.options.push({k:'j2',t:'候補期滿，進入試署（遊戲簡化）'}); if(c.stage==='trial'&&c.stageQuarters>=4) r.options.push({k:'j3',t:'試署期滿，成為實任法官（遊戲簡化）'}); if(c.stage==='tenured'&&c.stageQuarters>=6&&m.reasoning>=55){ r.options.push({k:'panel',t:'合議庭審判長：主持合議、帶陪席',hint:'說理與程序都夠成熟'}); r.options.push({k:'special',t:'專庭：專辦某一類案件（家事／勞動／智財）'}); r.options.push({k:'chief',t:'行政職：庭長，庭務與分案',hint:'辦案時間變少'}); r.options.push({k:'stay',t:'留在原庭專心辦案',hint:'也是一種完整的發展'}); } }
  if(c.role==='pros'){ if(c.stage==='candidate'&&c.stageQuarters>=8) r.options.push({k:'p2',t:'候補期滿，進入試署（遊戲簡化）'}); if(c.stage==='trial'&&c.stageQuarters>=4) r.options.push({k:'p3',t:'試署期滿，成為實任檢察官（遊戲簡化）'}); if(c.stage==='tenured'&&c.stageQuarters>=6&&m.evidence>=55){ r.options.push({k:'chiefp',t:'主任檢察官：帶組、審核處分書',hint:'責任變了'}); r.options.push({k:'specialp',t:'專組：經濟犯罪或婦幼專組'}); r.options.push({k:'stayp',t:'留在偵查組專心辦案'}); } }
  if(c.role==='legal'){ if(c.stage==='specialist'&&c.stageQuarters>=6&&m.rep>=35) r.options.push({k:'seniorL',t:'升為資深法務：獨立負責專案與談判'}); if(c.stage==='seniorL'&&c.stageQuarters>=4&&(m.trustSales+m.trustFin+m.trustHR+m.trustBoss)/4>=55&&(m.projects||0)>=2) r.options.push({k:'head',t:'法務主管：帶團隊、分配工作、參與重大決策'}); if(c.stage==='head'&&c.stageQuarters>=8&&m.trustBoss>=65) r.options.push({k:'cco',t:'法務長：法務部門負責人'}); if(c.stageQuarters>=4&&c.company!=='mnc'&&G.player.skills.lang.en>=55) r.options.push({k:'switchMNC',t:'跳槽跨國企業：外語合約與跨地區協作',hint:'重新累積信任'}); if((c.barPrep||0)>=10&&!G.flags.bar_pass) r.options.push({k:'takeBar',t:'報考律師考試（進修累積夠了）',hint:'離開公司一年全職備考，或邊工作邊考'}); if(G.flags.bar_pass&&c.stageQuarters>=4&&!G.flags.career_switch) r.options.push({k:'toLawyer',t:'轉任律師：你有執照，溫學姊的所在找人',hint:'從新進做起'}); }
  if(c.stage==='partner'&&c.stageQuarters>=6&&(m.harmony||55)<40) r.options.push({k:'leavePartner',t:'離開合夥，自己開業',hint:'合夥關係已經很差'});
  // 新案
  c.offersReview=c.offers.slice(0,3); c.offers=[];
  if(G.careerYears>=3) r.options.push({k:'ending',t:'回顧這段人生（結束遊戲，看結局）',hint:'隨時可以再玩下去'});
  G.review=r; G.screen='careerReview'; save();
}
function careerChoose(k){
  const c=G.career; const p=G.player;
  const S=(stage,title,note)=>{ c.stage=stage; c.title=title; c.stageQuarters=0; diary(note); };
  switch(k){
    case 'senior': S('senior','資深律師','升為資深律師。'); c.salary=Math.round(c.salary*1.35); break;
    case 'partner': S('partner','合夥人','成為事務所合夥人。'); setFlag('partner'); c.metrics.team=45; c.metrics.clients=50; c.metrics.harmony=60; c.metrics.profit=50; break;
    case 'own': G.screen='setupFirm'; G.firmSetup={step:0}; save(); return;
    case 'toLegal': setFlag('career_switch'); careerBegin('legal',{company:'startup'}); return;
    case 'toLawyer': setFlag('career_switch'); G.firmPick=G.flags.sis_trust?'sis':'small'; careerBegin('lawyer',{firm:G.firmPick}); return;
    case 'takeBar': setFlag('career_switch'); barBegin('part','lawyer','labor'); G.bar.job='公司法務'; return;
    case 'switchMNC': c.company='mnc'; c.salary=COMPANIES.mnc.salary+ (c.stage==='head'?40000:c.stage==='seniorL'?15000:0); c.metrics.trustSales=40; c.metrics.trustFin=45; c.metrics.trustHR=45; c.metrics.trustBoss=45; c.stageQuarters=0; diary('跳槽到跨國企業。'); break;
    case 'j2': S('trial','試署法官','候補期滿，進入試署。'); break;
    case 'j3': S('tenured','法官','成為實任法官。'); break;
    case 'panel': S('panel','合議庭審判長','擔任合議庭審判長。'); setFlag('judge_panel'); break;
    case 'special': S('special','專庭法官','轉入專庭。'); break;
    case 'chief': S('chief','庭長','擔任庭長。'); break;
    case 'stay': S('stay','法官（資深）','留在原庭專心辦案。'); break;
    case 'p2': S('trial','試署檢察官','候補期滿，進入試署。'); break;
    case 'p3': S('tenured','檢察官','成為實任檢察官。'); break;
    case 'chiefp': S('chiefp','主任檢察官','擔任主任檢察官。'); setFlag('pros_chief'); break;
    case 'specialp': S('specialp','專組檢察官','轉入專組。'); break;
    case 'stayp': S('stayp','檢察官（資深）','留在偵查組。'); break;
    case 'seniorL': S('seniorL','資深法務','升為資深法務。'); c.salary=Math.round(c.salary*1.3); break;
    case 'head': S('head','法務主管','成為法務主管。'); setFlag('legal_head'); c.salary=Math.round(c.salary*1.35); c.metrics.team=45; break;
    case 'cco': S('cco','法務長','成為法務長。'); c.salary=Math.round(c.salary*1.3); break;
    case 'leavePartner': G.screen='setupFirm'; G.firmSetup={step:0}; save(); return;
    case 'ending': G.screen='ending'; G.endingKey=endingKey(); save(); return;
  }
  G.screen='careerOffers'; save();
}
function acceptOffer(idx){ const c=G.career; const m=c.offersReview[idx]; if(m){ c.docket.push(m); c.offersReview.splice(idx,1); } save(); }
function declineOffer(idx){ const c=G.career; c.offersReview.splice(idx,1); if(c.stage==='own'){ c.own.pipeline=clamp((c.own.pipeline||20)-3,0,100); } save(); }
function offersDone(){ G.career.offersReview=[]; G.sched=[]; G.screen='plan'; save(); }
// 開業設定
const FIRM_SETUP=[
  { q:'地點', opts:[ {t:'市中心：租金高，案源多',fx:()=>{ G.career.own.rent=60000; G.career.own.pipeline=35; }}, {t:'住宅區：租金中，鄰居會來問事情',fx:()=>{ G.career.own.rent=30000; G.career.own.pipeline=25; }}, {t:'家鄉：租金低，親戚很多',fx:()=>{ G.career.own.rent=15000; G.career.own.pipeline=20; addRel('mom',6); }} ]},
  { q:'人力', opts:[ {t:'聘一位助理',fx:()=>{ G.career.own.staff=true; G.career.own.ops=55; }}, {t:'先自己來',fx:()=>{ G.career.own.staff=false; G.career.own.ops=35; }}, {t:'和阿哲合開', when:()=>G.npcs.zhe.rel>=45&&G.flags.help_zhe, fx:()=>{ G.career.own.cofounder='zhe'; G.career.own.pipeline+=10; G.career.own.rent=Math.round(G.career.own.rent/2); addRel('zhe',10); }} ]},
  { q:'定位', opts:[ {t:'精品所：專辦一類案件，收費高',fx:()=>{ G.career.own.style='商務與公司法'; G.career.own.brand=30; }}, {t:'在地所：什麼都接，先活下來',fx:()=>{ G.career.own.style='在地案件'; G.career.own.brand=15; G.career.own.pipeline+=8; }}, {t:'家事與弱勢：收費低，案子很真',fx:()=>{ G.career.own.style='家事與弱勢'; G.career.own.brand=20; G.career.own.pipeline+=4; }} ]},
];
function firmSetupChoose(idx){
  const c=G.career; if(!c.own) c.own={rent:30000,pipeline:20,brand:15,ops:40,receivable:0,staff:false};
  const step=FIRM_SETUP[G.firmSetup.step]; const opt=step.opts.filter(o=>!o.when||o.when())[idx]; if(opt) opt.fx();
  G.firmSetup.step++; if(G.firmSetup.step>=FIRM_SETUP.length){ c.stage='own'; c.title='開業律師'; c.stageQuarters=0; c.salary=0; G.player.money-=180000; setFlag('own_firm'); c.metrics.rep=clamp(c.metrics.rep-5,0,100); diary('自行開業：'+c.own.style+'，'+(c.own.cofounder?'和阿哲一起。':'一個人。')); c.docket=[newMatter('own')]; G.screen='careerOffers'; c.offersReview=[]; }
  save();
}
function endingKey(){
  const c=G.career; const p=G.player; const life=(100-p.stress)*0.4+(G.npcs.an.rel+G.npcs.zhe.rel+G.npcs.sis.rel+G.npcs.kai.rel+(G.flags.yu_partner?G.npcs.yu.rel:0))/5*0.6;
  if(!c) return 'newpath';
  if(c.stage==='own'&&(c.own.brand||0)>=45) return 'ownfirm';
  if(c.stage==='partner') return 'partner';
  if(c.role==='lawyer'&&(c.stage==='senior'||c.stage==='own')&&c.metrics.trust>=55) return 'trusted';
  if(c.role==='judge'&&c.metrics.reasoning>=50&&c.metrics.procedure>=50) return 'judge';
  if(c.role==='pros'&&c.metrics.evidence>=50) return 'pros';
  if(c.role==='legal'&&['head','cco'].includes(c.stage)) return 'legalhead';
  if(life>=45) return 'stable';
  return 'newpath';
}
const ENDINGS={
  ownfirm:{ title:'一間有自己風格的小事務所', text:'名片上的名字是你的。案子不多，但每一件你都知道為什麼要接。' },
  partner:{ title:'合夥人', text:'你學會了自己會辦案，不代表自然會帶人。你花了幾年學第二件事。' },
  trusted:{ title:'受信任的專業律師', text:'不是每個律師都要當老闆。你的當事人記得你講過的每一句「我不會給數字」。' },
  judge:{ title:'重視程序與說理的法官', text:'你的裁判不一定每件都被上級審維持，但每一段都能回答「為什麼」。' },
  pros:{ title:'值得信賴的檢察官', text:'你起訴的案子不一定最多，但阿豪知道，你說證據不夠的時候，是真的不夠。' },
  legalhead:{ title:'能解決商業問題的法務主管', text:'你的工作從自己審合約，變成讓別人審得對。業務還是會說「很簡單」，但他們現在會先問你。' },
  stable:{ title:'穩定的工作與好好過的生活', text:'不是每一段人生都要有轉折。你按時下班，週末有朋友，貓在沙發上。' },
  newpath:{ title:'重新選擇方向', text:'你決定離開原本的路。學過的東西沒有消失，它們只是換了一個用法。' },
};
function endingRecap(){
  const F=G.flags; const lines=[]; const keys=Object.keys(F).filter(k=>FLAG_TEXT[k]);
  for(const k of keys.slice(0,14)){ lines.push({t:F[k].t, text:FLAG_TEXT[k]}); }
  return lines;
}
function endingSuggest(){
  const s=[]; const c=G.career; const role=c?c.role:null;
  if(role!=='judge') s.push('下一輪試試司法官路線：從一試選擇題到司法官學院受訓，再到候補法官的第一件裁判。');
  if(role!=='pros') s.push('檢察官的一週有值勤與突發案件，和法官完全不同的節奏。');
  if(role!=='legal') s.push('直接進公司當法務：不用考照，但要學會「法律不是唯一答案」。');
  if(!F('exch_go')) s.push('大二申請交換，去過一個學期的海外生活。');
  if(!F('own_firm')&&role==='lawyer') s.push('存夠錢，自己開業：現金流、案源、收款，都是另一種人生。');
  return s.slice(0,3);
}
const CAREER_EVENTS=[
  { id:'c_an_court', title:'庭上', scene:'court', once:true, weight:60, when:()=>G.phase==='career'&&G.career.role==='lawyer'&&G.careerYears>=5&&G.npcs.an.met,
    lines:[L('n','今天開庭。法官走進來，你抬頭：是小安。'),L('n','她在庭上完全是另一個人。程序、詰問、裁定，一句多餘的話都沒有。'),L('n','庭後在走廊遇到。')],
    options:[ {label:'「你剛剛好嚴肅。」', do:()=>{ addRel('an',5); return [L('an','那是工作。'),L('an','……晚上要不要吃飯？'),L('n','你們去吃了大學附近那家火鍋。她說她的辦公室有你們大一的合照。')]; }} ]},
  { id:'c_zhe_client', title:'阿哲的公司', scene:'firm', once:true, weight:60, when:()=>G.phase==='career'&&(G.career.role==='lawyer'||G.career.stage==='own')&&G.careerYears>=4&&G.npcs.zhe.met,
    linesFn:()=>[L('zhe',G.flags.help_zhe?'我們所有一件案子的對造是你們所。下週開庭見。':'我們公司有一件合約糾紛，我想找你。'),L('zhe','你現在收費多少？我先講，朋友價我不接受，我要付正常的。')],
    options:[ {label:'「正常收費，正常辦。」', do:()=>{ addRel('zhe',6); bump('rep',2); if(G.career.stage==='own') G.career.own.pipeline=clamp(G.career.own.pipeline+8,0,100); setFlag('zhe_client'); return [L('n','你們在會議室談了一小時。談完他說：「你講話的樣子跟大一完全不一樣。」')]; }},
      {label:'「朋友價。」', do:()=>{ addRel('zhe',3); bump('ethics',-1); return [L('zhe','我說了不接受。'),L('n','最後他多付了一頓飯。')]; }} ]},
  { id:'c_sis_pull', title:'學姊的邀請', scene:'restaurant', once:true, weight:70, when:()=>G.phase==='career'&&G.career.role==='lawyer'&&G.flags.sis_trust&&G.careerYears>=4&&G.career.stage!=='own',
    lines:[L('sis','我們所要找一個資深律師，我推薦了你。'),L('sis','我沒有跟你講過，但我一直記得你大一還我筆記的那一頁。')],
    options:[ {label:'接受，換事務所', do:()=>{ G.career.firm='sis'; G.career.salary=Math.round(G.career.salary*1.2); bump('firmRel',15); addRel('sis',8); return [L('n','新的辦公室有一扇窗。第一天她把一疊卷放在你桌上：「跟大一一樣，讀完要還我。」')]; }},
      {label:'「謝謝，我想留在這裡。」', do:()=>{ setFlag('refuse_job'); addRel('sis',2); bump('firmRel',5); return [L('sis','好。有需要再說。'),L('n','你想，她大概真的會等。')]; }} ]},
  { id:'c_kai_hire', title:'阿凱的合約', scene:'restaurant', once:true, weight:60, when:()=>G.phase==='career'&&G.npcs.kai.met&&G.careerYears>=3&&G.career.role!=='legal',
    lines:[L('kai','我們公司拿到投資了。投資人給了一份合約，我看了三遍看不懂。'),L('kai','你可以看嗎？我付錢。')],
    options:[ {label:'看，用晚上的時間', do:()=>{ addRel('kai',8); setFlag('kai_client'); G.player.energy-=8; G.player.money+=(G.career.role==='lawyer'?25000:0); return [L('n','合約有三處要改。你用便利貼標起來，阿凱在旁邊說「原來這一條是這個意思」。')]; }},
      {label:'「你去找專門做投資的律師，我幫你介紹。」', do:()=>{ addRel('kai',4); bump(G.career.role==='lawyer'?'ethics':'growth',2); return [L('n','你介紹了一個同學。阿凱後來說那個人很好。你想，這也是一種幫忙。')]; }} ]},
  { id:'c_yu_propose', title:'一起', scene:'apt', once:true, weight:80, when:()=>G.phase==='career'&&G.flags.yu_partner&&G.npcs.yu.rel>=60&&G.careerYears>=2,
    lines:[L('yu','我們要不要住在一起？'),L('n','她說得很平常，像在講明天要買什麼。')],
    options:[ {label:'「好。」', do:()=>{ setFlag('moved_in'); addRel('yu',10); G.player.money-=40000; return [L('n','搬家那天阿哲來幫忙，把你大學的書全部搬進新家。有一本書籤還停在三分之一的地方。')]; }},
      {label:'「再等一下。」', do:()=>{ addRel('yu',-6); return [L('yu','好。'),L('n','這個「好」你又看了很久。')]; }} ]},
  { id:'c_cat', title:'貓', scene:'apt', once:true, weight:50, when:()=>G.phase==='career'&&G.careerYears>=2&&!G.flags.has_cat,
    lines:[L('n','下班回家的路上，巷口有一隻貓跟著你走了兩百公尺。'),L('n','牠在你家門口坐下。')],
    options:[ {label:'開門', do:()=>{ setFlag('has_cat'); G.player.stress-=8; return [L('n','牠進來了，繞了一圈，跳上沙發。你去便利商店買了貓砂。從此你家多了一個「照顧貓」的時段。')]; }},
      {label:'餵牠，但不帶回家', do:()=>{ addRel('cat',3); return [L('n','牠吃完就走了。之後每天都在巷口。')]; }} ]},
  { id:'c_boss_conflict', title:'紅字', scene:'firm', once:true, weight:50, when:()=>G.phase==='career'&&G.career.role==='lawyer'&&G.career.stage==='associate'&&G.careerYears>=1,
    lines:[L('boss','這份狀我不能送。'),L('n','他把狀退回來，紅字比黑字多，跟實習的時候一樣。'),L('n','但這次你覺得他改錯了一個地方。')],
    options:[ {label:'指出來，附上判決', do:()=>{ const ok=G.player.skills.research>=35; if(ok){ bump('analysis',3); bump('firmRel',4); addRel('boss',5); } else { bump('firmRel',-3); setFlag('conflict_boss'); } return [L('boss',ok?'……你說得對。送。':'這則判決的事實不一樣。'),L('n',ok?'他沒有多說什麼，但下一份狀他只改了一成。':'你回座位重讀那則判決。他說得對。')]; }},
      {label:'照改', do:()=>{ bump('firmRel',1); bump('ethics',-1); return [L('n','送出去了。你把自己的版本存在另一個資料夾。')]; }} ]},
  { id:'c_judge_load', title:'案件量', scene:'chambers', once:true, weight:60, when:()=>G.phase==='career'&&G.career.role==='judge'&&G.careerYears>=1,
    lines:[L('clerk','法官，這個月新收又比上個月多。'),L('chief','這一庭的未結件數，你看一下。'),L('n','數字很清楚。')],
    options:[ {label:'把簡單的案子先排密一點，複雜的留時間', do:()=>{ bump('time',5); bump('procedure',1); return [L('n','小方排了一個很緊的月。你每天下午都在開庭，但月底的時候，未結數字往下掉了。')]; }},
      {label:'每一件都照原本的節奏', do:()=>{ bump('procedure',3); bump('time',-4); return [L('n','數字沒有下來。但每一件你都讀完了卷。')]; }} ]},
  { id:'c_judge_reversed', title:'廢棄', scene:'chambers', once:true, weight:50, when:()=>G.phase==='career'&&G.career.role==='judge'&&G.career.done.length>=6,
    lines:[L('n','你去年的一件判決被上級審廢棄發回。理由：認定事實與卷證不符，說理不備。'),L('n','你把發回判決讀了三遍。')],
    options:[ {label:'把那段說理重寫一次，只給自己看', do:()=>{ bump('reasoning',5); bump('growth',3); return [L('n','重寫的版本比原本長兩頁。你發現當時你其實知道那一段站不住。')]; }},
      {label:'覺得上級審看法不同而已', do:()=>{ bump('growth',-1); return [L('n','也許吧。但你之後寫到類似的地方，手會停一下。')]; }} ]},
  { id:'c_pros_media', title:'媒體', scene:'prosec', once:true, weight:60, when:()=>G.phase==='career'&&G.career.role==='pros'&&G.careerYears>=1,
    lines:[L('n','你手上的縱火案上了新聞。記者在地檢署門口。'),L('cop','檢座，長官問要不要對外說一下。')],
    options:[ {label:'依規定由發言人處理，你只做案子', do:()=>{ bump('procedure',4); bump('rep',1); return [L('n','新聞第三天就沒有了。案子還在。')]; }},
      {label:'多說兩句，讓大家安心', do:()=>{ bump('procedure',-4); return [L('n','你說的兩句話被剪成一句。辯護人在庭上引用了它。')]; }} ]},
  { id:'c_pros_victim', title:'被害人家屬', scene:'prosec', once:true, weight:50, when:()=>G.phase==='career'&&G.career.role==='pros'&&G.careerYears>=1,
    lines:[L('n','被害人的母親在你辦公室外面等了兩個小時。'),L('n','「檢察官，為什麼還不起訴？」')],
    options:[ {label:'請她進來，說明程序與目前的狀況，不承諾結果', do:()=>{ bump('reasoning',2); bump('procedure',2); G.player.skills.express+=1; G.player.stress+=4; return [L('n','她哭了。你遞了衛生紙，繼續把程序講完。她離開的時候說「謝謝你跟我講」。')]; }},
      {label:'請書記官轉達「偵查不公開」', do:()=>{ bump('procedure',1); bump('rep',-1); return [L('n','程序上沒錯。但你晚上一直想到她坐在外面的樣子。')]; }} ]},
  { id:'c_legal_87', title:'八十七頁', scene:'meeting', once:true, weight:60, when:()=>G.phase==='career'&&G.career.role==='legal',
    lines:[L('sales','合約很簡單，請法務快速看一下。'),L('n','附件共八十七頁。')],
    options:[ {label:'先問他哪三條是客戶真正在意的', do:()=>{ bump('trustSales',3); bump('business',2); G.player.skills.judgment+=1; return [L('sales','……付款、交期、違約。'),L('n','你先看了那三條，二十分鐘。其他六十七頁留到明天。')]; }},
      {label:'全部看完，凌晨兩點', do:()=>{ bump('riskCtl',3); G.player.energy-=12; G.player.stress+=6; return [L('n','第 54 頁有一條沒人會看的仲裁條款，仲裁地在另一個國家。你把它標起來。')]; }} ]},
  { id:'c_legal_labor', title:'人資', scene:'meeting', once:true, weight:50, when:()=>G.phase==='career'&&G.career.role==='legal'&&G.careerYears>=1,
    lines:[L('n','人資主管來找你：「有一個員工我們想資遣，但他最近在請假。」'),L('n','你翻了一下法規和他的出勤紀錄。')],
    options:[ {label:'說明風險，建議先了解請假原因再談', do:()=>{ bump('trustHR',3); bump('riskCtl',3); return [L('n','人資回去問了。原因跟公司想的不一樣。事情變成另一件事，但沒有變成訴訟。')]; }},
      {label:'照公司的決定準備文件', do:()=>{ bump('trustHR',2); bump('riskCtl',-4); return [L('n','文件準備好了。三個月後你在調解會上見到那位員工。')]; }} ]},
  { id:'c_own_rent', title:'房東', scene:'myfirm', once:true, weight:70, when:()=>G.phase==='career'&&G.career.stage==='own',
    lines:[L('n','房東打電話來：下年度租金要漲一成五。'),L('n','你看了一下應收帳款，有一筆四個月了。')],
    options:[ {label:'跟房東談，簽兩年換少漲一點', do:()=>{ G.career.own.rent=Math.round(G.career.own.rent*1.05); G.player.skills.express+=1; return [L('n','談了半小時，漲五趴，簽兩年。你發現談自己的租約比談當事人的合約緊張。')]; }},
      {label:'接受，把成本轉到報價', do:()=>{ G.career.own.rent=Math.round(G.career.own.rent*1.15); G.career.own.brand+=2; return [L('n','報價往上調了。兩個舊客戶沒說什麼，一個新客戶跑了。')]; }} ]},
  { id:'c_own_overload', title:'過量', scene:'myfirm', once:true, weight:70, when:()=>G.phase==='career'&&G.career.stage==='own'&&G.career.docket.filter(m=>!m.done).length>=3,
    lines:[L('n','三件案子同一週要交狀。助理請假。你已經連續兩週沒有在十點前回家。')],
    options:[ {label:'跟其中一位當事人談延期', do:()=>{ const m=G.career.docket.find(x=>!x.done); if(m){ m.dl+=2; m.trust-=4; } bump('rep',0); return [L('n','當事人不太高興，但同意了。你多了兩週。')]; }},
      {label:'聘一位新律師', when:()=>G.player.money>=150000, do:()=>{ G.career.own.staff=true; G.player.money-=60000; G.career.own.ops+=15; return [L('n','面試了三個人。錄取的那個人第一天就問了你大一問陳教授的那個問題。')]; }},
      {label:'撐過去', do:()=>{ G.player.energy-=15; G.player.stress+=12; setFlag('overwork'); return [L('n','撐過去了。第四週你在事務所的沙發睡了一整天。')]; }} ]},
  { id:'c_partner_junior', title:'新人', scene:'firm', once:true, weight:70, when:()=>G.phase==='career'&&G.career.stage==='partner',
    lines:[L('n','新人把一份狀送出去了，沒有給你看。裡面有一個日期錯了。'),L('n','對造律師打電話來，語氣很客氣。')],
    options:[ {label:'自己打電話補正，然後和新人談', do:()=>{ G.career.metrics.team+=4; G.career.mgmt+=2; return [L('n','新人哭了。你想起大一被改狀的自己，什麼都沒說，只說「下一份我看過再送」。')]; }},
      {label:'讓新人自己處理', do:()=>{ G.career.metrics.team+=1; G.career.metrics.clients-=3; return [L('n','他處理了，處理得不太好。客戶記住了這件事。')]; }} ]},
  { id:'c_partner_split', title:'合夥會議', scene:'firm', once:true, weight:60, when:()=>G.phase==='career'&&G.career.stage==='partner'&&G.career.stageQuarters>=3,
    lines:[L('n','合夥會議。另一位合夥人想把事務所擴到二十人。你覺得現在的十個人剛好。'),L('n','分潤表放在桌上。')],
    options:[ {label:'提出折衷：先加兩個人，看一年', do:()=>{ G.career.metrics.harmony+=6; G.career.mgmt+=1; return [L('n','大家點頭。你發現合夥跟開庭不一樣，沒有人要「贏」。')]; }},
      {label:'堅持不擴', do:()=>{ G.career.metrics.harmony-=10; G.career.metrics.profit+=3; return [L('n','會議提早結束。走廊上很安靜。')]; }} ]},
  { id:'c_head_delegate', title:'分配', scene:'meeting', once:true, weight:60, when:()=>G.phase==='career'&&G.career.role==='legal'&&['head','cco'].includes(G.career.stage),
    lines:[L('n','你桌上有八份合約。以前你會全部自己看。'),L('n','現在你有三個人。')],
    options:[ {label:'分出去六份，自己留兩份最難的', do:()=>{ G.career.metrics.team+=5; G.career.mgmt+=2; bump('trustBoss',2); return [L('n','分出去的那六份，回來的時候有兩份你想重改。你忍住了，只改了一份。')]; }},
      {label:'還是自己看', do:()=>{ G.player.energy-=12; G.career.metrics.team-=3; return [L('n','你看到十一點。團隊的人準時下班，走的時候有點尷尬。')]; }} ]},
  { id:'c_mom_house', title:'房子', scene:'home', once:true, weight:40, when:()=>G.phase==='career'&&G.careerYears>=4,
    lines:[L('mom','你們這一行很穩定吧？要不要看房子？'),L('n','她把一份廣告放在桌上。')],
    options:[ {label:'「再看看。」', do:()=>[L('n','廣告在桌上放了三個月。')] },
      {label:'真的去看了', do:()=>{ G.player.money-=5000; return [L('n','看了三間。你發現自己看房子的時候會先看契約。')]; }} ]},
  { id:'c_reunion', title:'同學會', scene:'restaurant', once:true, weight:70, when:()=>G.phase==='career'&&G.careerYears>=6,
    linesFn:()=>[L('n','畢業後第一次同學會。'),L('n','小安：'+G.npcs.an.stage+'。阿哲：'+G.npcs.zhe.stage+'。'),L('n','你們以前明明坐在同一間教室，現在每個人的人生已經完全不一樣了。')],
    options:[ {label:'坐到最後', do:()=>{ addRel('an',6); addRel('zhe',6); G.player.stress-=10; setFlag('reunion'); return [L('n','最後剩四個人。有人說：「大家都變了。」有人說：「沒有。」都對。')]; }} ]},
];
