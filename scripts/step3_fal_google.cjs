const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const code = `
    (() => {
      const all = Array.from(document.querySelectorAll('*'));
      const kubeEl = all.find(el => el.innerText && el.innerText.trim() === 'kube0up@gmail.com');
      if (!kubeEl) return { error: 'NOT_FOUND', allTexts: all.map(e => e.innerText).filter(t => t && t.includes('kube')) };
      
      const target = kubeEl.closest('div[data-identifier], [role="link"], li, [tabindex="0"]') || kubeEl.parentElement;
      const r = target.getBoundingClientRect();
      return {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        text: target.innerText
      };
    })()
  `;

  const res = await evalInTab('accounts.google.com/v3/signin/accountchooser', code);
  console.log('Account coord:', res);

  if (res && res.x) {
    await clickAt('accounts.google.com/v3/signin/accountchooser', Math.round(res.x), Math.round(res.y));
    console.log('Clicked kube0up account!');
  }

  // Wait 4 seconds for OAuth redirect
  await new Promise(r => setTimeout(r, 4500));

  const checkFal = `
    (() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 800)
      };
    })()
  `;

  const falRes = await evalInTab('fal.ai', checkFal);
  console.log('Fal.ai page after OAuth:', JSON.stringify(falRes, null, 2));
}

main().catch(console.error);
