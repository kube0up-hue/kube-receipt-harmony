const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const text = document.body.innerText;
      const inputs = Array.from(document.querySelectorAll('input, select')).map(i => ({
        placeholder: i.placeholder,
        name: i.name,
        type: i.type,
        value: i.value
      }));
      const buttons = Array.from(document.querySelectorAll('button, a')).map(b => ({
        text: b.innerText.trim(),
        class: b.className
      }));

      return {
        url: window.location.href,
        text: text.slice(0, 1000),
        inputs,
        buttons
      };
    })()
  `;

  const res = await evalInTab('fal.ai', code);
  console.log('Fal onboarding details:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
