const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      // Find element whose text is exactly 'المنصة'
      const allEls = Array.from(document.querySelectorAll('*'));
      const mansahEl = allEls.find(el => el.innerText && el.innerText.trim() === 'المنصة' && el.children.length === 0);
      
      if (!mansahEl) return { error: 'MANSAH_NOT_FOUND' };

      const target = mansahEl.closest('[role="option"]') || mansahEl;
      
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      target.click();

      return {
        clicked: true,
        tag: target.tagName,
        role: target.getAttribute('role'),
        text: target.innerText
      };
    })()
  `;

  const res = await evalInTab('organization/api-keys', code);
  console.log('Select Result:', res);
}

main().catch(console.error);
