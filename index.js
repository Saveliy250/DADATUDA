

document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelectorAll('.category-btn');
    button.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle("selected");
        })
    })
})

const applyBtn = document.getElementById('applyBtn'); // условно, кнопка "Применить"

applyBtn.addEventListener('click', async () => {
    // Собираем массив выбранных категорий
    const selectedBtns = document.querySelectorAll('.category-btn.selected');
    const categories = Array.from(selectedBtns).map(btn => btn.dataset.value);
})

