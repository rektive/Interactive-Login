document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const html = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const kindChar = document.getElementById('kind-char');
    const vampChar = document.getElementById('vamp-char');
    
    // Irises
    const kindIrisL = document.getElementById('kind-iris-l');
    const kindIrisR = document.getElementById('kind-iris-r');
    const vampIrisL = document.getElementById('vamp-iris-l');
    const vampIrisR = document.getElementById('vamp-iris-r');

    // Form inputs & UI elements
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const caretMeasurer = document.getElementById('caret-measurer');
    const cardTitle = document.getElementById('card-title');
    const cardSubtitle = document.getElementById('card-subtitle');
    const actionBtn = document.getElementById('action-btn');

    let isTyping = false;
    let isEyesCovered = false;
    let isProximityActive = false;

    // ----------------------------------------------------
    // 1. SIMPLE THEME TOGGLE ("Light" / "Dark")
    // ----------------------------------------------------
    themeBtn.addEventListener('click', () => {
        const isCurrentlyDark = html.getAttribute('data-theme') === 'dark';

        if (isCurrentlyDark) {
            html.setAttribute('data-theme', 'light');
            themeBtn.textContent = 'Dark';
            cardTitle.textContent = 'Good Morning!';
            cardSubtitle.textContent = 'Ready to continue your adventure?';
            actionBtn.textContent = 'Enter Realm';
        } else {
            html.setAttribute('data-theme', 'dark');
            themeBtn.textContent = 'Light';
            cardTitle.textContent = 'Midnight Vault';
            cardSubtitle.textContent = 'Speak the incantation, mortal...';
            actionBtn.textContent = 'Surrender Soul';
        }

        refreshStateAnimations();
    });

    // ----------------------------------------------------
    // 2. MATHEMATICAL PUPIL TARGETING ENGINE
    // ----------------------------------------------------
    function moveIrisesToTarget(screenTargetX, screenTargetY) {
        if (isEyesCovered) return;

        const isDark = html.getAttribute('data-theme') === 'dark';
        const pairs = isDark 
            ? [ { iris: vampIrisL, centerRelX: 128, centerRelY: 163 }, { iris: vampIrisR, centerRelX: 192, centerRelY: 163 } ]
            : [ { iris: kindIrisL, centerRelX: 130, centerRelY: 164 }, { iris: kindIrisR, centerRelX: 190, centerRelY: 164 } ];

        const charSvg = isDark ? vampChar : kindChar;
        const svgRect = charSvg.getBoundingClientRect();
        const scale = svgRect.width / 320;

        pairs.forEach(({ iris, centerRelX, centerRelY }) => {
            const eyeScreenX = svgRect.left + (centerRelX * scale);
            const eyeScreenY = svgRect.top + (centerRelY * scale);

            const deltaX = screenTargetX - eyeScreenX;
            const deltaY = screenTargetY - eyeScreenY;
            const angle = Math.atan2(deltaY, deltaX);

            const maxRadius = 6.5; 
            const distance = Math.min(Math.hypot(deltaX, deltaY) / 18, maxRadius);

            const transX = Math.cos(angle) * distance;
            const transY = Math.sin(angle) * distance;

            iris.style.transform = `translate(${transX}px, ${transY}px)`;
        });
    }

    // ----------------------------------------------------
    // 3. CURSOR TRACKING & PROXIMITY DETECTION (Bite vs Nuzzle)
    // ----------------------------------------------------
    window.addEventListener('mousemove', (e) => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        const activeChar = isDark ? vampChar : kindChar;
        const headRect = activeChar.getBoundingClientRect();
        
        // Approximate head center
        const headCenterX = headRect.left + headRect.width / 2;
        const headCenterY = headRect.top + headRect.height * 0.45;

        const distToHead = Math.hypot(e.clientX - headCenterX, e.clientY - headCenterY);

        // Proximity threshold: within 80px of head center
        if (distToHead < 80 && !isEyesCovered && !isTyping) {
            if (!isProximityActive) {
                isProximityActive = true;
                if (isDark) {
                    vampChar.classList.add('vampire-lunge');
                } else {
                    kindChar.classList.add('kind-nuzzle');
                }
            }
        } else {
            if (isProximityActive) {
                isProximityActive = false;
                vampChar.classList.remove('vampire-lunge');
                kindChar.classList.remove('kind-nuzzle');
            }
        }

        // Standard eye tracking if not currently typing or eyes covered
        if (!isTyping && !isEyesCovered) {
            moveIrisesToTarget(e.clientX, e.clientY);
        }
    });

    // ----------------------------------------------------
    // 4. PRECISE CARET / LAST-TYPED-DIGIT TRACKING
    // ----------------------------------------------------
    function calculateInputCaretScreenCoords(inputElement) {
        const inputRect = inputElement.getBoundingClientRect();
        const style = window.getComputedStyle(inputElement);

        caretMeasurer.style.font = style.font;
        caretMeasurer.style.letterSpacing = style.letterSpacing;
        caretMeasurer.textContent = inputElement.value || '';

        const measuredTextWidth = caretMeasurer.getBoundingClientRect().width;
        const paddingLeft = parseFloat(style.paddingLeft) || 18;

        const caretX = Math.min(
            inputRect.left + paddingLeft + measuredTextWidth,
            inputRect.right - 25
        );
        const caretY = inputRect.top + (inputRect.height / 2);

        return { x: caretX, y: caretY };
    }

    function refreshStateAnimations() {
        const isDark = html.getAttribute('data-theme') === 'dark';

        // Clear all expression states
        kindChar.classList.remove('curious-kind', 'eyes-covered-kind', 'kind-nuzzle');
        vampChar.classList.remove('curious-vamp', 'eyes-covered-vamp', 'vampire-lunge');
        isProximityActive = false;

        if (isEyesCovered) {
            if (isDark) vampChar.classList.add('eyes-covered-vamp');
            else kindChar.classList.add('eyes-covered-kind');
            return;
        }

        if (isTyping) {
            if (isDark) vampChar.classList.add('curious-vamp');
            else kindChar.classList.add('curious-kind');
        }
    }

    function handleTypingEvent(e) {
        const input = e.target;
        if (input.value.length > 0) {
            isTyping = true;
            refreshStateAnimations();
            const caretCoords = calculateInputCaretScreenCoords(input);
            moveIrisesToTarget(caretCoords.x, caretCoords.y);
        } else {
            isTyping = false;
            refreshStateAnimations();
        }
    }

    [usernameInput, passwordInput].forEach(field => {
        field.addEventListener('input', handleTypingEvent);
        field.addEventListener('focus', (e) => {
            if (e.target.value.length > 0) {
                isTyping = true;
                refreshStateAnimations();
                const coords = calculateInputCaretScreenCoords(e.target);
                moveIrisesToTarget(coords.x, coords.y);
            }
        });
        field.addEventListener('blur', () => {
            isTyping = false;
            refreshStateAnimations();
        });
    });

    // ----------------------------------------------------
    // 5. SHOW PASSWORD -> COVER EYES WITH HANDS & LEAN
    // ----------------------------------------------------
    togglePasswordBtn.addEventListener('click', () => {
        const isPasswordHidden = passwordInput.type === 'password';

        if (isPasswordHidden) {
            passwordInput.type = 'text';
            isEyesCovered = true;
            togglePasswordBtn.classList.add('active');
            refreshStateAnimations();
        } else {
            passwordInput.type = 'password';
            isEyesCovered = false;
            togglePasswordBtn.classList.remove('active');
            refreshStateAnimations();

            if (document.activeElement === passwordInput && passwordInput.value.length > 0) {
                isTyping = true;
                refreshStateAnimations();
                const coords = calculateInputCaretScreenCoords(passwordInput);
                moveIrisesToTarget(coords.x, coords.y);
            }
        }
    });
});