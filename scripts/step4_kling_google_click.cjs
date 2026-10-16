const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const code = `
    (() => {
      const allEls = Array.from(document.querySelectorAll('*'));
      const googleBtn = allEls.find(el => el.innerText && el.innerText.trim() === 'Continue with Google');
      if (!googleBtn) return { error: 'NOT_FOUND' };
      
      const target = googleBtn.closest('button, [role="button"], div[class*="btn"]') || googleBtn;
      const r = target.getBoundingClientRect();
      return {
        tag: target.tagName,
        text: target.innerText,
        x: r.left + r.width / 2,
        y: r.top + r.height / 2
      };
    })()
  `;

  const res = await evalInTab('kling.ai', code);
  console.log('Kling Google btn coord:', res);

  if (res && res.x) {
    await clickAt('kling.ai', Math.round(res.x), Math.round(res.y));
    console.log('Clicked Continue with Google on Kling AI!');
  }

  // Wait 4 seconds for Google OAuth popup or navigation
  await new Promise(r => setTimeout(r, 4500));

  const checkTabs = `
    (() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 500)
      };
    })()
  `;

  const pageState = await evalInTab('kling.ai', checkTabs);
  console.log('Kling page state:', JSON.stringify(pageState, null, 2));
}

main().catch(console.error);
