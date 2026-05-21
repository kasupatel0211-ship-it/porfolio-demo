document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Particles Background
    initParticles();

    // 2. Initialize Custom Cursor
    initCustomCursor();

    // 3. Initialize Scroll Reveals
    initScrollReveal();

    // 4. Initialize Mobile Hamburger Menu
    initMobileMenu();

    // 5. Initialize 3D Card Tilts
    initCardTilts();

    // 6. Initialize Contact Form submits
    initContactForm();

    // 7. Initialize Dynamic SPA Router
    initDynamicRouter();

    // 7.5. Initialize Resume Downloader
    initResumeDownloader();

    // 8. Sticky Nav logic
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 9. Initial logo visibility
    const initialFile = window.location.pathname.split('/').pop() || 'index.html';
    updateLogoVisibility(initialFile);
});

/* ==========================================
   1. CANVAS STARRY PARTICLES BACKGROUND
   ========================================== */
function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 100 };

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 10;
            // Star twinkle speed
            this.alpha = Math.random();
            this.alphaChange = Math.random() * 0.02 + 0.005;
            // Drifting speeds
            this.vx = Math.random() * 0.2 - 0.1;
            this.vy = Math.random() * 0.2 - 0.1;
        }

        draw() {
            ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha})`; // Cyan stars
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            // Twinkle
            this.alpha += this.alphaChange;
            if (this.alpha > 0.95 || this.alpha < 0.1) {
                this.alphaChange = -this.alphaChange;
            }

            // Normal drifting
            this.x += this.vx;
            this.y += this.vy;

            // Loop edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;

            // Cursor interactive pull (only on desktop screen size)
            if (window.innerWidth > 768 && mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = dx / distance;
                    let directionY = dy / distance;
                    // Move slightly towards mouse
                    this.x += directionX * force * 1.5;
                    this.y += directionY * force * 1.5;
                }
            }
        }
    }

    // Initialize stars (fewer on mobile for speed optimization)
    const particleCount = window.innerWidth < 768 ? 40 : 100;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================
   2. CUSTOM FLOATING CURSOR
   ========================================== */
function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on mobile/touch screens

    const dot = document.createElement('div');
    dot.className = 'custom-cursor';
    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    // Smooth ring transition
    function tick() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        requestAnimationFrame(tick);
    }
    tick();

    // Attach custom event delegation to handle dynamic elements
    const hoverables = 'a, button, .skill-tag, .logo, .menu-toggle, .form-control';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverables)) {
            dot.classList.add('hovered');
            ring.classList.add('hovered');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverables)) {
            dot.classList.remove('hovered');
            ring.classList.remove('hovered');
        }
    });
}

/* ==========================================
   3. SCROLL REVEAL (Intersection Observer)
   ========================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

/* ==========================================
   4. MOBILE NAVIGATION MENU
   ========================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navList = document.querySelector('nav ul');
    if (!menuBtn || !navList) return;

    // Reset icons & classes
    navList.classList.remove('nav-active');
    const icon = menuBtn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-bars';

    // Click toggle
    menuBtn.onclick = (e) => {
        e.stopPropagation();
        navList.classList.toggle('nav-active');
        if (navList.classList.contains('nav-active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    };

    // Close menu when clicking outside
    document.onclick = (e) => {
        if (!navList.contains(e.target) && !menuBtn.contains(e.target)) {
            navList.classList.remove('nav-active');
            icon.className = 'fa-solid fa-bars';
        }
    };
}

/* ==========================================
   5. 3D CARD TILT EFFECT
   ========================================== */
function initCardTilts() {
    if (window.innerWidth < 768) return; // Avoid processing on mobile/tablet screens
    const cards = document.querySelectorAll('.project-card, .edu-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xc = rect.width / 2;
            const yc = rect.height / 2;

            const angleX = -(y - yc) / (rect.height / 10);
            const angleY = (x - xc) / (rect.width / 10);

            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });
}

/* ==========================================
   6. CONTACT FORM SUBMISSION
   ========================================== */
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = form.querySelector('.form-submit-btn');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            showNotification('Message received! I will get back to you shortly.', 'success');
            form.reset();
            btn.innerHTML = origText;
            btn.style.pointerEvents = 'all';
        }, 1500);
    });
}

function showNotification(message, type) {
    let container = document.querySelector('.form-notification');
    if (!container) {
        container = document.createElement('div');
        container.className = 'form-notification';
        document.body.appendChild(container);
    }

    container.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    container.classList.add('active');

    setTimeout(() => {
        container.classList.remove('active');
    }, 4000);
}

/* ==========================================
   7. DYNAMIC DUAL SPA-ROUTER (TRANSITIONS)
   ========================================== */
function initDynamicRouter() {
    // 1. Create global overlay if not present
    let overlay = document.querySelector('.transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'transition-overlay';
        document.body.appendChild(overlay);
    }

    // 2. Click Handler delegation
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        // Skip absolute links, blank pages, mailto, tel, downloads, or anchor jumps
        if (href.startsWith('http') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') || 
            href.startsWith('#') ||
            link.hasAttribute('download') || 
            link.target === '_blank') {
            return;
        }

        e.preventDefault();
        navigateToPage(href);
    });

    // 3. Browser forward/back events
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.href) {
            navigateToPage(e.state.href, false);
        } else {
            navigateToPage(window.location.pathname, false);
        }
    });

    // Store state on initial load
    window.history.replaceState({ href: window.location.pathname.split('/').pop() || 'index.html' }, document.title, window.location.pathname);
}

async function navigateToPage(url, pushState = true) {
    const overlay = document.querySelector('.transition-overlay');
    if (!overlay) return;

    // Trigger overlay in (Scale Wipe Up)
    overlay.classList.add('active');

    setTimeout(async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error loading page.');

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newContentEl = doc.querySelector('#main-content');
            const targetContentEl = document.querySelector('#main-content');

            if (newContentEl && targetContentEl) {
                // Update Title
                document.title = doc.querySelector('title').innerText;
                
                // Swap main inner HTML
                targetContentEl.innerHTML = newContentEl.innerHTML;

                // Scroll to top
                window.scrollTo(0, 0);

                // Update active navigation state
                const filename = url.split('/').pop() || 'index.html';
                updateActiveLink(filename);
                updateLogoVisibility(filename);

                // Push browser history state
                if (pushState) {
                    window.history.pushState({ href: filename }, document.title, filename);
                }

                // Re-initialize dynamic layout components
                initScrollReveal();
                initCardTilts();
                initContactForm();
                initMobileMenu(); // Rebind mobile menus if links exist
            }
        } catch (err) {
            console.error('Error switching page: ', err);
            // On fail, let normal browser redirect do the job
            window.location.href = url;
        }

        // Trigger overlay out
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 300);

    }, 550); // Match transit timing in style.css
}

function updateActiveLink(filename) {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === filename) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateLogoVisibility(filename) {
    const logo = document.querySelector('.logo');
    if (!logo) return;
    if (filename === 'index.html' || filename === '' || filename === '/') {
        logo.classList.add('hidden');
    } else {
        logo.classList.remove('hidden');
    }
}

/* ==========================================
   RESUME DOWNLOADER SYSTEM
   ========================================== */
let resumeDownloadTimer = null;

function initResumeDownloader() {
    // 1. Create the overlay markup if not present
    let overlay = document.getElementById('resume-download-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'resume-download-overlay';
        overlay.className = 'resume-download-overlay';
        overlay.innerHTML = `
            <div class="resume-download-card">
                <button class="resume-close-btn" id="resume-close-btn" aria-label="Close">&times;</button>
                <div class="resume-download-icon-box" id="resume-icon-box">
                    <i class="fa-solid fa-file-pdf"></i>
                </div>
                <h2>Kashish Patel's Resume</h2>
                <p class="subtitle">Direct PDF Download from Google Drive</p>
                
                <div class="resume-progress-container">
                    <div class="resume-progress-track">
                        <div class="resume-progress-bar" id="resume-progress-bar"></div>
                    </div>
                    <span class="resume-status-text" id="resume-status-text">Connecting to secure storage...</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // 2. Event Listeners for closing
        const closeBtn = overlay.querySelector('#resume-close-btn');
        closeBtn.addEventListener('click', closeResumeDownloader);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeResumeDownloader();
            }
        });
    }

    // 3. Global click delegation for triggering the download (matches the SPA router seamlessly)
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.resume-trigger');
        if (trigger) {
            e.preventDefault();
            openResumeDownloader();
        }
    });
}

