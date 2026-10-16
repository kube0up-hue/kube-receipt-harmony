const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  console.log('Selecting project المنصة and generating key...');
  const runCode = `
    (() => {
      // 1. Click option المنصة
      const options = Array.from(document.querySelectorAll('[role="option"]')).filter(el => el.innerText.trim() === 'المنصة');
      if (options.length === 0) return { error: 'OPTION_NOT_FOUND' };
      options[0].click();

      // 2. Fill name
      const dialog = document.querySelector('[role="dialog"]');
      const nameInput = dialog.querySelector('input[placeholder="My Test Key"]');
      if (nameInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(nameInput, 'KUBE-AI-Marketing');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 3. Click submit
      const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create secret key');
      if (!submitBtn) return { error: 'SUBMIT_BTN_NOT_FOUND' };
      submitBtn.click();

      return { submitted: true, name: nameInput ? nameInput.value : null };
    })()
  `;

  const runRes = await evalInTab('organization/api-keys', runCode);
  console.log('Run Result:', runRes);

  // Wait 3 seconds for key to be generated and shown
  await new Promise(r => setTimeout(r, 3000));

  const extractCode = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.body;
      const text = dialog.innerText;
      const keyMatch = text.match(/sk-proj-[A-Za-z0-9_-]+/i) || text.match(/sk-[A-Za-z0-9_-]{20,}/i);
      
      const inputs = Array.from(dialog.querySelectorAll('input')).map(i => i.value).filter(v => v.startsWith('sk-'));
      const codeEls = Array.from(dialog.querySelectorAll('code, pre, [data-copy-text]')).map(el => el.innerText.trim() || el.getAttribute('data-copy-text')).filter(Boolean);

      return {
        keyMatch: keyMatch ? keyMatch[0] : null,
        inputs,
        codeEls,
        dialogText: dialog.innerText.slice(0, 1500)
      };
    })()
  `;

  const extractRes = await evalInTab('organization/api-keys', extractCode);
  console.log('Extract Result:', JSON.stringify(extractRes, null, 2));
}

main().catch(console.error);
