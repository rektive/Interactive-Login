document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const html = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    const stageContainer = document.getElementById('stage-container');
    const kindChar = document.getElementById('kind-char');
    const vampChar = document.getElementById('vamp-char');
    const flightBat = document.getElementById('flight-bat');
    
    // Irises
    const kindIrisL = document.getElementById('kind-iris-l');
    const kindIrisR = document.getElementById('kind-iris-r');
    const vampIrisL = document.getElementById('vamp-iris-l');
    const vampIrisR = document.getElementById('vamp-iris-r');

    // Dashboard
    const dashboardScreen = document.getElementById('dashboard-screen');
    const dashAvatar = document.getElementById('dash-avatar');
    const dashTitle = document.getElementById('dash-title');
    const dashMsg = document.getElementById('dash-msg');
    const logoutBtn = document.getElementById('logout-btn');

    // Form inputs & UI elements
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const caretMeasurer = document.getElementById('caret-measurer');
    const cardTitle = document.getElementById('card-title');
    const cardSubtitle = document.getElementById('card-subtitle');

    let isTyping = false;
    let isEyesCovered = false;
    let isProximityActive = false;
    let isTransitioning = false;

    // ----------------------------------------------------
    // 1. THEME TOGGLE ("Light" / "Dark")
    // ----------------------------------------------------
    themeBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        const isCurrentlyDark = html.getAttribute('data-theme') === 'dark';

        if (isCurrentlyDark) {
            html.setAttribute('data-theme', 'light');
            themeBtn.textContent = 'Dark';
            cardTitle.textContent = 'Good Morning!';
            cardSubtitle.textContent = 'Ready to continue your adventure?';
        } else {
            html.setAttribute('data-theme', 'dark');
            themeBtn.textContent = 'Light';
            cardTitle.textContent = 'Midnight Vault';
            cardSubtitle.textContent = 'Speak the incantation, mortal...';
        }

        refreshStateAnimations();
    });

    // ----------------------------------------------------
    // 2. MATHEMATICAL IRIS / EYE TARGETING
    // ----------------------------------------------------
    function moveIrisesToTarget(screenTargetX, screenTargetY) {
        if (isEyesCovered || isTransitioning) return;

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
    // 3. PROXIMITY DETECTION (Bares Teeth vs Gentle Glow)
    // ----------------------------------------------------
    window.addEventListener('mousemove', (e) => {
        if (isTransitioning) return;
        const isDark = html.getAttribute('data-theme') === 'dark';
        const activeChar = isDark ? vampChar : kindChar;
        const headRect = activeChar.getBoundingClientRect();
        
        const headCenterX = headRect.left + headRect.width / 2;
        const headCenterY = headRect.top + headRect.height * 0.45;
        const distToHead = Math.hypot(e.clientX - headCenterX, e.clientY - headCenterY);

        if (distToHead < 75 && !isEyesCovered && !isTyping) {
            if (!isProximityActive) {
                isProximityActive = true;
                if (isDark) {
                    vampChar.classList.add('vamp-bare-teeth');
                } else {
                    kindChar.classList.add('kind-gentle-glow');
                }
            }
        } else {
            if (isProximityActive) {
                isProximityActive = false;
                vampChar.classList.remove('vamp-bare-teeth');
                kindChar.classList.remove('kind-gentle-glow');
            }
        }

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

        kindChar.classList.remove('curious-kind', 'eyes-covered-kind', 'kind-gentle-glow');
        vampChar.classList.remove('curious-vamp', 'eyes-covered-vamp', 'vamp-bare-teeth');
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
        if (isTransitioning) return;
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
    // 5. SHOW PASSWORD -> COVER EYES WITH HANDS
    // ----------------------------------------------------
    togglePasswordBtn.addEventListener('click', () => {
        if (isTransitioning) return;
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

    // ----------------------------------------------------
    // 6. LOGIN: JUMP OUT -> TRANSFORM TO BAT -> FLY AWAY
    // ----------------------------------------------------
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isTransitioning) return;
        isTransitioning = true;

        const isDark = html.getAttribute('data-theme') === 'dark';
        const userEntered = usernameInput.value || (isDark ? 'Lord of Shadows' : 'Noble Adventurer');

        if (isDark) {
            vampChar.classList.add('vamp-jump-out');

            setTimeout(() => {
                flightBat.classList.add('bat-fly-away');
            }, 260);

            setTimeout(() => {
                dashAvatar.textContent = '🦇';
                dashTitle.textContent = `Welcome, ${userEntered}`;
                dashMsg.textContent = 'The nocturnal realm bends to your dark command.';
                dashboardScreen.classList.add('active');
            }, 1200);

        } else {
            kindChar.classList.add('kind-ascend-fly');

            setTimeout(() => {
                dashAvatar.textContent = '☀️';
                dashTitle.textContent = `Greetings, ${userEntered}!`;
                dashMsg.textContent = 'The light shines brightly upon your quest.';
                dashboardScreen.classList.add('active');
            }, 900);
        }
    });

    // ----------------------------------------------------
    // 7. LOGOUT / RESET SEQUENCE
    // ----------------------------------------------------
    logoutBtn.addEventListener('click', () => {
        dashboardScreen.classList.remove('active');

        vampChar.classList.remove('vamp-jump-out');
        flightBat.classList.remove('bat-fly-away');
        vampChar.style.opacity = '1';

        kindChar.classList.remove('kind-ascend-fly');
        kindChar.style.opacity = '1';

        passwordInput.value = '';
        passwordInput.type = 'password';
        togglePasswordBtn.classList.remove('active');
        isEyesCovered = false;
        isTyping = false;
        isTransitioning = false;
        refreshStateAnimations();
    });
});