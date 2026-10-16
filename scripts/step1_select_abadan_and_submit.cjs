const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  console.log('Finding option أبدًا...');
  const getAbadanRect = `
    (() => {
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      const abadan = options.find(o => o.innerText.trim() === 'أبدًا');
      if (!abadan) return null;
      const r = abadan.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()
  `;

  const abadanCoord = await evalInTab('organization/api-keys', getAbadanRect);
  console.log('Abadan coord:', abadanCoord);

  if (abadanCoord) {
    await clickAt('organization/api-keys', Math.round(abadanCoord.x), Math.round(abadanCoord.y));
    console.log('Clicked أبدًا!');
  }

  await new Promise(r => setTimeout(r, 600));

  // Check if button is enabled
  const checkBtn = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { noDialog: true };
      const btn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create secret key');
      if (!btn) return { noBtn: true };
      const r = btn.getBoundingClientRect();
      return {
        disabled: btn.disabled,
        ariaDisabled: btn.getAttribute('aria-disabled'),
        x: r.left + r.width / 2,
        y: r.top + r.height / 2
      };
    })()
  `;

  const btnState = await evalInTab('organization/api-keys', checkBtn);
  console.log('Btn state after selecting أبدًا:', btnState);

  if (btnState && !btnState.disabled) {
    console.log('Button is enabled! Clicking submit...');
    await clickAt('organization/api-keys', Math.round(btnState.x), Math.round(btnState.y));
    console.log('Clicked submit!');
  }

  // Wait 4 seconds for API key creation and modal update
  await new Promise(r => setTimeout(r, 4000));

  const extractKey = `
    (() => {
      const text = document.body.innerText;
      const match = text.match(/sk-proj-[A-Za-z0-9_-]+/i) || text.match(/sk-[A-Za-z0-9_-]{20,}/i);
      const inputs = Array.from(document.querySelectorAll('input')).map(i => i.value).filter(v => v.startsWith('sk-'));
      const copyBtns = Array.from(document.querySelectorAll('[data-copy-text]')).map(b => b.getAttribute('data-copy-text'));
      return {
        match: match ? match[0] : null,
        inputs,
        copyBtns,
        dialogText: (document.querySelector('[role="dialog"]') || document.body).innerText.slice(0, 1000)
      };
    })()
  `;

  const keyResult = await evalInTab('organization/api-keys', extractKey);
  console.log('KEY RESULT:', JSON.stringify(keyResult, null, 2));
}

main().catch(console.error);
