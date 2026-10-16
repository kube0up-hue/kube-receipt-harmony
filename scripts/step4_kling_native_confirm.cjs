const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const code = `
    (() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Confirm');
      if (!confirmBtn) return { error: 'NOT_FOUND' };
      const r = confirmBtn.getBoundingClientRect();
      return {
        disabled: confirmBtn.disabled,
        class: confirmBtn.className,
        x: r.left + r.width / 2,
        y: r.top + r.height / 2
      };
    })()
  `;

  const res = await evalInTab('05D465727C3A466BCAD5271AA0327456', code);
  console.log('Confirm btn details:', res);

  if (res && res.x) {
    await clickAt('05D465727C3A466BCAD5271AA0327456', Math.round(res.x), Math.round(res.y));
    console.log('Clicked Confirm natively!');
  }

  // Wait 4 seconds for API creation
  await new Promise(r => setTimeout(r, 4500));

  const checkAfter = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.querySelector('.semi-modal-content');
      const table = document.querySelector('table');
      return {
        hasDialog: !!dialog,
        dialogText: dialog ? dialog.innerText : null,
        tableText: table ? table.innerText : document.body.innerText.slice(0, 1000)
      };
    })()
  `;

  const state = await evalInTab('05D465727C3A466BCAD5271AA0327456', checkAfter);
  console.log('State after Confirm:', JSON.stringify(state, null, 2));
}

main().catch(console.error);
