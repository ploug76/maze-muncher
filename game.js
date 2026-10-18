const MAZES=[["###################", "#........#........#", "#o##.###.#.###.##o#", "#.................#", "#.##.#.#####.#.##.#", "#....#...#...#....#", "####.###_#_###.####", "xxx#.#_______#.#xxx", "####.#_##-##_#.####", "____.__#PPP#__.____", "####.#_#####_#.####", "xxx#.#_______#.#xxx", "####.#_#####_#.####", "#........#........#", "#.##.###.#.###.##.#", "#o.#.....S.....#.o#", "##.#.#.#####.#.#.##", "#....#...#...#....#", "#.######.#.######.#", "#.................#", "###################"], ["###################", "#o...#.......#...o#", "#.##.#.#####.#.##.#", "#.................#", "##.##.###.###.##.##", "x#.#...........#.#x", "x#.#.#_##-##_#.#.#x", "##.#.#_#PPP#_#.#.##", "__.#.#_#####_#.#.__", "##.#.._______..#.##", "x#.###.#####.###.#x", "x#...............#x", "##.##.###.###.##.##", "#.................#", "#.##.#.#.#.#.#.##.#", "#o.#...#.S.#...#.o#", "##.#.###.#.###.#.##", "#.................#", "#.####.##.##.####.#", "#.................#", "###################"]];
const COLS=19,ROWS=21,DX=[1,0,-1,0],DY=[0,1,0,-1];
const GH=[{n:'BLAZE',c:'#f83c3c',sc:[18,-3]},{n:'DASH',c:'#f878c8',sc:[0,-3]},{n:'JINX',c:'#38e0e8',sc:[18,23]},{n:'MOPEY',c:'#f8a038',sc:[0,23]}];
const TREATS=[['DONUT',100,'#f8a0c8'],['PRETZEL',300,'#c8843c'],['ICE CREAM',500,'#f8f0d8'],['COOKIE',700,'#a8743c'],['CUPCAKE',1000,'#f878a8'],['CAKE',2000,'#f8e0a0'],['PIE',3000,'#e8a83c'],['CANDY',5000,'#f83c8c']];
const PAL=[['#2c3cf8','#0a0c40'],['#e83c8c','#3a0c24'],['#38c868','#0a3018'],['#f8a038','#3a2008'],['#9c5cf8','#20103c'],['#38c8e8','#08283a']];
let grid=[],dots=0,eaten=0,pl,gs=[],want=-1,lives=3,phase='',phT=0,modeI=0,modeT=0,fright=0,chain=0,treat=null,freeze=0,lvT=0,nextLife=10000,penY=0,doorY=0,bonusXY=[9,0],TS=20,ox=0,oy=0,mzc=null,waka=0,dieT=0,eatPop=null;
const SCHED=[420,1200,420,1200,300,1200,300,1e9];
function onResize(){TS=Math.min(W/19.6,(H-120*S)/21);ox=(W-19*TS)/2;oy=58*S+Math.max(0,(H-58*S-60*S-21*TS)*.35);mzc=null}
function cell(x,y){if(y<0||y>=ROWS)return'#';x=((x%COLS)+COLS)%COLS;return grid[y][x]}
function canP(x,y){return '._oS'.includes(cell(x,y))}
function canG(x,y){return '._oS'.includes(cell(x,y))}
function wrap(e){e.tx=((e.tx%COLS)+COLS)%COLS}
function loadMaze(){const m=MAZES[(level-1)%MAZES.length];grid=m.map(r=>r.split(''));dots=0;eaten=0;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if('.o'.includes(grid[y][x]))dots++;if(grid[y][x]=='-'){doorY=y}if(grid[y][x]=='P')penY=y}
 for(let y=penY+1;y<ROWS;y++)if(grid[y][9]=='_'){bonusXY=[9,y];break}mzc=null}
