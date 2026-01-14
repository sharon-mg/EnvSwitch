chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'switchEnv') {
    const env = message.env;
    chrome.storage.sync.get(['currentEnv'], function (result) {
      console.log('Switching to environment:', env.name);
      console.log('Subdomain:', env.subdomain);

      // Get the current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        console.log('current url:', currentTab.url);
        const newUrl = new URL(currentTab.url);

        // Extract the current subdomain
        const domainParts = newUrl.hostname.split('.');
        if (domainParts.length > 2) {
          // Replace the subdomain
          domainParts[0] = env.subdomain;
          newUrl.hostname = domainParts.join('.');
        } else if (domainParts.length > 1) {
          // If there's no subdomain, prepend the new subdomain
          newUrl.hostname = `${env.subdomain}.${newUrl.hostname}`;
        } else {
          // If there's no standard domain - do nothing
          return;
        }
        
        //@TODO: igonre if url stays the same

        // Update the tab with the new URL
        chrome.tabs.update(currentTab.id, { url: newUrl.href });
      });
    });
  }
});
