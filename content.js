console.log('WhatsApp Everyone Tagger Extension loaded');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "tagEveryone") {
        tagEveryone(
            request.clearExisting !== undefined ? request.clearExisting : true,
            request.speed || 'normal'
        )
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('Error tagging everyone:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function tagEveryone(clearExisting = true, speed = 'normal') {
    try {
        const delays = {
            fast: {
                afterTag: 100,
                afterTab: 80,
                afterSpace: 80
            },
            normal: {
                afterTag: 200,
                afterTab: 150,
                afterSpace: 150
            },
            slow: {
                afterTag: 400,
                afterTab: 300,
                afterSpace: 300
            }
        };

        const currentDelays = delays[speed] || delays.normal;

        const participantsText = getParticipantsText();
        if (!participantsText) {
            throw new Error('Could not find group members list. Is this a group chat?');
        }

        const participants = parseParticipants(participantsText);
        if (participants.length === 0) {
            throw new Error('No participants found in this chat');
        }

        const chatInput = findChatInput();
        if (!chatInput) {
            throw new Error('Chat input not found. Please click in the message area first.');
        }

        chatInput.focus();
        if (clearExisting) {
            chatInput.textContent = '';
        } else {
            if (chatInput.textContent.length > 0 && !chatInput.textContent.endsWith(' ')) {
                document.execCommand('insertText', false, ' ');
            }
        }

        for (const participant of participants) {
            document.execCommand('insertText', false, `@${participant}`);
            await sleep(currentDelays.afterTag);
            chatInput.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Tab',
                code: 'Tab',
                keyCode: 9,
                which: 9,
                bubbles: true,
                cancelable: true
            }));

            await sleep(currentDelays.afterTab);
            document.execCommand('insertText', false, ' ');
            await sleep(currentDelays.afterSpace);
        }

        return true;
    } catch (error) {
        console.error('Error in tagEveryone:', error);
        throw error;
    }
}

function getParticipantsText() {
    const selectors = [
        '#main > header span.selectable-text.copyable-text',
        'div[data-testid="conversation-header"] span.xlyipyv',
        '.xisnujt span.xlyipyv',
        'span[title*=","]'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
            return element.textContent;
        }
    }

    const allHeaders = document.querySelectorAll('header span');
    for (const header of allHeaders) {
        if (header.textContent && header.textContent.includes(',')) {
            return header.textContent;
        }
    }

    return null;
}

function parseParticipants(text) {
    const separator = text.includes('，') ? '，' : ',';
    let participants = text.split(separator).map(p => p.trim());
    participants = participants.filter(p => p && p !== '' && !p.includes('You'));
    return participants;
}

function findChatInput() {
    const mainSelector = 'div[aria-label="Type a message"][data-lexical-editor="true"]';
    const mainInput = document.querySelector(mainSelector);

    if (mainInput) {
        return mainInput;
    }

    const backupSelectors = [
        'div.lexical-rich-text-input div[contenteditable="true"]',
        'div[role="textbox"][contenteditable="true"]',
        'div[contenteditable="true"][data-tab="10"]',
        'footer div[contenteditable="true"]',
        'div[contenteditable="true"]'
    ];

    for (const selector of backupSelectors) {
        const element = document.querySelector(selector);
        if (element && element.closest('footer')) {
            return element;
        }
    }

    console.error('No chat input found with any selector');
    return null;
}