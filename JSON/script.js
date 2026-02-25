async function testServer() {
    try {
        const response = await fetch(new URL('/data', window.location.origin).toString());
        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received:", data);
        document.querySelector("body").innerHTML = `<h1>Name: ${data.name}</h1>`;
    } catch (error) {
        console.error("Error fetching data:", error);
        document.querySelector("body").innerHTML = `<h1>Error: ${error.message}</h1>`;
    }
}