function startGame(lv){score=0;level=lv;lives=3;nextLife=10000;state='play';loadMaze();resetActors();phase='ready';phT=0;SND.start();ui()}
function resetActors(){let sx=9,sy=15;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(grid[y][x]=='S'){sx=x;sy=y}
 pl={tx:sx,ty:sy,dir:2,p:0,mouth:0};want=-1;gs=GH.map((d,i)=>({i,tx:9,ty:doorY-1,dir:2,p:0,mode:i==0?'run':'pen',fx:8+i%3==0?9:[9,9,8,10][i],fy:penY,rel:[0,90,300,540][i],dotRel:[0,0,30,60][i],fr:0,bob:i}));
 gs[0].fx=9;gs[0].fy=doorY-1;modeI=0;modeT=0;fright=0;treat=null;lvT=0;freeze=0}
function lf(){return Math.min(1.12,.86+.035*(level-1))}
function inTunnel(e){return grid[e.ty]&&(e.tx<4||e.tx>14)&&grid[e.ty][0]!='#'&&grid[e.ty][0]!='x'}
function scatter(){return SCHED[modeI]&&modeI%2==0}
function target(g){const P=[pl.tx,pl.ty],d=pl.dir;if(g.mode=='eyes')return[9,doorY-1];if(scatter())return GH[g.i].sc;
 if(g.i==0)return P;if(g.i==1)return[P[0]+DX[d]*4,P[1]+DY[d]*4];if(g.i==2){const v=[P[0]+DX[d]*2,P[1]+DY[d]*2],b=gs[0];return[v[0]*2-b.tx,v[1]*2-b.ty]}
 return Math.hypot(g.tx-P[0],g.ty-P[1])>8?P:GH[3].sc}
function choose(g){const rev=(g.dir+2)%4;let opts=[];for(const d of[3,2,1,0]){if(d==rev)continue;if(canG(g.tx+DX[d],g.ty+DY[d]))opts.push(d)}if(!opts.length){g.dir=rev;return}
 if(g.fr&&g.mode=='run'){g.dir=PICK(opts);return}const T=target(g);let bd=1e9,bdir=opts[0];for(const d of opts){const nx=g.tx+DX[d],ny=g.ty+DY[d],dd=(nx-T[0])**2+(ny-T[1])**2;if(dd<bd){bd=dd;bdir=d}}g.dir=bdir}
function gSpeed(g){if(g.mode=='eyes')return .3;let s=.122*lf();if(g.fr)s=.07;else if(inTunnel(g))s=.065;else if(g.i==0&&dots-eaten<25)s*=1.1;return s}
function stepG(g){if(g.mode=='pen'){g.fy=penY+Math.sin((lvT+g.bob*20)*.12)*.3;if(lvT>=g.rel||eaten>=g.dotRel&&g.dotRel>0&&lvT>60)g.mode='leave';return}
 if(g.mode=='leave'||g.mode=='enter'){const tx=9,ty=g.mode=='leave'?doorY-1:penY;const sp=g.mode=='enter'?.2:.07;if(Math.abs(g.fx-tx)>.01){g.fx+=CL(tx-g.fx,-sp,sp)}else{g.fx=tx;g.fy+=CL(ty-g.fy,-sp,sp);if(Math.abs(g.fy-ty)<.01){if(g.mode=='leave'){g.mode='run';g.tx=9;g.ty=doorY-1;g.dir=R()<.5?0:2;g.p=0;g.fr=0}else{g.mode='leave';g.fr=0}}}return}
 g.p+=gSpeed(g);while(g.p>=1){g.p-=1;g.tx+=DX[g.dir];g.ty+=DY[g.dir];wrap(g);if(g.mode=='eyes'&&g.tx==9&&g.ty==doorY-1){g.mode='enter';g.fx=9;g.fy=doorY-1;g.p=0;return}choose(g)}}
