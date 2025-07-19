document.addEventListener('DOMContentLoaded', () => {

    console.log("%c[+] System Initialized.", "color: #2dd4bf; font-weight: bold;");
    console.log("Welcome to my portfolio. Feel free to inspect the source or use the terminal in the contact section.");

    // --- MUSIC PROMPT LOGIC (Asks every time) ---
    const musicPromptOverlay = document.getElementById('music-prompt-overlay');
    const playMusicBtn = document.getElementById('play-music-btn');
    const declineMusicBtn = document.getElementById('decline-music-btn');
    const audio = document.getElementById('background-music');

    // Show the prompt on every page load
    musicPromptOverlay.classList.add('visible');

    const handleMusicChoice = (play) => {
        if (play) {
            audio.volume = 0.2;
            audio.play().catch(e => console.error("Audio play failed:", e));
        }
        musicPromptOverlay.classList.remove('visible');
    };

    playMusicBtn.addEventListener('click', () => handleMusicChoice(true));
    declineMusicBtn.addEventListener('click', () => handleMusicChoice(false));


    // --- THEME TOGGLE ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggleBtn.querySelector('i');
    const applyTheme = (theme) => {
        body.dataset.theme = theme;
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', theme);
        const giscusFrame = document.querySelector('iframe.giscus-frame');
        if (giscusFrame) {
            giscusFrame.contentWindow.postMessage({ giscus: { setConfig: { theme: theme === 'dark' ? 'dark_dimmed' : 'light' } } }, 'https://giscus.app');
        }
    };
    themeToggleBtn.addEventListener('click', () => applyTheme(body.dataset.theme === 'dark' ? 'light' : 'dark'));
    applyTheme(localStorage.getItem('theme') || 'dark');

    // --- TYPING EFFECT ---
    const typingTextElement = document.getElementById('typing-text');
    if (typingTextElement) {
        const phrases = ["Cybersecurity Specialist.", "Ethical Hacker.", "Penetration Tester.", "Software Developer."];
        let phraseIndex = 0, charIndex = 0, isDeleting = false;
        const type = () => {
            const currentPhrase = phrases[phraseIndex];
            typingTextElement.textContent = currentPhrase.substring(0, charIndex);
            if (isDeleting) charIndex--; else charIndex++;
            let typeSpeed = isDeleting ? 40 : 100;
            if (!isDeleting && charIndex === currentPhrase.length) { isDeleting = true; typeSpeed = 2000; }
            else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; typeSpeed = 500; }
            setTimeout(type, typeSpeed);
        };
        type();
    }
    
    // --- HEADER, SCROLL-SPY & SCROLL-TO-TOP ---
    const header = document.getElementById('header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);

        let current = 'hero';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 105) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
    scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    
    // --- MOBILE NAV ---
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const nav = document.getElementById('nav');
    mobileNavToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        mobileNavToggle.innerHTML = nav.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    navLinks.forEach(link => link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }));

    // --- FADE IN ON SCROLL ---
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    fadeElements.forEach(el => fadeObserver.observe(el));

    // --- PROJECT MODALS ---
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modal = document.querySelector(trigger.dataset.modalTarget);
            modal.classList.add('active');
        });
    });
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.classList.remove('active');
            }
        });
    });

    // --- INTERACTIVE TERMINAL ---
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const neofetch = `<span style="color:var(--accent-primary)">
                 ,MMM8&&&.
            _...MMMMM88&&&&..._
         .::'''MMMMM88&&&&&&'''::.
        ::     MMMMM88&&&&&&     ::
        '::....MMMMM88&&&&&&....::'
           ':'.:.MMMMM88&&.:.':'
             ':.':..:&..:':'
                 '::--::'
</span>
<span style="color:var(--accent-primary)">joe@longno.co.uk</span>
------------------
<span style="color:var(--accent-primary)">OS:</span>      Windows 11
<span style="color:var(--accent-primary)">Host:</span>    Main PC
<span style="color:var(--accent-primary)">Shell:</span>   cmd.exe
<span style="color:var(--accent-primary)">Focus:</span>   Cybersecurity
`;
    const commands = {
        help: "Commands: help, whoami, projects, contact, social, neofetch, clear",
        whoami: "Joe Savage (Longno) - Cybersecurity enthusiast, developer, and professional button-pusher.",
        projects: "Featured Projects: Secure Game Hub, Vulnerability Dashboard, Dynamic Digital Clock. (Click the cards on the main page for detailed case studies).",
        contact: "The best way to reach me is on Discord: 2025Joe",
        social: "Find me on:\n- GitHub:      https://github.com/Longno12\n- TryHackMe:   https://tryhackme.com/p/Longno\n- Bugcrowd:    https://bugcrowd.com/Longno",
        neofetch: neofetch,
    };
    const printToTerminal = (text, type = 'response') => {
        terminalOutput.innerHTML += `<div class="terminal-line terminal-${type}">${text.replace(/\n/g, '<br>')}</div>`;
        terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
    };
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && terminalInput.value) {
            const command = terminalInput.value.trim().toLowerCase();
            printToTerminal(`<span class="terminal-prompt">guest@longno.co.uk:~$</span> <span class="terminal-command">${command}</span>`);
            if (command === 'clear') terminalOutput.innerHTML = '';
            else if (commands[command]) printToTerminal(commands[command]);
            else printToTerminal(`Command not found: ${command}. Type 'help'.`);
            terminalInput.value = '';
        }
    });
    printToTerminal("Welcome! Type 'help' to get started.");

    // --- FOOTER YEAR ---
    document.getElementById('year').textContent = new Date().getFullYear();
});