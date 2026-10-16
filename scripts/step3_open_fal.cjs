const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const openBtn = Array.from(document.querySelectorAll('button, a')).find(b => b.innerText.trim() === 'Open fal');
      if (openBtn) {
        openBtn.click();
        return { clicked: true, text: openBtn.innerText };
      }
      return { clicked: false, buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText) };
    })()
  `;

  const res = await evalInTab('fal.ai', code);
  console.log('Open fal click result:', res);

  // Wait 4 seconds for redirect to /dashboard/keys
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

  const keysPage = await evalInTab('fal.ai', checkKeys);
  console.log('Keys page result:', JSON.stringify(keysPage, null, 2));
}

main().catch(console.error);
