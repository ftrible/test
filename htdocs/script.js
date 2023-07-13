// document elements used

const resetButton = document.getElementById('resetButton');
const submitButton = document.getElementById('submitButton');
const qform = document.getElementById('formQuestion');
const iform = document.getElementById('formImage');
const vform = document.getElementById('formVariation');
const history = document.getElementById('history');
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
// retrieve history
fetch(path + "history")
  .then((response) => response.json())
  .then((data) => {
    //const tableBody = document.getElementById('history');
    data.forEach((row) => {
      console.log(row);
      if (iform) {
        createRow(row.description, row.url);
      } else {
        createRow(row.question, row.answer);
      }
    });
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
  submitButton.disabled = true;
  let formData = new FormData(event.target);
  if(qform||iform) formData=new URLSearchParams(formData);
  /*if(qform||iform) fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // Add this line
    },
    body: new URLSearchParams(formData) // Update this line
  }) */
  fetch(path, {
    method: 'POST',
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      createRow(data.question, data.answer);
      form.reset();
      document.body.style.cursor = 'default';
      submitButton.disabled = false;
    }).catch((error) => {
      console.log(error);
      document.body.style.cursor = 'default';
      submitButton.disabled = false;
    });
});

// manage reset button
resetButton.addEventListener('click', () => {// Clear the history
  history.innerHTML = '';
});