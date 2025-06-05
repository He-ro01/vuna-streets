async function getUserStreets() {
    const response = await fetch('http://localhost:5000/api/streets');

    // 4. Check if the request was successful
    if (!response.ok) {
        // If the server responded with an error status (4xx or 5xx)
        const errorData = await response.text(); // Try to get error text or json
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData}`);
    }

    // 3. Parse the JSON data from the response body
    const postsData = await response.json();
    console.log(postsData);
    const streets = postsData;
    return streets;
}
async function getUser() {
    return { name: 'hero' };
}