function pos(e){if(e.mode&&e.mode!='run'&&e.mode!='eyes')return[e.fx,e.fy];return[e.tx+DX[e.dir]*e.p,e.ty+DY[e.dir]*e.p]}
function eatAt(){const c=grid[pl.ty][pl.tx];if(c=='.'||c=='o'){grid[pl.ty][pl.tx]='_';eaten++;mzc=null;if(c=='.'){score+=10;SND.waka()}else{score+=50;powerUp()}
  if(eaten==60||eaten==140){const k=TREATS[Math.min(TREATS.length-1,level-1)];treat={k,t:570}}chkLife();saveBest();if(eaten>=dots){phase='clear';phT=0;SND.clear()}}
 if(treat&&pl.tx==bonusXY[0]&&pl.ty==bonusXY[1]){score+=treat.k[1];eatPop={s:''+treat.k[1],x:bonusXY[0],y:bonusXY[1],t:90};treat=null;SND.treat();chkLife();saveBest()}}
function chkLife(){if(score>=nextLife){lives++;nextLife+=10000;SND.life();say('EXTRA LIFE!',90)}}
function powerUp(){fright=Math.round(Math.max(1.2,6.5-.55*(level-1))*60);chain=0;for(const g of gs){if(g.mode=='run'){g.fr=1;g.dir=(g.dir+2)%4;g.tx+=DX[(g.dir+2)%4]*0;g.p=1-g.p;g.tx-=DX[g.dir];g.ty-=DY[g.dir];wrap(g)}else if(g.mode=='pen'||g.mode=='leave')g.fr=1}SND.power()}
function stepP(){const sp=.135*lf()*(fright?1.08:1)*(inTunnel(pl)?.85:1);
 if(pl.p>0&&want==(pl.dir+2)%4){pl.tx+=DX[pl.dir];pl.ty+=DY[pl.dir];wrap(pl);pl.dir=want;pl.p=1-pl.p}
 if(pl.p>0&&pl.p<.22&&want>=0&&want%2!=pl.dir%2&&canP(pl.tx+DX[want],pl.ty+DY[want])){pl.dir=want;pl.p=0}
 if(pl.p==0){if(want>=0&&canP(pl.tx+DX[want],pl.ty+DY[want]))pl.dir=want;if(!canP(pl.tx+DX[pl.dir],pl.ty+DY[pl.dir])){pl.mv=0;return}}
 pl.mv=1;pl.p+=sp;pl.mouth+=.25;
 while(pl.p>=1){pl.p-=1;pl.tx+=DX[pl.dir];pl.ty+=DY[pl.dir];wrap(pl);eatAt();if(phase!='play')return;
  if(want>=0&&canP(pl.tx+DX[want],pl.ty+DY[want]))pl.dir=want;if(!canP(pl.tx+DX[pl.dir],pl.ty+DY[pl.dir])){pl.p=0;break}}}
function update(){if(eatPop&&--eatPop.t<=0)eatPop=null;if(state!='play')return;phT++;
 if(phase=='ready'){if(phT>120)phase='play',phT=0;return}
 if(phase=='die'){if(phT>110){lives--;if(lives<=0){state='over';overT=t;saveBest();ui();SND.over();return}resetActors();gs.forEach((g,i)=>{g.dotRel=0});phase='ready';phT=40}return}
 if(phase=='clear'){if(phT>160){level++;loadMaze();resetActors();phase='ready';phT=0;SND.start()}return}
 if(freeze>0){freeze--;return}
 lvT++;if(fright>0){fright--;if(!fright)gs.forEach(g=>g.fr=0)}else{modeT++;if(modeT>=SCHED[modeI]){modeT=0;modeI++;gs.forEach(g=>{if(g.mode=='run'){g.p=1-g.p;g.tx+=DX[g.dir];g.ty+=DY[g.dir];wrap(g);g.dir=(g.dir+2)%4}})}}
 stepP();if(phase!='play')return;if(treat&&--treat.t<=0)treat=null;
 for(const g of gs){stepG(g)}
 const[ppx,ppy]=pos(pl);for(const g of gs){if(g.mode!='run')continue;const[gx,gy]=pos(g);let dx=Math.abs(gx-ppx);dx=Math.min(dx,COLS-dx);if(dx+Math.abs(gy-ppy)<.65){
  if(g.fr){g.fr=0;g.mode='eyes';const pts=200*2**chain;chain++;score+=pts;eatPop={s:''+pts,x:gx,y:gy,t:45};freeze=40;SND.eat();chkLife();saveBest()}else{phase='die';phT=0;SND.die();return}}}}
