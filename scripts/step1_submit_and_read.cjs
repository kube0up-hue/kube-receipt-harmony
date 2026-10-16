const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const checkDialog = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { noDialog: true };
      
      const btn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create secret key');
      if (!btn) return { noBtn: true, buttons: Array.from(dialog.querySelectorAll('button')).map(b => b.innerText) };
      
      const r = btn.getBoundingClientRect();
      return {
        hasBtn: true,
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        dialogText: dialog.innerText
      };
    })()
  `;

  const res = await evalInTab('organization/api-keys', checkDialog);
  console.log('Dialog state:', res);

  if (res && res.hasBtn) {
    console.log(`Clicking Create secret key at (${res.x}, ${res.y})...`);
    await clickAt('organization/api-keys', Math.round(res.x), Math.round(res.y));
    console.log('Clicked!');
  }

  // Wait 4 seconds for OpenAI key to show
  await new Promise(r => setTimeout(r, 4000));

  const checkKey = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.body;
      const text = document.body.innerText;
      const m = text.match(/sk-proj-[A-Za-z0-9_-]+/i) || text.match(/sk-[A-Za-z0-9_-]{20,}/i);
      const inputs = Array.from(document.querySelectorAll('input')).map(i => i.value).filter(v => v.startsWith('sk-'));
      return {
        key: m ? m[0] : null,
        inputs,
        dialogText: dialog.innerText.slice(0, 800)
      };
    })()
  `;

  const finalRes = await evalInTab('organization/api-keys', checkKey);
  console.log('Final Result:', JSON.stringify(finalRes, null, 2));
}

main().catch(console.error);
