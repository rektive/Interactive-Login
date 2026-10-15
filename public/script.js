// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const character = document.getElementById('character');
    const eyes = document.querySelectorAll('.eye');
    const pupils = document.querySelectorAll('.pupil');

    // Theme Switcher
    themeToggle.addEventListener('click', () => {
        if (htmlElement.getAttribute('data-theme') === 'light') {
            htmlElement.setAttribute('data-theme', 'dark');
            themeToggle.textContent = 'Switch to Light Theme';
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            themeToggle.textContent = 'Switch to Dark Theme';
        }
    });

    // Cursor Tracking Logic
    document.addEventListener('mousemove', (e) => {
        // Prevents tracking if eyes are closed
        if (character.classList.contains('eyes-closed')) return;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        eyes.forEach((eye, index) => {
            const pupil = pupils[index];
            const eyeRect = eye.getBoundingClientRect();
            
            // Calculate center of the eye
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            // Calculateing angle between mouse and eye center
            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);

            // Calculating distance
            const distance = Math.min(
                Math.hypot(mouseX - eyeCenterX, mouseY - eyeCenterY),
                (eyeRect.width / 2) - (pupil.offsetWidth / 2)
            );

            // Move the pupil
            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;

            pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
        });
    });

    // Password Visibility & Eye Closing Logic
    togglePasswordBtn.addEventListener('click', () => {
        // Toggle input type
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Update button icon/text
        togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';

        // When the user chooses to "see" the password, the character closes its eyes
        if (isPassword) {
            character.classList.add('eyes-closed');
        } else {
            character.classList.remove('eyes-closed');
        }
    });
});