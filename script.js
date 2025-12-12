const promptView = document.getElementById('promptView');
const mainView = document.getElementById('mainView');
const birthForm = document.getElementById('birthForm');
const resetLink = document.getElementById('resetLink');

// Check if birth date is stored
function init() {
    const storedData = localStorage.getItem('birthDate');
    
    if (storedData) {
        const birthDate = JSON.parse(storedData);
        showMainView(birthDate);
    } else {
        showPromptView();
    }
}

function showPromptView() {
    promptView.classList.add('active');
    mainView.classList.remove('active');
}

function showMainView(birthDate) {
    promptView.classList.remove('active');
    mainView.classList.add('active');
    updateStats(birthDate);
}

function updateStats(birthDate) {
    const birth = new Date(birthDate.year, birthDate.month - 1, 1);
    const today = new Date();
    
    // Calculate age
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    // Calculate weeks lived
    const msPerWeek = 1000 * 60 * 60 * 24 * 7;
    const weeksLived = Math.floor((today - birth) / msPerWeek);
    
    // Calculate weeks remaining (assuming 80 years life expectancy)
    const totalWeeks = 80 * 52;
    const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
    
    // Update UI
    document.getElementById('currentAge').textContent = age + ' years';
    document.getElementById('weeksLived').textContent = weeksLived.toLocaleString();
    document.getElementById('weeksRemaining').textContent = weeksRemaining.toLocaleString();
}

// Handle form submission
birthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const birthDate = {
        month: parseInt(document.getElementById('birthMonth').value),
        year: parseInt(document.getElementById('birthYear').value)
    };
    
    localStorage.setItem('birthDate', JSON.stringify(birthDate));
    showMainView(birthDate);
});

// Handle reset
resetLink.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset your birth date?')) {
        localStorage.removeItem('birthDate');
        document.getElementById('birthForm').reset();
        showPromptView();
    }
});

// Initialize on load
init();