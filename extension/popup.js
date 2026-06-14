document.addEventListener('DOMContentLoaded', async () => {
  const setupView = document.getElementById('setup-view');
  const mainView = document.getElementById('main-view');
  const serverUrlInput = document.getElementById('serverUrl');
  const apiKeyInput = document.getElementById('apiKey');
  const saveSetupBtn = document.getElementById('saveSetupBtn');
  
  const tabTitleEl = document.getElementById('tabTitle');
  const tabUrlEl = document.getElementById('tabUrl');
  const tagsInput = document.getElementById('tagsInput');
  const saveBookmarkBtn = document.getElementById('saveBookmarkBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const statusMessage = document.getElementById('statusMessage');

  let currentTab = null;

  // 1. Get current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      currentTab = tabs[0];
      tabTitleEl.textContent = currentTab.title;
      tabUrlEl.textContent = currentTab.url;
    }
  });

  // 2. Check storage for API keys
  chrome.storage.local.get(['apiKey', 'serverUrl'], (result) => {
    if (result.apiKey && result.serverUrl) {
      showMainView();
      serverUrlInput.value = result.serverUrl;
      apiKeyInput.value = result.apiKey;
    } else {
      showSetupView();
    }
  });

  // 3. Save Setup
  saveSetupBtn.addEventListener('click', () => {
    const url = serverUrlInput.value.trim();
    const key = apiKeyInput.value.trim();
    if (url && key) {
      chrome.storage.local.set({ serverUrl: url, apiKey: key }, () => {
        showMainView();
      });
    }
  });

  // 4. Open Settings
  settingsBtn.addEventListener('click', () => {
    showSetupView();
  });

  // 5. Save Bookmark to LinkStash
  saveBookmarkBtn.addEventListener('click', async () => {
    if (!currentTab) return;

    saveBookmarkBtn.disabled = true;
    saveBookmarkBtn.textContent = "Saving...";
    statusMessage.className = "status hidden";

    chrome.storage.local.get(['apiKey', 'serverUrl'], async (result) => {
      try {
        const rawTags = tagsInput.value.trim();
        const tagsArray = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : [];

        const endpoint = `${result.serverUrl.replace(/\/$/, '')}/api/extension/save`;
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${result.apiKey}`
          },
          body: JSON.stringify({
            url: currentTab.url,
            tags: tagsArray
          })
        });

        const data = await response.json();

        if (response.ok) {
          statusMessage.textContent = "Bookmark saved successfully!";
          statusMessage.className = "status success";
          setTimeout(() => window.close(), 1500);
        } else {
          throw new Error(data.error || 'Failed to save bookmark');
        }
      } catch (error) {
        statusMessage.textContent = error.message;
        statusMessage.className = "status error";
        saveBookmarkBtn.disabled = false;
        saveBookmarkBtn.textContent = "Save Bookmark";
      }
    });
  });

  function showMainView() {
    setupView.classList.add('hidden');
    mainView.classList.remove('hidden');
  }

  function showSetupView() {
    mainView.classList.add('hidden');
    setupView.classList.remove('hidden');
  }
});
