(() => {
  'use strict';
  const P=()=>window.CarrowmontPdfExport, L=()=>window.CarrowmontLocale, S=()=>window.CarrowmontReportStandard;
  const C={ink:'#102945',navy:'#102945',teal:'#0e8b80',tealDark:'#08756d',muted:'#405b75',line:'#c9d9e2',pale:'#e8f6f3',note:'#f3f8fa',amber:'#fff4d9',amberLine:'#edc86b',white:'#fff',light:'#f8fbfc'};
  const W=794,H=1123,M=42,CW=W-M*2;
  const money=v=>L().formatMoney(v,{maximumFractionDigits:0}), compact=v=>L().formatCompactMoney(v,{maximumFractionDigits:2}), pct=v=>`${Math.round(v*100)}%`;
  const frequencyProfile=(region=L().getRegion())=>L().regions[region]||L().regions.OTHER||{};
  const frequencyLabel=(key,region=L().getRegion())=>{
    if(key==='weekly') return 'Weekly';
    if(key==='biweekly'){
      const style=frequencyProfile(region).twoWeekLabel||'neutral';
      return style==='fortnightly'?'Fortnightly (Every 2 Weeks)':style==='biweekly'?'Biweekly (Every 2 Weeks)':'Every 2 Weeks';
    }
    if(key==='semimonthly') return 'Twice Monthly';
    if(key==='fourweekly') return 'Every 4 Weeks';
    return 'Monthly';
  };
  const frequencyDisplay=state=>frequencyLabel(state.contributionFrequency).replace(/\s*\(Every 2 Weeks\)\s*/,'').trim();
  const cadence=state=>state.contributionFrequency==='weekly'?'per week':state.contributionFrequency==='biweekly'?'every 2 weeks':state.contributionFrequency==='semimonthly'?'twice monthly':state.contributionFrequency==='fourweekly'?'every 4 weeks':'per month';
  const contributionText=(value,state)=>`${money(value)} ${cadence(state)}`;
  const shortCadence=state=>state.contributionFrequency==='weekly'?'/wk':state.contributionFrequency==='biweekly'?'/2 wks':state.contributionFrequency==='semimonthly'?' · 2x/mo':state.contributionFrequency==='fourweekly'?'/4 wks':'/mo';
  const shortContribution=(value,state)=>`${money(value)}${shortCadence(state)}`;
  const contributionNoun=()=>L().getRegion()==='IN'?'SIP':'investment';
  const usesNeutralTwoWeekLabel=(region=L().getRegion())=>(frequencyProfile(region).twoWeekLabel||'neutral')==='neutral';
  const frequencyNounPhrase=(state,noun=contributionNoun())=>state.contributionFrequency==='biweekly'&&usesNeutralTwoWeekLabel()?`${noun} every 2 weeks`:`${frequencyDisplay(state).toLowerCase()} ${noun}`;
  const titlePhrase=state=>frequencyNounPhrase(state).replace(/^./,c=>c.toUpperCase());
  const isIndiaReport=()=>L().getRegion()==='IN';
  function page(){return P().createPage({width:W,height:H,scale:2.6,background:'#fff'});}function card(ctx,x,y,w,h,fill=C.white,stroke=C.line,r=10){P().roundRect(ctx,x,y,w,h,r,fill,stroke,1);}function hline(ctx,x1,x2,y,color=C.line,width=1){P().line(ctx,x1,y,x2,y,color,width);}
  function header(ctx,mode){const id=S().investmentIdentity();const basedOn=mode==='growth'?(isIndiaReport()?'SIP future value':'Recurring investment future value'):mode==='goal'?(isIndiaReport()?'SIP required for a goal':'Recurring investment required for a goal'):'Time to target';P().text(ctx,'CARROWMONT',M,48,{size:14,weight:900,color:C.teal});P().text(ctx,id.reportTitle,M,82,{size:26,weight:900,color:C.ink});P().text(ctx,`Based on: ${basedOn}`,M,104,{size:10.5,weight:600,color:C.muted});const d=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date());P().text(ctx,`Generated ${d}`,W-M,48,{size:10,weight:800,color:C.ink,align:'right'});P().text(ctx,'Educational planning report',W-M,68,{size:9.5,weight:400,color:C.muted,align:'right'});P().text(ctx,'carrowmont.com',W-M,88,{size:9.5,weight:400,color:C.muted,align:'right'});hline(ctx,M,W-M,125,C.navy,2);}
  function band(ctx,label,y){card(ctx,M,y,CW,31,C.navy,null,8);P().text(ctx,label,M+12,y+21,{size:14,weight:850,color:'#fff'});}
  function statGrid(ctx,items,y,cols=3){const gap=9,w=(CW-gap*(cols-1))/cols,h=72;items.forEach((it,i)=>{const row=Math.floor(i/cols),c=i%cols,x=M+c*(w+gap),yy=y+row*(h+9);card(ctx,x,yy,w,h,C.white,C.line,9);P().wrappedText(ctx,it.label,x+10,yy+19,w-20,{size:9.2,lineHeight:11.5,weight:600,color:C.muted,maxLines:2});P().text(ctx,it.value,x+10,yy+55,{size:14.5,weight:850,color:C.ink});});return y+Math.ceil(items.length/cols)*(h+9)-9;}
  function assumptions(ctx,r,mode,y){
    band(ctx,'Plan assumptions',y);
    const s=r.state,display=frequencyDisplay(s),noun=contributionNoun();
    const rows=[
      ['Country / region',L().getProfile().label],
      ['Currency',L().getCurrency()],
      ['Investment period',`${s.years} years`],
      ['Expected annual return',`${(s.annualReturn*100).toFixed(1)}% p.a.`],
      [L().getRegion()==='IN'?'Annual SIP step-up':'Annual contribution increase',`${(s.annualStepUp*100).toFixed(1)}% p.a.`],
      ['Existing invested amount',money(s.currentSavings)],
      [`Current ${frequencyNounPhrase(s,noun)}`,contributionText(s.monthlySIP,s)],
      ['Contribution frequency',frequencyLabel(s.contributionFrequency)]
    ];
    if(mode==='goal'){
      if(s.goalBasis==='future') rows.splice(3,0,['Future target amount',money(s.goalFuture)]);
      else rows.splice(3,0,['Goal amount today',money(s.goalToday)],['Inflation / price growth',`${(s.inflation*100).toFixed(1)}% p.a.`]);
    }
    if(mode==='target'){rows.splice(2,1);rows.splice(3,0,['Target corpus',money(s.targetAmount)]);}
    let yy=y+43;
    rows.forEach(([a,b])=>{P().text(ctx,a,M+7,yy+18,{size:9.3,weight:600,color:C.muted});P().text(ctx,b,W-M-7,yy+18,{size:9.5,weight:850,color:C.ink,align:'right'});hline(ctx,M,M+CW,yy+27);yy+=28;});
    return yy;
  }
  async function charts(ctx,mode,y){const inv=isIndiaReport()?'SIP':'recurring investment';P().text(ctx,mode==='growth'?(isIndiaReport()?'SIP growth visuals':'Recurring investment visuals'):mode==='goal'?(isIndiaReport()?'Goal and SIP visuals':'Goal and investment visuals'):'Time-to-target visuals',M,y,{size:17,weight:850,color:C.ink});hline(ctx,M,M+CW,y+14,'#c7d3da');const c1=document.getElementById('chart1'),c2=document.getElementById('chart2');const w=(CW-14)/2,h=278,cy=y+28;card(ctx,M,cy,w,h,C.white,C.line,10);card(ctx,M+w+14,cy,w,h,C.white,C.line,10);await P().drawSvgElement(ctx,c1,M+5,cy+5,w-10,h-10);await P().drawSvgElement(ctx,c2,M+w+19,cy+5,w-10,h-10);P().wrappedText(ctx,mode==='growth'?'Left: Projected portfolio value versus the money modelled as invested. Right: Compare the selected annual increase with a fixed contribution under the same return and period.':mode==='goal'?`Left: Compare the future goal with your current-plan path. Right: Compare the current plan with the modelled ${inv} required to reach the selected goal date.`:`Left: Compare your projected ${inv} path with the target corpus. Right: Compare the annual-increase path with a fixed contribution.`,M,cy+h+24,CW,{size:9.3,lineHeight:13,weight:400,color:C.muted,maxLines:3});return cy+h+60;}
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
    const horizon=mode==='target'?Math.max(1,Math.min(50,Math.ceil(r.yearsToTarget||50))):r.state.years;
    const rows=window.CarrowmontSIPCore.yearlyBreakdown(r.state,horizon),out=[],chunkSize=22,totalChunks=Math.ceil(rows.length/chunkSize);
    const s=r.state,display=frequencyDisplay(s),noun=contributionNoun();
    for(let ci=0;ci<totalChunks;ci++){
      const chunk=rows.slice(ci*chunkSize,(ci+1)*chunkSize),pg=page(),ctx=pg.ctx;
      tablePageTitle(ctx,isIndiaReport()?'Year-by-year SIP journey':'Year-by-year investment journey',mode==='growth'?`Contribution, investment and projected value using ${(s.annualReturn*100).toFixed(1)}% p.a. assumed return`:mode==='goal'?`Current-plan contribution and goal funding using ${(s.annualReturn*100).toFixed(1)}% p.a. assumed return`:`Progress toward ${compact(r.target)} using ${(s.annualReturn*100).toFixed(1)}% p.a. assumed return`,totalChunks>1?`Part ${ci+1} of ${totalChunks}`:'');
      let y=154;
      if(ci===0){
        const cards=mode==='growth'?[{label:'Total invested',value:compact(r.projection.totalInvested)},{label:'Estimated growth',value:compact(r.projection.growth)},{label:'Projected value',value:compact(r.projection.portfolio)},{label:'Plan length',value:`${s.years} years`}]:mode==='goal'?[{label:'Total invested',value:compact(r.current.totalInvested)},{label:'Current-plan value',value:compact(r.current.portfolio)},{label:'Future goal',value:compact(r.target)},{label:'Projected funding',value:pct(r.funding)}]:[{label:'Target corpus',value:compact(r.target)},{label:'Estimated time',value:r.reached?`${Math.floor(r.months/12)}y ${r.months%12}m`:'50+ years'},{label:'Total invested',value:compact(r.totalInvested)},{label:'Estimated growth',value:compact(r.growth)}];
        const gap=8,cw=(CW-gap*3)/4;
        cards.forEach((it,i)=>{const x=M+i*(cw+gap);card(ctx,x,y,cw,60,C.white,C.line,8);P().text(ctx,it.label,x+8,y+19,{size:8,weight:600,color:C.muted});P().text(ctx,it.value,x+8,y+45,{size:14.5,weight:850,color:C.ink});});
        y+=80;
      }
      const contributionHeader=frequencyNounPhrase(s,noun).toUpperCase();
      const columns=mode==='growth'
        ?[{label:'YEAR',w:58,key:'year'},{label:contributionHeader,w:112,key:'contribution',align:'right'},{label:'INVESTED DURING YEAR',w:120,key:'yearInvest',align:'right'},{label:'TOTAL INVESTED',w:120,key:'total',align:'right'},{label:'PROJECTED VALUE',w:150,key:'value',align:'right',emphasis:true,color:C.tealDark},{label:'EST. GROWTH',w:150,key:'growth',align:'right',emphasis:true,color:C.tealDark}]
        :mode==='goal'
          ?[{label:'YEAR',w:52,key:'year'},{label:contributionHeader,w:102,key:'contribution',align:'right'},{label:'INVESTED DURING YEAR',w:106,key:'yearInvest',align:'right'},{label:'TOTAL INVESTED',w:106,key:'total',align:'right'},{label:'CURRENT-PLAN VALUE',w:118,key:'value',align:'right',emphasis:true,color:C.tealDark},{label:'GOAL AMOUNT',w:118,key:'goal',align:'right'},{label:'FUNDING',w:108,key:'funding',align:'right'}]
          :[{label:'YEAR',w:58,key:'year'},{label:contributionHeader,w:112,key:'contribution',align:'right'},{label:'INVESTED DURING YEAR',w:120,key:'yearInvest',align:'right'},{label:'TOTAL INVESTED',w:120,key:'total',align:'right'},{label:'PROJECTED VALUE',w:150,key:'value',align:'right',emphasis:true,color:C.tealDark},{label:'TARGET PROGRESS',w:150,key:'funding',align:'right'}];
      const formatted=chunk.map(x=>{
        const common={year:`Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}`,contribution:shortContribution(x.contributionPerPeriod??x.monthlySIP,s),yearInvest:compact(x.investedThisYear),total:compact(x.totalInvested),value:compact(x.projectedValue)};
        if(mode==='growth') return {...common,growth:compact(x.estimatedGrowth)};
        if(mode==='goal') return {...common,goal:compact(x.goal||0),funding:pct(x.funding||0)};
        return {...common,funding:pct(Math.min(1,x.projectedValue/Math.max(1,r.target)))};
      });
      y=drawTable(ctx,columns,formatted,y,{highlightLast:ci===totalChunks-1});
      P().wrappedText(ctx,mode==='growth'?`Projected values use the entered ${(s.annualReturn*100).toFixed(1)}% annual return assumption. Estimated investment growth is the modelled portfolio value above total money invested to that point. Total invested includes any existing investment. It is not an actual or guaranteed return.`:mode==='goal'?`Projected values use the entered ${(s.annualReturn*100).toFixed(1)}% annual return assumption. Projected funding compares the current savings/${noun} path with the modelled goal amount at each year. Total invested includes any existing investment. It does not assume the higher contribution required to close a gap.`:`Projected values use the entered ${(s.annualReturn*100).toFixed(1)}% annual return assumption. Target progress compares the projected portfolio with the future nominal target corpus.`,M,y+24,CW,{size:8.8,lineHeight:12.5,weight:400,color:C.muted,maxLines:3});
      P().text(ctx,'CARROWMONT',M,H-34,{size:9.5,weight:900,color:C.teal});P().text(ctx,'Year-by-year projection · Educational illustration',W-M,H-34,{size:8.5,weight:400,color:C.muted,align:'right'});
      out.push(pg.canvas);
    }
    return out;
  }
  function comparisonPages(r,mode){
    const horizon=mode==='target'?Math.max(1,Math.min(50,Math.ceil(r.yearsToTarget||50))):r.state.years;
    const rows=window.CarrowmontSIPCore.yearlyBreakdown(r.state,horizon),out=[],chunkSize=24,totalChunks=Math.ceil(rows.length/chunkSize);
    const s=r.state,display=frequencyDisplay(s),noun=contributionNoun();
    for(let ci=0;ci<totalChunks;ci++){
      const chunk=rows.slice(ci*chunkSize,(ci+1)*chunkSize),pg=page(),ctx=pg.ctx;
      tablePageTitle(ctx,isIndiaReport()?'Step-up SIP vs fixed SIP':'Increasing contributions vs fixed contributions','Same existing investment, return and period; only the annual contribution increase changes.',totalChunks>1?`Part ${ci+1} of ${totalChunks}`:'');
      const cols=[{label:'YEAR',w:80,key:'year'},{label:isIndiaReport()?'STEP-UP SIP PROJECTED VALUE':'INCREASING-CONTRIBUTION PROJECTED VALUE',w:210,key:'step',align:'center',headerAlign:'center',emphasis:true,color:C.tealDark},{label:isIndiaReport()?'FIXED SIP PROJECTED VALUE':'FIXED-CONTRIBUTION PROJECTED VALUE',w:200,key:'fixed',align:'center',headerAlign:'center'},{label:'ADDITIONAL VALUE FROM STEP-UP',w:220,key:'diff',align:'center',headerAlign:'center',emphasis:true,color:C.tealDark}];
      const formatted=chunk.map(x=>({year:`Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}`,step:compact(x.projectedValue),fixed:compact(x.fixedProjectedValue),diff:`${x.stepUpDifference>=0?'+':''}${compact(x.stepUpDifference)}`}));
      const y=drawTable(ctx,cols,formatted,164,{highlightLast:ci===totalChunks-1});
      P().wrappedText(ctx,`The annual-increase path starts at ${contributionText(s.monthlySIP,s)} and increases by ${(s.annualStepUp*100).toFixed(1)}% once each year. The fixed-contribution path keeps the starting contribution unchanged at the selected frequency. Both use the same ${(s.annualReturn*100).toFixed(1)}% annual return assumption.`,M,y+26,CW,{size:9,lineHeight:13,weight:400,color:C.muted,maxLines:4});
      P().text(ctx,'CARROWMONT',M,H-34,{size:9.5,weight:900,color:C.teal});P().text(ctx,'Step-up comparison · Educational illustration',W-M,H-34,{size:8.5,weight:400,color:C.muted,align:'right'});
      out.push(pg.canvas);
    }
    return out;
  }

  function reportGuidePage(r,mode){
    const s=r.state,id=S().investmentIdentity(),display=frequencyDisplay(s),monthly=s.contributionFrequency==='monthly';
    const methodology=[
      [monthly?'Periodic return':`${display} return`,monthly?'The annual return assumption is converted to an equivalent monthly compound rate.':'The annual return assumption is converted to the equivalent compound rate for the selected contribution frequency.'],
      [isIndiaReport()?'SIP projection':'Investment projection',monthly?'Existing investments grow monthly and the recurring contribution is added at month-end.':'Existing investments grow at the equivalent periodic rate and the contribution is added at the end of each selected contribution period.'],
      ['Annual increase',`The starting contribution can increase once each year by the entered ${(s.annualStepUp*100).toFixed(1)}% annual rate. A 0% increase keeps the contribution fixed.`],
      ['Required contribution','For goal mode, the calculator numerically solves for the starting contribution at the selected frequency that models to the future goal under the entered assumptions.'],
      ['Time to target','The first modelled contribution period in which the projected portfolio equals or exceeds the target corpus, checked for up to 50 years.']
    ];
    const terminology=[
      [isIndiaReport()?'SIP':'Recurring investment',isIndiaReport()?'A Systematic Investment Plan (SIP) is a recurring contribution method. The report uses SIP terminology prominently for India.':'A repeated investment contribution made on the selected cadence.'],
      ['Contribution frequency',`${frequencyLabel(s.contributionFrequency)} is the selected investment cadence for this report.`],
      ['Periodic return','The equivalent compound return for one selected contribution period, derived from the annual return assumption.'],
      ['Annual step-up / increase','A once-a-year increase in the recurring contribution amount; it does not change the return assumption.'],
      ['Projected value','The modelled portfolio value from existing investments, future contributions and assumed investment growth.']
    ];
    const modeText=mode==='growth'?'Start with the projected future value, then compare total money invested with modelled growth and the fixed-contribution comparison.':mode==='goal'?'Start with the future goal amount and current-plan funding, then review the required and additional contribution figures under the selected assumptions.':'Start with the estimated time to target, then review how much was invested, modelled growth and the fixed-contribution comparison.';
    return S().guidePage({reportTitle:id.reportTitle,preparedFrom:id.preparedFrom,howToRead:modeText,methodology,terminology,assumptions:'Country and currency selection control display formatting; changing currency does not perform foreign-exchange conversion. Returns are modelled as constant and contributions are assumed at the end of each selected period.',disclaimer:isIndiaReport()?'SIP is a contribution method, not a guaranteed-return product. Actual investment returns, taxes, fees, volatility and product-specific costs may differ materially. This report is educational and is not individualized financial, tax, legal, accounting or investment advice.':'Recurring investing is a contribution method, not a guaranteed-return product. Actual investment returns, taxes, fees, volatility and product-specific costs may differ materially. This report is educational and is not individualized financial, tax, legal, accounting or investment advice.',methodologyMeta:'Current Carrowmont recurring-investment methodology - reviewed September 2026',methodologyUrl:'carrowmont.com/methodology.html',contact:'contact@carrowmont.com'});
  }
  function otherToolsPage(){
    const id=S().investmentIdentity();
    return S().continuePlanningPage({currentTool:'investment',intro:isIndiaReport()?'Your SIP calculation is one part of a broader financial plan. Try these other Carrowmont tools to explore retirement, life goals, financial independence and the effect of inflation.':'Your recurring-investment calculation is one part of a broader financial plan. Try these other Carrowmont tools to explore retirement, life goals, financial independence and the effect of inflation.'});
  }

  async function render(r,mode){
    const s=r.state,display=frequencyDisplay(s),noun=contributionNoun();
    const p1=page(),c=p1.ctx;header(c,mode);
    if(mode==='growth'){
      P().text(c,isIndiaReport()?'YOUR SIP PROJECTION':'YOUR INVESTMENT PROJECTION',M,159,{size:9,weight:900,color:C.teal});
      P().text(c,`Estimated value after ${s.years} years`,M,188,{size:22,weight:850,color:C.ink});
      card(c,M,216,CW,118,C.navy,null,16);
      P().text(c,'Projected future value',M+18,244,{size:10.5,weight:500,color:'#d7e2eb'});
      P().text(c,compact(r.projection.portfolio),M+18,296,{size:38,weight:900,color:'#fff'});
      P().text(c,`Based on ${contributionText(s.monthlySIP,s)}, ${(s.annualReturn*100).toFixed(1)}% assumed return and ${(s.annualStepUp*100).toFixed(1)}% annual ${isIndiaReport()?'SIP step-up':'contribution increase'}`,M+18,319,{size:9.2,weight:400,color:'#d7e2eb'});
      const end=statGrid(c,[
        {label:'Existing invested amount',value:compact(s.currentSavings)},
        {label:titlePhrase(s),value:shortContribution(s.monthlySIP,s)},
        {label:'Total modelled investment',value:compact(r.projection.totalInvested)},
        {label:'Estimated investment growth',value:compact(r.projection.growth)},
        {label:isIndiaReport()?'Fixed-SIP value':'Fixed-contribution value',value:compact(r.fixedProjection.portfolio)},
        {label:'Additional value from step-up',value:compact(r.stepUpBenefit)}
      ],360,3);
      const ay=assumptions(c,r,mode,end+26);
      P().wrappedText(c,`The projected ending value combines the existing invested amount, future ${noun} contributions and modelled investment growth. It is not a forecast or guarantee of returns.`,M,ay+25,CW,{size:9.5,lineHeight:13.5,weight:400,color:C.muted,maxLines:3});
    }else if(mode==='goal'){
      P().text(c,'YOUR GOAL',M,159,{size:9,weight:900,color:C.teal});P().text(c,`Goal in ${s.years} years`,M,188,{size:22,weight:900,color:C.ink});
      card(c,M,216,(CW-12)/2,118,C.navy,null,16);
      P().text(c,'Estimated future goal amount',M+18,244,{size:10.5,weight:500,color:'#d7e2eb'});
      P().text(c,compact(r.target),M+18,296,{size:34,weight:900,color:'#fff'});
      P().text(c,s.goalBasis==='future'?`Entered directly as the future target amount`:`From ${compact(s.goalToday)} today at ${(s.inflation*100).toFixed(1)}% price growth`,M+18,319,{size:9,weight:400,color:'#d7e2eb'});
      const rx=M+(CW-12)/2+12;
      card(c,rx,216,(CW-12)/2,118,C.white,'#bcded9',16);
      P().text(c,'Projected current plan at goal date',rx+18,244,{size:10.5,weight:500,color:C.muted});
      P().text(c,compact(r.current.portfolio),rx+18,296,{size:34,weight:900,color:C.ink});
      P().text(c,`${pct(r.funding)} funded before any ${noun} increase`,rx+18,319,{size:9,weight:500,color:C.tealDark});
      const end=statGrid(c,[
        {label:s.goalBasis==='future'?'Future target entered':'Goal amount today',value:compact(s.goalBasis==='future'?s.goalFuture:s.goalToday)},
        {label:'Funding gap at goal date',value:compact(r.gap)},
        {label:`Current ${frequencyNounPhrase(s,noun)}`,value:shortContribution(s.monthlySIP,s)},
        {label:`Total ${frequencyNounPhrase(s,noun)} required`,value:shortContribution(r.requiredContribution,s)},
        {label:`Additional ${frequencyNounPhrase(s,noun)} required`,value:shortContribution(r.additionalContribution,s)},
        {label:'Projected funding from current plan',value:pct(r.funding)}
      ],360,3);
      const ry=end+18;
      card(c,M,ry,CW,64,r.additionalContribution>0?C.amber:C.pale,r.additionalContribution>0?C.amberLine:'#b9ddd8',10);
      P().text(c,`Additional ${frequencyNounPhrase(s,noun)} required`,M+16,ry+38,{size:10.5,weight:800,color:r.additionalContribution>0?'#704c00':C.tealDark});
      P().text(c,contributionText(r.additionalContribution,s),W-M-16,ry+40,{size:22,weight:900,color:r.additionalContribution>0?'#704c00':C.tealDark,align:'right'});
      const ay=assumptions(c,r,mode,ry+89);
      P().wrappedText(c,`Projected funding is based on the current plan - existing savings plus the current ${frequencyNounPhrase(s,noun)} before any increase. The required-contribution figure is the modelled starting contribution amount at the selected frequency under the selected assumptions.`,M,ay+25,CW,{size:9.5,lineHeight:13.5,weight:400,color:C.muted,maxLines:3});
    }else{
      P().text(c,'YOUR TARGET',M,159,{size:9,weight:900,color:C.teal});P().text(c,'Time to target',M,188,{size:22,weight:850,color:C.ink});
      card(c,M,216,CW,118,C.navy,null,16);
      P().text(c,'Estimated time to reach target',M+18,244,{size:10.5,weight:500,color:'#d7e2eb'});
      const dur=r.reached?`${Math.floor(r.months/12)} years ${r.months%12} months`:'More than 50 years';
      P().text(c,dur,M+18,292,{size:30,weight:900,color:'#fff'});
      P().text(c,`Target ${compact(r.target)} using ${contributionText(s.monthlySIP,s)} at ${(s.annualReturn*100).toFixed(1)}% assumed return`,M+18,319,{size:9.2,weight:400,color:'#d7e2eb'});
      const end=statGrid(c,[
        {label:'Target corpus',value:compact(r.target)},
        {label:'Existing invested amount',value:compact(s.currentSavings)},
        {label:`Current ${frequencyNounPhrase(s,noun)}`,value:shortContribution(s.monthlySIP,s)},
        {label:'Total money invested by then',value:compact(r.totalInvested)},
        {label:'Estimated investment growth',value:compact(r.growth)},
        {label:'Time saved by step-up',value:r.fixedReached?`${Math.floor(r.timeSavedMonths/12)}y ${r.timeSavedMonths%12}m`:'N/A'}
      ],360,3);
      const ay=assumptions(c,r,mode,end+26);
      P().wrappedText(c,`This mode solves for time rather than contribution amount. If you instead know the target date and want to calculate the required ${frequencyNounPhrase(s,noun)}, use the investment-required-for-a-goal mode.`,M,ay+25,CW,{size:9.5,lineHeight:13.5,weight:400,color:C.muted,maxLines:3});
    }
    const p2=page(),c2=p2.ctx;header(c2,mode);await charts(c2,mode,154);
    return [p1.canvas,p2.canvas,...yearlyPages(r,mode),...comparisonPages(r,mode),reportGuidePage(r,mode),otherToolsPage()];
  }
  window.CarrowmontSIPPdfRenderer={render};
})();
