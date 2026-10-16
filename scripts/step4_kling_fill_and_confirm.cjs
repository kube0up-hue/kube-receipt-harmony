const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const input = document.querySelector('input[placeholder="Enter the API name"]');
      if (!input) return { error: 'INPUT_NOT_FOUND' };

      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, 'KUBE-AI-Marketing');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Confirm');
      if (!confirmBtn) return { error: 'CONFIRM_BTN_NOT_FOUND' };

      confirmBtn.click();
      return { success: true, name: input.value };
    })()
  `;

  const submitRes = await evalInTab('05D465727C3A466BCAD5271AA0327456', code);
  console.log('Submit result:', submitRes);

  // Wait 3.5 seconds for key creation and display
  await new Promise(r => setTimeout(r, 4000));

  const extractCode = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.querySelector('.semi-modal-content') || document.body;
      const text = dialog.innerText;

      // Extract all inputs, code elements, text matches
      const inputs = Array.from(document.querySelectorAll('input')).map(i => i.value).filter(Boolean);
      const allText = document.body.innerText;

      return {
        inputs,
        dialogText: dialog.innerText.slice(0, 1500),
        tableText: (document.querySelector('table') || document.body).innerText.slice(0, 1500)
      };
    })()
  `;

  const keyDetails = await evalInTab('05D465727C3A466BCAD5271AA0327456', extractCode);
  console.log('Kling Key Details:', JSON.stringify(keyDetails, null, 2));
}

main().catch(console.error);
