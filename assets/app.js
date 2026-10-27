(function(){
var D=window.SITE_DATA,L=localStorage.getItem('lang')||((navigator.language||'').slice(0,2)=='pl'?'pl':'en');
var T=function(pl,en){return L=='pl'?pl:en};
var RC={Human:'Human','Orc':'Orc','Undead':'Undead','Night Elf':'NightElf','Random':'Random'};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rn(r){return r?(L=='pl'&&D.race_pl[r]||r):'?'}
function icon(id){var i=D.icons[id];if(!i)return '';return '<img class="ic" src="icons/icon-'+id+'.png" alt="" title="'+esc(L=='pl'?i.pl:i.en)+'" loading="lazy">'}
function iname(id){var i=D.icons[id];return i?(L=='pl'?i.pl:i.en):id}
function nm(n){return n==null?'<span class="dim">'+T('(nazwa graficzna)','(image name)')+'</span>':esc(n)}
function rc(r){return '<span class="'+(RC[r]||'')+'">'+esc(rn(r))+'</span>'}
function sgn(v){return '<span class="'+(v>0?'up':v<0?'down':'dim')+'">'+(v>0?'+':'')+v+'</span>'}
function modeLabel(m){return m}
function setLang(l){L=l;localStorage.setItem('lang',l);render()}
function chrome(){
 document.querySelectorAll('[data-pl]').forEach(function(e){e.innerHTML=L=='pl'?e.getAttribute('data-pl'):e.getAttribute('data-en')});
 document.documentElement.lang=L;
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
var SORTS={rank:function(r){return r[0]},mmr:function(r){return r[3]},games:games,wins:function(r){return r[4]},losses:function(r){return r[5]},wr:function(r){var g=games(r);return g?r[4]/g:0},level:function(r){return r[6]||0}};
function rankingPage(){
 var root=document.getElementById('app'),ms=Object.keys(D.modes);
 var st=window._st=window._st||{m:'1v1',race:'',icon:'',q:'',sort:'rank',dir:1,min:0,shown:100};
 if(!D.modes[st.m])st.m='1v1';
 var m=D.modes[st.m];
 var sopts=[['rank',T('miejsce w rankingu','ladder rank')],['mmr','MMR'],['games',T('liczba gier','games played')],['wins',T('wygrane','wins')],['losses',T('przegrane','losses')],['wr',T('% wygranych','win %')],['level',T('poziom','level')]];
 var o='<div class="ctl"><label>'+T('Tryb','Mode')+' <select id="fm">'+ms.map(function(x){return'<option'+(x==st.m?' selected':'')+'>'+x+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Rasa','Race')+' <select id="fr"><option value="">'+T('wszystkie','all')+'</option>'+D.races.map(function(r){return'<option value="'+r+'"'+(r==st.race?' selected':'')+'>'+esc(rn(r))+'</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Ikona','Icon')+' <select id="fi"><option value="">'+T('wszystkie','all')+'</option>'+m.icons.map(function(i){return'<option value="'+i[0]+'"'+(i[0]==st.icon?' selected':'')+'>'+esc(iname(i[0]))+' ('+i[1]+')</option>'}).join('')+'</select></label>';
 o+='<label>'+T('Szukaj','Search')+' <input id="fq" value="'+esc(st.q)+'" placeholder="'+T('nazwa','name')+'"></label>';
 o+='<label>'+T('Sortuj','Sort')+' <select id="fs">'+sopts.map(function(x){return'<option value="'+x[0]+'"'+(x[0]==st.sort?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label>';
 o+='<label><select id="fd"><option value="1"'+(st.dir==1?' selected':'')+'>'+T('rosnąco','ascending')+'</option><option value="-1"'+(st.dir==-1?' selected':'')+'>'+T('malejąco','descending')+'</option></select></label>';
 o+='<label>'+T('Min. gier','Min. games')+' <input id="fg" type="number" min="0" value="'+st.min+'" style="width:80px"></label></div>';
 var rows=m.top.filter(function(r){return(!st.race||r[2]==st.race)&&(!st.icon||r[7]==st.icon)&&(!st.q||(r[1]||'').toLowerCase().indexOf(st.q.toLowerCase())>=0)&&games(r)>=st.min});
 var f=SORTS[st.sort];rows=rows.slice().sort(function(a,b){return(f(a)-f(b))*st.dir||a[0]-b[0]});
 o+='<div class="note">'+T('Skan z ','Scan of ')+esc(m.date)+' · '+m.rows.toLocaleString()+T(' wierszy',' rows')+(m.sample?T(' (próbka: tylko pierwsze strony rankingu)',' (sample: first pages of the ladder only)'):'')+' · '+T('mediana MMR ','median MMR ')+m.mmr_median+' · <b>'+rows.length.toLocaleString()+'</b> '+T('pasuje do filtrów','match the filters')+'</div>';
 o+='<div class="tw"><table><tr><th class="n">#</th><th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th><th class="n">'+T('Wygr.','Wins')+'</th><th class="n">'+T('Przegr.','Losses')+'</th><th class="n">'+T('Gry','Games')+'</th><th class="n">%</th><th class="n">'+T('Poz.','Lvl')+'</th></tr>';
 rows.slice(0,st.shown).forEach(function(r){var g=games(r);o+='<tr><td class="n">'+r[0]+'</td><td>'+icon(r[7])+nm(r[1])+'</td><td>'+rc(r[2])+'</td><td class="n">'+r[3]+'</td><td class="n">'+r[4]+'</td><td class="n">'+r[5]+'</td><td class="n">'+g+'</td><td class="n">'+(g?Math.round(r[4]/g*100):0)+'</td><td class="n">'+(r[6]||'')+'</td></tr>'});
 o+='</table></div><p class="dim">'+T('Pokazano ','Showing ')+Math.min(st.shown,rows.length)+T(' z ',' of ')+rows.length.toLocaleString()+(rows.length>st.shown?' · <a href="#" id="more">'+T('pokaż 200 więcej','show 200 more')+'</a>':'')+'</p>';
 o+='<h2>'+T('Rozkład MMR','MMR distribution')+'</h2><div class="grid2"><div id="h1" class="card"></div><div id="h2" class="card"></div></div>';
 root.innerHTML=o;
 hist(document.getElementById('h1'),st.m,'');
 var r2=st.race||'Orc';document.getElementById('h2').insertAdjacentHTML('afterbegin','<b class="'+RC[r2]+'">'+esc(rn(r2))+'</b>');
 var w=document.createElement('div');document.getElementById('h2').appendChild(w);hist(w,st.m,r2);
 function rd(){st.m=document.getElementById('fm').value;st.race=document.getElementById('fr').value;st.sort=document.getElementById('fs').value;st.dir=+document.getElementById('fd').value;st.min=+document.getElementById('fg').value||0;st.shown=100}
 ['fm','fr','fs','fd','fg','fi'].forEach(function(id){document.getElementById(id).onchange=function(){var pm=st.m;rd();st.icon=(id=='fm'&&pm!=st.m)?'':document.getElementById('fi').value;rankingPage()}});
 var q=document.getElementById('fq');q.oninput=function(){st.q=q.value;st.shown=100;var p=q.selectionStart;rankingPage();var n=document.getElementById('fq');n.focus();n.setSelectionRange(p,p)};
 var mo=document.getElementById('more');if(mo)mo.onclick=function(e){e.preventDefault();st.shown+=200;rankingPage()};
}
function best(rows,f,dir,n){return rows.slice().sort(function(a,b){return(f(b)-f(a))*dir||a[0]-b[0]}).slice(0,n)}
function recRow(label,r,val){return r?'<tr><td>'+label+'</td><td>'+icon(r[7])+nm(r[1])+' <span class="dim">#'+r[0]+'</span></td><td class="n">'+val+'</td></tr>':''}
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
 o+='</div><h2>'+T('Ikony: najwięcej graczy i najwyższe MMR','Icons: most players and highest MMR')+'</h2><div class="tw"><table><tr><th>'+T('Ikona','Icon')+'</th><th class="n">'+T('Wiersze','Rows')+'</th><th class="n">'+T('Różne nazwy','Distinct names')+'</th><th class="n">'+T('Najwyższe MMR','Highest MMR')+'</th><th class="n">'+T('Średnie MMR','Average MMR')+'</th><th class="n">'+T('Najwięcej gier','Most games')+'</th></tr>';
 var by={};all.forEach(function(r){var e=by[r[7]]=by[r[7]]||{n:0,s:0,mx:0,g:0};e.n++;e.s+=r[3];e.mx=Math.max(e.mx,r[3]);e.g=Math.max(e.g,games(r))});
 m.icons.slice(0,60).forEach(function(i){var e=by[i[0]];if(!e)return;o+='<tr><td>'+icon(i[0])+esc(iname(i[0]))+'</td><td class="n">'+i[1]+'</td><td class="n">'+i[2]+'</td><td class="n">'+e.mx+'</td><td class="n">'+Math.round(e.s/e.n)+'</td><td class="n">'+e.g+'</td></tr>'});
 o+='</table></div><p class="dim">'+T('Wiersz rankingu to nie zawsze unikalny gracz (kilka ras tej samej osoby). Pokazano 60 najpopularniejszych ikon; filtr ikony jest też na stronie Ranking.','A ladder row is not always a unique player (one person can have several races). The 60 most common icons are shown; the icon filter is also on the Ranking page.')+'</p>';
 root.innerHTML=o;
 document.getElementById('rm').onchange=function(){st.m=this.value;recordsPage()};document.getElementById('rg').onchange=function(){st.min=+this.value||1;recordsPage()}}
function actTable(title,head,list,row){
 if(!list.length)return '';
 return '<h2>'+title+'</h2><div class="tw"><table><tr>'+head+'</tr>'+list.map(row).join('')+'</table></div>'}
function activityPage(){
 var root=document.getElementById('app'),ms=Object.keys(D.activity);
 if(!ms.length){root.innerHTML='<div class="note">'+T('Jest dopiero jeden skan rankingu ('+esc(D.modes['1v1']?D.modes['1v1'].date:'')+'), więc nie ma jeszcze z czym porównywać. Ta strona wypełni się po drugim skanie: kto zagrał najwięcej gier, największe skoki MMR, nowi i wypadli z rankingu.','There is only one ladder scan so far ('+esc(D.modes['1v1']?D.modes['1v1'].date:'')+'), so there is nothing to compare yet. This page fills in after the second scan: most games played, biggest MMR jumps, newcomers and players who dropped out.')+'</div>';return}
 var st=window._sa=window._sa||{m:ms[0]};if(!D.activity[st.m])st.m=ms[0];
 var a=D.activity[st.m];
 var o='<div class="ctl"><label>'+T('Tryb','Mode')+' <select id="am">'+ms.map(function(m){return'<option'+(m==st.m?' selected':'')+'>'+m+'</option>'}).join('')+'</select></label><span class="dim">'+esc(a.from)+' → '+esc(a.to)+'</span></div>';
 o+='<div class="cards"><div class="card"><b>'+a.new_n+'</b><span>'+T('nowi w rankingu','new in the ladder')+'</span></div><div class="card"><b>'+a.dropped_n+'</b><span>'+T('wypadli z rankingu','dropped out')+'</span></div></div>';
 o+=actTable(T('Najwięcej rozegranych gier','Most games played'),'<th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">'+T('Gry','Games')+'</th><th class="n">MMR</th>',a.games.filter(function(r){return r[2]>0}),function(r){return'<tr><td>'+icon(r[5])+nm(r[0])+'</td><td>'+rc(r[1])+'</td><td class="n">'+r[2]+'</td><td class="n">'+r[4]+'</td></tr>'});
 o+=actTable(T('Największe zmiany MMR','Biggest MMR changes'),'<th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">'+T('Zmiana','Change')+'</th><th class="n">'+T('Było','Was')+'</th><th class="n">'+T('Jest','Now')+'</th>',a.jumps,function(r){return'<tr><td>'+icon(r[5])+nm(r[0])+'</td><td>'+rc(r[1])+'</td><td class="n">'+sgn(r[2])+'</td><td class="n">'+r[3]+'</td><td class="n">'+r[4]+'</td></tr>'});
 o+=actTable(T('Nowi w rankingu','New in the ladder'),'<th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th>',a.new,function(r){return'<tr><td>'+icon(r[3])+nm(r[0])+'</td><td>'+rc(r[1])+'</td><td class="n">'+r[2]+'</td></tr>'});
 o+=actTable(T('Wypadli z rankingu','Dropped out'),'<th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th>',a.dropped,function(r){return'<tr><td>'+icon(r[3])+nm(r[0])+'</td><td>'+rc(r[1])+'</td><td class="n">'+r[2]+'</td></tr>'});
 root.innerHTML=o;document.getElementById('am').onchange=function(){st.m=this.value;activityPage()}}
function homePage(){
 var m=D.modes['1v1'],rc_=m.races,o='<div class="cards">';
 o+='<div class="card"><b>'+m.rows.toLocaleString()+'</b><span>'+T('wierszy rankingu 1v1','1v1 ladder rows')+'</span></div>';
 o+='<div class="card"><b>'+m.mmr_max+'</b><span>'+T('najwyższe MMR (1v1)','highest MMR (1v1)')+'</span></div>';
 o+='<div class="card"><b>'+m.mmr_median+'</b><span>'+T('mediana MMR','median MMR')+'</span></div>';
 o+='<div class="card"><b>'+m.date+'</b><span>'+T('data skanu','scan date')+'</span></div></div>';
 o+='<h2>'+T('Podział ras (1v1)','Race split (1v1)')+'</h2><div class="cards">';
 D.races.forEach(function(r){var n=rc_[r]||0;o+='<div class="card"><b class="'+RC[r]+'">'+Math.round(n/m.rows*100)+'%</b><span>'+esc(rn(r))+' · '+n.toLocaleString()+'</span></div>'});
 o+='</div><h2>'+T('Top 10 (1v1)','Top 10 (1v1)')+'</h2><div class="tw"><table><tr><th class="n">#</th><th>'+T('Gracz','Player')+'</th><th>'+T('Rasa','Race')+'</th><th class="n">MMR</th></tr>';
 m.top.slice(0,10).forEach(function(r){o+='<tr><td class="n">'+r[0]+'</td><td>'+icon(r[7])+nm(r[1])+'</td><td>'+rc(r[2])+'</td><td class="n">'+r[3]+'</td></tr>'});
 o+='</table></div>';document.getElementById('app').innerHTML=o}
function aboutPage(){document.getElementById('built').textContent=D.built;document.getElementById('patch').textContent=D.patch;document.getElementById('scand').textContent=(D.modes['1v1']||{}).date||''}
function render(){
 chrome();var p=document.body.dataset.page;
 if(p=='home')homePage();else if(p=='ranking')rankingPage();else if(p=='records')recordsPage();else if(p=='activity')activityPage();else if(p=='about')aboutPage();
 var f=document.getElementById('foot');if(f)f.textContent=T('Dane: ranking gry Warcraft III · aktualizacja ','Data: Warcraft III in-game ladder · updated ')+D.built}
document.querySelectorAll('.lang button').forEach(function(b){b.onclick=function(){setLang(b.dataset.l)}});
render();
})();
