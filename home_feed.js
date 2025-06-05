const loadingIndicator = document.getElementById("loadingIndicator");
const feedContainer = document.getElementById('feed-container');
const feed = document.querySelector('.feed');
const hlsInstances = new Map();
let isLoading = false;
const lastScrollTop = 0;

const posts = [];
let loadedCount = 0;
const stencil_feed = document.querySelector(`.stencil-feed`).innerHTML;
//
function unloadPost(post) {
    post.height = post.html.offsetHeight;
    post.html.innerHTML = ``;
    post.html.className = `referenced-placeholder ${post.id}`;
    post.html.style = `height: ${post.height}px`;
    post.loaded = false;
}
//
function loadPost(post) {
    post.html.innerHTML = post.cache;
    post.html.className = `post ${post.id}`;
    post.loaded = true;
}
//
function createPostElement(postData) {
    const postDiv = document.createElement("div");
    postDiv.className = `post ${postData.id}`;
    postDiv.id = `post-${postData._id || loadedCount}`;

    const mediaItem = postData.mediaItems; // Assumes it's a single object, not array
    const mediaContentHolder = document.createElement('div');
    mediaContentHolder.className = 'media-container';

    // Style container based on media aspect ratio
    const aspectRatio = mediaItem.width && mediaItem.height
        ? `${mediaItem.width} / ${mediaItem.height}`
        : `1 / 1`; // fallback
    mediaContentHolder.style = `display:flex; width:100%; aspect-ratio: ${aspectRatio};`;

    // Add media content (image or video)
    if (mediaItem.uploadType === 'image-crop') {
        const image = document.createElement('img');
        image.style = `width:100%; height:auto;`;
        image.src = mediaItem.mediaUrl;
        mediaContentHolder.appendChild(image);

    } else if (mediaItem.uploadType === 'video-trim') {
        const video = document.createElement("video");
        video.style = `width:100%; height:auto;`;
        video.controls = true;
        playVideo(video, mediaItem.mediaUrl); // Assuming playVideo is globally defined
        mediaContentHolder.appendChild(video);
    }

    // Create stencil + container
    postDiv.innerHTML = stencil_feed;
    const sideScrollContainer = postDiv.querySelector(".post-element-sidescroll-container");

    if (sideScrollContainer) {
        sideScrollContainer.appendChild(mediaContentHolder);
    } else {
        console.error("Error: '.post-element-sidescroll-container' not found in stencil_feed.");
    }

    // Fill street details
    const street_details = postDiv.querySelector('.street-details');
    const post_details = postDiv.querySelector('.post-details');

    if (street_details) {
        street_details.innerHTML = `
            <span id='street-name-text'>s/${mediaItem.street || 'unknown'}</span>
            <div class="street-icon-wrapper">
                <i class="fi fi-ss-user"></i>
            </div>
        `;

        street_details.addEventListener('click', () => {
            window.cursor_street_name = mediaItem.street;
            openOverlay('.streets-feed'); // Assuming openOverlay is global
        });
    }

    // Fill post details
    if (post_details) {
        post_details.innerHTML = `
            <span>${mediaItem.username || 'Anonymous'}</span>
            <span class='post-date-text'>17h</span>
        `;
    }

    return postDiv;
}

//
async function playVideo(videoEl, url) {
    //  console.log(url);
    if (Hls.isSupported()) {
        const hls = new Hls();


        hls.loadSource(url);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.ERROR, () => {

        });
    } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {

    }
}

function enableSwipeOnPost(post) {
    const container = post.html.querySelector(".post-element-sidescroll-container");
    if (!container) return;

    const FINGER_SPEED_THRESHOLD = 0.3; // px per ms
    const DISTANCE_THRESHOLD_PERCENT = 30;

    let startX = 0;
    let deltaX = 0;
    let startTime = 0;
    let currentIndex = 0;
    let isDragging = false;
    let mediaCount = post.mediaItems.length;

    function updateTransform(percent = 0) {
        container.style.transition = "none";
        container.style.transform = `translateX(calc(${-100 / mediaCount * post.cursor}% + ${percent}%))`;
    }

    function snapToIndex(index) {
        post.cursor = Math.max(0, Math.min(index, mediaCount - 1));
        requestAnimationFrame(() => {
            container.style.transition = "transform 0.3s ease";
            container.style.transform = `translateX(${-100 / mediaCount * post.cursor}%)`;
        });
    }

    container.addEventListener("transitionend", () => {
        container.style.transition = "none";
    });

    container.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        startTime = performance.now();
        isDragging = true;
    }, { passive: true });

    container.addEventListener("touchmove", (e) => {
        if (!isDragging) return;

        const moveX = e.touches[0].clientX;
        deltaX = moveX - startX;

        const offsetPercent = (deltaX / container.offsetWidth) * 100;
        requestAnimationFrame(() => updateTransform(offsetPercent));
    }, { passive: false });

    container.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;

        const endTime = performance.now();
        const timeElapsed = endTime - startTime; // ms
        const speed = Math.abs(deltaX) / timeElapsed; // px/ms
        const swipePercent = (deltaX / container.offsetWidth) * 100 * mediaCount;

        const isFast = speed > FINGER_SPEED_THRESHOLD;

        if ((swipePercent > DISTANCE_THRESHOLD_PERCENT || (isFast && deltaX > 0)) && post.cursor > 0) {
            snapToIndex(post.cursor - 1);
        } else if ((swipePercent < -DISTANCE_THRESHOLD_PERCENT || (isFast && deltaX < 0)) && post.cursor < mediaCount - 1) {
            snapToIndex(post.cursor + 1);
        } else {
            snapToIndex(post.cursor); // Snap back
        }

        deltaX = 0;
    });
}