function X(x){return ox+(x+.5)*TS}function Y(y){return oy+(y+.5)*TS}
function buildMaze(){mzc=document.createElement('canvas');mzc.width=W;mzc.height=H;const m=mzc.getContext('2d'),[wc,fc]=PAL[(level-1)%PAL.length];const fl=phase=='clear'&&Math.floor(phT/12)%2;
 const isW=(x,y)=>{const c=y<0||y>=ROWS?'#':cell(x,y);return c=='#'||c=='x'};
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const c=grid[y][x],px=ox+x*TS,py=oy+y*TS;if(c=='#'){m.fillStyle=fc;m.fillRect(px,py,TS+.5,TS+.5);m.strokeStyle=fl?'#fff':wc;m.lineWidth=Math.max(2,TS*.12);m.lineCap='square';const e=TS*.15;m.beginPath();
   const L=!isW(x-1,y),Rr=!isW(x+1,y),T=!isW(x,y-1),B=!isW(x,y+1);
   if(T&&y>0){m.moveTo(px+(L?e:0),py+e);m.lineTo(px+TS-(Rr?e:0),py+e)}if(B&&y<ROWS-1){m.moveTo(px+(L?e:0),py+TS-e);m.lineTo(px+TS-(Rr?e:0),py+TS-e)}if(L&&x>0){m.moveTo(px+e,py+(T?e:0));m.lineTo(px+e,py+TS-(B?e:0))}if(Rr&&x<COLS-1){m.moveTo(px+TS-e,py+(T?e:0));m.lineTo(px+TS-e,py+TS-(B?e:0))}m.stroke()}
  else if(c=='-'){m.fillStyle='#f8a0d8';m.fillRect(px,py+TS*.4,TS,TS*.2)}else if(c=='.'){m.fillStyle='#f8e0c0';m.fillRect(px+TS*.42,py+TS*.42,TS*.16,TS*.16)}}
 m.strokeStyle=wc;m.lineWidth=Math.max(2,TS*.14);m.strokeRect(ox+TS*.1,oy+TS*.1,COLS*TS-TS*.2,ROWS*TS-TS*.2)}
function muncher(x,y,dir,mo,sc){const r=TS*.46*(sc??1);if(r<=0)return;g.save();g.translate(x,y);g.rotate([0,Math.PI/2,Math.PI,-Math.PI/2][dir]);const a=Math.abs(Math.sin(mo))*.7+.04;
 g.fillStyle='#8cf838';g.beginPath();g.moveTo(0,0);g.arc(0,0,r,a,TAU-a);g.closePath();g.fill();g.fillStyle='#5cc828';g.beginPath();g.arc(-r*.2,r*.1,r*.55,1.2,2.6);g.lineTo(-r*.2,r*.1);g.fill();
 const ey=dir==2?r*.45:-r*.45;g.fillStyle='#fff';g.beginPath();g.arc(r*.05,ey,r*.26,0,TAU);g.fill();g.fillStyle='#111';g.beginPath();g.arc(r*.13,ey,r*.13,0,TAU);g.fill();
 g.fillStyle='#4ca818';g.beginPath();g.moveTo(-r*.5,-r*.75*(dir==2?-1:1));g.lineTo(-r*.2,-r*1.15*(dir==2?-1:1));g.lineTo(-r*.05,-r*.85*(dir==2?-1:1));g.fill();g.restore()}
