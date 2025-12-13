const promptView = document.getElementById('promptView');
const mainView = document.getElementById('mainView');
const birthForm = document.getElementById('birthForm');
const resetLink = document.getElementById('resetLink');
const statsToggle = document.getElementById('statsToggle');
const statsPanel = document.getElementById('statsPanel');
const streaksContainer = document.getElementById('streaksContainer');
const birthYearInput = document.getElementById('birthYear');
const birthMonthInput = document.getElementById('birthMonth');
const monthField = document.getElementById('monthField');
const yearField = document.getElementById('yearField');
const scrollPickerOverlay = document.getElementById('scrollPickerOverlay');
const scrollPickerList = document.getElementById('scrollPickerList');
const scrollPickerContainer = document.getElementById('scrollPickerContainer');
const scrollPickerTitle = document.getElementById('scrollPickerTitle');
const scrollPickerClose = document.getElementById('scrollPickerClose');

let streakInterval = null;
let currentPickerType = null;

const months = [
    { value: 1, label: 'january' },
    { value: 2, label: 'february' },
    { value: 3, label: 'march' },
    { value: 4, label: 'april' },
    { value: 5, label: 'may' },
    { value: 6, label: 'june' },
    { value: 7, label: 'july' },
    { value: 8, label: 'august' },
    { value: 9, label: 'september' },
    { value: 10, label: 'october' },
    { value: 11, label: 'november' },
    { value: 12, label: 'december' }
];

function init() {
    const storedData = localStorage.getItem('birthDate');
    
    if (storedData) {
        const birthDate = JSON.parse(storedData);
        showMainView(birthDate, true);
    } else {
        showPromptView();
    }
    
    setupPickers();
}

function setupPickers() {
    monthField.addEventListener('click', () => openPicker('month'));
    yearField.addEventListener('click', () => openPicker('year'));
    
    scrollPickerClose.addEventListener('click', closePicker);
    scrollPickerOverlay.addEventListener('click', (e) => {
        if (e.target === scrollPickerOverlay) {
            closePicker();
        }
    });
}

function openPicker(type) {
    currentPickerType = type;
    scrollPickerList.innerHTML = '';
    
    if (type === 'month') {
        scrollPickerTitle.textContent = 'select month';
        
        months.forEach(month => {
            const option = document.createElement('div');
            option.className = 'scroll-picker-option';
            option.textContent = month.label;
            option.dataset.value = month.value;
            
            if (birthMonthInput.value === String(month.value)) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => selectOption(option, month.value, month.label));
            scrollPickerList.appendChild(option);
        });
    } else {
        scrollPickerTitle.textContent = 'select year';
        
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 100;
        
        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('div');
            option.className = 'scroll-picker-option';
            option.textContent = year;
            option.dataset.value = year;
            
            if (birthYearInput.value === String(year)) {
                option.classList.add('selected');
            }
            
            option.addEventListener('click', () => selectOption(option, year, year));
            scrollPickerList.appendChild(option);
        }
    }
    
    scrollPickerOverlay.classList.add('active');
    
    // Scroll to selected item if exists
    setTimeout(() => {
        const selected = scrollPickerList.querySelector('.selected');
        if (selected) {
            selected.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
    }, 50);
}

