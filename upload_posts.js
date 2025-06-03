const fileInput = document.getElementById('file-input');
const uploadSection = document.getElementById('uploadSection');
const imageEditorSection = document.getElementById('imageEditorSection');
const videoEditorSection = document.getElementById('videoEditorSection');
const backButtons = document.querySelectorAll('.back-button');
//
const uploadPostHome = document.querySelector('.upload-post-home');


create_post_button.onclick = function (event) {
  // You can use the event object if needed, for example, event.preventDefault()
  // if createpost is a link or submit button and you want to stop its default action.
  if (uploadPostHome) {
    uploadPostHome.style.display = 'block';
    
    home_feed.style = 'display:none;';
    footer.style = 'display:none;'
    console.log('Set display of "upload-post-home" to flex.');
  } else {
    console.error('Element with ID "upload-post-home" not found.');
  }
};
function close_post()
{
    uploadPostHome.style.display = 'none';
   
    home_feed.style = 'display:block;';
    footer.style = 'display:flex;'
}
// --- Global State ---
let currentFile = null;

// --- File Input Handling ---
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  currentFile = file;

  if (file.type.startsWith('image/')) {
    initImageEditor(file);
  } else if (file.type.startsWith('video/')) {
    initVideoEditor(file);
  } else {
    alert('Unsupported file type. Please select an image or video.');
    resetToUpload();
  }
}

function resetToUpload() {
  uploadSection.style.display = 'block';
  imageEditorSection.style.display = 'none';
  videoEditorSection.style.display = 'none';
  fileInput.value = ''; // Reset file input
  currentFile = null;
  // Cleanup specific editor states if necessary
  if (videoPlayer.src) URL.revokeObjectURL(videoPlayer.src);
}

backButtons.forEach(button => button.addEventListener('click', resetToUpload));

