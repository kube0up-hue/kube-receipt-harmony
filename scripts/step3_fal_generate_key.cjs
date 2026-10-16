const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const nameInput = document.querySelector('input[placeholder="Production inference"]');
      if (!nameInput) return { error: 'NAME_INPUT_NOT_FOUND' };

      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(nameInput, 'KUBE-AI-Marketing');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));

      const createBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.trim() === 'Create preset key' || b.innerText.trim() === 'Create key'
      );
      if (!createBtn) return { error: 'CREATE_BTN_NOT_FOUND' };

      createBtn.click();
      return { success: true, name: nameInput.value };
    })()
  `;

  const submitRes = await evalInTab('fal.ai/dashboard/keys', code);
  console.log('Submit Res:', submitRes);

  // Wait 3 seconds for key display modal
  await new Promise(r => setTimeout(r, 3500));

  const extractCode = `
    (() => {
      const dialog = document.querySelector('[role="dialog"]') || document.body;
      const text = dialog.innerText;
      
      // Fal keys typically look like a UUID or uuid:secret or long string
      const inputs = Array.from(dialog.querySelectorAll('input')).map(i => i.value).filter(Boolean);
      const codeBlocks = Array.from(dialog.querySelectorAll('code, pre')).map(el => el.innerText.trim()).filter(Boolean);

      return {
        inputs,
        codeBlocks,
        dialogText: dialog.innerText.slice(0, 1500)
      };
    })()
  `;

  const keyRes = await evalInTab('fal.ai/dashboard/keys', extractCode);
  console.log('Fal Key Result:', JSON.stringify(keyRes, null, 2));
}

main().catch(console.error);
