const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const continueBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.trim() === 'Continue');
      for (const btn of continueBtns) {
        btn.click();
      }
      return { clickedCount: continueBtns.length };
    })()
  `;

  const res = await evalInTab('fal.ai', code);
  console.log('Clicked continue:', res);

  // Wait 4 seconds for redirect
  await new Promise(r => setTimeout(r, 4500));

  const checkDashboard = `
    (() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 1000)
      };
    })()
  `;

  const dashRes = await evalInTab('fal.ai', checkDashboard);
  console.log('Destination page:', JSON.stringify(dashRes, null, 2));
}

main().catch(console.error);