function selectOption(element, value, label) {
    // Remove selected from all options
    scrollPickerList.querySelectorAll('.scroll-picker-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selected to clicked option
    element.classList.add('selected');
    
    // Update the appropriate field
    if (currentPickerType === 'month') {
        birthMonthInput.value = value;
        const fieldText = monthField.querySelector('.scroll-field-text');
        fieldText.textContent = label;
        fieldText.classList.remove('placeholder');
    } else {
        birthYearInput.value = value;
        const fieldText = yearField.querySelector('.scroll-field-text');
        fieldText.textContent = label;
        fieldText.classList.remove('placeholder');
    }
}

function closePicker() {
    scrollPickerOverlay.classList.remove('active');
    currentPickerType = null;
}

function resetSelectors() {
    birthMonthInput.value = '';
    birthYearInput.value = '';
    
    const monthText = monthField.querySelector('.scroll-field-text');
    monthText.textContent = 'select month...';
    monthText.classList.add('placeholder');
    
    const yearText = yearField.querySelector('.scroll-field-text');
    yearText.textContent = 'select year...';
    yearText.classList.add('placeholder');
}

function showPromptView(animate = false) {
    stopStreaks();
    
    if (animate) {
        // Reverse animation
        animateBackgroundReverse(() => {
            promptView.classList.add('active');
            promptView.classList.add('fade-in');
            mainView.classList.remove('active');
            
            // Remove fade-in class after animation completes
            setTimeout(() => {
                promptView.classList.remove('fade-in');
            }, 500);
        });
    } else {
        promptView.classList.add('active');
        mainView.classList.remove('active');
        document.documentElement.style.setProperty('--saturation', '100%');
        document.documentElement.style.setProperty('--flood-progress', '0%');
        document.documentElement.style.setProperty('--reverse-flood-progress', '0%');
    }
}

function animateBackgroundReverse(callback) {
    const duration = 2000;
    const startTime = performance.now();
    
    const transitionGlow = document.getElementById('transitionGlow');
    
    // Reset reverse flood progress
    document.documentElement.style.setProperty('--reverse-flood-progress', '0%');
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        // Sweep the saturated color from right to left
        document.documentElement.style.setProperty('--reverse-flood-progress', (easedProgress * 100) + '%');
        
        // Update glow position (moving right to left)
        if (transitionGlow) {
            const glowPosition = 100 - (easedProgress * 100);
            transitionGlow.style.left = `calc(${glowPosition}% - 15px)`;
            
            // Fade in at start, fade out at end
            let glowOpacity = 1;
            if (progress < 0.1) {
                glowOpacity = progress / 0.1;
            } else if (progress > 0.9) {
                glowOpacity = (1 - progress) / 0.1;
            }
            transitionGlow.style.opacity = glowOpacity;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Reset everything for next use
            document.documentElement.style.setProperty('--saturation', '100%');
            document.documentElement.style.setProperty('--flood-progress', '0%');
            document.documentElement.style.setProperty('--reverse-flood-progress', '0%');
            if (transitionGlow) {
                transitionGlow.style.opacity = 0;
            }
            if (callback) callback();
        }
    }
    
    requestAnimationFrame(animate);
}

function showMainView(birthDate, instant = false) {
    promptView.classList.remove('active');
    mainView.classList.add('active');
    updateStats(birthDate);
    
    if (instant) {
        setBackgroundInstant(birthDate);
        startStreaks(birthDate);
    } else {
        animateBackground(birthDate);
        // Start streaks after the background animation completes
        setTimeout(() => startStreaks(birthDate), 2000);
    }
}

function setBackgroundInstant(birthDate) {
    const saturation = calculateSaturation(birthDate);
    document.documentElement.style.setProperty('--saturation', saturation + '%');
    document.documentElement.style.setProperty('--flood-progress', '100%');
}

function calculateAge(birthDate) {
    const birth = new Date(birthDate.year, birthDate.month - 1, 1);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function calculateSaturation(birthDate) {
    const age = calculateAge(birthDate);
    const maxAge = 75;
    const ageRatio = Math.min(age / maxAge, 1);
    const minSaturation = 33;
    return Math.max(minSaturation, 100 - (ageRatio * (100 - minSaturation)));
}

function animateBackground(birthDate) {
    const saturation = calculateSaturation(birthDate);
    document.documentElement.style.setProperty('--saturation', saturation + '%');
    
    const transitionGlow = document.getElementById('transitionGlow');
    
    const duration = 2000;
    const startTime = performance.now();
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        document.documentElement.style.setProperty('--flood-progress', (easedProgress * 100) + '%');
        
        // Update glow position and opacity
        if (transitionGlow) {
            const glowPosition = easedProgress * 100;
            transitionGlow.style.left = `calc(${glowPosition}% - 15px)`;
            
            // Fade in at start, fade out at end
            let glowOpacity = 1;
            if (progress < 0.1) {
                glowOpacity = progress / 0.1;
            } else if (progress > 0.9) {
                glowOpacity = (1 - progress) / 0.1;
            }
            transitionGlow.style.opacity = glowOpacity;
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (transitionGlow) {
                transitionGlow.style.opacity = 0;
            }
        }
    }
    
    requestAnimationFrame(animate);
}