// --- Image Cropper Logic (Adapted from your provided code) ---
const imgCropper = {
  handles: {
    tl: document.getElementById('tl'),
    tr: document.getElementById('tr'),
    br: document.getElementById('br'),
    bl: document.getElementById('bl')
  },
  cropBox: document.getElementById('imageCropBox'),
  imageElement: document.getElementById('cropperImage'),
  container: document.getElementById('image-cropper-container'),
  rect: { x: 50, y: 50, width: 200, height: 150 }, // Default, will be overridden
  startX: 0, startY: 0, activeHandle: null,
  minCropDim: 40, // Min practical dimension for crop box (2x handle size)

  init(file) {
    uploadSection.style.display = 'none';
    videoEditorSection.style.display = 'none';
    imageEditorSection.style.display = 'flex';

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageElement.src = e.target.result;
      this.imageElement.onload = () => { // Ensure image is loaded and has dimensions
        this.setupInitialRect();
        this.updateUI();
      }
      this.imageElement.onerror = () => {
        alert("Error loading image.");
        resetToUpload();
      }
    };
    reader.readAsDataURL(file);

    Object.values(this.handles).forEach(handle => {
      handle.removeEventListener('mousedown', this.onStart); // Remove old if any
      handle.removeEventListener('touchstart', this.onStart);
      handle.addEventListener('mousedown', this.onStart.bind(this));
      handle.addEventListener('touchstart', this.onStart.bind(this), { passive: false });
    });
    // Bind document events here to ensure they are properly managed with 'this' context
    this.boundOnDrag = this.onDrag.bind(this);
    this.boundOnEnd = this.onEnd.bind(this);
  },

  setupInitialRect() {
    const imgWidth = this.imageElement.offsetWidth;
    const imgHeight = this.imageElement.offsetHeight;
    this.rect.width = Math.min(imgWidth, imgHeight) * 0.8;
    this.rect.height = this.rect.width; // Default to square aspect ratio
    if (this.rect.height > imgHeight * 0.8) { // If square is too tall
      this.rect.height = imgHeight * 0.8;
      this.rect.width = this.rect.height; // Make it square based on height
    }
    if (this.rect.width > imgWidth * 0.8) { // If square is too wide
      this.rect.width = imgWidth * 0.8;
      this.rect.height = this.rect.width;
    }


    this.rect.x = (imgWidth - this.rect.width) / 2;
    this.rect.y = (imgHeight - this.rect.height) / 2;

    // Ensure initial rect is within bounds and meets min dimensions
    this.rect.width = Math.max(this.minCropDim, this.rect.width);
    this.rect.height = Math.max(this.minCropDim, this.rect.height);
    this.rect.x = Math.max(0, Math.min(this.rect.x, imgWidth - this.rect.width));
    this.rect.y = Math.max(0, Math.min(this.rect.y, imgHeight - this.rect.height));
  },

  updateUI() {
    this.cropBox.style.left = this.rect.x + 'px';
    this.cropBox.style.top = this.rect.y + 'px';
    this.cropBox.style.width = this.rect.width + 'px';
    this.cropBox.style.height = this.rect.height + 'px';

    const handleSize = this.handles.tl.offsetWidth; // Assumes all handles are same size
    const handleOffset = handleSize / 2;

    this.handles.tl.style.left = this.rect.x - handleOffset + 'px';
    this.handles.tl.style.top = this.rect.y - handleOffset + 'px';
    this.handles.tr.style.left = this.rect.x + this.rect.width - handleOffset + 'px';
    this.handles.tr.style.top = this.rect.y - handleOffset + 'px';
    this.handles.br.style.left = this.rect.x + this.rect.width - handleOffset + 'px';
    this.handles.br.style.top = this.rect.y + this.rect.height - handleOffset + 'px';
    this.handles.bl.style.left = this.rect.x - handleOffset + 'px';
    this.handles.bl.style.top = this.rect.y + this.rect.height - handleOffset + 'px';
  },

  onStart(e) {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.activeHandle = e.target.id;
    document.addEventListener('mousemove', this.boundOnDrag);
    document.addEventListener('touchmove', this.boundOnDrag, { passive: false });
    document.addEventListener('mouseup', this.boundOnEnd);
    document.addEventListener('touchend', this.boundOnEnd);
  },

  onDrag(e) {
    if (!this.activeHandle) return;
    const touch = e.touches ? e.touches[0] : e;
    let dx = touch.clientX - this.startX;
    let dy = touch.clientY - this.startY;

    // Store previous state for complex clamping cases
    const prevRect = { ...this.rect };

    // --- Core logic from your provided code ---
    if (this.activeHandle === 'tl') {
      this.rect.x += dx; this.rect.y += dy; this.rect.width -= dx; this.rect.height -= dy;
    } else if (this.activeHandle === 'tr') {
      this.rect.y += dy; this.rect.width += dx; this.rect.height -= dy;
    } else if (this.activeHandle === 'br') {
      this.rect.width += dx; this.rect.height += dy;
    } else if (this.activeHandle === 'bl') {
      this.rect.x += dx; this.rect.width -= dx; this.rect.height += dy;
    }
    // --- End of core logic ---

    // Clamp to minimum practical dimensions first
    if (this.rect.width < this.minCropDim) {
      if (this.activeHandle === 'tl' || this.activeHandle === 'bl') { // Resizing from left
        this.rect.x = prevRect.x + prevRect.width - this.minCropDim;
      }
      this.rect.width = this.minCropDim;
    }
    if (this.rect.height < this.minCropDim) {
      if (this.activeHandle === 'tl' || this.activeHandle === 'tr') { // Resizing from top
        this.rect.y = prevRect.y + prevRect.height - this.minCropDim;
      }
      this.rect.height = this.minCropDim;
    }

    // Boundary clamping (ensure cropBox stays within imageElement)
    const parentWidth = this.imageElement.offsetWidth;
    const parentHeight = this.imageElement.offsetHeight;

    this.rect.x = Math.max(0, this.rect.x);
    this.rect.y = Math.max(0, this.rect.y);

    if (this.rect.x + this.rect.width > parentWidth) {
      this.rect.width = parentWidth - this.rect.x;
      if (this.rect.width < this.minCropDim) { // If clamping made it too small
        this.rect.width = this.minCropDim;
        this.rect.x = parentWidth - this.minCropDim; // Adjust x to fit
      }
    }
    if (this.rect.y + this.rect.height > parentHeight) {
      this.rect.height = parentHeight - this.rect.y;
      if (this.rect.height < this.minCropDim) {
        this.rect.height = this.minCropDim;
        this.rect.y = parentHeight - this.minCropDim;
      }
    }
    // Final check for x,y if width/height was reduced to minDim at the boundary
    this.rect.x = Math.max(0, Math.min(this.rect.x, parentWidth - this.rect.width));
    this.rect.y = Math.max(0, Math.min(this.rect.y, parentHeight - this.rect.height));


    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.updateUI();
  },

  onEnd() {
    this.activeHandle = null;
    document.removeEventListener('mousemove', this.boundOnDrag);
    document.removeEventListener('touchmove', this.boundOnDrag);
    document.removeEventListener('mouseup', this.boundOnEnd);
    document.removeEventListener('touchend', this.boundOnEnd);
  },

  getAnchors() {
    // Coordinates are relative to the displayed image size.
    // Backend would need this info along with original image dimensions for accurate cropping.
    return {
      x: this.rect.x,
      y: this.rect.y,
      width: this.rect.width,
      height: this.rect.height,
      imageWidth: this.imageElement.offsetWidth, // displayed width
      imageHeight: this.imageElement.offsetHeight // displayed height
    };
  }
};
document.getElementById('saveImageCrop').addEventListener('click', async () => {
  const anchors = imgCropper.getAnchors();
  console.log('Image Crop Anchors:', anchors);

  if (!currentFile) {
    alert('No file selected or loaded for cropping.');
    return;
  }

  const formData = new FormData();
  formData.append('file', currentFile); // Append the actual image file
  formData.append('userID', 'aksmai0034');
  formData.append('cropDetails', JSON.stringify(anchors)); // Send anchors as a JSON string
  formData.append('uploadType', 'image-crop'); // To help backend identify the task

  try {
    // Replace '/your-backend-endpoint' with your actual backend URL
    const response = await fetch('http://localhost:3000/api/process-media', {
      method: 'POST',
      body: formData
      // Headers are not typically needed for FormData with fetch,
      // the browser sets 'Content-Type': 'multipart/form-data' automatically.
    });

    if (response.ok) {
      const result = await response.json(); // Or response.text() depending on your backend
      alert('Image and crop data sent successfully!');
      console.log('Server response:', result);
      resetToUpload(); // Optionally reset UI
    } else {
      alert(`Error sending image: ${response.statusText}`);
      console.error('Server error:', await response.text());
    }
  } catch (error) {
    alert(`Network error: ${error.message}`);
    console.error('Network error:', error);
  }
});
function initImageEditor(file) {
  imgCropper.init(file);
}


