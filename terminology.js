(() => {
  'use strict';

  const Locale = window.CarrowmontLocale;
  const isIndia = () => Locale && Locale.getRegion() === 'IN';

  const replacements = [
    ['Carrowmont SIP Calculator Summary', 'Carrowmont Monthly Investment Calculator Summary'],
    ['Carrowmont SIP Calculator', 'Carrowmont Monthly Investment Calculator'],
    ['SIP Calculator | Carrowmont', 'Monthly Investment Calculator | Carrowmont'],
    ['SIP Calculator', 'Monthly Investment Calculator'],
    ['SIP Planning Report', 'Monthly Investment Planning Report'],
    ['Generate SIP Report', 'Generate Investment Report'],
    ['SIP & MONTHLY INVESTING', 'MONTHLY INVESTING & GROWTH'],
    ['SIP &amp; MONTHLY INVESTING', 'MONTHLY INVESTING &amp; GROWTH'],
    ['See how a monthly SIP may grow or what SIP may be required for a goal.', 'See how monthly investments may grow or what monthly investment may be required for a goal.'],
    ['SIP future value', 'Investment future value'],
    ['SIP required for a goal', 'Monthly investment required for a goal'],
    ['Goal SIP snapshot', 'Goal investment snapshot'],
    ['Goal SIP', 'Goal investment'],
    ['SIP growth snapshot', 'Investment growth snapshot'],
    ['SIP growth visuals', 'Investment growth visuals'],
    ['SIP growth', 'investment growth'],
    ['YOUR SIP PROJECTION', 'YOUR INVESTMENT PROJECTION'],
    ['YEAR-BY-YEAR SIP JOURNEY', 'YEAR-BY-YEAR INVESTMENT JOURNEY'],
    ['Year-by-year SIP journey', 'Year-by-year investment journey'],
    ['Monthly SIP required:', 'Monthly investment required:'],
    ['Monthly SIP required', 'Monthly investment required'],
    ['Total monthly SIP required from now', 'Total monthly investment required from now'],
    ['Total monthly SIP required', 'Total monthly investment required'],
    ['Additional monthly SIP required', 'Additional monthly investment required'],
    ['Current monthly SIP', 'Current monthly investment'],
    ['Monthly SIP in that year', 'Monthly investment in that year'],
    ['Monthly SIP', 'Monthly investment'],
    ['monthly SIP required', 'monthly investment required'],
    ['monthly SIP', 'monthly investment'],
    ['Annual increase in monthly investment', 'Annual increase in monthly investment'],
    ['Annual SIP step-up', 'Annual contribution increase'],
    ['annual SIP step-up', 'annual contribution increase'],
    ['SIP step-up', 'contribution increase'],
    ['STEP-UP SIP PROJECTED VALUE', 'INCREASING-CONTRIBUTION PROJECTED VALUE'],
    ['Step-up SIP projected value', 'Increasing-contribution projected value'],
    ['Step-up SIP vs fixed SIP', 'Increasing contributions vs fixed contributions'],
    ['step-up SIP with fixed SIP', 'increasing contributions with fixed contributions'],
    ['step-up SIP', 'increasing contributions'],
    ['Step-up SIP', 'Increasing contributions'],
    ['FIXED SIP PROJECTED VALUE', 'FIXED-CONTRIBUTION PROJECTED VALUE'],
    ['Fixed SIP projected value', 'Fixed-contribution projected value'],
    ['Fixed-SIP value', 'Fixed-contribution value'],
    ['fixed-SIP path', 'fixed-contribution path'],
    ['fixed SIP', 'fixed monthly contribution'],
    ['Fixed SIP', 'Fixed monthly contribution'],
    ['SIP projection:', 'Investment projection:'],
    ['SIP projection', 'investment projection'],
    ['SIP assumptions', 'investment assumptions'],
    ['SIP contributions', 'monthly contributions'],
    ['SIP calculation', 'monthly investment calculation'],
    ['SIP journey', 'investment journey'],
    ['SIP path', 'investment path'],
    ['SIP target gap', 'Investment target gap'],
    ['SIP increase', 'contribution increase'],
    ['current SIP path', 'current investment path'],
    ['Current SIP path', 'Current investment path'],
    ['current SIP', 'current monthly investment'],
    ['Current SIP', 'Current monthly investment'],
    ['starting SIP', 'starting monthly investment'],
    ['required-SIP', 'required-investment'],
    ['Required-SIP', 'Required-investment'],
    ['Required SIP', 'Required monthly investment'],
    ['Alternative SIP', 'Alternative monthly investment'],
    ['the entered SIP', 'the entered monthly investment'],
    ['your SIP', 'your monthly investment'],
    ['Your SIP', 'Your monthly investment'],
    ['a SIP', 'a monthly investment plan'],
    ['A SIP', 'A monthly investment plan'],
    ['recurring SIP', 'recurring monthly investment'],
    ['SIP is a contribution method', 'Regular monthly investing is a contribution method'],
    ['SIP is a recurring investment method', 'Monthly investing is a recurring investment method'],
    ['SIP', 'investment']
  ];

  function text(value) {
    const input = String(value ?? '');
    if (isIndia()) return input;
    return replacements.reduce((out, [from, to]) => out.split(from).join(to), input);
  }

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let applying = false;

  function applyTextNode(node) {
    if (!originalText.has(node)) originalText.set(node, node.data);
    const source = originalText.get(node);
    const next = isIndia() ? source : text(source);
    if (node.data !== next) node.data = next;
  }

  function applyAttr(el, name) {
    if (!el.hasAttribute(name)) return;
    let attrs = originalAttrs.get(el);
    if (!attrs) { attrs = {}; originalAttrs.set(el, attrs); }
    if (!(name in attrs)) attrs[name] = el.getAttribute(name);
    const source = attrs[name];
    const next = isIndia() ? source : text(source);
    if (el.getAttribute(name) !== next) el.setAttribute(name, next);
  }

  const originalTitle = document.title;
  const metaOriginals = new Map();

  function applyHead() {
    document.title = isIndia() ? originalTitle : text(originalTitle);
    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(meta => {
      if (!metaOriginals.has(meta)) metaOriginals.set(meta, meta.getAttribute('content') || '');
      const source = metaOriginals.get(meta);
      meta.setAttribute('content', isIndia() ? source : text(source));
    });
  }

  function applyAll(root = document.body) {
    if (!root || applying) return;
    applying = true;
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) applyTextNode(node);
      root.querySelectorAll?.('[aria-label], [title]').forEach(el => {
        applyAttr(el, 'aria-label');
        applyAttr(el, 'title');
      });
      applyHead();
    } finally {
      applying = false;
    }
  }

  function observe() {
    const observer = new MutationObserver(mutations => {
      if (applying) return;
      applying = true;
      try {
        for (const mutation of mutations) {
          if (mutation.type === 'characterData') {
            const node = mutation.target;
            if (!originalText.has(node)) originalText.set(node, node.data);
            const source = originalText.get(node);
            const next = isIndia() ? source : text(source);
            if (node.data !== next) node.data = next;
          }
          mutation.addedNodes.forEach(added => {
            if (added.nodeType === Node.TEXT_NODE) {
              if (!originalText.has(added)) originalText.set(added, added.data);
              const source = originalText.get(added);
              const next = isIndia() ? source : text(source);
              if (added.data !== next) added.data = next;
            } else if (added.nodeType === Node.ELEMENT_NODE) {
              const walker = document.createTreeWalker(added, NodeFilter.SHOW_TEXT);
              let node;
              while ((node = walker.nextNode())) {
                if (!originalText.has(node)) originalText.set(node, node.data);
                const source = originalText.get(node);
                const next = isIndia() ? source : text(source);
                if (node.data !== next) node.data = next;
              }
              added.querySelectorAll?.('[aria-label], [title]').forEach(el => {
                applyAttr(el, 'aria-label');
                applyAttr(el, 'title');
              });
            }
          });
        }
      } finally {
        applying = false;
      }
    });
    observer.observe(document.body, {subtree:true, childList:true, characterData:true});
  }

  window.CarrowmontInvestmentTerminology = { isIndia, text, apply: () => applyAll(document.body) };

  if (window.CarrowmontPdfExport) {
    const originalPdfText = window.CarrowmontPdfExport.text;
    const originalPdfWrappedText = window.CarrowmontPdfExport.wrappedText;
    window.CarrowmontPdfExport.text = (ctx, value, x, y, opt) => originalPdfText(ctx, text(value), x, y, opt);
    window.CarrowmontPdfExport.wrappedText = (ctx, value, x, y, maxWidth, opt) => originalPdfWrappedText(ctx, text(value), x, y, maxWidth, opt);
  }

  applyAll(document.body);
  observe();
  window.addEventListener('carrowmont:localechange', () => applyAll(document.body));
})();
