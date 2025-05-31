console.log('WhatsApp Everyone Tagger Extension loaded');

let tagButton = null;
let isGroupChat = false;
let showInlineButton = true;

// Initialize the extension
function init() {
    console.log('Initializing WhatsApp Everyone Tagger...');
    
    // Load user preferences
    chrome.storage.local.get(['showInlineButton'], function(result) {
        showInlineButton = result.showInlineButton !== false; // default to true
        checkForGroupChat();
        if (showInlineButton) {
            injectTagButton();
        }
    });
    
    // Monitor for navigation changes
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

// Check if current chat is a group chat
function checkForGroupChat() {
    const participantsText = getParticipantsText();
    const wasGroupChat = isGroupChat;
    isGroupChat = participantsText && participantsText.includes(',');
    
    if (wasGroupChat !== isGroupChat) {
        if (isGroupChat && showInlineButton) {
            console.log('Group chat detected');
            injectTagButton();
        } else {
            console.log('Not a group chat or no chat open');
            removeTagButton();
        }
    }
}

// Inject the tag button into WhatsApp Web interface
function injectTagButton() {
    if (tagButton || !isGroupChat || !showInlineButton) return;
    
    // Find the footer/message input area
    const footer = document.querySelector('footer') || document.querySelector('[data-testid="conversation-compose-box-input"]')?.closest('div');
    
    if (!footer) {
        console.log('Footer not found, retrying...');
        setTimeout(injectTagButton, 1000);
        return;
    }
    
    // Create a container for the button positioned above the input area
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        position: absolute;
        top: -45px;
        right: 10px;
        z-index: 1001;
        pointer-events: none;
    `;
    
    // Create the tag button
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
        tagButton.style.background = '#017c5c';
        tagButton.style.transform = 'scale(1.05)';
        tagButton.style.boxShadow = '0 4px 12px rgba(0,168,132,0.4)';
    };
    
    tagButton.onmouseout = () => {
        tagButton.style.background = '#00a884';
        tagButton.style.transform = 'scale(1)';
        tagButton.style.boxShadow = '0 2px 8px rgba(0,168,132,0.3)';
    };
    
    tagButton.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await handleTagButtonClick();
    };
    
    // Add button to container and container to footer
    buttonContainer.appendChild(tagButton);
    footer.style.position = 'relative'; // Ensure footer has relative positioning
    footer.appendChild(buttonContainer);
    
    console.log('Tag button injected above input area');
}

// Remove the tag button
function removeTagButton() {
    if (tagButton) {
        // Remove the container if it exists, otherwise just the button
        const container = tagButton.parentElement;
        if (container && container !== document.body) {
            container.remove();
        } else {
            tagButton.remove();
        }
        tagButton = null;
        console.log('Tag button removed');
    }
}

// Handle tag button click
async function handleTagButtonClick() {
    if (!tagButton) return;
    
    const originalText = tagButton.innerHTML;
    tagButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="animation: spin 1s linear infinite;">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
        <span style="margin-left: 5px;">Tagging...</span>
    `;
    tagButton.disabled = true;
    tagButton.style.background = '#8696a0';
    
    // Add spinning animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    try {
        // Get saved preferences
        const result = await chrome.storage.local.get(['tagSpeed', 'clearExisting']);
        const speed = result.tagSpeed || 'normal';
        const clearExisting = result.clearExisting !== false; // default to true
        
        await tagEveryone(clearExisting, speed);
        
        // Success feedback
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
                tagButton.style.background = '#00a884';
                tagButton.disabled = false;
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error tagging everyone:', error);
        
        // Error feedback
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
                tagButton.style.background = '#00a884';
                tagButton.disabled = false;
            }
        }, 3000);
    }
    
    document.head.removeChild(style);
}

// Original message listener for popup compatibility
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
        '.xisnujt span.xlyipyv'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent && element.textContent.includes(',')) {
            return element.textContent;
        }
    }

    const titleSpans = document.querySelectorAll('span[title]');
    for (const span of titleSpans) {
        const title = span.getAttribute('title');
        if (title && title.includes(',') && !span.closest('[data-testid="conversation-info-header-chat-status"]')) {
            return title;
        }
    }

    const allHeaders = document.querySelectorAll('header span');
    for (const header of allHeaders) {
        if (header.closest('[data-testid*="status"]') || header.closest('[data-testid*="typing"]')) {
            continue;
        }
        
        if (header.textContent && header.textContent.includes(',')) {
            if (!header.textContent.includes('...') && 
                !header.parentElement?.className?.includes('status')) {
                return header.textContent;
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Also initialize after a short delay to handle dynamic content
setTimeout(init, 2000);