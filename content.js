(function () {
    'use strict';

    let stopRequested = false;

    // ----- CONFIG: Update these selectors! -----
    const selectors = {
        commentsSectionBtn: 'button[aria-label="Comments"]', // Update if needed
        likesSectionBtn: 'button[aria-label="Likes"]',       // Update if needed

        // Select button: div with data-bloks-name="bk.components.Flexbox" and text "Select"
        selectAllButton: Array.from(document.querySelectorAll('div[data-bloks-name="bk.components.Flexbox"][role="button"]'))
            .find(el => el.textContent.trim() === "Select"),

        // Checkboxes for messages (update to your actual checkbox selector)
        messageCheckboxes: 'div[role="button"][aria-label="Toggle checkbox"]',

        // Delete and confirm buttons (update if needed)
        deleteButton: 'button[aria-label="Delete"]',
        confirmDeleteButton: 'button[aria-label="Confirm delete"]',
    };
    // --------------------------------------------

    // Create dark UI styles
    const style = document.createElement('style');
    style.textContent = `
        #instaCleanerUI {
            position: fixed;
            top: 50px;
            right: 20px;
            width: 320px;
            background: #121212;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 0 15px rgba(0,0,0,0.7);
            color: #eee;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 999999;
        }
        #instaCleanerUI h2 {
            margin: 0 0 10px 0;
            font-size: 1.2em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        #instaCleanerUI h2 svg {
            fill: #1da1f2;
            width: 24px;
            height: 24px;
        }
        #instaCleanerUI label {
            display: block;
            margin: 10px 0 5px 0;
            font-size: 0.9em;
            color: #bbb;
        }
        #instaCleanerUI input[type="number"] {
            width: 100%;
            background: #222;
            border: 1px solid #444;
            border-radius: 4px;
            color: #eee;
            padding: 6px 8px;
            box-sizing: border-box;
        }
        #instaCleanerUI button {
            background: #1da1f2;
            border: none;
            border-radius: 5px;
            padding: 10px 15px;
            margin: 5px 5px 5px 0;
            color: white;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        #instaCleanerUI button:hover {
            background: #0d8ddb;
        }
        #instaCleanerUI .closeBtn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: transparent;
            color: #777;
            font-size: 18px;
            padding: 0;
            border: none;
            cursor: pointer;
        }
        #instaCleanerUI .closeBtn:hover {
            color: #fff;
        }
    `;
    document.head.appendChild(style);

    // Create UI container
    const ui = document.createElement('div');
    ui.id = 'instaCleanerUI';
    ui.innerHTML = `
        <button class="closeBtn" title="Close">&times;</button>
        <h2>
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
            Instagram Cleaner
        </h2>
        <button id="goCommentsBtn" title="Go to Comments Section">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M20 2H4c-1.1 0-2 .9-2 2v16l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            Comments
        </button>
        <button id="goLikesBtn" title="Go to Likes Section">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            Likes
        </button>

        <label for="amountInput">Amount to delete (-1 for all):</label>
        <input type="number" id="amountInput" value="-1" min="-1" max="1000" step="1">

        <label for="speedInput">Delete speed (ms delay):</label>
        <input type="number" id="speedInput" value="500" min="50" max="5000" step="50">

        <button id="startDeleteBtn" title="Start deleting selected messages">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/></svg>
            Start Delete
        </button>
    `;

    document.body.appendChild(ui);

    // Close button
    ui.querySelector('.closeBtn').onclick = () => ui.remove();

    // Navigation buttons
    ui.querySelector('#goCommentsBtn').onclick = () => {
        const btn = document.querySelector(selectors.commentsSectionBtn);
        if (btn) btn.click();
        else alert('Comments section button not found! Update selector.');
    };

    ui.querySelector('#goLikesBtn').onclick = () => {
        const btn = document.querySelector(selectors.likesSectionBtn);
        if (btn) btn.click();
        else alert('Likes section button not found! Update selector.');
    };

    function forceClick(el) {
        // If it's unclickable, we simulate a real user event
        el.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }

    async function handleErrorPopup() {
        const okBtn = Array.from(document.querySelectorAll('button, div'))
            .find(el =>
                el.innerText.trim() === 'OK' &&
                getComputedStyle(el).pointerEvents === 'auto'
            );

        if (okBtn) {
            console.log("⚠️ Error detected! Clicking OK...");
            okBtn.click();
            await sleep(1500);
            return true;
        }

        return false;
    }

    async function waitForElement(selectorFn, timeout = 10000, interval = 300) {
        const start = Date.now();
        while ((Date.now() - start) < timeout) {
            const result = selectorFn();
            if (result) return result;
            await sleep(interval);
        }
        return null;
    }

    // Helper async sleep
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Main delete logic
    ui.querySelector('#startDeleteBtn').onclick = async () => {
        let retry = true;

        while (retry) {
            retry = false;

            const amountVal = parseInt(document.querySelector('#amountInput').value, 10);
            const delayMs = parseInt(document.querySelector('#speedInput').value, 10);

            // Check for error and OK button
            const errorHandled = await handleErrorPopup();
            if (errorHandled) {
                console.log("🔄 Retrying after dismissing error...");
                await sleep(2000);
                retry = true;
                continue; // Restart loop
            }

            // Reload checkboxes
            let checkboxes = Array.from(document.querySelectorAll(selectors.messageCheckboxes)).filter(el =>
                el.offsetParent !== null &&
                !el.getAttribute('aria-checked')?.includes('true')
            );

            // Wait for either checkboxes or Select button if not found yet
            if (checkboxes.length === 0) {
                console.log("⏳ Waiting for Select button or checkboxes to load...");

                const selectBtn = await waitForElement(() =>
                    Array.from(document.querySelectorAll('div[data-bloks-name="bk.components.Flexbox"][role="button"]'))
                        .find(el => el.textContent.trim() === "Select")
                );

                if (selectBtn) {
                    selectBtn.click();
                    await sleep(600);
                    checkboxes = Array.from(document.querySelectorAll(selectors.messageCheckboxes)).filter(el =>
                        el.offsetParent !== null &&
                        !el.getAttribute('aria-checked')?.includes('true')
                    );
                }

                // Final fallback: wait for checkboxes
                if (!selectBtn || checkboxes.length === 0) {
                    checkboxes = await waitForElement(() => {
                        const found = Array.from(document.querySelectorAll(selectors.messageCheckboxes)).filter(el =>
                            el.offsetParent !== null &&
                            !el.getAttribute('aria-checked')?.includes('true')
                        );
                        return found.length > 0 ? found : null;
                    });

                    if (!checkboxes) {
                        alert('⚠️ Timed out waiting for checkboxes. Try again after the page loads.');
                        return;
                    }
                }
            }

            const toDelete = amountVal === -1 ? checkboxes.length : Math.min(amountVal, checkboxes.length);
            if (toDelete <= 0) {
                alert('Invalid amount to delete!');
                return;
            }

            // Select checkboxes
            for (let i = 0; i < toDelete; i++) {
                forceClick(checkboxes[i]);
                await sleep(delayMs);
            }

            function findClickableButtonByAriaLabel(label) {
                // Find all role=button elements with the aria-label
                const candidates = Array.from(document.querySelectorAll(`[role="button"][aria-label="${label}"]`));

                for (const el of candidates) {
                    // Find descendants with pointer-events: auto (actual clickable part)
                    const clickable = el.querySelectorAll('*');
                    for (const child of clickable) {
                        const style = window.getComputedStyle(child);
                        if (style.pointerEvents === 'auto' && (child.offsetWidth > 0 || child.offsetHeight > 0)) {
                            return child; // Return the first clickable descendant
                        }
                    }
                    // If no clickable descendant, maybe the element itself is clickable
                    const elStyle = window.getComputedStyle(el);
                    if (elStyle.pointerEvents === 'auto' && (el.offsetWidth > 0 || el.offsetHeight > 0)) {
                        return el;
                    }
                }
                return null;
            }

            // Try to find Delete button first, fallback to Unlike button if not found
            let actionButton = findClickableButtonByAriaLabel('Delete');

            if (!actionButton) {
                console.log("Delete button not found, trying Unlike button...");
                actionButton = findClickableButtonByAriaLabel('Unlike');
            }

            if (actionButton) {
                actionButton.click();
                await sleep(500);

                // Confirm Delete button (similar logic applies)
                const confirmCandidates = Array.from(document.querySelectorAll('button, div, span'))
                    .filter(el => {
                        if (!el.innerText) return false;
                        const text = el.innerText.trim();
                        const pointerEvents = getComputedStyle(el).pointerEvents;
                        const visible = (el.offsetWidth > 0 || el.offsetHeight > 0); manifest
                        return (text === 'Delete' || text === 'Unlike') && pointerEvents !== 'none' && visible;
                    });

                const confirmBtn = confirmCandidates.find(el => el.tagName === 'BUTTON') || confirmCandidates[0];

                if (confirmBtn) {
                    confirmBtn.click();
                    await sleep(2000);
                    retry = true; // Continue loop for next batch
                } else {
                    alert('Confirm Delete button not found.');
                }
            } else {
                alert('Delete or Unlike button not found. Please delete manually.');
            }
        }
    };

})();