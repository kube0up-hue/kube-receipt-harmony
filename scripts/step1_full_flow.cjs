const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (async () => {
      let dialog = document.querySelector('[role="dialog"]');
      if (!dialog) {
        const openBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create new secret key'));
        if (!openBtn) return { error: 'NO_CREATE_NEW_KEY_BUTTON' };
        openBtn.click();
        await new Promise(r => setTimeout(r, 600));
        dialog = document.querySelector('[role="dialog"]');
      }
      if (!dialog) return { error: 'NO_DIALOG_AFTER_CLICK' };

      // 1. Click project trigger
      const trigger = dialog.querySelector('.api-key-entity-select [role="button"]') || 
                      Array.from(dialog.querySelectorAll('span, button')).find(el => el.innerText && el.innerText.includes('Select project'));
      if (!trigger) return { error: 'TRIGGER_NOT_FOUND' };

      trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      trigger.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      trigger.click();

      // Wait 400ms for portal to mount options
      await new Promise(r => setTimeout(r, 500));

      // 2. Find option with text المنصة
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      const mansah = options.find(o => o.innerText.includes('المنصة')) || options[0];

      if (!mansah) {
        return { error: 'NO_MANSAH_OPTION', foundOptions: options.map(o => o.innerText) };
      }

      mansah.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      mansah.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      mansah.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      mansah.click();

      // Wait 300ms
      await new Promise(r => setTimeout(r, 300));

      // 3. Fill Key Name
      const nameInput = dialog.querySelector('input[placeholder="My Test Key"]');
      if (nameInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(nameInput, 'KUBE-AI-Marketing');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 4. Click Submit
      const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create secret key');
      if (!submitBtn) return { error: 'NO_SUBMIT_BTN' };
      
      submitBtn.click();

      return {
        success: true,
        selectedOption: mansah.innerText,
        name: nameInput ? nameInput.value : null
      };
    })()
  `;

  const res = await evalInTab('organization/api-keys', code);
  console.log('Result:', res);

  // Wait 4 seconds for generation
  await new Promise(r => setTimeout(r, 4000));

  const checkKey = `
    (() => {
      const text = document.body.innerText;
      const keyMatch = text.match(/sk-proj-[A-Za-z0-9_-]+/i) || text.match(/sk-[A-Za-z0-9_-]{20,}/i);
      const inputs = Array.from(document.querySelectorAll('input')).map(i => i.value).filter(v => v.startsWith('sk-'));
      return { keyMatch: keyMatch ? keyMatch[0] : null, inputs, snippet: text.slice(-600) };
    })()
  `;

  const keyRes = await evalInTab('organization/api-keys', checkKey);
  console.log('Key Check:', JSON.stringify(keyRes, null, 2));
}

main().catch(console.error);
