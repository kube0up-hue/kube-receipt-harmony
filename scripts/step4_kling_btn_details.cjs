const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'API Console');
      if (!btn) return 'NO_BTN';
      
      // Let's inspect all attributes, parent elements and Vue/React internal props
      const r = btn.getBoundingClientRect();
      const keys = Object.keys(btn).filter(k => k.startsWith('__react') || k.startsWith('__vue') || k.startsWith('_'));

      return {
        outer: btn.outerHTML,
        rect: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
        keys
      };
    })()
  `;

  const res = await evalInTab('2BA529AAB847361F8F6E06561A3600DF', code);
  console.log('API Console button details:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
