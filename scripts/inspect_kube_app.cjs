const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  const code = `
    (() => {
      // Find all provider cards or text containing providers
      const text = document.body.innerText;
      const localKeys = {
        gemini: localStorage.getItem('KUBE_GEMINI_API_KEY'),
        openai: localStorage.getItem('KUBE_OPENAI_API_KEY'),
        fal: localStorage.getItem('KUBE_FAL_KEY'),
        elevenlabs: localStorage.getItem('KUBE_ELEVENLABS_API_KEY'),
        kling: localStorage.getItem('KUBE_KLING_API_KEY')
      };

      // Check if providers modal or buttons exist
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);

      return {
        localKeys: {
          gemini: localKeys.gemini ? localKeys.gemini.slice(0, 8) + '...' : null,
          openai: localKeys.openai ? localKeys.openai.slice(0, 8) + '...' : null,
          fal: localKeys.fal ? localKeys.fal.slice(0, 8) + '...' : null,
          elevenlabs: localKeys.elevenlabs ? localKeys.elevenlabs.slice(0, 8) + '...' : null,
          kling: localKeys.kling ? localKeys.kling.slice(0, 8) + '...' : null
        },
        buttonsSample: buttons.filter(b => b.includes('مفتاح') || b.includes('مزود') || b.includes('اتصال') || b.includes('API') || b.includes('فحص'))
      };
    })()
  `;

  const res = await evalInTab('kubekitchen.app/admin/marketing', code);
  console.log('KUBE App Live State:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
