const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const code = `
    (() => {
      // Click 'For myself'
      const forMyself = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === 'For myself');
      if (forMyself) {
        const target = forMyself.closest('button, [role="radio"], div[class*="card"]') || forMyself;
        target.click();
      }

      // Click 'Build with code'
      const buildWithCode = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === 'Build with code');
      if (buildWithCode) {
        const target = buildWithCode.closest('button, [role="checkbox"], div[class*="card"]') || buildWithCode;
        target.click();
      }

      // Click 'Model APIs'
      const modelApis = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === 'Model APIs');
      if (modelApis) {
        const target = modelApis.closest('button, [role="checkbox"], div[class*="card"]') || modelApis;
        target.click();
      }

      // Find continue button
      const continueBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Continue');
      if (continueBtn) {
        const r = continueBtn.getBoundingClientRect();
        return {
          hasBtn: true,
          disabled: continueBtn.disabled,
          x: r.left + r.width / 2,
          y: r.top + r.height / 2
        };
      }
      return { hasBtn: false };
    })()
  `;

  const res = await evalInTab('fal.ai', code);
  console.log('Onboarding selection result:', res);

  if (res && res.hasBtn) {
    await clickAt('fal.ai', Math.round(res.x), Math.round(res.y));
    console.log('Clicked Continue!');
  }

  // Wait 4 seconds for navigation to dashboard/keys
  await new Promise(r => setTimeout(r, 4500));

  const checkKeys = `
    (() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 1000),
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean)
      };
    })()
  `;

  const keysRes = await evalInTab('fal.ai', checkKeys);
  console.log('Fal.ai dashboard page:', JSON.stringify(keysRes, null, 2));
}

main().catch(console.error);
