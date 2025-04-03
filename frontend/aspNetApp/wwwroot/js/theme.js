function getTheme() {
    return localStorage.getItem('theme') || 'dark';
}

function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

// Initialiser le thème au chargement
document.addEventListener('DOMContentLoaded', () => {
    setTheme(getTheme());
});
