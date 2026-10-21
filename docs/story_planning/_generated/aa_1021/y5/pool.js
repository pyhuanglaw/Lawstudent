const H=require(process.env.WT+'/tests/pg_harness.js');
const G=H.fresh('2029-12-19',15,'campus',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1});
for(const k of ['2029-12-19','2029-12-20']){ H.at(k,15); const ids=Object.keys(CHARACTERS).filter(i=>/^pool_/.test(i)); const here=ids.filter(i=>STORY.presence(i,G).here).length; console.log(k,'pool here',here,'/',ids.length,'termAt',STORY.termAt(G.day)); }