function gloop(gh,x,y){const r=TS*.48,d=gh.dir;g.save();g.translate(x,y);if(gh.mode=='eyes'){eyes(0,0,r,d,'#fff');g.restore();return}
 const fl=gh.fr&&fright<120&&Math.floor(fright/12)%2;const col=gh.fr?(fl?'#f8f8f8':'#2c3cd8'):GH[gh.i].c;g.fillStyle=col;
 g.beginPath();g.moveTo(-r,r*.55);g.lineTo(-r,-r*.2);g.quadraticCurveTo(-r,-r,0,-r);g.quadraticCurveTo(r,-r,r,-r*.2);g.lineTo(r,r*.55);g.lineTo(-r,r*.55);g.fill();
 const b=Math.sin(t*.4+gh.i)*r*.12;for(const fx of[-.62,0,.62]){g.beginPath();g.ellipse(fx*r,r*.62+(fx==0?b:-b),r*.3,r*.26,0,0,TAU);g.fill()}
 if(!gh.fr){g.strokeStyle=col;g.lineWidth=r*.16;g.lineCap='round';g.beginPath();
  if(gh.i==0){g.fillStyle='#f8d838';g.beginPath();g.moveTo(-r*.3,-r*.85);g.lineTo(-r*.1,-r*1.35);g.lineTo(r*.05,-r*.9);g.lineTo(r*.25,-r*1.25);g.lineTo(r*.35,-r*.8);g.fill()}
  else if(gh.i==1){g.moveTo(0,-r);g.lineTo(r*.2,-r*1.35);g.stroke();circ(r*.2,-r*1.38,r*.15,'#fff')}
  else if(gh.i==2){g.moveTo(-r*.6,-r*.75);g.lineTo(-r*.85,-r*1.2);g.moveTo(r*.6,-r*.75);g.lineTo(r*.85,-r*1.2);g.stroke()}
  else{g.fillStyle='#7a4a1c';g.beginPath();g.ellipse(0,-r*.82,r*.9,r*.2,-.15,0,TAU);g.fill();g.fillRect(-r*.45,-r*1.2,r*.9,r*.4)}
  eyes(0,-r*.05,r,d,'#fff')}else{g.strokeStyle=fl?'#d82c2c':'#f8d0a0';g.lineWidth=r*.1;g.beginPath();for(let i=0;i<=6;i++)g.lineTo(-r*.6+i*r*.2,r*.25+(i%2?-1:1)*r*.08);g.stroke();circ(-r*.3,-r*.25,r*.12,fl?'#d82c2c':'#f8d0a0');circ(r*.3,-r*.25,r*.12,fl?'#d82c2c':'#f8d0a0')}
 g.restore()}
function eyes(x,y,r,d,c){for(const s of[-1,1]){g.fillStyle=c;g.beginPath();g.ellipse(x+s*r*.36,y-r*.15,r*.26,r*.32,0,0,TAU);g.fill();g.fillStyle='#1838a8';g.beginPath();g.arc(x+s*r*.36+DX[d]*r*.12,y-r*.15+DY[d]*r*.14,r*.14,0,TAU);g.fill()}}
function treatIcon(k,x,y,r){const[n,,c]=k;g.save();g.translate(x,y);
 if(n=='DONUT'){g.fillStyle='#c8843c';g.beginPath();g.arc(0,0,r,0,TAU);g.fill();g.fillStyle=c;g.beginPath();g.arc(0,-r*.05,r*.85,0,TAU);g.fill();circ(0,0,r*.32,'#05040e');[[.5,-.3,'#38e0e8'],[-.5,-.2,'#f8d838'],[.1,.6,'#fff']].forEach(([a,b,cc])=>{g.fillStyle=cc;g.fillRect(a*r,b*r,r*.18,r*.1)})}
 else if(n=='PRETZEL'){g.strokeStyle=c;g.lineWidth=r*.3;g.beginPath();g.arc(-r*.4,-r*.1,r*.5,0,TAU);g.stroke();g.beginPath();g.arc(r*.4,-r*.1,r*.5,0,TAU);g.stroke()}
 else if(n=='ICE CREAM'){g.fillStyle='#e8b86c';g.beginPath();g.moveTo(-r*.55,0);g.lineTo(r*.55,0);g.lineTo(0,r*1.1);g.fill();circ(0,-r*.3,r*.6,c);circ(0,-r*.9,r*.15,'#f83c3c')}
 else if(n=='COOKIE'){circ(0,0,r,c);[[-.4,-.3],[.3,-.4],[.1,.3],[-.3,.45],[.5,.2]].forEach(([a,b])=>circ(a*r,b*r,r*.14,'#3a2008'))}
 else if(n=='CUPCAKE'){g.fillStyle='#f8d8a0';g.fillRect(-r*.6,0,r*1.2,r*.8);circ(0,-r*.1,r*.7,c);circ(0,-r*.8,r*.18,'#f83c3c')}
 else if(n=='CAKE'){g.fillStyle=c;g.fillRect(-r*.9,-r*.3,r*1.8,r*1);g.fillStyle='#f878a8';g.fillRect(-r*.9,-r*.4,r*1.8,r*.25);g.fillStyle='#fff';g.fillRect(-r*.08,-r*1,r*.16,r*.6);circ(0,-r*1.05,r*.12,'#f8a038')}
 else if(n=='PIE'){g.fillStyle=c;g.beginPath();g.ellipse(0,0,r,r*.6,0,0,TAU);g.fill();g.strokeStyle='#a8641c';g.lineWidth=r*.1;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*r*.3,-r*.5);g.lineTo(i*r*.3,r*.5);g.stroke()}}
 else{g.fillStyle=c;g.beginPath();g.ellipse(0,0,r*.6,r*.45,0,0,TAU);g.fill();g.beginPath();g.moveTo(-r*.55,0);g.lineTo(-r,-r*.4);g.lineTo(-r,r*.4);g.fill();g.beginPath();g.moveTo(r*.55,0);g.lineTo(r,-r*.4);g.lineTo(r,r*.4);g.fill()}
 g.restore()}
