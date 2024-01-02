var player=null;
// Function to create and append a playlist item to the webpage
function createPlaylistItem(segment) {
    const playlistContainer = document.getElementById('playlist-container');

    // Create a new list item element
    const listItem = document.createElement('li');

    // Create a new radio input element
    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.name = 'playlist-item'; // Use the same name for all radio buttons
    radioButton.value = segment.uri; // Set the value to the title
    radioButton.id = `radio-${segment.title}`; // Set a unique ID if needed

    // Create a label for the radio button
    const label = document.createElement('label');
    label.textContent = segment.title; // Display the title
    label.setAttribute('for', `radio-${segment.title}`); // Associate the label with the radio button

    // Append the radio button to the list item
    listItem.appendChild(radioButton);

    // Append the label to the list item
    listItem.appendChild(label);

    // Append the list item to the container
    playlistContainer.appendChild(listItem);

    // Add an event listener to the radio button
    radioButton.addEventListener('change', () => {
        // Get the selected segment's URI
        const selectedUri = radioButton.value;

        // Update the video-container with the selected URI
        const videoContainer = document.getElementById('video-label');
        videoContainer.textContent = `Selected URI: ${selectedUri}`;
        fetch('stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({ data: selectedUri })
          })
            .then((response) => response.json())
            .then((data) => {
// OK
                if (player != null) {
                    player.destroy();
                }
                player = new JSMpeg.Player('ws://localhost:9999', {
                    canvas: document.getElementById('video-container') // Canvas should be a canvas DOM element
                })	
            }).catch((error) => {
                console.log(error);
            });

    });

}

// Fetch the server-side data from an endpoint (replace with your actual endpoint)
fetch('/playlist') // Replace with the actual API endpoint
    .then(response => response.json())
    .then(data => {
        // Assuming 'data' contains your server-side segments array
        const segments = data.segments;

        // Loop through the segments and create playlist items
        segments.forEach(segment => {
            createPlaylistItem(segment);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });