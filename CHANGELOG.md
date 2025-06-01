# Changelog

All notable changes to WhatsApp Everyone Tagger will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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