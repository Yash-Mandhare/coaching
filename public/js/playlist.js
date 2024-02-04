function playVideo(videoFileName, videoTitle, videoDescription, playlistId, videoIndex) {
    const videoElement = document.getElementById('video');
    const titleElement = document.querySelector('.title');
    const descriptionElement = document.getElementById('videoDescription');

    const videoUrl = `/uploads/video/${videoFileName}`;

    videoElement.src = videoUrl;
    titleElement.textContent = videoTitle;
    descriptionElement.textContent = videoDescription;

    const videoInfo = {
        playlistId: playlistId,
        videoIndex: videoIndex,
        url: videoFileName,
        title: videoTitle,
        description: videoDescription
    };

    localStorage.setItem('lastPlayedVideo', JSON.stringify(videoInfo));

    const redirectUrl = `/playlist/${playlistId}/video/${videoIndex}/${encodeURIComponent(videoTitle)}`;
    history.pushState(null, null, redirectUrl);

    updateVideoLinks(playlistId, videoIndex,videoTitle);
    
}

// Function to update video links appearance
function updateVideoLinks(playlistId, videoIndex,videoTitle) {
    const videoLinks = document.querySelectorAll('.playlist.video .video-link');

    videoLinks.forEach(link => {
        link.classList.remove('playing');
    });

    const currentVideoLink = document.querySelector(`.playlist.video .video-link[data-playlist-id="${playlistId}"][data-video-index="${videoIndex}"]`);

    if (currentVideoLink) {
        currentVideoLink.classList.add('playing');
    }
    updateViews(playlistId, videoIndex, videoTitle);
}

// Function to make an AJAX request to Updateviews route
async function updateViews(playlistId, videoIndex, videoTitle) {
    try {
        console.log('Updating views...');

        const response = await fetch(`/Updateviews/${playlistId}/video/${videoIndex}/${encodeURIComponent(videoTitle)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Updateviews route activated:', data);

        // Redirect to the Updateviews route
        window.location.href = response.url;
    } catch (error) {
        console.error('Error during Updateviews request:', error);
    }
}

// Function to play video based on the clicked link
function playVideoFromLink(videoLink) {
    try {
        const videoUrl = videoLink.getAttribute('data-url');
        const videoTitle = videoLink.getAttribute('data-title');
        const videoDescription = videoLink.getAttribute('data-description');
        const playlistId = videoLink.getAttribute('data-playlist-id');
        const videoIndex = videoLink.getAttribute('data-video-index');

        playVideo(videoUrl, videoTitle, videoDescription, playlistId, videoIndex);
        updateViews(playlistId, videoIndex, videoTitle);
    } catch (error) {
        console.error('Error during playVideoFromLink:', error);
    }
}

// Play the first video on page load
document.addEventListener('DOMContentLoaded', function () {
    try {
        const firstVideoLink = document.querySelector('.playlist.video .video-link');
        
        if (firstVideoLink) {
            const videoUrl = firstVideoLink.getAttribute('data-url');
            const videoTitle = firstVideoLink.getAttribute('data-title');
            const videoDescription = firstVideoLink.getAttribute('data-description');
            const playlistId = firstVideoLink.getAttribute('data-playlist-id');
            const videoIndex = firstVideoLink.getAttribute('data-video-index');

            playVideo(videoUrl, videoTitle, videoDescription, playlistId, videoIndex);
        }
    } catch (error) {
        console.error('Error during initial video playback:', error);
    }
});

// Restore last played video from local storage on page load
document.addEventListener('DOMContentLoaded', function () {
    try {
        const lastPlayedVideo = localStorage.getItem('lastPlayedVideo');

        if (lastPlayedVideo) {
            const videoInfo = JSON.parse(lastPlayedVideo);
            playVideo(videoInfo.url, videoInfo.title, videoInfo.description, videoInfo.playlistId, videoInfo.videoIndex);
        }
    } catch (error) {
        console.error('Error during last played video restoration:', error);
    }
});

// Clear last played video from local storage when the user closes the tab or exits the page
window.addEventListener('beforeunload', function () {
    localStorage.removeItem('lastPlayedVideo');
});

// Event delegation to handle clicks on dynamically generated links
document.addEventListener('click', function (event) {
    if (event.target.matches('.playlist.video .video-link')) {
        event.preventDefault();
        try {
            const videoLink = event.target;
            playVideoFromLink(videoLink);
        } catch (error) {
            console.error('Error during video link click:', error);
        }
    }
});

// Add event listeners for next and previous buttons
document.getElementById('nextButton').addEventListener('click', playNextVideo);
document.getElementById('prevButton').addEventListener('click', playPreviousVideo);

// Function to play the next video
function playNextVideo() {
    try {
        playAdjacentVideo(1);
    } catch (error) {
        console.error('Error during next video playback:', error);
    }
}

// Function to play the previous video
function playPreviousVideo() {
    try {
        playAdjacentVideo(-1);
    } catch (error) {
        console.error('Error during previous video playback:', error);
    }
}

// Function to play video based on the direction (1 for next, -1 for previous)
function playAdjacentVideo(direction) {
    const currentVideoLink = document.querySelector('.playlist.video .video-link.playing');
    
    if (currentVideoLink) {
        const playlistId = currentVideoLink.getAttribute('data-playlist-id');
        const videoIndex = parseInt(currentVideoLink.getAttribute('data-video-index'));
        const newVideoIndex = videoIndex + direction;

        const adjacentVideoLink = document.querySelector(`.playlist.video .video-link[data-playlist-id="${playlistId}"][data-video-index="${newVideoIndex}"]`);

        if (adjacentVideoLink) {
            playVideoFromLink(adjacentVideoLink);
        }
    }
}
