# Interactive Animated Login Page

A full-stack login page featuring animated cartoon SVG characters that react dynamically to user inputs, mouse proximity, and theme changes. Built with vanilla JavaScript, CSS animations, and a Node.js/Express backend with JWT session authentication.

---

# Vercel Link:
https://interactive-login-lyart.vercel.app/

---

## Features

- **Interactive Characters (Light & Dark Themes):**
  - **Light Theme (Sun Guardian):** Cheerful, celestial design set against an alpine meadow backdrop.
  - **Dark Theme (Count Vladislaus):** Vampire design set against a gothic night sky with animated vector bats.
- **Dynamic Eye Tracking:**
  - Follows cursor movement across the screen using trigonometry (`Math.atan2`).
  - Automatically shifts focus to track the exact position of typed characters inside the input fields.
- **Curiosity States:** Characters lean in with distinct facial expressions while the user is typing credentials.
- **Proximity Reactions:**
  - When the cursor moves close to the vampire's head, he pulls his lips back to bare his fangs.
  - The Sun Guardian gives a subtle, friendly nod and glow when hovered near.
- **Show/Hide Password Interaction:** Clicking the visibility toggle causes the character to physically cover its eyes with its hands.
- **Custom Login Transitions:**
  - Dark mode: The vampire leaps out, transforms into a bat, and flies away toward the moon.
  - Light mode: The guardian ascends upward into the clouds with a golden aura.
- **Authentication & Security:**
  - Node.js & Express backend.
  - Generates JSON Web Tokens (JWT) stored in secure `httpOnly` cookies.
  - Protected dashboard view with session verification on page load.

---

## Tech Stack

- **Frontend:** HTML5, CSS3 (Custom SVG illustrations, Keyframes, Flexbox), Vanilla JavaScript (DOM manipulation, Trigonometry)
- **Backend:** Node.js, Express.js
- **Auth & Storage:** JSON Web Tokens (`jsonwebtoken`), Cookie Parser (`cookie-parser`)

---

## Project Structure

```text
interactive-login/
├── package.json
├── server.js
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```
# Author: Zhuravlov Nikita
# Contact: zhuravlovnick@gmail.com
