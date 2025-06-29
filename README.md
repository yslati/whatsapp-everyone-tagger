# WhatsApp Everyone Tagger

![WhatsApp Everyone Tagger](images/icon128.png)

A Chrome extension that allows you to tag all members in a WhatsApp group chat with a single click.

## Features

- ✅ **Universal Language Support** - Works in any language (English, French, Spanish, Arabic, etc.)
- ✅ **Smart Group Detection** - Automatically detects group chats vs individual chats
- ✅ **International Phone Support** - Properly handles international numbers like +212 xxx-xxx-xxx
- ✅ **Inline "@everyone" button** - Appears directly next to the send button in group chats
- ✅ **Speed control** - Choose between Fast, Normal, or Slow tagging speeds
- ✅ **Smart text handling** - Option to clear existing text or append the tags
- ✅ **Robust participant detection** - Works with community groups, large groups, and all group types
- ✅ **Advanced filtering** - Automatically excludes group names and invalid entries
- ✅ **Saves preferences** - Remembers your settings (speed, button visibility, text clearing)
- ✅ **Works with latest WhatsApp Web** - Compatible with all WhatsApp Web updates
- ✅ **Simple and intuitive interface** - Easy to use for everyone
- ✅ **Lightweight and fast** - Minimal impact on browser performance

## Installation

### From Chrome Web Store (Recommended)

