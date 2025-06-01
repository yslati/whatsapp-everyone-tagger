document.addEventListener('DOMContentLoaded', function () {
    const tagButton = document.getElementById('tag-everyone-btn');
    const statusMessage = document.getElementById('status-message');
    const currentPageSpan = document.getElementById('current-page');
    const speedSelect = document.getElementById('speed-select');
    const speedDescription = document.getElementById('speed-description');
    const announcement = document.getElementById('announcement');
    const closeAnnouncement = document.getElementById('close-announcement');
    const showInlineButton = document.getElementById('show-inline-button');

    let clearCheckbox = document.getElementById('clear-input-checkbox');
    let isTaggingInProgress = false;

    const speedDescriptions = {
        'fast': 'Quick tagging, may miss some tags',
        'normal': 'Balanced speed for most groups',
        'slow': 'Slower but more reliable'
    };

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "taggingStateChanged") {
            isTaggingInProgress = request.inProgress;
            updatePopupButtonState();
            sendResponse({ received: true });
        }
    });

    function updatePopupButtonState() {
        if (isTaggingInProgress) {
            tagButton.disabled = true;
            tagButton.style.backgroundColor = '#cccccc';
            statusMessage.textContent = 'Tagging in progress... (via inline button)';
            statusMessage.style.backgroundColor = '#FFF3CD';
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs[0].url.includes('web.whatsapp.com')) {
                    tagButton.disabled = false;
                    tagButton.style.backgroundColor = '#128C7E';
                    statusMessage.textContent = 'Ready to tag everyone!';
                    statusMessage.style.backgroundColor = '#DCF8C6';
                }
            });
        }
    }

    chrome.storage.local.get(['announcementHidden'], function(result) {
        if (!result.announcementHidden) {
            announcement.style.display = 'block';
        }
    });

    closeAnnouncement.addEventListener('click', function() {
        announcement.style.display = 'none';
        chrome.storage.local.set({ announcementHidden: true });
    });

    speedSelect.addEventListener('change', function() {
        speedDescription.textContent = speedDescriptions[speedSelect.value];
        chrome.storage.local.set({ tagSpeed: speedSelect.value });
    });

    clearCheckbox.addEventListener('change', function() {
        chrome.storage.local.set({ clearExisting: clearCheckbox.checked });
    });

    showInlineButton.addEventListener('change', function() {
        chrome.storage.local.set({ showInlineButton: showInlineButton.checked });
        
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0].url.includes('web.whatsapp.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "toggleInlineButton",
                    show: showInlineButton.checked
                });
            }
        });
    });

    chrome.storage.local.get(['tagSpeed', 'showInlineButton', 'clearExisting'], function(result) {
        if (result.tagSpeed) {
            speedSelect.value = result.tagSpeed;
            speedDescription.textContent = speedDescriptions[result.tagSpeed];
        }
        
        if (result.showInlineButton !== undefined) {
            showInlineButton.checked = result.showInlineButton;
        }
        
        if (result.clearExisting !== undefined) {
            clearCheckbox.checked = result.clearExisting;
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
        if (isTaggingInProgress) return;

        tagButton.disabled = true;
        statusMessage.textContent = 'Tagging everyone...';
        
        chrome.storage.local.get(['clearExisting', 'tagSpeed'], function(result) {
            const clearExisting = result.clearExisting !== undefined ? result.clearExisting : true;
            const speed = result.tagSpeed || speedSelect.value;

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
                            if (!isTaggingInProgress) {
                                tagButton.disabled = false;
                                statusMessage.textContent = 'Ready to tag everyone!';
                            }
                        }, 3000);
                    } else if (response && response.error === "Tagging already in progress") {
                        statusMessage.textContent = 'Tagging already in progress via inline button';
                        statusMessage.style.backgroundColor = '#FFF3CD';
                        
                        setTimeout(function () {
                            if (!isTaggingInProgress) {
                                tagButton.disabled = false;
                                statusMessage.textContent = 'Ready to tag everyone!';
                            }
                        }, 2000);
                    } else {
                        statusMessage.textContent = 'Error: ' + (response ? response.error : 'Unknown error');
                        statusMessage.style.backgroundColor = '#FFCCCB';

                        setTimeout(function () {
                            if (!isTaggingInProgress) {
                                tagButton.disabled = false;
                            }
                        }, 3000);
                    }
                });
            });
        });
    });
});