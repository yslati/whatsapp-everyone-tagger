let tagButton = null;
let isGroupChat = false;
let showInlineButton = true;
let isTaggingInProgress = false;

function init() {
    
    chrome.storage.local.get(['showInlineButton'], function(result) {
        showInlineButton = result.showInlineButton !== false;
        checkForGroupChat();
        if (showInlineButton) {
            injectTagButton();
        }
    });
    
    const observer = new MutationObserver(() => {
        checkForGroupChat();
        if (isGroupChat && !tagButton && showInlineButton) {
            injectTagButton();
        } else if ((!isGroupChat || !showInlineButton) && tagButton) {
            removeTagButton();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function checkForGroupChat() {
    const participantsText = getParticipantsText();
    const wasGroupChat = isGroupChat;
    isGroupChat = isActualGroupChat(participantsText);
    
    if (wasGroupChat !== isGroupChat) {
        if (isGroupChat && showInlineButton) {
            injectTagButton();
        } else {
            removeTagButton();
        }
    }
}

function isActualGroupChat(participantsText) {
    if (!participantsText) return false;
    if (!participantsText.includes(',')) return false;
    
    const hasYouAtEnd = participantsText.trim().endsWith('You') || participantsText.trim().endsWith(', You');    
    const participants = participantsText.split(',').map(p => p.trim());
    const nonYouParticipants = participants.filter(p => p && p !== 'You' && p !== '');    
    const containsPrivacyText = participantsText.toLowerCase().includes('privacy') || 
                              participantsText.toLowerCase().includes('settings') ||
                              participantsText.toLowerCase().includes('about information') ||
                              participantsText.length > 500;
    
    return nonYouParticipants.length >= 2 && !containsPrivacyText && (hasYouAtEnd || participants.length >= 3);
}

function updateInlineButtonState(disabled, text = null) {
    if (!tagButton) return;
    
    tagButton.disabled = disabled;
    
    if (disabled) {
        tagButton.style.background = '#8696a0';
        tagButton.style.cursor = 'not-allowed';
    } else {
        tagButton.style.background = '#00a884';
        tagButton.style.cursor = 'pointer';
    }
    
    if (text) {
        tagButton.innerHTML = text;
    }
}

function notifyPopupTaggingState(inProgress) {
    chrome.runtime.sendMessage({
        action: "taggingStateChanged",
        inProgress: inProgress
    });
}

function injectTagButton() {
    if (tagButton || !isGroupChat || !showInlineButton) return;
    
    const footer = document.querySelector('footer') || document.querySelector('[data-testid="conversation-compose-box-input"]')?.closest('div');
    
    if (!footer) {
        setTimeout(injectTagButton, 1000);
        return;
    }
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        position: absolute;
        top: -45px;
        right: 10px;
        z-index: 1001;
        pointer-events: none;
    `;
    
    tagButton = document.createElement('button');
    tagButton.innerHTML = `
        <span style="margin-left: 4px; font-size: 12px;">@everyone</span>
    `;
    
    tagButton.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: #00a884;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,168,132,0.3);
        z-index: 1002;
        min-width: 70px;
        height: 32px;
        pointer-events: all;
        position: relative;
    `;
    
    tagButton.onmouseover = () => {
        if (!tagButton.disabled) {
            tagButton.style.background = '#017c5c';
            tagButton.style.transform = 'scale(1.05)';
            tagButton.style.boxShadow = '0 4px 12px rgba(0,168,132,0.4)';
        }
    };
    
    tagButton.onmouseout = () => {
        if (!tagButton.disabled) {
            tagButton.style.background = '#00a884';
            tagButton.style.transform = 'scale(1)';
            tagButton.style.boxShadow = '0 2px 8px rgba(0,168,132,0.3)';
        }
    };
    
    tagButton.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isTaggingInProgress) {
            await handleTagButtonClick();
        }
    };
    
    buttonContainer.appendChild(tagButton);
    footer.style.position = 'relative';
    footer.appendChild(buttonContainer);
    
}

function removeTagButton() {
    if (tagButton) {
        const container = tagButton.parentElement;
        if (container && container !== document.body) {
            container.remove();
        } else {
            tagButton.remove();
        }
        tagButton = null;
    }
}

async function handleTagButtonClick() {
    if (!tagButton || isTaggingInProgress) return;
    
    isTaggingInProgress = true;
    notifyPopupTaggingState(true);
    
    const originalText = tagButton.innerHTML;
    tagButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
        <span style="margin-left: 5px;">Tagging...</span>
    `;
    updateInlineButtonState(true);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    try {
        const result = await chrome.storage.local.get(['tagSpeed', 'clearExisting']);
        const speed = result.tagSpeed || 'normal';
        const clearExisting = result.clearExisting === true;
        
        await tagEveryone(clearExisting, speed);
        
        tagButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
            </svg>
            <span style="margin-left: 5px;">Done!</span>
        `;
        tagButton.style.background = '#06d755';
        
        setTimeout(() => {
            if (tagButton) {
                tagButton.innerHTML = originalText;
                updateInlineButtonState(false);
                isTaggingInProgress = false;
                notifyPopupTaggingState(false);
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error tagging everyone:', error);
        
        tagButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
            <span style="margin-left: 5px;">Error</span>
        `;
        tagButton.style.background = '#f44336';
        
        setTimeout(() => {
            if (tagButton) {
                tagButton.innerHTML = originalText;
                updateInlineButtonState(false);
                isTaggingInProgress = false;
                notifyPopupTaggingState(false);
            }
        }, 3000);
    }
    
    document.head.removeChild(style);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "ping") {
        sendResponse({ status: "ready" });
        return true;
    }
    
    if (request.action === "toggleInlineButton") {
        showInlineButton = request.show;
        if (showInlineButton && isGroupChat && !tagButton) {
            injectTagButton();
        } else if (!showInlineButton && tagButton) {
            removeTagButton();
        }
        sendResponse({ success: true });
        return true;
    }
    
    if (request.action === "tagEveryone") {
        if (isTaggingInProgress) {
            sendResponse({ success: false, error: "Tagging already in progress" });
            return true;
        }
        
        isTaggingInProgress = true;
        updateInlineButtonState(true, `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
                <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
            </svg>
            <span style="margin-left: 5px;">Tagging...</span>
        `);
        
        tagEveryone(
            request.clearExisting !== undefined ? request.clearExisting : false,
            request.speed || 'normal'
        )
            .then(() => {
                updateInlineButtonState(false, `<span style="margin-left: 4px; font-size: 12px;">@everyone</span>`);
                isTaggingInProgress = false;
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('Error tagging everyone:', error);
                updateInlineButtonState(false, `<span style="margin-left: 4px; font-size: 12px;">@everyone</span>`);
                isTaggingInProgress = false;
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function aggressiveClearChatInput(chatInput) {
    try {        
        chatInput.focus();
        await sleep(100);        
        const initialLength = chatInput.textContent.length;
        
        if (initialLength > 0) {
            const range = document.createRange();
            const selection = window.getSelection();   
            const walker = document.createTreeWalker(
                chatInput,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let lastTextNode = null;
            while (walker.nextNode()) {
                lastTextNode = walker.currentNode;
            }
            
            if (lastTextNode) {
                range.setStart(lastTextNode, lastTextNode.textContent.length);
                range.setEnd(lastTextNode, lastTextNode.textContent.length);
            } else {
                range.setStart(chatInput, chatInput.childNodes.length);
                range.setEnd(chatInput, chatInput.childNodes.length);
            }
            
            selection.removeAllRanges();
            selection.addRange(range);
            
            for (let i = 0; i < initialLength + 10; i++) {
                chatInput.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Backspace',
                    code: 'Backspace',
                    keyCode: 8,
                    which: 8,
                    bubbles: true,
                    cancelable: true
                }));
                
                chatInput.dispatchEvent(new KeyboardEvent('keyup', {
                    key: 'Backspace',
                    code: 'Backspace',
                    keyCode: 8,
                    which: 8,
                    bubbles: true,
                    cancelable: true
                }));
                
                if (i % 5 === 0) {
                    await sleep(10);
                }
            }
            
            await sleep(100);
        }
        
        if (chatInput.textContent.length > 0) {
            
            while (chatInput.firstChild) {
                chatInput.removeChild(chatInput.firstChild);
            }
            
            chatInput.innerHTML = '';
            chatInput.textContent = '';
            chatInput.innerText = '';
            
            const p = document.createElement('p');
            p.setAttribute('class', '');
            const br = document.createElement('br');
            br.setAttribute('data-lexical-text', 'true');
            p.appendChild(br);
            chatInput.appendChild(p);
            
            const eventTypes = [
                'input', 'change', 'keyup', 'keydown', 'textInput', 
                'compositionend', 'compositionstart', 'beforeinput'
            ];
            
            eventTypes.forEach(eventType => {
                try {
                    chatInput.dispatchEvent(new Event(eventType, { 
                        bubbles: true, 
                        cancelable: true 
                    }));
                } catch (e) {}
            });
            
            try {
                chatInput.dispatchEvent(new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    inputType: 'deleteContentBackward',
                    data: null
                }));
            } catch (e) {
                console.warn('InputEvent failed:', e);
            }
        }
        
        const finalRange = document.createRange();
        const finalSelection = window.getSelection();
        finalRange.setStart(chatInput, 0);
        finalRange.collapse(true);
        finalSelection.removeAllRanges();
        finalSelection.addRange(finalRange);
        
    } catch (error) {
        console.error('Aggressive clear failed:', error);
    }
}

async function clearChatInput(chatInput) {
    try {
        chatInput.focus();
        await sleep(50);
        
        try {
            chatInput.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'a',
                code: 'KeyA',
                keyCode: 65,
                which: 65,
                ctrlKey: true,
                bubbles: true,
                cancelable: true
            }));
            
            await sleep(50);
            
            chatInput.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Delete',
                code: 'Delete',
                keyCode: 46,
                which: 46,
                bubbles: true,
                cancelable: true
            }));
            
            await sleep(50);
            
            chatInput.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Backspace',
                code: 'Backspace',
                keyCode: 8,
                which: 8,
                bubbles: true,
                cancelable: true
            }));
            
            await sleep(100);
            
        } catch (keyError) {
            console.warn('Keyboard simulation failed:', keyError);
        }
        
        if (chatInput.textContent.length > 0) {
            await aggressiveClearChatInput(chatInput);
        }
        
    } catch (error) {
        console.error('All clear methods failed:', error);
    }
}

async function tagEveryone(clearExisting = false, speed = 'normal') {
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
        await sleep(100);
        if (clearExisting) {
            await clearChatInput(chatInput);
            await sleep(200);
        } else {
            if (chatInput.textContent.length > 0 && !chatInput.textContent.endsWith(' ')) {
                document.execCommand('insertText', false, ' ');
                await sleep(50);
            }
        }

        for (let i = 0; i < participants.length; i++) {
            const participant = participants[i];
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
    const specificSelectors = [
        'span.selectable-text.copyable-text[title]',
        '#main > header span.selectable-text.copyable-text',
        'div[data-testid="conversation-header"] span.xlyipyv.selectable-text.copyable-text'
    ];

    for (const selector of specificSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent && element.textContent.includes(',')) {
            const text = element.textContent.trim();
            if (text.length > 500 || 
                text.toLowerCase().includes('privacy') || 
                text.toLowerCase().includes('settings') ||
                text.toLowerCase().includes('about information')) {
                continue;
            }
            return text;
        }
    }

    const titleSpans = document.querySelectorAll('span[title]');
    for (const span of titleSpans) {
        const title = span.getAttribute('title');
        if (title && title.includes(',') && 
            !span.closest('[data-testid="conversation-info-header-chat-status"]') &&
            !title.toLowerCase().includes('privacy') &&
            title.length < 500) {
            
            if (span.classList.contains('selectable-text') && span.classList.contains('copyable-text')) {
                return title;
            }
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

setTimeout(init, 2000);