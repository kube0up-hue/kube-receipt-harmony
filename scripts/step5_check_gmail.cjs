const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      // Find rows in inbox
      const rows = Array.from(document.querySelectorAll('tr, [role="row"]')).map(r => ({
        text: r.innerText ? r.innerText.slice(0, 150) : '',
        isUnread: r.className.includes('zE') || r.innerText.includes('جديد')
      })).filter(r => r.text.includes('ElevenLabs') || r.text.includes('Verify') || r.text.includes('تأكيد'));

      return {
        rows,
        pageSample: document.body.innerText.slice(0, 500)
      };
    })()
  `;

  const res = await evalInTab('mail.google.com/mail/u/2', code);
  console.log('Gmail search result:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
