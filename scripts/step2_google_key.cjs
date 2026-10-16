const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      // Find the row containing 'kube'
      const rows = Array.from(document.querySelectorAll('tr, [role="row"], .table-row, div')).filter(el => 
        el.innerText && el.innerText.includes('kube') && el.innerText.includes('content_copy')
      );
      
      const targetRow = rows[rows.length - 1] || rows[0];
      if (!targetRow) return { error: 'ROW_NOT_FOUND' };

      const buttons = Array.from(targetRow.querySelectorAll('button, [role="button"]')).map(b => ({
        text: b.innerText.trim(),
        ariaLabel: b.getAttribute('aria-label'),
        class: b.className
      }));

      // Also look for copy button
      const copyBtn = Array.from(targetRow.querySelectorAll('button')).find(b => 
        (b.innerText && b.innerText.includes('content_copy')) || 
        (b.getAttribute('aria-label') && b.getAttribute('aria-label').toLowerCase().includes('copy'))
      );

      // If we click copyBtn, let's see if we can read clipboard or click the key row to view key
      const keyLink = Array.from(targetRow.querySelectorAll('button, a')).find(b => b.innerText.includes('kube') || b.innerText.includes('...ic0Q'));

      return {
        rowText: targetRow.innerText,
        buttons,
        hasCopyBtn: !!copyBtn,
        hasKeyLink: !!keyLink
      };
    })()
  `;

  const res = await evalInTab('aistudio.google.com', code);
  console.log('Kube key row:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
