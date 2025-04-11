// Fade in khi trang load
window.addEventListener('load', () => {
    document.body.classList.add('fade-in');
});
  
// Fade out khi click link
document.querySelectorAll('.transition-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.remove('fade-in');
        document.body.classList.add('fade-out');
  
        const href = this.href;
  
        setTimeout(() => {
        window.location.href = href;
        }, 500); // thời gian khớp với transition
    });
});