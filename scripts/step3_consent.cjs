const { evalInTab } = require('./cdp_bridge.cjs');
const { clickAt } = require('./cdp_mouse.cjs');

async function main() {
  const code = `
    (() => {
      const text = document.body.innerText;
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
        text: b.innerText.trim(),
        id: b.id,
        class: b.className
      }));

      // Look for continue or allow button
      const continueBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText && (b.innerText.includes('متابعة') || b.innerText.includes('Continue') || b.innerText.includes('السماح') || b.innerText.includes('Allow'))
      );

      return {
        text: text.slice(0, 500),
        buttons,
        hasContinue: !!continueBtn
      };
    })()
  `;

  const res = await evalInTab('accounts.google.com/signin/oauth', code);
  console.log('Consent page details:', JSON.stringify(res, null, 2));

  // If continueBtn exists, click it
  const clickCode = `
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText && (b.innerText.includes('متابعة') || b.innerText.includes('Continue') || b.innerText.includes('السماح') || b.innerText.includes('Allow'))
      );
      if (btn) {
        btn.click();
        return { clicked: true, text: btn.innerText };
      }
      return { clicked: false };
    })()
  `;

  const clickRes = await evalInTab('accounts.google.com/signin/oauth', clickCode);
  console.log('Click result:', clickRes);
}

main().catch(console.error);
