document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    setupThemeToggle();

    loadAllCategories();
    createCategory();
    initListeners();
})

async function loadAllCategories() {
    try {
        const response = await fetch('../backend/categorias/index.php');

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '../login/index.html';
            }
            throw new Error('Falha ao carregar dados.');
        }

        const data = await response.json();

        if (data.success) {
            preencherCategorias(data.categorias);
        } else {
            console.log(data.message);
        }
    } catch (error) {
        console.log('Erro no fetch inicial: ', error);
    }
}

function preencherCategorias(categorias) {
    const categoriasCadastradas = document.querySelector('.categorias-cadastradas');

    categorias.forEach(cat => {
        const divCategorias = document.createElement('div');
        divCategorias.setAttribute('data-category-id', cat.id_categoria);
        const textSpan = document.createElement('span');

        const rowContainer = document.createElement('div');
        rowContainer.classList.add('row-container-categories');
        const buttonWrapper = document.createElement('div');
        buttonWrapper.classList.add('task-buttons-categories');

        const buttonEdit = document.createElement('button');
        buttonEdit.type = 'button';
        buttonEdit.classList.add('btnEditCategories');
        buttonEdit.innerHTML = '<i class="fa-solid fa-pencil"></i>';

        const buttonDelete = document.createElement('button');
        buttonDelete.type = 'button';
        buttonDelete.classList.add('btnDeleteCategories');
        buttonDelete.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';

        const firstLetter = cat.nome.charAt(0).toUpperCase();
        const restLetters = cat.nome.slice(1);
        const capitalize = firstLetter + restLetters;
        textSpan.innerHTML = capitalize;
        divCategorias.appendChild(textSpan);
        divCategorias.classList.add('divCategorias');

        buttonWrapper.appendChild(buttonEdit);
        buttonWrapper.appendChild(buttonDelete);

        rowContainer.appendChild(divCategorias);
        rowContainer.appendChild(buttonWrapper);

        categoriasCadastradas.appendChild(rowContainer);
    })
};

async function createCategory() {
    const formCategoria = document.querySelector('.form-categorias');
    const messages = document.querySelector('.messages');
    const mainFormHiddenInput = document.getElementById('id_categoria_editando');
    const submitButton = document.querySelector('.btnSubmit');

    try {

        if (formCategoria) {
            formCategoria.addEventListener('submit', (e) => {
                e.preventDefault();

                const formData = new FormData(formCategoria);
                const editingId = mainFormHiddenInput.value;

                let url;
                let successCallback;

                if (editingId) {
                    url = '../backend/categorias/update.php';
                    formData.append('id_categoria', editingId);

                    successCallback = (data) => {
                        const newText = formData.get('categoria');
                        const category = document.querySelector(`.divCategorias[data-category-id="${editingId}"]`);
                        const textSpan = category.querySelector('span');

                        messages.textContent = data.message;

                        setTimeout(() => {
                            messages.textContent = '';
                        }, 2500);

                        textSpan.textContent = newText;
                    }
                } else {
                    url = '../backend/categorias/store.php';
                    successCallback = (data) => {
                        messages.textContent = data.message;

                        setTimeout(() => {
                            messages.textContent = '';
                        }, 2500);

                        formCategoria.reset();
                    }
                }

                fetch(url, {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            successCallback(data);

                            setTimeout(() => {
                                messages.textContent = '';
                            }, 2500)

                            formCategoria.reset();
                            mainFormHiddenInput.value = '';
                            submitButton.textContent = 'Cadastrar';
                        } else {
                            messages.textContent = data.message;

                            setTimeout(() => {
                                messages.textContent = '';
                            }, 2500);
                        }
                    })
            })
        }
    } catch (error) {
        console.log('Erro: ', error);
    }
}

function initListeners() {
    const mainContent = document.querySelector('.main-content');
    const messages = document.querySelector('.messages');

    mainContent.addEventListener('click', (e) => {
        const btnDelete = e.target.closest('.btnDeleteCategories');

        if (btnDelete) {

            if (!confirm('Tem certeza que deseja excluir essa categoria?')) {
                return;
            }

            const categorieRow = btnDelete.closest('.row-container-categories');
            const divCategorias = categorieRow.querySelector('.divCategorias');
            const categorieId = divCategorias.dataset.categoryId;
            console.log(categorieId);

            const formData = new FormData();
            formData.append('id_categoria', categorieId);

            fetch('../backend/categorias/delete.php', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        messages.textContent = data.message;
                        categorieRow.remove();

                        setTimeout(() => {
                            messages.textContent = '';
                        }, 2500);
                    } else {
                        messages.textContent = data.message;

                        setTimeout(() => {
                            messages.textContent = '';
                        }, 2500);
                    }
                }).catch(error => console.log(error))

            return;
        }

        const editButton = e.target.closest('.btnEditCategories');

        if (editButton) {
            const categorieRow = editButton.closest('.row-container-categories');
            const divCategorias = categorieRow.querySelector('.divCategorias');
            const categorieId = divCategorias.dataset.categoryId;
            const textSpan = divCategorias.querySelector('span');
            const currentText = textSpan.textContent;

            const mainFormInput = document.querySelector('.input-categoria');
            const mainFormHiddenInput = document.getElementById('id_categoria_editando');
            const mainBtnSubmit = document.querySelector('.btnSubmit');

            mainFormHiddenInput.value = categorieId;
            mainFormInput.value = currentText;
            mainBtnSubmit.textContent = 'Salvar Edição';

            mainFormInput.focus();
        }
    })
}

const THEME_KEY = 'user_theme';

/*
 @param {string} theme
*/

function lightMode(theme) {
    const buttonToggle = document.querySelector('.buttonToggle');
    const sideBar = document.querySelector('.sidebar');
    const btnSubmit = document.querySelector('.btnSubmit');
    const divCategorias = document.querySelector('.categorias');



    if (theme === 'light') {
        sideBar.classList.add('sidebar-light');
        btnSubmit.classList.add('btnSubmit-light');
        divCategorias.classList.toggle('categorias-light');
        if (buttonToggle) {
            buttonToggle.innerHTML = '<i class="fa-solid fa-toggle-off"></i> Dark Mode'
        }
    } else {
        sideBar.classList.remove('sidebar-light');
        btnSubmit.classList.remove('btnSubmit-light');
        divCategorias.classList.remove('categorias-light');
        if (buttonToggle) {
            buttonToggle.innerHTML = '<i class="fa-solid fa-toggle-off"></i> Light Mode'
        }
    }

    localStorage.setItem(THEME_KEY, theme);
}

function setupThemeToggle() {
    const buttonToggle = document.querySelector('.buttonToggle');

    if (buttonToggle) {
        buttonToggle.addEventListener('click', (e) => {
            e.preventDefault();

            const sideBar = document.querySelector('.sidebar');
            let newTheme;

            if (sideBar.classList.contains('sidebar-light')) {
                newTheme = 'dark';
            } else {
                newTheme = 'light';
            }

            lightMode(newTheme);
        })
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme) {
        lightMode(savedTheme);
    } else {
        lightMode('dark');
    }
}