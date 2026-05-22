const bookForm = document.getElementById("bookForm");
const bookTableBody = document.getElementById("bookTableBody");
const tableSection = document.getElementById("tableSection");
const bookModal = document.getElementById("bookModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

// Image Upload Pipeline DOM Setup
const coverFileInput = document.getElementById("coverFile");
const coverPreview = document.getElementById("coverPreview");
const coverHiddenInput = document.getElementById("cover");
const dropZonePrompt = document.querySelector(".drop-zone-prompt");

// ISBN Processing DOM Setup
const isbnInput = document.getElementById("isbn");
const isbnLoader = document.getElementById("isbnLoader");

// Starts completely empty if no prior browser storage entries exist
let books = JSON.parse(localStorage.getItem("libraryBooks")) || [];
let editingBookId = null;

// EVENTS MAPPING
openModalBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", () => closeModal());
window.addEventListener("click", (e) => { if (e.target === bookModal) closeModal(); });

function openModal() {
  bookModal.style.display = "flex";
}

function closeModal() {
  bookModal.style.display = "none";
  bookForm.reset();
  editingBookId = null;
  document.getElementById("modalTitle").innerText = "Add New Book";
  
  // Reset preview panel visual states
  coverPreview.style.display = "none";
  coverPreview.src = "";
  dropZonePrompt.style.display = "flex";
  coverHiddenInput.value = "";
  isbnInput.placeholder = "Click to generate dynamic field...";
}

function saveBooks() {
  localStorage.setItem("libraryBooks", JSON.stringify(books));
}

// SIMULATED ISBN AUTOMATION SEARCH EFFECT
isbnInput.addEventListener("click", handleIsbnGeneration);
isbnInput.addEventListener("focus", handleIsbnGeneration);

function handleIsbnGeneration() {
  if (isbnInput.value.trim() !== "") return;
  
  isbnLoader.style.display = "block";
  isbnInput.placeholder = "Searching asset databases...";
  
  setTimeout(() => {
    const prefix = "978";
    const group = Math.floor(Math.random() * 10);
    const publisher = Math.floor(100 + Math.random() * 900);
    const item = Math.floor(10000 + Math.random() * 90000);
    const check = Math.floor(Math.random() * 10);
    
    isbnInput.value = `${prefix}-${group}-${publisher}-${item}-${check}`;
    isbnLoader.style.display = "none";
  }, 850);
}

// LOCAL FILE PARSING VIA BASE64 PIPELINE
coverFileInput.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const base64String = event.target.result;
    coverHiddenInput.value = base64String;
    
    coverPreview.src = base64String;
    coverPreview.style.display = "block";
    dropZonePrompt.style.display = "none";
  };
  reader.readAsDataURL(file);
});

function renderBooks(filteredBooks = books) {
  bookTableBody.innerHTML = "";

  if (filteredBooks.length === 0) {
    emptyState.style.display = "block";
    document.querySelector("table").style.display = "none";
  } else {
    emptyState.style.display = "none";
    document.querySelector("table").style.display = "table";
  }

  filteredBooks.forEach((book) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td data-label="Cover">
        <img class="book-cover" src="${book.cover || 'https://via.placeholder.com/60x80?text=No+Cover'}" alt="Cover" />
      </td>
      <td data-label="Book Details" class="book-details-cell">
        <strong>${book.title}</strong>
        <small>${book.language || 'N/A'} &bull; ${book.pages || '0'} pages</small>
      </td>
      <td data-label="Author">${book.author}</td>
      <td data-label="Category">${book.category}</td>
      <td data-label="Published">${book.publishedDate}</td>
      <td data-label="ISBN">${book.isbn}</td>
      <td data-label="Status">
        <span class="status ${book.status.toLowerCase()}">
          ${book.status}
        </span>
      </td>
      <td data-label="Actions">
        <div class="action-btns">
          <button class="edit-btn" onclick="editBook(${book.id})">
            <i class="fa-regular fa-pen-to-square"></i> Edit
          </button>
          <button class="delete-btn" onclick="deleteBook(${book.id})">
            <i class="fa-regular fa-trash-can"></i> Delete
          </button>
        </div>
      </td>
    `;
    bookTableBody.appendChild(tr);
  });

  updateStats();
}

function updateStats() {
  const total = books.length;
  const available = books.filter(book => book.status === "Available").length;
  const borrowed = books.filter(book => book.status === "Borrowed").length;

  document.getElementById("totalBooks").innerText = total;
  document.getElementById("availableBooks").innerText = available;
  document.getElementById("borrowedBooks").innerText = borrowed;
}

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const bookData = {
    id: editingBookId || Date.now(),
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    category: document.getElementById("category").value,
    publishedDate: document.getElementById("publishedDate").value,
    isbn: document.getElementById("isbn").value,
    language: document.getElementById("language").value,
    pages: document.getElementById("pages").value,
    status: document.getElementById("status").value,
    cover: document.getElementById("cover").value,
    description: document.getElementById("description").value
  };

  if (editingBookId) {
    books = books.map(book => book.id === editingBookId ? bookData : book);
  } else {
    books.unshift(bookData);
  }

  saveBooks();
  renderBooks();
  closeModal();
});

function editBook(id) {
  const book = books.find(book => book.id === id);
  if (!book) return;

  editingBookId = id;

  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("category").value = book.category;
  document.getElementById("publishedDate").value = book.publishedDate;
  document.getElementById("isbn").value = book.isbn;
  document.getElementById("language").value = book.language;
  document.getElementById("pages").value = book.pages;
  document.getElementById("status").value = book.status;
  document.getElementById("cover").value = book.cover || "";
  document.getElementById("description").value = book.description || "";

  if (book.cover) {
    coverPreview.src = book.cover;
    coverPreview.style.display = "block";
    dropZonePrompt.style.display = "none";
  }

  document.getElementById("modalTitle").innerText = "Update Book Details";
  openModal();
}

function deleteBook(id) {
  const confirmDelete = confirm("Are you sure you want to drop this record entry?");
  if (!confirmDelete) return;

  books = books.filter(book => book.id !== id);
  saveBooks();
  renderBooks();
}

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  const filteredBooks = books.filter(book => {
    return (
      book.title.toLowerCase().includes(value) ||
      book.author.toLowerCase().includes(value) ||
      book.category.toLowerCase().includes(value) ||
      book.isbn.toLowerCase().includes(value)
    );
  });
  renderBooks(filteredBooks);
});

renderBooks();