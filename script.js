(function(){
"use strict";
var $=function(i){return document.getElementById(i)};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function link(q,txt,c){var a=el("a",c||"btn",txt);a.href=q;a.target="_blank";a.rel="noopener noreferrer";return a}
function clear(n){while(n.firstChild)n.removeChild(n.firstChild)}
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
var tt;function toast(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("on")},2600)}
var inr=function(n){return "₹"+Math.round(n).toLocaleString("en-IN")};
var coords=null;
function loc(){return coords||$("loc").value.trim()}
function mapQ(q){return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q)}
function mapsFor(cat){return mapQ(cat+" near "+loc())}
function num(id,min,max){var v=parseFloat($(id).value);return isFinite(v)&&v>=min&&v<=max?v:null}
function fill(o){Object.keys(o).forEach(function(k){$(k).value=o[k]})}

/* theme, nav, scroll */
var th=store("tg-theme")||"light";function setTh(t){document.documentElement.dataset.theme=t;$("th").textContent=t=="dark"?"☀️":"🌙";store("tg-theme",t)}setTh(th);
$("th").onclick=function(){setTh(document.documentElement.dataset.theme=="dark"?"light":"dark")};
$("mb").onclick=function(){var o=$("nl").classList.toggle("open");this.setAttribute("aria-expanded",o)};
$("nl").onclick=function(e){if(e.target.tagName=="A"){$("nl").classList.remove("open");$("mb").setAttribute("aria-expanded","false")}};
addEventListener("scroll",function(){$("top").classList.toggle("sc",scrollY>10)},{passive:true});
var secs=document.querySelectorAll("main section[id]"),links=document.querySelectorAll("#nl a");
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");if(e.target.id)links.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")=="#"+e.target.id)})}})},{threshold:.15});
document.querySelectorAll(".rv").forEach(function(r){if(window.IntersectionObserver)io.observe(r);else r.classList.add("in")});
secs.forEach(function(s){if(window.IntersectionObserver)io.observe(s)});
setTimeout(function(){document.querySelectorAll(".hero .rv").forEach(function(r){r.classList.add("in")})},100);
function clock(){$("clock").textContent=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}clock();setInterval(clock,30000);

/* nearby dashboard */
var cats=[["🏛","Tourist Places","Landmarks and attractions","tourist attractions"],["🏥","Hospital","Medical facilities","hospital"],["🏧","ATM","Cash withdrawal","ATM"],["💊","Pharmacy","Medicine stores","pharmacy"],["🍽","Restaurants & Cafes","Food and drink","restaurants and cafes"],["🏨","Hotels","Places to stay","hotels"],["⛽","Petrol Pump","Fuel stations","petrol pump"],["🚻","Public Toilets","Restrooms","public toilet"],["🚌","Bus Station","Stops and terminals","bus station"],["🚇","Metro Station","Metro access","metro station"],["🛍","Markets","Shopping areas","market"],["📷","Photo Spots","Viewpoints","photography spots"],["🛒","Grocery","Daily-use stores","grocery store"],["🚨","Emergency Services","Police and hospitals","emergency services"]];
function tile(i,t,d,fn){var b=el("button","tile");b.type="button";b.appendChild(el("span",null,i));b.appendChild(el("b",null,t));if(d)b.appendChild(el("small",null,d));b.onclick=fn;return b}
function recent(l){var r=store("tg-recent")||[];if(l&&r.indexOf(l)<0){r.unshift(l);store("tg-recent",r.slice(0,5))}}
function search(name,q){
  var l=loc();if(!l){toast("Enter a location or use GPS first.");$("loc").focus();return}
  if(!coords)recent(l);
  var r=$("res");clear(r);r.appendChild(el("b",null,"Search ready: "+name));
  r.appendChild(el("p",null,"Google Maps will show real results near "+(coords?"your coordinates ("+coords+")":l)+". Nothing has been searched yet; open the link to see results and verify details."));
  r.appendChild(link(mapsFor(q),"Open "+name+" in Google Maps"));toast("Maps link ready");
}
cats.forEach(function(c){$("dash").appendChild(tile(c[0],c[1],c[2],function(){search(c[1],c[3])}))});
$("hgo").onclick=function(){var v=$("hq").value.trim();if(!v){toast("Enter a location first.");return}$("loc").value=v;coords=null;$("nearby").scrollIntoView();toast("Location set. Pick a category.")};
$("hq").onkeydown=function(e){if(e.key=="Enter")$("hgo").click()};
$("loc").oninput=function(){coords=null};
$("geo").onclick=function(){
  var m=$("geoMsg");if(!navigator.geolocation){m.textContent="Geolocation is not supported here. Enter a location manually.";return}
  m.textContent="Requesting location… ";m.appendChild(el("i","sp"));
  navigator.geolocation.getCurrentPosition(function(p){coords=p.coords.latitude.toFixed(5)+","+p.coords.longitude.toFixed(5);$("loc").value="My location ("+coords+")";m.textContent="Location found: "+coords;toast("Location found")},
  function(e){coords=null;m.textContent=(e.code==1?"Permission denied. ":"Could not get location. ")+"Enter a location manually; GPS needs HTTPS or localhost.";toast("Location unavailable")},{timeout:10000});
};