//laod more posts function
async function loadMorePosts() {
    if (isLoading) return;
    isLoading = true;
    if (loadingIndicator) loadingIndicator.style.display = "block";

    const feedType = feed.getAttribute('feed-type'); // "default" | "streets" | "user"
    const cursor_street_name = window.cursor_street_name; // Assuming it's set globally

    const response = await fetch('http://localhost:5000/api/media');
    const apiPosts = await response.json(); // Expected: { data: [ ... ] }

    let mediaArray = [];

    if (feedType === 'default') {
        // Show everything, sorted by newest
        mediaArray = apiPosts.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    } else if (feedType === 'streets') {
        // Filter by matching street, then sort by createdAt
        mediaArray = apiPosts.data
            .filter(item => item.street === cursor_street_name)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    console.log(mediaArray);
    // Render each filtered/sorted post
    mediaArray.forEach(data => {
        const newPostData = {
            cursor: 0,
            height: 0,
            position: 0,
            marginTop: 0,
            cache: ``,
            id: loadedCount,
            loaded: true,
            mediaItems: data,
            _id: loadedCount,
            upvotes: Math.floor(Math.random() * 50),
            commentsCount: Math.floor(Math.random() * 10),
            views: Math.floor(Math.random() * 100),
            html: null
        };

        const postElement = createPostElement(newPostData);
        newPostData.cache = postElement.innerHTML;
        newPostData.html = postElement;
        enableSwipeOnPost(newPostData);

        if (feedContainer) {
            feedContainer.appendChild(postElement);
        } else {
            console.error("#feed-container not found!");
        }
        posts.push(newPostData);
        loadedCount++;
    });

    isLoading = false;

    if (loadingIndicator) {
        const totalPostsGenerated = document.querySelectorAll('.post').length;
        const maxTestPosts = 28;
        if (totalPostsGenerated >= maxTestPosts) {
            loadingIndicator.textContent = "Reached end of test posts.";
            loadingIndicator.style.display = "block";
        } else {
            loadingIndicator.style.display = "none";
        }
    }
}

//


let lastScrollY = window.scrollY; // Store the last known scroll position
window.addEventListener("scroll", () => {
    // console.log('scrolling');
    const currentScrollY = window.scrollY;
    // Determine scroll direction
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollingUp = currentScrollY < lastScrollY;
    //
    lastScrollY = window.scrollY;
    //
    posts.forEach(post => {
        let y = (post.html.getBoundingClientRect().top + window.scrollY);
        //scroll direction up
        if (y < window.scrollY - 2000 && post.loaded) {
            post.position = y;
            //console.log(`hidden at: id: ${post.id} position: ${post.position} scroll: ${window.scrollY - 2000}`);
            unloadPost(post);
        }
        if (y > window.scrollY + 2000 && post.loaded) {
            post.position = y;
            // console.log(`hidden at: id: ${post.id} position: ${post.position} scroll: ${window.scrollY + 2000}`);
            unloadPost(post);
        }
        ///scroll directon down
        if (post.position >= window.scrollY - 2000 && post.position <= window.scrollY && !post.loaded) {
            //console.log(`revealed at: id: ${post.id} position: ${post.position} scroll: ${window.scrollY - 2000}`);
            loadPost(post);
        }
        if (post.position <= window.scrollY + 2000 && post.position >= window.scrollY && !post.loaded) {
            // console.log(`revealed at: id: ${post.id} position: ${post.position} scroll: ${window.scrollY + 2000}`);
            loadPost(post);
        }
        ///
        ///
    });

    if (isAtPageBottom()) {
        loadMorePosts();
    } else if (posts.length >= 5 && loadingIndicator && loadingIndicator.textContent !== "Reached end of test posts.") {
        if (loadingIndicator.textContent !== "Reached end of test posts.") { // Avoid redundant updates
            loadingIndicator.textContent = "Reached end of test posts.";
            loadingIndicator.style.display = "block";
        }
    }
});

// Initial load
loadMorePosts();


function isAtPageBottom(padding = 5) {
    const scrollTop = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;
    return scrollTop + viewportHeight >= totalHeight - padding;
}