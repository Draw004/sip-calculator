(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.CarrowmontSIPCore=api;
})(typeof self!=='undefined'?self:this,function(){
  'use strict';

  const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number.isFinite(Number(v))?Number(v):a));
  const FREQUENCY_PERIODS=Object.freeze({
    weekly:52,
    biweekly:26,
    semimonthly:24,
    fourweekly:13,
    monthly:12
  });
  const normalizeFrequency=value=>Object.prototype.hasOwnProperty.call(FREQUENCY_PERIODS,value)?value:'monthly';
  const periodsPerYear=frequency=>FREQUENCY_PERIODS[normalizeFrequency(frequency)];
  const periodicRate=(annual,frequency='monthly')=>{
    const periods=periodsPerYear(frequency);
    return annual===0?0:Math.pow(1+annual,1/periods)-1;
  };
  const monthlyRate=annual=>periodicRate(annual,'monthly');

  function normalize(raw={}){
    if(raw && raw._normalized) return raw;
    return {
      _normalized:true,
      mode:['growth','goal','target'].includes(raw.mode)?raw.mode:'growth',
      years:clamp(raw.years,1,50),
      currentSavings:Math.max(0,Number(raw.currentSavings)||0),
      monthlySIP:Math.max(0,Number(raw.monthlySIP)||0),
      contributionFrequency:normalizeFrequency(raw.contributionFrequency),
      annualReturn:clamp(raw.annualReturn,0,30)/100,
      annualStepUp:clamp(raw.annualStepUp,0,100)/100,
      goalToday:Math.max(0,Number(raw.goalToday)||0),
      goalBasis:raw.goalBasis==='future'?'future':'today',
      goalFuture:Math.max(0,Number(raw.goalFuture)||0),
      targetAmount:Math.max(0,Number(raw.targetAmount)||0),
      inflation:clamp(raw.inflation,0,25)/100
    };
  }

  function contributionForPeriod(base,step,periodIndex,periodCount=12){
    const yearIndex=Math.floor(Math.max(0,periodIndex-1)/Math.max(1,periodCount));
    return base*Math.pow(1+step,yearIndex);
  }

  function contributionForMonth(base,step,monthIndex){
    return contributionForPeriod(base,step,monthIndex,12);
  }

  function project(raw,yearsOverride,baseOverride,stepOverride){
    const s=normalize(raw);
    const years=Number.isFinite(Number(yearsOverride))?clamp(yearsOverride,0,50):s.years;
    const base=Number.isFinite(Number(baseOverride))?Math.max(0,Number(baseOverride)):s.monthlySIP;
    const step=Number.isFinite(Number(stepOverride))?clamp(stepOverride,0,100)/100:s.annualStepUp;
    const periodCount=periodsPerYear(s.contributionFrequency);
    const periods=Math.max(0,Math.round(years*periodCount));
    const months=Math.max(0,Math.round(years*12));
    const rp=periodicRate(s.annualReturn,s.contributionFrequency);
    let portfolio=s.currentSavings;
    let contributions=0;
    for(let p=1;p<=periods;p++){
      portfolio*=1+rp;
      const c=contributionForPeriod(base,step,p,periodCount);
      portfolio+=c;
      contributions+=c;
    }
    const totalInvested=s.currentSavings+contributions;
    const rawGrowth=portfolio-totalInvested;
    return {
      years,months,periods,periodsPerYear:periodCount,portfolio,contributions,totalInvested,
      growth:Math.abs(rawGrowth)<1e-6?0:Math.max(0,rawGrowth),
      existingGrowth:Math.max(0,s.currentSavings*Math.pow(1+rp,periods)-s.currentSavings)
    };
  }

  function goalAtYears(raw,yearsOverride){
    const s=normalize(raw);
    const years=Number.isFinite(Number(yearsOverride))?clamp(yearsOverride,0,50):s.years;
    return s.goalBasis==='future'?s.goalFuture:s.goalToday*Math.pow(1+s.inflation,years);
  }

  function requiredContribution(raw,yearsOverride){
    const s=normalize(raw);
    const years=Number.isFinite(Number(yearsOverride))?clamp(yearsOverride,1,50):s.years;
    const target=goalAtYears(s,years);
    if(target<=0) return 0;
    if(project(s,years,0).portfolio>=target) return 0;
    const periodCount=periodsPerYear(s.contributionFrequency);
    let lo=0,hi=Math.max(1,target/(years*periodCount));
    let guard=0;
    while(project(s,years,hi).portfolio<target&&guard<90){hi*=2;guard++;}
    for(let i=0;i<100;i++){
      const mid=(lo+hi)/2;
      if(project(s,years,mid).portfolio>=target) hi=mid; else lo=mid;
    }
    return hi;
  }

  // Kept as an API alias so existing callers/tests do not break while the UI
  // generalises from monthly contributions to selectable contribution periods.
  const requiredMonthly=requiredContribution;

  function goalResult(raw){
    const s=normalize({...raw,mode:'goal'});
    const target=goalAtYears(s);
    const current=project(s);
    const required=requiredContribution(s);
    const requiredPlan=project(s,s.years,required);
    const additional=Math.max(0,required-s.monthlySIP);
    return {
      state:s,
      target,
      current,
      requiredContribution:required,
      additionalContribution:additional,
      requiredMonthly:required,
      additionalMonthly:additional,
      funding:target>0?current.portfolio/target:1,
      gap:Math.max(0,target-current.portfolio),
      surplus:Math.max(0,current.portfolio-target),
      requiredPlan
    };
  }

  function periodToMonths(periods,frequency){
    if(periods<=0) return 0;
    return Math.max(1,Math.round(periods*12/periodsPerYear(frequency)));
  }

  function timeToTarget(raw,baseOverride,stepOverride){
    const s=normalize({...raw,mode:'target'});
    const target=s.targetAmount;
    const base=Number.isFinite(Number(baseOverride))?Math.max(0,Number(baseOverride)):s.monthlySIP;
    const step=Number.isFinite(Number(stepOverride))?clamp(stepOverride,0,100)/100:s.annualStepUp;
    const periodCount=periodsPerYear(s.contributionFrequency);
    const rp=periodicRate(s.annualReturn,s.contributionFrequency);
    const maxPeriods=50*periodCount;
    let portfolio=s.currentSavings,contributions=0;
    if(target<=0) return {reached:false,periods:0,months:0,years:0,portfolio,totalInvested:s.currentSavings,growth:0,target};
    if(portfolio>=target) return {reached:true,periods:0,months:0,years:0,portfolio,totalInvested:s.currentSavings,growth:Math.max(0,portfolio-s.currentSavings),target};
    for(let p=1;p<=maxPeriods;p++){
      portfolio*=1+rp;
      const c=contributionForPeriod(base,step,p,periodCount);
      portfolio+=c; contributions+=c;
      if(portfolio>=target){
        const totalInvested=s.currentSavings+contributions;
        return {
          reached:true,
          periods:p,
          months:periodToMonths(p,s.contributionFrequency),
          years:p/periodCount,
          portfolio,
          totalInvested,
          growth:Math.max(0,portfolio-totalInvested),
          target
        };
      }
    }
    const totalInvested=s.currentSavings+contributions;
    return {
      reached:false,
      periods:maxPeriods,
      months:600,
      years:50,
      portfolio,
      totalInvested,
      growth:Math.max(0,portfolio-totalInvested),
      target
    };
  }

  function targetResult(raw){
    const s=normalize({...raw,mode:'target'});
    const current=timeToTarget(s);
    const fixed=timeToTarget(s,s.monthlySIP,0);
    return {
      state:s,
      target:s.targetAmount,
      reached:current.reached,
      periods:current.periods,
      months:current.months,
      yearsToTarget:current.years,
      portfolio:current.portfolio,
      totalInvested:current.totalInvested,
      growth:current.growth,
      fixedReached:fixed.reached,
      fixedPeriods:fixed.periods,
      fixedMonths:fixed.months,
      fixedYearsToTarget:fixed.years,
      fixedPortfolio:fixed.portfolio,
      timeSavedMonths:current.reached&&fixed.reached?Math.max(0,fixed.months-current.months):0
    };
  }

  function growthResult(raw){
    const s=normalize({...raw,mode:'growth'});
    const projection=project(s);
    const fixedProjection=project(s,s.years,s.monthlySIP,0);
    return {state:s,projection,fixedProjection,stepUpBenefit:Math.max(0,projection.portfolio-fixedProjection.portfolio)};
  }

  function result(raw){
    const s=normalize(raw);
    return s.mode==='goal'?goalResult(s):s.mode==='target'?targetResult(s):growthResult(s);
  }

  function series(raw,yearsOverride,baseOverride,stepOverride){
    const s=normalize(raw);
    const years=Number.isFinite(Number(yearsOverride))?clamp(yearsOverride,1,50):s.years;
    const out=[];
    for(let y=0;y<=Math.floor(years);y++){
      const p=project(s,y,baseOverride,stepOverride);
      out.push({year:y,...p});
    }
    if(Math.abs(out[out.length-1].year-years)>.001){
      const p=project(s,years,baseOverride,stepOverride);
      out.push({year:years,...p});
    }
    return out;
  }

  function goalSeries(raw,yearsOverride){
    const s=normalize(raw);
    const years=Number.isFinite(Number(yearsOverride))?clamp(yearsOverride,1,50):s.years;
    const out=[];
    for(let y=0;y<=Math.floor(years);y++) out.push({year:y,goal:goalAtYears(s,y)});
    if(Math.abs(out[out.length-1].year-years)>.001) out.push({year:years,goal:goalAtYears(s,years)});
    return out;
  }

  function yearlyBreakdown(raw,yearsOverride){
    const s=normalize(raw);
    const years=Number.isFinite(Number(yearsOverride))?clamp(yearsOverride,1,50):s.years;
    const periodCount=periodsPerYear(s.contributionFrequency);
    const fullYears=Math.floor(years);
    const rows=[];
    let prevTotal=s.currentSavings;
    for(let y=1;y<=fullYears;y++){
      const p=project(s,y);
      const fixed=project(s,y,s.monthlySIP,0);
      const contribution=contributionForPeriod(s.monthlySIP,s.annualStepUp,(y-1)*periodCount+1,periodCount);
      const investedThisYear=Math.max(0,p.totalInvested-prevTotal);
      rows.push({
        year:y,
        contributionPerPeriod:contribution,
        monthlySIP:contribution,
        investedThisYear,
        totalInvested:p.totalInvested,
        projectedValue:p.portfolio,
        estimatedGrowth:p.growth,
        fixedProjectedValue:fixed.portfolio,
        stepUpDifference:p.portfolio-fixed.portfolio,
        goal:s.mode==='goal'?goalAtYears(s,y):s.mode==='target'?s.targetAmount:null,
        funding:(s.mode==='goal'&&goalAtYears(s,y)>0)?p.portfolio/goalAtYears(s,y):(s.mode==='target'&&s.targetAmount>0)?p.portfolio/s.targetAmount:null
      });
      prevTotal=p.totalInvested;
    }
    if(years>fullYears+1e-9){
      const p=project(s,years);
      const fixed=project(s,years,s.monthlySIP,0);
      const startPeriod=fullYears*periodCount+1;
      const contribution=contributionForPeriod(s.monthlySIP,s.annualStepUp,startPeriod,periodCount);
      const investedThisYear=Math.max(0,p.totalInvested-prevTotal);
      const goal=s.mode==='goal'?goalAtYears(s,years):s.mode==='target'?s.targetAmount:null;
      rows.push({
        year:years,
        contributionPerPeriod:contribution,
        monthlySIP:contribution,
        investedThisYear,
        totalInvested:p.totalInvested,
        projectedValue:p.portfolio,
        estimatedGrowth:p.growth,
        fixedProjectedValue:fixed.portfolio,
        stepUpDifference:p.portfolio-fixed.portfolio,
        goal,
        funding:goal>0?p.portfolio/goal:null
      });
    }
    return rows;
  }

  return {
    normalize,
    FREQUENCY_PERIODS,
    periodsPerYear,
    periodicRate,
    monthlyRate,
    contributionForPeriod,
    contributionForMonth,
    project,
    goalAtYears,
    requiredContribution,
    requiredMonthly,
    timeToTarget,
    targetResult,
    goalResult,
    growthResult,
    result,
    series,
    goalSeries,
    yearlyBreakdown
  };
});