/* itinerary + time */
var pools={history:["Historical monument","Museum","Heritage walk area","Old city market","Sunset viewpoint","Local temple or mosque"],nature:["Park or garden","Lake or riverfront","Nature trail","Botanical garden","Sunset viewpoint","Open green space"],photo:["Landmark viewpoint","Street photography lane","Park or garden","Riverfront","Sunset viewpoint","Colourful market"],shop:["Local market","Handicraft emporium","Shopping street","Street-food lane","Shopping mall","Bookshop area"],food:["Famous local eatery","Street-food lane","Cafe","Sweet shop","Dessert spot","Food market"]};
function fm(m){var d=m>=1440,h=Math.floor(m/60)%24,mi=Math.round(m%60),a=h>=12?"PM":"AM";return (h%12||12)+":"+(mi<10?"0":"")+mi+" "+a+(d?" (+1 day)":"")}
function dur(m){var h=Math.floor(m/60);return (h?h+"h ":"")+(m%60)+"m"}
function makePlan(){
  var h=num("ph",0,48),mi=num("pm",0,59),v=num("pv",5,300),tr=num("pt",0,180),br=num("pb",0,180),mx=num("px",1,10),st=$("ps").value;
  if(h===null||mi===null||v===null||tr===null||br===null||mx===null||!st){toast("Check the form: some values are missing or out of range.");return null}
  var total=h*60+mi;if(total<=0){toast("Available time must be above zero.");return null}
  var s=st.split(":"),start=+s[0]*60+ +s[1],end=start+total,t=start,items=[],pool=pools[$("pi").value],brk=false,i=0,city=$("pc").value.trim()||"your city";
  while(i<mx){
    var arr=items.length?t+tr:t;if(arr+v>end)break;
    var next={n:pool[i%pool.length],arr:arr,dep:arr+v,v:v,type:"stop",tr:tr,why:"Demo suggestion for "+$("pi").selectedOptions[0].text+". Search Maps for real options.",q:pool[i%pool.length]+" near "+city};
    items.push(next);t=arr+v;i++;
    if(!brk&&br>0&&i>=2&&t+br<=end){brk=true;items.push({n:"Meal / rest break",arr:t,dep:t+br,v:br,type:"brk",tr:0,why:"Planned break.",q:"restaurants near "+city});t+=br}
  }
  if(!i){toast("Not enough time for one stop. Increase hours or reduce stop length.");return null}
  for(var k=0;k<items.length;k++){if(k==items.length-1||items[k+1].type=="brk")items[k].tr=0}
  return{city:city,start:start,end:end,total:total,items:items,mode:$("pr").value,v:v,tr:tr}
}
function renderPlan(p){
  var o=$("pout");clear(o);var st=p.items.filter(function(x){return x.type=="stop"}),sight=st.length*p.v,br=0;
  p.items.forEach(function(x){if(x.type=="brk")br+=x.v});
  var last=p.items[p.items.length-1].dep,trv=last-p.start-sight-br,free=p.end-last;
  var sm=el("div","sum");[[st.length,"stops"],[dur(sight),"sightseeing"],[dur(trv),"est. travel"],[dur(br),"breaks"],[fm(last),"finish"],[dur(free),"free time"]].forEach(function(a){var d=el("div");d.appendChild(el("b",null,String(a[0])));d.appendChild(el("span","muted small",a[1]));sm.appendChild(d)});
  o.appendChild(el("b",null,"Plan for "+p.city+" · "+p.mode+" · "+dur(p.total)));o.appendChild(sm);
  var pg=el("div","prog");var bar=el("i");pg.appendChild(bar);o.appendChild(pg);o.appendChild(el("p","muted small","Time used: "+Math.round((last-p.start)/p.total*100)+"% of your available time."));
  setTimeout(function(){bar.style.width=Math.min(100,(last-p.start)/p.total*100)+"%"},60);
  var ol=el("ol","tl");p.items.forEach(function(x,i){var li=el("li",x.type=="brk"?"brk":"");li.style.animationDelay=i*.1+"s";
    li.appendChild(el("b",null,x.n));li.appendChild(el("div","small muted",fm(x.arr)+" – "+fm(x.dep)+" ("+dur(x.v)+")"+(x.tr?" · est. "+dur(x.tr)+" travel to next":"")));
    li.appendChild(el("div","small",x.why));li.appendChild(link(mapQ(x.q),"Search in Maps","small"));ol.appendChild(li)});
  o.appendChild(ol);
  o.appendChild(el("p","muted small","Estimates only: travel times are entered by you, not calculated from traffic or routing data. Stops are demo suggestions."));
  var r=el("div","row");[["Regenerate Plan",function(){$("pf").requestSubmit()}],["Save Itinerary",function(){store("tg-plan",p);toast("Itinerary saved on this device")}],["Print Trip Plan",function(){print()}],["Delete Saved",function(){store("tg-plan",null);toast("Saved itinerary deleted")}]].forEach(function(b){var bt=el("button","ghost",b[0]);bt.type="button";bt.onclick=b[1];r.appendChild(bt)});o.appendChild(r);
}
$("pf").onsubmit=function(e){e.preventDefault();var p=makePlan();if(p){renderPlan(p);toast("Plan created")}};
$("pload").onclick=function(){fill({pc:"New Delhi",ps:"09:00",ph:6,pm:0,pv:50,pt:20,pb:40,px:6,pi:"history",pr:"Public Transport"});$("pf").requestSubmit()};
$("preset").onclick=function(){$("pf").reset();var o=$("pout");clear(o);o.appendChild(el("p","muted","No plan yet. Fill the form or load demo data."))};
var sp=store("tg-plan");if(sp&&sp.items)renderPlan(sp);

