const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.querySelector('.semi-modal-content') || document.body;
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        placeholder: i.placeholder,
        type: i.type,
        name: i.name,
        value: i.value
      }));
      const buttons = Array.from(document.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(Boolean);

      return {
        url: window.location.href,
        text: dialog.innerText.slice(0, 1000),
        inputs,
        buttons: buttons.slice(-15)
      };
    })()
  `;

  const res = await evalInTab('kling.ai', code);
  console.log('Kling sign-in state:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
