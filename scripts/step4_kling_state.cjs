const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
        src: f.src,
        id: f.id,
        class: f.className,
        rect: f.getBoundingClientRect()
      }));

      const allModals = Array.from(document.querySelectorAll('[class*="modal"], [class*="dialog"], [class*="login"], [class*="popup"]')).map(m => ({
        class: m.className,
        text: m.innerText ? m.innerText.slice(0, 300) : ''
      })).filter(m => m.text.length > 0);

      const navText = (document.querySelector('header') || document.body).innerText.slice(0, 500);

      return {
        iframes,
        allModals,
        navText
      };
    })()
  `;

  const res = await evalInTab('kling.ai', code);
  console.log('Kling state:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
