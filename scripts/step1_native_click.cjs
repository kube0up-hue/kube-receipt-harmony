const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  console.log('Finding trigger rect...');
  const getTriggerRect = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return null;
      const trigger = dialog.querySelector('.api-key-entity-select [role="button"]') ||
                      Array.from(dialog.querySelectorAll('span, button')).find(el => el.innerText && el.innerText.includes('Select project'));
      if (!trigger) return null;
      const r = trigger.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, width: r.width, height: r.height };
    })()
  `;

  const triggerCoord = await evalInTab('organization/api-keys', getTriggerRect);
  console.log('Trigger coord:', triggerCoord);

  if (triggerCoord) {
    await clickAt('organization/api-keys', Math.round(triggerCoord.x), Math.round(triggerCoord.y));
    console.log('Clicked trigger with native mouse event!');
  }

  await new Promise(r => setTimeout(r, 600));

  // Find option rect
  const getOptionRect = `
    (() => {
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      const mansah = options.find(o => o.innerText.includes('المنصة')) || options[0];
      if (!mansah) return null;
      const r = mansah.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: mansah.innerText };
    })()
  `;

  const optionCoord = await evalInTab('organization/api-keys', getOptionRect);
  console.log('Option coord:', optionCoord);

  if (optionCoord) {
    await clickAt('organization/api-keys', Math.round(optionCoord.x), Math.round(optionCoord.y));
    console.log('Clicked option with native mouse event!');
  }

  await new Promise(r => setTimeout(r, 600));

  // Now fill name and submit
  const finishCode = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return { error: 'NO_DIALOG' };

      const nameInput = dialog.querySelector('input[placeholder="My Test Key"]');
      if (nameInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(nameInput, 'KUBE-AI-Marketing');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const submitBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.trim() === 'Create secret key');
      if (!submitBtn) return { error: 'NO_SUBMIT' };
      
      const r = submitBtn.getBoundingClientRect();
      return {
        submitCoord: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
        dialogText: dialog.innerText
      };
    })()
  `;

  const finishRes = await evalInTab('organization/api-keys', finishCode);
  console.log('Finish Res:', finishRes);

  if (finishRes && finishRes.submitCoord) {
    await clickAt('organization/api-keys', Math.round(finishRes.submitCoord.x), Math.round(finishRes.submitCoord.y));
    console.log('Clicked submit button natively!');
  }

  await new Promise(r => setTimeout(r, 3500));

  // Read key
  const readKey = `
    (() => {
      const text = document.body.innerText;
      const m = text.match(/sk-proj-[A-Za-z0-9_-]+/i) || text.match(/sk-[A-Za-z0-9_-]{20,}/i);
      const inputs = Array.from(document.querySelectorAll('input')).map(i => i.value).filter(v => v.startsWith('sk-'));
      return { key: m ? m[0] : null, inputs, dialogText: (document.querySelector('[role="dialog"]') || document.body).innerText.slice(0, 800) };
    })()
  `;

  const finalKey = await evalInTab('organization/api-keys', readKey);
  console.log('Final Key Result:', JSON.stringify(finalKey, null, 2));
}

main().catch(console.error);
