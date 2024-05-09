import './popup.css';

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded event fired');

  const form = document.getElementById('noteForm');
  const noteTitleInput = document.getElementById('noteTitle');
  const noteContentInput = document.getElementById('noteContent');
  const noteList = document.getElementById('noteList');
  let editIndex = -1;

  // Função para exibir as notas atualizadas
  function displayNotes() {
    noteList.innerHTML = '';
    chrome.storage.sync.get('notes', function (data) {
      const notes = data.notes || [];
      notes.forEach(function (note, index) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
        
          <div class="card">
            <div class="card-content">
              <p class="subtitle">${index+1} - ${note.title}</p>
              <p contenteditable="true" class="content" id="content-${index}" style="heigth:40px">${note.content}</p>

              <footer class="card-footer">
              <p class="card-footer-item">
                <button class="button is-small is-success is-outlined" id="editBtn-${index}">
                <span class="icon is-small">
                  <i class="fas fa-edit"></i>
                </span>
              </button>
              </p>
              <p class="card-footer-item">
              <button class="button is-small is-danger " id="deleteBtn-${index}">
              <span class="icon is-small">
                <i class="fas fa-times"></i>
              </span>
              </button>
              </p>
            </footer>              
            </div>          
          </div>  
        `;
        noteList.appendChild(listItem);

        document.getElementById(`editBtn-${index}`).addEventListener('click', function () {
          editNote(index);
        });

        document.getElementById(`deleteBtn-${index}`).addEventListener('click', function () {
          deleteNote(index);
        });

        document.getElementById(`content-${index}`).addEventListener('input', function () {
          updateContent(index, this.innerText);
        });

      });
    });
  }

  
  function saveNote(title, content) {
    chrome.storage.sync.get('notes', function (data) {
      const notes = data.notes || [];
      notes.push({ title, content });
      chrome.storage.sync.set({ notes }, function () {
        displayNotes(); // Atualiza o popup após salvar a nota
      });
    });
  }

  // depois dá pra remover essa fnc e colocar na update content
  function updateNote(index, title, content) {
    chrome.storage.sync.get('notes', function (data) {
      const notes = data.notes || [];
      notes[index] = { title, content };
      chrome.storage.sync.set({ notes }, function () {
        displayNotes(); // Atualiza o popup após atualizar a nota
      });
    });
  }

  function updateContent(index, content) {
    chrome.storage.sync.get('notes', function (data) {
      const notes = data.notes || [];
      notes[index].content = content;
      chrome.storage.sync.set({ notes }, function () {
        // Não é necessário chamar displayNotes() aqui, pois a nota já está sendo exibida
      });
    });
  }

  function editNote(index) {
    chrome.storage.sync.get('notes', function (data) {
      const notes = data.notes || [];
      const { title, content } = notes[index];
      noteTitleInput.value = title;
      noteContentInput.value = content;
      editIndex = index;
    });
  }

  // Função para excluir uma nota
  function deleteNote(index) {
    chrome.storage.sync.get('notes', function (data) {
      const notes = data.notes || [];
      notes.splice(index, 1);
      chrome.storage.sync.set({ notes }, function () {
        displayNotes(); // Atualiza o popup após excluir a nota
      });
    });
  }

  // Adiciona um evento de escuta para o formulário de anotação
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const title = noteTitleInput.value;
    const content = noteContentInput.value;
    if (title && content) {
      if (editIndex !== -1) {
        updateNote(editIndex, title, content);
        editIndex = -1;
      } else {
        saveNote(title, content);
      }
      noteTitleInput.value = '';
      noteContentInput.value = '';
    }
  });

  // Inicializa o popup exibindo as notas existentes
  displayNotes();
});

