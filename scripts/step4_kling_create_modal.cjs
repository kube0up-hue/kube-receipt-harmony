const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create a new API Key');
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()
  `;

  const res = await evalInTab('05D465727C3A466BCAD5271AA0327456', code);
  console.log('Create new key click:', res);

  // Wait 1.5 seconds for modal
  await new Promise(r => setTimeout(r, 1500));

  const checkModal = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.querySelector('.semi-modal-content') || document.body;
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        placeholder: i.placeholder,
        type: i.type,
        name: i.name,
        value: i.value
      }));
      const buttons = Array.from(dialog.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);

      return {
        text: dialog.innerText.slice(0, 1000),
        inputs,
        buttons
      };
    })()
  `;

  const modalRes = await evalInTab('05D465727C3A466BCAD5271AA0327456', checkModal);
  console.log('Modal after Create new key:', JSON.stringify(modalRes, null, 2));
}

main().catch(console.error);
