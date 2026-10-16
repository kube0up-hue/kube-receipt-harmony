const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const tabId = 'A8DE9C36BA480CD0A4962F91292B2CA4';
  const code = `
    (() => {
      const all = Array.from(document.querySelectorAll('*'));
      const kubeEl = all.find(el => el.innerText && el.innerText.trim() === 'kube0up@gmail.com');
      if (!kubeEl) return { error: 'NOT_FOUND' };
      
      const target = kubeEl.closest('div[data-identifier], [role="link"], li, [tabindex="0"]') || kubeEl.parentElement;
      const r = target.getBoundingClientRect();
      return {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        text: target.innerText
      };
    })()
  `;

  const res = await evalInTab(tabId, code);
  console.log('Account in popup:', res);

  if (res && res.x) {
    await clickAt(tabId, Math.round(res.x), Math.round(res.y));
    console.log('Clicked kube0up account inside popup!');
  }

  // Wait 4 seconds for popup to finish OAuth
  await new Promise(r => setTimeout(r, 4500));

  const checkDev = `
    (() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 1000),
        buttons: Array.from(document.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(Boolean).slice(-15)
      };
    })()
  `;

  const devRes = await evalInTab('2BA529AAB847361F8F6E06561A3600DF', checkDev);
  console.log('Kling Dev state:', JSON.stringify(devRes, null, 2));
}

main().catch(console.error);
