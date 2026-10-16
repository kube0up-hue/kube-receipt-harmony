const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Add key');
      if (addBtn) {
        addBtn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()
  `;

  const clickRes = await evalInTab('fal.ai/dashboard/keys', code);
  console.log('Add key click:', clickRes);

  await new Promise(r => setTimeout(r, 1200));

  const checkModal = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.querySelector('.modal') || document.body;
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        placeholder: i.placeholder,
        name: i.name,
        type: i.type,
        value: i.value
      }));
      const buttons = Array.from(dialog.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
      return {
        dialogText: dialog.innerText.slice(0, 1000),
        inputs,
        buttons
      };
    })()
  `;

  const modalRes = await evalInTab('fal.ai/dashboard/keys', checkModal);
  console.log('Modal details:', JSON.stringify(modalRes, null, 2));
}

main().catch(console.error);
