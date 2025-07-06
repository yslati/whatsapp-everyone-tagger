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
        
        clearCheckbox.checked = result.clearExisting === true;
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

    async function checkContentScriptStatus(tabId) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: "ping" });
            return response && response.status === "ready";
        } catch (error) {
            return false;
        }
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        const currentTab = tabs[0];

        if (currentTab.url.includes('web.whatsapp.com')) {
            currentPageSpan.textContent = 'WhatsApp Web';
            
            const isContentScriptReady = await checkContentScriptStatus(currentTab.id);
            
            if (isContentScriptReady) {
                tagButton.disabled = false;
                statusMessage.textContent = 'Ready to tag everyone!';
                statusMessage.style.backgroundColor = '#DCF8C6';
            } else {
                showRefreshNotification();
            }
        } else {
            currentPageSpan.textContent = 'Not on WhatsApp Web';
            statusMessage.textContent = 'Please navigate to WhatsApp Web';
            statusMessage.style.backgroundColor = '#FFCCCB';
        }
    });

    function showRefreshNotification() {
        const refreshNotification = document.createElement('div');
        refreshNotification.id = 'refresh-notification';
        refreshNotification.style.cssText = `
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
            text-align: center;
            font-size: 13px;
            box-shadow: 0 3px 8px rgba(255,107,107,0.3);
            position: relative;
            animation: slideIn 0.3s ease-out;
        `;
        
        refreshNotification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
                </svg>
                <strong>Refresh Required</strong>
            </div>
            <div style="margin-bottom: 10px; font-size: 12px; line-height: 1.4;">
                Extension was installed after opening WhatsApp.<br>
                Please refresh the page to activate.
            </div>
            <button id="auto-refresh-btn" style="
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                margin-right: 8px;
                transition: all 0.2s ease;
            ">Refresh Now</button>
            <button id="manual-refresh-btn" style="
                background: transparent;
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            ">I'll do it manually</button>
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        document.body.insertBefore(refreshNotification, document.body.firstChild);
        document.getElementById('auto-refresh-btn').addEventListener('click', function() {
            this.innerHTML = 'Refreshing...';
            this.disabled = true;
            
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.reload(tabs[0].id, function() {
                    setTimeout(() => window.close(), 500);
                });
            });
        });

        document.getElementById('manual-refresh-btn').addEventListener('click', function() {
            refreshNotification.style.display = 'none';
            statusMessage.textContent = 'Please refresh WhatsApp Web (F5 or Ctrl+R)';
            statusMessage.style.backgroundColor = '#FFF3CD';
            statusMessage.style.color = '#856404';
        });

        tagButton.disabled = true;
        statusMessage.textContent = 'Refresh required to activate extension';
        statusMessage.style.backgroundColor = '#FFF3CD';
        statusMessage.style.color = '#856404';
    }

    tagButton.addEventListener('click', async function () {
        if (isTaggingInProgress) return;

        tagButton.disabled = true;
        statusMessage.textContent = 'Tagging everyone...';
        
        chrome.storage.local.get(['clearExisting', 'tagSpeed'], function(result) {
            const clearExisting = result.clearExisting === true;
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