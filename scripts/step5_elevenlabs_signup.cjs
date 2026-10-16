const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const emailInput = document.querySelector('input[type="email"], input[name="email"]');
      const passInput = document.querySelector('input[type="password"], input[name="password"]');

      if (!emailInput || !passInput) return { error: 'INPUTS_NOT_FOUND' };

      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      
      nativeSetter.call(emailInput, 'kube0up@gmail.com');
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));

      nativeSetter.call(passInput, 'Qweasd123456781@');
      passInput.dispatchEvent(new Event('input', { bubbles: true }));
      passInput.dispatchEvent(new Event('change', { bubbles: true }));

      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Sign up');
      if (!submitBtn) return { error: 'BTN_NOT_FOUND' };

      submitBtn.click();
      return { success: true, email: emailInput.value };
    })()
  `;

  const res = await evalInTab('BCFCE17C8735423E64308EDBFF0EAC4C', code);
  console.log('Fill & submit result:', res);

  // Wait 4 seconds for response or captcha
  await new Promise(r => setTimeout(r, 4500));

  const checkState = `
    (() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 1000)
      };
    })()
  `;

  const afterState = await evalInTab('BCFCE17C8735423E64308EDBFF0EAC4C', checkState);
  console.log('After submit state:', JSON.stringify(afterState, null, 2));
}

main().catch(console.error);