/* budget */
var split={e:[25,25,25,10,5,10],s:[20,30,25,10,5,10],p:[15,40,20,10,5,10]},bn=["Transport","Accommodation","Food","Activities & tickets","Shopping","Emergency reserve"];
$("bf").onsubmit=function(e){
  e.preventDefault();var a=num("ba",1,1e8),n=num("bt",1,50),d=num("bd",1,60);
  if(a===null||n===null||d===null){toast("Enter a budget, travelers (1-50) and days (1-60).");return}
  a=Math.round(a);var pc=split[$("bs").value],amt=pc.map(function(p){return Math.floor(a*p/100)}),sum=amt.reduce(function(x,y){return x+y},0);amt[5]+=a-sum;
  var o=$("bout");clear(o);var s=el("div","sum");[[inr(a),"total"],[inr(a/n),"per person"],[inr(a/d),"per day"],[inr(a-amt.reduce(function(x,y){return x+y},0)),"unallocated"]].forEach(function(x){var dv=el("div");dv.appendChild(el("b",null,x[0]));dv.appendChild(el("span","muted small",x[1]));s.appendChild(dv)});o.appendChild(s);
  var bars=[];bn.forEach(function(nm,i){var r=el("div","bi");r.appendChild(el("span",null,nm));var b=el("div","bar"),f=el("i");b.appendChild(f);r.appendChild(b);r.appendChild(el("span",null,inr(amt[i])+" · "+pc[i]+"%"));o.appendChild(r);bars.push([f,pc[i]])});
  setTimeout(function(){bars.forEach(function(b){b[0].style.width=b[1]*2.5+"%"})},60);
  o.appendChild(el("p","muted small","Estimates for planning, not actual local prices. Rounding difference is added to the emergency reserve so totals match exactly."));toast("Budget calculated");
};
$("bload").onclick=function(){fill({ba:5000,bt:2,bd:2,bs:"s"});$("bf").requestSubmit()};

