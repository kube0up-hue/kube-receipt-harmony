const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      return options.map(o => ({
        text: o.innerText.trim(),
        outer: o.outerHTML
      }));
    })()
  `;

  const res = await evalInTab('organization/api-keys', code);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
