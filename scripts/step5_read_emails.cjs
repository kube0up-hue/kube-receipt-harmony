const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      // Find rows in inbox
      const rows = Array.from(document.querySelectorAll('tr[role="row"]')).slice(0, 15).map(r => ({
        text: r.innerText.replace(/\\n/g, ' ').slice(0, 200)
      }));

      return {
        rows,
        title: document.title
      };
    })()
  `;

  const res = await evalInTab('4147C2B3E8DFFF28A6C2B2213E6DF75E', code);
  console.log('Inbox emails:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
