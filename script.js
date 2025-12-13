// DOM Elements
const elements = {
    promptView: document.getElementById('promptView'),
    mainView: document.getElementById('mainView'),
    birthForm: document.getElementById('birthForm'),
    resetLink: document.getElementById('resetLink'),
    statsToggle: document.getElementById('statsToggle'),
    statsPanel: document.getElementById('statsPanel'),
    streaksContainer: document.getElementById('streaksContainer'),
    birthYearInput: document.getElementById('birthYear'),
    birthMonthInput: document.getElementById('birthMonth'),
    monthField: document.getElementById('monthField'),
    yearField: document.getElementById('yearField'),
    scrollPickerOverlay: document.getElementById('scrollPickerOverlay'),
    scrollPickerList: document.getElementById('scrollPickerList'),
    scrollPickerTitle: document.getElementById('scrollPickerTitle'),
    scrollPickerClose: document.getElementById('scrollPickerClose'),
    transitionGlow: document.getElementById('transitionGlow')
};

// Constants
const MONTHS = [
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

const CONFIG = {
    maxAge: 75,
    minSaturation: 33,
    animationDuration: 2000
};

// State
let streakInterval = null;
let currentPickerType = null;

// Utility functions
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

const setCSSVar = (name, value) => {
    document.documentElement.style.setProperty(name, value);
};

const calculateAge = (birthDate) => {
    const birth = new Date(birthDate.year, birthDate.month - 1, 1);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const calculateSaturation = (birthDate) => {
    const age = calculateAge(birthDate);
    const ageRatio = Math.min(age / CONFIG.maxAge, 1);
    return Math.max(CONFIG.minSaturation, 100 - (ageRatio * (100 - CONFIG.minSaturation)));
};

const getAgeRatio = (birthDate) => Math.min(calculateAge(birthDate) / CONFIG.maxAge, 1);

// Animation helper
const animate = (duration, onFrame, onComplete) => {
    const startTime = performance.now();
    
    const tick = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        
        onFrame(progress, easedProgress);
        
        if (progress < 1) {
            requestAnimationFrame(tick);
        } else if (onComplete) {
            onComplete();
        }
    };
    
    requestAnimationFrame(tick);
};

// Glow animation helper
const animateGlow = (progress, getPosition) => {
    const glow = elements.transitionGlow;
    if (!glow) return;
    
    glow.style.left = `calc(${getPosition(progress)}% - 15px)`;
    
    let opacity = 1;
    if (progress < 0.1) opacity = progress / 0.1;
    else if (progress > 0.9) opacity = (1 - progress) / 0.1;
    glow.style.opacity = opacity;
};

// Picker functions
const openPicker = (type) => {
    currentPickerType = type;
    elements.scrollPickerList.innerHTML = '';
    
    const items = type === 'month' 
        ? MONTHS.map(m => ({ value: m.value, label: m.label }))
        : Array.from({ length: 101 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return { value: year, label: year };
        });
    
    elements.scrollPickerTitle.textContent = `select ${type}`;
    const currentValue = type === 'month' 
        ? elements.birthMonthInput.value 
        : elements.birthYearInput.value;
    
    items.forEach(item => {
        const option = document.createElement('div');
        option.className = 'scroll-picker-option';
        option.textContent = item.label;
        option.dataset.value = item.value;
        
        if (currentValue === String(item.value)) {
            option.classList.add('selected');
        }
        
        option.addEventListener('click', () => selectOption(option, item.value, item.label));
        elements.scrollPickerList.appendChild(option);
    });
    
    elements.scrollPickerOverlay.classList.add('active');
    
    setTimeout(() => {
        const selected = elements.scrollPickerList.querySelector('.selected');
        if (selected) selected.scrollIntoView({ block: 'center', behavior: 'auto' });
    }, 50);
};

const selectOption = (element, value, label) => {
    elements.scrollPickerList.querySelectorAll('.scroll-picker-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    
    const isMonth = currentPickerType === 'month';
    const input = isMonth ? elements.birthMonthInput : elements.birthYearInput;
    const field = isMonth ? elements.monthField : elements.yearField;
    
    input.value = value;
    const fieldText = field.querySelector('.scroll-field-text');
    fieldText.textContent = label;
    fieldText.classList.remove('placeholder');
};

const closePicker = () => {
    elements.scrollPickerOverlay.classList.remove('active');
    currentPickerType = null;
};

const resetSelectors = () => {
    elements.birthMonthInput.value = '';
    elements.birthYearInput.value = '';
    
    [elements.monthField, elements.yearField].forEach((field, i) => {
        const text = field.querySelector('.scroll-field-text');
        text.textContent = i === 0 ? 'select month...' : 'select year...';
        text.classList.add('placeholder');
    });
};

// Background animation
const animateBackground = (birthDate, reverse = false) => {
    const saturation = calculateSaturation(birthDate);
    
    if (!reverse) {
        setCSSVar('--saturation', saturation + '%');
    }
    
    const progressVar = reverse ? '--reverse-flood-progress' : '--flood-progress';
    if (reverse) setCSSVar('--reverse-flood-progress', '0%');
    
    return new Promise(resolve => {
        animate(
            CONFIG.animationDuration,
            (progress, easedProgress) => {
                setCSSVar(progressVar, (easedProgress * 100) + '%');
                animateGlow(progress, p => reverse ? 100 - (easeOutCubic(p) * 100) : easeOutCubic(p) * 100);
            },
            () => {
                if (elements.transitionGlow) elements.transitionGlow.style.opacity = 0;
                if (reverse) {
                    setCSSVar('--saturation', '100%');
                    setCSSVar('--flood-progress', '0%');
                    setCSSVar('--reverse-flood-progress', '0%');
                }
                resolve();
            }
        );
    });
};

const setBackgroundInstant = (birthDate) => {
    setCSSVar('--saturation', calculateSaturation(birthDate) + '%');
    setCSSVar('--flood-progress', '100%');
};

// Streaks
const createStreak = (birthDate) => {
    const streak = document.createElement('div');
    streak.className = 'streak';
    
    const ageRatio = getAgeRatio(birthDate);
    const inverseRatio = 1 - ageRatio;
    
    streak.style.top = Math.random() * 100 + '%';
    
    // Width: larger for younger
    const minWidth = 50 + inverseRatio * 550;
    const maxWidth = 150 + inverseRatio * 750;
    streak.style.width = (minWidth + Math.random() * (maxWidth - minWidth)) + 'px';
    
    // Brightness: younger = brighter
    streak.style.setProperty('--streak-opacity', 0.3 + inverseRatio * 0.5);
    
    // Duration: longer for younger (slower)
    const minDuration = 0.8 + inverseRatio * 3.2;
    const maxDuration = 1.5 + inverseRatio * 4.5;
    const duration = minDuration + Math.random() * (maxDuration - minDuration);
    streak.style.animationDuration = duration + 's';
    
    const delay = Math.random() * 0.3;
    streak.style.animationDelay = delay + 's';
    
    elements.streaksContainer.appendChild(streak);
    
    setTimeout(() => streak.remove(), (duration + delay) * 1000 + 100);
};

const startStreaks = (birthDate) => {
    stopStreaks();
    
    const ageRatio = getAgeRatio(birthDate);
    const interval = 4000 - (4000 - 200) * Math.pow(ageRatio, 1.5);
    
    // Initial burst
    const burstCount = Math.max(1, Math.floor(1 + ageRatio * 5));
    for (let i = 0; i < burstCount; i++) {
        setTimeout(() => createStreak(birthDate), i * 200);
    }
    
    streakInterval = setInterval(() => {
        createStreak(birthDate);
        if (Math.random() < ageRatio && Math.random() > 0.5) {
            setTimeout(() => createStreak(birthDate), 50 + Math.random() * 100);
        }
    }, interval);
};

const stopStreaks = () => {
    if (streakInterval) {
        clearInterval(streakInterval);
        streakInterval = null;
    }
    if (elements.streaksContainer) {
        elements.streaksContainer.innerHTML = '';
    }
};

// Stats
const updateStats = (birthDate) => {
    const birth = new Date(birthDate.year, birthDate.month - 1, 1);
    const today = new Date();
    const age = calculateAge(birthDate);
    
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLived = Math.floor((today - birth) / msPerDay);
    const weeksLived = Math.floor(daysLived / 7);
    
    const totalDays = CONFIG.maxAge * 365;
    const totalWeeks = CONFIG.maxAge * 52;
    
    document.getElementById('currentAge').textContent = age + ' years';
    document.getElementById('daysLived').textContent = daysLived.toLocaleString();
    document.getElementById('weeksLived').textContent = weeksLived.toLocaleString();
    document.getElementById('weeksRemaining').textContent = Math.max(0, totalWeeks - weeksLived).toLocaleString();
    document.getElementById('daysRemaining').textContent = Math.max(0, totalDays - daysLived).toLocaleString();
};

// View management
const showPromptView = async (animated = false) => {
    stopStreaks();
    
    if (animated) {
        await animateBackground({}, true);
    } else {
        setCSSVar('--saturation', '100%');
        setCSSVar('--flood-progress', '0%');
        setCSSVar('--reverse-flood-progress', '0%');
    }
    
    elements.promptView.classList.add('active');
    if (animated) elements.promptView.classList.add('fade-in');
    elements.mainView.classList.remove('active');
    
    if (animated) {
        setTimeout(() => elements.promptView.classList.remove('fade-in'), 500);
    }
};

const showMainView = async (birthDate, instant = false) => {
    elements.promptView.classList.remove('active');
    elements.mainView.classList.add('active');
    updateStats(birthDate);
    
    if (instant) {
        setBackgroundInstant(birthDate);
        startStreaks(birthDate);
    } else {
        await animateBackground(birthDate);
        startStreaks(birthDate);
    }
};

// Event listeners
const setupEventListeners = () => {
    elements.monthField.addEventListener('click', () => openPicker('month'));
    elements.yearField.addEventListener('click', () => openPicker('year'));
    elements.scrollPickerClose.addEventListener('click', closePicker);
    elements.scrollPickerOverlay.addEventListener('click', (e) => {
        if (e.target === elements.scrollPickerOverlay) closePicker();
    });
    
    elements.birthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const { birthYearInput, birthMonthInput } = elements;
        if (!birthYearInput.value || !birthMonthInput.value) return;
        
        const birthDate = {
            month: parseInt(birthMonthInput.value),
            year: parseInt(birthYearInput.value)
        };
        
        localStorage.setItem('birthDate', JSON.stringify(birthDate));
        showMainView(birthDate, false);
    });
    
    elements.resetLink.addEventListener('click', () => {
        localStorage.removeItem('birthDate');
        resetSelectors();
        elements.statsPanel.classList.remove('open');
        elements.statsToggle.classList.remove('open');
        showPromptView(true);
    });
    
    elements.statsToggle.addEventListener('click', () => {
        elements.statsPanel.classList.toggle('open');
        elements.statsToggle.classList.toggle('open');
    });
};

// Initialize
const init = () => {
    const storedData = localStorage.getItem('birthDate');
    
    if (storedData) {
        showMainView(JSON.parse(storedData), true);
    } else {
        showPromptView();
    }
    
    setupEventListeners();
};

init();