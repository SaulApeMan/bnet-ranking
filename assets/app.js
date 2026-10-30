(function(){
var D=window.SITE_DATA,TR=window.I18N||{},LANGS=['pl','en','zh','de'],L='';
try{L=localStorage.getItem('lang')||''}catch(e){}
if(LANGS.indexOf(L)<0){var nl=(navigator.language||'').slice(0,2);L=nl=='pl'?'pl':nl=='zh'?'zh':nl=='de'?'de':'en'}
var QS=new URLSearchParams(location.search);
if(LANGS.indexOf(QS.get('lang'))>=0)L=QS.get('lang');
var T=function(pl,en){return L=='pl'?pl:L=='en'?en:((TR[en]||{})[L]||en)};
var RC={Human:'Human','Orc':'Orc','Undead':'Undead','Night Elf':'NightElf','Random':'Random'};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rn(r){return r?((D.race_names[L]||{})[r]||r):'?'}
function icon(id){var i=D.icons[id];if(!i)return '';return '<img class="ic" src="icons/icon-'+id+'.png" alt="" title="'+esc(i[L]||i.en)+'" loading="lazy">'}
function iname(id){var i=D.icons[id];return i?(i[L]||i.en):id}
function nm(n,img,rk){if(n!=null)return esc(n);if(img)return '<img class="nm" src="'+esc(img)+'" alt="name image" loading="lazy"> <span class="dim">'+T('[obrazek] #','[image] #')+rk+'</span>';return '<span class="dim">'+T('(nazwa graficzna)','(image name)')+'</span>'}
function rc(r){return '<span class="'+(RC[r]||'')+'">'+esc(rn(r))+'</span>'}
function sgn(v){return '<span class="'+(v>0?'up':v<0?'down':'dim')+'">'+(v>0?'+':'')+v+'</span>'}
function modeLabel(m){return m}
function setLang(l){L=l;try{localStorage.setItem('lang',l)}catch(e){}render()}
function chrome(){
 document.querySelectorAll('[data-pl]').forEach(function(e){e.innerHTML=T(e.getAttribute('data-pl'),e.getAttribute('data-en'))});
 document.documentElement.lang=L=='zh'?'zh-Hans':L;
 document.querySelectorAll('.lang button').forEach(function(b){b.classList.toggle('on',b.dataset.l==L)});
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
function rankingPage(){
 var root=document.getElementById('app'),ms=Object.keys(D.modes);
 var st=window._st=window._st||{m:QS.get('mode')||'1v1',race:QS.get('race')||'',icon:QS.get('icon')||'',league:QS.get('league')||'',q:QS.get('q')||'',sort:SORTS[QS.get('sort')]?QS.get('sort'):'rank',dir:QS.get('dir')=='-1'?-1:1,min:+QS.get('min')||0,shown:100};
 if(!D.modes[st.m])st.m='1v1';
 var m=D.modes[st.m];
 var sopts=[['rank',T('miejsce w rankingu','ladder rank')],['mmr','MMR'],['games',T('liczba gier','games played')],['wins',T('wygrane','wins')],['losses',T('przegrane','losses')],['wr',T('% wygranych','win %')],['level',T('poziom','level')]];
 var o='<div class="ctl"><label>'+T('Tryb','Mode')+' <select id="fm">'+ms.map(function(x){return'<option'+(x==st.m?' selected':'')+'>'+x+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Rasa','Race')+' <select id="fr"><option value="">'+T('wszystkie','all')+'</option>'+D.races.map(function(r){return'<option value="'+r+'"'+(r==st.race?' selected':'')+'>'+esc(rn(r))+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Ikona','Icon')+' <select id="fi"><option value="">'+T('wszystkie','all')+'</option>'+m.icons.map(function(i){return'<option value="'+i[0]+'"'+(i[0]==st.icon?' selected':'')+'>'+esc(iname(i[0]))+' ('+i[1]+')</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Liga','League')+' <select id="fl"><option value="">'+T('wszystkie','all')+'</option>'+Object.keys(D.leagues).map(function(k){return'<option value="'+k+'"'+(k==st.league?' selected':'')+'>'+lgopt(k)+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Szukaj','Search')+' <input id="fq" value="'+esc(st.q)+'" placeholder="'+T('nazwa','name')+'"></label>';
 o+='<label>'+T('Sortuj','Sort')+' <select id="fs">'+sopts.map(function(x){return'<option value="'+x[0]+'"'+(x[0]==st.sort?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label>';
 o+='<label><select id="fd"><option value="1"'+(st.dir==1?' selected':'')+'>'+T('rosnąco','ascending')+'</option><option value="-1"'+(st.dir==-1?' selected':'')+'>'+T('malejąco','descending')+'</option></select></label>';
 o+='<label>'+T('Min. gier','Min. games')+' <input id="fg" type="number" min="0" value="'+st.min+'" style="width:80px"></label></div>';
 var rows=m.top.filter(function(r){return(!st.race||r[2]==st.race)&&(!st.icon||r[7]==st.icon)&&(!st.league||r[9]==st.league)&&(!st.q||(r[1]||'').toLowerCase().indexOf(st.q.toLowerCase())>=0)&&games(r)>=st.min});
 var f=SORTS[st.sort];rows=rows.slice().sort(function(a,b){return(f(a)-f(b))*st.dir||a[0]-b[0]});
 o+='<div class="note">'+T('Skan z ','Scan of ')+esc(m.date)+' · '+m.rows.toLocaleString()+T(' wierszy',' rows')+(m.sample?T(' (próbka: tylko pierwsze strony rankingu)',' (sample: first pages of the ladder only)'):'')+' · '+T('mediana MMR ','median MMR ')+m.mmr_median+' · <b>'+rows.length.toLocaleString()+'</b> '+T('pasuje do filtrów','match the filters')+'<br><span class="dim">'+T('Miejsce w rankingu gry wynika z poziomu konta, nie z MMR – żeby zobaczyć najsilniejszych graczy, sortuj po MMR.','The in-game ladder rank follows account level, not MMR – sort by MMR to see the strongest players.')+'</span></div>';
 o+='<div class="tw"><table><tr><th class="n">#</th><th>'+T('Gracz','Player')+'</th>'+(Object.keys(D.leagues).length?'<th>'+T('Liga','League')+'</th>':'')+'<th class="n">'+T('Poz.','Lvl')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th><th class="n">'+T('Wygr.','Wins')+'</th><th class="n">'+T('Przegr.','Losses')+'</th><th class="n">'+T('Gry','Games')+'</th><th class="n">%</th></tr>';
 rows.slice(0,st.shown).forEach(function(r){var g=games(r);o+='<tr><td class="n">'+r[0]+'</td><td>'+icon(r[7])+nm(r[1],r[8],r[0])+qa(r)+'</td>'+(Object.keys(D.leagues).length?'<td>'+lgcell(r[9])+'</td>':'')+'<td class="n">'+(r[6]==null?'<span class="dim">–</span>':r[6])+'</td><td>'+rc(r[2])+'</td><td class="n">'+r[3]+'</td><td class="n">'+r[4]+'</td><td class="n">'+r[5]+'</td><td class="n">'+g+'</td><td class="n">'+(g?Math.round(r[4]/g*100):0)+'</td></tr>'});
 o+='</table></div><p class="dim">'+T('Pokazano ','Showing ')+Math.min(st.shown,rows.length)+T(' z ',' of ')+rows.length.toLocaleString()+(rows.length>st.shown?' · <a href="#" id="more">'+T('pokaż 200 więcej','show 200 more')+'</a>':'')+'</p>';
 o+='<h2>'+T('Rozkład MMR','MMR distribution')+'</h2><div class="grid2"><div id="h1" class="card"></div><div id="h2" class="card"></div></div>';
 root.innerHTML=o;
 hist(document.getElementById('h1'),st.m,'');
 var r2=st.race||'Orc';document.getElementById('h2').insertAdjacentHTML('afterbegin','<b class="'+RC[r2]+'">'+esc(rn(r2))+'</b>');
 var w=document.createElement('div');document.getElementById('h2').appendChild(w);hist(w,st.m,r2);
 function rd(){st.league=document.getElementById('fl').value;st.m=document.getElementById('fm').value;st.race=document.getElementById('fr').value;st.sort=document.getElementById('fs').value;st.dir=+document.getElementById('fd').value;st.min=+document.getElementById('fg').value||0;st.shown=100}
 ['fm','fr','fs','fd','fg','fi','fl'].forEach(function(id){document.getElementById(id).onchange=function(){var pm=st.m;rd();st.icon=(id=='fm'&&pm!=st.m)?'':document.getElementById('fi').value;rankingPage()}});
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
 root.innerHTML=o;
 document.getElementById('rm').onchange=function(){st.m=this.value;recordsPage()};document.getElementById('pr').onchange=function(){window._sp=this.value;recordsPage()};document.getElementById('rg').onchange=function(){st.min=+this.value||1;recordsPage()}}
function ictabs(st){return '<div class="ctl tabs"><button data-v="players" class="'+(st.view!='req'?'on':'')+'">'+T('Ikony graczy','Player icons')+'</button><button data-v="req" class="'+(st.view=='req'?'on':'')+'">'+T('Wymagania ikon','Icon requirements')+'</button></div>'}
function ictabsBind(st){document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){st.view=b.getAttribute('data-v');iconsPage()}})}
function reqPage(st){
 var root=document.getElementById('app'),o=ictabs(st);
 var cnt={};((D.modes['1v1']||{top:[]}).top).forEach(function(r){if(r[7])cnt[r[7]]=(cnt[r[7]]||0)+1});
 var cats=[['free',T('Darmowe ikony','Free icons')],['wins',T('Wygrane w grach rankingowych','Matchmaking wins')],['tournament',T('Wygrane w turniejach','Tournament wins')],['campaign',T('Ukończenie kampanii','Campaign completion')],['special',T('Ikony specjalne (wymaganie nieznane)','Special icons (requirement not shown)')]];
 var all=Object.keys(D.icons).filter(function(id){return D.icons[id].cat});
 o+='<div class="note">'+T('Co trzeba zrobić, aby odblokować każdą ikonę portretu, pogrupowane w kategorie. Liczba graczy pochodzi z ostatniego skanu 1v1.','What you need to do to unlock each portrait icon, grouped by category. Player counts come from the latest 1v1 scan.')+'</div>';
 function sub(id){var c=D.icons[id];return c.cat=='wins'?rn(c.sub):c.cat=='free'?((c.sec||{})[L]||(c.sec||{}).en||''):''}
 cats.forEach(function(c){
  var ids=all.filter(function(id){return D.icons[id].cat==c[0]});if(!ids.length)return;
  o+='<h2>'+c[1]+' <span class="dim">('+ids.length+')</span></h2>';
  var groups={},order=[];
  ids.forEach(function(id){var s=sub(id);if(!groups[s]){groups[s]=[];order.push(s)}groups[s].push(id)});
  order.forEach(function(s){
   var g=groups[s].sort(function(a,b){return (D.icons[a].n||0)-(D.icons[b].n||0)||iname(a).localeCompare(iname(b))});
   if(s)o+='<h3>'+esc(s)+' <span class="dim">('+g.length+')</span></h3>';
   o+='<div class="rqgrid">'+g.map(function(id){var i=D.icons[id],d=(i.desc||{})[L]||(i.desc||{}).en||T('Wymaganie nie jest podane w grze','Requirement is not shown in the game');
    return '<div class="rq"><img class="big" src="'+(i.big?'icons-large/'+id+'.png':'icons/icon-'+id+'.png')+'" alt="" loading="lazy"><b>'+esc(iname(id))+'</b><span>'+esc(d)+'</span><small>'+T('Graczy w 1v1: ','Players in 1v1: ')+(cnt[id]||0).toLocaleString()+'</small></div>'}).join('')+'</div>'});
 });
 root.innerHTML=o;ictabsBind(st);
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
 o+='<div class="tw"><table><tr><th class="n">#</th>'+cols.map(function(c,i){var on=c[0]==st.k;return'<th'+(i?' class="n"':'')+' style="cursor:pointer" data-k="'+c[0]+'">'+esc(c[1])+(on?(st.dir==1?' ▲':' ▼'):'')+'</th>'}).join('')+'</tr>';
 list.forEach(function(e,i){o+='<tr><td class="n">'+(i+1)+'</td><td>'+icon(e.id)+esc(e.label)+'</td><td class="n">'+e.n.toLocaleString()+'</td><td class="n">'+e.share.toFixed(1)+'</td><td class="n">'+e.names.toLocaleString()+'</td><td class="n">'+e.avg+'</td><td class="n">'+e.mx+'</td>'+D.races.map(function(r){return'<td class="n">'+(e.rc[r]||0).toLocaleString()+'</td>'}).join('')+'</tr>'});
 o+='</table></div><p class="dim">'+T('Gracze = wiersze rankingu z tą ikoną; jedna osoba może mieć kilka wierszy (po jednym na rasę). Filtr rasy i ligi zmienia, w jakim gronie liczona jest popularność.','Players = ladder rows that use the icon; one person can have several rows (one per race). The race and league filters change the group in which popularity is counted.')+'</p>';
 root.innerHTML=o;ictabsBind(st);
 function rd(){st.m=document.getElementById('im').value;st.race=document.getElementById('ir').value;var l=document.getElementById('il');st.league=l?l.value:'';st.min=+document.getElementById('in').value||0;iconsPage()}
 ['im','ir','il','in'].forEach(function(id){var e=document.getElementById(id);if(e)e.onchange=rd});
 var qi=document.getElementById('iq');qi.oninput=function(){st.q=qi.value;var p=qi.selectionStart;iconsPage();var n=document.getElementById('iq');n.focus();n.setSelectionRange(p,p)};
 document.querySelectorAll('th[data-k]').forEach(function(th){th.onclick=function(){var k=th.getAttribute('data-k');if(st.k==k)st.dir=-st.dir;else{st.k=k;st.dir=k=='label'?1:-1}iconsPage()}});
}
function w3cPage(){
 var root=document.getElementById('app'),W=D.w3c||{accounts:[],season:null};
 var st=window._sw=window._sw||{q:QS.get('q')||'',league:QS.get('league')||'',race:QS.get('race')||'',cur:QS.get('current')||'',sort:QS.get('sort')||'rank',dir:QS.get('dir')=='-1'?-1:1,shown:100};
 var q=st.q.toLowerCase();
 var keyf={rank:function(a){return a.rank},bmmr:function(a){return a.bmmr},wmmr:function(a){return a.wmmr||0},level:function(a){return a.level||0},season:function(a){return a.season||0},name:function(a){return (a.name||a.tag).toLowerCase()}};
 var list=W.accounts.filter(function(a){
  return (!q||a.tag.toLowerCase().indexOf(q)>=0||(a.name||'').toLowerCase().indexOf(q)>=0)&&(!st.league||a.bleague==st.league)&&(!st.race||a.race==st.race)&&(!st.cur||(st.cur=='1')==!!a.current)});
 var f=keyf[st.sort]||keyf.rank;
 list.sort(function(a,b){var x=f(a),y=f(b);var c=x<y?-1:x>y?1:0;return (c*st.dir)||(a.rank-b.rank)});
 var cur=W.accounts.filter(function(a){return a.current}).length;
 var o='<div class="note">'+T('Gracze z rankingu Battle.net 1v1, którzy kiedykolwiek grali na W3Champions (dowolny sezon), z potwierdzonym BattleTagiem. MMR na W3Champions i MMR na Battle.net mają różne skale (około 1000–3000 kontra do około 6600), więc nie porównuj ich wprost.','Players from the Battle.net 1v1 ladder who have ever played on W3Champions (any season), with a confirmed BattleTag. W3Champions MMR and Battle.net MMR use different scales (about 1000-3000 versus up to about 6600), so do not compare them directly.')+'</div>';
 o+='<div class="cards"><div class="card"><b>'+W.accounts.length.toLocaleString()+'</b><span>'+T('graczy w obu miejscach','players in both')+'</span></div><div class="card"><b>'+cur.toLocaleString()+'</b><span>'+T('grało w sezonie ','played in season ')+W.season+'</span></div></div>';
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
 function rd(){st.league=document.getElementById('wl').value;st.race=document.getElementById('wr').value;st.cur=document.getElementById('wc').value;st.sort=document.getElementById('ws').value;st.dir=+document.getElementById('wd').value;st.shown=100;w3cPage()}
 ['wl','wr','wc','ws','wd'].forEach(function(id){document.getElementById(id).onchange=rd});
 var qi=document.getElementById('wq');qi.oninput=function(){st.q=qi.value;st.shown=100;var p=qi.selectionStart;w3cPage();var n=document.getElementById('wq');n.focus();n.setSelectionRange(p,p)};
 var mo=document.getElementById('wmore');if(mo)mo.onclick=function(e){e.preventDefault();st.shown+=200;w3cPage()};
}
function actTable(title,head,list,row){
 if(!list.length)return '';
 return '<h2>'+title+'</h2><div class="tw"><table><tr>'+head+'</tr>'+list.map(row).join('')+'</table></div>'}
function activityPage(){
 var root=document.getElementById('app'),ms=Object.keys(D.activity);
 if(!ms.length){root.innerHTML='<div class="note">'+T('Jest dopiero jeden skan rankingu (','There is only one ladder scan so far (')+esc(D.modes['1v1']?D.modes['1v1'].date:'')+T('), więc nie ma jeszcze z czym porównywać. Ta strona wypełni się po drugim skanie: kto zagrał najwięcej gier, największe skoki MMR, nowi i wypadli z rankingu.','), so there is nothing to compare yet. This page fills in after the second scan: most games played, biggest MMR jumps, newcomers and players who dropped out.')+'</div>';return}
 var st=window._sa=window._sa||{m:ms[0]};if(!D.activity[st.m])st.m=ms[0];
 var a=D.activity[st.m];
 var o='<div class="ctl"><label>'+T('Tryb','Mode')+' <select id="am">'+ms.map(function(m){return'<option'+(m==st.m?' selected':'')+'>'+m+'</option>'}).join('')+'</select></label><span class="dim">'+esc(a.from)+' → '+esc(a.to)+'</span></div>';
 o+='<div class="cards"><div class="card"><b>'+a.new_n+'</b><span>'+T('nowi w rankingu','new in the ladder')+'</span></div><div class="card"><b>'+a.dropped_n+'</b><span>'+T('wypadli z rankingu','dropped out')+'</span></div></div>';
 o+=actTable(T('Najwięcej rozegranych gier','Most games played'),'<th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">'+T('Gry','Games')+'</th><th class="n">MMR</th>',a.games.filter(function(r){return r[2]>0}),function(r){return'<tr><td>'+icon(r[5])+nm(r[0])+'</td><td>'+rc(r[1])+'</td><td class="n">'+r[2]+'</td><td class="n">'+r[4]+'</td></tr>'});
 o+=actTable(T('Największe zmiany MMR','Biggest MMR changes'),'<th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">'+T('Zmiana','Change')+'</th><th class="n">'+T('Było','Was')+'</th><th class="n">'+T('Jest','Now')+'</th>',a.jumps,function(r){return'<tr><td>'+icon(r[5])+nm(r[0])+'</td><td>'+rc(r[1])+'</td><td class="n">'+sgn(r[2])+'</td><td class="n">'+r[3]+'</td><td class="n">'+r[4]+'</td></tr>'});
 o+=actTable(T('Nowi w rankingu','New in the ladder'),'<th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th>',a.new,function(r){return'<tr><td>'+icon(r[3])+nm(r[0])+'</td><td>'+rc(r[1])+'</td><td class="n">'+r[2]+'</td></tr>'});
 o+=actTable(T('Wypadli z rankingu','Dropped out'),'<th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th>',a.dropped,function(r){return'<tr><td>'+icon(r[3])+nm(r[0])+'</td><td>'+rc(r[1])+'</td><td class="n">'+r[2]+'</td></tr>'});
 o+='<p class="dim">'+T('Różnice liczone ze skanów odczytywanych przez OCR; pojedyncze wartości mogą być błędne. Gracze dopasowani po nicku, rasie i ikonie (przy zmianie ikony po nicku i rasie).','Differences are computed from OCR-read scans; single values may be wrong. Players are matched by nick, race and icon (by nick and race when the icon changed).')+'</p>';
 root.innerHTML=o;document.getElementById('am').onchange=function(){st.m=this.value;activityPage()}}
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
 o+='</table></div>';document.getElementById('app').innerHTML=o}
function aboutPage(){document.getElementById('built').textContent=D.built;document.getElementById('patch').textContent=D.patch;document.getElementById('scand').textContent=(D.modes['1v1']||{}).date||''}
function render(){
 chrome();var p=document.body.dataset.page;
 if(p=='home')homePage();else if(p=='ranking')rankingPage();else if(p=='records')recordsPage();else if(p=='icons')iconsPage();else if(p=='w3c')w3cPage();else if(p=='activity')activityPage();else if(p=='about')aboutPage();
 var f=document.getElementById('foot');if(f)f.textContent=T('Dane: ranking gry Warcraft III · aktualizacja ','Data: Warcraft III in-game ladder · updated ')+D.built}
document.querySelectorAll('.lang button').forEach(function(b){b.onclick=function(){setLang(b.dataset.l)}});

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
 }
 new MutationObserver(deco).observe(app,{childList:true});
 window._deco=deco;
})();
render();
if(window._deco)window._deco();
})();
