async function testServer() {
    try {
        const response = await fetch("http://localhost:3000/data");
        const data = await response.json();
        console.log(data);
        document.body.innerHTML = `<h1>Name: ${data.name}</h1>
                                   <p>Age: ${data.age}</p>
                                   <p>City: ${data.city}</p>`;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}