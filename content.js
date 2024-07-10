function searchInlineScripts() {
  const scripts = document.querySelectorAll('script');
  const inlineScripts = [];

  scripts.forEach(script => {
    if (script.innerText) {
      inlineScripts.push(script.innerText);
    } else if (script.hasAttribute('src')) {
      fetchAndSearch(script.getAttribute('src'));
    }
  });

  chrome.runtime.sendMessage({ type: 'inlineScripts', inlineScripts });
}

async function fetchAndSearch(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    chrome.runtime.sendMessage({ type: 'fetchedScript', url, content: text });
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
  }
}

searchInlineScripts();
