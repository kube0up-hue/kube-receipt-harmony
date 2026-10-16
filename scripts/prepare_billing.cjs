const { evalInTab } = require('./cdp_bridge.cjs');

async function main() {
  console.log('Navigating Fal.ai to billing...');
  await evalInTab('fal.ai', 'window.location.href = "https://fal.ai/dashboard/billing"');

  console.log('Navigating OpenAI to billing...');
  await evalInTab('organization/api-keys', 'window.location.href = "https://platform.openai.com/settings/organization/billing/overview"');

  await new Promise(r => setTimeout(r, 3500));

  const checkFal = await evalInTab('fal.ai', '(() => ({ title: document.title, url: window.location.href, text: document.body.innerText.slice(0, 500) }))()');
  console.log('Fal Billing:', checkFal);

  const checkOpenAi = await evalInTab('openai.com', '(() => ({ title: document.title, url: window.location.href, text: document.body.innerText.slice(0, 500) }))()');
  console.log('OpenAI Billing:', checkOpenAi);
}

main().catch(console.error);
