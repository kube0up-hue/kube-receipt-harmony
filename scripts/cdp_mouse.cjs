const http = require('http');

async function getTabs() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9223/json', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function clickAt(tabIdOrPattern, x, y) {
  const tabs = await getTabs();
  const tab = tabs.find(t => t.id === tabIdOrPattern || (t.url && t.url.includes(tabIdOrPattern)));
  if (!tab) throw new Error('Tab not found');

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let msgId = 0;
    function send(method, params = {}) {
      msgId++;
      ws.send(JSON.stringify({ id: msgId, method, params }));
    }

    ws.onopen = async () => {
      send('Page.bringToFront');
      // Mouse move
      send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await new Promise(r => setTimeout(r, 60));
      // Mouse down
      send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
      await new Promise(r => setTimeout(r, 120));
      // Mouse up
      send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
      await new Promise(r => setTimeout(r, 200));
      ws.close();
      resolve(true);
    };
    ws.onerror = reject;
  });
}

module.exports = { clickAt };
