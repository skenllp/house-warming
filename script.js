document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. SCRATCH TO OPEN INVITE
    // ==========================================
    const scratchCanvas = document.getElementById("scratchCanvas");
    const scratchScreen = document.getElementById("scratchScreen");
    const bgAudio = document.getElementById('bg-audio');
    const audioToggle = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');

    if (scratchCanvas && scratchScreen) {
        const ctx = scratchCanvas.getContext("2d");
        let isDrawing = false;
        let isFinished = false;

        // Resize Canvas dynamically to match parent container size
        function resizeCanvas() {
            if (isFinished) return;
            const rect = scratchCanvas.parentNode.getBoundingClientRect();
            scratchCanvas.width = rect.width;
            scratchCanvas.height = rect.height;
            drawGoldFoil();
        }

        // Draw Gold Foil Texture programmatically
        function drawGoldFoil() {
            const w = scratchCanvas.width;
            const h = scratchCanvas.height;

            // 1. Create linear metallic gold gradient
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#d4af37');   // Metallic Gold
            grad.addColorStop(0.25, '#fcf6ba'); // Light Gold Shine
            grad.addColorStop(0.5, '#aa771c');  // Antique Gold
            grad.addColorStop(0.75, '#fbf5b7'); // Light Gold Shine
            grad.addColorStop(1, '#8a5a00');    // Rich Dark Gold

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // 2. Add fine-grained gold foil sparkle noise
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * 22; // subtle sparkle grain
                data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
                data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise)); // G
                data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise)); // B
            }
            ctx.putImageData(imgData, 0, 0);

            // 3. Superimpose luxury thin geometric grid pattern on canvas
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.lineWidth = 1;
            const gridSize = 45;
            ctx.beginPath();
            for (let x = 0; x < w; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
            }
            ctx.stroke();

            // 4. Double luxury borders around canvas
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 8;
            ctx.strokeRect(15, 15, w - 30, h - 30);

            ctx.strokeStyle = 'rgba(180, 83, 9, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(24, 24, w - 48, h - 48);

            // 5. Draw scratch instructions in the center of the gold foil card
            ctx.fillStyle = '#7c2d12'; // Rust-gold color
            ctx.font = '600 15px "Montserrat", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Soft white/gold glow contour behind text
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 4;
            ctx.strokeText('Scratch to Open Invitation ', w / 2, h / 2);
            ctx.fillText('Scratch to Open Invitation ', w / 2, h / 2);
        }

        // Initialize Canvas Size
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Scratch Logic
        ctx.globalCompositeOperation = "destination-out";

        function getMousePos(e) {
            const rect = scratchCanvas.getBoundingClientRect();
            // Handle touch vs mouse pointer coordinates
            if (e.touches && e.touches[0]) {
                return {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top
                };
            }
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        function scratch(x, y) {
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2); // 40px radius brush
            ctx.fill();
            checkReveal();
        }

        // Mouse Listeners
        scratchCanvas.addEventListener("mousedown", (e) => {
            isDrawing = true;
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        });

        scratchCanvas.addEventListener("mousemove", (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        });

        window.addEventListener("mouseup", () => {
            isDrawing = false;
        });

        // Touch Listeners (Mobile compatibility)
        scratchCanvas.addEventListener("touchstart", (e) => {
            isDrawing = true;
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        }, { passive: false });

        scratchCanvas.addEventListener("touchmove", (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        }, { passive: false });

        window.addEventListener("touchend", () => {
            isDrawing = false;
        });

        // Calculate transparent pixel percentage (debounced)
        let checkTimeout;
        function checkReveal() {
            if (isFinished) return;
            if (checkTimeout) return;

            checkTimeout = setTimeout(() => {
                checkTimeout = null;

                const w = scratchCanvas.width;
                const h = scratchCanvas.height;
                const imgData = ctx.getImageData(0, 0, w, h);
                const pixels = imgData.data;
                let transparent = 0;
                
                // Sample every 48th pixel for mobile performance optimization
                const step = 48;
                let totalChecked = 0;
                for (let i = 3; i < pixels.length; i += 4 * step) {
                    totalChecked++;
                    if (pixels[i] === 0) {
                        transparent++;
                    }
                }

                const percent = transparent / totalChecked;

                // When 60% of canvas is transparent, reveal invitation
                if (percent > 0.60) {
                    revealInvitation();
                }
            }, 100); // Sample maximum once every 100ms
        }

        function revealInvitation() {
            if (isFinished) return;
            isFinished = true;

            // 1. Play Background Daff/Music (satisfies browser interaction policies)
            if (bgAudio) {
                bgAudio.play()
                    .then(() => {
                        audioIcon.innerHTML = `
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        `;
                        audioToggle.setAttribute('title', 'Pause Music');
                    })
                    .catch(err => {
                        console.log("Audio playback blocked by browser security:", err);
                    });
            }

            // 2. Animate out scratch screen overlay with GSAP
            gsap.to("#scratchScreen", {
                opacity: 0,
                scale: 1.05,
                duration: 1.2,
                ease: "power3.out",
                onComplete() {
                    scratchScreen.remove();
                }
            });

            // 3. Stagger animate in the Hero section components
            gsap.from(".hero", {
                scale: 1.08,
                opacity: 0,
                duration: 1.4,
                ease: "power3.out"
            });

            gsap.from(".hero-content > *", {
                y: 60,
                opacity: 0,
                stagger: 0.15,
                duration: 1.2,
                ease: "power3.out"
            });
        }
    }

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
            
            const titleEl = document.querySelector('.countdown-title');
            if (titleEl) titleEl.innerText = "The Ceremony Has Begun!";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

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

    const existingRsvp = localStorage.getItem('my_house_warming_rsvp');
    if (existingRsvp) {
        const rsvpData = JSON.parse(existingRsvp);
        showSuccessState(rsvpData);
    }

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2uJZ0TZ5W0Aic9UoGxytUHL5aAp-dLW3fFpl4pklicP9OSn0DftsRpZeuHkZgexgC/exec";

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                await fetch(SCRIPT_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify(googleSheetsData)
                });

                localStorage.setItem('my_house_warming_rsvp', JSON.stringify(rsvpObject));

                let allRsvps = JSON.parse(localStorage.getItem('house_warming_rsvps') || '[]');
                allRsvps = allRsvps.filter(item => item.mobile !== mobile && item.id !== rsvpObject.id);
                allRsvps.push(rsvpObject);
                localStorage.setItem('house_warming_rsvps', JSON.stringify(allRsvps));

                showSuccessState(rsvpObject);
                rsvpForm.reset();

            } catch (err) {
                console.error("Error submitting RSVP:", err);
                
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
            rsvpForm.style.display = 'block';
            rsvpSuccess.style.display = 'none';

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
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }


    // ==========================================
    // 4. AUDIO CONTROLLER PLAYBACK
    // ==========================================
    function playAudio() {
        if (bgAudio && bgAudio.paused) {
            bgAudio.play()
                .then(() => {
                    audioIcon.innerHTML = `
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    `;
                    audioToggle.setAttribute('title', 'Pause Music');
                })
                .catch(err => {
                    console.log("Audio playback failed:", err);
                });
        }
    }

    function pauseAudio() {
        if (bgAudio && !bgAudio.paused) {
            bgAudio.pause();
            audioIcon.innerHTML = `
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM12 4L9.91 6.09 12 8.18V4zm-8.09-.09L2.81 5.09 6.82 9H4v6h4l5 5v-6.83l4.88 4.88c-.62.47-1.31.85-2.08 1.09v2.01c1.3-.3 2.49-.93 3.47-1.76l2.62 2.62 1.41-1.41L4.82 2.81 3.91 3.91zM12 15.17L9.83 13H8v-2h1.83l.26-.26 1.91 1.91v2.52z"/>
            `;
            audioToggle.setAttribute('title', 'Play Background Daff');
        }
    }

    if (audioToggle && bgAudio && audioIcon) {
        audioToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgAudio.paused) {
                playAudio();
            } else {
                pauseAudio();
            }
        });
    }

});
