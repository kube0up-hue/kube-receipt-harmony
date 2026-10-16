const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const tabId = 'A8DE9C36BA480CD0A4962F91292B2CA4';
  const code = `
    (() => {
      const continueBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText && (b.innerText.includes('Continue') || b.innerText.includes('متابعة') || b.innerText.includes('Allow') || b.innerText.includes('السماح'))
      );
      if (continueBtn) {
        continueBtn.click();
        return { clicked: true, text: continueBtn.innerText };
      }
      return { clicked: false, buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText) };
    })()
  `;

  const res = await evalInTab(tabId, code);
  console.log('Consent click result:', res);

  // Wait 4 seconds for Kling to receive OAuth token and login
  await new Promise(r => setTimeout(r, 4500));

  const checkKling = `
    (() => {
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.slice(0, 1000),
        buttons: Array.from(document.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(Boolean).slice(-15)
      };
    })()
  `;

  const klingRes = await evalInTab('2BA529AAB847361F8F6E06561A3600DF', checkKling);
  console.log('Kling state after login:', JSON.stringify(klingRes, null, 2));
}

main().catch(console.error);