function draw(){g.fillStyle='#05040e';g.fillRect(0,0,W,H);
 if(state=='title'){txt('MAZE',W/2,H*.12,58*S,'#8cf838','#000');txt('MUNCHER',W/2,H*.12+58*S,50*S,'#9c5cf8','#000');
  const y0=H*.3;GH.forEach((gh,i)=>{gloop({i,dir:0,mode:'run'},W*.22,y0+i*46*S);txt(gh.n,W*.36,y0+i*46*S,17*S,gh.c,null,'left');txt(['chases you directly','cuts you off ahead','flanks with Blaze','shy — wanders off'][i],W*.36,y0+i*46*S+17*S,11*S,'#aaa',null,'left')});
  TS=TS||20;muncher(W*.5+Math.sin(t*.03)*90*S,H*.62,Math.cos(t*.03)>0?0:2,t*.25,1.4);['Swipe to steer · eat every dot','Power pellets turn the Gloops blue','Grab the treats for bonus points'].forEach((s,i)=>txt(s,W/2,H*.7+i*22*S,14*S,'#fff'));
  txt(`BEST ${best}`,W/2,H*.7+74*S,15*S,'#f8d838');if(t%60<40)txt('TAP TO START',W/2,H*.88,24*S,'#fff','#000');return}
 if(!mzc||phase=='clear')buildMaze();g.drawImage(mzc,0,0,W,H);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(grid[y][x]=='o'&&(t%30<20||phase!='play'))circ(X(x),Y(y),TS*.3,'#f8e0c0');
 if(treat)treatIcon(treat.k,X(bonusXY[0]),Y(bonusXY[1]),TS*.42);
 g.save();g.beginPath();g.rect(ox,oy,COLS*TS,ROWS*TS);g.clip();
 if(phase!='clear'&&!(phase=='die'&&phT>30))for(const gh of gs){const[x,y]=pos(gh);if(!(freeze>0&&eatPop&&Math.abs(x-eatPop.x)<.1&&Math.abs(y-eatPop.y)<.1))gloop(gh,X(x),Y(y));if(x<0.5)gloop(gh,X(x+COLS),Y(y));if(x>COLS-1.5)gloop(gh,X(x-COLS),Y(y))}
 const[px,py]=pos(pl);if(phase=='die'){if(phT>30)muncher(X(px),Y(py),3,Math.min(1.5,(phT-30)*.03)+.2,Math.max(0,1-(phT-30)/70))}else if(!(freeze>0)){muncher(X(px),Y(py),pl.dir,pl.mv||phase!='play'?pl.mouth:.6);if(px<.5)muncher(X(px+COLS),Y(py),pl.dir,pl.mouth);if(px>COLS-1.5)muncher(X(px-COLS),Y(py),pl.dir,pl.mouth)}
 g.restore();if(eatPop)txt(eatPop.s,X(eatPop.x),Y(eatPop.y),TS*.6,'#38e0e8','#000');
 txt('SCORE',12*S,16*S,11*S,'#aaa',null,'left');txt(''+score,12*S,34*S,18*S,'#fff',null,'left');txt('BEST',W*.42,16*S,11*S,'#aaa');txt(''+best,W*.42,34*S,16*S,'#f8d838');txt('LV '+level,W*.62,26*S,15*S,'#9c5cf8');
 const by=oy+ROWS*TS+20*S;for(let i=0;i<Math.min(lives-1,6);i++)muncher(ox+TS*(.6+i*1.2),by,0,.6,.8);for(let i=0;i<Math.min(level,7);i++)treatIcon(TREATS[Math.min(7,level-1-i)],ox+COLS*TS-TS*(.6+i*1.3),by,TS*.38);
 if(phase=='ready')txt('READY!',W/2,Y(bonusXY[1]),TS*.9,'#f8d838','#000');if(msgT>0)txt(msg,W/2,H*.2,22*S,'#fff','#000');
 if(state=='over'){panel(H*.3,180*S,'#7a3cd8');txt('GAME OVER',W/2,H*.3+40*S,32*S,'#f86c6c');txt(`SCORE ${score}`,W/2,H*.3+82*S,20*S,'#fff');txt(`LEVEL ${level} · BEST ${best}`,W/2,H*.3+112*S,15*S,'#f8d838');if(t-overT>45&&t%50<35)txt('TAP TO PLAY AGAIN',W/2,H*.3+150*S,16*S,'#fff')}}
