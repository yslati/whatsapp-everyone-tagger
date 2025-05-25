# Changelog

All notable changes to WhatsApp Everyone Tagger will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-05-25

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