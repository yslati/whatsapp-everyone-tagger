document.addEventListener('DOMContentLoaded', function () {
    const tagButton = document.getElementById('tag-everyone-btn');
    const statusMessage = document.getElementById('status-message');
    const currentPageSpan = document.getElementById('current-page');
    const speedSelect = document.getElementById('speed-select');
    const speedDescription = document.getElementById('speed-description');

    let clearCheckbox = document.getElementById('clear-input-checkbox');

    const speedDescriptions = {
        'fast': 'Quick tagging, may miss some tags',
        'normal': 'Balanced speed for most groups',
        'slow': 'Slower but more reliable'
    };

    speedSelect.addEventListener('change', function() {
        speedDescription.textContent = speedDescriptions[speedSelect.value];
        chrome.storage.local.set({ tagSpeed: speedSelect.value });
    });

    chrome.storage.local.get(['tagSpeed'], function(result) {
        if (result.tagSpeed) {
            speedSelect.value = result.tagSpeed;
            speedDescription.textContent = speedDescriptions[result.tagSpeed];
        }
    });

    async function ensureContentScriptInjected(tabId) {
        try {
            await chrome.tabs.sendMessage(tabId, { action: "ping" });
            return true;
        } catch (error) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
                console.log('Content script injected successfully');
                return true;
            } catch (injectError) {
                console.error('Failed to inject content script:', injectError);
                return false;
            }
        }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];

        if (currentTab.url.includes('web.whatsapp.com')) {
            currentPageSpan.textContent = 'WhatsApp Web ✓';

            tagButton.disabled = false;
            statusMessage.textContent = 'Button enabled! Click to tag everyone.';
            statusMessage.style.backgroundColor = '#DCF8C6';
            ensureContentScriptInjected(currentTab.id);
        } else {
            currentPageSpan.textContent = 'Not on WhatsApp Web';
            statusMessage.textContent = 'Please navigate to WhatsApp Web';
            statusMessage.style.backgroundColor = '#FFCCCB';
        }
    });

    tagButton.addEventListener('click', async function () {
        tagButton.disabled = true;
        statusMessage.textContent = 'Tagging everyone...';
        const clearExisting = document.getElementById('clear-input-checkbox').checked;
        const speed = speedSelect.value;

        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            const tabId = tabs[0].id;
            
            const injected = await ensureContentScriptInjected(tabId);
            
            if (!injected) {
                statusMessage.textContent = 'Error: Failed to inject script. Please refresh the page.';
                statusMessage.style.backgroundColor = '#FFCCCB';
                tagButton.disabled = false;
                return;
            }
            
            if (injected) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            chrome.tabs.sendMessage(tabId, {
                action: "tagEveryone",
                clearExisting: clearExisting,
                speed: speed
            }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    statusMessage.textContent = 'Error: Please refresh WhatsApp Web and try again';
                    statusMessage.style.backgroundColor = '#FFCCCB';

                    setTimeout(function () {
                        tagButton.disabled = false;
                    }, 3000);
                    return;
                }

                if (response && response.success) {
                    statusMessage.textContent = 'Successfully tagged everyone!';

                    setTimeout(function () {
                        tagButton.disabled = false;
                        statusMessage.textContent = 'Ready to tag everyone!';
                    }, 3000);
                } else {
                    statusMessage.textContent = 'Error: ' + (response ? response.error : 'Unknown error');
                    statusMessage.style.backgroundColor = '#FFCCCB';

                    setTimeout(function () {
                        tagButton.disabled = false;
                    }, 3000);
                }
            });
        });
    });
});