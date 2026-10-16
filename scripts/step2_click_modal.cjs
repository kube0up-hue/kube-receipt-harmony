const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (async () => {
      // 1. Hook copy event
      window.__capturedCopy = null;
      document.addEventListener('copy', (e) => {
        if (e.clipboardData) {
          window.__capturedCopy = e.clipboardData.getData('text');
        }
      }, true);

      // 2. Click the link with text ...ic0Q
      const link = Array.from(document.querySelectorAll('.key-string-link, button')).find(b => b.innerText.includes('...ic0Q'));
      if (link) {
        link.click();
      }

      await new Promise(r => setTimeout(r, 800));

      // Check dialog or modal
      const modal = document.querySelector('mat-dialog-container, [role="dialog"], .dialog, .modal');
      const text = modal ? modal.innerText : document.body.innerText;
      const keyMatch = text.match(/AIzaSy[A-Za-z0-9_-]{33}/);
      const inputs = Array.from((modal || document).querySelectorAll('input')).map(i => i.value).filter(v => v.startsWith('AIzaSy'));

      return {
        clickedLink: !!link,
        hasModal: !!modal,
        keyMatch: keyMatch ? keyMatch[0] : null,
        inputs,
        modalText: modal ? modal.innerText.slice(0, 500) : null,
        capturedCopy: window.__capturedCopy
      };
    })()
  `;

  const res = await evalInTab('aistudio.google.com', code);
  console.log('Result:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
