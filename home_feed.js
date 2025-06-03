document.addEventListener('DOMContentLoaded', () => {
    const loadingIndicator = document.getElementById("loadingIndicator");
    const header = document.getElementById("pageHeader");
    const feedContainer = document.getElementById('feed-container');
    const hlsInstances = new Map();
    let isLoading = false;
    let lastScrollTop = 0;
    let globalPostCounter = 0;
    let posts = [];

    const sampleTestPosts = [
        {
            _id: 'gallery_post_1',
            mediaItems: [
                { url: 'https://picsum.photos/seed/gallery1a/800/600', type: 'image' }, // Landscape
                { url: 'https://picsum.photos/seed/gallery1b/600/800', type: 'image' }, // Portrait
                { url: 'https://picsum.photos/seed/gallery1c/700/500', type: 'image' }  // Landscape
            ],
            userID: 'photo_album_creator',
            createdAt: new Date(Date.now() - 3600000 * Math.random() * 12).toISOString(),
            originalFileName: 'My Photo Gallery Showcase',
            streetName: 's/showcase',
            upvotes: Math.floor(Math.random() * 450),
            commentsCount: Math.floor(Math.random() * 90)
        },
        {
            _id: 'testpost_mixed_gallery',
            mediaItems: [
                { url: 'https://picsum.photos/seed/mixgalleryA/500/350', type: 'image' },
                { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', type: 'video' },
                { url: 'https://picsum.photos/seed/mixgalleryB/350/500', type: 'image' } // Portrait
            ],
            userID: 'media_slider_fan',
            createdAt: new Date(Date.now() - 3600000 * Math.random() * 15).toISOString(),
            originalFileName: 'Mixed Media Carousel',
            streetName: 's/interactive',
            upvotes: Math.floor(Math.random() * 600),
            commentsCount: Math.floor(Math.random() * 120)
        },
        {
            _id: 'testpost_single_wide_vid',
            mediaItems: [
                { url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', type: 'video' }
            ],
            userID: 'cinema_buff_77',
            createdAt: new Date(Date.now() - 3600000 * Math.random() * 8).toISOString(),
            originalFileName: 'Widescreen Video Test',
            streetName: 's/filmcuts',
            upvotes: Math.floor(Math.random() * 300),
            commentsCount: Math.floor(Math.random() * 60)
        },
        {
            _id: 'testpost_image_sequence',
            mediaItems: [
                { url: 'https://picsum.photos/seed/seq1/600/400', type: 'image' },
                { url: 'https://picsum.photos/seed/seq2/600/400', type: 'image' },
                { url: 'https://picsum.photos/seed/seq3/600/400', type: 'image' },
                { url: 'https://picsum.photos/seed/seq4/600/400', type: 'image' }
            ],
            userID: 'story_teller_visuals',
            createdAt: new Date(Date.now() - 3600000 * Math.random() * 10).toISOString(),
            originalFileName: 'A Visual Sequence',
            streetName: 's/sequentialart',
            upvotes: Math.floor(Math.random() * 550),
            commentsCount: Math.floor(Math.random() * 110)
        }
    ];

    function unloadPost(post) {
        const currentHeight = post.offsetHeight + 'px';
        post.style = `height: ${currentHeight};`;
        //  post.html.outerHTML = '';
    }
    function rearrangePosts() {
        //scan the posts array
        //when you have a series of unloaded posts save their height
        //then when you stumble on a loaded post... margin it by the accumulated height
        //dont start accumulating again until you reach the next loaded post
    }
    function createPostElement(postData) {
        const postDiv = document.createElement("div");
        postDiv.className = "post";
        postDiv.id = `post-${postData._id || globalPostCounter}`;

        let mediaContentHolder = document.createElement('div');
        mediaContentHolder.className = 'media-container'
        mediaContentHolder.style = 'display:flex; width:100%; height:auto;';
        // mediaContentHolder.style = mediaItemWrapperStyle;

        let height = 20;
        if (postData.mediaItems && postData.mediaItems.length > 0) {
            postData.mediaItems.forEach(mediaItem => {
                const altText = postData.originalFileName || `Media from ${postData.userID}`;
                // This style makes each media item wrapper a "slide" and should clip its content.

                if (mediaItem.type === 'image') {
                    // Styles for image:
                    // - display: block; (good practice)
                    // - box-sizing: border-box; (ensures padding/border don't add to width)
                    // - width: 100%; (take full width of media-item-wrapper)
                    // - max-width: 100%; (safeguard against exceeding wrapper width)
                    // - height: auto; (maintain aspect ratio)
                    // - object-fit: contain; (fit image within bounds, maintaining aspect ratio)
                    // - max-height: 60vh; (user-defined maximum height)
                    let image = document.createElement('img');
                    image.style = `width:${100 / postData.mediaItems.length}%;height:auto;`;
                    image.src = mediaItem.url;
                    mediaContentHolder.appendChild(image);
                } else if (mediaItem.type === 'video') {
                    video = document.createElement("video");
                    wrapper = document.createElement("div");
                    video.style = `width:${100 / postData.mediaItems.length}%; height:auto;`;
                    video.controls = true;
                    playVideo(video, mediaItem.url);
                    // Styles for video (similar to image for consistency):
                    // - max-height: 60vh;
                    // - width: 100%; max-width: 100%; box-sizing: border-box;

                    mediaContentHolder.appendChild(video);
                } else {
                    // mediaContentHolder += `<div class="media-item-wrapper" style="${mediaItemWrapperStyle} min-height: 200px;"><span>Unsupported media type: ${mediaItem.type}</span></div>`;
                }
            });
        } else {
            mediaContentHolder.innerHTML = `<div class="post-element" style="width:${postData.mediaItems.length * 100}%; aspect-ratio: 16/9; display:flex; align-items:center; justify-content:center; background-color: #eee;"><span>No media available</span></div>`;
        }
        const postElementContainerStyle = `display:flex; width:${100 * postData.mediaItems.length}%; flex-direction:row;align-items:center`;
        postDiv.innerHTML = `
            <div class="credit-bar">
                <span class="author-details">
                    <div class="profile-wrapper"><i class="fi fi-ss-user"></i></div>
                    <div class="post-details"> <span class="username-text">u/${postData.userID || 'username'}</span>  ${new Date(postData.createdAt).toLocaleDateString()} </div>
                </span>
                <span class="street-details">${postData.streetName || 's/street'} <div class="street-icon-wrapper"><i class="fi fi-ss-user"></i></div></span>
            </div>
            <div class="title-bar">
                <span class="post-title">${postData.originalFileName || 'Post Title'}</span>
            </div>
            <div class="post-element-container"  style = "overflow:hidden;">
                <div class = "post-element-sidescroll-container" style ="${postElementContainerStyle}">
                    
                </div>
            </div>
            <div class="post-interactions">
                <div class="feedback-container">
                    <div class="up-down-votes inb">
                        <div class="up-votes icon-wrapper"><i class="fi fi-rr-up"></i><span>${postData.upvotes || 0}</span></div>
                        <span>|</span>
                        <div class="down-votes icon-wrapper"><i class="fi fi-rr-down"></i></div>
                    </div>
                    <div class="comments-button inb">
                        <i class="fi fi-rr-comment-alt"></i><span>${postData.commentsCount || 0}</span>
                    </div>
                    <span>
                    ${postData.views || Math.floor(Math.random() * 20)}k views
                    </span>
                </div>
                <div class="post-options-container">
                    <div class="share-button inb"><i class="fi fi-rr-paper-plane"></i></div>
                </div>
            </div>
        `;
        const sideScrollContainer = postDiv.querySelector(".post-element-sidescroll-container");
        if (sideScrollContainer) {
            sideScrollContainer.appendChild(mediaContentHolder); // Append the actual media content
        } else {
            console.error("Error: '.post-element-outer-container' not found in postDiv.innerHTML.");
        }

        return postDiv;

    }
    async function playVideo(videoEl, url) {
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

    //
    function loadMorePosts() {
        if (isLoading) return;

        console.log(`Loading test posts...`);
        isLoading = true;
        if (loadingIndicator) loadingIndicator.style.display = "block";

        setTimeout(() => {
            const postsToLoad = 4; // Adjusted to match sample data variety
            for (let i = 0; i < postsToLoad; i++) {
                const sampleIndex = globalPostCounter % sampleTestPosts.length;
                const baseSamplePost = sampleTestPosts[sampleIndex];

                const newMediaItems = baseSamplePost.mediaItems.map((item, mediaIdx) => {
                    let newUrl = item.url;
                    if (item.url.includes('picsum.photos/seed/')) {
                        newUrl = item.url.replace(/seed\/[^/]+/, `seed/gen_${globalPostCounter}_${i}_${mediaIdx}_${Date.now() % 1000}`);
                    } else if (item.url.includes('dummy_hls_playlist')) {
                        newUrl = `${item.url.split('.')[0]}_${globalPostCounter}_${i}_${mediaIdx}.m3u8`;
                    }
                    return { ...item, url: newUrl };
                });

                const newPostData = {
                    ...baseSamplePost,
                    cursor: 0,
                    loaded: true,
                    mediaItems: newMediaItems,
                    _id: `testpost_instance_${globalPostCounter}_${i}`,
                    createdAt: new Date(Date.now() - 3600000 * Math.random() * (globalPostCounter * 5 + i + 1)).toISOString(),
                    upvotes: Math.floor(Math.random() * (baseSamplePost.upvotes + 50)),
                    commentsCount: Math.floor(Math.random() * (baseSamplePost.commentsCount + 10)),
                    originalFileName: `${baseSamplePost.originalFileName} (Instance #${globalPostCounter * postsToLoad + i + 1})`,
                    views: Math.floor(Math.random() * 100),
                    html: null
                };

                const postElement = createPostElement(newPostData);

                newPostData.html = postElement;
                enableSwipeOnPost(newPostData);
                if (feedContainer) {
                    feedContainer.appendChild(postElement);
                } else {
                    console.error("#feed-container not found!");
                }
                posts.push(newPostData);

            }
            globalPostCounter++;

            isLoading = false;
            if (loadingIndicator) loadingIndicator.style.display = "none";
            console.log("Finished loading test posts.");

            // Use postsToLoad for accurate calculation here
            const totalPostsGenerated = document.querySelectorAll('.post').length; // More robust count of actual posts in DOM
            const maxTestPosts = 28; // Example limit

            if (totalPostsGenerated >= maxTestPosts) {
                if (loadingIndicator && loadingIndicator.textContent !== "Reached end of test posts.") {
                    loadingIndicator.textContent = "Reached end of test posts.";
                    loadingIndicator.style.display = "block"; // Keep it visible
                }
            }
        }, 5);
    }

    window.addEventListener("scroll", () => {

        posts.forEach(post => {
            y = (post.html.getBoundingClientRect().top + window.scrollY);
            if (y < window.scrollY - 2000 && post.loaded) {
                unloadPost(post);
            }
        });
        console.log(window.scrollY);
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
});

function isAtPageBottom(padding = 5) {
    const scrollTop = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;
    return scrollTop + viewportHeight >= totalHeight - padding;
}