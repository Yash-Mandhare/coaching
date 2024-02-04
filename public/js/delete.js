document.addEventListener('DOMContentLoaded', function () {
    // Get all delete buttons in the Playlist section
    const playlistDeleteButtons = document.querySelectorAll('.Playlist-delete-button');

    // Get the playlist modal and buttons
    const playlistModal = document.getElementById('playlist-confirmation-modal');
    const playlistConfirmYes = document.getElementById('Playlist-confirm-yes');
    const playlistConfirmNo = document.getElementById('Playlist-confirm-no');

    // Attach click event listener to each delete button in the Playlist section
    playlistDeleteButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            // Get the user ID from the data-id attribute
            const userId = this.getAttribute('data-id');
            const playlist = this.getAttribute('playlistindex')
            // Show the playlist confirmation modal
            playlistModal.style.display = 'flex';

            // Attach event listener to "Yes" button in the Playlist section
            playlistConfirmYes.addEventListener('click', function () {
                // Redirect to the delete route for playlists
                window.location.href = `/delete_playlist/${userId}/${playlist}`;
            });

            // Attach event listener to "No" button in the Playlist section
            playlistConfirmNo.addEventListener('click', function () {
                // Hide the playlist confirmation modal
                playlistModal.style.display = 'none';
            });
        });
    });

    // Get all delete buttons in the Video section
    const videoDeleteButtons = document.querySelectorAll('.delete-video-button');

    // Get the video modal and buttons
    const videoModal = document.getElementById('video-confirmation-modal');
    const videoConfirmYes = document.getElementById('video-confirm-yes');
    const videoConfirmNo = document.getElementById('video-confirm-no');

    // Attach click event listener to each delete button in the Video section
    videoDeleteButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();

            // Get the user ID, playlist index, and video index from data attributes
            const userId = this.getAttribute('data-user-id');
            const playlistIndex = this.getAttribute('data-playlist-index');
            const videoIndex = this.getAttribute('data-video-index');

            // Show the video confirmation modal
            videoModal.style.display = 'flex';

            // Attach event listener to "Yes" button in the Video section
            videoConfirmYes.addEventListener('click', function () {
                // Redirect to the delete route for videos
                window.location.href = `/delete_video/${userId}/${playlistIndex}/${videoIndex}`;
            });

            // Attach event listener to "No" button in the Video section
            videoConfirmNo.addEventListener('click', function () {
                // Hide the video confirmation modal
                videoModal.style.display = 'none';
            });
        });
    });
});

