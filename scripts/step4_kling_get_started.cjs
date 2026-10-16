const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      const getStartedBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Get Started');
      if (getStartedBtn) {
        getStartedBtn.click();
        return { clicked: true };
      }
      return { clicked: false };
    })()
  `;

  const res = await evalInTab('05D465727C3A466BCAD5271AA0327456', code);
  console.log('Get Started click:', res);

  // Wait 3 seconds
  await new Promise(r => setTimeout(r, 3500));

  const checkAfter = `
    (() => {
      const text = document.body.innerText;
      const inputs = Array.from(document.querySelectorAll('input')).map(i => i.value);
      const buttons = Array.from(document.querySelectorAll('button, a')).map(b => b.innerText.trim()).filter(Boolean);
      return {
        text: text.slice(0, 1500),
        inputs,
        buttons
      };
    })()
  `;

  const state = await evalInTab('05D465727C3A466BCAD5271AA0327456', checkAfter);
  console.log('State after Get Started:', JSON.stringify(state, null, 2));
}

main().catch(console.error);
