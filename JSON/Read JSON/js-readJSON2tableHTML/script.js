async function loadJsonData() {
    try {
        // Fetch the data from the JSON file
        const response = await fetch('data.json');
        const data = await response.json();

        // Get the table body element
        const tableBody = document.getElementById('table-body');

        // Iterate over the JSON array and create table rows
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.age}</td>
                <td>${user.city}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching or parsing JSON:', error);
    }
}

// Call the function to load the data when the page loads
loadJsonData();
