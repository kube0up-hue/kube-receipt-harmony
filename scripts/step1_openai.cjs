const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { error: 'NO_DIALOG' };
      
      const elements = Array.from(dialog.querySelectorAll('button, input, [role="combobox"]')).map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        type: el.type,
        placeholder: el.placeholder,
        text: el.innerText ? el.innerText.trim() : '',
        id: el.id
      }));

      return { elements };
    })()
  `;

  const res = await evalInTab('organization/api-keys', code);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
