const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const fullText = document.body.innerText;
      const allButtons = Array.from(document.querySelectorAll('button, a, input')).map(el => ({
        tag: el.tagName,
        text: el.innerText ? el.innerText.trim() : '',
        value: el.value,
        placeholder: el.placeholder,
        class: el.className
      }));

      // Look for Create Key or Add Key or Secret Key
      const keyMatches = fullText.match(/[a-zA-Z0-9_-]{20,}/g) || [];

      return {
        fullText: fullText.slice(0, 3000),
        allButtons,
        keyMatches: keyMatches.slice(0, 10)
      };
    })()
  `;

  const res = await evalInTab('05D465727C3A466BCAD5271AA0327456', code);
  console.log('Kling API Key Page Content:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
