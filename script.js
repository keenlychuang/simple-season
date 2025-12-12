const promptView = document.getElementById('promptView');
const mainView = document.getElementById('mainView');
const birthForm = document.getElementById('birthForm');
const resetLink = document.getElementById('resetLink');
const statsToggle = document.getElementById('statsToggle');
const statsPanel = document.getElementById('statsPanel');
const streaksContainer = document.getElementById('streaksContainer');

let streakInterval = null;

function init() {
    const storedData = localStorage.getItem('birthDate');
    
    if (storedData) {
        const birthDate = JSON.parse(storedData);
        showMainView(birthDate, true);
    } else {
        showPromptView();
    }
}

function showPromptView(animate = false) {
    stopStreaks();
    
    if (animate) {
        // Reverse animation
        animateBackgroundReverse(() => {
            promptView.classList.add('active');
            mainView.classList.remove('active');
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
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Reset everything for next use
            document.documentElement.style.setProperty('--saturation', '100%');
            document.documentElement.style.setProperty('--flood-progress', '0%');
            document.documentElement.style.setProperty('--reverse-flood-progress', '0%');
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
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function createStreak() {
    const streak = document.createElement('div');
    streak.className = 'streak';
    
    // Random vertical position
    const topPosition = Math.random() * 100;
    streak.style.top = topPosition + '%';
    
    // Random width (100-300px)
    const width = 100 + Math.random() * 200;
    streak.style.width = width + 'px';
    
    // Random speed (1.5-3 seconds)
    const duration = 1.5 + Math.random() * 1.5;
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
    
    // Calculate interval based on age
    // Young (0): very frequent, ~300ms between streaks
    // Old (75+): very rare, ~8000ms between streaks
    const maxAge = 75;
    const minInterval = 300;   // milliseconds for youngest
    const maxInterval = 8000;  // milliseconds for oldest
    
    const ageRatio = Math.min(age / maxAge, 1);
    // Use exponential curve for more dramatic effect
    const interval = minInterval + (maxInterval - minInterval) * Math.pow(ageRatio, 1.5);
    
    // Create initial burst of streaks (more for younger)
    const initialBurst = Math.max(1, Math.floor(5 * (1 - ageRatio)));
    for (let i = 0; i < initialBurst; i++) {
        setTimeout(() => createStreak(), i * 200);
    }
    
    // Continue creating streaks at calculated interval
    streakInterval = setInterval(() => {
        createStreak();
        
        // Occasionally create a second streak for younger ages
        if (Math.random() > ageRatio && Math.random() > 0.5) {
            setTimeout(() => createStreak(), 100 + Math.random() * 200);
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
    
    const birthDate = {
        month: parseInt(document.getElementById('birthMonth').value),
        year: parseInt(document.getElementById('birthYear').value)
    };
    
    localStorage.setItem('birthDate', JSON.stringify(birthDate));
    showMainView(birthDate, false);
});

resetLink.addEventListener('click', () => {
    localStorage.removeItem('birthDate');
    document.getElementById('birthForm').reset();
    statsPanel.classList.remove('open');
    statsToggle.classList.remove('open');
    showPromptView(true);
});

statsToggle.addEventListener('click', () => {
    statsPanel.classList.toggle('open');
    statsToggle.classList.toggle('open');
});

init();