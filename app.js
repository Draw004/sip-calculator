(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const $$=sel=>Array.from(document.querySelectorAll(sel));
  const Core=window.CarrowmontSIPCore;
  const Locale=window.CarrowmontLocale;
  let mode='growth';
  let latestResult=null;
  let frequencyUserOverride=false;

  const defaults={growth:{currentSavings:100000,monthlySIP:10000,years:15,annualReturn:12,annualStepUp:10,goalToday:5000000,goalBasis:'today',goalFuture:10000000,targetAmount:10000000,inflation:6},goal:{currentSavings:500000,monthlySIP:10000,years:15,annualReturn:10,annualStepUp:5,goalToday:5000000,goalBasis:'today',goalFuture:10000000,targetAmount:10000000,inflation:6},target:{currentSavings:500000,monthlySIP:10000,years:15,annualReturn:10,annualStepUp:5,goalToday:5000000,goalBasis:'today',goalFuture:10000000,targetAmount:10000000,inflation:6}};

  const frequencyOrder=['weekly','biweekly','semimonthly','fourweekly','monthly'];
  const frequencyBaseLabels={weekly:'Weekly',semimonthly:'Twice Monthly',fourweekly:'Every 4 Weeks',monthly:'Monthly'};
  function frequencyProfile(regionCode=region()){return Locale.regions[regionCode]||Locale.regions.OTHER||{};}


  function frequencyLabel(key,regionCode=region()){
    if(key==='biweekly'){
      const style=frequencyProfile(regionCode).twoWeekLabel||'neutral';
      if(style==='fortnightly') return 'Fortnightly (Every 2 Weeks)';
      if(style==='biweekly') return 'Biweekly (Every 2 Weeks)';
      return 'Every 2 Weeks';
    }
    return frequencyBaseLabels[key]||'Monthly';
  }
  function frequencyAdjective(key=frequency()){
    if(key==='biweekly'){
      const style=frequencyProfile().twoWeekLabel||'neutral';
      return style==='fortnightly'?'fortnightly':style==='biweekly'?'biweekly':'every-2-weeks';
    }
    if(key==='semimonthly') return 'twice-monthly';
    if(key==='fourweekly') return 'four-weekly';
    return key==='weekly'?'weekly':'monthly';
  }
  function cadenceText(key=frequency()){
    if(key==='weekly') return 'per week';
    if(key==='biweekly') return 'every 2 weeks';
    if(key==='semimonthly') return 'twice monthly';
    if(key==='fourweekly') return 'every 4 weeks';
    return 'per month';
  }
  function frequency(){return $('contributionFrequency')?.value||'monthly';}
  function defaultFrequencyForRegion(code=region()){return frequencyProfile(code).contributionFrequency||'monthly';}
  function frequencyDisplayName(key=frequency()){return frequencyLabel(key,region()).replace(/\s*\(Every 2 Weeks\)\s*/,'').trim();}
  function contributionText(amount,key=frequency()){return `${money(amount)} ${cadenceText(key)}`;}
  function isIndia(){return region()==='IN';}
  function contributionNoun(){return isIndia()?'SIP':'investment';}
  function usesNeutralTwoWeekLabel(regionCode=region()){return (frequencyProfile(regionCode).twoWeekLabel||'neutral')==='neutral';}
  function frequencyNounPhrase(key=frequency(),noun=contributionNoun()){
    if(key==='biweekly'&&usesNeutralTwoWeekLabel()) return `${noun} every 2 weeks`;
    return `${frequencyDisplayName(key).toLowerCase()} ${noun}`;
  }
  function currentContributionLabel(){return `Current ${frequencyNounPhrase()}`;}
  function headlineContributionPhrase(key=frequency()){
    if(isIndia()) return `${frequencyAdjective(key)} SIP`;
    if(key==='biweekly'&&usesNeutralTwoWeekLabel()) return 'investments made every 2 weeks';
    return `${frequencyAdjective(key)} investments`;
  }

  function value(id){return Number($(id).value)||0;}
  function raw(){return {mode,currentSavings:value('currentSavings'),monthlySIP:value('monthlySIP'),contributionFrequency:frequency(),years:value('years'),annualReturn:value('annualReturn'),annualStepUp:value('annualStepUp'),goalToday:value('goalToday'),goalBasis:$('goalBasis').value,goalFuture:value('goalFuture'),targetAmount:value('targetAmount'),inflation:value('inflation')};}
  function money(v){return Locale.formatMoney(v,{maximumFractionDigits:0});}
  function compact(v){return Locale.formatCompactMoney(v,{maximumFractionDigits:2});}
  function pct(v){return `${Math.round(v*100)}%`;}
  function symbol(){return Locale.currencySymbol();}
  function region(){return Locale.getRegion();}
  function regionName(){return Locale.regions[Locale.getRegion()]?.label||'Other';}

  function setMoneyPrefixes(){ $$('.currency-prefix').forEach(x=>x.textContent=symbol()); }

  function syncFrequencyOptions(){
    const select=$('contributionFrequency');
    if(!select) return;
    const desired=frequencyUserOverride?(select.value||'monthly'):defaultFrequencyForRegion();
    select.innerHTML=frequencyOrder.map(key=>`<option value="${key}">${frequencyLabel(key)}</option>`).join('');
    select.value=frequencyOrder.includes(desired)?desired:'monthly';
  }

  function updateFrequencyCopy(){
    const key=frequency(),monthly=key==='monthly',noun=contributionNoun();
    const display=frequencyDisplayName(key);
    if($('introEyebrow')) $('introEyebrow').textContent=isIndia()
      ? (monthly?'SIP & MONTHLY INVESTING':'SIP & RECURRING INVESTING')
      : 'RECURRING INVESTING & GROWTH';
    if($('sipAmountLabel')) $('sipAmountLabel').textContent=currentContributionLabel();
    if($('sipAmountHint')) $('sipAmountHint').textContent=monthly?'The starting monthly contribution.':`The starting contribution invested ${cadenceText(key)}.`;
    if($('stepUpLabel')) $('stepUpLabel').textContent=monthly
      ? (isIndia()?'Annual increase in monthly SIP':'Annual increase in monthly investment')
      : (isIndia()?'Annual increase in SIP contribution':'Annual contribution increase');
    if($('investmentIntro')) $('investmentIntro').textContent=monthly
      ? 'Enter your current investment amount and the recurring monthly contribution you want to model.'
      : `Enter your current investment amount and the recurring contribution you want to invest ${cadenceText(key)}.`;

    if($('introHeadline')) $('introHeadline').textContent=isIndia()
      ? `See how a ${headlineContributionPhrase(key)} may grow or what SIP may be required for a goal.`
      : `See how ${headlineContributionPhrase(key)} may grow or what recurring investment may be required for a goal.`;
    if($('ideaContribution')) $('ideaContribution').textContent=isIndia()?`${display} SIP`:(key==='biweekly'&&usesNeutralTwoWeekLabel()?'Investment Every 2 Weeks':`${display} investment`);
    if($('ideaDescription')) $('ideaDescription').textContent=monthly
      ? (isIndia()
        ? 'A SIP is a recurring investment method. This calculator models the arithmetic of regular contributions and assumed returns; it does not predict or guarantee investment performance.'
        : 'Monthly investing is a recurring investment method. This calculator models the arithmetic of regular contributions and assumed returns; it does not predict or guarantee investment performance.')
      : 'Regular investing is a recurring contribution method. This calculator models the arithmetic of regular contributions and assumed returns; it does not predict or guarantee investment performance.';

    const phrase=frequencyNounPhrase(key,noun);
    const requiredLabel=`Total ${phrase} required from now`;
    const additionalLabel=`Additional ${phrase} required`;
    if($('requiredSIPLabel')) $('requiredSIPLabel').textContent=requiredLabel;
    if($('additionalSIPLabel')) $('additionalSIPLabel').textContent=additionalLabel;
    if($('actionRibbonLabel')) $('actionRibbonLabel').textContent=additionalLabel;

    if($('journeyIntro')) $('journeyIntro').textContent=monthly
      ? `Follow the monthly ${noun}, money invested and modelled portfolio value for every year of the plan.`
      : `Follow the recurring ${noun}, money invested and modelled portfolio value for every year of the plan.`;

    if($('howProjection')) $('howProjection').textContent=monthly
      ? (isIndia()
        ? 'A recurring SIP is added monthly while the invested balance compounds using the monthly rate implied by the annual return assumption. If a step-up is entered, the monthly contribution increases once each year.'
        : 'A recurring investment is added monthly while the invested balance compounds using the monthly rate implied by the annual return assumption. If an annual increase is entered, the monthly contribution increases once each year.')
      : `A recurring ${noun} contribution is added ${cadenceText(key)} while the invested balance compounds using the equivalent ${display.toLowerCase()} rate implied by the annual return assumption. If an annual increase is entered, the contribution increases once each year.`;
    if($('howGoal')) $('howGoal').textContent=monthly
      ? (isIndia()
        ? 'In goal mode, Carrowmont can either grow an amount entered in today’s money using the inflation / price-growth assumption or use a future target amount directly, then solve for the starting monthly SIP required.'
        : 'In goal mode, Carrowmont can either grow an amount entered in today’s money using the inflation / price-growth assumption or use a future target amount directly, then solve for the starting monthly investment required.')
      : `In goal mode, Carrowmont can either grow an amount entered in today’s money using the inflation / price-growth assumption or use a future target amount directly, then solve for the starting ${frequencyNounPhrase(key,noun)} required.`;
    if($('howTarget')) $('howTarget').textContent=monthly
      ? `In Time to target mode, you enter the target corpus and your ${noun} assumptions; the calculator estimates the first modelled month in which the portfolio reaches that target.`
      : `In Time to target mode, you enter the target corpus and your ${noun} assumptions; the calculator estimates the first modelled contribution period in which the portfolio reaches that target.`;

    if($('methodRate')) $('methodRate').innerHTML=monthly
      ? '<strong>Monthly return:</strong> The annual return assumption is converted to the equivalent monthly compound rate.'
      : `<strong>${display} return:</strong> The annual return assumption is converted to the equivalent compound rate for the selected contribution frequency.`;
    if($('methodProjection')) $('methodProjection').innerHTML=monthly
      ? `<strong>${isIndia()?'SIP':'Investment'} projection:</strong> Existing investments grow monthly. Contributions are added at month-end and can increase once each year by the entered step-up rate.`
      : `<strong>${isIndia()?'SIP':'Investment'} projection:</strong> Existing investments grow at the equivalent periodic rate. Contributions are added at the end of each selected contribution period and can increase once each year by the entered annual increase.`;
    if($('methodRequired')) $('methodRequired').innerHTML=monthly
      ? `<strong>Monthly ${isIndia()?'SIP':'investment'} required:</strong> The starting monthly contribution that would model to the selected future goal while applying the entered annual step-up. It is solved numerically.`
      : `<strong>${frequencyNounPhrase(key,noun).replace(/^./,c=>c.toUpperCase())} required:</strong> The starting contribution for the selected frequency that would model to the selected future goal while applying the entered annual increase. It is solved numerically.`;
    if($('methodTarget')) $('methodTarget').innerHTML=monthly
      ? '<strong>Time to target:</strong> The first modelled month in which the projected portfolio equals or exceeds the target corpus, checked for up to 50 years.'
      : '<strong>Time to target:</strong> The first modelled contribution period in which the projected portfolio equals or exceeds the target corpus, checked for up to 50 years.';
  }

  function setupLocale(){
    const rs=$('regionSelect'),cs=$('currencySelect');
    const regionEntries=Object.entries(Locale.regions).sort(([codeA,a],[codeB,b])=>{
      if(codeA==='OTHER') return 1;
      if(codeB==='OTHER') return -1;
      return a.label.localeCompare(b.label,'en',{sensitivity:'base'});
    });
    rs.innerHTML=''; regionEntries.forEach(([code,r])=>{const o=document.createElement('option');o.value=code;o.textContent=r.label;rs.appendChild(o);});
    cs.innerHTML=''; Object.entries(Locale.currencies).forEach(([code,c])=>{const o=document.createElement('option');o.value=code;o.textContent=`${code} · ${c.label}`;cs.appendChild(o);});
    const sync=()=>{
      rs.value=Locale.getRegion();
      cs.value=Locale.getCurrency();
      $('localeCurrent').textContent=`${Locale.getProfile().label} · ${Locale.getCurrency()}`;
      setMoneyPrefixes();
      $('indiaBadge').hidden=Locale.getRegion()!=='IN';
      document.body.classList.toggle('sip-india-view',Locale.getRegion()==='IN');
      const indianContext=Locale.getRegion()==='IN' && Locale.getCurrency()==='INR';
      const code=Locale.getCurrency();
      if($('goalFutureHint')) $('goalFutureHint').textContent=indianContext
        ? 'Enter the nominal amount you want at the selected future date. For example, ₹1 crore.'
        : `Enter the nominal amount you want at the selected future date in ${code}.`;
      if($('targetAmountHint')) $('targetAmountHint').textContent=indianContext
        ? 'For example, ₹1 crore as a future nominal target.'
        : `Enter the future nominal target directly in ${code}.`;
      syncFrequencyOptions();
      updateFrequencyCopy();
    };
    rs.addEventListener('change',()=>{frequencyUserOverride=false;Locale.setRegion(rs.value);cs.value=Locale.getCurrency();}); cs.addEventListener('change',()=>Locale.setCurrency(cs.value));
    $('localeDone').addEventListener('click',()=>{$('localeMenu').open=false;}); window.addEventListener('carrowmont:localechange',()=>{sync();render();}); sync();
  }

  function setMode(next){
    if(next!==mode){mode=next;}
    $$('.mode-tab').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));});
    $('goalInputs').hidden=mode!=='goal';
    $('targetInputs').hidden=mode!=='target';
    $('growthMetrics').hidden=mode!=='growth';$('goalMetrics').hidden=mode!=='goal';$('targetMetrics').hidden=mode!=='target';$('fundingBox').hidden=mode!=='goal';$('actionRibbon').hidden=mode!=='goal';
    $('yearsField').hidden=mode==='target';
    $('investmentStepNum').textContent=mode==='growth'?'1':'2';
    syncGoalBasis();
    render();
  }

  function syncGoalBasis(){
    const future=$('goalBasis').value==='future';
    $('goalTodayField').hidden=future; $('inflationField').hidden=future; $('goalFutureField').hidden=!future;
  }

  function reset(){
    const d=defaults[mode]; Object.keys(d).forEach(k=>{if($(k)) $(k).value=d[k];});
    frequencyUserOverride=false;
    syncFrequencyOptions();
    syncGoalBasis();
    updateFrequencyCopy();
    render();
  }

  function formatDuration(months,reached=true){
    if(!reached) return 'More than 50 years';
    if(months<=0) return 'Already reached';
    const y=Math.floor(months/12),m=months%12;
    return `${y?`${y} ${y===1?'year':'years'}`:''}${y&&m?' ':''}${m?`${m} ${m===1?'month':'months'}`:''}`;
  }

  function updateSnapshot(r){
    const key=r.state.contributionFrequency,display=frequencyDisplayName(key),amountText=v=>contributionText(v,key),noun=contributionNoun();
    if(mode==='growth'){
      const years=r.state.years; $('periodPill').textContent=`${years}-year plan`;
      $('snapshotTitle').textContent=isIndia()?'SIP growth snapshot':'Investment growth snapshot';
      $('heroLabel').textContent=`Estimated value after ${years} years`;
      $('heroValue').textContent=compact(r.projection.portfolio);
      $('heroNote').textContent=key==='monthly'
        ? `Based on your existing investment, monthly ${noun}, step-up and return assumption`
        : `Based on your existing investment, ${frequencyNounPhrase(key,noun)}, annual increase and return assumption`;
      $('totalInvested').textContent=compact(r.projection.totalInvested); $('estimatedGrowth').textContent=compact(r.projection.growth); $('fixedValue').textContent=compact(r.fixedProjection.portfolio); $('stepUpBenefit').textContent=compact(r.stepUpBenefit);
    } else if(mode==='goal') {
      const years=r.state.years; $('periodPill').textContent=`${years}-year goal`;
      $('snapshotTitle').textContent=isIndia()?'Goal SIP snapshot':'Goal investment snapshot'; $('heroLabel').textContent=`Estimated goal amount in ${years} years`; $('heroValue').textContent=compact(r.target);
      $('heroNote').textContent=r.state.goalBasis==='future'?`Entered directly as the future target amount for year ${years}`:`${money(r.state.goalToday)} today grown at ${(r.state.inflation*100).toFixed(1)}% p.a. for ${years} years`;
      $('futureGoal').textContent=compact(r.target); $('currentPlanValue').textContent=compact(r.current.portfolio); $('requiredSIP').textContent=amountText(r.requiredContribution); $('additionalSIP').textContent=amountText(r.additionalContribution);
      const fp=Math.min(100,Math.max(0,r.funding*100)); $('fundingPct').textContent=pct(r.funding); $('fundingBar').style.width=`${fp}%`;
      $('fundingText').textContent=r.target<=0?'Enter a goal amount to calculate funding.':r.funding>=1?`Your current plan is projected to meet or exceed the modelled goal under these assumptions.`:`Your current plan is projected to cover about ${Math.round(r.funding*100)}% of the modelled goal. This percentage uses the current ${noun} before any increase.`;
      $('actionValue').textContent=amountText(r.additionalContribution); const ar=$('actionRibbon'); if(r.additionalContribution<=0){ar.style.background='#e9f7f4';ar.style.borderColor='#a7d8d1';ar.style.color='#08756d';}else{ar.style.background='#fff5d9';ar.style.borderColor='#efc96d';ar.style.color='#7a5200';}
      updateFrequencyCopy();
    } else {
      $('periodPill').textContent=r.reached?formatDuration(r.months,true):'50+ year horizon';
      $('snapshotTitle').textContent='Time-to-target snapshot'; $('heroLabel').textContent='Estimated time to reach your target'; $('heroValue').textContent=formatDuration(r.months,r.reached); $('heroNote').textContent=`Target ${compact(r.target)} with ${amountText(r.state.monthlySIP)}, ${(r.state.annualReturn*100).toFixed(1)}% assumed return and ${(r.state.annualStepUp*100).toFixed(1)}% annual increase`;
      $('targetCorpusValue').textContent=compact(r.target); $('timeToTargetValue').textContent=formatDuration(r.months,r.reached); $('targetTotalInvested').textContent=compact(r.totalInvested); $('targetGrowthValue').textContent=compact(r.growth);
    }
  }

  function niceMax(v){ if(v<=0)return 1; const p=Math.pow(10,Math.floor(Math.log10(v))); return Math.ceil(v/p/2)*2*p; }
  function coords(series,key,maxY){ const W=760,H=380,L=82,R=26,T=54,B=52; const span=Math.max(1,series[series.length-1].year-series[0].year); return series.map(d=>({x:L+(d.year-series[0].year)/span*(W-L-R),y:T+(1-(d[key]/maxY))*(H-T-B),d})); }
  function path(points){return points.map((p,i)=>`${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');}  
  function grid(svg,maxY,years){
    const W=760,H=380,L=82,R=26,T=54,B=52,parts=[]; for(let i=0;i<=4;i++){const y=T+i*(H-T-B)/4,val=maxY*(1-i/4);parts.push(`<line class="gridline" x1="${L}" y1="${y}" x2="${W-R}" y2="${y}"/><text class="axis" x="${L-12}" y="${y+4}" text-anchor="end">${compact(val)}</text>`);} [0,years/2,years].forEach((v,i)=>{const x=L+i*(W-L-R)/2;parts.push(`<text class="axis" x="${x}" y="${H-18}" text-anchor="middle">${v===0?'Today':`Year ${Math.round(v)}`}</text>`);}); svg.innerHTML=parts.join('');
  }
  function calloutLayout(p,anchor='start',dy=-10){
    const boxW=178,boxH=46,offset=12;
    let x=anchor==='end'?p.x-boxW-offset:anchor==='center'?p.x-boxW/2:p.x+offset;
    x=Math.max(86,Math.min(760-26-boxW,x));
    const y=Math.max(50,Math.min(380-70-boxH,p.y+dy-boxH));
    return {x,y,boxW,boxH};
  }
  function calloutMarkup(p,label,value,layout){
    const {x,y,boxW,boxH}=layout;
    return `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#0e8b80" stroke="#fff" stroke-width="2"/><g><rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="9" fill="#f3fbfa" stroke="#a8d8d2"/><text class="chart-label" x="${x+12}" y="${y+17}">${label}</text><text class="chart-value" x="${x+12}" y="${y+36}">${value}</text></g>`;
  }
  function dotAndLabel(p,label,value,anchor='start',dy=-10){ return calloutMarkup(p,label,value,calloutLayout(p,anchor,dy)); }
  function spacedPairLabels(a,b,gap=16){
    let la=calloutLayout(a.p,a.anchor||'start',a.dy??-10);
    let lb=calloutLayout(b.p,b.anchor||'start',b.dy??-10);
    const horizontalOverlap=la.x < lb.x+lb.boxW && lb.x < la.x+la.boxW;
    if(horizontalOverlap){
      let top=a.p.y<=b.p.y?la:lb, bottom=a.p.y<=b.p.y?lb:la;
      if(bottom.y-(top.y+top.boxH)<gap){
        bottom.y=top.y+top.boxH+gap;
        const maxY=380-70-bottom.boxH;
        if(bottom.y>maxY){
          const shift=bottom.y-maxY;
          bottom.y-=shift; top.y=Math.max(50,top.y-shift);
        }
      }
    }
    return calloutMarkup(a.p,a.label,a.value,la)+calloutMarkup(b.p,b.label,b.value,lb);
  }
  function gapBracketMarkup(topP,bottomP,label,value){
    if(!topP||!bottomP)return '';
    const top=Math.min(topP.y,bottomP.y),bottom=Math.max(topP.y,bottomP.y);
    if(bottom-top<24)return '';
    const x=Math.max(120,Math.min(700,topP.x-46));
    const mid=(top+bottom)/2,boxW=148,boxH=42;
    let bx=x-boxW-12;
    if(bx<86)bx=x+12;
    let by=Math.max(58,Math.min(380-72-boxH,mid-boxH/2));
    return `<g><line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="#d18a00" stroke-width="2.2"/><line x1="${x-6}" y1="${top}" x2="${x+6}" y2="${top}" stroke="#d18a00" stroke-width="2.2"/><line x1="${x-6}" y1="${bottom}" x2="${x+6}" y2="${bottom}" stroke="#d18a00" stroke-width="2.2"/><rect x="${bx}" y="${by}" width="${boxW}" height="${boxH}" rx="9" fill="#fff8e8" stroke="#e5b552"/><text class="chart-label" x="${bx+10}" y="${by+16}">${label}</text><text class="chart-value" x="${bx+10}" y="${by+33}">${value}</text></g>`;
  }
  function nearestYearPoint(points,targetYear){ return points.reduce((best,p)=>Math.abs(p.d.year-targetYear)<Math.abs(best.d.year-targetYear)?p:best,points[0]); }
  function midpointLabel(p,label,value,anchor='start',dy=-12){ return dotAndLabel(p,label,value,anchor,dy); }

  function renderCharts(r){
    const s=r.state,svg1=$('chart1'),svg2=$('chart2');
    if(mode==='growth'){
      const years=s.years;
      $('chart1Eyebrow').textContent='PORTFOLIO BUILD';$('chart1Title').textContent='Projected value vs money invested';$('chart1Note').textContent='See how investment growth may compound over time.';
      $('chart2Eyebrow').textContent='STEP-UP COMPARISON';$('chart2Title').textContent='Step-up SIP vs fixed SIP';$('chart2Note').textContent='Same return and period; only the annual SIP increase changes.';
      const ser=Core.series(s),maxY=niceMax(Math.max(...ser.map(d=>d.portfolio))*1.08); grid(svg1,maxY,years); const pv=coords(ser,'portfolio',maxY),inv=coords(ser,'totalInvested',maxY); const base=svg1.innerHTML; const midpointYear=Math.round(years/2),midPV=nearestYearPoint(pv,midpointYear),midInv=nearestYearPoint(inv,midpointYear); svg1.innerHTML=base+`<path d="${path(pv)}" class="plan-line"/><path d="${path(inv)}" class="added-line"/><line x1="115" y1="25" x2="145" y2="25" class="plan-line"/><text x="154" y="29" class="chart-legend">Projected value</text><line x1="300" y1="25" x2="330" y2="25" class="added-line"/><text x="339" y="29" class="chart-legend">Money invested</text>`+spacedPairLabels({p:midPV,label:`Year ${Math.round(midPV.d.year)} projected`,value:compact(midPV.d.portfolio),anchor:'center',dy:-12},{p:midInv,label:`Year ${Math.round(midInv.d.year)} invested`,value:compact(midInv.d.totalInvested),anchor:'center',dy:60},18)+spacedPairLabels({p:pv[pv.length-1],label:`Year ${years} projected`,value:compact(r.projection.portfolio),anchor:'end',dy:-12},{p:inv[inv.length-1],label:`Year ${years} invested`,value:compact(inv[inv.length-1].d.totalInvested),anchor:'end',dy:60},18);
      const fixed=Core.series(s,years,s.monthlySIP,0),step=Core.series(s); const max2=niceMax(Math.max(step[step.length-1].portfolio,fixed[fixed.length-1].portfolio)*1.08); grid(svg2,max2,years); const fp=coords(fixed,'portfolio',max2),sp=coords(step,'portfolio',max2); const midStep=nearestYearPoint(sp,midpointYear),midFixed=nearestYearPoint(fp,midpointYear); svg2.innerHTML+=`<path d="${path(fp)}" class="fixed-line"/><path d="${path(sp)}" class="plan-line"/><line x1="115" y1="25" x2="145" y2="25" class="plan-line"/><text x="154" y="29" class="chart-legend">${region()==='IN'?`${(s.annualStepUp*100).toFixed(1)}% step-up SIP`:`${(s.annualStepUp*100).toFixed(1)}% annual increase`}</text><line x1="330" y1="25" x2="360" y2="25" class="fixed-line"/><text x="369" y="29" class="chart-legend">Fixed SIP</text>`+spacedPairLabels({p:midStep,label:`Year ${Math.round(midStep.d.year)} step-up`,value:compact(midStep.d.portfolio),anchor:'center',dy:-12},{p:midFixed,label:`Year ${Math.round(midFixed.d.year)} fixed`,value:compact(midFixed.d.portfolio),anchor:'center',dy:60},18)+spacedPairLabels({p:sp[sp.length-1],label:`Step-up - year ${years} projected`,value:compact(r.projection.portfolio),anchor:'end',dy:-12},{p:fp[fp.length-1],label:`Year ${years} fixed`,value:compact(fp[fp.length-1].d.portfolio),anchor:'end',dy:60},18);
    }else if(mode==='goal'){
      const years=s.years,midpointYear=Math.round(years/2);
      $('chart1Eyebrow').textContent='GOAL VS CURRENT PLAN';$('chart1Title').textContent='Goal cost and current-plan path';$('chart1Note').textContent='Compare the goal with the value of your current plan.';
      $('chart2Eyebrow').textContent='CURRENT VS REQUIRED SIP';$('chart2Title').textContent='What closing the gap may look like';$('chart2Note').textContent='The required path uses the modelled starting SIP required for the selected goal date.';
      const pser=Core.series(s),gser=Core.goalSeries(s).map(d=>({...d,goal:s.goalBasis==='future'?s.goalFuture:d.goal})); const comb=pser.map((d,i)=>({...d,goal:gser[i]?.goal||0})); const maxY=niceMax(Math.max(...comb.map(d=>Math.max(d.portfolio,d.goal)))*1.08); grid(svg1,maxY,years); const pp=coords(comb,'portfolio',maxY),gp=coords(comb,'goal',maxY),midPP=nearestYearPoint(pp,midpointYear),midGP=nearestYearPoint(gp,midpointYear); svg1.innerHTML+=`<path d="${path(gp)}" class="goal-line"/><path d="${path(pp)}" class="plan-line"/><line x1="115" y1="25" x2="145" y2="25" class="goal-line"/><text x="154" y="29" class="chart-legend">Goal path</text><line x1="280" y1="25" x2="310" y2="25" class="plan-line"/><text x="319" y="29" class="chart-legend">Current plan</text>`+spacedPairLabels({p:midGP,label:`Year ${Math.round(midGP.d.year)} goal`,value:compact(midGP.d.goal),anchor:'center',dy:-10},{p:midPP,label:`Year ${Math.round(midPP.d.year)} current`,value:compact(midPP.d.portfolio),anchor:'center',dy:58},18)+spacedPairLabels({p:gp[gp.length-1],label:`Goal · year ${years}`,value:compact(r.target),anchor:'center',dy:-10},{p:pp[pp.length-1],label:`Current plan · year ${years}`,value:compact(r.current.portfolio),anchor:'center',dy:58},18);
      const req=Core.series(s,years,r.requiredMonthly,s.annualStepUp*100),cur=Core.series(s); const max2=niceMax(Math.max(req[req.length-1].portfolio,cur[cur.length-1].portfolio,r.target)*1.08); grid(svg2,max2,years); const rp=coords(req,'portfolio',max2),cp=coords(cur,'portfolio',max2),midRP=nearestYearPoint(rp,midpointYear),midCP=nearestYearPoint(cp,midpointYear); svg2.innerHTML+=`<path d="${path(rp)}" class="required-line"/><path d="${path(cp)}" class="plan-line"/><line x1="115" y1="25" x2="145" y2="25" class="required-line"/><text x="154" y="29" class="chart-legend">Required-SIP path</text><line x1="320" y1="25" x2="350" y2="25" class="plan-line"/><text x="359" y="29" class="chart-legend">Current plan</text>`+spacedPairLabels({p:midRP,label:`Year ${Math.round(midRP.d.year)} required`,value:compact(midRP.d.portfolio),anchor:'start',dy:-42},{p:midCP,label:`Year ${Math.round(midCP.d.year)} current`,value:compact(midCP.d.portfolio),anchor:'end',dy:36},20)+gapBracketMarkup(rp[rp.length-1],cp[cp.length-1],'SIP target gap',compact(r.gap))+dotAndLabel(rp[rp.length-1],`Required path · year ${years}`,compact(r.requiredPlan.portfolio),'end',-10);
    }else{
      const years=Math.max(1,Math.min(50,Math.ceil(r.yearsToTarget||50))),midpointYear=Math.max(1,Math.round(years/2));
      $('chart1Eyebrow').textContent='TARGET PATH';$('chart1Title').textContent='Your SIP path toward the target';$('chart1Note').textContent='See when the projected portfolio may reach the selected corpus.';
      $('chart2Eyebrow').textContent='STEP-UP IMPACT';$('chart2Title').textContent='Step-up SIP vs fixed SIP';$('chart2Note').textContent='Compare how the annual SIP increase may affect the time needed.';
      const ser=Core.series(s,years),targetSer=ser.map(d=>({...d,target:r.target}));const maxY=niceMax(Math.max(r.target,...ser.map(d=>d.portfolio))*1.08);grid(svg1,maxY,years);const pp=coords(ser,'portfolio',maxY),tp=coords(targetSer,'target',maxY),midPP=nearestYearPoint(pp,midpointYear);svg1.innerHTML+=`<path d="${path(tp)}" class="goal-line"/><path d="${path(pp)}" class="plan-line"/><line x1="115" y1="25" x2="145" y2="25" class="goal-line"/><text x="154" y="29" class="chart-legend">Target ${compact(r.target)}</text><line x1="320" y1="25" x2="350" y2="25" class="plan-line"/><text x="359" y="29" class="chart-legend">Current SIP path</text>`+midpointLabel(midPP,`Year ${Math.round(midPP.d.year)} value`,compact(midPP.d.portfolio),'start',-24)+dotAndLabel(pp[pp.length-1],r.reached?`Target reached · year ${r.yearsToTarget.toFixed(1)}`:`Year ${years}`,compact(pp[pp.length-1].d.portfolio),'end',-10);
      const step=Core.series(s,years),fixed=Core.series(s,years,s.monthlySIP,0);const max2=niceMax(Math.max(r.target,...step.map(d=>d.portfolio),...fixed.map(d=>d.portfolio))*1.08);grid(svg2,max2,years);const sp=coords(step,'portfolio',max2),fp=coords(fixed,'portfolio',max2),midSP=nearestYearPoint(sp,midpointYear),midFP=nearestYearPoint(fp,midpointYear);svg2.innerHTML+=`<path d="${path(fp)}" class="fixed-line"/><path d="${path(sp)}" class="plan-line"/><line x1="115" y1="25" x2="145" y2="25" class="plan-line"/><text x="154" y="29" class="chart-legend">Step-up SIP</text><line x1="300" y1="25" x2="330" y2="25" class="fixed-line"/><text x="339" y="29" class="chart-legend">Fixed SIP</text>`+midpointLabel(midSP,`Year ${Math.round(midSP.d.year)} step-up`,compact(midSP.d.portfolio),'start',-22)+midpointLabel(midFP,`Year ${Math.round(midFP.d.year)} fixed`,compact(midFP.d.portfolio),'end',28)+dotAndLabel(sp[sp.length-1],`Year ${years} step-up`,compact(sp[sp.length-1].d.portfolio),'end',-8);
    }
  }

  function summaryCard(label,value,small=''){return `<div><span>${label}</span><strong>${value}</strong>${small?`<small>${small}</small>`:''}</div>`;}
  function renderSummary(r){
    const key=r.state.contributionFrequency,noun=contributionNoun(),phrase=frequencyNounPhrase(key,noun),amount=contributionText(r.state.monthlySIP,key);
    const titlePhrase=phrase.replace(/^./,c=>c.toUpperCase());
    if(mode==='growth') $('summaryRow').innerHTML=summaryCard(titlePhrase,amount)+summaryCard('Total invested',compact(r.projection.totalInvested))+summaryCard('Estimated growth',compact(r.projection.growth))+summaryCard(`Value after ${r.state.years} years`,compact(r.projection.portfolio));
    else if(mode==='goal') $('summaryRow').innerHTML=summaryCard(r.state.goalBasis==='future'?'Future target entered':'Goal today',compact(r.state.goalBasis==='future'?r.state.goalFuture:r.state.goalToday))+summaryCard('Future goal',compact(r.target))+summaryCard('Current plan at goal date',compact(r.current.portfolio))+summaryCard('Projected funding',pct(r.funding),`Uses current ${noun} before any increase`);
    else $('summaryRow').innerHTML=summaryCard('Target corpus',compact(r.target))+summaryCard(`Current ${phrase}`,amount)+summaryCard('Estimated time',formatDuration(r.months,r.reached))+summaryCard('Estimated value when reached',compact(r.portfolio));
  }

  function renderJourney(r){
    const horizon=mode==='target'?Math.max(1,Math.min(50,Math.ceil(r.yearsToTarget||50))):r.state.years;
    const rows=Core.yearlyBreakdown(r.state,horizon);
    const last=rows[rows.length-1];
    const summary=$('journeySummary');
    const growthShare=last&&last.projectedValue>0?Math.max(0,last.estimatedGrowth/last.projectedValue):0;
    const key=r.state.contributionFrequency,display=frequencyDisplayName(key),noun=contributionNoun(),phrase=frequencyNounPhrase(key,noun);
    const contributionHeader=`${phrase.replace(/^./,c=>c.toUpperCase())} in that year`;
    const contributionCell=x=>contributionText(x.contributionPerPeriod??x.monthlySIP,key);
    if(mode==='growth'){
      summary.innerHTML=
        summaryCard('Total money invested',compact(r.projection.totalInvested),`Existing amount plus all ${noun} contributions`)+
        summaryCard('Estimated investment growth',compact(r.projection.growth),'Modelled value above total money invested')+
        summaryCard(`Projected value after ${r.state.years} years`,compact(r.projection.portfolio),`Based on ${(r.state.annualReturn*100).toFixed(1)}% p.a. assumed return`)+
        summaryCard('Growth share of final value',`${Math.round(growthShare*100)}%`,'Estimated investment growth ÷ projected value');
      $('journeyHead').innerHTML=`<tr><th>Year</th><th>${contributionHeader}</th><th>Invested during year</th><th>Total invested to date</th><th>Projected value at year-end</th><th>Estimated investment growth</th></tr>`;
      $('journeyBody').innerHTML=rows.map(x=>`<tr><td>Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}</td><td>${contributionCell(x)}</td><td>${compact(x.investedThisYear)}</td><td>${compact(x.totalInvested)}</td><td class="positive">${compact(x.projectedValue)}</td><td class="positive">${compact(x.estimatedGrowth)}</td></tr>`).join('');
      $('journeyNote').textContent=`Projected values use the entered ${(r.state.annualReturn*100).toFixed(1)}% annual return assumption. Estimated investment growth is the modelled projected value above the total money invested to that point. Total invested to date includes any existing investment. These are not actual or guaranteed returns.`;
    }else if(mode==='goal'){
      summary.innerHTML=
        summaryCard('Total money invested by goal date',compact(r.current.totalInvested),`Existing amount plus current ${noun} path`)+
        summaryCard('Projected current-plan value',compact(r.current.portfolio),`Future value using ${(r.state.annualReturn*100).toFixed(1)}% p.a. assumed return`)+
        summaryCard('Estimated future goal amount',compact(r.target),'Future money at the selected goal date')+
        summaryCard('Projected funding from current plan',pct(r.funding),`Before increasing the current ${noun}`);
      $('journeyHead').innerHTML=`<tr><th>Year</th><th>${contributionHeader}</th><th>Invested during year</th><th>Total invested to date</th><th>Projected current-plan value</th><th class="goal-col">Goal amount at that year</th><th>Projected funding</th></tr>`;
      $('journeyBody').innerHTML=rows.map(x=>`<tr><td>Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}</td><td>${contributionCell(x)}</td><td>${compact(x.investedThisYear)}</td><td>${compact(x.totalInvested)}</td><td class="positive">${compact(x.projectedValue)}</td><td class="goal-col">${compact(x.goal||0)}</td><td>${pct(x.funding||0)}</td></tr>`).join('');
      $('journeyNote').textContent=`Projected values use the entered ${(r.state.annualReturn*100).toFixed(1)}% annual return assumption. Projected funding compares the current savings/${noun} path with the modelled goal amount at each year. Total invested to date includes any existing investment. It does not assume the higher contribution required to close the gap.`;
    }else{
      summary.innerHTML=summaryCard('Target corpus',compact(r.target))+summaryCard('Estimated time to target',formatDuration(r.months,r.reached))+summaryCard('Total money invested by then',compact(r.totalInvested))+summaryCard('Estimated investment growth',compact(r.growth));
      $('journeyHead').innerHTML=`<tr><th>Year</th><th>${contributionHeader}</th><th>Invested during year</th><th>Total invested to date</th><th>Projected portfolio value</th><th class="goal-col">Target corpus</th><th>Progress to target</th></tr>`;
      $('journeyBody').innerHTML=rows.map(x=>`<tr><td>Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}</td><td>${contributionCell(x)}</td><td>${compact(x.investedThisYear)}</td><td>${compact(x.totalInvested)}</td><td class="positive">${compact(x.projectedValue)}</td><td class="goal-col">${compact(r.target)}</td><td>${pct(Math.min(1,x.projectedValue/Math.max(1,r.target)))}</td></tr>`).join('');
      $('journeyNote').textContent=`The target is a future nominal corpus. Projected values use the entered ${(r.state.annualReturn*100).toFixed(1)}% annual return assumption and the selected annual contribution increase. The table shows how close the modelled portfolio is to the target at each year.`;
    }
    $('journeyCount').textContent=`${rows.length} yearly rows`;
    $('comparisonCount').textContent=`${rows.length} yearly rows`;
    $('comparisonBody').innerHTML=rows.map(x=>`<tr><td>Year ${Number.isInteger(x.year)?x.year:x.year.toFixed(1)}</td><td>${compact(x.projectedValue)}</td><td>${compact(x.fixedProjectedValue)}</td><td>${x.stepUpDifference>=0?'+':''}${compact(x.stepUpDifference)}</td></tr>`).join('');
  }

  function renderInsights(r){
    const key=r.state.contributionFrequency,display=frequencyDisplayName(key),noun=contributionNoun(),phrase=frequencyNounPhrase(key,noun);
    if(mode==='growth'){
      const contributionShare=r.projection.portfolio>0?r.projection.totalInvested/r.projection.portfolio:0; const growthShare=1-contributionShare;
      $('insightGrid').innerHTML=`<article><span>Investment multiple</span><strong>${r.projection.totalInvested>0?(r.projection.portfolio/r.projection.totalInvested).toFixed(2):'0.00'}×</strong><p>Projected ending value divided by the money modelled as invested.</p></article><article><span>Estimated growth share</span><strong>${Math.round(Math.max(0,growthShare)*100)}%</strong><p>Share of the projected ending value above the modelled amount invested.</p></article><article><span>Annual ${isIndia()?'SIP step-up':'contribution increase'}</span><strong>${(r.state.annualStepUp*100).toFixed(1)}%</strong><p>Your ${phrase} is modelled to increase once each year at this rate.</p></article><article><span>Step-up impact</span><strong>${compact(r.stepUpBenefit)}</strong><p>Difference between the selected annual-increase path and a fixed contribution under the same return and period.</p></article>`;
    }else if(mode==='goal'){
      $('insightGrid').innerHTML=`<article><span>Goal inflation effect</span><strong>${r.state.goalBasis==='future'?'Direct':(r.state.goalToday>0?(r.target/r.state.goalToday).toFixed(2)+'×':'0.00×')}</strong><p>${r.state.goalBasis==='future'?'The future target was entered directly.':'The future nominal goal amount relative to the amount entered today.'}</p></article><article><span>Current-plan funding</span><strong>${pct(r.funding)}</strong><p>Based on existing savings plus the current ${phrase} before any increase.</p></article><article><span>Funding gap</span><strong>${compact(r.gap)}</strong><p>Difference between the modelled goal and current-plan value at the selected date.</p></article><article><span>Additional ${noun} required</span><strong>${contributionText(r.additionalContribution,key)}</strong><p>Extra starting contribution at the selected frequency indicated under the selected return, annual increase and goal assumptions.</p></article>`;
    }else{
      $('insightGrid').innerHTML=`<article><span>Target corpus</span><strong>${compact(r.target)}</strong><p>The future nominal amount you want the portfolio to reach.</p></article><article><span>Estimated time</span><strong>${formatDuration(r.months,r.reached)}</strong><p>Modelled time under the entered ${noun}, annual increase and constant return assumption.</p></article><article><span>Total invested by then</span><strong>${compact(r.totalInvested)}</strong><p>Existing investment plus modelled contributions through the target date.</p></article><article><span>Time saved by step-up</span><strong>${r.fixedReached?formatDuration(r.timeSavedMonths,true):'Not reached with fixed contribution'}</strong><p>Difference versus keeping the starting contribution at the selected frequency fixed.</p></article>`;
    }
  }

  function scenarioAges(years){ const a=Math.max(1,years-5),c=years,b=Math.min(50,years+5); return [...new Set([a,c,b])]; }
  function renderScenarios(r){
    const key=r.state.contributionFrequency,display=frequencyDisplayName(key),noun=contributionNoun(),phrase=frequencyNounPhrase(key,noun);
    if(mode==='target'){
      $('scenarioTitle').textContent=`Compare contribution amounts (${frequencyLabel(key)})`; $('scenarioNote').textContent='Same target, return and annual-increase assumptions; only the starting contribution changes.';
      const bases=[Math.max(0,r.state.monthlySIP*.8),r.state.monthlySIP,r.state.monthlySIP*1.2];
      $('scenarioGrid').innerHTML=bases.map((b,i)=>{const t=Core.timeToTarget(r.state,b,r.state.annualStepUp*100);const current=i===1;return `<article class="scenario ${current?'current':''}"><div class="tag">${current?`Current ${noun}`:`Alternative ${noun}`}</div><strong class="big">${contributionText(b,key)}</strong><p class="sub">Estimated time to ${compact(r.target)}.</p><dl><div><dt>Time to target</dt><dd>${formatDuration(t.months,t.reached)}</dd></div><div><dt>Total invested</dt><dd>${compact(t.totalInvested)}</dd></div><div><dt>Estimated growth</dt><dd>${compact(t.growth)}</dd></div></dl></article>`;}).join('');
      return;
    }
    const yrs=scenarioAges(r.state.years); $('scenarioTitle').textContent=mode==='growth'?'Compare investment periods':'Compare goal dates'; $('scenarioNote').textContent=mode==='growth'?`Same ${noun}, return and annual-increase assumptions; only the time horizon changes.`:`Same goal, return, inflation and ${noun} assumptions; only the goal date changes.`;
    $('scenarioGrid').innerHTML=yrs.map(y=>{const current=Math.abs(y-r.state.years)<.001; if(mode==='growth'){const p=Core.project(r.state,y);return `<article class="scenario ${current?'current':''}"><div class="tag">${current?'Selected period':'Alternative period'}</div><strong class="big">${y} years</strong><p class="sub">Future value under the same ${noun} assumptions.</p><dl><div><dt>Projected value</dt><dd>${compact(p.portfolio)}</dd></div><div><dt>Total invested</dt><dd>${compact(p.totalInvested)}</dd></div><div><dt>Estimated growth</dt><dd>${compact(p.growth)}</dd></div></dl></article>`;} const target=Core.goalAtYears(r.state,y),p=Core.project(r.state,y),req=Core.requiredContribution(r.state,y),fund=target>0?p.portfolio/target:1; return `<article class="scenario ${current?'current':''}"><div class="tag">${current?'Selected goal date':'Alternative goal date'}</div><strong class="big">${y} years</strong><p class="sub">Future-money values at that goal date.</p><dl><div><dt>Goal amount</dt><dd>${compact(target)}</dd></div><div><dt>Current plan</dt><dd>${compact(p.portfolio)}</dd></div><div><dt>${phrase.replace(/^./,c=>c.toUpperCase())} required</dt><dd>${contributionText(req,key)}</dd></div><div><dt>Projected funding</dt><dd>${pct(fund)}</dd></div></dl></article>`;}).join('');
  }

  function render(){
    updateFrequencyCopy();
    const r=Core.result(raw()); latestResult=r; updateSnapshot(r); renderSummary(r); renderCharts(r); renderJourney(r); renderInsights(r); renderScenarios(r);
    const noun=contributionNoun();
    $('visualTitle').textContent=mode==='growth'?`See how the ${noun} may build over time`:mode==='goal'?`See the goal and ${noun} path together`:`See how the current ${noun} may approach your target`;
  }

  function copySummary(){
    const r=Core.result(raw()),key=r.state.contributionFrequency,display=frequencyDisplayName(key),noun=contributionNoun(),phrase=frequencyNounPhrase(key,noun); let text=`Carrowmont ${isIndia()?'SIP':'Recurring Investment'} Calculator Summary

`;
    const contributionLine=`Current ${phrase}: ${contributionText(r.state.monthlySIP,key)}
Contribution frequency: ${frequencyLabel(key)}
`;
    if(mode==='growth') text+=`${contributionLine}Investment period: ${r.state.years} years
Expected return: ${(r.state.annualReturn*100).toFixed(1)}% p.a.
Annual ${isIndia()?'SIP step-up':'contribution increase'}: ${(r.state.annualStepUp*100).toFixed(1)}%

Estimated future value: ${money(r.projection.portfolio)}
Total amount invested: ${money(r.projection.totalInvested)}
Estimated investment growth: ${money(r.projection.growth)}
`;
    else if(mode==='goal') text+=`${r.state.goalBasis==='future'?`Future target amount: ${money(r.target)}`:`Goal amount today: ${money(r.state.goalToday)}
Inflation / price growth: ${(r.state.inflation*100).toFixed(1)}% p.a.`}
Goal date: ${r.state.years} years
Expected return: ${(r.state.annualReturn*100).toFixed(1)}% p.a.
${contributionLine}
Future goal amount: ${money(r.target)}
Projected current plan: ${money(r.current.portfolio)}
Projected funding: ${pct(r.funding)}
Total ${phrase} required: ${contributionText(r.requiredContribution,key)}
Additional ${phrase} required: ${contributionText(r.additionalContribution,key)}
`;
    else text+=`Target corpus: ${money(r.target)}
${contributionLine}Expected return: ${(r.state.annualReturn*100).toFixed(1)}% p.a.
Annual ${isIndia()?'SIP step-up':'contribution increase'}: ${(r.state.annualStepUp*100).toFixed(1)}%

Estimated time to target: ${formatDuration(r.months,r.reached)}
Total money invested by then: ${money(r.totalInvested)}
Estimated investment growth: ${money(r.growth)}
`;
    text+='\nEducational illustration only. Returns are not guaranteed.';
    if(window.CarrowmontInvestmentTerminology) text=window.CarrowmontInvestmentTerminology.text(text);
    navigator.clipboard?.writeText(text).then(()=>{const b=$('copyBtn'),old=b.textContent;b.textContent='✓ Summary Copied';setTimeout(()=>b.textContent=old,1800);});
  }


  async function createReport(){
    const b=$('reportBtn'),status=document.getElementById('reportDownloadStatus');
    if(!window.CarrowmontSIPPdfRenderer||!window.CarrowmontPdfExport||!latestResult){
      if(status)status.textContent='The report could not be generated. Please refresh the page and try again.';
      return;
    }
    b.disabled=true;b.setAttribute('aria-busy','true');
    if(status)status.textContent='Preparing your report...';
    try{
      const canvases=await window.CarrowmontSIPPdfRenderer.render(latestResult,mode);
      const now=new Date(),pad=n=>String(n).padStart(2,'0');
      const reportStem=window.CarrowmontInvestmentTerminology?.isIndia()?'sip-report':'recurring-investment-report';
      const filename=`${reportStem}-${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}.pdf`;
      await window.CarrowmontPdfExport.downloadCanvases(canvases,{filename,quality:.97});
      if(status)status.textContent='Report has been downloaded.';
    }catch(err){
      console.error(err);
      if(status)status.textContent='The report could not be generated. Please refresh the page and try again.';
    }finally{
      b.disabled=false;b.removeAttribute('aria-busy');
    }
  }

  function bind(){
    $$('.mode-tab').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
    ['currentSavings','monthlySIP','years','annualReturn','annualStepUp','goalToday','goalFuture','targetAmount','inflation'].forEach(id=>$(id).addEventListener('input',render));
    $('contributionFrequency').addEventListener('change',()=>{frequencyUserOverride=true;updateFrequencyCopy();render();});
    $('goalBasis').addEventListener('change',()=>{syncGoalBasis();render();});
    $('resetBtn').addEventListener('click',reset); $('copyBtn').addEventListener('click',copySummary); $('reportBtn').addEventListener('click',createReport);
  }

  setupLocale(); bind(); setMode('growth');
})();
