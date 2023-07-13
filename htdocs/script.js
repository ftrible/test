// document elements used
const submitButton = document.getElementById('submitButton');
const qform = document.getElementById('formQuestion');
const iform = document.getElementById('formImage');
const vform = document.getElementById('formVariation');
const history = document.getElementById('history');
const message = document.getElementById('message');
const pagination = document.getElementById('pagination');
let tableData = [ ];
const itemsPerPage = 5;

function renderTable(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Clear existing table content
  history.innerHTML = '';

  // Render table rows for the current page
  for (let i = startIndex; i < endIndex && i < tableData.length; i++) {
    createRow(tableData[i].description, tableData[i].url);
  }
}

function renderPagination() {
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // Clear existing pagination buttons
  pagination.innerHTML = '';

  // Render pagination buttons
  if(totalPages>1)for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.classList.add('pagination');
    button.textContent = "Page "+i;
    button.addEventListener('click', () => {
      renderTable(i);
    });
    pagination.appendChild(button);
  }
}

let path = '/';
let form = qform;

if (iform) { // Image page
  path = "/image";
  form = iform;
}
if (vform) { // Image page
  path = "/variation";
  form = vform;
}
function addRow(description,url){
  tableData.unshift({description,url});
//  createRow(a,b);
}

// retrieve history
fetch(path + "history")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((row) => {
      console.log(row);
      if (iform) {
        addRow(row.description, row.url);
      } else {
        addRow(row.question, row.answer);
      }
    });
    renderTable(1);
    renderPagination();
  });

function createRow(question, answer) {
  const newRow = document.createElement('tr');
  const newQCell = document.createElement('td');
  if (vform) {
    const img = document.createElement('img');
    img.src = question;
    img.height = 64;
    img.classList.add('image-hover');
    newQCell.appendChild(img);
  } else {
    newQCell.textContent = question;
  }
  newRow.appendChild(newQCell);
  const newACell = document.createElement('td');
  if (iform || vform) {
    const img = document.createElement('img');
    img.src = answer;
    img.height = 64;
    img.classList.add('image-hover');
    newACell.appendChild(img);
  } else {
    newACell.textContent = answer;
  }
  newRow.appendChild(newACell);
  history.appendChild(newRow);
}

// Manage submit
form.addEventListener('submit', (event) => {
  event.preventDefault();
  document.body.style.cursor = 'progress';
  message.style.display = 'block';
  message.textContent = "Computing...";
  submitButton.disabled = true;
  let formData = new FormData(event.target);
  if(qform||iform) formData=new URLSearchParams(formData);
  
  fetch(path, {
    method: 'POST',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      addRow(data.question, data.answer);
      renderTable(1);
      renderPagination();
      form.reset();
      document.body.style.cursor = 'default';
      message.style.display = 'none';
      submitButton.disabled = false;
    }).catch((error) => {
      console.log(error);
      document.body.style.cursor = 'default';
      message.textContent ="Error";
      setTimeout(function () {
        message.style.display = 'none';
      }, 1000);
      submitButton.disabled = false;
    });
});
