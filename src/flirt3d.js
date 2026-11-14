/* ===== 說點不一樣的（撩妹選項；GIFT-FLIRT-1107 另一半；USER_WANTS X262）=====
   使用者 11-07 試玩：「也沒有撩妹對話可以選」。台詞：AA_711（src/data/flirt_lines.js，tools/story/import_flirt.py 產生）。
   - 當面和七位女主角說話（STORY.TALK_OPTS）多一個「（說點不一樣的）」：一天一次（選了「算了」不算）。
   - 選了列出這學期還沒說過的那幾句（最多 3 句，照 AA 的順序）；祐廷說那一句 → 階段（DATE.stageNum）≥ need＝她的 ok、不到＝early（她冷掉或閃開；need 5 那則太早說會小扣自在）。好感照那一格的 rel。
   - 說過的那句這學期不再出現；這學期五句都說過＝這一項不出現。
   存檔：G.flags.FLIRT＝{day:{人物:第幾天}, used:{人物:{學期 id:[第幾句]}}}；舊存檔沒有＝空的。
   測試：node tests/flirt_unit.js */
'use strict';
const FLIRT=(function(){
  const S={};
  const L=()=>(typeof FLIRT_LINES!=='undefined'&&FLIRT_LINES.people)||{};
  S.LABEL='（說點不一樣的）'; S.SHOW=3;
  const R=G=>{ const f=G.flags||(G.flags={}); const r=f.FLIRT&&typeof f.FLIRT==='object'?f.FLIRT:(f.FLIRT={}); r.day=r.day||{}; r.used=r.used||{}; return r; };
  const term=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return t?t.id:'x'; };
  const stage=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1;
  S.used=(G,id)=>{ const U=R(G).used, u=U[id]||(U[id]={}), k=term(G); return u[k]||(u[k]=[]); };
  S.left=(G,id)=>{ const T=L()[id]; if(!T) return []; const u=S.used(G,id); return T.map((e,i)=>[e,i]).filter(([e,i])=>!e.gone&&!u.includes(i)); };   /* gone：AA 拿掉的那一句（CANON-NO-ECON-1112，AA_897）——位置留著，存檔的索引不會錯開 */
  S.can=(G,id)=>!!L()[id]&&R(G).day[id]!==G.day&&S.left(G,id).length>0;
  S.text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  const play=async(GM,who,lines)=>{ for(const t of lines||[]){ const s=S.text(GM.G,t); if(/^（/.test(s)) await GM.say(null,s); else await GM.say(who,s); } };
  /* 回傳 'ok'／'early'／null（算了）*/
  S.run=async function(GM,who,id){ const G=GM.G; if(!S.can(G,id)) return null; const C=S.left(G,id).slice(0,S.SHOW), opts=C.map(([e])=>({t:S.text(G,e.t)})); opts.push({t:'算了'});
    const k=await GM.choose(opts); const pick=C[k]; if(!pick) return null; const [e,i]=pick; R(G).day[id]=G.day; S.used(G,id).push(i);
    await GM.say({name:G.name||'祐廷'},S.text(G,e.t)); const ok=stage(id)>=e.need, P=ok?e.ok:e.early; await play(GM,who,P.lines);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&P.rel&&Object.keys(P.rel).length) SOCIAL.adjust(id,P.rel); return ok?'ok':'early'; };
  S.talkOpts=(G,id)=>S.can(G,id)?[{t:S.LABEL,hint:'看你們現在多熟',run:async(GM,who)=>{ await S.run(GM,who,id); }}]:[];
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>S.talkOpts(G,id));
  return S;
})();
