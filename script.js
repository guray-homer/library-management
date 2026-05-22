const bookForm = document.getElementById("bookForm");
const bookTableBody = document.getElementById("bookTableBody");
const bookModal = document.getElementById("bookModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

let books = JSON.parse(localStorage.getItem("libraryBooks")) || [];
let editingBookId = null;

openModalBtn.addEventListener("click", () => {
  openModal();
});

closeModalBtn.addEventListener("click", () => {
  closeModal();
});

window.addEventListener("click", (e) => {
  if (e.target === bookModal) closeModal();
});

function openModal() {
  bookModal.style.display = "flex";
}

function closeModal() {
  bookModal.style.display = "none";
  bookForm.reset();
  editingBookId = null;
}

function saveBooks() {
  localStorage.setItem("libraryBooks", JSON.stringify(books));
}

function renderBooks(filteredBooks = books) {

  bookTableBody.innerHTML = "";

  if (filteredBooks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  filteredBooks.forEach((book) => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <img
          class="book-cover"
          src="${book.cover || 'https://via.placeholder.com/60x80'}"
        />
      </td>

      <td>
        <strong>${book.title}</strong><br>
        <small>${book.language} • ${book.pages} pages</small>
      </td>

      <td>${book.author}</td>

      <td>${book.category}</td>

      <td>${book.publishedDate}</td>

      <td>${book.isbn}</td>

      <td>
        <span class="status ${book.status.toLowerCase()}">
          ${book.status}
        </span>
      </td>

      <td>
        <div class="action-btns">

          <button
            class="edit-btn"
            onclick="editBook(${book.id})"
          >
            Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteBook(${book.id})"
          >
            Delete
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

  const available = books.filter(
    book => book.status === "Available"
  ).length;

  const borrowed = books.filter(
    book => book.status === "Borrowed"
  ).length;

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

    books = books.map(book =>
      book.id === editingBookId ? bookData : book
    );

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
  document.getElementById("cover").value = book.cover;
  document.getElementById("description").value = book.description;

  document.getElementById("modalTitle").innerText = "Update Book";

  openModal();
}

function deleteBook(id) {

  const confirmDelete = confirm(
    "Are you sure you want to delete this book?"
  );

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

// SAMPLE BOOKS
if (books.length === 0) {

  books = [

    {
      id: 1,
      title: "Atomic Habits",
      author: "James Clear",
      category: "Self Help",
      publishedDate: "2018-10-16",
      isbn: "9780735211292",
      language: "English",
      pages: 320,
      status: "Available",
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
      description: "A practical guide to building good habits."
    },

    {
      id: 2,
      title: "The Alchemist",
      author: "Paulo Coelho",
      category: "Fiction",
      publishedDate: "1988-01-01",
      isbn: "9780061122415",
      language: "English",
      pages: 208,
      status: "Borrowed",
      cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
      description: "A philosophical novel about destiny."
    }

  ];

  saveBooks();
}

renderBooks();