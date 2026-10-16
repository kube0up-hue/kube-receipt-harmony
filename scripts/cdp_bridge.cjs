// CDP Bridge helper for direct, safe Chrome DevTools interaction
const http = require('http');

async function getTabs() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function evalInTab(tabIdOrUrlPattern, code) {
  const tabs = await getTabs();
  const tab = tabs.find(t => 
    t.id === tabIdOrUrlPattern || 
    (t.url && t.url.includes(tabIdOrUrlPattern))
  );
  if (!tab || !tab.webSocketDebuggerUrl) {
    throw new Error(`Tab not found for pattern: ${tabIdOrUrlPattern}`);
  }

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let msgId = 0;
    const pending = new Map();

    function send(method, params = {}) {
      msgId++;
      const id = msgId;
      return new Promise((res, rej) => {
        pending.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    const timer = setTimeout(() => {
      try { ws.close(); } catch(e) {}
      reject(new Error('Timeout evaluating CDP command'));
    }, 15000);

    ws.onopen = async () => {
      try {
        await send('Runtime.enable');
        const evalRes = await send('Runtime.evaluate', {
          expression: code,
          returnByValue: true,
          awaitPromise: true
        });
        clearTimeout(timer);
        ws.close();
        if (evalRes.exceptionDetails) {
          throw new Error('JS Exception: ' + JSON.stringify(evalRes.exceptionDetails));
        }
        resolve(evalRes.result ? evalRes.result.value : evalRes);
      } catch (err) {
        clearTimeout(timer);
        try { ws.close(); } catch(e) {}
        reject(err);
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && pending.has(msg.id)) {
          const { res, rej } = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) rej(new Error(msg.error.message || JSON.stringify(msg.error)));
          else res(msg.result);
        }
      } catch (e) {}
    };

    ws.onerror = (e) => {
      clearTimeout(timer);
      reject(e);
    };
  });
}

module.exports = { getTabs, evalInTab };

if (require.main === module) {
  const action = process.argv[2];
  const target = process.argv[3];
  const script = process.argv[4];

  if (action === 'tabs') {
    getTabs().then(tabs => {
      console.log(JSON.stringify(tabs.map(t => ({ id: t.id, title: t.title, url: t.url })), null, 2));
    }).catch(console.error);
  } else if (action === 'eval') {
    evalInTab(target, script).then(res => {
      console.log('EVAL_RESULT:', JSON.stringify(res, null, 2));
    }).catch(console.error);
  }
}
