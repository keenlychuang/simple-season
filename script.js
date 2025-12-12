const promptView = document.getElementById('promptView');
const mainView = document.getElementById('mainView');
const birthForm = document.getElementById('birthForm');
const resetLink = document.getElementById('resetLink');
const statsToggle = document.getElementById('statsToggle');
const statsPanel = document.getElementById('statsPanel');

function init() {
    const storedData = localStorage.getItem('birthDate');
    
    if (storedData) {
        const birthDate = JSON.parse(storedData);
        showMainView(birthDate, true);
    } else {
        showPromptView();
    }
}

function showPromptView() {
    promptView.classList.add('active');
    mainView.classList.remove('active');
    document.documentElement.style.setProperty('--saturation', '100%');
    document.documentElement.style.setProperty('--flood-progress', '0%');
}

function showMainView(birthDate, instant = false) {
    promptView.classList.remove('active');
    mainView.classList.add('active');
    updateStats(birthDate);
    
    if (instant) {
        setBackgroundInstant(birthDate);
    } else {
        animateBackground(birthDate);
    }
}

function setBackgroundInstant(birthDate) {
    const saturation = calculateSaturation(birthDate);
    document.documentElement.style.setProperty('--saturation', saturation + '%');
    document.documentElement.style.setProperty('--flood-progress', '100%');
}

function calculateSaturation(birthDate) {
    const birth = new Date(birthDate.year, birthDate.month - 1, 1);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    const maxAge = 75;
    const ageRatio = Math.min(age / maxAge, 1);
    const minSaturation = 33;
    return Math.max(minSaturation, 100 - (ageRatio * (100 - minSaturation)));
}

function animateBackground(birthDate) {
    const saturation = calculateSaturation(birthDate);
    document.documentElement.style.setProperty('--saturation', saturation + '%');
    
    const duration = 4000;
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

function updateStats(birthDate) {
    const birth = new Date(birthDate.year, birthDate.month - 1, 1);
    const today = new Date();
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksLived = Math.floor((today - birth) / msPerWeek);
    
    const totalWeeks = 75 * 52;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    
    document.getElementById('currentAge').textContent = age + ' years';
    document.getElementById('weeksLived').textContent = weeksLived.toLocaleString();
    document.getElementById('weeksRemaining').textContent = weeksRemaining.toLocaleString();
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
    showPromptView();
});

statsToggle.addEventListener('click', () => {
    statsPanel.classList.toggle('open');
    statsToggle.classList.toggle('open');
});

init();