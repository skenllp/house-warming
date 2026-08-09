document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const introOverlay = document.getElementById('intro-overlay');
    const introVideo = document.getElementById('intro-video');
    const bgAudio = document.getElementById('bg-audio');
    const audioToggle = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');

    // ==========================================
    // AUDIO HELPER FUNCTIONS
    // ==========================================
    function playAudio() {
        if (bgAudio && bgAudio.paused) {
            bgAudio.play()
                .then(() => {
                    if (audioIcon) {
                        audioIcon.innerHTML = `
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        `;
                    }
                    if (audioToggle) audioToggle.setAttribute('title', 'Pause Music');
                })
                .catch(err => {
                    console.log("Audio playback failed:", err);
                });
        }
    }

    function pauseAudio() {
        if (bgAudio && !bgAudio.paused) {
            bgAudio.pause();
            if (audioIcon) {
                audioIcon.innerHTML = `
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM12 4L9.91 6.09 12 8.18V4zm-8.09-.09L2.81 5.09 6.82 9H4v6h4l5 5v-6.83l4.88 4.88c-.62.47-1.31.85-2.08 1.09v2.01c1.3-.3 2.49-.93 3.47-1.76l2.62 2.62 1.41-1.41L4.82 2.81 3.91 3.91zM12 15.17L9.83 13H8v-2h1.83l.26-.26 1.91 1.91v2.52z"/>
                `;
            }
            if (audioToggle) audioToggle.setAttribute('title', 'Play Music');
        }
    }

    // Try playing audio immediately when page loads
    playAudio();

    // ==========================================
    // 0. HOUSE INTRO VIDEO & SMOOTH HERO REVEAL
    // ==========================================
    const openInvitationBtn = document.getElementById('open-invitation-btn');
    const introStartCard = document.getElementById('intro-start-card');

    if (introOverlay) {
        document.body.style.overflow = 'hidden';
        let introEndedOrSkipped = false;
        let videoStarted = false;

        function startVideoAndAudioSimultaneously() {
            if (videoStarted) return;
            videoStarted = true;

            if (introStartCard) {
                introStartCard.classList.add('is-hidden');
            }

            // Simultaneously start background music
            playAudio();

            // Play video from start
            if (introVideo) {
                try {
                    introVideo.currentTime = 0;
                    introVideo.play().catch(err => console.log("Video play:", err));
                } catch(e) {}
            }
        }

        if (openInvitationBtn) {
            openInvitationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startVideoAndAudioSimultaneously();
            });
        }

        function finishIntroAndMoveToHero() {
            if (introEndedOrSkipped) return;
            introEndedOrSkipped = true;

            document.body.style.overflow = '';
            introOverlay.classList.add('is-fading');

            if (introVideo) {
                try { introVideo.pause(); } catch(e) {}
            }

            // Animate transition to hero contents smoothly with GSAP
            setTimeout(() => {
                introOverlay.classList.add('is-done');
                introOverlay.remove();

                if (window.gsap) {
                    gsap.from(".hero-bg img", { scale: 1.15, opacity: 0.3, duration: 1.4, ease: "power3.out" });
                    gsap.from(".hero-content > *", { y: 60, opacity: 0, stagger: 0.15, duration: 1.2, ease: "power3.out" });
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 800);

            // Ensure background music keeps playing
            playAudio();
        }

        if (introVideo) {
            introVideo.muted = true;
            introVideo.addEventListener('ended', finishIntroAndMoveToHero);
            introVideo.addEventListener('error', finishIntroAndMoveToHero);
        }

        // Tapping overlay after video starts skips to hero section; before start, triggers play
        introOverlay.addEventListener('click', () => {
            if (!videoStarted) {
                startVideoAndAudioSimultaneously();
            } else {
                finishIntroAndMoveToHero();
            }
        });
    }

    // ==========================================
    // 1. LIVE COUNTDOWN TIMER
    // Target: 19 August 2026, 10:00 AM (Indian Standard Time: +05:30)
    // ==========================================
    const targetDate = new Date('2026-08-19T10:00:00+05:30').getTime();

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
            if (titleEl) titleEl.innerText = "The Celebration Has Begun!";
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
    // 2. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }


    // ==========================================
    // 3. AUDIO CONTROLLER TOGGLE & FALLBACK
    // ==========================================
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

    // Fallback: start music on first user interaction if browser blocked autoplay initially
    let musicStarted = false;
    function tryStartMusicOnce() {
        if (musicStarted || !bgAudio) return;
        if (bgAudio.paused) {
            playAudio();
            musicStarted = true;
        }
    }
    ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
        document.addEventListener(evt, tryStartMusicOnce, { once: true, passive: true });
    });


    // ==========================================
    // 4. FLOATING PARTICLES (ambient gold dust)
    // ==========================================
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        const particleCount = window.innerWidth < 768 ? 16 : 28;
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = 3 + Math.random() * 4;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}%`;
            p.style.setProperty('--drift', `${(Math.random() * 60 - 30)}px`);
            const duration = 10 + Math.random() * 12;
            p.style.animationDuration = `${duration}s`;
            p.style.animationDelay = `${Math.random() * duration}s`;
            particlesContainer.appendChild(p);
        }
    }


    // ==========================================
    // 5. HERO PARALLAX ON SCROLL (subtle)
    // ==========================================
    const heroImg = document.getElementById('heroImg');
    if (heroImg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const offset = window.scrollY;
                    if (offset < window.innerHeight) {
                        heroImg.style.transform = `translateY(${offset * 0.15}px) scale(1.08)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    // ==========================================
    // 6. SCROLL CUE CLICK HANDLER
    // ==========================================
    const scrollCue = document.getElementById('scroll-cue');
    if (scrollCue) {
        function scrollToNextSection() {
            const aboutSection = document.querySelector('.about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        scrollCue.addEventListener('click', scrollToNextSection);
        scrollCue.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToNextSection();
            }
        });
    }

});
