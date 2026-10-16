const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const getExpTrigger = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      
      const expSpan = Array.from(dialog.querySelectorAll('span')).find(s => s.innerText && s.innerText.includes('حدد تاريخ انتهاء الصلاحية'));
      if (!expSpan) return null;

      const trigger = expSpan.closest('[role="button"]') || expSpan.parentElement;
      const r = trigger.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()
  `;

  const coord = await evalInTab('organization/api-keys', getExpTrigger);
  console.log('Exp trigger coord:', coord);

  if (coord) {
    await clickAt('organization/api-keys', Math.round(coord.x), Math.round(coord.y));
    console.log('Clicked expiration trigger!');
  }

  await new Promise(r => setTimeout(r, 600));

  const listExpOptions = `
    (() => {
      const items = Array.from(document.querySelectorAll('[role="option"], [data-radix-collection-item]')).map(el => ({
        text: el.innerText.trim(),
        role: el.getAttribute('role')
      }));
      return items;
    })()
  `;

  const options = await evalInTab('organization/api-keys', listExpOptions);
  console.log('Expiration options:', JSON.stringify(options, null, 2));
}

main().catch(console.error);