function openResumeDownloader() {
    const overlay = document.getElementById('resume-download-overlay');
    if (!overlay) return;

    // Reset overlay UI state
    const progressBar = overlay.querySelector('#resume-progress-bar');
    const statusText = overlay.querySelector('#resume-status-text');
    const iconBox = overlay.querySelector('#resume-icon-box');

    progressBar.style.width = '0%';
    statusText.innerText = 'Connecting to secure cloud storage...';
    statusText.className = 'resume-status-text';
    iconBox.className = 'resume-download-icon-box';
    iconBox.innerHTML = '<i class="fa-solid fa-file-pdf"></i>';

    // Show the modal
    overlay.classList.add('active');

    // Cancel any ongoing timer
    if (resumeDownloadTimer) clearInterval(resumeDownloadTimer);

    // Start progress simulation
    let progress = 0;
    const totalDuration = 1600; // 1.6s total time
    const intervalTime = 16; // ~60fps updates
    const increment = 100 / (totalDuration / intervalTime);

    resumeDownloadTimer = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(resumeDownloadTimer);
            resumeDownloadTimer = null;

            // Trigger success state
            progressBar.style.width = '100%';
            statusText.innerText = 'Download started successfully!';
            statusText.classList.add('success');
            iconBox.classList.add('success');
            iconBox.innerHTML = '<i class="fa-solid fa-circle-check"></i>';

            // Trigger actual download of the Google Drive PDF
            const fileId = '1OrlYPA4mO-gdbkA899E7rPCpn_FxZLlQ';
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
            
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = 'Kashish_Patel_Resume.pdf';
            downloadLink.target = '_blank'; // Fail-safe: open in a new tab if direct download is blocked by Chrome sandbox
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Auto-close overlay after 1.6s success display
            setTimeout(() => {
                // Ensure we only close if the overlay is still active and hasn't been closed manually
                if (overlay.classList.contains('active') && iconBox.classList.contains('success')) {
                    closeResumeDownloader();
                }
            }, 1600);
        } else {
            progressBar.style.width = `${progress}%`;
            
            // Dynamic premium high-tech status messages
            if (progress < 30) {
                statusText.innerText = 'Connecting to secure cloud storage...';
            } else if (progress < 70) {
                statusText.innerText = 'Retrieving PDF document...';
            } else {
                statusText.innerText = 'Initiating download...';
            }
        }
    }, intervalTime);
}

function closeResumeDownloader() {
    const overlay = document.getElementById('resume-download-overlay');
    if (!overlay) return;

    overlay.classList.remove('active');

    // Cancel any active animation timer
    if (resumeDownloadTimer) {
        clearInterval(resumeDownloadTimer);
        resumeDownloadTimer = null;
    }
}