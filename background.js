const welcomePageURL = 'https://slati.me/whatsapp-everyone-tagger';

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: welcomePageURL,
            active: true
        });
        
        chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, function(tabs) {
            if (tabs.length > 0) {
                tabs.forEach(tab => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    }).catch(err => {
                        console.log('Could not inject into tab:', tab.id, err);
                    });
                });
            }
        });
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('web.whatsapp.com')) {
        chrome.tabs.sendMessage(tabId, { action: 'ping' }).catch(() => {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).catch(err => {
                console.log('Could not inject content script:', err);
            });
        });
    }
});