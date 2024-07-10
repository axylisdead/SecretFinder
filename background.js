let results = [];
let found = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'reset') {
    results = [];
    found = false;
    chrome.action.setIcon({
      path: {
        '16': 'icons/default_icon_16.png',
        '48': 'icons/default_icon_48.png',
        '128': 'icons/default_icon_128.png'
      }
    });
  }

  if (message.type === 'inlineScripts') {
    message.inlineScripts.forEach(script => {
      searchInScript(script, sender.tab.url);
    });
  }

  if (message.type === 'fetchedScript') {
    searchInScript(message.content, message.url);
  }
});

function searchInScript(script, sourceUrl) {
  const patterns = [
    /secret\s*=\s*['"][^'"]*['"]/gi,
    /['"][^'"]*\s*=\s*secret/gi,
    /secret\s*:\s*['"][^'"]*['"]/gi,
    /[a-zA-Z0-9_.$]*secret[a-zA-Z0-9._$]*\s*=\s*['"][^'"]*['"]/gi,
    /['"][^'"]*['"]\s*=\s*[a-zA-Z0-9._$]*secret[a-zA-Z0-9._$]*/gi,
    /[a-zA-Z0-9._$]*secret[a-zA-Z0-9._$]*\s*:\s*['"][^'"]*['"]/gi,
    /"secret"\s*:\s*"[^"]*"/gi,
    /'secret'\s*:\s*'[^']*'/gi,
    /"[^"]*"\s*:\s*"secret"/gi,
    /'[^']*'\s*:\s*'secret'/gi,
    /[a-zA-Z0-9._$]*secret[a-zA-Z0-9._$]*\s*=\s*[^\s;]+/gi,
    /[^\s;]+\s*=\s*[a-zA-Z0-9._$]*secret[a-zA-Z0-9_.$]*/gi,
    /eyJ[A-Za-z0-9+./=]+/g,
    /(api[_-]?key|token|secret)\s*=\s*['"][a-zA-Z0-9_\-]+['"]/gi,
    /(api[_-]?key|token|secret)\s*:\s*['"][a-zA-Z0-9_\-]+['"]/gi,
    /((?:ASIA|AKIA|AROA|AIDA)([A-Z0-7]{16}))/g,
    /([a-zA-Z0-9.+/]{40})/g
  ];

  const awsKeyMatches = [...script.matchAll(patterns[15])];

  if (awsKeyMatches.length > 0) {
    const longTokenMatches = [...script.matchAll(patterns[16])];

    longTokenMatches.forEach(tokenMatch => {
      results.push({ url: sourceUrl, match: tokenMatch[0] });
      found = true;
      chrome.action.setIcon({
        path: {
          '16': 'icons/found_icon_16.png',
          '48': 'icons/found_icon_48.png',
          '128': 'icons/found_icon_128.png'
        }
      });
    });
  }

  patterns.slice(0, 15).forEach(pattern => {
    const matches = [...script.matchAll(pattern)];
    matches.forEach(match => {
      results.push({ url: sourceUrl, match: match[0] });
      found = true;
      chrome.action.setIcon({
        path: {
          '16': 'icons/found_icon_16.png',
          '48': 'icons/found_icon_48.png',
          '128': 'icons/found_icon_128.png'
        }
      });
    });
  });

  chrome.storage.local.set({ results });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { type: 'reset' });
  }
});
