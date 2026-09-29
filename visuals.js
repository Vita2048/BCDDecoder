(function(scope){
 'use strict';
 const C={bg:'#091321',panel:'#101f30',line:'#33495e',muted:'#a8b9cd',off:'#667d94',ink:'#edf4fc',mint:'#77edcc',amber:'#ffc878',lav:'#aab6ff',pink:'#ffa8be'};
 const W=1792,H=640;
 let ctx; const measurements=[];
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=x=>1-Math.pow(1-clamp(x),3);
 function line(x,y,u,v,color=C.line,width=2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(u,v);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
 function rect(x,y,w,h,fill=C.panel,stroke=null,r=12){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
 function dot(x,y,r=5,color=C.mint){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
 function txt(s,x,y,size=30,color=C.ink,align='left',mono=false){if(typeof align==='boolean'){mono=align;align='left';}ctx.font=`${size}px "${mono?'Teaching Mono':'Teaching Sans'}"`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillStyle=color;ctx.fillText(s,x,y);const m=ctx.measureText(s);const left=align==='center'?x-m.width/2:align==='right'?x-m.width:x;measurements.push({s,x:left,y:y-size,width:m.width,height:size});}
 function para(s,x,y,width,size=30,color=C.muted,leading=1.42){let row='',dy=0;ctx.font=`${size}px "Teaching Sans"`;for(const word of s.split(' ')){const test=row?row+' '+word:word;if(ctx.measureText(test).width>width&&row){txt(row,x,y+dy,size,color);dy+=size*leading;row=word;}else row=test;}if(row)txt(row,x,y+dy,size,color);return dy+size*leading;}
 function arrow(x,y,u,v,color=C.muted,width=3){line(x,y,u,v,color,width);const a=Math.atan2(v-y,u-x);line(u,v,u-13*Math.cos(a-.5),v-13*Math.sin(a-.5),color,width);line(u,v,u-13*Math.cos(a+.5),v-13*Math.sin(a+.5),color,width);}
 function badge(s,x,y,w=180,color=C.mint){rect(x,y,w,44,color+'15',color,9);txt(s,x+w/2,y+30,24,color,'center');}
 function label(s,x,y,color=C.muted){txt(s,x,y,23,color);}
 function signal(x,y,value,name,scale=1){rect(x,y,86*scale,72*scale,value?C.mint+'16':C.bg,value?C.mint:C.off,10);txt(String(value),x+43*scale,y+53*scale,46*scale,value?C.mint:C.muted,'center',true);if(name)txt(name,x+43*scale,y-15,25*scale,C.muted,'center',true);}
 function gate(type,x,y,w=150,h=120,color=C.ink){
   ctx.save();ctx.translate(x,y);ctx.scale(w/150,h/120);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.fillStyle=C.panel;ctx.beginPath();
   if(type==='AND'){ctx.moveTo(0,0);ctx.lineTo(75,0);ctx.bezierCurveTo(173,0,173,120,75,120);ctx.lineTo(0,120);ctx.closePath();}
   else if(type==='OR'){ctx.moveTo(0,0);ctx.bezierCurveTo(80,0,125,30,150,60);ctx.bezierCurveTo(125,90,80,120,0,120);ctx.quadraticCurveTo(42,60,0,0);ctx.closePath();}
   else{ctx.moveTo(0,0);ctx.lineTo(130,60);ctx.lineTo(0,120);ctx.closePath();}
   ctx.fill();ctx.stroke();if(type==='NOT'){ctx.beginPath();ctx.arc(141,60,10,0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.restore();
 }
  const polys=[[[30,0],[102,0],[116,13],[102,26],[30,26],[16,13]],[[106,30],[119,17],[132,30],[132,104],[119,117],[106,104]],[[106,134],[119,121],[132,134],[132,208],[119,221],[106,208]],[[30,212],[102,212],[116,225],[102,238],[30,238],[16,225]],[[0,134],[13,121],[26,134],[26,208],[13,221],[0,208]],[[0,30],[13,17],[26,30],[26,104],[13,117],[0,104]],[[30,106],[102,106],[116,119],[102,132],[30,132],[16,119]]];
 function display(x,y,height,values,labels=false,focus=-1){const k=height/238;ctx.save();ctx.translate(x,y);ctx.scale(k,k);polys.forEach((p,i)=>{ctx.beginPath();p.forEach(([a,b],j)=>j?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fillStyle=values[i]?(focus<0||focus===i?C.mint:'#3b786f'):'#26374b';if(i===focus&&values[i])ctx.fillStyle=C.amber;ctx.fill();});ctx.restore();if(labels){const pos=[[66,-8],[146,67],[146,171],[66,262],[-14,171],[-14,67],[66,98]];pos.forEach(([u,v],i)=>txt('abcdefg'[i],x+u*k,y+v*k,25,C.ink,'center',true));}}
 function bits(n,x,y,gap=122,scale=1){[3,2,1,0].forEach((b,i)=>signal(x+i*gap,y,(n>>b)&1,'I'+['₀','₁','₂','₃'][b],scale));}
 function ruleRow(n,title,body,x,y,active=true){txt(String(n).padStart(2,'0'),x,y,25,active?C.amber:C.off,true);txt(title,x+62,y,32,active?C.ink:C.off);para(body,x+62,y+40,600,26,active?C.muted:C.off);}
 function phase(meta,phrase,fallback){const cue=(meta.phraseStarts||[])[phrase];return cue??fallback;}
 function crossed(s,x,y,w,color=C.off){txt(s,x,y,29,color,true);line(x-5,y-10,x+w,y-10,C.pink,2);}
 function drawIntro(t){
   label('4-BIT BCD INPUT',78,85);bits(5,75,176,126,1.04);txt('0 × 8 + 1 × 4 + 0 × 2 + 1 × 1',72,328,28,C.muted);badge('DECIMAL 5',198,360,235,C.amber);
   arrow(570,232,699,232,C.mint);rect(720,112,460,290,C.panel,C.line,18);txt('BCD → 7-SEGMENT',950,200,38,C.ink,'center');txt('DECODER',950,251,44,C.mint,'center');label('Combinational logic',828,321);
   for(let i=0;i<7;i++){const y=157+i*29;line(1180,y,1415,y,i===1||i===4?C.off:C.mint,3);txt('abcdefg'[i],1385,y-6,19,C.muted);}
   display(1500,102,326,BCD.evaluate(5).out);
   line(75,473,1708,473,C.line,2);const items=['01   Understand the gates','02   Simplify with a map','03   Simulate the circuit'];items.forEach((s,i)=>{ctx.globalAlpha=.35+.65*ease((t-8-i*3)/.8);txt(s,90+i*574,545,29,i===1?C.amber:C.mint);});ctx.globalAlpha=1;
 }
 function drawGate(idx,t,d){
   const type=idx===1?'AND':idx===2?'OR':'NOT';const single=type==='NOT';const count=single?2:4;const step=Math.min(count-1,Math.floor(Math.max(0,t-2)/((d-6)/count)));const a=single?step:(step>>1),b=step&1,out=single?1-a:type==='AND'?a&b:a|b;
   rect(35,35,1040,558,C.panel);rect(1110,35,648,558,C.panel);
   label('INPUTS',98,105);label('GATE',498,105);label('OUTPUT',882,105);label('TRUTH TABLE',1198,105);
   if(single){signal(100,255,a,'X',1.3);line(213,302,457,302,a?C.mint:C.off,4);gate(type,457,218,222,168);line(683,302,874,302,out?C.mint:C.off,4);signal(890,255,out,'NOT X',1.3);}
   else{signal(100,165,a,'X',1.25);signal(100,358,b,'Y',1.25);line(208,210,365,210,a?C.mint:C.off,4);line(365,210,365,253,a?C.mint:C.off,4);line(365,253,455+(type==='OR'?30:0),253,a?C.mint:C.off,4);line(208,403,365,403,b?C.mint:C.off,4);line(365,403,365,343,b?C.mint:C.off,4);line(365,343,455+(type==='OR'?30:0),343,b?C.mint:C.off,4);gate(type,455,203,236,190);line(691,298,874,298,out?C.mint:C.off,4);signal(890,250,out,'Q',1.3);}
   const cols=single?[1240,1560]:[1228,1405,1600];(single?['X','Q']:['X','Y','Q']).forEach((s,i)=>txt(s,cols[i],172,32,C.muted,'center',true));
   for(let j=0;j<count;j++){const y=single?270+j*132:244+j*77;const x=single?j:j>>1,z=j&1,r=single?1-x:type==='AND'?x&z:x|z;if(j===step)rect(1162,y-43,546,64,C.mint+'14',C.mint,8);(single?[x,r]:[x,z,r]).forEach((v,i)=>txt(String(v),cols[i],y,40,v?C.mint:C.muted,'center',true));}
   txt(single?'Q = X̅ = ¬X':type==='AND'?'Q = X · Y':'Q = X + Y',552,540,48,C.amber,'center',true);
 }
 function drawInterface(t,meta){
   label('ONE DECIMAL DIGIT',68,65);bits(5,68,157,160,1.3);['8','4','2','1'].forEach((s,i)=>txt(s,124+i*160,303,42,C.amber,'center',true));txt('BIT WEIGHT',67,363,23,C.muted);txt('0 × 8 + 1 × 4 + 0 × 2 + 1 × 1 = 5',68,433,31,C.ink,true);
   badge('VALID BCD: 0000–1001',76,502,534,C.mint);line(790,65,790,555,C.line);display(1060,118,327,BCD.evaluate(5).out,true);label('SEVEN ACTIVE-HIGH OUTPUTS',985,60);
   'abcdefg'.split('').forEach((s,i)=>{txt(s,1480,130+i*57,28,C.muted);txt(String(BCD.evaluate(5).out[i]),1560,130+i*57,34,BCD.evaluate(5).out[i]?C.mint:C.off,'center',true);});txt('1 = ON',1478,572,28,C.mint);
 }
 function truthTable(x,y,highlight=-1,compact=false){const h=compact?36:42,w=compact?492:550;label('DECIMAL',x+16,y);label('I₃ I₂ I₁ I₀',x+170,y);label('a',x+w-48,y,C.amber);line(x,y+18,x+w,y+18);for(let n=0;n<10;n++){const yy=y+55+n*h,v=BCD.evaluate(n).out[0];if(n===highlight)rect(x,yy-28,w,h-3,C.amber+'16',C.amber,6);txt(String(n),x+55,yy,26,C.muted,'center',true);txt(n.toString(2).padStart(4,'0').split('').join(' '),x+168,yy,27,C.ink,'left',true);txt(String(v),x+w-45,yy,28,v?C.mint:C.pink,'center',true);}}
 function drawTruth(t,d){const n=Math.min(9,Math.floor(t/(d/10)));truthTable(44,48,n);label('WHICH DIGITS NEED THE TOP SEGMENT?',705,51);for(let j=0;j<10;j++){const x=726+(j%5)*198,y=100+Math.floor(j/5)*248;display(x,y,155,BCD.evaluate(j).out,false,0);txt(String(j),x+43,y+200,34,j===1||j===4?C.pink:C.ink,'center',true);}badge('a = 0 only for 1 and 4',920,570,500,C.pink);}
 function map(x=135,y=147,sz=112,selected=[],active=-1,showX=true){
   txt('I₁ I₀',x+2*sz,y-83,28,C.amber,'center',true);txt('I₃ I₂',x-88,y-27,26,C.amber,'center',true);
   BCD.order.forEach((n,i)=>{txt(n.toString(2).padStart(2,'0'),x+(i+.5)*sz,y-28,31,C.ink,'center',true);txt(n.toString(2).padStart(2,'0'),x-40,y+(i+.5)*sz+11,31,C.ink,'center',true);});
   for(let r=0;r<4;r++)for(let c=0;c<4;c++){const n=BCD.order[r]*4+BCD.order[c],v=n<10?BCD.evaluate(n).out[0]:'X',cellX=x+c*sz,cellY=y+r*sz;rect(cellX+2,cellY+2,sz-4,sz-4,n===active?C.amber+'20':C.panel,null,3);txt(String(n),cellX+13,cellY+25,18,C.muted);txt(v==='X'&&!showX?'—':String(v),cellX+sz/2,cellY+sz*.67,43,v==='X'?C.amber:v?C.mint:C.pink,'center',true);}
   selected.forEach((gIndex,depth)=>{const g=BCD.groups[gIndex],inset=7+depth*4;for(let r=0;r<4;r++)for(let c=0;c<4;c++){const n=BCD.order[r]*4+BCD.order[c];if(!g.cells.includes(n))continue;const left=x+c*sz+inset,right=x+(c+1)*sz-inset,top=y+r*sz+inset,bottom=y+(r+1)*sz-inset;const has=(rr,cc)=>rr>=0&&rr<4&&cc>=0&&cc<4&&g.cells.includes(BCD.order[rr]*4+BCD.order[cc]);ctx.fillStyle=g.color+'10';ctx.fillRect(left,top,right-left,bottom-top);if(!has(r-1,c))line(left,top,right,top,g.color,4);if(!has(r+1,c))line(left,bottom,right,bottom,g.color,4);if(!has(r,c-1))line(left,top,left,bottom,g.color,4);if(!has(r,c+1))line(right,top,right,bottom,g.color,4);if(has(r,c+1)){if(!has(r-1,c))line(right,top,right+2*inset,top,g.color,4);if(!has(r+1,c))line(right,bottom,right+2*inset,bottom,g.color,4);}if(has(r+1,c)){if(!has(r,c-1))line(left,bottom,left,bottom+2*inset,g.color,4);if(!has(r,c+1))line(right,bottom,right,bottom+2*inset,g.color,4);}}});
   return {x,y,sz};
 }
 function drawMap(t,meta){
   const p=phase(meta,1,7);const samples=[0,1,5,7,8];const n=samples[Math.min(4,Math.floor(Math.max(0,t-p)/4))];truthTable(20,54,n,true);map(732,150,109,[],n);txt('GRAY-CODE ORDER',1260,86,26,C.amber);['00','01','11','10'].forEach((s,i)=>{badge(s,1270+i*113,121,83,i===Math.floor(Math.max(0,t-p)/2)%4?C.amber:C.muted);if(i<3)arrow(1359+i*113,143,1376+i*113,143,C.off,2);});
   para('One bit changes at each step.',1275,241,445,36,C.ink);para('The same input has the same output. Only its position changes.',1275,374,445,30,C.muted);badge(n.toString(2).padStart(4,'0')+' → cell '+n,1255,518,480,C.mint);
   const rr=BCD.order.indexOf(n>>2),cc=BCD.order.indexOf(n&3);const endX=732+cc*109+54,endY=150+rr*109+54;
   const q=ease((t-p)%4/1.1);if(t>=p&&q<1){dot(530+(endX-530)*q,300+(endY-300)*q,10,C.amber);}
 }
 function drawGrouping(t,meta){
   const stage=t>=phase(meta,2,13)?2:t>=phase(meta,1,6)?1:0;map(130,138,115,stage===0?[2]:stage===1?[3]:[0,3]);
   ruleRow(1,'Powers of two','Rectangles of 1, 2, 4, 8 or 16 cells.',806,108,true);
   ruleRow(2,'Edges touch; groups may overlap','The four corners form one wrapped group.',806,250,stage>=1);
   ruleRow(3,'X means “don’t care”','Use an X as 0 or 1 when simplifying. Never group a required 0.',806,395,stage>=2);
   if(stage>=1){arrow(136,616,238,616,C.pink,3);arrow(582,616,476,616,C.pink,3);txt('wrap',359,625,23,C.pink,'center');}
   if(stage>=2)badge('10–15 will be blanked separately',865,548,726,C.amber);
 }
 function drawDerive(t,meta){
   let stage=0;for(let i=1;i<=5;i++)if(t>=phase(meta,i,[0,5,13,19,26,35][i]))stage=i;
   const active=Math.max(0,Math.min(3,stage-1));const all=stage>=5;map(130,139,115,all?[0,1,2,3]:stage>0?[active]:[]);
   txt('a',800,95,46,C.amber);txt('= OR of the groups',852,95,35,C.muted);
   const descriptions=['I₁ stays 1; all other bits change.','I₃ stays 1; all other bits change.','I₂ = 1 and I₀ = 1 stay fixed.','I₂ = 0 and I₀ = 0 stay fixed.'];
   BCD.groups.forEach((g,i)=>{const shown=stage>i;rect(793,126+i*108,910,94,shown?g.color+'0b':C.panel,active===i&&!all&&shown?g.color:null,10);txt(i===0?'':' +',805,183+i*108,32,shown?g.color:C.off);txt(g.label,865,181+i*108,39,shown?g.color:C.off,'left',true);txt(shown?descriptions[i]:'Find the bits that do not change.',1110,179+i*108,26,shown?C.muted:C.off);});
   if(stage>0&&!all){const varying=[['I₃','I₂','I₀'],['I₂','I₁','I₀'],['I₃','I₁'],['I₃','I₁']][active];txt('Discard:',804,604,26,C.muted);varying.forEach((s,i)=>crossed(s,960+i*124,604,48));}else if(all)txt('a_raw = I₁ + I₃ + I₂·I₀ + ¬I₂·¬I₀',801,606,31,C.amber,'left',true);
 }
 function drawCircuit(t,meta){
   badge('a_raw = I₁ + I₃ + I₂·I₀ + ¬I₂·¬I₀',195,20,1395,C.amber);
   const y0=150,gap=110;const lits=[['I₁'],['I₃'],['I₂','I₀'],['¬I₂','¬I₀']];
   lits.forEach((ls,i)=>{const y=y0+i*gap;label('TERM '+(i+1),40,y+7,C.muted);if(i<2){txt(ls[0],238,y+12,40,C.mint,'left',true);line(333,y,1132,y,C.mint,3);}else{txt(ls[0],233,y-12,32,C.muted,'left',true);txt(ls[1],233,y+48,32,C.muted,'left',true);line(357,y-23,535,y-23,C.muted,3);line(357,y+35,535,y+35,C.muted,3);gate('AND',535,y-47,118,103,C.mint);line(653,y+4,1132,y+4,C.mint,3);}
     const targetX=i===0||i===3?1132:1150;line(1132,y+(i>1?4:0),targetX,y+(i>1?4:0),C.mint,3);
   });gate('OR',1110,105,223,430,C.mint);line(1333,320,1420,320,C.mint,4);txt('a_raw',1450,323,43,C.amber,'left',true);display(1620,190,225,[1,0,0,0,0,0,0]);
   txt('DIRECT SIGNALS',672,109,22,C.muted);txt('AND',553,600,27,C.muted);txt('OR',1210,574,27,C.muted);txt('Boolean structure • colors identify the logic path',835,605,24,C.muted);
 }
 const litOrder=['I3','nI3','I2','nI2','I1','nI1','I0','nI0'];
 function litLabel(s){return (s[0]==='n'?'¬':'')+'I'+['₀','₁','₂','₃'][Number(s.slice(-1))];}
 function pla(n,t,options={}){
   const ev=BCD.evaluate(n),staticMode=options.staticMode??false,stage=options.stage??4;const lx=274,dx=65,py=127,dy=27;const ox=956,od=58;
   rect(238,21,574,532,C.panel);rect(886,21,456,532,C.panel);rect(1405,21,365,591,C.panel);
   label('PRODUCT TERMS',20,46);label('AND PLANE · selected literals',270,46,C.amber);label('OR PLANE · shared terms',912,46,C.amber);
   litOrder.forEach((l,i)=>{const x=lx+dx*i,v=ev.v[l];const col=staticMode?C.off:v?C.mint:C.off;txt(litLabel(l),x,79,24,C.muted,'center',true);txt(stage>=1||staticMode?String(v):'·',x,109,24,col,'center',true);line(x,119,x,526,col,1.6);});
   Object.keys(BCD.outputs).forEach((s,j)=>{const x=ox+j*od;txt(s,x,80,28,C.ink,'center',true);line(x,104,x,538,staticMode?C.off:ev.raw[j]?C.mint:C.off,2);});
   BCD.terms.forEach((ls,i)=>{const y=py+i*dy,active=ev.product[i],col=staticMode?C.off:active?C.mint:C.off;txt(ls.map(litLabel).join('·'),19,y+7,22,staticMode?C.muted:active?C.mint:C.muted,'left',true);line(254,y,790,y,C.line,1);line(812,y,1325,y,col,active&&!staticMode?2.5:1.4);
     litOrder.forEach((l,j)=>{if(ls.includes(l))dot(lx+dx*j,y,4.4,staticMode?C.amber:ev.v[l]?C.mint:C.off);});
     rect(790,y-10,34,20,active&&!staticMode?C.mint+'25':C.bg,col,3);txt('&',807,y+7,18,col,'center');
     Object.values(BCD.outputs).forEach((ts,j)=>{if(ts.includes(i))dot(ox+j*od,y,4.5,staticMode?C.amber:active?C.mint:C.off);});
   });
   Object.keys(BCD.outputs).forEach((s,j)=>{const x=ox+j*od,col=ev.out[j]?C.mint:C.off;rect(x-17,532,34,28,C.bg,staticMode?C.off:ev.raw[j]?C.mint:C.off,3);txt('≥1',x,552,18,C.muted,'center');line(x,560,x,574,staticMode?C.off:ev.raw[j]?C.mint:C.off,2);rect(x-17,574,34,25,C.bg,staticMode?C.off:col,3);txt('&',x,593,19,C.muted,'center');txt(staticMode?'':String(ev.out[j]),x,630,24,col,'center',true);});
   txt('OR',1366,554,20,C.muted,'center');txt('VALID',803,614,22,ev.valid?C.mint:C.pink);line(877,610,1323,610,ev.valid?C.mint:C.pink,2);
   Object.keys(BCD.outputs).forEach((s,j)=>{const x=ox+j*od+22,col=ev.valid?C.mint:C.pink;dot(x,610,3,col);line(x,610,x,586,col,2);line(x,586,x-5,586,col,2);});
   txt('INPUT',1430,60,23,C.muted);txt(n.toString(2).padStart(4,'0'),1589,108,48,C.amber,'center',true);txt(n<=9?'DECIMAL '+n:'INVALID BCD',1589,147,24,n<=9?C.muted:C.pink,'center');display(1516,185,260,ev.out,true);badge('VALID = '+ev.valid,1464,486,243,ev.valid?C.mint:C.pink);txt('a b c d e f g',1590,553,25,C.muted,'center',true);txt(ev.out.join(' '),1590,587,27,C.mint,'center',true);
   if(options.stageName)badge(options.stageName,20,569,716,C.amber);
   else txt('● connection      crossing without a dot: no connection',20,602,23,C.muted);
   if(options.focus){const boxes={input:[244,58,549,482],and:[238,21,594,532],or:[886,21,456,532],output:[1405,21,365,591]};const b=boxes[options.focus];if(b)rect(...b,null,C.amber,12);}
   return ev;
 }
 function drawPLA(t,meta){let focus=t<phase(meta,2,12)?'input':t<phase(meta,3,19)?'and':t<phase(meta,4,25)?'or':null;pla(5,t,{staticMode:true,focus});if(t>=phase(meta,4,25)){const row=3;line(813,127+row*27,1325,127+row*27,C.amber,4);[0,3,4].forEach(j=>dot(956+j*58,127+row*27,7,C.amber));badge('¬I₂·¬I₀ is shared by a, d and e',21,551,722,C.amber);}}
 function drawValidity(t,meta){
   const invalid=t>=phase(meta,3,22),n=invalid?10:9,ev=BCD.evaluate(n);
   badge('VALID = ¬I₃ + ¬I₂·¬I₁',55,17,1052,C.amber);ruleRow(1,'I₃ = 0','All codes 0000–0111 are valid: digits 0–7.',57,133,true);ruleRow(2,'I₂ = 0 AND I₁ = 0','With I₃ = 1, this leaves 1000 and 1001: digits 8 and 9.',57,282,true);
   rect(56,414,1033,172,C.panel);txt('segment_raw',82,477,32,C.muted,'left',true);line(358,466,511,466,C.muted,3);txt('VALID',82,543,32,ev.valid?C.mint:C.pink,'left',true);line(264,532,511,532,ev.valid?C.mint:C.pink,3);gate('AND',511,434,140,133,C.ink);arrow(651,500,748,500,C.muted);txt('segment',792,511,35,C.mint,'left',true);
   rect(1168,16,567,571,C.panel);txt(n.toString(2).padStart(4,'0'),1450,87,49,C.amber,'center',true);display(1362,137,294,ev.out,true);badge('VALID = '+ev.valid,1290,486,320,ev.valid?C.mint:C.pink);
 }
 function drawTrace(t,meta){let phaseN=0;for(let i=1;i<5;i++)if(t>=phase(meta,i,i*5))phaseN=i;const focus=['input','input','and','or','output'][phaseN];const name=['BCD input = 0101','1 · True and inverted input rails','2 · Evaluate AND terms → OR outputs','3 · Active outputs: a, c, d, f, g','4 · VALID = 1 → display 5'][phaseN];pla(5,t,{focus,stageName:name});txt('Signal-path explanation; propagation delays are not modeled.',22,637,20,C.muted);}
 function simulationN(t,meta){const begin=meta.countStart??5,invalid=meta.invalidStart??27,finish=meta.invalidEnd??37;if(t<begin)return 0;if(t<invalid)return Math.min(9,Math.floor((t-begin)/(invalid-begin)*10));return Math.min(15,10+Math.floor((t-invalid)/(finish-invalid)*6));}
 function drawSimulation(t,meta){const n=simulationN(t,meta);pla(n,t,{stageName:n<10?'VALID BCD · decimal '+n:'INVALID BCD · all segments blank'});}
 function drawRecap(t){const titles=['Truth table','Karnaugh map','Sum of products','Shared PLA'];const captions=['Define when a segment lights.','Group neighboring cases.','AND terms feed an OR.','Reuse terms across outputs.'];for(let i=0;i<4;i++){const x=23+i*447;rect(x,84,411,397,C.panel);txt('0'+(i+1),x+26,134,29,C.amber);txt(titles[i],x+26,190,37,C.ink);para(captions[i],x+26,389,350,28,C.muted);if(i<3)arrow(x+417,268,x+441,268,C.mint,3);if(i===0){for(let r=0;r<3;r++){txt(['0000 → 1','0001 → 0','0010 → 1'][r],x+52,253+r*38,27,r===1?C.pink:C.mint,'left',true);}}if(i===1){for(let r=0;r<3;r++)for(let c=0;c<4;c++)rect(x+56+c*67,229+r*35,58,28,c>1?C.mint+'45':C.bg,C.line,3);}if(i===2){txt('AND + AND',x+35,270,32,C.mint,'left',true);txt('↓ OR',x+116,329,34,C.amber,'left',true);}if(i===3){for(let r=0;r<4;r++)line(x+56,233+r*28,x+340,233+r*28,C.line,2);for(let c=0;c<5;c++)line(x+72+c*57,218,x+72+c*57,329,C.line,2);[[0,0],[1,2],[2,1],[2,3],[3,4]].forEach(([r,c])=>dot(x+72+c*57,233+r*28,6,C.mint));}}
   txt('AND   ·   OR   ·   NOT',896,560,43,C.mint,'center',true);txt('Verify every input, including the invalid codes.',896,613,29,C.muted,'center');
 }
 function paint(context,index,time,duration,meta={}){ctx=context;measurements.length=0;ctx.clearRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=1;const fn=[drawIntro,null,null,null,drawInterface,drawTruth,drawMap,drawGrouping,drawDerive,drawCircuit,drawPLA,drawValidity,drawTrace,drawSimulation,drawRecap][index];if(index>=1&&index<=3)drawGate(index,time,duration);else if(index===5)fn(time,duration);else fn(time,meta);return measurements.filter(b=>b.x<0||b.y<0||b.x+b.width>W+1||b.y+b.height>H+1);}
 scope.BCDRender={paint,simulationN,C,W,H};
})(globalThis);