/* route */
var dests=["",""];
function rdraw(){var c=$("rd");clear(c);dests.forEach(function(v,i){var r=el("div","dr"),inp=el("input");inp.value=v;inp.placeholder="Destination "+(i+1);inp.setAttribute("aria-label","Destination "+(i+1));inp.oninput=function(){dests[i]=inp.value};r.appendChild(inp);
  [["↑",-1],["↓",1]].forEach(function(b){var bt=el("button","ghost",b[0]);bt.type="button";bt.setAttribute("aria-label","Move "+(b[1]<0?"up":"down"));bt.onclick=function(){var j=i+b[1];if(j<0||j>=dests.length)return;var t=dests[i];dests[i]=dests[j];dests[j]=t;rdraw()};r.appendChild(bt)});
  var x=el("button","ghost","✕");x.type="button";x.setAttribute("aria-label","Remove");x.onclick=function(){dests.splice(i,1);if(!dests.length)dests=[""];rdraw()};r.appendChild(x);c.appendChild(r)})}
$("radd").onclick=function(){if(dests.length>=5){toast("Maximum 5 destinations.");return}dests.push("");rdraw()};
$("rgo").onclick=function(){
  var s=$("rs").value.trim(),d=dests.map(function(x){return x.trim()}).filter(Boolean);
  if(!s||!d.length){toast("Enter a starting point and at least one destination.");return}
  var url="https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(s)+"&destination="+encodeURIComponent(d[d.length-1])+(d.length>1?"&waypoints="+d.slice(0,-1).map(encodeURIComponent).join("%7C"):"")+"&travelmode="+$("rm").value;
  var o=$("rout");clear(o);var ol=el("ol","tl");[s].concat(d).forEach(function(x,i){var li=el("li");li.style.animationDelay=i*.1+"s";li.appendChild(el("b",null,(i?"Stop "+i+": ":"Start: ")+x));ol.appendChild(li)});
  o.appendChild(ol);o.appendChild(link(url,"Open directions in Google Maps"));o.appendChild(el("p","muted small","This is your chosen order, not necessarily the shortest. Distance, traffic and ETA come from Google Maps."));toast("Route ready");
};
$("rreset").onclick=function(){$("rs").value="";dests=["",""];rdraw();clear($("rout"))};rdraw();

