// Call the function to test it (optional, you might call this from an event listener, etc.)
retrieve_posts_and_log(); // Renamed to avoid conflict if you run this multiple times

async function retrieve_posts_and_log() { // 1. Added 'async'
  try {
    // 2. Changed to the correct endpoint for retrieving posts (port 5000, /api/media)
    const response = await fetch('http://localhost:5000/api/media');

    // 4. Check if the request was successful
    if (!response.ok) {
      // If the server responded with an error status (4xx or 5xx)
      const errorData = await response.text(); // Try to get error text or json
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData}`);
    }

    // 3. Parse the JSON data from the response body
    const postsData = await response.json();
    //console.log('Retrieved posts successfully:');
    //console.log(postsData);

    // The 'postsData' object will look something like this based on our backend controller:
    // {
    //   success: true,
    //   count: ...,
    //   totalPages: ...,
    //   currentPage: ...,
    //   data: [ { mediaUrl: '...', userID: '...', uploadType: '...', ... }, ... ]
    // }

    // You can now use postsData.data to access the array of post objects
    if (postsData.success && postsData.data) {
      // Example: Loop through the posts
      postsData.data.forEach(post => {
        // console.log(`Media URL: ${post.mediaUrl}, Type: ${post.uploadType}`);
        // Here you would typically update your UI with these posts
      });
    }

    return postsData; // Optionally return the data

  } catch (error) {
    // This will catch network errors or errors thrown from the !response.ok check
    console.error('Failed to retrieve posts:', error);
  }
}