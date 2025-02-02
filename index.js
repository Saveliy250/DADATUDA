

document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelectorAll('.category-btn');
    button.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle("selected");
        })
    })
})
