# Speech to Text Chrome Extension

A simple and elegant Chrome extension that converts speech to text using the Web Speech API.

## Features

- 🎤 **Speech Recognition**: Click to start/stop recording your voice
- 📝 **Text Area**: Large, resizable text area for your transcribed content
- 🗑️ **Clear Function**: Instantly clear all text
- 📋 **Copy to Clipboard**: One-click copying to your clipboard
- 💾 **Auto-save**: Text is automatically saved and restored when you reopen the extension
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## Installation

1. **Download the extension files**:
   - `manifest.json`
   - `popup.html`
   - `popup.js`

2. **Create the folder structure**:
   ```
   speech-to-text-extension/
   ├── manifest.json
   ├── popup.html
   ├── popup.js
   └── icons/ (optional)
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
   ```

3. **Install in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select your extension folder
   - The extension should now appear in your Chrome toolbar

## Usage

1. **Click the extension icon** in your Chrome toolbar to open the popup
2. **Grant microphone permission** when prompted (first time only)
3. **Click "Start Recording"** and begin speaking
4. **Watch your words appear** in real-time in the text area
5. **Click "Stop Recording"** when finished
6. **Use the buttons** to:
   - Clear the text area
   - Copy all text to clipboard
   - Continue editing the text manually

## Browser Compatibility

- Chrome (recommended)
- Edge
- Other Chromium-based browsers

**Note**: Requires microphone access and Web Speech API support.

## Privacy

- No data is sent to external servers
- All processing happens locally in your browser
- Text is only saved locally in your browser's storage
- Microphone access is only used during active recording

## Troubleshooting

**Microphone not working?**
- Check if Chrome has microphone permission
- Ensure your microphone is working in other applications
- Try refreshing the extension or restarting Chrome

**No text appearing?**
- Make sure you're speaking clearly
- Check if your microphone is muted
- Verify your system's default microphone is set correctly

**Extension not loading?**
- Make sure all files are in the same folder
- Verify the manifest.json file is valid
- Check the Chrome Extensions page for error messages

## Customization

You can customize the extension by modifying:
- **Language**: Change `this.recognition.lang = 'en-US'` in popup.js to your preferred language code
- **Colors**: Modify the CSS gradients and colors in popup.html
- **Size**: Adjust the popup dimensions in the CSS
- **Auto-save**: Modify the save behavior in the saveText() function

## Permissions

The extension only requires:
- `activeTab`: For basic extension functionality
- Microphone access (requested when first used)

No additional permissions or network access required.