function createStreak(birthDate) {
    const streak = document.createElement('div');
    streak.className = 'streak';
    
    const age = calculateAge(birthDate);
    const maxAge = 75;
    const ageRatio = Math.min(age / maxAge, 1);
    
    // Random vertical position
    const topPosition = Math.random() * 100;
    streak.style.top = topPosition + '%';
    
    // INVERTED: Width is larger for younger, smaller for older
    // Young: 600-900px, Old: 50-150px
    const minWidth = 50 + (1 - ageRatio) * 550;  // Young: 600, Old: 50
    const maxWidth = 150 + (1 - ageRatio) * 750; // Young: 900, Old: 150
    const width = minWidth + Math.random() * (maxWidth - minWidth);
    streak.style.width = width + 'px';
    
    // Brightness: younger = brighter streaks
    const baseOpacity = 0.3 + (1 - ageRatio) * 0.5; // Young: 0.8, Old: 0.3
    streak.style.setProperty('--streak-opacity', baseOpacity);
    
    // INVERTED: Duration is longer for younger (slower), shorter for older (faster)
    // Young: 4-6 seconds (leisurely), Old: 0.8-1.5 seconds (zipping by)
    const minDuration = 0.8 + (1 - ageRatio) * 3.2;  // Young: 4, Old: 0.8
    const maxDuration = 1.5 + (1 - ageRatio) * 4.5;  // Young: 6, Old: 1.5
    const duration = minDuration + Math.random() * (maxDuration - minDuration);
    streak.style.animationDuration = duration + 's';
    
    // Slight random delay for staggering
    const delay = Math.random() * 0.3;
    streak.style.animationDelay = delay + 's';
    
    streaksContainer.appendChild(streak);
    
    // Remove streak after animation completes
    setTimeout(() => {
        if (streak.parentNode) {
            streak.parentNode.removeChild(streak);
        }
    }, (duration + delay) * 1000 + 100);
}

function startStreaks(birthDate) {
    stopStreaks();
    
    const age = calculateAge(birthDate);
    
    // INVERTED: More streaks for older, fewer for younger
    // Young (0): rare, ~4000ms between streaks
    // Old (75+): very frequent, ~200ms between streaks
    const maxAge = 75;
    const minInterval = 200;   // milliseconds for oldest (frequent)
    const maxInterval = 4000;  // milliseconds for youngest (rare)
    
    const ageRatio = Math.min(age / maxAge, 1);
    // Use exponential curve - older = more frequent
    const interval = maxInterval - (maxInterval - minInterval) * Math.pow(ageRatio, 1.5);
    
    // Create initial burst of streaks (more for older)
    const initialBurst = Math.max(1, Math.floor(1 + ageRatio * 5));
    for (let i = 0; i < initialBurst; i++) {
        setTimeout(() => createStreak(birthDate), i * 200);
    }
    
    // Continue creating streaks at calculated interval
    streakInterval = setInterval(() => {
        createStreak(birthDate);
        
        // Occasionally create a second streak for older ages
        if (Math.random() < ageRatio && Math.random() > 0.5) {
            setTimeout(() => createStreak(birthDate), 50 + Math.random() * 100);
        }
    }, interval);
}

function stopStreaks() {
    if (streakInterval) {
        clearInterval(streakInterval);
        streakInterval = null;
    }
    // Clear any existing streaks
    if (streaksContainer) {
        streaksContainer.innerHTML = '';
    }
}

function updateStats(birthDate) {
    const birth = new Date(birthDate.year, birthDate.month - 1, 1);
    const today = new Date();
    
    const age = calculateAge(birthDate);
    
    const msPerDay = 1000 * 60 * 60 * 24;
    const msPerWeek = msPerDay * 7;
    
    const daysLived = Math.floor((today - birth) / msPerDay);
    const weeksLived = Math.floor((today - birth) / msPerWeek);
    
    const totalDays = 75 * 365;
    const totalWeeks = 75 * 52;
    const daysRemaining = Math.max(0, totalDays - daysLived);
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    
    document.getElementById('currentAge').textContent = age + ' years';
    document.getElementById('daysLived').textContent = daysLived.toLocaleString();
    document.getElementById('weeksLived').textContent = weeksLived.toLocaleString();
    document.getElementById('weeksRemaining').textContent = weeksRemaining.toLocaleString();
    document.getElementById('daysRemaining').textContent = daysRemaining.toLocaleString();
}

birthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const birthYear = birthYearInput.value;
    const birthMonth = birthMonthInput.value;
    
    if (!birthYear || !birthMonth) {
        return;
    }
    
    const birthDate = {
        month: parseInt(birthMonth),
        year: parseInt(birthYear)
    };
    
    localStorage.setItem('birthDate', JSON.stringify(birthDate));
    showMainView(birthDate, false);
});

resetLink.addEventListener('click', () => {
    localStorage.removeItem('birthDate');
    resetSelectors();
    statsPanel.classList.remove('open');
    statsToggle.classList.remove('open');
    showPromptView(true);
});

statsToggle.addEventListener('click', () => {
    statsPanel.classList.toggle('open');
    statsToggle.classList.toggle('open');
});

init();