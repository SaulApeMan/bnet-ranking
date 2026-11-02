(function(){
var D=window.SITE_DATA,TR=window.I18N||{},LANGS=['pl','en','zh','de'],L='';
try{L=localStorage.getItem('lang')||''}catch(e){}
if(LANGS.indexOf(L)<0)L='en';
var QS=new URLSearchParams(location.search);
if(LANGS.indexOf(QS.get('lang'))>=0)L=QS.get('lang');
var T=function(pl,en){return L=='pl'?pl:L=='en'?en:((TR[en]||{})[L]||en)};
var RC={Human:'Human','Orc':'Orc','Undead':'Undead','Night Elf':'NightElf','Random':'Random'};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rn(r){return r?((D.race_names[L]||{})[r]||r):'—'}
function icon(id){var i=D.icons[id];if(!i)return '';return '<img class="ic" src="icons/icon-'+id+'.png" alt="" title="'+esc(i[L]||i.en)+'" loading="lazy">'}
function iname(id){var i=D.icons[id];return i?(i[L]||i.en):id}
function nm(n,img,rk){if(n!=null)return esc(n);if(img)return '<img class="nm" src="'+esc(img)+'" alt="'+esc(T('nazwa (obrazek)','name (picture)'))+'" title="'+esc(T('nazwa (obrazek)','name (picture)'))+'" loading="lazy">';return '<span class="dim">—</span>'}
function rc(r){return '<span class="'+(RC[r]||'')+'">'+esc(rn(r))+'</span>'}
function sgn(v){return '<span class="'+(v>0?'up':v<0?'down':'dim')+'">'+(v>0?'+':'')+v+'</span>'}
function modeLabel(m){return m}
function setLang(l){L=l;try{localStorage.setItem('lang',l)}catch(e){}render()}
function chrome(){
 document.querySelectorAll('[data-pl]').forEach(function(e){e.innerHTML=T(e.getAttribute('data-pl'),e.getAttribute('data-en'))});
 document.documentElement.lang=L=='zh'?'zh-Hans':L;
 document.querySelectorAll('.lang button[data-l]').forEach(function(b){var on=b.dataset.l==L;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});
}
function hist(el,m,race){
 var h=D.modes[m].hist,idx=race?D.races.indexOf(race)+2:1,mx=0;
 h.forEach(function(r){mx=Math.max(mx,r[idx])});
 var w=Math.max(h.length*22+50,320),H=200,s='<svg viewBox="0 0 '+w+' '+(H+30)+'" width="100%" role="img">';
 h.forEach(function(r,i){var bh=mx?Math.round(r[idx]/mx*(H-10)):0,x=40+i*22;
  s+='<rect x="'+x+'" y="'+(H-bh)+'" width="19" height="'+bh+'" fill="'+(race?'var(--'+RC[race]+')':'var(--gold)')+'"><title>'+r[0]+'-'+(r[0]+D.bin-1)+': '+r[idx]+'</title></rect>';
  if(i%3==0)s+='<text x="'+(x+9)+'" y="'+(H+14)+'" text-anchor="middle">'+r[0]+'</text>'});
 s+='<text x="2" y="12">'+mx+'</text><text x="2" y="'+H+'">0</text></svg>';el.innerHTML=s}
function games(r){return r[4]+r[5]}
function qa(r){return r&&r[10]?'<span class="qa" title="'+esc(T('odczyt do sprawdzenia','reading to be checked'))+'"></span>':''}
var SORTS={rank:function(r){return r[0]},mmr:function(r){return r[3]},games:games,wins:function(r){return r[4]},losses:function(r){return r[5]},wr:function(r){var g=games(r);return g?r[4]/g:0},level:function(r){return r[6]||0}};
function lgname(id){var l=D.leagues[id];if(!l)return '?';var nm=l[L=='en'?'name':L]||l.name;return nm||T('Dywizja ','Division ')+l.n}
function lgopt(id){var l=D.leagues[id];return l&&l.name?lgname(id)+' ('+T('Dywizja ','Division ')+l.n+')':lgname(id)}
function lgcell(id){var l=D.leagues[id];if(!l)return '<span class="dim">–</span>';return (l.img?'<img class="lg" src="'+esc(l.img)+'" alt="'+esc(lgname(id))+'" title="'+esc(lgname(id))+'" loading="lazy">':'')+'<span class="lgn">'+esc(lgname(id))+'</span>'}
function knownMap(m){var k={};(m.known||[]).forEach(function(x){(k[x[0]]=k[x[0]]||[]).push(x)});return k}
function knownBadge(ks,name){return (ks||[]).map(function(k){return knownBadge1(k,name)}).join('')}
function knownBadge1(k,name){if(!k)return '';var same=name&&name.toLowerCase()==k[2].toLowerCase();
 return ' <span class="kn '+(k[1]=='p'?'kp':'kf')+'" title="'+esc(k[1]=='p'?T('Zawodowiec – czołówka rankingu Elo warcraft3.info','Pro player – top of the warcraft3.info Elo ranking'):T('Znany gracz','Famous player'))+': '+esc(k[2])+'">'+(k[1]=='p'?'PRO':'★')+(same?'':' · '+esc(k[2]))+'</span>'}
function rankingPage(){
 var root=document.getElementById('app'),ms=Object.keys(D.modes);
 var st=window._st=window._st||{m:QS.get('mode')||'1v1',race:QS.get('race')||'',icon:QS.get('icon')||'',league:QS.get('league')||'',q:QS.get('q')||'',sort:SORTS[QS.get('sort')]?QS.get('sort'):'rank',dir:QS.get('dir')=='-1'?-1:1,min:+QS.get('min')||0,shown:100,who:QS.get('who')||''};
 if(!D.modes[st.m])st.m='1v1';
 var m=D.modes[st.m];
 var sopts=[['rank',T('miejsce w rankingu','ladder rank')],['mmr','MMR'],['games',T('liczba gier','games played')],['wins',T('wygrane','wins')],['losses',T('przegrane','losses')],['wr',T('% wygranych','win %')],['level',T('poziom','level')]];
 var o='<div class="ctl"><label>'+T('Tryb','Mode')+' <select id="fm">'+ms.map(function(x){return'<option'+(x==st.m?' selected':'')+'>'+x+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Rasa','Race')+' <select id="fr"><option value="">'+T('wszystkie','all')+'</option>'+D.races.map(function(r){return'<option value="'+r+'"'+(r==st.race?' selected':'')+'>'+esc(rn(r))+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Ikona','Icon')+' <select id="fi"><option value="">'+T('wszystkie','all')+'</option>'+m.icons.map(function(i){return'<option value="'+i[0]+'"'+(i[0]==st.icon?' selected':'')+'>'+esc(iname(i[0]))+' ('+i[1]+')</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Liga','League')+' <select id="fl"><option value="">'+T('wszystkie','all')+'</option>'+Object.keys(D.leagues).map(function(k){return'<option value="'+k+'"'+(k==st.league?' selected':'')+'>'+lgopt(k)+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Gracze','Players')+' <select id="fk">'+[['',T('wszyscy','all')],['p',T('zawodowcy','pro players')],['f',T('znani','famous')],['pf',T('zawodowcy i znani','pro + famous')]].map(function(x){return'<option value="'+x[0]+'"'+(x[0]==st.who?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Szukaj','Search')+' <input id="fq" value="'+esc(st.q)+'" placeholder="'+T('nazwa','name')+'"></label>';
 o+='<label>'+T('Sortuj','Sort')+' <select id="fs">'+sopts.map(function(x){return'<option value="'+x[0]+'"'+(x[0]==st.sort?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label>';
 o+='<label><select id="fd"><option value="1"'+(st.dir==1?' selected':'')+'>'+T('rosnąco','ascending')+'</option><option value="-1"'+(st.dir==-1?' selected':'')+'>'+T('malejąco','descending')+'</option></select></label>';
 o+='<label>'+T('Min. gier','Min. games')+' <input id="fg" type="number" min="0" value="'+st.min+'" style="width:80px"></label></div>';
 var KN=knownMap(m);
 var rows=m.top.filter(function(r){var k=KN[r[0]]||[];return(!st.race||r[2]==st.race)&&(!st.icon||r[7]==st.icon)&&(!st.league||r[9]==st.league)
  &&(!st.who||k.some(function(x){return st.who.indexOf(x[1])>=0}))
  &&(!st.q||((r[1]||'')+' '+k.map(function(x){return x[2]}).join(' ')).toLowerCase().indexOf(st.q.toLowerCase())>=0)&&games(r)>=st.min});
 var f=SORTS[st.sort];rows=rows.slice().sort(function(a,b){return(f(a)-f(b))*st.dir||a[0]-b[0]});
 o+='<div class="note">'+T('Skan z ','Scan of ')+esc(m.date)+' · '+m.rows.toLocaleString()+T(' wierszy',' rows')+(m.sample?T(' (próbka: tylko pierwsze strony rankingu)',' (sample: first pages of the ladder only)'):'')+(m.partial?' · <b class="down">'+T('skan niepełny – część rankingu','incomplete scan – part of the ladder only')+'</b>':'')+' · '+T('mediana MMR ','median MMR ')+m.mmr_median+' · <b>'+rows.length.toLocaleString()+'</b> '+T('pasuje do filtrów','match the filters')+'<br><span class="dim">'+T('Miejsce w rankingu gry wynika z poziomu konta, nie z MMR – żeby zobaczyć najsilniejszych graczy, sortuj po MMR.','The in-game ladder rank follows account level, not MMR – sort by MMR to see the strongest players.')+'</span></div>';
 o+='<div class="tw"><table><tr><th class="n">#</th><th>'+T('Gracz','Player')+'</th>'+(Object.keys(D.leagues).length?'<th>'+T('Liga','League')+'</th>':'')+'<th class="n">'+T('Poz.','Lvl')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th><th class="n">'+T('Wygr.','Wins')+'</th><th class="n">'+T('Przegr.','Losses')+'</th><th class="n">'+T('Gry','Games')+'</th><th class="n">%</th></tr>';
 rows.slice(0,st.shown).forEach(function(r){var g=games(r);o+='<tr><td class="n">'+r[0]+'</td><td>'+icon(r[7])+nm(r[1],r[8],r[0])+qa(r)+knownBadge(KN[r[0]],r[1])+'</td>'+(Object.keys(D.leagues).length?'<td>'+lgcell(r[9])+'</td>':'')+'<td class="n">'+(r[6]==null?'<span class="dim">–</span>':r[6])+'</td><td>'+rc(r[2])+'</td><td class="n">'+r[3]+'</td><td class="n">'+r[4]+'</td><td class="n">'+r[5]+'</td><td class="n">'+g+'</td><td class="n">'+(g?Math.round(r[4]/g*100):0)+'</td></tr>'});
 o+='</table></div><p class="dim">'+T('Pokazano ','Showing ')+Math.min(st.shown,rows.length)+T(' z ',' of ')+rows.length.toLocaleString()+(rows.length>st.shown?' · <a href="#" id="more">'+T('pokaż 200 więcej','show 200 more')+'</a>':'')+'</p>';
 var at=st.m.indexOf('arranged')>=0;                     // arranged teams have no race: one histogram only
 o+='<h2>'+T('Rozkład MMR','MMR distribution')+'</h2><div class="'+(at?'':'grid2')+'"><div id="h1" class="card"></div>'+(at?'':'<div id="h2" class="card"></div>')+'</div>';
 root.innerHTML=o;
 hist(document.getElementById('h1'),st.m,'');
 if(!at){var r2=st.race||'Orc';document.getElementById('h2').insertAdjacentHTML('afterbegin','<b class="'+RC[r2]+'">'+esc(rn(r2))+'</b>');
  var w=document.createElement('div');document.getElementById('h2').appendChild(w);hist(w,st.m,r2)}
 function rd(){st.league=document.getElementById('fl').value;st.who=document.getElementById('fk').value;st.m=document.getElementById('fm').value;st.race=document.getElementById('fr').value;st.sort=document.getElementById('fs').value;st.dir=+document.getElementById('fd').value;st.min=+document.getElementById('fg').value||0;st.shown=100}
 ['fm','fr','fs','fd','fg','fi','fl','fk'].forEach(function(id){document.getElementById(id).onchange=function(){var pm=st.m;rd();st.icon=(id=='fm'&&pm!=st.m)?'':document.getElementById('fi').value;rankingPage()}});
 var q=document.getElementById('fq');q.oninput=function(){st.q=q.value;st.shown=100;var p=q.selectionStart;rankingPage();var n=document.getElementById('fq');n.focus();n.setSelectionRange(p,p)};
 var mo=document.getElementById('more');if(mo)mo.onclick=function(e){e.preventDefault();st.shown+=200;rankingPage()};
}
function best(rows,f,dir,n){return rows.slice().sort(function(a,b){return(f(b)-f(a))*dir||a[0]-b[0]}).slice(0,n)}
function recRow(label,r,val){return r?'<tr><td>'+label+'</td><td>'+icon(r[7])+nm(r[1],r[8],r[0])+qa(r)+' <span class="dim">#'+r[0]+'</span></td><td class="n">'+val+'</td></tr>':''}
function recordsPage(){
 var root=document.getElementById('app'),ms=Object.keys(D.modes);
 var st=window._sr=window._sr||{m:'1v1',min:100};if(!D.modes[st.m])st.m='1v1';
 var m=D.modes[st.m],all=m.top;
 var o='<div class="ctl"><label>'+T('Tryb','Mode')+' <select id="rm">'+ms.map(function(x){return'<option'+(x==st.m?' selected':'')+'>'+x+'</option>'}).join('')+'</select></label><label>'+T('Min. gier do % wygranych','Min. games for win %')+' <input id="rg" type="number" min="1" value="'+st.min+'" style="width:80px"></label></div>';
 o+='<div class="note">'+T('Skan z ','Scan of ')+esc(m.date)+' · '+m.rows.toLocaleString()+T(' wierszy',' rows')+(m.sample?T(' (próbka pierwszych stron, rekordy dotyczą tylko jej)',' (sample of the first pages, records cover it only)'):'')+'</div>';
 var groups=[['',T('Wszystkie rasy','All races')]].concat(D.races.map(function(r){return[r,rn(r)]}));
 o+='<div class="grid2">';
 groups.forEach(function(g){
  var rs=g[0]?all.filter(function(r){return r[2]==g[0]}):all;if(!rs.length)return;
  var wr=rs.filter(function(r){return games(r)>=st.min});
  var avg=Math.round(rs.reduce(function(a,r){return a+r[3]},0)/rs.length);
  var lv=best(rs,SORTS.level,1,1)[0],hi=best(rs,SORTS.mmr,1,1)[0],lo=best(rs,SORTS.mmr,-1,1)[0],mg=best(rs,games,1,1)[0],mw=best(rs,SORTS.wins,1,1)[0],ml=best(rs,SORTS.losses,1,1)[0];
  var bw=wr.length?best(wr,SORTS.wr,1,1)[0]:null,ww=wr.length?best(wr,SORTS.wr,-1,1)[0]:null;
  o+='<div><h2 class="'+(RC[g[0]]||'')+'">'+esc(g[1])+' · '+rs.length.toLocaleString()+'</h2><div class="tw"><table>'
   +recRow(T('Najwyższe MMR','Highest MMR'),hi,hi[3])
   +recRow(T('Najniższe MMR','Lowest MMR'),lo,lo[3])
   +recRow(T('Najwięcej gier','Most games'),mg,games(mg))
   +recRow(T('Najwięcej wygranych','Most wins'),mw,mw[4])
   +recRow(T('Najwięcej przegranych','Most losses'),ml,ml[5])
   +(bw?recRow(T('Najlepsze % wygranych','Best win %'),bw,Math.round(SORTS.wr(bw)*1000)/10+'%'):'')
   +(ww?recRow(T('Najgorsze % wygranych','Worst win %'),ww,Math.round(SORTS.wr(ww)*1000)/10+'%'):'')
   +(lv&&lv[6]?recRow(T('Najwyższy poziom','Highest level'),lv,lv[6]):'')
   +'<tr><td>'+T('Średnie MMR','Average MMR')+'</td><td></td><td class="n">'+avg+'</td></tr></table></div></div>'});
 o+='</div>';
 var pr=window._sp=window._sp||'';
 var pool=all.filter(function(r){return r[5]==0&&r[4]>0&&(!pr||r[2]==pr)});
 pool.sort(function(a,b){return b[4]-a[4]||b[3]-a[3]});
 o+='<h2>'+T('Perfekcyjne rekordy (bez przegranej)','Perfect records (no losses)')+'</h2><div class="ctl"><label>'+T('Rasa','Race')+' <select id="pr"><option value="">'+T('wszystkie','all')+'</option>'+D.races.map(function(r){return'<option value="'+r+'"'+(r==pr?' selected':'')+'>'+esc(rn(r))+'</option>'}).join('')+'</select></label><span class="dim">'+pool.length.toLocaleString()+T(' wierszy bez przegranej',' rows with no losses')+'</span></div>';
 o+='<div class="tw"><table><tr><th class="n">#</th><th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">'+T('Wygrane','Wins')+'</th><th class="n">MMR</th><th class="n">'+T('Miejsce','Ladder rank')+'</th></tr>';
 pool.slice(0,10).forEach(function(r,i){o+='<tr><td class="n">'+(i+1)+'</td><td>'+icon(r[7])+nm(r[1],r[8],r[0])+qa(r)+'</td><td>'+rc(r[2])+'</td><td class="n">'+r[4]+'</td><td class="n">'+r[3]+'</td><td class="n">'+r[0]+'</td></tr>'});
 o+='</table></div><p class="dim">'+T('Kolejność: najwięcej wygranych bez porażki, potem wyższe MMR. Ta sama osoba może mieć kilka wierszy (po jednym na rasę).','Order: most wins without a loss, then higher MMR. The same person can have several rows (one per race).')+'</p>';
 o+='<p><a href="icons.html">'+T('Wszystkie ikony →','All icons →')+'</a></p>';
 var OM=D.omni||{all:[],modes:{}},omodes=Object.keys(OM.modes);
 if(OM.all.length){var AB={'Human':'HU','Orc':'ORC','Undead':'UD','Night Elf':'NE','Random':'RND'};
  var ok=window._so||'all';if(ok!='all'&&!OM.modes[ok])ok='all';var allv=ok=='all',list=allv?OM.all:OM.modes[ok];
  o+='<h2 id="omni">'+T('Wszędzie w rankingu','Everywhere on the ladder')+'</h2><p class="dim">'+(allv?T('BattleTagi z największą liczbą wpisów we wszystkich rankingach Battle.net razem (1v1, 2v2, 3v3, 4v4, FFA i drużyny zgrane – każda drużyna to jeden wpis; ostatnie pełne skany z odczytanymi tagami).','BattleTags with the most entries in all Battle.net ladders together (1v1, 2v2, 3v3, 4v4, FFA and arranged teams – each team is one entry; latest complete scans with tags read).'):T('BattleTagi z największą liczbą wpisów w rankingu 1v1 (osobny wpis na każdą rasę i bramę; najwyżej 15 = 5 ras × 3 bramy), ostatni pełny skan.','BattleTags with the most entries in the 1v1 ladder (a separate entry per race and gateway; at most 15 = 5 races × 3 gateways), latest complete scan.'))+'</p>';
  o+='<div class="ctl"><label>'+T('Tryb','Mode')+' <select id="om"><option value="all"'+(allv?' selected':'')+'>'+T('wszystkie tryby','all modes')+'</option>'+omodes.map(function(x){return'<option'+(x==ok?' selected':'')+'>'+x+'</option>'}).join('')+'</select></label>'+(omodes.length<5?'<span class="dim">'+T('Tagi odczytane na razie w: ','Tags read so far in: ')+esc(omodes.join(', '))+'</span>':'')+'</div>';
  o+='<div class="tw"><table><tr><th class="n">#</th><th>BattleTag</th><th class="n">'+T('Wpisy','Entries')+'</th><th>'+(allv?T('Tryby','Modes'):T('Rasy','Races'))+'</th><th class="n">'+T('Najlepsze MMR','Best MMR')+'</th>'+(allv?'':'<th class="n">'+T('Najlepsze miejsce','Best rank')+'</th>')+'</tr>';
  list.forEach(function(x,i){var det=allv?Object.keys(x.modes).map(function(k){return esc(k)+'×'+x.modes[k]}).join(', '):D.races.filter(function(r){return x.races[r]}).map(function(r){return '<span class="'+(RC[r]||'')+'" title="'+esc(rn(r))+'">'+AB[r]+'×'+x.races[r]+'</span>'}).join(', ');
   o+='<tr><td class="n">'+(i+1)+'</td><td>'+esc(x.tag)+'</td><td class="n">'+x.n+'</td><td>'+det+'</td><td class="n">'+x.mmr+'</td>'+(allv?'':'<td class="n">'+x.rank+'</td>')+'</tr>'});
  o+='</table></div>'}
 var TR=D.teams_rec||{top:[]};
 if(TR.top.length){
  o+='<h2 id="teams">'+T('W ilu drużynach','How many teams')+'</h2><p class="dim">'+T('BattleTagi grające w największej liczbie różnych drużyn na drabinkach drużyn zgranych (arranged team; 1 drużyna = 1 wiersz rankingu). Liczymy tylko graczy, których tag odczytaliśmy z panelu na pewno. Kont w co najmniej jednej drużynie: ','BattleTags that play in the most different teams on the arranged team ladders (1 team = 1 ladder row). Only players whose tag was read from the panel with certainty count. Accounts in at least one team: ')+TR.n.toLocaleString()+'.</p>';
  o+='<div class="tw"><table><tr><th class="n">#</th><th>BattleTag</th><th class="n">'+T('Drużyny','Teams')+'</th>'+TR.cols.map(function(c){return'<th class="n">'+esc(c)+'</th>'}).join('')+'<th>'+T('Najlepsza drużyna','Best team')+'</th></tr>';
  TR.top.forEach(function(x,i){var b=x.best,bm=D.modes[b[0]],br=bm?bm.top.filter(function(r){return r[0]==b[1]})[0]:null;
   o+='<tr><td class="n">'+(i+1)+'</td><td>'+esc(x.tag)+'</td><td class="n"><b>'+x.n+'</b></td>'+TR.cols.map(function(c){return'<td class="n">'+(x.modes[c]||0)+'</td>'}).join('')+'<td class="small">'+(br?esc(b[0])+' #'+b[1]+' · '+nm(br[1],br[8],br[0])+' · MMR '+b[2]:'')+'</td></tr>'});
  o+='</table></div>'}
 root.innerHTML=o;
 document.getElementById('rm').onchange=function(){st.m=this.value;recordsPage()};var _om=document.getElementById('om');if(_om)_om.onchange=function(){window._so=this.value;recordsPage();var h=document.getElementById('omni');if(h)h.scrollIntoView()};document.getElementById('pr').onchange=function(){window._sp=this.value;recordsPage()};document.getElementById('rg').onchange=function(){st.min=+this.value||1;recordsPage()}}
function ictabs(st){return '<div class="ctl tabs"><button data-v="players" class="'+(st.view!='req'?'on':'')+'">'+T('Ikony graczy','Player icons')+'</button><button data-v="req" class="'+(st.view=='req'?'on':'')+'">'+T('Wymagania ikon','Icon requirements')+'</button></div>'}
function ictabsBind(st){document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){st.view=b.getAttribute('data-v');iconsPage()}})}
function reqPage(st){
 // Saul 2026-11-01: every category and sub-group folds (one click on its heading); quick links + collapse / expand all;
 // what a visitor folded is remembered in this browser only (localStorage, ignored when blocked)
 var root=document.getElementById('app'),o=ictabs(st);
 var cnt={};((D.modes['1v1']||{top:[]}).top).forEach(function(r){if(r[7])cnt[r[7]]=(cnt[r[7]]||0)+1});
 var cats=[['free',T('Darmowe ikony','Free icons')],['wins',T('Wygrane w grach rankingowych','Matchmaking wins')],['tournament',T('Wygrane w turniejach','Tournament wins')],['campaign',T('Ukończenie kampanii','Campaign completion')],['special',T('Ikony specjalne (wymaganie nieznane)','Special icons (requirement not shown)')]];
 var all=Object.keys(D.icons).filter(function(id){return D.icons[id].cat});
 var closed={};try{closed=JSON.parse(localStorage.getItem('rqClosed')||'{}')||{}}catch(e){closed=window._rqc||{}}
 o+='<div class="note">'+T('Co trzeba zrobić, aby odblokować każdą ikonę portretu, pogrupowane w kategorie. Liczba graczy pochodzi z ostatniego skanu 1v1. Kliknij nagłówek, aby zwinąć lub rozwinąć grupę.','What you need to do to unlock each portrait icon, grouped by category. Player counts come from the latest 1v1 scan. Click a heading to fold or unfold a group.')+'</div>';
 o+='<div class="ctl rqnav"><span class="dim">'+T('Przejdź do:','Jump to:')+'</span>'+cats.filter(function(c){return all.some(function(id){return D.icons[id].cat==c[0]})}).map(function(c){
  return '<a href="#rq-'+c[0]+'" data-go="'+c[0]+'">'+c[1]+' <span class="dim">'+all.filter(function(id){return D.icons[id].cat==c[0]}).length+'</span></a>'}).join('')+
  '<span class="rqbtn"><button id="rqc">'+T('Zwiń wszystko','Collapse all')+'</button><button id="rqe">'+T('Rozwiń wszystko','Expand all')+'</button></span></div>';
 function sub(id){var c=D.icons[id];return c.cat=='wins'?rn(c.sub):c.cat=='free'?((c.sec||{})[L]||(c.sec||{}).en||''):''}
 function subKey(id){var c=D.icons[id];return c.cat=='wins'?(c.sub||''):c.cat=='free'?((c.sec||{}).en||''):''}
 cats.forEach(function(c){
  var ids=all.filter(function(id){return D.icons[id].cat==c[0]});if(!ids.length)return;
  o+='<details class="rqcat" id="rq-'+c[0]+'" data-k="'+c[0]+'"'+(closed[c[0]]?'':' open')+'><summary><h2>'+c[1]+' <span class="dim">('+ids.length+')</span></h2></summary>';
  var groups={},order=[];
  ids.forEach(function(id){var s=sub(id);if(!groups[s]){groups[s]=[];order.push(s)}groups[s].push(id)});
  order.forEach(function(s){
   var g=groups[s].sort(function(a,b){return (D.icons[a].n||0)-(D.icons[b].n||0)||iname(a).localeCompare(iname(b))});
   var grid='<div class="rqgrid">'+g.map(function(id){var i=D.icons[id],d=(i.desc||{})[L]||(i.desc||{}).en||T('Wymaganie nie jest podane w grze','Requirement is not shown in the game');
    return '<div class="rq"><img class="big" src="'+(i.big?'icons-large/'+id+'.png':'icons/icon-'+id+'.png')+'" alt="" loading="lazy"><b>'+esc(iname(id))+'</b><span>'+esc(d)+'</span><small>'+T('Graczy w 1v1: ','Players in 1v1: ')+(cnt[id]||0).toLocaleString()+'</small></div>'}).join('')+'</div>';
   if(s){var k=c[0]+'|'+subKey(g[0]);o+='<details class="rqsub" data-k="'+esc(k)+'"'+(closed[k]?'':' open')+'><summary><h3>'+esc(s)+' <span class="dim">('+g.length+')</span></h3></summary>'+grid+'</details>'}
   else o+=grid});
  o+='</details>';
 });
 root.innerHTML=o;ictabsBind(st);
 function save(){window._rqc=closed;try{localStorage.setItem('rqClosed',JSON.stringify(closed))}catch(e){}}
 root.querySelectorAll('details[data-k]').forEach(function(d){d.addEventListener('toggle',function(){if(d.open)delete closed[d.dataset.k];else closed[d.dataset.k]=1;save()})});
 document.getElementById('rqc').onclick=function(){root.querySelectorAll('details[data-k]').forEach(function(d){d.open=false})};
 document.getElementById('rqe').onclick=function(){root.querySelectorAll('details[data-k]').forEach(function(d){d.open=true})};
 root.querySelectorAll('a[data-go]').forEach(function(x){x.onclick=function(e){e.preventDefault();var d=document.getElementById('rq-'+x.dataset.go);if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'})}}});
}
function leagueIcons(m){
 // Icons by league: share of ladder rows in each league that use the icon, and portrait categories by league
 if(!Object.keys(D.leagues).length)return '';
 var rows=m.top.filter(function(r){return r[7]&&r[9]}),lg=Object.keys(D.leagues).sort(),tot={},cnt={},all={};
 rows.forEach(function(r){tot[r[9]]=(tot[r[9]]||0)+1;all[r[7]]=(all[r[7]]||0)+1;var k=r[7]+'|'+r[9];cnt[k]=(cnt[k]||0)+1});
 lg=lg.filter(function(l){return (tot[l]||0)>=30});           // leagues with too few rows are skipped (noise)
 if(lg.length<2)return '';
 var top=Object.keys(all).sort(function(a,b){return all[b]-all[a]}).slice(0,15);
 function heat(p,mx){var a=mx?Math.min(1,p/mx):0;return ' style="background:rgba(231,194,90,'+(a*0.55).toFixed(2)+')"'}
 var o='<h2 id="byleague">'+T('Ikony według ligi','Icons by league')+'</h2><p class="dim">'+T('Udział wierszy rankingu w danej lidze, które używają ikony (%). Ligi z mniej niż 30 wierszami pominięto.','Share of ladder rows in each league that use the icon (%). Leagues with fewer than 30 rows are left out.')+'</p>';
 o+='<div class="tw"><table><tr><th>'+T('Ikona','Icon')+'</th>'+lg.map(function(l){return'<th class="n">'+lgcell(l)+'<br><span class="dim">'+tot[l].toLocaleString()+'</span></th>'}).join('')+'</tr>';
 top.forEach(function(id){var ps=lg.map(function(l){return (cnt[id+'|'+l]||0)/tot[l]*100}),mx=Math.max.apply(null,ps);
  o+='<tr><td>'+icon(id)+esc(iname(id))+'</td>'+ps.map(function(p){return'<td class="n"'+heat(p,mx)+'>'+p.toFixed(1)+'</td>'}).join('')+'</tr>'});
 o+='</table></div>';
 var cats=[['free',T('Darmowe ikony','Free icons')],['wins',T('Wygrane w grach rankingowych','Matchmaking wins')],['tournament',T('Wygrane w turniejach','Tournament wins')],['campaign',T('Ukończenie kampanii','Campaign completion')],['special',T('Ikony specjalne (wymaganie nieznane)','Special icons (requirement not shown)')]];
 var cc={};rows.forEach(function(r){var c=(D.icons[r[7]]||{}).cat;if(!c)return;var k=c+'|'+r[9];cc[k]=(cc[k]||0)+1});
 o+='<h2>'+T('Kategorie portretów według ligi','Portrait categories by league')+'</h2><p class="dim">'+T('Jak zdobyty jest portret, który gracze noszą w danej lidze (% wierszy).','How the portrait that players show in each league was unlocked (% of rows).')+'</p>';
 o+='<div class="tw"><table><tr><th>'+T('Kategoria','Category')+'</th>'+lg.map(function(l){return'<th class="n">'+lgcell(l)+'</th>'}).join('')+'</tr>';
 cats.forEach(function(c){var ps=lg.map(function(l){return (cc[c[0]+'|'+l]||0)/tot[l]*100}),mx=Math.max.apply(null,ps);
  o+='<tr><td>'+c[1]+'</td>'+ps.map(function(p){return'<td class="n"'+heat(p,mx)+'>'+p.toFixed(1)+'</td>'}).join('')+'</tr>'});
 return o+'</table></div>';
}
function iconsPage(){
 var root=document.getElementById('app'),ms=Object.keys(D.modes);
 var st=window._si=window._si||{m:QS.get('mode')||'all',race:QS.get('race')||'',league:QS.get('league')||'',q:QS.get('q')||'',min:+QS.get('min')||0,k:QS.get('sort')||'n',dir:QS.get('dir')=='1'?1:-1,view:QS.get('view')=='req'?'req':'players'};
 if(st.view=='req')return reqPage(st);
 if(!D.modes[st.m]&&st.m!='all')st.m='all';
 var m=st.m=='all'?{date:T('każdego trybu (najnowsze skany)','each mode (latest scans)'),top:[].concat.apply([],Object.keys(D.modes).map(function(k){return D.modes[k].top}))}:D.modes[st.m],hasL=Object.keys(D.leagues).length>0;
 var o=ictabs(st)+'<div class="ctl"><label>'+T('Tryb','Mode')+' <select id="im"><option value="all"'+(st.m=='all'?' selected':'')+'>'+T('wszystkie tryby','all modes')+'</option>'+ms.map(function(x){return'<option'+(x==st.m?' selected':'')+'>'+x+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Rasa','Race')+' <select id="ir"><option value="">'+T('wszystkie','all')+'</option>'+D.races.map(function(r){return'<option value="'+r+'"'+(r==st.race?' selected':'')+'>'+esc(rn(r))+'</option>'}).join('')+'</select></label>';
 if(hasL)o+='<label>'+T('Liga','League')+' <select id="il"><option value="">'+T('wszystkie','all')+'</option>'+Object.keys(D.leagues).map(function(k){return'<option value="'+k+'"'+(k==st.league?' selected':'')+'>'+lgopt(k)+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Szukaj','Search')+' <input id="iq" value="'+esc(st.q)+'" placeholder="'+T('nazwa ikony','icon name')+'"></label>';
 o+='<label>'+T('Min. graczy','Min. players')+' <input id="in" type="number" min="0" value="'+st.min+'" style="width:80px"></label></div>';
 var skipped=m.top.filter(function(r){return !r[7]}).length;      // arranged teams: the ladder shows no icon
 var rows=m.top.filter(function(r){return r[7]&&(!st.race||r[2]==st.race)&&(!st.league||r[9]==st.league)});
 var by={};
 Object.keys(D.icons).forEach(function(id){by[id]={id:id,n:0,s:0,mx:0,nm:{},rc:{}}});   // every known icon is listed, also those nobody uses in this view
 rows.forEach(function(r){var id=r[7]||'?';var e=by[id]=by[id]||{id:id,n:0,s:0,mx:0,nm:{},rc:{}};e.n++;e.s+=r[3];if(r[3]>e.mx)e.mx=r[3];if(r[1])e.nm[r[1].toLowerCase()]=1;e.rc[r[2]]=(e.rc[r[2]]||0)+1});
 var list=Object.keys(by).map(function(id){var e=by[id];e.names=Object.keys(e.nm).length;e.avg=e.n?Math.round(e.s/e.n):0;e.share=rows.length?e.n/rows.length*100:0;e.label=id=='?'?T('(nieznana ikona)','(unknown icon)'):iname(id);return e});
 var q=st.q.toLowerCase();
 list=list.filter(function(e){return e.n>=st.min&&(!q||e.label.toLowerCase().indexOf(q)>=0)});
 var key=function(e){return st.k=='label'?e.label.toLowerCase():st.k.indexOf('r:')==0?(e.rc[st.k.slice(2)]||0):e[st.k]};
 list.sort(function(a,b){var x=key(a),y=key(b);var c=x<y?-1:x>y?1:0;return (c*st.dir)||(b.n-a.n)});
 var cols=[['label',T('Ikona','Icon')],['n',T('Gracze','Players')],['share','%'],['names',T('Różne nazwy','Distinct names')],['avg',T('Średnie MMR','Average MMR')],['mx',T('Najwyższe MMR','Highest MMR')]].concat(D.races.map(function(r){return['r:'+r,rn(r)]}));
 o+='<div class="note">'+T('Skan z ','Scan of ')+esc(m.date)+' · '+rows.length.toLocaleString()+T(' wierszy',' rows')+' · '+list.length+T(' ikon',' icons')+' · '+T('Kliknij nagłówek kolumny, aby sortować.','Click a column header to sort.')+(skipped?' · '+skipped.toLocaleString()+T(' wierszy drużyn (arranged) bez ikony nie jest liczonych',' arranged-team rows without an icon are not counted'):'')+'</div>';
 o+='<div class="tw maintab"><table><tr><th class="n">#</th>'+cols.map(function(c,i){var on=c[0]==st.k;return'<th'+(i?' class="n"':'')+' style="cursor:pointer" data-k="'+c[0]+'">'+esc(c[1])+(on?(st.dir==1?' ▲':' ▼'):'')+'</th>'}).join('')+'</tr>';
 list.forEach(function(e,i){o+='<tr><td class="n">'+(i+1)+'</td><td>'+icon(e.id)+esc(e.label)+'</td><td class="n">'+e.n.toLocaleString()+'</td><td class="n">'+e.share.toFixed(1)+'</td><td class="n">'+e.names.toLocaleString()+'</td><td class="n">'+e.avg+'</td><td class="n">'+e.mx+'</td>'+D.races.map(function(r){return'<td class="n">'+(e.rc[r]||0).toLocaleString()+'</td>'}).join('')+'</tr>'});
 o+='</table></div><p class="dim">'+T('Gracze = wiersze rankingu z tą ikoną; jedna osoba może mieć kilka wierszy (po jednym na rasę). Filtr rasy i ligi zmienia, w jakim gronie liczona jest popularność.','Players = ladder rows that use the icon; one person can have several rows (one per race). The race and league filters change the group in which popularity is counted.')+'</p>';
 o+=leagueIcons(m);
 root.innerHTML=o;ictabsBind(st);
 function rd(){st.m=document.getElementById('im').value;st.race=document.getElementById('ir').value;var l=document.getElementById('il');st.league=l?l.value:'';st.min=+document.getElementById('in').value||0;iconsPage()}
 ['im','ir','il','in'].forEach(function(id){var e=document.getElementById(id);if(e)e.onchange=rd});
 var qi=document.getElementById('iq');qi.oninput=function(){st.q=qi.value;var p=qi.selectionStart;iconsPage();var n=document.getElementById('iq');n.focus();n.setSelectionRange(p,p)};
 document.querySelectorAll('th[data-k]').forEach(function(th){th.onclick=function(){var k=th.getAttribute('data-k');if(st.k==k)st.dir=-st.dir;else{st.k=k;st.dir=k=='label'?1:-1}iconsPage()}});
}
function w3cByLeague(){
 var S=D.w3c_stats||{};if(!S.by_league||!S.by_league.length)return '';
 var o='<h2>'+T('W3Champions według ligi Battle.net','W3Champions by Battle.net league')+'</h2><p class="dim">'+T('Ilu graczy rankingu 1v1 (po BattleTagu, liga z najlepszego wpisu) ma konto na W3Champions i grało w sezonie ','How many 1v1 ladder players (by BattleTag, league of their best entry) have a W3Champions account and played in season ')+S.season+'.</p>';
 o+='<div class="tw"><table class="w3bars"><tr><th>'+T('Liga','League')+'</th><th class="n">'+T('Gracze','Players')+'</th><th>'+T('Konto W3C','W3C account')+'</th><th>'+T('Gra w sezonie ','Plays in season ')+S.season+'</th><th>'+T('Najczęstsze ligi W3C','Most common W3C leagues')+'</th></tr>';
 S.by_league.forEach(function(x){var a=x[2]/x[1]*100,b=x[3]/x[1]*100,cr=(S.cross[x[0]]||[]).map(function(c){return esc(c[0])+' <span class="dim">'+c[1]+'</span>'}).join(', ');
  o+='<tr><td>'+lgcell(x[0])+'</td><td class="n">'+x[1].toLocaleString()+'</td><td><div class="pbar"><span style="width:'+a.toFixed(1)+'%"></span></div>'+a.toFixed(1)+'%</td><td><div class="pbar s"><span style="width:'+b.toFixed(1)+'%"></span></div>'+b.toFixed(1)+'%</td><td class="small">'+cr+'</td></tr>'});
 o+='</table></div>';
 if(S.rho!=null)o+='<p class="note">'+T('Rankingi obu serwisów mocno się zgadzają: korelacja miejsc (Spearman) wynosi ','The two ladders agree strongly: the rank correlation (Spearman) is ')+S.rho.toFixed(2)+T(' dla ',' for ')+S.n.toLocaleString()+T(' graczy grających w obecnym sezonie. Porównujemy tylko kolejność graczy, nie liczby MMR, bo skale są różne.',' players of the current season. Only the order of players is compared, not the MMR numbers, because the scales differ.')+'</p>';
 return o}
function w3c2ByLeague(mode){
 var S=(D.w3c_rt||{})[mode]||{};if(!S.by_league||!S.by_league.length)return '';
 var o='<h2>'+T('W3Champions według ligi Battle.net','W3Champions by Battle.net league')+' · '+esc(mode)+'</h2><p class="dim">'+T('Ilu graczy rankingu ','How many players of the ')+esc(mode)+T(' (po BattleTagu, liga z najlepszego wpisu) grało kiedyś w ten tryb (Random Team) na W3Champions i ilu ma tam konto 1v1.',' ladder (by BattleTag, league of their best entry) have ever played this mode (Random Team) on W3Champions, and how many have a 1v1 account there.')+'</p>';
 o+='<div class="tw"><table class="w3bars"><tr><th>'+T('Liga','League')+'</th><th class="n">'+T('Gracze','Players')+'</th><th>'+T('Konto W3C ','W3C account ')+esc(mode)+'</th><th>'+T('Konto W3C 1v1','W3C 1v1 account')+'</th></tr>';
 S.by_league.forEach(function(x){var a=x[2]/x[1]*100,b=x[3]/x[1]*100;
  o+='<tr><td>'+lgcell(x[0])+'</td><td class="n">'+x[1].toLocaleString()+'</td><td><div class="pbar"><span style="width:'+a.toFixed(1)+'%"></span></div>'+a.toFixed(1)+'%</td><td><div class="pbar s"><span style="width:'+b.toFixed(1)+'%"></span></div>'+b.toFixed(1)+'%</td></tr>'});
 return o+'</table></div>'}
function w3cPage(){
 var st=window._sw=window._sw||{mode:QS.get('mode')||'1v1',q:QS.get('q')||'',league:QS.get('league')||'',race:QS.get('race')||'',cur:QS.get('current')||'',sort:QS.get('sort')||'rank',dir:QS.get('dir')=='-1'?-1:1,shown:100};
 var RT=D.w3c_rt||{};if(st.mode!='1v1'&&!RT[st.mode])st.mode='1v1';
 var two=st.mode!='1v1',root=document.getElementById('app'),W=(two?RT[st.mode]:D.w3c)||{accounts:[],season:null};
 var q=st.q.toLowerCase();
 var keyf={rank:function(a){return a.rank},bmmr:function(a){return a.bmmr},wmmr:function(a){return a.wmmr||0},level:function(a){return a.level||0},season:function(a){return a.season||0},name:function(a){return (a.name||a.tag).toLowerCase()}};
 var list=W.accounts.filter(function(a){
  return (!q||a.tag.toLowerCase().indexOf(q)>=0||(a.name||'').toLowerCase().indexOf(q)>=0)&&(!st.league||a.bleague==st.league)&&(!st.race||a.race==st.race)&&(!st.cur||(st.cur=='1')==!!a.current)});
 var f=keyf[st.sort]||keyf.rank;
 list.sort(function(a,b){var x=f(a),y=f(b);var c=x<y?-1:x>y?1:0;return (c*st.dir)||(a.rank-b.rank)});
 var cur=W.accounts.filter(function(a){return a.current}).length;
 var o=(Object.keys(RT).length?'<div class="ctl tabs">'+['1v1'].concat(Object.keys(RT)).map(function(k){return'<button data-wm="'+k+'" class="'+(k==st.mode?'on':'')+'">'+k+'</button>'}).join('')+'</div>':'');
 if(two)o+='<div class="note">'+T('Gracze z rankingu Battle.net ','Players from the Battle.net ')+esc(st.mode)+T(', którzy kiedykolwiek grali w ten tryb (Random Team) na W3Champions (dowolny sezon), dopasowani dokładnie po BattleTagu. MMR W3Champions to MMR tego trybu z ostatniego sezonu gracza; skale obu serwisów są różne.',' ladder who have ever played this mode (Random Team) on W3Champions (any season), matched exactly by BattleTag. The W3Champions MMR is this mode’s MMR of the player’s last season; the two scales differ.')+(st.mode=='2v2'?' '+T('W3Champions 2v2 Random Team prawie nie jest dziś grane.','W3Champions 2v2 Random Team is hardly played today.'):'')+'</div>';
 else o+='<div class="note">'+T('Gracze z rankingu Battle.net 1v1, którzy kiedykolwiek grali na W3Champions (dowolny sezon), z potwierdzonym BattleTagiem. MMR na W3Champions i MMR na Battle.net mają różne skale (około 1000–3000 kontra do około 6600), więc nie porównuj ich wprost.','Players from the Battle.net 1v1 ladder who have ever played on W3Champions (any season), with a confirmed BattleTag. W3Champions MMR and Battle.net MMR use different scales (about 1000-3000 versus up to about 6600), so do not compare them directly.')+'</div>';
 o+='<div class="cards"><div class="card"><b>'+W.accounts.length.toLocaleString()+'</b><span>'+T('graczy w obu miejscach','players in both')+'</span></div><div class="card"><b>'+cur.toLocaleString()+'</b><span>'+T('grało w sezonie ','played in season ')+W.season+'</span></div></div>';
 if(two){var w1=(W.by_league||[]).reduce(function(s,x){return s+x[3]},0);o=o.replace(/<\/div><\/div>$/,'</div><div class="card"><b>'+w1.toLocaleString()+'</b><span>'+T('graczy tego trybu z kontem W3C 1v1','players of this mode with a W3C 1v1 account')+'</span></div></div>')}
 o+=two?w3c2ByLeague(st.mode):w3cByLeague();
 var sopts=[['rank',T('miejsce w rankingu','ladder rank')],['bmmr',T('MMR Battle.net','Battle.net MMR')],['wmmr',T('MMR W3Champions','W3Champions MMR')],['level',T('poziom','level')],['season',T('ostatni sezon W3C','last W3C season')],['name',T('nazwa','name')]];
 o+='<div class="ctl"><label>'+T('Szukaj','Search')+' <input id="wq" value="'+esc(st.q)+'" placeholder="'+T('nazwa lub BattleTag','name or BattleTag')+'"></label>';
 o+='<label>'+T('Liga','League')+' <select id="wl"><option value="">'+T('wszystkie','all')+'</option>'+Object.keys(D.leagues).map(function(k){return'<option value="'+k+'"'+(k==st.league?' selected':'')+'>'+lgopt(k)+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Rasa','Race')+' <select id="wr"><option value="">'+T('wszystkie','all')+'</option>'+D.races.map(function(r){return'<option value="'+r+'"'+(r==st.race?' selected':'')+'>'+esc(rn(r))+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Sezon ','Season ')+W.season+' <select id="wc"><option value="">'+T('wszystkie','all')+'</option><option value="1"'+(st.cur=='1'?' selected':'')+'>'+T('grał','played')+'</option><option value="0"'+(st.cur=='0'?' selected':'')+'>'+T('nie grał','did not play')+'</option></select></label>';
 o+='<label>'+T('Sortuj','Sort')+' <select id="ws">'+sopts.map(function(x){return'<option value="'+x[0]+'"'+(x[0]==st.sort?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label>';
 o+='<label><select id="wd"><option value="1"'+(st.dir==1?' selected':'')+'>'+T('rosnąco','ascending')+'</option><option value="-1"'+(st.dir==-1?' selected':'')+'>'+T('malejąco','descending')+'</option></select></label><span class="dim">'+list.length.toLocaleString()+T(' graczy',' players')+'</span></div>';
 o+='<div class="tw"><table><tr><th class="n">#</th><th>'+T('Gracz','Player')+'</th><th>'+T('Liga','League')+'</th><th class="n">'+T('Poz.','Lvl')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">'+T('MMR Battle.net','Battle.net MMR')+'</th><th class="n">'+T('MMR W3Champions','W3Champions MMR')+'</th><th>'+T('Ostatni sezon W3C','Last W3C season')+'</th><th>W3Champions</th></tr>';
 list.slice(0,st.shown).forEach(function(a){
  var season=a.season==null?'–':T('sezon ','season ')+a.season+(a.current?T(' (aktualny)',' (current)'):'');
  var sub=[];if(a.wrace)sub.push(rn(a.wrace));if(a.wleague)sub.push(a.wleague+(a.division?' '+a.division:''));
  o+='<tr><td class="n">'+a.rank+'</td><td>'+(a.icon?icon(a.icon):'')+(a.name?esc(a.name):'')+(a.qa?'<span class="qa" title="'+esc(T('odczyt do sprawdzenia','reading to be checked'))+'"></span>':'')+'<br><span class="dim">'+esc(a.tag)+'</span></td><td>'+lgcell(a.bleague)+'</td><td class="n">'+(a.level==null?'<span class="dim">–</span>':a.level)+'</td><td>'+rc(a.race)+'</td><td class="n">'+a.bmmr+'</td><td class="n">'+(a.wmmr==null?'–':a.wmmr)+(sub.length?'<br><span class="dim">'+esc(sub.join(' · '))+'</span>':'')+'</td><td>'+season+'</td><td><a href="https://w3champions.com/player/'+encodeURIComponent(a.tag)+'" target="_blank" rel="noopener noreferrer">'+T('profil','profile')+' ↗</a></td></tr>'});
 o+='</table></div><p class="dim">'+T('Pokazano ','Showing ')+Math.min(st.shown,list.length)+T(' z ',' of ')+list.length.toLocaleString()+(list.length>st.shown?' · <a href="#" id="wmore">'+T('pokaż 200 więcej','show 200 more')+'</a>':'')+'</p>';
 root.innerHTML=o;
 document.querySelectorAll('button[data-wm]').forEach(function(b){b.onclick=function(){st.mode=b.dataset.wm;st.shown=100;st.cur='';w3cPage()}});
 function rd(){st.league=document.getElementById('wl').value;st.race=document.getElementById('wr').value;st.cur=document.getElementById('wc').value;st.sort=document.getElementById('ws').value;st.dir=+document.getElementById('wd').value;st.shown=100;w3cPage()}
 ['wl','wr','wc','ws','wd'].forEach(function(id){document.getElementById(id).onchange=rd});
 var qi=document.getElementById('wq');qi.oninput=function(){st.q=qi.value;st.shown=100;var p=qi.selectionStart;w3cPage();var n=document.getElementById('wq');n.focus();n.setSelectionRange(p,p)};
 var mo=document.getElementById('wmore');if(mo)mo.onclick=function(e){e.preventDefault();st.shown+=200;w3cPage()};
}
function actTable(title,head,list,row){
 if(!list.length)return '';
 return '<h2>'+title+'</h2><div class="tw"><table><tr>'+head+'</tr>'+list.map(row).join('')+'</table></div>'}
var LOC={pl:'pl-PL',en:'en-GB',zh:'zh-CN',de:'de-DE'};
var Z12=('US/,Canada/,Australia/,NZ,America/New_York,America/Detroit,America/Chicago,America/Denver,America/Boise,America/Phoenix,'+
 'America/Los_Angeles,America/Anchorage,America/Juneau,America/Sitka,America/Metlakatla,America/Yakutat,America/Nome,America/Adak,'+
 'America/Menominee,America/Indiana,America/Kentucky,America/North_Dakota,America/Indianapolis,America/Louisville,America/Fort_Wayne,'+
 'America/Puerto_Rico,America/Toronto,America/Vancouver,America/Edmonton,America/Winnipeg,America/Halifax,America/St_Johns,America/Regina,'+
 'America/Moncton,America/Glace_Bay,America/Goose_Bay,America/Whitehorse,America/Dawson,America/Dawson_Creek,America/Iqaluit,'+
 'America/Rankin_Inlet,America/Resolute,America/Cambridge_Bay,America/Inuvik,America/Swift_Current,America/Fort_Nelson,America/Creston,'+
 'America/Atikokan,America/Montreal,America/Thunder_Bay,America/Nipigon,America/Rainy_River,America/Yellowknife,America/Pangnirtung,'+
 'Pacific/Honolulu,Pacific/Auckland,Pacific/Chatham,Asia/Kolkata,Asia/Calcutta,Asia/Manila,Asia/Karachi,Asia/Dhaka,Asia/Riyadh,Africa/Cairo').split(',');
function tzName(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return ''}}
function clock12(){var z=tzName();return Z12.some(function(p){return p.slice(-1)=='/'?z.indexOf(p)==0:(z==p||z.indexOf(p+'/')==0)})}
function locFor(){return L=='en'?(clock12()?'en-US':'en-GB'):(LOC[L]||'en-GB')}
function whenTs(ts){var b=new Date(ts*1000),loc=locFor(),h12=loc=='en-US';
 return b.toLocaleDateString(loc,{day:'numeric',month:'short',year:'numeric'})+', '+b.toLocaleTimeString(loc,{hour:h12?'numeric':'2-digit',minute:'2-digit'})}
function scanWhen(w,d){return w?whenTs(w[1]):esc(d)}
function agoText(t){
 var m=Math.max(0,Math.floor((Date.now()/1000-t)/60)),d=Math.floor(m/1440),h=Math.floor(m%1440/60);
 return (d?d+' '+T('d','d')+' ':'')+((d||h)?h+' '+T('godz.','h')+' ':'')+(m%60)+' '+T('min','min')}
function inText(t){var m=Math.ceil((t-Date.now()/1000)/60);if(m<=0)return T('trwa lub wkrótce','running or soon');var d=Math.floor(m/1440),h=Math.floor(m%1440/60);
 return T('za ','in ')+(d?d+' '+T('d','d')+' ':'')+((d||h)?h+' '+T('godz.','h')+' ':'')+(m%60)+' '+T('min','min')}
function tickAgo(){var e=document.getElementById('ago');if(e)e.textContent=agoText(+e.dataset.t);var n=document.getElementById('nxt');if(n)n.textContent=inText(+n.dataset.t)}
function activityPage(){
 var root=document.getElementById('app'),ms=Object.keys(D.activity);
 if(!ms.length){root.innerHTML='<div class="note">'+T('Jest dopiero jeden skan rankingu (','There is only one ladder scan so far (')+esc(D.modes['1v1']?D.modes['1v1'].date:'')+T('), więc nie ma jeszcze z czym porównywać. Ta strona wypełni się po drugim skanie: kto zagrał najwięcej gier, największe skoki MMR, nowi i wypadli z rankingu.','), so there is nothing to compare yet. This page fills in after the second scan: most games played, biggest MMR jumps, newcomers and players who dropped out.')+'</div>';return}
 var st=window._sa=window._sa||{m:D.activity[QS.get('mode')]?QS.get('mode'):ms[0],w:QS.get('w')||'new'};if(!D.activity[st.m])st.m=ms[0];
 var a0=D.activity[st.m],ALT=a0.alt||{};if(!st.w||(st.w!='new'&&!ALT[st.w]))st.w='new';var a=st.w=='new'?a0:ALT[st.w];
 st.ws=st.ws||{};
 function win(sec){var w=st.ws[sec]||st.w;if(w!='new'&&!ALT[w])w='new';return {w:w,a:w=='new'?a0:ALT[w]}}
 function dd(x){return x?x.slice(8,10)+'.'+x.slice(5,7):''}
 function segFor(sec){if(!(ALT.old||ALT.both))return '';var W=win(sec);
  return ' <span class="mseg">'+[['new',T('Najnowsze','Latest')],['old',T('Poprzednie','Previous')],['both',T('Oba razem','Both')]].filter(function(x){return x[0]=='new'||ALT[x[0]]}).map(function(x){
   return '<button data-sw="'+sec+'|'+x[0]+'" class="'+(W.w==x[0]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</span><span class="mdates">'+dd(W.a.from)+' → '+dd(W.a.to)+'</span>'}
 var o='<div class="ctl"><label class="col">'+T('Tryb','Mode')+' <select id="am">'+ms.map(function(m){return'<option'+(m==st.m?' selected':'')+'>'+m+'</option>'}).join('')+'</select></label>';
 if(ALT.old||ALT.both)o+='<div class="wsel"><span>'+T('Okno','Window')+'</span><div class="seg">'+[['new',T('Najnowsze','Latest')],['old',T('Poprzednie','Previous')],['both',T('Oba razem','Both')]].filter(function(x){return x[0]=='new'||ALT[x[0]]}).map(function(x){
  return'<button data-w="'+x[0]+'" class="'+(st.w==x[0]?'on':'')+'">'+x[1]+'</button>'}).join('')+'</div></div>';
 var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}
 o+='<div class="scant" title="'+T('Czas Twojej strefy','Your local time')+(tz?' ('+esc(tz)+')':'')+'"><div><span class="dim">'+(st.w=='new'?T('Poprzedni skan','Previous scan'):T('Początek okna','Window start'))+'</span><b>'+scanWhen(a.t0,a.from)+'</b></div>'+
  '<div><span class="dim">'+(st.w=='new'?T('Aktualny skan','Current scan'):T('Koniec okna','Window end'))+'</span><b>'+scanWhen(a.t1,a.to)+'</b></div>'+
  (a.t1&&st.w=='new'?'<div><span class="dim">'+T('Od aktualnego skanu minęło','Time since the current scan')+'</span><b id="ago" data-t="'+a.t1[1]+'">'+agoText(a.t1[1])+'</b></div>':'')+
  (st.w!='new'&&a.sum&&a.sum.hours?'<div><span class="dim">'+T('Długość okna','Window length')+'</span><b>'+(Math.floor(a.sum.hours/24)?Math.floor(a.sum.hours/24)+' '+T('d','d')+' ':'')+Math.round(a.sum.hours%24)+' '+T('godz.','h')+'</b></div>':'')+
  (a.next?'<div title="'+scanWhen([a.next,a.next],'')+'"><span class="dim">'+T('Następny skan','Next scan')+'</span><b id="nxt" data-t="'+a.next+'">'+inText(a.next)+'</b></div>':'')+
  '</div></div>';
 var AN=win('num').a,S=AN.sum||{},nf=function(x){return Math.round(x).toLocaleString()},TM=st.m.indexOf('arranged')>=0,KEY=AN.match=='key',MIX=AN.match=='mixed';
 var day=function(g){return S.hours>0?g/S.hours*24:null};
 if(S.games!=null){
  var hh=S.hours.toFixed(1)+' h',per=Math.round(S.pg/S.games);
  o+='<details class="help"><summary><h2>'+T('Liczba gier','Number of games')+'</h2><span class="q" title="'+T('Jak liczymy?','How is this counted?')+'">?</span>'+segFor('num')+'</summary><div class="helpbox">'+
   '<p><b>Battle.net.</b> '+(MIX?T('Przy każdym skanie odczytujemy cały ranking z gry (każdą stronę: zrzut ekranu i rozpoznawanie tekstu). Gracze są łączeni po BattleTagu, a gdy w którymś skanie wiersz nie ma tagu – po nicku i rasie (tylko jednoznaczne dopasowania). Dla tych par (','At every scan we read the whole in-game ladder (every page: screenshot and text recognition). Players are joined by BattleTag, and when a row has no tag in one of the scans – by name and race (unique matches only). For these pairs ('):KEY?T('Przy każdym skanie odczytujemy cały ranking z gry (każdą stronę: zrzut ekranu i rozpoznawanie tekstu). Starszy skan nie ma BattleTagów, więc wiersze łączymy po nicku i rasie (drużyny po składzie), tylko gdy dopasowanie jest jednoznaczne. Dla tych par (','At every scan we read the whole in-game ladder (every page: screenshot and text recognition). The older scan has no BattleTags, so rows are joined by name and race (teams by their line-up), only when the match is unambiguous. For these pairs ('):T('Przy każdym skanie odczytujemy cały ranking z gry (każdą stronę: zrzut ekranu i rozpoznawanie tekstu). Dla graczy rozpoznanych po BattleTagu w obu skanach (','At every scan we read the whole in-game ladder (every page: screenshot and text recognition). For the players recognised by BattleTag in both scans ('))+nf(S.pairs)+T(') sumujemy nowe wygrane i przegrane: ',') we add up the new wins and losses: ')+nf(S.pg)+(TM?T('. W jednej grze grają dwie drużyny: ','. Teams taking part in one game: '):T('. W jednej grze bierze udział tylu graczy: ','. Players taking part in one game: '))+per+' → ≈ '+nf(S.games)+'. '+T('To szacunek – części przeciwników nie rozpoznajemy.','This is an estimate – some opponents are not recognised.')+'</p>'+
   (S.w3c_games!=null?'<p><b>W3Champions.</b> '+T('Ich publiczne statystyki podają liczbę gier na każdą dobę (czas UTC). Z każdej doby bierzemy tylko tę część, która mieści się między końcami dwóch skanów (',
   'Their public statistics give the number of games for every day (UTC time). From every day we take only the part that falls between the ends of the two scans (')+hh+T('), zakładając, że gry rozkładają się równo w ciągu doby → ≈ ','), assuming games are spread evenly over the day → ≈ ')+nf(S.w3c_games)+'.</p>':'')+
   (S.summed?'<p>'+T('Oba okna razem: gry, wygrane i przegrane to suma obu okien (bezpośrednie porównanie pierwszego i ostatniego skanu rozpoznaje mniej graczy, gdy pierwszy skan nie ma BattleTagów).','Both windows together: games, wins and losses are the sum of the two windows (a direct comparison of the first and the last scan recognises fewer players when the first scan has no BattleTags).')+'</p>':'')+
   '<p>'+T('„Na dobę” i „na godzinę”: obie liczby dzielimy przez ten sam czas między skanami (','“Per day” and “per hour”: both numbers are divided by the same time between the scans (')+hh+').</p></div></details><div class="cards act">';
  o+='<div class="card svc"><img src="assets/bnet.png" alt="Battle.net" title="Battle.net"><div><b>≈ '+nf(S.games)+'</b><em class="unit">'+T('gier – każda gra liczona raz','games – each game counted once')+'</em><em>≈ '+nf(day(S.games))+' '+T('na dobę','per day')+' · ≈ '+nf(S.games/S.hours)+' '+T('na godzinę','per hour')+'</em></div></div>';
  if(S.w3c_games!=null){
   o+='<div class="card svc"><img src="assets/w3c.png" alt="W3Champions" title="W3Champions"><div><b>≈ '+nf(S.w3c_games)+'</b><em class="unit">'+T('gier – każda gra liczona raz','games – each game counted once')+'</em><em>≈ '+nf(day(S.w3c_games))+' '+T('na dobę','per day')+' · ≈ '+nf(S.w3c_games/S.hours)+' '+T('na godzinę','per hour')+'</em></div></div>';
   if(S.w3c_games>0)o+='<div class="card svc ratio"><span class="eclipse"><img class="big" src="assets/bnet.png" alt="Battle.net" title="Battle.net"><img class="moon" src="assets/w3c.png" alt="W3Champions" title="W3Champions" style="width:'+Math.max(6,72/Math.max(1,S.games/S.w3c_games)).toFixed(1)+'px;height:'+Math.max(6,72/Math.max(1,S.games/S.w3c_games)).toFixed(1)+'px"></span><div><b>× '+(S.games/S.w3c_games>=100?nf(S.games/S.w3c_games):(S.games/S.w3c_games).toFixed(1))+'</b><em>'+T('tyle razy więcej gier na Battle.net','times more games on Battle.net')+'<br>'+(S.games/(S.games+S.w3c_games)*100).toFixed(0)+'% '+T('wszystkich gier obu serwisów','of all games of both services')+'</em></div></div>'}
  o+='</div>'}
 o+='<h2>'+(TM?T('Drużyny','Teams'):T('Gracze','Players'))+'</h2><div class="cards act">';
 if(S.pairs)o+='<div class="card"><b>'+nf(S.active)+' <small>'+(S.active/S.pairs*100).toFixed(0)+'%</small></b><span>'+(TM?T('aktywnych drużyn (min. 1 gra)','active teams (1+ game)'):T('aktywnych graczy (min. 1 gra)','active players (1+ game)'))+'</span></div>';
 o+='<div class="card"><b>'+nf(AN.new_n)+'</b><span>'+(TM?T('nowe drużyny w rankingu','new teams in the ladder'):T('nowi w rankingu','new in the ladder'))+'</span></div>';
 if(S.pairs)o+='<div class="card"><b><i class="up">▲ '+nf(S.up)+'</i> <i class="down">▼ '+nf(S.down)+'</i></b><span>'+T('awanse / spadki ligi','league promotions / demotions')+'</span></div>';
 o+='</div>';
 if(S.races&&S.races.length){var tot=S.races.reduce(function(x,y){return x+y[1]},0);
  var rs=S.races.slice().sort(function(x,y){return y[1]-x[1]});
  o+='<h2>'+T('Gry według ras','Games by race')+'</h2><div class="rbar">'+rs.map(function(x){return'<span style="width:'+(x[1]/tot*100).toFixed(2)+'%;background:var(--'+RC[x[0]]+')" title="'+esc(rn(x[0]))+'"></span>'}).join('')+'</div>';
  o+='<div class="rleg">'+rs.map(function(x){return'<span><i style="background:var(--'+RC[x[0]]+')"></i>'+esc(rn(x[0]))+' <b>'+(x[1]/tot*100).toFixed(0)+'%</b> <span class="dim">'+nf(x[1])+'</span></span>'}).join('')+'</div>'}
 if(S.pairs)o+='<p class="dim small">'+(TM?T('Drużyny: ','Teams: ')+nf(S.pairs)+T(' drużyn znalezionych w obu skanach po składzie (starszy skan nie ma BattleTagów).',' teams found in both scans by their line-up (the older scan has no BattleTags).'):
  MIX?T('Gracze i rasy: ','Players and races: ')+nf(S.pairs)+T(' graczy znalezionych w obu skanach po BattleTagu albo (bez tagu) po nicku i rasie; gry ras liczone po stronie każdego gracza.',' players found in both scans by BattleTag or (without a tag) by name and race; games by race are counted on each player’s side.'):
  KEY?T('Gracze i rasy: ','Players and races: ')+nf(S.pairs)+T(' graczy znalezionych w obu skanach po nicku i rasie (starszy skan nie ma BattleTagów); gry ras liczone po stronie każdego gracza.',' players found in both scans by name and race (the older scan has no BattleTags); games by race are counted on each player’s side.'):
  T('Gracze i rasy: ','Players and races: ')+nf(S.pairs)+T(' graczy rozpoznanych po BattleTagu w obu skanach; gry ras liczone po stronie każdego gracza.',' players recognised by BattleTag in both scans; games by race are counted on each player’s side.'))+'</p>';
 // Saul 2026-10-31: the three tables share ONE column layout, in the order of the Ranking page, so readers get used to it;
 // the column a table is about is highlighted (Most games: Games, Biggest MMR changes: Change, New: MMR). Wins, losses, games,
 // % and change come only from the time between the two scans; rank, league, level and MMR from the current scan. Click sorts.
 var pct=function(w,l){return w==null||l==null||!(w+l)?null:w/(w+l)*100},dash='<span class="dim">–</span>';
 function lgc(id){return id?lgcell(id):dash}
 function pairRow(r){return {rank:r[10],name:r[0],icon:r[5],lg:r[9],lvl:r[11],race:r[1],mmr:r[4],chg:r[3]==null?null:r[4]-r[3],w:r[6],l:r[7],
  pro:typeof r[12]=='string'?r[12]:null,br:Array.isArray(r[12])?r[12]:(Array.isArray(r[13])?r[13]:null)}}
 function raceCell(o){if(o.race!='Multiple')return rc(o.race);var t=T('gry (zmiana MMR): ','games (MMR change): ')+(o.br||[]).map(function(x){return rn(x[0])+' '+x[1]+' ('+(x[2]>0?'+':'')+x[2]+')'}).join(' · ');
  return '<span class="multi" title="'+esc(t)+'">'+T('Wiele ras','Several races')+' <span class="dim">('+(o.br||[]).length+')</span></span>'}
 function newRow(r){return {rank:r[8],name:r[0],icon:r[3],lg:r[6],lvl:r[7],race:r[1],mmr:r[2],chg:null,w:r[4],l:r[5]}}
 var COLS=[
  {k:'rank',h:'#',n:1,v:function(o){return o.rank},td:function(o){return o.rank==null?dash:o.rank}},
  {k:'name',h:st.m.indexOf('arranged')>=0?T('Drużyna','Team'):T('Gracz','Player'),v:function(o){return (o.name||'').toLowerCase()},td:function(o){return icon(o.icon)+nm(o.name)}},
  {k:'lg',h:T('Liga','League'),hi:1,v:function(o){return o.lg||null},td:function(o){return lgc(o.lg)}},
  {k:'lvl',h:T('Poz.','Lvl'),n:1,v:function(o){return o.lvl},td:function(o){return o.lvl==null?dash:o.lvl}},
  {k:'race',h:T('Rasa','Race'),v:function(o){return o.race=='Multiple'?T('Wiele ras','Several races'):rn(o.race)},td:raceCell},
  {k:'mmr',h:'MMR',n:1,v:function(o){return o.mmr},td:function(o){return o.mmr}},
  {k:'chg',h:T('Zmiana','Change'),n:1,v:function(o){return o.chg},td:function(o){return o.chg==null?dash:sgn(o.chg)}},
  {k:'w',h:T('Wygr.','Wins'),n:1,v:function(o){return o.w},td:function(o){return o.w==null?dash:'<span class="up">'+o.w+'</span>'}},
  {k:'l',h:T('Przegr.','Losses'),n:1,v:function(o){return o.l},td:function(o){return o.l==null?dash:'<span class="down">'+o.l+'</span>'}},
  {k:'g',h:T('Gry','Games'),n:1,v:function(o){return o.w==null||o.l==null?null:o.w+o.l},td:function(o){return o.w==null||o.l==null?dash:o.w+o.l}},
  {k:'p',h:'%',n:1,v:function(o){return pct(o.w,o.l)},td:function(o){var p=pct(o.w,o.l);return p==null?dash:Math.round(p)}}];
 var KCOLS=[{k:'nick',h:T('Znany jako','Known as'),v:function(o){return (o.pro||'').toLowerCase()},td:function(o){return '<b>'+esc(o.pro||'')+'</b>'}}].concat(COLS);
 st.sort=st.sort||{};
 st.more=st.more||{};
 function sTable(id,title,key,list,sub,empty,cols,lim){
  var COLS_=cols||COLS;
  if(!list.length)return empty?'<h2>'+title+'</h2>'+(sub?'<p class="dim small">'+sub+'</p>':'')+'<div class="note">'+empty+'</div>':'';
  var kc=COLS_.map(function(c){return c.k}).indexOf(key),s=st.sort[id],rows=list.slice();
  if(s){var c=COLS_[s.c];rows.sort(function(a,b){var x=c.v(a),y=c.v(b);if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return -1;
   var r=typeof x=='string'?x.localeCompare(y):x-y;return s.d?-r:r})}       // no click yet: the table keeps its own order (by its key column)
  var on=s?s.c:kc,dn=s?s.d:1;
  function cls(k,n){return 'c-'+k.k+(k.n?' n':'')+(n==kc?' key':'')}
  return '<h2>'+title+'</h2>'+(sub?'<p class="dim small">'+sub+'</p>':'')+'<div class="tw"><table class="srt" data-kc="'+kc+'"><tr>'+COLS_.map(function(k,n){
   return'<th data-st="'+id+'" data-c="'+n+'" data-n="'+(k.n||k.hi?1:0)+'" class="'+cls(k,n)+'">'+k.h+(n==on?' <span class="sa">'+(dn?'▼':'▲')+'</span>':'')+'</th>'}).join('')+'</tr>'+
   rows.slice(0,lim&&!st.more[id]?lim:rows.length).map(function(o){return'<tr>'+COLS_.map(function(k,n){return'<td class="'+cls(k,n)+'">'+k.td(o)+'</td>'}).join('')+'</tr>'}).join('')+
   (lim&&rows.length>lim?'<tr class="morerow"><td colspan="'+COLS_.length+'"><a href="#" data-more="'+id+'">'+
    (st.more[id]?'▲ '+T('Zwiń','Collapse')+' ▲':'▼ '+T('Pokaż wszystkie','Show all')+' ('+rows.length+') ▼')+'</a></td></tr>':'')+'</table></div>'}
 o+=sTable('g',T('Najwięcej rozegranych gier','Most games played')+segFor('g'),'g',win('g').a.games.filter(function(r){return r[2]>0}).map(pairRow),null,null,null,10);
 o+=sTable('j',T('Największe zmiany MMR','Biggest MMR changes')+segFor('j'),'chg',win('j').a.jumps.map(pairRow),(st.m.indexOf('arranged')>=0?T('Drużyny, które przed oknem miały co najmniej 25 gier – nowe drużyny w kalibracji zmieniają MMR nawet o 300 na grę.','Teams with at least 25 games before the window – new teams in placement move up to 300 MMR per game.'):T('Gracze, którzy przed oknem mieli co najmniej 25 gier – nowe konta w kalibracji zmieniają MMR nawet o 300 na grę.','Players with at least 25 games before the window – new accounts in placement move up to 300 MMR per game.')),null,null,10);
 o+=sTable('n',(st.m.indexOf('arranged')>=0?T('Nowe drużyny w rankingu','New teams in the ladder'):T('Nowi w rankingu','New in the ladder'))+segFor('n'),'mmr',win('n').a.new.map(newRow),null,null,null,10);
 o+='<p class="dim">'+(a.match=='tag'?T('Wygrane, przegrane, gry, % i zmiana MMR dotyczą tylko czasu między dwoma skanami; miejsce, liga, poziom i MMR pochodzą z aktualnego skanu. Nowi gracze nie mają poprzedniego skanu, więc pokazujemy ich cały bilans. Gracze dopasowani po BattleTagu; wartości odczytywane przez OCR, pojedyncze mogą być błędne.','Wins, losses, games, % and MMR change cover only the time between the two scans; rank, league, level and MMR come from the current scan. New players have no previous scan, so their whole record is shown. Players are matched by BattleTag; values are read by OCR, single ones may be wrong.'):
  T('Wygrane, przegrane, gry, % i zmiana MMR dotyczą tylko czasu między dwoma skanami; miejsce, liga, poziom i MMR pochodzą z aktualnego skanu. Nowi gracze nie mają poprzedniego skanu, więc pokazujemy ich cały bilans. Gracze dopasowani po BattleTagu, a bez tagu po nicku i rasie (drużyny po składzie); wartości odczytywane przez OCR, pojedyncze mogą być błędne.','Wins, losses, games, % and MMR change cover only the time between the two scans; rank, league, level and MMR come from the current scan. New players have no previous scan, so their whole record is shown. Players are matched by BattleTag, and without a tag by name and race (teams by their line-up); values are read by OCR, single ones may be wrong.'))+'</p>';
 var K=D.known||{pro:[],famous:[]};
 function inLadder(g){var seen={},out=[];(a[g]||[]).forEach(function(r){if(!seen[r[12]]){seen[r[12]]=1;out.push(esc(r[12]))}});return out}
 function played(rows){return rows.map(pairRow).filter(function(x){return x.w!=null&&x.w+x.l>0}).sort(function(a,b){return (b.w+b.l)-(a.w+a.l)||b.mmr-a.mmr})}
 if(K.pro.length)o+=sTable('p',T('Aktywność zawodowców','Pro players activity')+segFor('p'),'g',played(win('p').a.pro||[]),
  T('Najlepsza ','Top ')+(K.top||K.pro.length)+T(' rankingu Elo warcraft3.info',' of the warcraft3.info Elo ranking')+(K.date?' ('+esc(K.date)+')':'')+'. '+T('Konto w tym rankingu ma ','Accounts in this ladder: ')+inLadder('pro').length+T(' z nich',' of them')+(inLadder('pro').length?': '+inLadder('pro').join(', '):'')+'. '+T('Większość zawodowców gra głównie na W3Champions.','Most pros play mainly on W3Champions.'),
  T('Nikt z zawodowców nie grał na Battle.net między skanami.','Nobody from the pro players played on Battle.net between the scans.'),KCOLS);
 if(K.famous.length)o+=sTable('f',T('Aktywność znanych graczy','Famous players activity')+segFor('f'),'g',played(win('f').a.famous||[]),
  T('Znani gracze spoza listy zawodowców (streamerzy, osobistości, dawni zawodowcy) – lista ','Well-known players outside the pro list (streamers, personalities, former pros) – a list of ')+K.famous.length+T(' osób. Konto w tym rankingu ma ',' people. Accounts in this ladder: ')+inLadder('famous').length+(inLadder('famous').length?': '+inLadder('famous').join(', '):'')+'.',
  T('Nikt ze znanych graczy nie grał na Battle.net między skanami.','Nobody from the famous players played on Battle.net between the scans.'),KCOLS);
 var MA=D.most_active;
 if(MA&&MA.rows&&MA.rows.length){
  var MCOLS=[
   {k:'rank',h:'#',n:1,v:function(o){return o.rank},td:function(o){return o.rank}},
   {k:'name',h:T('Gracz','Player'),v:function(o){return (o.name||'').toLowerCase()},td:function(o){return icon(o.icon)+nm(o.name)}},
   {k:'lg',h:T('Liga','League'),v:function(o){return o.lg||null},td:function(o){return lgc(o.lg)}},
   {k:'modes',h:T('Tryby','Modes'),v:function(o){return o.br.length},td:function(o){return o.br.map(function(x){return esc(x[0])+' <b>'+x[1]+'</b>'}).join(' · ')}},
   {k:'g',h:T('Gry','Games'),n:1,v:function(o){return o.g},td:function(o){return o.g}},
   {k:'pd',h:T('Gier na dobę','Games per day'),n:1,v:function(o){return o.pd},td:function(o){return o.pd.toFixed(1)}}];
  o+=sTable('m',T('Najbardziej aktywni na Battle.net – wszystkie tryby','Most active on Battle.net – all modes'),'pd',
   MA.rows.map(function(r,i){return {rank:i+1,name:r[0],icon:r[1],lg:r[2],g:r[3],pd:r[4],br:r[5]}}),
   T('Gry gracza (BattleTag) ze wszystkich trybów i ras razem, z najnowszego okna każdego trybu: ','A player’s (BattleTag) games of all modes and races together, from the latest window of every mode: ')+
   MA.windows.map(function(w){return esc(w[0])+' '+dd(w[1])+' → '+dd(w[2])+(w[3]?' ('+Math.round(w[3])+' h)':'')}).join(', ')+'. '+
   T('Gier na dobę = suma po trybach (gry w trybie / liczba dni okna trybu). Liczby z bazy Player Database; ta tabela nie zależy od przełączników powyżej.','Games per day = sum over the modes (games in the mode / days of the mode’s window). Numbers from the Player Database; this table does not follow the switches above.'),
   null,MCOLS,10);
 }
 root.innerHTML=o;document.getElementById('am').onchange=function(){st.m=this.value;st.w='new';st.ws={};activityPage()};
 document.querySelectorAll('button[data-w]').forEach(function(b){b.onclick=function(){st.w=b.dataset.w;st.ws={};var y=window.scrollY;activityPage();window.scrollTo(0,y)}});
 document.querySelectorAll('button[data-sw]').forEach(function(b){b.onclick=function(e){e.preventDefault();e.stopPropagation();var x=b.dataset.sw.split('|');st.ws[x[0]]=x[1];var y=window.scrollY;activityPage();window.scrollTo(0,y)}});
 document.querySelectorAll('a[data-more]').forEach(function(x){x.onclick=function(e){e.preventDefault();var id=x.dataset.more,was=st.more[id];st.more[id]=!was;var y=window.scrollY;activityPage();window.scrollTo({top:y,behavior:'instant'});
  if(was){var a=document.querySelector('a[data-more="'+id+'"]');if(a){var b=a.getBoundingClientRect();if(b.top<0||b.bottom>window.innerHeight)a.scrollIntoView({block:'center',behavior:'instant'})}}}});
 document.querySelectorAll('th[data-st]').forEach(function(h){h.onclick=function(){var id=h.dataset.st,c=+h.dataset.c,cur=st.sort[id]||{c:+h.parentNode.parentNode.parentNode.dataset.kc,d:1};st.sort[id]={c:c,d:cur&&cur.c==c?(cur.d?0:1):+h.dataset.n};var y=window.scrollY;activityPage();window.scrollTo(0,y)}});
 if(!window._agoT)window._agoT=setInterval(tickAgo,20000)}
function homePage(){
 var m=D.modes['1v1'],rc_=m.races,o='<div class="cards">';
 o+='<div class="card"><b>'+m.rows.toLocaleString()+'</b><span>'+T('wierszy rankingu 1v1','1v1 ladder rows')+'</span></div>';
 o+='<div class="card"><b>'+m.mmr_max+'</b><span>'+T('najwyższe MMR (1v1)','highest MMR (1v1)')+'</span></div>';
 o+='<div class="card"><b>'+m.mmr_median+'</b><span>'+T('mediana MMR','median MMR')+'</span></div>';
 o+='<div class="card"><b>'+m.date+'</b><span>'+T('data skanu','scan date')+'</span></div></div>';
 o+='<h2>'+T('Podział ras (1v1)','Race split (1v1)')+'</h2><div class="cards">';
 D.races.forEach(function(r){var n=rc_[r]||0;o+='<div class="card"><b class="'+RC[r]+'">'+Math.round(n/m.rows*100)+'%</b><span>'+esc(rn(r))+' · '+n.toLocaleString()+'</span></div>'});
 o+='</div><h2>'+T('Top 10 według MMR (1v1)','Top 10 by MMR (1v1)')+'</h2><div class="tw"><table><tr><th class="n">'+T('Miejsce','Ladder rank')+'</th><th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th></tr>';
 m.top.slice().sort(function(a,b){return b[3]-a[3]||a[0]-b[0]}).slice(0,10).forEach(function(r){o+='<tr><td class="n">'+r[0]+'</td><td>'+icon(r[7])+nm(r[1],r[8],r[0])+qa(r)+'</td><td>'+rc(r[2])+'</td><td class="n">'+r[3]+'</td></tr>'});
 o+='</table></div>';
 o+='<h2>'+T('Wszystkie drabinki','All ladders')+'</h2><div class="tw"><table><tr><th>'+T('Tryb','Mode')+'</th><th class="n">'+T('Miejsc w rankingu','Ladder places')+'</th><th class="n">'+T('Graczy na stronie','Players on the site')+'</th><th>'+T('Skan','Scan')+'</th></tr>';
 Object.keys(D.modes).forEach(function(k){var x=D.modes[k];
  o+='<tr><td><a href="ranking.html?mode='+encodeURIComponent(k)+'">'+esc(k)+'</a></td><td class="n">'+(x.size?x.size.toLocaleString():'<span class="dim">≥ '+x.rows.toLocaleString()+'</span>')+'</td><td class="n">'+x.rows.toLocaleString()+'</td><td>'+esc(x.date)+(x.partial?' · <b class="down">'+T('skan niepełny','incomplete scan')+'</b>':'')+'</td></tr>'});
 o+='</table></div><p class="dim small">'+T('Miejsca w rankingu = ostatnia ranga pełnego skanu. Na stronie jest trochę mniej graczy, bo ukrywamy wiersze odczytane dwa razy (gracz przesunął się w trakcie skanu) i puste wiersze bez gracza.','Ladder places = the last rank of a complete scan. The site shows slightly fewer players because rows read twice (a player moved during the scan) and empty rows without a player are hidden.')+'</p>';
 document.getElementById('app').innerHTML=o}
function builtText(){return D.built_ts?whenTs(D.built_ts):D.built}
function aboutPage(){document.getElementById('built').textContent=builtText();document.getElementById('patch').textContent=D.patch;document.getElementById('scand').textContent=(D.modes['1v1']||{}).date||''}
function render(){
 chrome();var p=document.body.dataset.page;
 if(p=='home')homePage();else if(p=='ranking')rankingPage();else if(p=='records')recordsPage();else if(p=='icons')iconsPage();else if(p=='w3c')w3cPage();else if(p=='activity')activityPage();else if(p=='about')aboutPage();
 var f=document.getElementById('foot');if(f)f.textContent=T('Dane: ranking gry Warcraft III · aktualizacja ','Data: Warcraft III in-game ladder · updated ')+builtText()}
document.querySelectorAll('.lang button[data-l]').forEach(function(b){b.onclick=function(){setLang(b.dataset.l)}});

(function(){
 var app=document.getElementById('app');if(!app)return;
 if(window._fopen===undefined)window._fopen=false;
 function deco(){
  var ctls=app.querySelectorAll(':scope > .ctl:not(.tabs):not(.dec)');
  var bar=app.querySelector(':scope > .mbar');
  ctls.forEach(function(c,i){
   c.classList.add('dec');
   if(c.querySelectorAll('select,input').length<3){c.classList.add('few');return}
   if(!window._fopen)c.classList.add('collapsed');
   if(!bar){bar=document.createElement('div');bar.className='mbar';c.parentNode.insertBefore(bar,c)}
   var b=document.createElement('button');b.className='ftog'+(window._fopen?' on':'');b.textContent=(L=='pl'?'Filtry':L=='zh'?'筛选':L=='de'?'Filter':'Filters');
   b.onclick=function(){window._fopen=!window._fopen;b.classList.toggle('on',window._fopen);app.querySelectorAll('.ctl.dec').forEach(function(x){x.classList.toggle('collapsed',!window._fopen)})};
   bar.appendChild(b);
   if(app.querySelector('table')&&!bar.querySelector('.ctog')){var t=document.createElement('button');t.className='ctog'+(document.body.classList.contains('cols-all')?' on':'');t.textContent=(L=='pl'?'Wszystkie kolumny':L=='zh'?'全部列':L=='de'?'Alle Spalten':'All columns');
    t.onclick=function(){t.classList.toggle('on',document.body.classList.toggle('cols-all'))};bar.appendChild(t)}
  });
  var tb=app.querySelector('table.srt');
  if(tb&&!app.querySelector('.ctog')){var w=tb.parentNode,h=w.previousElementSibling,mb=document.createElement('div');mb.className='mbar';
   var t2=document.createElement('button');t2.className='ctog'+(document.body.classList.contains('cols-all')?' on':'');t2.textContent=(L=='pl'?'Wszystkie kolumny':L=='zh'?'全部列':L=='de'?'Alle Spalten':'All columns');
   t2.onclick=function(){t2.classList.toggle('on',document.body.classList.toggle('cols-all'))};mb.appendChild(t2);(h||w).parentNode.insertBefore(mb,h||w)}
 }
 new MutationObserver(deco).observe(app,{childList:true});
 window._deco=deco;
})();
render();
if(window._deco)window._deco();
(function(){var a=document.querySelector('nav a.on'),n=a&&a.parentNode;if(n&&n.scrollWidth>n.clientWidth)n.scrollLeft=Math.max(0,a.offsetLeft-n.offsetLeft-(n.clientWidth-a.offsetWidth)/2)})();
if(location.hash){var _h=document.getElementById(location.hash.slice(1));if(_h)_h.scrollIntoView()}   // pages are drawn by script: jump to #anchor after drawing
})();