// --- Video Trimmer Logic ---
const videoPlayer = document.getElementById('videoPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = playPauseBtn.querySelector('i');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const durationDisplay = document.getElementById('durationDisplay');
const timeline = document.getElementById('timeline');
const playhead = document.getElementById('playhead');
const trimRange = document.getElementById('trim-range');
const startHandle = document.getElementById('startHandle');
const endHandle = document.getElementById('endHandle');
const saveVideoTrimBtn = document.getElementById('saveVideoTrim');

let videoDuration = 0;
let startTime = 0;
let endTime = 0;
let activeTimelineHandle = null;
let timelineRect = null;

function initVideoEditor(file) {
  uploadSection.style.display = 'none';
  imageEditorSection.style.display = 'none';
  videoEditorSection.style.display = 'flex';
  if (videoPlayer.src) {
    URL.revokeObjectURL(videoPlayer.src); // Revoke old object URL
  }
  videoPlayer.src = URL.createObjectURL(file);
  videoPlayer.controls = false; // Use custom controls
}

videoPlayer.onloadedmetadata = () => {
  videoDuration = videoPlayer.duration;
  startTime = 0;
  endTime = videoDuration;
  durationDisplay.textContent = formatTime(videoDuration);
  currentTimeDisplay.textContent = formatTime(0);
  playPauseIcon.classList.add("fi-sr-play");


  updateTimelineUI();
};

videoPlayer.ontimeupdate = () => {
  currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
  const playheadPos = (videoPlayer.currentTime / videoDuration) * 100;
  playhead.style.left = `${playheadPos}%`;

  // Loop within trimmed range if playing
  if (videoPlayer.currentTime >= endTime) {
    videoPlayer.currentTime = startTime;
    if (!videoPlayer.loop) videoPlayer.pause(); // if not set to loop, pause.
  }
};

videoPlayer.onplay = () => {
  playPauseIcon.classList.add("fi-sr-pause");
  playPauseIcon.classList.remove("fi-sr-play");
};

videoPlayer.onpause = () => {
  playPauseIcon.classList.remove("fi-sr-pause");
  playPauseIcon.classList.add("fi-sr-play");
};

playPauseBtn.addEventListener('click', () => {
  if (videoPlayer.paused || videoPlayer.ended) {
    if (videoPlayer.currentTime < startTime || videoPlayer.currentTime >= endTime) {
      videoPlayer.currentTime = startTime; // Start from the beginning of the trim
    }
    videoPlayer.play();
  } else {
    videoPlayer.pause();
  }
});

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimelineUI() {
  if (videoDuration === 0) return; // Avoid division by zero
  const startPercent = (startTime / videoDuration) * 100;
  const endPercent = (endTime / videoDuration) * 100;

  startHandle.style.left = `calc(${startPercent}% - ${startHandle.offsetWidth / 2}px)`;
  endHandle.style.left = `calc(${endPercent}% - ${endHandle.offsetWidth / 2}px)`;
  trimRange.style.left = `${startPercent}%`;
  trimRange.style.width = `${endPercent - startPercent}%`;
  playhead.style.left = `${(videoPlayer.currentTime / videoDuration) * 100}%`;
}

function handleTimelineDrag(event) {
  if (!activeTimelineHandle) return;
  event.preventDefault();
  const touch = event.touches ? event.touches[0] : event;
  let x = touch.clientX - timelineRect.left;
  let percent = (x / timelineRect.width) * 100;
  percent = Math.max(0, Math.min(100, percent)); // Clamp between 0 and 100%

  const newTime = (percent / 100) * videoDuration;

  if (activeTimelineHandle === 'start') {
    startTime = Math.min(newTime, endTime - 0.1); // Ensure start is before end (0.1s min duration)
    startTime = Math.max(0, startTime); // Ensure start is not negative
  } else if (activeTimelineHandle === 'end') {
    endTime = Math.max(newTime, startTime + 0.1); // Ensure end is after start
    endTime = Math.min(videoDuration, endTime); // Ensure end is not beyond duration
  }
  videoPlayer.currentTime = startTime; // Seek to new start time for preview
  updateTimelineUI();
}

function stopTimelineDrag() {
  activeTimelineHandle = null;
  document.removeEventListener('mousemove', handleTimelineDrag);
  document.removeEventListener('touchmove', handleTimelineDrag);
  document.removeEventListener('mouseup', stopTimelineDrag);
  document.removeEventListener('touchend', stopTimelineDrag);
}

[startHandle, endHandle].forEach(handle => {
  handle.addEventListener('mousedown', (e) => {
    activeTimelineHandle = e.target.id === 'startHandle' ? 'start' : 'end';
    timelineRect = timeline.getBoundingClientRect();
    document.addEventListener('mousemove', handleTimelineDrag);
    document.addEventListener('mouseup', stopTimelineDrag);
  });
  handle.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent page scroll
    activeTimelineHandle = e.target.id === 'startHandle' ? 'start' : 'end';
    timelineRect = timeline.getBoundingClientRect();
    document.addEventListener('touchmove', handleTimelineDrag, { passive: false });
    document.addEventListener('touchend', stopTimelineDrag);
  }, { passive: false });
});

