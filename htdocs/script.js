// document elements used

const resetButton = document.getElementById('resetButton');
const submitButton = document.getElementById('submitButton');
const qform = document.getElementById('formQuestion');
const iform = document.getElementById('formImage');
const history = document.getElementById('history');
let path = '/';
let form = qform;

if (iform) { // Image page - change post path and load history
  path = "/image";
  form = iform;
  fetch('/history')
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.getElementById('history');
      data.forEach((row) => {
        const newRow = document.createElement('tr');
        const imageCell = document.createElement('td');
        const imageElement = document.createElement('img');
        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = row.description;
        newRow.appendChild(descriptionCell);
        imageElement.src = row.url;
        imageElement.height = 64;
        imageElement.classList.add('image-hover');
        imageCell.appendChild(imageElement);
        newRow.appendChild(imageCell);
        tableBody.appendChild(newRow);
      });
    });
}

/* Utility function to check if a string is an URL
function isURL(str) {
  const pattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
  const rtn = pattern.test(str);
  console.log('check ' + str + " -> " + rtn);
  return rtn;
}*/

// Manage submit
form.addEventListener('submit', (event) => {
  event.preventDefault();
  document.body.style.cursor = 'progress';
  submitButton.disabled = true;
  const formData = new FormData(event.target);

  fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // Add this line
    },
    body: new URLSearchParams(formData) // Update this line
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const newRow = document.createElement('tr');
      const newQCell = document.createElement('td');
      newQCell.textContent = data.question;
      newRow.appendChild(newQCell);
      const newACell = document.createElement('td');
      if (iform) {
        const img = document.createElement('img');
        img.src = data.answer;
        img.height = 64;
        img.classList.add('image-hover');
        newACell.appendChild(img);
      } else {
        newACell.textContent = data.answer;
      }
      newRow.appendChild(newACell);
      history.appendChild(newRow);
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