1. Visit [WhatsApp Everyone Tagger on the Chrome Web Store](https://chromewebstore.google.com/detail/afncdbgiiinphhonknflambmlobgpdlo?utm_source=item-share-cb)
2. Click "Add to Chrome"
3. Confirm by clicking "Add extension"

### Manual Installation (Developer Mode)

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the top right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension is now installed and ready to use

## How to Use

### Method 1: Inline Button (Recommended)

1. Open [WhatsApp Web](https://web.whatsapp.com/) in your browser
2. Open a group chat where you want to tag everyone
3. Look for the **"@everyone"** button that appears above the message input area
4. Click the button and wait for all members to be tagged
5. Add your message and send!

### Method 2: Extension Popup

1. Open [WhatsApp Web](https://web.whatsapp.com/) in your browser
2. Open a group chat where you want to tag everyone
3. Click the WhatsApp Everyone Tagger extension icon in your toolbar
4. Choose your preferences:
   - **Clear existing text**: Whether to clear the message input before tagging (unchecked by default)
   - **Show "@everyone" button**: Toggle the inline button visibility
   - **Speed**: Select Fast, Normal (recommended), or Slow tagging speed
5. Click the "Tag Everyone in Group" button
6. All group members will be tagged in the input field
7. Add your message if needed and send!

### Settings & Preferences

- **Clear existing text**: Disabled by default - tags will be appended to existing text
- **Speed Options**:
  - **Fast**: Quick tagging, best for smaller groups (may be less reliable)
  - **Normal**: Balanced speed, recommended for most use cases
  - **Slow**: More reliable for large groups or slower connections
- **Inline Button**: Show/hide the "@everyone" button next to the send button

## Language Support

The extension works seamlessly in **any language**:

- 🇺🇸 **English**: "You" detection
- 🇫🇷 **French**: "Vous", "Toi" detection  
- 🇪🇸 **Spanish**: "Tú" detection
- 🇩🇪 **German**: "Du", "Sie" detection
- 🇸🇦 **Arabic**: "أنت" detection
- 🇷🇺 **Russian**: "Ты", "Вы" detection
- 🇯🇵 **Japanese**: "あなた" detection
- 🇰🇷 **Korean**: "당신" detection
- And many more...

No configuration needed - the extension automatically adapts to your WhatsApp language!

## Group Type Compatibility

Works with **all types** of WhatsApp groups:

- ✅ **Regular Groups** - Standard WhatsApp groups
- ✅ **Large Groups** - Groups with 100+ members  
- ✅ **Community Groups** - WhatsApp Community sub-groups
- ✅ **International Groups** - Mixed phone numbers and names
- ✅ **Multilingual Groups** - Groups with members from different countries

## Screenshots

![screenshot](example/example.png)

## Troubleshooting

### "Could not establish connection" error
If you installed the extension while WhatsApp Web was already open, you'll need to reload the page. The extension will prompt you to do this automatically.

### "Could not find group members list" error
This has been **fixed in v1.4.0**! The new version works with all group types including community groups and large groups.

### Tags appearing in search bar
The extension automatically detects and avoids the search bar. If you experience issues, try updating to the latest version.

### Clear text not working
The extension uses advanced clearing methods specifically designed for WhatsApp's rich text editor. If clearing doesn't work:
- Try refreshing the WhatsApp Web page
- Ensure you're in a group chat (not individual chat)
- Check the browser console (F12) for any error messages

### Inline button not showing
- Make sure you're in a group chat (button only appears in groups)
- Check that "Show @everyone button" is enabled in the extension popup
- Try refreshing the WhatsApp Web page

### Tagging seems slow or incomplete
- Try using "Slow" speed setting for better reliability
- Ensure you have a stable internet connection
- For very large groups (50+ members), "Slow" speed is recommended

### International phone numbers not being tagged
**Fixed in v1.4.0**! The extension now properly preserves the '+' prefix for international numbers, ensuring they work correctly with WhatsApp's tagging system.

### First group member missing
**Fixed in v1.4.0**! The improved participant detection prevents the first member from being incorrectly filtered out.

## Why This Extension?

WhatsApp doesn't offer a built-in way to tag all members in a group chat at once. This can be time-consuming in large groups when you need everyone's attention. WhatsApp Everyone Tagger solves this problem with a single click!

## Compatibility

- Works with Google Chrome (version 88+)
- Compatible with the latest version of WhatsApp Web
- Does not work with WhatsApp desktop app

## Privacy

This extension:
- **Does not collect or store any user data**
- **Does not send any information to remote servers**
- **Only interacts with the WhatsApp Web interface**
- **Requires minimal permissions** (only accesses the active WhatsApp Web tab)
- **Saves preferences locally** in your browser only

See [PRIVACY.md](PRIVACY.md) for complete privacy policy.

## Recent Updates

### Version 1.4.0 (Latest) - Major Universal Compatibility Update
- ✨ **Universal language support** - Now works in any language automatically
- 🔧 **Fixed participant detection** - Works with community groups and large groups
- 🔧 **Fixed international phone numbers** - Proper +212 xxx format support
- 🔧 **Fixed first member loss** - No longer loses first group member
- 🛠️ **Smart group name filtering** - Automatically excludes group names
- 🌍 **Enhanced Unicode support** - Names in any script (Arabic, Chinese, etc.)

### Version 1.3.1
- 🔧 **Fixed clear existing text functionality** - Now works reliably with WhatsApp's editor
- 🔧 **Changed default behavior** - "Clear existing text" is now unchecked by default
- ✨ **Improved text handling** - Better support for appending tags to existing messages

### Version 1.3.0
- ✨ **New inline "@everyone" button** - Appears directly next to the send button
- ⚡ **Improved user experience** - No need to open extension popup
- 🎛️ **Enhanced settings** - Toggle button visibility and save preferences

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes in each version.

## Author

- **[Yassin Slati]** - [yslati](https://github.com/yslati)

## License

This project is completely open source and free to use, modify, and distribute. No copyright restrictions apply.

- You are free to use it for any purpose
- You can modify and adapt it as needed
- You can distribute it to others
- No attribution is required (though always appreciated)

## Support

If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/yslati/whatsapp-everyone-tagger/issues) on the GitHub repository.

### Common Questions

**Q: Does this work in individual chats?**
A: No, this extension only works in group chats where you need to tag multiple people.

**Q: Can I customize which members to tag?**
A: Currently, the extension tags all group members. Individual member selection is a planned feature for future updates.

**Q: Is this safe to use?**
A: Yes, the extension is completely local and doesn't send any data externally. It only simulates typing in the WhatsApp Web interface.

**Q: Does it work in my language?**
A: Yes! Version 1.4.0 supports all languages automatically. Whether your WhatsApp is in English, Arabic, French, Spanish, or any other language, the extension will work perfectly.

**Q: What about community groups?**
A: Yes, the extension now works with all types of groups including WhatsApp Community sub-groups and large groups.

---

Made with ❤️ for WhatsApp group admins and members worldwide

**Current Version: 1.4.0** - [Download from Chrome Web Store](https://chromewebstore.google.com/detail/afncdbgiiinphhonknflambmlobgpdlo?utm_source=item-share-cb)