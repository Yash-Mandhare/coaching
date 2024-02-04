const mongoose = require('mongoose');

const viewsSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    }
});

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    views: [viewsSchema], // Array of views, each containing userID
});

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    videos: [videoSchema], // Array of videos in the playlist
    thumbnail: {
        type: String,  // Assuming the playlist thumbnail is stored as a URL
    },
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
    playlists: [playlistSchema], // Array of playlists for the user
});

module.exports = mongoose.model('User', userSchema);