let sw=null;
c.addEventListener('pointerdown',e=>{A();if(paused)return;if(state=='title'||(state=='over'&&t-overT>45)){startGame(state=='title'?startLv:1);return}sw={id:e.pointerId,x:e.clientX,y:e.clientY};c.setPointerCapture(e.pointerId)});
c.addEventListener('pointermove',e=>{if(!sw||e.pointerId!=sw.id)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.hypot(dx,dy)>14){want=Math.abs(dx)>Math.abs(dy)?(dx>0?0:2):(dy>0?1:3);sw.x=e.clientX;sw.y=e.clientY}});
c.addEventListener('pointerup',()=>sw=null);c.addEventListener('pointercancel',()=>sw=null);
addEventListener('keydown',e=>{const k=e.key;if((k==' '||k=='Enter')&&(state=='title'||(state=='over'&&t-overT>45))){A();startGame(state=='title'?startLv:1);return}
 const m={ArrowRight:0,d:0,D:0,ArrowDown:1,s:1,S:1,ArrowLeft:2,a:2,A:2,ArrowUp:3,w:3,W:3}[k];if(m!==undefined){want=m;e.preventDefault()}});
const SND={waka:()=>{waka^=1;tone(waka?300:420,0,.07,'triangle',.06,waka?420:300)},power:()=>seq([220,330,440,660],.05,'square',.05),eat:()=>tone(200,0,.35,'square',.07,1400),treat:()=>seq([660,880,1100,1320],.05,'square',.06),
die:()=>{for(let i=0;i<10;i++)tone(700-i*55,i*.1,.1,'square',.05,600-i*55)},life:()=>seq([880,1175,1568],.1,'square',.06),clear:()=>seq([523,784,659,1046],.12,'square',.06),
start:()=>seq([392,523,659,523,698,659,587,523,494,523,0,784],.11,'square',.06),over:()=>seq([392,330,262,196],.22,'triangle',.12)};
MUSIC=i=>{if(phase!='play'||freeze)return;if(fright>0){tone(i%2?880:660,0,.09,'square',.02)}else{tone(200+(i%8)*25,0,.12,'sine',.025)}};
loadMaze();