/* photo + emergency */
var photos=[["🌅","Sunrise & Sunset","Golden-hour views","Around sunrise/sunset","sunset viewpoint"],["🏛","Historical Architecture","Heritage buildings","Morning, soft light","historical monuments"],["🌳","Parks & Gardens","Greenery and flowers","Early morning","parks and gardens"],["🏞","Lakes & Rivers","Water reflections","Golden hour","lake or riverfront"],["🌆","City Viewpoints","Skyline views","Dusk to night","city viewpoint"],["🚶","Street Photography","Everyday life","Late afternoon","street photography markets"],["⛰","Nature & Landscapes","Open scenery","Sunrise","scenic nature spots"]];
photos.forEach(function(p){$("pg").appendChild(tile(p[0],p[1],p[2]+" · Best: "+p[3]+" (general guidance)",function(){search(p[1],p[4])}))});
[["🏥","Nearest Hospital","hospital"],["🚑","Emergency Room","emergency room"],["💊","Pharmacy","pharmacy"],["🚓","Police Station","police station"],["🏧","ATM","ATM"]].forEach(function(e){$("eg").appendChild(tile(e[0],"Find "+e[1],"",function(){search(e[1],e[2]);$("nearby").scrollIntoView()}))});

/* language */
var L={hi:"Dhanyavaad|Yeh kitne ka hai?|Aspatal kahan hai?|Sabse nazdeeki ATM kahan hai?|Kripya meri madad kijiye|Railway station kahan hai?|Taxi kahan mil sakti hai?|Sabse nazdeeki bus stop kahan hai?|Mujhe raasta batayiye",
bn:"Dhonnobad|Eta koto taka?|Haspatal kothay?|Sobcheye kachher ATM kothay?|Doya kore amake sahajyo korun|Railway station kothay?|Taxi kothay pabo?|Sobcheye kachher bus stop kothay?|Amake rasta bolun",
ta:"Nandri|Idhu evvalavu?|Maruthuvamanai enge irukku?|Aruginil ATM enge irukku?|Dayavu seidhu udhavunga|Railway station enge irukku?|Taxi enge kidaikkum?|Aruginil bus stop enge irukku?|Vazhi sollunga",
mr:"Dhanyavaad|Hyachi kimmat kiti?|Rugnalay kuthe aahe?|Javalcha ATM kuthe aahe?|Krupaya madat kara|Railway station kuthe aahe?|Taxi kuthe milel?|Javalcha bus stop kuthe aahe?|Mala rasta sanga"};
var en=["Thank you","How much does this cost?","Where is the hospital?","Where is the nearest ATM?","Please help me","Where is the railway station?","Where can I find a taxi?","Where is the nearest bus stop?","I need directions"];
function copy(t){function ok(){toast("Copied: "+t)}if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(ok,function(){fb(t)})}else fb(t);
  function fb(x){try{var a=document.createElement("textarea");a.value=x;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();var s=document.execCommand("copy");document.body.removeChild(a);s?ok():toast("Copy failed. Select the text manually.")}catch(e){toast("Copy failed. Select the text manually.")}}}
function ldraw(hl){var c=$("pl");clear(c);L[$("lg").value].split("|").forEach(function(t,i){var r=el("div",i===hl?"hl":"");var a=el("div");a.appendChild(el("b",null,en[i]));r.appendChild(a);r.appendChild(el("div",null,t));var b=el("button","ghost","Copy");b.onclick=function(){copy(t)};r.appendChild(b);c.appendChild(r)})}
$("lg").onchange=function(){ldraw()};ldraw();

/* demo */
function demo(){
  toast("Loading demo for Connaught Place, New Delhi…");
  $("loc").value="Connaught Place, New Delhi";coords=null;$("hq").value=$("loc").value;recent($("loc").value);
  $("pload").click();$("bload").click();
  $("rs").value="Connaught Place, New Delhi";dests=["India Gate","Humayun's Tomb","Lodhi Garden"];rdraw();$("rgo").click();
  search("Hospital","hospital");$("lg").value="hi";ldraw(2);
  $("planner").scrollIntoView();
  setTimeout(function(){toast("Demo loaded: plan, budget (₹5,000), route, Maps links and Hindi phrase")},1800);
}
$("demoNav").onclick=demo;$("demoHero").onclick=demo;
})();