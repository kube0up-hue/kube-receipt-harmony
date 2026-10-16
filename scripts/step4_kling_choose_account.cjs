const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const code = `
    (() => {
      const all = Array.from(document.querySelectorAll('*'));
      const kubeEl = all.find(el => el.innerText && el.innerText.trim() === 'kube0up@gmail.com');
      if (!kubeEl) return { error: 'NOT_FOUND', texts: all.filter(e => e.innerText && e.innerText.includes('kube')).map(e => e.innerText) };
      
      const target = kubeEl.closest('div[data-identifier], [role="link"], li, [tabindex="0"]') || kubeEl.parentElement;
      const r = target.getBoundingClientRect();
      return {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        text: target.innerText
      };
    })()
  `;

  const res = await evalInTab('client_id=135573464166', code);
  console.log('Account coord in Kling tab:', res);

  if (res && res.x) {
    await clickAt('client_id=135573464166', Math.round(res.x), Math.round(res.y));
    console.log('Clicked kube0up account for Kling AI!');
  }

  // Wait 4 seconds for redirect
  await new Promise(r => setTimeout(r, 4500));

  const checkState = `
    (() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 800)
      };
    })()
  `;

  const state = await evalInTab('2BA529AAB847361F8F6E06561A3600DF', checkState);
  console.log('Kling state after OAuth:', JSON.stringify(state, null, 2));
}

main().catch(console.error);
