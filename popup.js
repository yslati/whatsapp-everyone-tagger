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

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];

        if (currentTab.url.includes('web.whatsapp.com')) {
            currentPageSpan.textContent = 'WhatsApp Web ✓';

            tagButton.disabled = false;
            statusMessage.textContent = 'Button enabled! Click to tag everyone.';
            statusMessage.style.backgroundColor = '#DCF8C6';
        } else {
            currentPageSpan.textContent = 'Not on WhatsApp Web';
            statusMessage.textContent = 'Please navigate to WhatsApp Web';
            statusMessage.style.backgroundColor = '#FFCCCB';
        }
    });

    tagButton.addEventListener('click', function () {
        tagButton.disabled = true;
        statusMessage.textContent = 'Tagging everyone...';
        const clearExisting = document.getElementById('clear-input-checkbox').checked;
        const speed = speedSelect.value;

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "tagEveryone",
                clearExisting: clearExisting,
                speed: speed
            }, function (response) {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError);
                    statusMessage.textContent = 'Error: ' + chrome.runtime.lastError.message;
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