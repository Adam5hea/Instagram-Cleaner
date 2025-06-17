// ==UserScript==
// @name         Instagram Cleaner
// @version      1.1
// @description  Tool to clean up Instagram activity (comments and likes).
// @author       Supercharged Rhino Unit
// @match        https://www.instagram.com/accounts/activity/*
// @grant        none
// ==/UserScript==

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
    `;
    document.head.appendChild(style);

    // Create UI container
    const ui = document.createElement('div');
    ui.id = 'instaCleanerUI';
    ui.innerHTML = `
        <button class="closeBtn" title="Close">&times;</button>
        <h2>
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
            Insta Cleaner
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

    // Helper async sleep
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Main delete logic
    ui.querySelector('#startDeleteBtn').onclick = async () => {
        const amountVal = parseInt(document.querySelector('#amountInput').value, 10);
        const delayMs = parseInt(document.querySelector('#speedInput').value, 10);

        // Check select button element in config again (in case page changed)
        let checkboxes = Array.from(document.querySelectorAll(selectors.messageCheckboxes)).filter(el =>
            el.offsetParent !== null &&
            !el.getAttribute('aria-checked')?.includes('true')
        );

        if (checkboxes.length === 0) {
            // If no checkboxes found, try clicking the "Select" button again
            const selectBtn = Array.from(document.querySelectorAll('div[data-bloks-name="bk.components.Flexbox"][role="button"]'))
                .find(el => el.textContent.trim() === "Select");

            if (selectBtn) {
                selectBtn.click();
                await sleep(600);

                checkboxes = Array.from(document.querySelectorAll(selectors.messageCheckboxes)).filter(el =>
                    el.offsetParent !== null &&
                    !el.getAttribute('aria-checked')?.includes('true')
                );
            } else {
                alert('No checkboxes visible and Select button not found!');
                return;
            }
        }

        const toDelete = amountVal === -1 ? checkboxes.length : Math.min(amountVal, checkboxes.length);
        if (toDelete <= 0) {
            alert('Invalid amount to delete!');
            return;
        }

        // Click each checkbox with delay
        for (let i = 0; i < toDelete; i++) {
            forceClick(checkboxes[i]);
            await sleep(delayMs);
        }

        // Click the visible Delete button
        const deleteButtons = Array.from(document.querySelectorAll('[role="button"][aria-label="Delete"]'))
            .filter(btn => getComputedStyle(btn).pointerEvents === 'auto');

        if (deleteButtons.length > 0) {
            const delBtn = deleteButtons[0]; // Click the first delete button
            delBtn.click();
            await new Promise(r => setTimeout(r, 500)); // Wait for modal

            // Now find the confirm delete button
            const candidates = Array.from(document.querySelectorAll('button, div, span'))
                .filter(el => el.innerText && el.innerText.trim() === 'Delete' && getComputedStyle(el).pointerEvents !== 'none' && (el.offsetWidth > 0 || el.offsetHeight > 0));

            const confirmBtn = candidates.find(el => el.tagName === 'BUTTON') || candidates[0];

            if (confirmBtn) {
                confirmBtn.click();
            } else {
                alert('Confirm Delete button not found.');
            }
        } else {
            alert('Delete button not found. Please delete manually.');
        }
    };

})();
