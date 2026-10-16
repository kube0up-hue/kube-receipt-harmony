const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { noDialog: true };
      
      const btn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create secret key');
      const form = dialog.querySelector('form');
      
      return {
        btnExists: !!btn,
        disabled: btn ? btn.disabled : null,
        ariaDisabled: btn ? btn.getAttribute('aria-disabled') : null,
        className: btn ? btn.className : null,
        type: btn ? btn.type : null,
        hasForm: !!form,
        formAction: form ? form.action : null
      };
    })()
  `;

  const res = await evalInTab('organization/api-keys', code);
  console.log('Button details:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
