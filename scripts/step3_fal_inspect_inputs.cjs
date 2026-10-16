const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      // Find all clickable cards
      const cards = Array.from(document.querySelectorAll('*')).filter(el => 
        el.innerText && (el.innerText.includes('For myself') || el.innerText.includes('Build with code') || el.innerText.includes('Model APIs'))
      ).map(el => ({
        tag: el.tagName,
        text: el.innerText.slice(0, 50),
        role: el.getAttribute('role'),
        class: el.className
      }));

      // Find all buttons with role=radio or role=checkbox
      const inputs = Array.from(document.querySelectorAll('[role="radio"], [role="checkbox"], input[type="radio"], input[type="checkbox"]')).map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        ariaChecked: el.getAttribute('aria-checked'),
        dataState: el.getAttribute('data-state'),
        rect: el.getBoundingClientRect()
      }));

      // Find visible continue button
      const continueBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Continue').map(b => ({
        disabled: b.disabled,
        rect: b.getBoundingClientRect()
      }));

      return { inputs, continueBtns };
    })()
  `;

  const res = await evalInTab('fal.ai', code);
  console.log('Cards & Inputs:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
