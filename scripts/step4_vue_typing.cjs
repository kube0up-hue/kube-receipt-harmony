const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const code = `
    (() => {
      const input = document.querySelector('input[placeholder="Enter the API name"]');
      if (!input) return { error: 'INPUT_NOT_FOUND' };

      input.focus();
      input.select();
      document.execCommand('insertText', false, 'KUBE-AI-Marketing');

      return {
        val: input.value,
        counter: (document.querySelector('.semi-input-suffix') || document.body).innerText.slice(0, 100)
      };
    })()
  `;

  const res = await evalInTab('05D465727C3A466BCAD5271AA0327456', code);
  console.log('Typing result:', res);

  await new Promise(r => setTimeout(r, 600));

  // Find Confirm button coord
  const getBtn = `
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Confirm');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    })()
  `;

  const btnCoord = await evalInTab('05D465727C3A466BCAD5271AA0327456', getBtn);
  console.log('Confirm btn coord:', btnCoord);

  if (btnCoord) {
    await clickAt('05D465727C3A466BCAD5271AA0327456', Math.round(btnCoord.x), Math.round(btnCoord.y));
    console.log('Clicked Confirm with mouse!');
  }

  // Wait 4 seconds for modal to show generated AccessKey & SecretKey
  await new Promise(r => setTimeout(r, 4500));

  const checkResult = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.querySelector('.semi-modal-content');
      const table = document.querySelector('table');
      return {
        hasDialog: !!dialog,
        dialogText: dialog ? dialog.innerText : null,
        tableText: table ? table.innerText : document.body.innerText.slice(0, 1500),
        inputs: Array.from(document.querySelectorAll('input')).map(i => i.value).filter(Boolean)
      };
    })()
  `;

  const afterResult = await evalInTab('05D465727C3A466BCAD5271AA0327456', checkResult);
  console.log('Final Result:', JSON.stringify(afterResult, null, 2));
}

main().catch(console.error);
