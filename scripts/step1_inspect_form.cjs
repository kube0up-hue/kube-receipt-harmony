const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { noDialog: true };
      
      const expInput = dialog.querySelector('#project-key-expiration');
      const allLabels = Array.from(dialog.querySelectorAll('label, .form-label')).map(l => l.innerText.trim());
      const allInputs = Array.from(dialog.querySelectorAll('input')).map(i => ({
        id: i.id,
        placeholder: i.placeholder,
        value: i.value,
        required: i.required,
        ariaRequired: i.getAttribute('aria-required')
      }));

      // Find any elements containing 'تاريخ' or 'انتهاء' or 'Expiration'
      const expElements = Array.from(dialog.querySelectorAll('*')).filter(el => 
        (el.innerText && (el.innerText.includes('انتهاء') || el.innerText.includes('Expiration'))) && el.children.length === 0
      ).map(el => ({ tag: el.tagName, text: el.innerText, parentTag: el.parentElement.tagName, parentClass: el.parentElement.className }));

      return {
        allLabels,
        allInputs,
        expElements
      };
    })()
  `;

  const res = await evalInTab('organization/api-keys', code);
  console.log('Form details:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
