(function () {
    'use strict';


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

    function createStatusBox() {
    let box = document.createElement('div');
    box.id = 'deleteStatusBox';
    box.style.position = 'fixed';
    box.style.bottom = '20px';
    box.style.right = '20px';
    box.style.padding = '10px 15px';
    box.style.backgroundColor = 'rgba(0,0,0,0.7)';
    box.style.color = '#fff';
    box.style.fontSize = '14px';
    box.style.borderRadius = '8px';
    box.style.zIndex = 9999;
    box.style.fontFamily = 'Arial, sans-serif';
    box.style.minWidth = '180px';
    box.style.textAlign = 'center';
    box.innerText = 'Checked / Removed: 0';
    document.body.appendChild(box);
    return box;
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
        <input type="number" id="speedInput" value="50" min="50" max="5000" step="50">

        <button id="startDeleteBtn" title="Start deleting selected messages" style="background:#05ff00;">
            <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>
            Start Delete
        </button>

        <button id="stopDeleteBtn" title="Stop deleting" style="background:#ff0000;">
        <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M6 6h12v12H6z"/></svg>
         Stop Delete
        </button>
    `;



    document.body.appendChild(ui);

    // Close button
    ui.querySelector('.closeBtn').onclick = () => ui.remove();

    // Navigation buttons
    ui.querySelector('#goCommentsBtn').onclick = () => {
        window.location.href = 'https://www.instagram.com/your_activity/interactions/comments/';
    };

    ui.querySelector('#goLikesBtn').onclick = () => {
        window.location.href = 'https://www.instagram.com/your_activity/interactions/likes/';
    };

    async function getSelectAllButton(timeout = 5000) {
    const pollInterval = 300;
    const maxAttempts = Math.ceil(timeout / pollInterval);
    let attempts = 0;

    while (attempts < maxAttempts) {
        const btn = Array.from(document.querySelectorAll('div[data-bloks-name="bk.components.Flexbox"][role="button"]'))
            .find(el => el.textContent.trim() === "Select");
        if (btn) return btn;

        await new Promise(r => setTimeout(r, pollInterval));
        attempts++;
    }
    return null;
}
    function forceClick(el) {
        // If it's unclickable, we simulate a real user event
        el.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        }));
    }

    async function handleErrorPopup() {
        // Find all buttons with child div that has text 'OK' (case insensitive)
        const okButtons = Array.from(document.querySelectorAll('button'))
            .filter(btn => {
                const div = btn.querySelector('div');
                if (!div) return false;
                const text = div.innerText?.trim().toLowerCase();
                return text === 'ok';
            });

        if (okButtons.length > 0) {
            console.log(`⚠️ Error popup detected! Clicking OK (${okButtons.length} candidate(s))...`);
            for (const okBtn of okButtons) {
                if (getComputedStyle(okBtn).pointerEvents !== 'none' &&
                    (okBtn.offsetWidth > 0 || okBtn.offsetHeight > 0)) {
                    forceClick(okBtn);
                    await sleep(1500);
                    return true;
                }
            }
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

    // Stop button functionality
    ui.querySelector('#stopDeleteBtn').onclick = () => {
        stopRequested = true;
        console.log('🛑 Stop requested!');
    };

    // Main delete logic
    let stopRequested = false;

    ui.querySelector('#stopDeleteBtn').onclick = () => {
        stopRequested = true;
        console.log('🛑 Stop requested!');
    };

    ui.querySelector('#startDeleteBtn').onclick = async () => {
        stopRequested = false;  // reset when starting

        let retry = true;

        while (retry) {
            if (stopRequested) {
                console.log('🛑 Stopped before starting batch.');
                break;
            }

            retry = false;

            const amountVal = parseInt(document.querySelector('#amountInput').value, 10);
            const delayMs = parseInt(document.querySelector('#speedInput').value, 10);

            // Reload checkboxes
            let checkboxes = Array.from(document.querySelectorAll(selectors.messageCheckboxes)).filter(el =>
                el.offsetParent !== null &&
                !el.getAttribute('aria-checked')?.includes('true')
            );

            if (stopRequested) break;

            if (checkboxes.length === 0) {
                console.log("⏳ Waiting for Select button or checkboxes to load...");

                const selectBtn = await waitForElement(() =>
                    Array.from(document.querySelectorAll('div[data-bloks-name="bk.components.Flexbox"][role="button"]'))
                        .find(el => el.textContent.trim() === "Select")
                );

                if (stopRequested) break;

                if (selectBtn) {
                    selectBtn.click();
                    await sleep(600);
                    if (stopRequested) break;

                    checkboxes = Array.from(document.querySelectorAll(selectors.messageCheckboxes)).filter(el =>
                        el.offsetParent !== null &&
                        !el.getAttribute('aria-checked')?.includes('true')
                    );
                }

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
                        break;
                    }
                }
            }

            if (stopRequested) break;

            const toDelete = amountVal === -1 ? checkboxes.length : Math.min(amountVal, checkboxes.length);
            if (toDelete <= 0) {
                alert('Invalid amount to delete!');
                break;
            }

            // Select checkboxes with stop check
            for (let i = 0; i < toDelete; i++) {
                if (stopRequested) {
                    console.log('🛑 Stopped during checkbox selection.');
                    break;
                }
                forceClick(checkboxes[i]);
                await sleep(delayMs);
                if (stopRequested) break;
            }

            if (stopRequested) break;

            function findClickableButtonByAriaLabel(label) {
                const candidates = Array.from(document.querySelectorAll(`[role="button"][aria-label="${label}"]`));
                for (const el of candidates) {
                    const clickable = el.querySelectorAll('*');
                    for (const child of clickable) {
                        const style = window.getComputedStyle(child);
                        if (style.pointerEvents === 'auto' && (child.offsetWidth > 0 || child.offsetHeight > 0)) {
                            return child;
                        }
                    }
                    const elStyle = window.getComputedStyle(el);
                    if (elStyle.pointerEvents === 'auto' && (el.offsetWidth > 0 || el.offsetHeight > 0)) {
                        return el;
                    }
                }
                return null;
            }

            let actionButton = findClickableButtonByAriaLabel('Delete');
            if (!actionButton) {
                console.log("Delete button not found, trying Unlike button...");
                actionButton = findClickableButtonByAriaLabel('Unlike');
            }

            if (actionButton) {
                actionButton.click();
                await sleep(500);
                if (stopRequested) break;

                await sleep(500);
                if (stopRequested) break;

                const confirmBtn = Array.from(document.querySelectorAll('button'))
                    .find(btn => {
                        const text = btn.innerText?.trim();
                        return (text === 'Unlike' || text === 'Delete') &&
                            getComputedStyle(btn).pointerEvents !== 'none' &&
                            (btn.offsetWidth > 0 || btn.offsetHeight > 0);
                    });

                if (confirmBtn) {
                    console.log(`✅ Clicking confirmation button: ${confirmBtn.innerText.trim()}`);
                    confirmBtn.click();
                    await sleep(2000);
                    if (stopRequested) break;

                    retry = true; // continue next batch
                } else {
                    alert('⚠️ Confirm Unlike or Delete button not found.');
                    break;
                }
            }

            // Click OK button if present, with stop checks inside
            await clickOkButtonIfPresent();

            if (stopRequested) break;

            await sleep(1000);
            if (stopRequested) break;
        }
    };

    // Modified clickOkButtonIfPresent with stop check inside loop
    async function clickOkButtonIfPresent(timeout = 10000) {
        const pollInterval = 300;
        const maxAttempts = Math.ceil(timeout / pollInterval);
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (stopRequested) {
                console.log('🛑 Stopped while waiting for OK button.');
                return false;
            }

            const okButton = Array.from(document.querySelectorAll('button._a9--._ap36._a9_1'))
                .find(btn => btn.textContent.trim() === "OK");

            if (okButton) {
                okButton.click();
                console.log("Clicked OK button");
                return true;
            }

            await new Promise(r => setTimeout(r, pollInterval));
            attempts++;
        }

        console.warn("OK button not found after waiting.");
        return false;
    };

})();