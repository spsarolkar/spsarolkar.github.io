/**
 * Typing Animation for Hero Section Motto
 * Creates a typewriter effect for the subtitle text
 */

(function () {
  'use strict';

  // Configuration
  const config = {
    typingSpeed: 80, // milliseconds per character
    deletingSpeed: 50, // milliseconds per character when deleting
    delayBeforeDelete: 2000, // delay before starting to delete
    delayBeforeType: 500, // delay before starting to type again
    cursorBlinkSpeed: 530, // milliseconds
  };

  // Initialize typing effect
  function initTypingEffect() {
    const descElement = document.querySelector('.post-header .desc');
    if (!descElement) return;

    // Get the original text
    const originalHTML = descElement.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalHTML;
    const originalText = tempDiv.textContent || tempDiv.innerText || '';

    // Don't run if text is empty
    if (!originalText.trim()) return;

    // Store links and formatting
    const links = descElement.querySelectorAll('a');
    const linkMap = new Map();
    links.forEach((link, index) => {
      linkMap.set(link.textContent, link.outerHTML);
    });

    // Clear the element and add cursor
    descElement.innerHTML = '<span class="typing-cursor"></span>';
    const cursor = descElement.querySelector('.typing-cursor');

    let charIndex = 0;
    let isDeleting = false;
    let currentText = '';

    function type() {
      if (!isDeleting && charIndex < originalText.length) {
        // Typing
        currentText = originalText.substring(0, charIndex + 1);
        charIndex++;

        // Replace link text with actual link HTML
        let displayText = currentText;
        linkMap.forEach((html, text) => {
          if (currentText.includes(text)) {
            displayText = currentText.replace(text, html);
          }
        });

        descElement.innerHTML = displayText + '<span class="typing-cursor"></span>';

        setTimeout(type, config.typingSpeed);
      } else if (!isDeleting && charIndex === originalText.length) {
        // Finished typing - just keep the final text with cursor
        descElement.innerHTML = originalHTML + '<span class="typing-cursor"></span>';
        // Remove cursor after animation completes
        setTimeout(() => {
          const finalCursor = descElement.querySelector('.typing-cursor');
          if (finalCursor) {
            finalCursor.remove();
          }
        }, config.delayBeforeDelete);
      }
    }

    // Start typing after a short delay
    setTimeout(type, config.delayBeforeType);
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypingEffect);
  } else {
    initTypingEffect();
  }
})();
