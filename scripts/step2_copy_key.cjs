const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (async () => {
      // 1. Hook clipboard
      window.__copiedKey = null;
      const originalWriteText = navigator.clipboard.writeText;
      navigator.clipboard.writeText = async (text) => {
        window.__copiedKey = text;
        console.log('Intercepted copied key:', text);
        return Promise.resolve();
      };

      // 2. Find row containing 'kube'
      const rows = Array.from(document.querySelectorAll('tr, [role="row"], div')).filter(el => 
        el.innerText && el.innerText.includes('kube') && el.innerText.includes('content_copy')
      );
      const targetRow = rows[rows.length - 1] || rows[0];
      if (!targetRow) return { error: 'ROW_NOT_FOUND' };

      const copyBtn = Array.from(targetRow.querySelectorAll('button')).find(b => 
        (b.getAttribute('aria-label') && b.getAttribute('aria-label').toLowerCase().includes('copy')) ||
        (b.innerText && b.innerText.includes('content_copy'))
      );

      if (!copyBtn) return { error: 'COPY_BTN_NOT_FOUND' };

      copyBtn.click();
      await new Promise(r => setTimeout(r, 600));

      return {
        clicked: true,
        capturedKey: window.__copiedKey
      };
    })()
  `;

  const res = await evalInTab('aistudio.google.com', code);
  console.log('Clipboard intercept result:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
