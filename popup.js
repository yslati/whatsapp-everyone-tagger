document.addEventListener('DOMContentLoaded', function () {
    const tagButton = document.getElementById('tag-everyone-btn');
    const statusMessage = document.getElementById('status-message');
    const currentPageSpan = document.getElementById('current-page');

    let clearCheckbox = document.getElementById('clear-input-checkbox');

    if (!clearCheckbox) {
        const optionsContainer = document.createElement('div');
        optionsContainer.style.marginTop = '10px';
        optionsContainer.style.textAlign = 'center';

        clearCheckbox = document.createElement('input');
        clearCheckbox.type = 'checkbox';
        clearCheckbox.id = 'clear-input-checkbox';
        clearCheckbox.checked = false;

        const clearLabel = document.createElement('label');
        clearLabel.style.fontSize = '14px';
        clearLabel.style.color = '#075E54';
        clearLabel.appendChild(clearCheckbox);
        clearLabel.appendChild(document.createTextNode(' Clear existing text before tagging'));

        optionsContainer.appendChild(clearLabel);

        tagButton.parentNode.insertBefore(optionsContainer, tagButton.nextSibling);
    } else {
        clearCheckbox.checked = false;
    }

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

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "tagEveryone",
                clearExisting: clearExisting
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