timeline.addEventListener('click', (e) => {
  timelineRect = timeline.getBoundingClientRect();
  let x = e.clientX - timelineRect.left;
  let percent = (x / timelineRect.width);
  videoPlayer.currentTime = percent * videoDuration;
});


saveVideoTrimBtn.addEventListener('click', async () => {
  const trimDetails = {
    start: startTime,
    end: endTime,
    videoDuration: videoDuration // It's good to send original duration too
  };
  console.log('Video Trim Timestamps:', trimDetails);

  if (!currentFile) {
    alert('No file selected or loaded for trimming.');
    return;
  }

  const formData = new FormData();
  formData.append('file', currentFile); // Append the actual video file
  formData.append('userID', 'aksmai0034');
  formData.append('trimDetails', JSON.stringify(trimDetails)); // Send trim times as a JSON string
  formData.append('uploadType', 'video-trim'); // To help backend identify the task

  try {
    // Replace '/your-backend-endpoint' with your actual backend URL
    const response = await fetch('http://localhost:3000/api/process-media', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json(); // Or response.text()
      alert('Video and trim data sent successfully!');
      console.log('Server response:', result);
      resetToUpload(); // Optionally reset UI
    } else {
      alert(`Error sending video: ${response.statusText}`);
      console.error('Server error:', await response.text());
    }
  } catch (error) {
    alert(`Network error: ${error.message}`);
    console.error('Network error:', error);
  }
});

// Initial setup on window resize for responsive UI updates
window.addEventListener('resize', () => {
  if (imageEditorSection.style.display === 'block' && imgCropper.imageElement.src && imgCropper.imageElement.src !== '#') {
    // Re-initialize rect based on new image size, or scale existing rect
    // For simplicity, let's re-setup (might lose current crop if not careful)
    // A more sophisticated approach would be to scale this.rect proportionally.
    imgCropper.setupInitialRect();
    imgCropper.updateUI();
  }
  if (videoEditorSection.style.display === 'block' && videoDuration > 0) {
    updateTimelineUI();
  }
});