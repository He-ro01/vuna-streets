
const loading = document.getElementById("loadingIndicator");
const header = document.getElementById("pageHeader");

let postCount = 0;
let isLoading = false;
let lastScrollTop = 0;
let post_objects = {};
function createPost(i) {
    const post = document.createElement("div");
    post.className = "post";
    post.innerHTML = `
<div class="credit-bar">
    <span class="author-details">
        <div class="profile-wrapper"><i class="fi fi-ss-user"></i></div><span id="username-text">u/username</span>
        <div class="post-details"> 4h <i class="fi fi-sr-bullet"></i> 15k views</div>
    </span>
    <span class="street-details">s/streeeeeeeeeeet <div class="street-icon-wrapper"><i class="fi fi-ss-user"></i></div>
    </span>
</div>
<div class="title-bar">
    <span class="post-title">Post Title</span>
</div>
<div class="post-element-container">

</div>
<div class="post-interactions">
    <div class=" feedback-container">
        <div class="up-down-votes inb">
            <div class="up-votes icon-wrapper"><i class="fi fi-rr-up"></i><span>50</span></div>
            <span>|</span>
            <div class="down-votes icon-wrapper"><i class="fi fi-rr-down"></i></div>
        </div>
        <div class="comments-button inb">
            <i class="fi fi-rr-comment-alt"></i><span>1</span>
        </div>
    </div>

    <div class="post-options-container">
        <div class=" share-button inb">
            <i class="fi fi-rr-paper-plane"></i>
        </div>
    </div>

</div>
</div>`;
    return post;
}

function loadMorePosts() {
    if (isLoading) return;
    isLoading = true;
    loading.style.display = "block";

    setTimeout(() => {
        for (let i = 0; i < 10; i++) {
            container.appendChild(createPost(++postCount));
        }
        isLoading = false;
        loading.style.display = "none";
    }, 1000); // simulate network delay
}

window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Header hide/show logic
    if (scrollTop > lastScrollTop) {
        // Scrolling down
        header.style.transform = "translateY(-100%)";
    } else {
        // Scrolling up
        header.style.transform = "translateY(0)";
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

    // Infinite scroll logic
    const scrollBottom = window.innerHeight + scrollTop;
    const documentHeight = document.documentElement.offsetHeight;

    if (scrollBottom >= documentHeight - 100) {
        loadMorePosts();
    }
});

// Initial load
loadMorePosts();