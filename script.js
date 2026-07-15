document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LIVE COUNTDOWN TIMER
    // ==========================================
    // Target: 20 December 2026, 11:30 AM (Indian Standard Time: +05:30)
    const targetDate = new Date('2026-12-20T11:30:00+05:30').getTime();

    const countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            clearInterval(countdownTimer);
            document.getElementById('days').innerText = "00";
            document.getElementById('hours').innerText = "00";
            document.getElementById('minutes').innerText = "00";
            document.getElementById('seconds').innerText = "00";
            
            // Optionally update title
            const titleEl = document.querySelector('.countdown-title');
            if (titleEl) titleEl.innerText = "The Ceremony Has Begun!";
            return;
        }

        // Time calculations
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update DOM with leading zeros
        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    }, 1000);


    // ==========================================
    // 2. RSVP FORM HANDLING WITH LOCAL STORAGE
    // ==========================================
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success');
    const editRsvpBtn = document.getElementById('edit-rsvp-btn');
    const guestsGroup = document.getElementById('guests-group');
    const guestsInput = document.getElementById('rsvp-guests');
    
    const attendYesRadio = document.getElementById('attend-yes');
    const attendNoRadio = document.getElementById('attend-no');

    // Toggle number of guests field based on attendance
    if (attendYesRadio && attendNoRadio) {
        attendYesRadio.addEventListener('change', () => {
            guestsGroup.style.display = 'block';
            guestsInput.value = '1';
            guestsInput.setAttribute('required', 'true');
        });

        attendNoRadio.addEventListener('change', () => {
            guestsGroup.style.display = 'none';
            guestsInput.value = '0';
            guestsInput.removeAttribute('required');
        });
    }

    // Check if user already RSVP'd on this device
    const existingRsvp = localStorage.getItem('my_house_warming_rsvp');
    if (existingRsvp) {
        const rsvpData = JSON.parse(existingRsvp);
        showSuccessState(rsvpData);
    }

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2uJZ0TZ5W0Aic9UoGxytUHL5aAp-dLW3fFpl4pklicP9OSn0DftsRpZeuHkZgexgC/exec";

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Extract values
            const attendance = document.querySelector('input[name="attendance"]:checked').value;
            const name = document.getElementById('rsvp-name').value.trim();
            const mobile = document.getElementById('rsvp-mobile').value.trim();
            const guests = attendance.includes('Yes') ? parseInt(guestsInput.value) || 1 : 0;
            const message = document.getElementById('rsvp-message').value.trim();

            const rsvpObject = {
                id: existingRsvp ? JSON.parse(existingRsvp).id : 'rsvp_' + Date.now(),
                attendance,
                name,
                mobile,
                guests,
                message,
                timestamp: new Date().toISOString()
            };

            // Loading state
            const submitBtn = rsvpForm.querySelector('.rsvp-submit-btn');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Submitting...';
            submitBtn.disabled = true;

            const googleSheetsData = {
                attending: attendance,
                name: name,
                mobile: mobile,
                guests: guests,
                message: message
            };

            try {
                // Post to Google Sheets Apps Script web app
                await fetch(SCRIPT_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify(googleSheetsData)
                });

                // Local backup saving (for admin dashboard preview)
                localStorage.setItem('my_house_warming_rsvp', JSON.stringify(rsvpObject));

                let allRsvps = JSON.parse(localStorage.getItem('house_warming_rsvps') || '[]');
                allRsvps = allRsvps.filter(item => item.mobile !== mobile && item.id !== rsvpObject.id);
                allRsvps.push(rsvpObject);
                localStorage.setItem('house_warming_rsvps', JSON.stringify(allRsvps));

                // Success confirmation
                showSuccessState(rsvpObject);
                rsvpForm.reset();

            } catch (err) {
                console.error("Error submitting RSVP:", err);
                
                // Fallback: Google Apps Script Web Apps often trigger CORS exceptions on static pages
                // but the submission still completes successfully on the Sheets backend.
                // We save it locally and show success so the user is not stuck.
                localStorage.setItem('my_house_warming_rsvp', JSON.stringify(rsvpObject));

                let allRsvps = JSON.parse(localStorage.getItem('house_warming_rsvps') || '[]');
                allRsvps = allRsvps.filter(item => item.mobile !== mobile && item.id !== rsvpObject.id);
                allRsvps.push(rsvpObject);
                localStorage.setItem('house_warming_rsvps', JSON.stringify(allRsvps));

                showSuccessState(rsvpObject);
                rsvpForm.reset();
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    if (editRsvpBtn) {
        editRsvpBtn.addEventListener('click', () => {
            // Restore form layout
            rsvpForm.style.display = 'block';
            rsvpSuccess.style.display = 'none';

            // Prefill with stored details
            const stored = localStorage.getItem('my_house_warming_rsvp');
            if (stored) {
                const data = JSON.parse(stored);
                if (data.attendance.includes('Yes')) {
                    attendYesRadio.checked = true;
                    guestsGroup.style.display = 'block';
                    guestsInput.value = data.guests;
                } else {
                    attendNoRadio.checked = true;
                    guestsGroup.style.display = 'none';
                    guestsInput.value = '0';
                }
                document.getElementById('rsvp-name').value = data.name;
                document.getElementById('rsvp-mobile').value = data.mobile;
                document.getElementById('rsvp-message').value = data.message;
            }
        });
    }

    function showSuccessState(rsvpData) {
        rsvpForm.style.display = 'none';
        rsvpSuccess.style.display = 'block';
        
        const successMessageParagraph = rsvpSuccess.querySelector('p');
        if (rsvpData.attendance.includes('Yes')) {
            successMessageParagraph.innerHTML = `
                Your RSVP has been received successfully!<br>
                <strong>Attending:</strong> Yes, InshaAllah (${rsvpData.guests} guests)<br>
                May Allah (SWT) reward you. We look forward to welcoming you!
            `;
        } else {
            successMessageParagraph.innerHTML = `
                Your response has been received successfully.<br>
                <strong>Attending:</strong> Sorry, I cannot attend.<br>
                Thank you for letting us know. Your blessings and duas mean a lot!
            `;
        }
    }


    // ==========================================
    // 3. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('active'));
    }


    // ==========================================
    // 4. AUDIO CONTROLLER PLAYBACK
    // ==========================================
    const audioToggle = document.getElementById('audio-toggle');
    const bgAudio = document.getElementById('bg-audio');
    const audioIcon = document.getElementById('audio-icon');

    if (audioToggle && bgAudio && audioIcon) {
        audioToggle.addEventListener('click', () => {
            if (bgAudio.paused) {
                bgAudio.play()
                    .then(() => {
                        // Change icon to playing state
                        audioIcon.innerHTML = `
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        `;
                        audioToggle.setAttribute('title', 'Pause Music');
                    })
                    .catch(err => {
                        console.log("Audio play blocked by browser policies.", err);
                    });
            } else {
                bgAudio.pause();
                // Change back to muted/paused icon
                audioIcon.innerHTML = `
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM12 4L9.91 6.09 12 8.18V4zm-8.09-.09L2.81 5.09 6.82 9H4v6h4l5 5v-6.83l4.88 4.88c-.62.47-1.31.85-2.08 1.09v2.01c1.3-.3 2.49-.93 3.47-1.76l2.62 2.62 1.41-1.41L4.82 2.81 3.91 3.91zM12 15.17L9.83 13H8v-2h1.83l.26-.26 1.91 1.91v2.52z"/>
                `;
                audioToggle.setAttribute('title', 'Play Background Daff');
            }
        });
    }

});
