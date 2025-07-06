# Changelog

All notable changes to WhatsApp Everyone Tagger will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-07-06

### Added
- **Welcome page integration** - Opens welcome/tutorial page on first installation
- **Automatic content script injection** - Background service worker automatically injects scripts
- **Smart refresh detection** - Automatically detects when refresh is needed and provides options
- **Auto-refresh functionality** - One-click refresh button for immediate activation
- **Enhanced installation experience** - Seamless setup process for new users
- **Background service worker** - Improved reliability and performance with Manifest V3

### Fixed
- **Major fix**: Eliminated "Could not establish connection" errors on installation
- **Major fix**: Extension now works immediately after installation without manual refresh
- **Major fix**: Automatic script injection into existing WhatsApp Web tabs
- Fixed content script loading issues when extension is installed on open tabs
- Improved error handling for script injection failures

### Changed
- **Breaking change**: Now uses Manifest V3 with service worker instead of background page
- Enhanced popup UI with automatic refresh notifications
- Improved user onboarding with welcome page tutorial
- Better error messages and user guidance
- More robust tab management and script injection

### Technical Improvements
- Implemented background service worker for better resource management
- Added automatic content script injection on tab updates
- Enhanced tab query and management for WhatsApp Web detection
- Improved error handling and logging for debugging
- Better separation of concerns between background and content scripts

### User Experience
- **Smoother installation** - No more manual refresh required after installation
- **Clear guidance** - Visual notifications when refresh is needed
- **One-click fixes** - Automatic refresh button for common issues
- **Better onboarding** - Welcome page with setup instructions
- **Improved reliability** - Background worker ensures consistent functionality

## [1.4.0] - 2025-06-29

### Added
- **Universal language support** - Extension now works in any language (French, Spanish, Arabic, etc.)
- **Advanced participant detection** - Intelligent scoring system to identify participant lists vs group names
- **Comprehensive phone number support** - Handles international formats like +212 xxx-xxx-xxx correctly
- **Smart group name filtering** - Automatically excludes group names from participant tagging

### Fixed
- **Major fix**: Participant detection now works with community groups and large groups
- **Major fix**: Prevents group name contamination in participant lists
- **Major fix**: Preserves first group member who was previously being lost
- **Major fix**: Correctly handles international phone numbers for tagging
- **Major fix**: Language-agnostic current user detection (no longer hardcoded to "You")
- Fixed issue where extension would fail with error "Could not find group members list"
- Fixed phone numbers losing '+' prefix which prevented WhatsApp tagging
- Fixed duplicate participant detection and removal

### Changed
- **Breaking change**: Detection system completely rewritten for better reliability
- Improved participant parsing to handle mixed name/phone number lists
- Enhanced filtering logic to distinguish between group names and participant lists
- Better Unicode support for names in all languages and scripts
- More robust error handling and user feedback

### Technical Improvements
- Prioritizes `title` attribute over `textContent` for cleaner data extraction
- Implements multi-method participant detection with fallback strategies
- Uses semantic DOM structure analysis instead of fragile CSS selectors
- Adds comprehensive participant validation and normalization

## [1.3.1] - 2025-06-01

### Fixed
- **Major fix**: Clear existing text functionality now works reliably with WhatsApp's rich text editor
- Improved text clearing using multiple fallback methods including keyboard simulation and DOM manipulation
- Better cursor positioning after clearing text
- Enhanced event triggering to ensure WhatsApp recognizes text changes

### Changed
- **Breaking change**: "Clear existing text" option is now **unchecked by default** (was previously checked)
- Default behavior now appends tags to existing text instead of clearing first
- Improved text handling when appending tags to existing messages
- Enhanced error handling and debugging capabilities

### Added
- Debug logging for troubleshooting clear functionality
- More robust clearing methods specifically designed for WhatsApp's Lexical editor
- Comprehensive event dispatching for better compatibility
- Aggressive clearing fallback for stubborn text content

## [1.3.0] - 2025-05-31

### Added
- **New inline "@everyone" button** - Appears directly next to the send button in group chats
- Button visibility toggle in extension settings
- Real-time tagging state synchronization between popup and inline button
- Enhanced visual feedback with loading states and animations

### Improved
- Better user experience with direct chat integration
- Reduced need to open extension popup for most operations
- Smoother tagging process with inline controls

### Fixed
- Better content script injection and error handling
- Improved button positioning and styling

## [1.2.0] - 2024-05-25

### Added
- Speed control feature with three options: Fast, Normal (default), and Slow
- User preference saving for speed settings
- Automatic detection when content script is not loaded with reload prompt
- Multilingual support for typing indicator detection

### Fixed
- Extension now correctly targets message input instead of search bar
- Typing indicators (e.g., "user is writing...") are no longer parsed as participants
- Connection error when using extension on already-open WhatsApp Web tabs

### Changed
- Improved chat input detection by checking for footer element
- Better error handling and user feedback

## [1.1.0] - 2024-04-25

### Added
- Option to clear existing text or append tags
- Improved UI with better styling

### Fixed
- Various selector improvements for WhatsApp Web compatibility

## [1.0.0] - 2024-04-23

### Added
- Initial release
- Tag all group members with one click
- Simple and intuitive interface
- Lightweight and fast performance