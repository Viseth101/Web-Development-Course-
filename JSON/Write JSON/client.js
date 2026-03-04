document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission that causes a page refresh

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries()); // Convert FormData to a plain object
    const jsonData = JSON.stringify(data); // Convert object to JSON string

    fetch('/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: jsonData
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success:', result);
        alert('Form data saved!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred.');
    });
});
