# Carrowmont SIP Calculator

Production release: **v1.0.0**

A country-aware SIP and recurring-investment planning tool for Carrowmont.

## Calculator modes

1. **SIP future value** - estimates how an existing investment and monthly SIP may grow over a selected period.
2. **SIP required for a goal** - works backwards from a future goal to estimate the starting monthly SIP required under the entered assumptions.
3. **Time to target** - estimates how long a target corpus may take under the entered SIP, return and annual step-up assumptions.

## Features

- Fixed SIP and annual step-up SIP modelling
- Existing invested amount / lump-sum support
- Goal amount entered either in today's money with inflation or directly as a future target
- Required-SIP and funding-gap calculations
- Time-to-target calculation
- Year-by-year SIP journey
- Step-up SIP vs fixed SIP comparison
- Country-aware currency formatting
- India-specific Lakh / Crore formatting only when India + INR is selected
- Copy Summary
- Direct **Generate SIP Report** PDF download
- PDF year-by-year appendix and comparison pages
- Transparent methodology and educational disclaimers

## Files

- `index.html` - page structure and metadata
- `styles.css` - layout, responsive design and chart/report UI styling
- `app.js` - UI state, chart rendering and calculator interactions
- `core.js` - calculation engine
- `locale.js` - country and currency formatting
- `pdf-export.js` - direct PDF export utility
- `sip-pdf-renderer.js` - SIP report renderer

## Calculation conventions

- Annual return is converted to an equivalent monthly compound rate.
- SIP contributions are added at month-end.
- Annual SIP step-up is applied once each year.
- Goal mode can either inflation-adjust a goal entered in today's money or use a future target amount directly.
- Required monthly SIP is solved numerically.
- Time-to-target is checked monthly for up to 50 years.

## Important

This is an educational planning tool. SIP is a contribution method, not a guaranteed-return product. Actual investment returns, taxes, fees, market volatility, product costs and financial outcomes may differ from the modelled assumptions.
