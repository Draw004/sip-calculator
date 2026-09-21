(() => {
  'use strict';
  const P=()=>window.CarrowmontPdfExport, L=()=>window.CarrowmontLocale;
  const C={ink:'#102945',navy:'#102945',teal:'#0e8b80',tealDark:'#08756d',muted:'#405b75',line:'#c9d9e2',pale:'#e8f6f3',note:'#f3f8fa',amber:'#fff4d9',amberLine:'#edc86b',white:'#fff',light:'#f8fbfc'};
  const W=794,H=1123,M=42,CW=W-M*2;
  const money=v=>L().formatMoney(v,{maximumFractionDigits:0}), compact=v=>L().formatCompactMoney(v,{maximumFractionDigits:2}), pct=v=>`${Math.round(v*100)}%`;
  function page(){return P().createPage({width:W,height:H,scale:2.6,background:'#fff'});}function card(ctx,x,y,w,h,fill=C.white,stroke=C.line,r=10){P().roundRect(ctx,x,y,w,h,r,fill,stroke,1);}function hline(ctx,x1,x2,y,color=C.line,width=1){P().line(ctx,x1,y,x2,y,color,width);}
  function header(ctx,mode){P().text(ctx,'CARROWMONT',M,48,{size:14,weight:900,color:C.teal});P().text(ctx,'SIP Planning Report',M,82,{size:26,weight:900,color:C.ink});P().text(ctx,mode==='growth'?'Based on: SIP future value':mode==='goal'?'Based on: SIP required for a goal':'Based on: Time to target',M,104,{size:10.5,weight:600,color:C.muted});const d=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date());P().text(ctx,`Generated ${d}`,W-M,48,{size:10,weight:800,color:C.ink,align:'right'});P().text(ctx,'Educational planning report',W-M,68,{size:9.5,weight:400,color:C.muted,align:'right'});P().text(ctx,'carrowmont.com',W-M,88,{size:9.5,weight:400,color:C.muted,align:'right'});hline(ctx,M,W-M,125,C.navy,2);}
  function band(ctx,label,y){card(ctx,M,y,CW,31,C.navy,null,8);P().text(ctx,label,M+12,y+21,{size:14,weight:850,color:'#fff'});}
  function statGrid(ctx,items,y,cols=3){const gap=9,w=(CW-gap*(cols-1))/cols,h=72;items.forEach((it,i)=>{const row=Math.floor(i/cols),c=i%cols,x=M+c*(w+gap),yy=y+row*(h+9);card(ctx,x,yy,w,h,C.white,C.line,9);P().wrappedText(ctx,it.label,x+10,yy+19,w-20,{size:9.2,lineHeight:11.5,weight:600,color:C.muted,maxLines:2});P().text(ctx,it.value,x+10,yy+55,{size:14.5,weight:850,color:C.ink});});return y+Math.ceil(items.length/cols)*(h+9)-9;}
  function assumptions(ctx,r,mode,y){band(ctx,'Plan assumptions',y);const s=r.state,rows=[['Country / region',L().getProfile().label],['Currency',L().getCurrency()],['Investment period',`${s.years} years`],['Expected annual return',`${(s.annualReturn*100).toFixed(1)}% p.a.`],['Annual SIP step-up',`${(s.annualStepUp*100).toFixed(1)}% p.a.`],['Existing invested amount',money(s.currentSavings)],['Current monthly SIP',`${money(s.monthlySIP)}/mo`]];if(mode==='goal'){if(s.goalBasis==='future')rows.splice(3,0,['Future target amount',money(s.goalFuture)]);else rows.splice(3,0,['Goal amount today',money(s.goalToday)],['Inflation / price growth',`${(s.inflation*100).toFixed(1)}% p.a.`]);} if(mode==='target'){rows.splice(2,1);rows.splice(3,0,['Target corpus',money(s.targetAmount)]);}let yy=y+43;rows.forEach(([a,b])=>{P().text(ctx,a,M+7,yy+18,{size:9.3,weight:600,color:C.muted});P().text(ctx,b,W-M-7,yy+18,{size:9.5,weight:850,color:C.ink,align:'right'});hline(ctx,M,M+CW,yy+27);yy+=28;});return yy;}
  async function charts(ctx,mode,y){P().text(ctx,mode==='growth'?'SIP growth visuals':mode==='goal'?'Goal and SIP visuals':'Time-to-target visuals',M,y,{size:17,weight:850,color:C.ink});hline(ctx,M,M+CW,y+14,'#c7d3da');const c1=document.getElementById('chart1'),c2=document.getElementById('chart2');const w=(CW-14)/2,h=278,cy=y+28;card(ctx,M,cy,w,h,C.white,C.line,10);card(ctx,M+w+14,cy,w,h,C.white,C.line,10);await P().drawSvgElement(ctx,c1,M+5,cy+5,w-10,h-10);await P().drawSvgElement(ctx,c2,M+w+19,cy+5,w-10,h-10);P().wrappedText(ctx,mode==='growth'?'Left: Projected portfolio value versus the money modelled as invested. Right: Compare the selected annual step-up SIP with a fixed monthly SIP under the same return and period.':mode==='goal'?'Left: Compare the future goal with your current-plan path. Right: Compare the current plan with the modelled SIP required to reach the selected goal date.':'Left: Compare your projected SIP path with the target corpus. Right: Compare the step-up SIP path with a fixed monthly SIP.',M,cy+h+24,CW,{size:9.3,lineHeight:13,weight:400,color:C.muted,maxLines:3});return cy+h+60;}
  function methodology(ctx,y){
    const h=238;card(ctx,M,y,CW,h,C.note,C.line,10);
    P().text(ctx,'Methodology & important information',M+12,y+29,{size:16.5,weight:850,color:C.ink});hline(ctx,M+12,M+CW-12,y+41,'#b9cbd5');
    const items=[
      ['Monthly return:','The annual return assumption is converted to an equivalent monthly compound rate.'],
      ['SIP projection:','Existing investments grow monthly. Contributions are added at month-end and can increase once each year by the entered step-up rate.'],
      ['Future goal amount:','Either today’s goal amount is grown using the selected price-growth assumption, or a future target amount is entered directly.'],
      ['Monthly SIP required:','The starting monthly contribution that models to the selected future goal while applying the entered annual step-up.'],
      ['Time to target:','The first modelled month in which the projected portfolio equals or exceeds the target corpus, checked for up to 50 years.']
    ];
    let yy=y+66;items.forEach(([label,body])=>{P().text(ctx,label,M+12,yy,{size:9.6,weight:850,color:C.ink});P().wrappedText(ctx,body,M+146,yy,CW-158,{size:9.7,lineHeight:12.8,weight:500,color:C.muted,maxLines:2});yy+=28;});
    card(ctx,M+12,y+187,CW-24,38,C.white,null,5);P().text(ctx,'Important:',M+22,y+211,{size:9.8,weight:850,color:C.ink});P().wrappedText(ctx,'SIP is a contribution method, not a guaranteed-return product. Actual investment returns, taxes, fees, volatility and product-specific costs may differ materially.',M+83,y+211,CW-105,{size:9.3,lineHeight:12,weight:500,color:C.ink,maxLines:2});
  }
  function tablePageTitle(ctx,title,subtitle,pageLabel){
    P().text(ctx,'CARROWMONT',M,48,{size:14,weight:900,color:C.teal});
    P().text(ctx,title,M,82,{size:24,weight:900,color:C.ink});
    if(subtitle) P().text(ctx,subtitle,M,104,{size:9.8,weight:500,color:C.muted});
    if(pageLabel) P().text(ctx,pageLabel,W-M,82,{size:9.5,weight:700,color:C.muted,align:'right'});
    hline(ctx,M,W-M,125,C.navy,2);
  }
  function drawTable(ctx,columns,rows,startY,opt={}){
    const headerH=58,rowH=36,totalW=columns.reduce((a,c)=>a+c.w,0);let x=M,y=startY;
    ctx.fillStyle='#eaf2f6';ctx.fillRect(M,y,totalW,headerH);
    columns.forEach((col,ci)=>{
      const headerAlign=ci===0?'left':(col.headerAlign||col.align||'right');
      const headerX=headerAlign==='left'?x+8:headerAlign==='center'?x+col.w/2:x+col.w-8;
      P().wrappedText(ctx,col.label,headerX,y+19,col.w-16,{size:8.2,lineHeight:10.5,weight:850,color:'#173d5c',align:headerAlign,maxLines:3});
      x+=col.w;
    });
    hline(ctx,M,M+totalW,y+headerH,'#bfcfd8');y+=headerH;
    rows.forEach((row,ri)=>{
      if(opt.highlightLast && ri===rows.length-1){ctx.fillStyle='#f0faf7';ctx.fillRect(M,y,totalW,rowH);}
      x=M;
      columns.forEach((col,ci)=>{
        const val=Array.isArray(row)?row[ci]:row[col.key];
        const align=col.align||'left';
        const tx=align==='right'?x+col.w-8:align==='center'?x+col.w/2:x+8;
        P().text(ctx,val,tx,y+24,{size:9.2,weight:(ci===0||col.emphasis)?800:600,color:col.color||C.ink,align});
        x+=col.w;
      });
      hline(ctx,M,M+totalW,y+rowH,'#d8e4ea');y+=rowH;
    });
    return y;
  }
  function yearlyPages(r,mode){
    const horizon=mode==='target'?Math.max(1,Math.min(50,Math.ceil(r.yearsToTarget||50))):r.state.years;const rows=window.CarrowmontSIPCore.yearlyBreakdown(r.state,horizon),out=[],chunkSize=22,totalChunks=Math.ceil(rows.length/chunkSize);
    for(let ci=0;ci<totalChunks;ci++){
      const chunk=rows.slice(ci*chunkSize,(ci+1)*chunkSize),pg=page(),ctx=pg.ctx;
      tablePageTitle(ctx,'Year-by-year SIP journey',mode==='growth'?`Contribution, investment and projected value using ${(r.state.annualReturn*100).toFixed(1)}% p.a. assumed return`:mode==='goal'?`Current-plan contribution and goal funding using ${(r.state.annualReturn*100).toFixed(1)}% p.a. assumed return`:`Progress toward ${compact(r.target)} using ${(r.state.annualReturn*100).toFixed(1)}% p.a. assumed return`,totalChunks>1?`Part ${ci+1} of ${totalChunks}`:'');
      let y=154;
      if(ci===0){
        const final=rows[rows.length-1];
        const cards=mode==='growth'?[{label:'Total invested',value:compact(r.projection.totalInvested)},{label:'Estimated growth',value:compact(r.projection.growth)},{label:'Projected value',value:compact(r.projection.portfolio)},{label:'Plan length',value:`${r.state.years} years`}]:mode==='goal'?[{label:'Total invested',value:compact(r.current.totalInvested)},{label:'Current-plan value',value:compact(r.current.portfolio)},{label:'Future goal',value:compact(r.target)},{label:'Projected funding',value:pct(r.funding)}]:[{label:'Target corpus',value:compact(r.target)},{label:'Estimated time',value:r.reached?`${Math.floor(r.months/12)}y ${r.months%12}m`:'50+ years'},{label:'Total invested',value:compact(r.totalInvested)},{label:'Estimated growth',value:compact(r.growth)}];
        const gap=8,cw=(CW-gap*3)/4;
        cards.forEach((it,i)=>{const x=M+i*(cw+gap);card(ctx,x,y,cw,60,C.white,C.line,8);P().text(ctx,it.label,x+8,y+19,{size:8,weight:600,color:C.muted});P().text(ctx,it.value,x+8,y+45,{size:14.5,weight:850,color:C.ink});});
        y+=80;
      }
      const columns=mode==='growth'?[{label:'YEAR',w:58,key:'year'},{label:'MONTHLY SIP',w:112,key:'monthly',align:'right'},{label:'INVESTED DURING YEAR',w:120,key:'yearInvest',align:'right'},{label:'TOTAL INVESTED',w:120,key:'total',align:'right'},{label:'PROJECTED VALUE',w:150,key:'value',align:'right',emphasis:true,color:C.tealDark},{label:'EST. GROWTH',w:150,key:'growth',align:'right',emphasis:true,color:C.tealDark}]:mode==='goal'?[{label:'YEAR',w:52,key:'year'},{label:'MONTHLY SIP',w:102,key:'monthly',align:'right'},{label:'INVESTED DURING YEAR',w:106,key:'yearInvest',align:'right'},{label:'TOTAL INVESTED',w:106,key:'total',align:'right'},{label:'CURRENT-PLAN VALUE',w:118,key:'value',align:'right',emphasis:true,color:C.tealDark},{label:'GOAL AMOUNT',w:118,key:'goal',align:'right'},{label:'FUNDING',w:108,key:'funding',align:'right'}]:[{label:'YEAR',w:58,key:'year'},{label:'MONTHLY SIP',w:112,key:'monthly',align:'right'},{label:'INVESTED DURING YEAR',w:120,key:'yearInvest',align:'right'},{label:'TOTAL INVESTED',w:120,key:'total',align:'right'},{label:'PROJECTED VALUE',w:150,key:'value',align:'right',emphasis:true,color:C.tealDark},{label:'TARGET PROGRESS',w:150,key:'funding',align:'right'}];
      const formatted=chunk.map(x=>mode==='growth'?{year:`Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}`,monthly:`${money(x.monthlySIP)}/mo`,yearInvest:compact(x.investedThisYear),total:compact(x.totalInvested),value:compact(x.projectedValue),growth:compact(x.estimatedGrowth)}:mode==='goal'?{year:`Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}`,monthly:`${money(x.monthlySIP)}/mo`,yearInvest:compact(x.investedThisYear),total:compact(x.totalInvested),value:compact(x.projectedValue),goal:compact(x.goal||0),funding:pct(x.funding||0)}:{year:`Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}`,monthly:`${money(x.monthlySIP)}/mo`,yearInvest:compact(x.investedThisYear),total:compact(x.totalInvested),value:compact(x.projectedValue),funding:pct(Math.min(1,x.projectedValue/Math.max(1,r.target)))});
      y=drawTable(ctx,columns,formatted,y,{highlightLast:ci===totalChunks-1});
      P().wrappedText(ctx,mode==='growth'?`Projected values use the entered ${(r.state.annualReturn*100).toFixed(1)}% annual return assumption. Estimated investment growth is the modelled portfolio value above total money invested to that point. Total invested includes any existing investment. It is not an actual or guaranteed return.`:mode==='goal'?`Projected values use the entered ${(r.state.annualReturn*100).toFixed(1)}% annual return assumption. Projected funding compares the current savings/SIP path with the modelled goal amount at each year. Total invested includes any existing investment. It does not assume the higher SIP required to close a gap.`:`Projected values use the entered ${(r.state.annualReturn*100).toFixed(1)}% annual return assumption. Target progress compares the projected portfolio with the future nominal target corpus.`,M,y+24,CW,{size:8.8,lineHeight:12.5,weight:400,color:C.muted,maxLines:3});
      P().text(ctx,'CARROWMONT',M,H-34,{size:9.5,weight:900,color:C.teal});P().text(ctx,'Year-by-year projection · Educational illustration',W-M,H-34,{size:8.5,weight:400,color:C.muted,align:'right'});
      out.push(pg.canvas);
    }
    return out;
  }
  function comparisonPages(r,mode){
    const horizon=mode==='target'?Math.max(1,Math.min(50,Math.ceil(r.yearsToTarget||50))):r.state.years;const rows=window.CarrowmontSIPCore.yearlyBreakdown(r.state,horizon),out=[],chunkSize=24,totalChunks=Math.ceil(rows.length/chunkSize);
    for(let ci=0;ci<totalChunks;ci++){
      const chunk=rows.slice(ci*chunkSize,(ci+1)*chunkSize),pg=page(),ctx=pg.ctx;
      tablePageTitle(ctx,'Step-up SIP vs fixed SIP','Same existing investment, return and period; only the annual SIP increase changes.',totalChunks>1?`Part ${ci+1} of ${totalChunks}`:'');
      const cols=[{label:'YEAR',w:80,key:'year'},{label:'STEP-UP SIP PROJECTED VALUE',w:210,key:'step',align:'center',headerAlign:'center',emphasis:true,color:C.tealDark},{label:'FIXED SIP PROJECTED VALUE',w:200,key:'fixed',align:'center',headerAlign:'center'},{label:'ADDITIONAL VALUE FROM STEP-UP',w:220,key:'diff',align:'center',headerAlign:'center',emphasis:true,color:C.tealDark}];
      const formatted=chunk.map(x=>({year:`Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}`,step:compact(x.projectedValue),fixed:compact(x.fixedProjectedValue),diff:`${x.stepUpDifference>=0?'+':''}${compact(x.stepUpDifference)}`}));
      const y=drawTable(ctx,cols,formatted,164,{highlightLast:ci===totalChunks-1});
      P().wrappedText(ctx,`The step-up path starts at ${money(r.state.monthlySIP)}/month and increases by ${(r.state.annualStepUp*100).toFixed(1)}% once each year. The fixed-SIP path keeps the starting monthly SIP unchanged. Both use the same ${(r.state.annualReturn*100).toFixed(1)}% annual return assumption.`,M,y+26,CW,{size:9,lineHeight:13,weight:400,color:C.muted,maxLines:4});
      P().text(ctx,'CARROWMONT',M,H-34,{size:9.5,weight:900,color:C.teal});P().text(ctx,'Step-up comparison · Educational illustration',W-M,H-34,{size:8.5,weight:400,color:C.muted,align:'right'});
      out.push(pg.canvas);
    }
    return out;
  }

  function otherToolsPage(){
    const pg=page(),ctx=pg.ctx;
    P().text(ctx,'CARROWMONT',M,58,{size:15,weight:900,color:C.teal});
    P().text(ctx,'Continue planning with Carrowmont',M,101,{size:27,weight:900,color:C.ink});
    P().wrappedText(ctx,'Your SIP calculation is one part of a broader financial plan. Try these other Carrowmont tools to explore retirement, life goals, financial independence and the effect of inflation.',M,130,CW,{size:11,lineHeight:16,weight:500,color:C.muted,maxLines:3});
    hline(ctx,M,W-M,178,C.navy,2);
    const tools=[
      {title:'Retirement Planner',desc:'Model retirement spending, income, current savings and the corpus that may be required for the retirement lifestyle you enter.',url:'carrowmont.com/retirement-calculator/'},
      {title:'Goal Planner',desc:'Plan for education, a home, travel, emergency savings and other financial goals using future-cost and investment assumptions.',url:'carrowmont.com/goal-planner/'},
      {title:'Financial Independence',desc:'Estimate a spending-based financial-independence target and compare it with your current investment path and target age.',url:'carrowmont.com/financial-independence/'},
      {title:'Inflation Calculator',desc:'See how inflation may change future costs and purchasing power across different time horizons and currencies.',url:'carrowmont.com/inflation-calculator/'}
    ];
    const gap=16,cw=(CW-gap)/2,ch=162;tools.forEach((t,i)=>{const col=i%2,row=Math.floor(i/2),x=M+col*(cw+gap),y=210+row*(ch+18);card(ctx,x,y,cw,ch,C.white,C.line,13);P().text(ctx,t.title,x+16,y+32,{size:15,weight:900,color:C.ink});P().wrappedText(ctx,t.desc,x+16,y+59,cw-32,{size:10,lineHeight:14,weight:500,color:C.muted,maxLines:4});P().text(ctx,t.url,x+16,y+139,{size:9.5,weight:800,color:C.tealDark});});
    card(ctx,M,586,CW,78,C.pale,'#b8ddd8',12);P().text(ctx,'Explore all Carrowmont tools',M+16,616,{size:14,weight:900,color:C.tealDark});P().wrappedText(ctx,'Visit carrowmont.com to continue your planning. Carrowmont tools are educational illustrations and do not guarantee financial or investment outcomes.',M+16,641,CW-32,{size:9.7,lineHeight:13.5,weight:500,color:C.ink,maxLines:2});
    P().text(ctx,'CARROWMONT',M,H-40,{size:10,weight:900,color:C.teal});P().text(ctx,'Financial Planning, Tools & Learning · carrowmont.com',W-M,H-40,{size:9.3,weight:500,color:C.muted,align:'right'});
    return pg.canvas;
  }

  async function render(r,mode){
    const p1=page(),c=p1.ctx;header(c,mode);if(mode==='growth'){
      P().text(c,'YOUR SIP PROJECTION',M,159,{size:9,weight:900,color:C.teal});P().text(c,`Estimated value after ${r.state.years} years`,M,188,{size:22,weight:850,color:C.ink});
      card(c,M,216,CW,118,C.navy,null,16);P().text(c,'Projected future value',M+18,244,{size:10.5,weight:500,color:'#d7e2eb'});P().text(c,compact(r.projection.portfolio),M+18,296,{size:38,weight:900,color:'#fff'});P().text(c,`Based on ${money(r.state.monthlySIP)}/month, ${(r.state.annualReturn*100).toFixed(1)}% assumed return and ${(r.state.annualStepUp*100).toFixed(1)}% annual SIP step-up`,M+18,319,{size:9.2,weight:400,color:'#d7e2eb'});
      const end=statGrid(c,[{label:'Existing invested amount',value:compact(r.state.currentSavings)},{label:'Monthly SIP',value:`${money(r.state.monthlySIP)}/mo`},{label:'Total modelled investment',value:compact(r.projection.totalInvested)},{label:'Estimated investment growth',value:compact(r.projection.growth)},{label:'Fixed-SIP value',value:compact(r.fixedProjection.portfolio)},{label:'Additional value from step-up',value:compact(r.stepUpBenefit)}],360,3);const ay=assumptions(c,r,mode,end+26);P().wrappedText(c,'The projected ending value combines the existing invested amount, future SIP contributions and modelled investment growth. It is not a forecast or guarantee of returns.',M,ay+25,CW,{size:9.5,lineHeight:13.5,weight:400,color:C.muted,maxLines:3});
    }else if(mode==='goal'){
      P().text(c,'YOUR GOAL',M,159,{size:9,weight:900,color:C.teal});P().text(c,`Goal in ${r.state.years} years`,M,188,{size:22,weight:850,color:C.ink});
      card(c,M,216,(CW-12)/2,118,C.navy,null,16);P().text(c,'Estimated future goal amount',M+18,244,{size:10.5,weight:500,color:'#d7e2eb'});P().text(c,compact(r.target),M+18,296,{size:34,weight:900,color:'#fff'});P().text(c,r.state.goalBasis==='future'?`Entered directly as the future target amount`:`From ${compact(r.state.goalToday)} today at ${(r.state.inflation*100).toFixed(1)}% price growth`,M+18,319,{size:9,weight:400,color:'#d7e2eb'});
      const rx=M+(CW-12)/2+12;card(c,rx,216,(CW-12)/2,118,C.white,'#bcded9',16);P().text(c,'Projected current plan at goal date',rx+18,244,{size:10.5,weight:500,color:C.muted});P().text(c,compact(r.current.portfolio),rx+18,296,{size:34,weight:900,color:C.ink});P().text(c,`${pct(r.funding)} funded before any SIP increase`,rx+18,319,{size:9,weight:500,color:C.tealDark});
      const end=statGrid(c,[{label:r.state.goalBasis==='future'?'Future target entered':'Goal amount today',value:compact(r.state.goalBasis==='future'?r.state.goalFuture:r.state.goalToday)},{label:'Funding gap at goal date',value:compact(r.gap)},{label:'Current monthly SIP',value:`${money(r.state.monthlySIP)}/mo`},{label:'Total monthly SIP required',value:`${money(r.requiredMonthly)}/mo`},{label:'Additional monthly SIP required',value:`${money(r.additionalMonthly)}/mo`},{label:'Projected funding from current plan',value:pct(r.funding)}],360,3);
      const ry=end+18;card(c,M,ry,CW,64,r.additionalMonthly>0?C.amber:C.pale,r.additionalMonthly>0?C.amberLine:'#b9ddd8',10);P().text(c,'Additional monthly SIP required',M+16,ry+38,{size:10.5,weight:800,color:r.additionalMonthly>0?'#704c00':C.tealDark});P().text(c,`${money(r.additionalMonthly)}/mo`,W-M-16,ry+40,{size:22,weight:900,color:r.additionalMonthly>0?'#704c00':C.tealDark,align:'right'});const ay=assumptions(c,r,mode,ry+89);P().wrappedText(c,`Projected funding is based on the current plan - existing savings plus the current monthly SIP before any increase. The required-SIP figure is the modelled starting monthly amount under the selected assumptions.`,M,ay+25,CW,{size:9.5,lineHeight:13.5,weight:400,color:C.muted,maxLines:3});
    }else{
      P().text(c,'YOUR TARGET',M,159,{size:9,weight:900,color:C.teal});P().text(c,'Time to target',M,188,{size:22,weight:850,color:C.ink});
      card(c,M,216,CW,118,C.navy,null,16);P().text(c,'Estimated time to reach target',M+18,244,{size:10.5,weight:500,color:'#d7e2eb'});const dur=r.reached?`${Math.floor(r.months/12)} years ${r.months%12} months`:'More than 50 years';P().text(c,dur,M+18,292,{size:30,weight:900,color:'#fff'});P().text(c,`Target ${compact(r.target)} using ${money(r.state.monthlySIP)}/month at ${(r.state.annualReturn*100).toFixed(1)}% assumed return`,M+18,319,{size:9.2,weight:400,color:'#d7e2eb'});
      const end=statGrid(c,[{label:'Target corpus',value:compact(r.target)},{label:'Existing invested amount',value:compact(r.state.currentSavings)},{label:'Current monthly SIP',value:`${money(r.state.monthlySIP)}/mo`},{label:'Total money invested by then',value:compact(r.totalInvested)},{label:'Estimated investment growth',value:compact(r.growth)},{label:'Time saved by step-up',value:r.fixedReached?`${Math.floor(r.timeSavedMonths/12)}y ${r.timeSavedMonths%12}m`:'N/A'}],360,3);const ay=assumptions(c,r,mode,end+26);P().wrappedText(c,'This mode solves for time rather than monthly SIP. If you instead know the target date and want to calculate the required monthly SIP, use the SIP required for a goal mode.',M,ay+25,CW,{size:9.5,lineHeight:13.5,weight:400,color:C.muted,maxLines:3});
    }
    const p2=page(),c2=p2.ctx;header(c2,mode);const endChart=await charts(c2,mode,154);methodology(c2,endChart+30);
    return [p1.canvas,p2.canvas,...yearlyPages(r,mode),...comparisonPages(r,mode),otherToolsPage()];
  }
  window.CarrowmontSIPPdfRenderer={render};
})();
