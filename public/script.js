document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const html = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const avatar = document.getElementById('avatar');
    const leftEye = document.getElementById('eye-left');
    const rightEye = document.getElementById('eye-right');
    const leftIris = leftEye.querySelector('.iris');
    const rightIris = rightEye.querySelector('.iris');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const textMeasurer = document.getElementById('text-width-calculator');
    const titleText = document.getElementById('title-text');
    const subtitleText = document.getElementById('subtitle-text');

    let isTyping = false;
    let eyesShut = false;

    // ----------------------------------------------------
    // 1. THEME SWITCHING (KIND <-> VILLAIN)
    // ----------------------------------------------------
    themeToggleBtn.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        if (isDark) {
            html.setAttribute('data-theme', 'light');
            themeToggleBtn.querySelector('.icon').textContent = '☀️';
            themeToggleBtn.querySelector('.label').textContent = 'Switch to Villain';
            titleText.textContent = 'Welcome Back';
            subtitleText.textContent = 'Enter your credentials to continue';
        } else {
            html.setAttribute('data-theme', 'dark');
            themeToggleBtn.querySelector('.icon').textContent = '🌙';
            themeToggleBtn.querySelector('.label').textContent = 'Switch to Guardian';
            titleText.textContent = 'Access the Vault';
            subtitleText.textContent = 'Identify yourself or be purged';
        }
        updateCuriosityClass();
    });

    // ----------------------------------------------------
    // 2. MATHEMATICAL PUPIL / IRIS POSITIONING
    // ----------------------------------------------------
    function setEyeTarget(targetX, targetY) {
        if (eyesShut) return;

        [ { eye: leftEye, iris: leftIris }, { eye: rightEye, iris: rightIris } ].forEach(({ eye, iris }) => {
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            const deltaX = targetX - eyeCenterX;
            const deltaY = targetY - eyeCenterY;
            const angle = Math.atan2(deltaY, deltaX);

            // Maximum iris travel distance (bounds check)
            const maxRadius = (rect.width - iris.offsetWidth) / 1.7;
            const distance = Math.min(Math.hypot(deltaX, deltaY), maxRadius);

            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;

            iris.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    // ----------------------------------------------------
    // 3. CURSOR TRACKING (IDLE / DEFAULT MODE)
    // ----------------------------------------------------
    window.addEventListener('mousemove', (e) => {
        // Cursor tracking only takes place when the user is NOT actively typing
        if (isTyping || eyesShut) return;
        setEyeTarget(e.clientX, e.clientY);
    });

    // ----------------------------------------------------
    // 4. KEYSTROKE & DIGIT TRACKING ENGINE
    // ----------------------------------------------------
    function updateCuriosityClass() {
        avatar.classList.remove('curious-kind', 'curious-villain');
        if (!isTyping || eyesShut) return;

        const currentTheme = html.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            avatar.classList.add('curious-villain');
        } else {
            avatar.classList.add('curious-kind');
        }
    }

    function calculateCaretScreenPosition(inputElement) {
        const inputRect = inputElement.getBoundingClientRect();

        // Copy font styles to matching measurer span
        const style = window.getComputedStyle(inputElement);
        textMeasurer.style.font = style.font;
        textMeasurer.style.letterSpacing = style.letterSpacing;
        textMeasurer.textContent = inputElement.value || '';

        // Measured text width plus input left padding
        const textWidth = textMeasurer.getBoundingClientRect().width;
        const paddingLeft = parseFloat(style.paddingLeft) || 16;

        // Caret coordinate on screen
        const caretX = Math.min(
            inputRect.left + paddingLeft + textWidth,
            inputRect.right - 20
        );
        const caretY = inputRect.top + inputRect.height / 2;

        return { x: caretX, y: caretY };
    }

    function handleTyping(event) {
        const inputElement = event.target;
        if (inputElement.value.length > 0) {
            isTyping = true;
            updateCuriosityClass();
            const caretPos = calculateCaretScreenPosition(inputElement);
            setEyeTarget(caretPos.x, caretPos.y);
        } else {
            isTyping = false;
            updateCuriosityClass();
        }
    }

    [usernameInput, passwordInput].forEach((input) => {
        input.addEventListener('input', handleTyping);
        input.addEventListener('focus', (e) => {
            if (e.target.value.length > 0) {
                isTyping = true;
                updateCuriosityClass();
                const caretPos = calculateCaretScreenPosition(e.target);
                setEyeTarget(caretPos.x, caretPos.y);
            }
        });
        input.addEventListener('blur', () => {
            isTyping = false;
            updateCuriosityClass();
        });
    });

    // ----------------------------------------------------
    // 5. PASSWORD VISIBILITY & EYE CLOSING
    // ----------------------------------------------------
    togglePasswordBtn.addEventListener('click', () => {
        const isCurrentlyPassword = passwordInput.type === 'password';

        if (isCurrentlyPassword) {
            // Reveal password -> Character politely or smugly shuts eyes
            passwordInput.type = 'text';
            eyesShut = true;
            avatar.classList.add('eyes-closed');
            avatar.classList.remove('curious-kind', 'curious-villain');
            togglePasswordBtn.setAttribute('aria-label', 'Hide password');
        } else {
            // Hide password -> Character opens eyes back up
            passwordInput.type = 'password';
            eyesShut = false;
            avatar.classList.remove('eyes-closed');
            togglePasswordBtn.setAttribute('aria-label', 'Show password');

            if (document.activeElement === passwordInput && passwordInput.value.length > 0) {
                isTyping = true;
                updateCuriosityClass();
                const caretPos = calculateCaretScreenPosition(passwordInput);
                setEyeTarget(caretPos.x, caretPos.y);
            }
        }
    });
});