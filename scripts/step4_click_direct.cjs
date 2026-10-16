const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const tabId = 'A8DE9C36BA480CD0A4962F91292B2CA4';
  const code = `
    (() => {
      // Find element with data-identifier or click handler
      const target = document.querySelector('[data-identifier="kube0up@gmail.com"]') ||
                     Array.from(document.querySelectorAll('div, li')).find(el => el.innerText && el.innerText.includes('kube0up@gmail.com') && (el.getAttribute('role') === 'link' || el.hasAttribute('data-identifier')));
      
      if (target) {
        target.click();
        return { clicked: true, tag: target.tagName, text: target.innerText };
      }

      // Fallback: look for any element containing kube0up
      const anyEl = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === 'kube0up@gmail.com');
      if (anyEl) {
        let p = anyEl;
        while (p && p !== document.body) {
          if (p.onclick || p.getAttribute('role') === 'link' || p.tagName === 'LI' || p.hasAttribute('data-identifier')) {
            p.click();
            return { clickedViaParent: true, tag: p.tagName, text: p.innerText };
          }
          p = p.parentElement;
        }
        anyEl.parentElement.click();
        return { clickedParent: true };
      }

      return { error: 'NOT_FOUND' };
    })()
  `;

  const res = await evalInTab(tabId, code);
  console.log('Direct click result:', res);
}

main().catch(console.error);
