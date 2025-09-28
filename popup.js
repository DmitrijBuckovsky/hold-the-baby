class SpeechToText {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.textOutput = document.getElementById('textOutput');
        this.startBtn = document.getElementById('startBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.status = document.getElementById('status');
        
        this.initializeRecognition();
        this.bindEvents();
        this.loadSavedText();
    }
    
    initializeRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configuration
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'cs-CZ'; // Set default language to Czech
            
            // Event handlers
            this.recognition.onstart = () => this.onRecognitionStart();
            this.recognition.onresult = (event) => this.onRecognitionResult(event);
            this.recognition.onerror = (event) => this.onRecognitionError(event);
            this.recognition.onend = () => this.onRecognitionEnd();
            
        } else {
            this.showStatus('Speech recognition not supported in this browser', 'error');
            this.startBtn.disabled = true;
        }
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.toggleRecording());
        this.clearBtn.addEventListener('click', () => this.clearText());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        // Auto-save text on change
        this.textOutput.addEventListener('input', () => this.saveText());
    }
    
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    async startRecording() {
        if (!this.recognition) return;
        
        // Check and request microphone permission first
        const permissionState = await this.checkMicrophonePermission();
        
        if (permissionState === 'denied') {
            this.showStatus('Microphone permission denied. Please enable it in browser settings.', 'error');
            this.showPermissionHelp();
            return;
        }
        
        if (permissionState === 'prompt' || permissionState === 'unknown') {
            this.showStatus('Requesting microphone permission...', '');
            const granted = await this.requestMicrophonePermission();
            if (!granted) return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            this.showStatus('Error starting recording: ' + error.message, 'error');
        }
    }
    
    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }
    
    onRecognitionStart() {
        this.isRecording = true;
        this.startBtn.textContent = '⏸️ Stop Recording';
        this.startBtn.style.background = 'linear-gradient(45deg, #ff6b6b, #ee5a52)';
        this.showStatus('Listening... Speak now!', 'recording');
    }
    
    onRecognitionResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Get current cursor position
        const cursorPos = this.textOutput.selectionStart;
        const currentText = this.textOutput.value;
        
        // Insert final transcript at cursor position
        if (finalTranscript) {
            const beforeCursor = currentText.substring(0, cursorPos);
            const afterCursor = currentText.substring(cursorPos);
            this.textOutput.value = beforeCursor + finalTranscript + afterCursor;
            
            // Update cursor position
            const newPos = cursorPos + finalTranscript.length;
            this.textOutput.setSelectionRange(newPos, newPos);
            
            this.saveText();
        }
        
        // Show interim results in status
        if (interimTranscript) {
            this.showStatus(`Interim: "${interimTranscript}"`, 'recording');
        }
    }
    
    onRecognitionError(event) {
        let errorMessage = 'Recognition error occurred';
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                errorMessage = 'No microphone found or access denied.';
                break;
            case 'not-allowed':
                errorMessage = 'Microphone permission denied.';
                break;
            case 'network':
                errorMessage = 'Network error occurred.';
                break;
            case 'service-not-allowed':
                errorMessage = 'Speech service not allowed.';
                break;
            default:
                errorMessage = `Recognition error: ${event.error}`;
        }
        
        this.showStatus(errorMessage, 'error');
    }
    
    onRecognitionEnd() {
        this.isRecording = false;
        this.startBtn.innerHTML = '<span class="mic-icon">🎤</span>Start Recording';
        this.startBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        
        if (this.status.textContent.includes('Interim:') || this.status.classList.contains('recording')) {
            this.showStatus('Recording stopped', 'success');
        }
    }
    
    clearText() {
        this.textOutput.value = '';
        this.textOutput.focus();
        this.saveText();
        this.showStatus('Text cleared', 'success');
    }
    
    async checkMicrophonePermission() {
        try {
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'microphone' });
                return permission.state;
            }
            return 'unknown';
        } catch (error) {
            console.log('Permission API not supported');
            return 'unknown';
        }
    }
    
    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the stream immediately as we only needed permission
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            this.handlePermissionError(error);
            return false;
        }
    }
    
    handlePermissionError(error) {
        let message = 'Microphone access error';
        
        switch (error.name) {
            case 'NotAllowedError':
                message = 'Microphone blocked for this extension. See instructions below.';
                this.showPermissionHelp();
                break;
            case 'NotFoundError':
                message = 'No microphone found. Please connect a microphone and try again.';
                break;
            case 'NotReadableError':
                message = 'Microphone is being used by another application.';
                break;
            case 'SecurityError':
                message = 'Extension needs microphone permission. See instructions below.';
                this.showPermissionHelp();
                break;
            default:
                message = `Microphone error: ${error.message}`;
                // For unknown errors, also show help
                this.showPermissionHelp();
        }
        
        this.showStatus(message, 'error');
    }
    
    showPermissionHelp() {
        // Show additional help for permission issues
        const helpDiv = document.createElement('div');
        helpDiv.innerHTML = `
            <div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; font-size: 11px; line-height: 1.4;">
                <strong>🔧 To enable microphone for this extension:</strong><br><br>
                <strong>Method 1 - Extension Settings:</strong><br>
                1. Right-click the extension icon<br>
                2. Select "This can read and change site data"<br>
                3. Choose "On all sites"<br><br>
                <strong>Method 2 - Chrome Settings:</strong><br>
                1. Go to chrome://extensions/<br>
                2. Find "Speech to Text" extension<br>
                3. Click "Details"<br>
                4. Enable "Allow access to file URLs" if needed<br><br>
                <strong>Method 3 - Site Permissions:</strong><br>
                1. Click the 🔒 or 🛡️ icon in address bar<br>
                2. Set Microphone to "Allow"<br>
                3. Reload this extension popup
            </div>
        `;
        
        // Remove any existing help div
        const existingHelp = document.querySelector('.permission-help');
        if (existingHelp) {
            existingHelp.remove();
        }
        
        helpDiv.className = 'permission-help';
        document.body.appendChild(helpDiv);
        
        // Remove help after 15 seconds
        setTimeout(() => {
            if (helpDiv.parentNode) {
                helpDiv.parentNode.removeChild(helpDiv);
            }
        }, 15000);
    }

    async copyToClipboard() {
        const text = this.textOutput.value;
        
        if (!text.trim()) {
            this.showStatus('No text to copy', 'error');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            this.showStatus('Text copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            this.textOutput.select();
            document.execCommand('copy');
            this.showStatus('Text copied to clipboard!', 'success');
        }
    }
    
    showStatus(message, type = '') {
        this.status.textContent = message;
        this.status.className = 'status ' + type;
        
        // Clear status after 3 seconds (except for recording status)
        if (type !== 'recording') {
            setTimeout(() => {
                if (this.status.textContent === message) {
                    this.status.textContent = 'Ready to record';
                    this.status.className = 'status';
                }
            }, 3000);
        }
    }
    
    saveText() {
        try {
            chrome.storage.local.set({ speechText: this.textOutput.value });
        } catch (error) {
            // Fallback to localStorage if chrome storage is not available
            localStorage.setItem('speechText', this.textOutput.value);
        }
    }
    
    loadSavedText() {
        try {
            chrome.storage.local.get(['speechText'], (result) => {
                if (result.speechText) {
                    this.textOutput.value = result.speechText;
                }
            });
        } catch (error) {
            // Fallback to localStorage
            const savedText = localStorage.getItem('speechText');
            if (savedText) {
                this.textOutput.value = savedText;
            }
        }
    }
}

// Initialize the application when the popup loads
document.addEventListener('DOMContentLoaded', () => {
    new SpeechToText();
});
