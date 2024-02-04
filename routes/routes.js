const express = require('express');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users');
const multer = require('multer');
const users = require('../models/users');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const storagevideo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/video');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const storagethumbnail = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/thumbnail');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const uploadProfileImage = multer({ storage: storage }).single('profileImage');
const uploadThumbnail = multer({ storage: storagethumbnail }).single('thumbnail');
const uploadVideo = multer({ storage: storagevideo }).single('video');

// Insert end user into database route.
router.post('/register', uploadProfileImage, async (req, res) => {
  try {
    const { name, email, phone, role, password, c_pass } = req.body;

    // Additional validation (you can customize this)
    if (password !== c_pass) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      role,
      phone,
      password: hashedPassword, // Store the hashed password
      profileImage: req.file.filename, // Assuming multer is handling file upload correctly
    });

    // Save the user to the database
    await newUser.save();

    // Redirect to the login page after successful registration
    req.session.message = {
      type: 'success',
      message: 'user registered successfully'
    };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/registerteacher', uploadProfileImage, async (req, res) => {
  try {
    const { name, email, phone, role, password, c_pass } = req.body;

    // Additional validation (you can customize this)
    if (password !== c_pass) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      role,
      phone,
      password: hashedPassword, // Store the hashed password
      profileImage: req.file.filename, // Assuming multer is handling file upload correctly
    });

    // Save the user to the database
    await newUser.save();

    // Redirect to the login page after successful registration
    req.session.message = {
      type: 'success',
      message: 'user registered successfully'
    };
    if (req.session.login.role === 'Admin') {
      res.redirect(`/Admin/${req.session.login._id}`);
    } else {
      res.redirect('/home')
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/checkEmail', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update the user details.

/*-----------------------------------*\
              Login
\*-----------------------------------*/

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {

        req.session.login = user;
        // Check the role of the user and redirect accordingly
        if (user.role === 'Student') {
          // Redirect to student profile page and display email in the URL
          res.redirect(`/student_dashboard/${user._id}`);
        } else if (user.role === 'Teacher') {
          // Redirect to teacher profile page and display email in the URL
          res.redirect(`/Teacher_Dashboard/${user._id}`);
        } else if (user.role === 'Admin') {
          // Redirect to teacher profile page and display email in the URL
          res.redirect(`/Admin/${user._id}`);
        } else {
          // Handle other roles if needed
          res.send('Invalid role');
        }
      } else {
        req.session.message = {
          type: 'danger',
          message: 'Password is incorrect.'
        };
        res.redirect('/login');
      }
    } else {
      req.session.message = {
        type: 'danger',
        message: 'User not found.'
      };
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

/*-----------------------------------*\
              Reset Password
\*-----------------------------------*/
router.post('/resetpass', async (req, res) => {
  try {
    console.log('Received POST request with body:', req.body);
    const { email, password } = req.body;

    console.log(`POST request received for /reset_password with email: ${email}`);

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(404).send('User not found');
    }

    // Update the password in the database
    const hashedPassword = await bcrypt.hash(password, 10); // Fix the typo here
    user.password = hashedPassword;
    await user.save();
    console.log(`Password reset successfully for user with email: ${email}`);
    res.redirect('/login');
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/reset_password', (req, res) => {
  try {
    const { testEmail } = req.body;
    console.log(`POST request received for /reset_password with testEmail: ${testEmail}`);
    res.send('Received test form data successfully');
  } catch (error) {
    console.error('Error during form submission:', error);
    res.status(500).send('Internal Server Error');
  }
});


const islogin = (req, res, next) => {
  if (req.session && req.session.login) {
    next();
  } else {
    req.session.message = {
      type: 'danger',
      message: 'You have not logged in.'
    };
    res.redirect('/login');

  }
};
/*-----------------------------------*\
             User update
\*-----------------------------------*/

router.post('/update/:id', uploadProfileImage, async (req, res) => {
  try {
    let id = req.params.id;
    let new_image = '';
    const user = await User.findById(id).exec();
    if (req.file) {
      new_image = req.file.filename;
      try {
        fs.unlinkSync('./' + req.body.old_profileImage);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      new_image = user.profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        profileImage: new_image,
      },
      { new: true } // This option returns the modified document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.session.message = {
      type: 'success',
      message: 'User has been updated',
    };
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/*-----------------------------------*\
              GET ROUTER
\*-----------------------------------*/

router.get('/dashboard/:id', islogin, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id).exec();
    const login = await req.session.login
    if (user._id == login._id) {
      req.session.login = user;
      // Check the role of the user and redirect accordingly
      if (user.role === 'Student') {
        // Redirect to student profile page and display email in the URL
        res.redirect(`/student_dashboard/${user._id}`);
      } else if (user.role === 'Teacher') {
        // Redirect to teacher profile page and display email in the URL
        res.redirect(`/Teacher_Dashboard/${user._id}`);
      } else if (user.role === 'Admin') {
        // Redirect to teacher profile page and display email in the URL
        res.redirect(`/Admin/${user._id}`);
      } else {
        // Handle other roles if needed
        res.send('Invalid role');
      }

    } else {
      req.session.message = {
        type: 'danger',
        message: 'Trying to take unauthorized access.'
      };
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



/*-----------------------------------*\
              Admin
\*-----------------------------------*/

const isAdmin = (req, res, next) => {
  if (req.session && req.session.login && req.session.login.role === 'Admin') {
    next();
  } else {
    req.session.message = {
      type: 'danger',
      message: 'Trying to take unauthorized access.'
    };
    res.redirect('/login');
  }
};


router.get('/Admin/:id', isAdmin, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id).exec();
    const users = await User.find().exec();
    const login = await req.session.login;

    if (user._id == login._id) {
      res.render("admin", {
        title: "Admin",
        users: users,
        login: login,
      });
    } else {
      req.session.message = {
        type: 'danger',
        message: 'Trying to take unauthorized access.'
      };
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/add', isAdmin, (req, res) => {
  res.render('add_teacher', { title: "add_teacher" })
});
/*-----------------------------------*\
              Index
\*-----------------------------------*/

router.get('/', (req, res) => {
  res.render('index', { title: "Coaching Platform" })
});

/*-----------------------------------*\
              Home
\*-----------------------------------*/


router.get('/Home', islogin, async (req, res) => {
  try {
    const users = await User.find().exec();
    const login = await req.session.login
    res.render("home", {
      title: "Home",
      users: users,
      login: login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/About', islogin, async (req, res) => {
  try {
    const users = await User.find().exec();
    const login = await req.session.login
    res.render("about", {
      title: "About",
      users: users,
      login: login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/Contact', islogin, async (req, res) => {
  try {
    const users = await User.find().exec();
    const login = await req.session.login
    res.render("contact", {
      title: "Contact",
      users: users,
      login: login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/*-----------------------------------*\
              teacher
\*-----------------------------------*/
const isTeacher = (req, res, next) => {
  if (req.session && req.session.login && req.session.login.role === 'Teacher') {
    next();
  } else {
    req.session.message = {
      type: 'danger',
      message: 'Trying to take unauthorized access.'
    };
    res.redirect('/login');

  }
};
router.get('/Teacher_profile/:id', islogin, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id).exec();
    const login = await req.session.login

    const playlistCount = user.playlists ? user.playlists.length : 0;
    const videoCount = user.playlists ? user.playlists.reduce((count, playlist) => count + playlist.videos.length, 0) : 0;
    res.render("teacher_profile", {
      title: "Teacher Profile",
      login: login,
      playlistCount,
      videoCount,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/Teacher_Dashboard/:id', isTeacher, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id).exec();
    const users = await User.find().exec();
    const login = await req.session.login
    const loginId = await User.findById(login._id).exec();

    const playlistCount = loginId.playlists ? loginId.playlists.length : 0;
    const videoCount = loginId.playlists ? loginId.playlists.reduce((count, playlist) => count + playlist.videos.length, 0) : 0;

    if (user._id == login._id) {
      res.render("teacher_dashboard", {
        title: "Teacher Dashboard",
        users: users,
        login: login,
        playlistCount,
        videoCount,
        loginId: loginId,
        user: user,
      });
    } else {
      req.session.message = {
        type: 'danger',
        message: 'Trying to take unauthorized access.'
      };
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/Addvideo', isTeacher, async (req, res) => {
  try {
    const users = await User.find().exec();
    const login = await User.findById(req.session.login._id);

    res.render("Addvideo", {
      title: "Addvideo",
      users: users,
      login: login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/Createplaylist', isTeacher, async (req, res) => {
  try {
    const users = await User.find().exec();
    const login = await req.session.login;
    res.render("Createplaylist", {
      title: "Create playlist",
      users: users,
      login: login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/createplaylist', uploadThumbnail, async (req, res) => {
  try {
    const { PlaylistName } = req.body;
    // Check if a file was uploaded

    // Assuming you have a user ID, you can retrieve the user and add a new playlist
    const login = await req.session.login // Replace with the actual user ID
    const user = await User.findById(login._id);

    if (user) {
      // Add a new playlist to the user's playlists array
      user.playlists.push({
        name: PlaylistName,
        thumbnail: req.file.filename,
      });

      await user.save();

      req.session.message = {
        type: 'success',
        message: 'Playlist created successfully'
      };
      res.redirect(`/Teacher_Dashboard/${login._id}`);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/addvideo', uploadVideo, async (req, res) => {
  console.log(req.body); // Log the request body
  console.log(req.file);
  try {
    const { title, playlists, description } = req.body;
    // Assuming you have a user ID, you can retrieve the user
    const login = await req.session.login;
    const user = await User.findById(login._id);

    if (user) {
      // Find the selected playlist
      const selectedPlaylist = user.playlists.find((playlist) => playlist._id.toString() === playlists);

      if (selectedPlaylist) {
        // Add the new video to the selected playlist
        selectedPlaylist.videos.push({
          title,
          url: req.file.filename,
          description,
        });

        await user.save();

        req.session.message = {
          type: 'success',
          message: 'Video added to playlist successfully',
        };

        res.redirect(`/Teacher_Dashboard/${login._id}`);
      } else {
        res.status(404).json({ message: 'Playlist not found' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.get('/Teachers', islogin, async (req, res) => {
  try {
    const users = await User.find().exec();
    const login = await User.findById(req.session.login._id);

    res.render("teachers", {
      title: "teachers",
      users: users,
      login: login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/Teacher_profile/:id', islogin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.render("teacher_profile", {
      title: "Teacher Profile",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*-----------------------------------*\
              playlist
\*-----------------------------------*/


router.get('/playlist/:playlistId', islogin, async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const users = await User.find().exec();
    const user = await User.findOne({ 'playlists._id': playlistId }).exec();

    if (!user) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const playlist = user.playlists.find(p => p._id == playlistId);
    const login = req.session.login;

    res.render("playlist", {
      title: playlist.name,
      users: users,
      login: login,
      playlist: [playlist], // Pass the specific playlist in an array
      user: user, // Add the user to the template variables
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/playlist/:playlistId/video/:videoIndex/:videoTitle', islogin, async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const users = await User.find().exec();
    const user = await User.findOne({ 'playlists._id': playlistId }).exec();

    if (!user) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const playlist = user.playlists.find(p => p._id == playlistId);
    const login = req.session.login;

    // Assuming the videoIndex is passed in the URL parameters
    const videoIndex = parseInt(req.params.videoIndex);
    const video = playlist.videos[videoIndex];

    res.render("playlist", {
      title: playlist.name,
      users: users,
      login: login,
      playlist: [playlist], // Pass the specific playlist in an array
      user: user, // Add the user to the template variables
      video: video, // Pass the specific video to the template
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/Updateviews/:playlistId/video/:videoIndex/:videoTitle', async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const user = await User.findOne({ 'playlists._id': playlistId }).exec();

    if (!user) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const playlist = user.playlists.find(p => p._id == playlistId);
    const login = req.session.login;

    // Assuming the videoIndex is passed in the URL parameters
    const videoIndex = parseInt(req.params.videoIndex);
    const video = playlist.videos[videoIndex];

    // Check if the user ID is not already present in the views array
    const userId = login._id;
    if (!video.views.some(view => view.userID === userId)) {
      // User ID is not present, add it to the views array
      video.views.push({ userID: userId });
      await user.save(); // Save the user with the updated video views
    }
    console.log('Video object:', video);
    console.log('User object:', user);
    console.log('User ID:', userId);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/edit/:userId/:playlistIndex', islogin, async (req, res) => {
  try {
    const login = await User.findById(req.session.login._id).exec();  
    const userId = req.params.userId;
    const playlistIndex = req.params.playlistIndex;
    const user = await User.findById(userId).exec();

    if (!user || !user.playlists || playlistIndex >= user.playlists.length) {
      return res.status(404).json({ error: 'User or playlist not found' });
    }

    const playlist = user.playlists[playlistIndex];
    // You can now render the edit page with the user, playlist, and playlistIndex information
    res.render("edit_playlist", {
      title: "Edit Playlist",
      user: user,
      playlist: playlist,
      playlistIndex: playlistIndex,
      login:login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/Updateplaylist/:userId', uploadThumbnail, async (req, res) => {
  try {
    const userId = req.params.userId;
      const playlistIndex = req.body.playlistIndex; // Retrieve playlistIndex from the request body

      console.log("User ID:", userId); // Add this line
    console.log("Playlist Index:", playlistIndex); // Add this line

      const user = await User.findById(userId).exec();

      // Ensure the user and playlistIndex are valid
      if (!user || !user.playlists || playlistIndex >= user.playlists.length) {
          return res.status(404).json({ error: 'User or playlist not found' });
      }

      const playlist = user.playlists[playlistIndex];

      let new_thumbnail = '';
      if (req.file) {
          new_thumbnail = req.file.filename;
          try {
              // Delete the old thumbnail file
              fs.unlinkSync('./uploads/thumbnail/' + req.body.old_thumbnail);
          } catch (error) {
              console.error(error);
              return res.status(500).json({ error: 'Internal Server Error' });
          }
      } else {
          new_thumbnail = playlist.thumbnail; // Keep the existing thumbnail if no new file is uploaded
      }

      // Update playlist information
      playlist.name = req.body.PlaylistName;
      playlist.thumbnail = new_thumbnail;

      // Save the updated user object
      await user.save();

      req.session.message = {
          type: 'success',
          message: 'Playlist has been updated',
      };
      res.redirect('/home');
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.get('/delete_playlist/:userId/:playlistIndex', islogin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const playlistIndex = req.params.playlistIndex;
    const user = await User.findById(userId).exec();
    const login = await req.session.login;

    if (!user || !user.playlists || playlistIndex >= user.playlists.length) {
      return res.status(404).json({ error: 'User or playlist not found' });
    }

    const deletedPlaylist = user.playlists.splice(playlistIndex, 1)[0];

    // Delete the playlist's thumbnail if it exists
    if (deletedPlaylist.thumbnail && fs.existsSync('./uploads/thumbnail/' + deletedPlaylist.thumbnail)) {
      fs.unlinkSync('./uploads/thumbnail/' + deletedPlaylist.thumbnail);
    }

    // Delete each video associated with the playlist if it exists
    deletedPlaylist.videos.forEach((video) => {
      if (video.url && fs.existsSync('./uploads/video/' + video.url)) {
        fs.unlinkSync('./uploads/video/' + video.url);
      }
    });

    // Save the user after removing the playlist
    await user.save();
    req.session.message = {
      type: 'success',
      message: 'Playlist Deleted successfully'
    };
    if (login.role === 'Teacher') {
      res.redirect(`/Teacher_dashboard/${userId}`);
    }
    else if (login.role === 'Admin') {
      res.redirect(`/Admin/${login._id}`);
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
/*-----------------------------------*\
             Video.
\*-----------------------------------*/

router.get('/edit_video/:userId/:playlistIndex/:videoIndex', islogin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const playlistIndex = req.params.playlistIndex;
    const videoIndex = req.params.videoIndex;
    const user = await User.findById(userId).exec();
    

    const login = await User.findById(req.session.login._id).exec();  

    if (!user || !user.playlists || playlistIndex >= user.playlists.length || videoIndex >= user.playlists[playlistIndex].videos.length) {
      return res.status(404).json({ error: 'User, playlist, or video not found' });
    }

    const playlist = user.playlists[playlistIndex];
    const video = playlist.videos[videoIndex];

    // You can now render the edit video page with the user, playlist, video, playlistIndex, and videoIndex information
    res.render("edit_video", {
      title: "Edit Video",
      user: user,
      playlist: playlist,
      video: video,
      playlistIndex: playlistIndex,
      videoIndex: videoIndex,
      login: login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/delete_video/:userId/:playlistIndex/:videoIndex', islogin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const playlistIndex = req.params.playlistIndex;
    const videoIndex = req.params.videoIndex;
    const user = await User.findById(userId).exec();
    const login = await req.session.login;

    if (!user || !user.playlists || playlistIndex >= user.playlists.length || videoIndex >= user.playlists[playlistIndex].videos.length) {
      return res.status(404).json({ error: 'User, playlist, or video not found' });
    }

    const deletedVideo = user.playlists[playlistIndex].videos.splice(videoIndex, 1)[0];

    // Delete the video file if it exists
    if (deletedVideo.url && fs.existsSync('./uploads/video/' + deletedVideo.url)) {
      fs.unlinkSync('./uploads/video/' + deletedVideo.url);
    }

    // Save the user after removing the video
    await user.save();
    req.session.message = {
      type: 'success',
      message: 'Video Deleted successfully'
    };

    if (login.role === 'Teacher') {
      res.redirect(`/Teacher_dashboard/${userId}`);
    }
    else if (login.role === 'Admin') {
      res.redirect(`/Admin/${login._id}`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/updateVideo/:id', uploadVideo, async (req, res) => {
    try {
      let userId = req.params.id;
      let new_video = '';

      // Fetch the user
      const user = await User.findById(userId).exec();

      // Fetch the playlist and video indices from the request body
      const playlistIndex = req.body.playlistIndex;
      const videoIndex = req.body.videoIndex;

      console.log("User:", user); // Add this line
      console.log("Playlist Index:", playlistIndex); // Add this line
      console.log("Video Index:", videoIndex); // Add this line

      // Ensure the indices are valid
      if (
        !user ||
        !user.playlists ||
        playlistIndex >= user.playlists.length ||
        videoIndex >= user.playlists[playlistIndex].videos.length
      ) {
        console.log("Error: User, playlist, or video not found"); // Add this line
        return res.status(404).json({ error: 'User, playlist, or video not found' });
      }

      const playlist = user.playlists[playlistIndex];
      const video = playlist.videos[videoIndex];

      console.log("Playlist:", playlist); // Add this line
      console.log("Video:", video); // Add this line

      // Handle video file upload
      if (req.file) {
        new_video = req.file.filename;
        try {
          // Delete the old video file
          fs.unlinkSync('./uploads/video/' + video.url);
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        new_video = video.url; // Keep the existing video if no new file is uploaded
      }

      // Update video information in the playlist
      playlist.videos[videoIndex] = {
        title: req.body.title,
        description: req.body.description,
        url: new_video,
      };

      // Save the updated user object
      await user.save();

      // Redirect or send response as needed
      req.session.message = {
        type: 'success',
        message: 'Video has been updated',
      };
      res.redirect('/home');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });



/*-----------------------------------*\
              Student Dashboard
\*-----------------------------------*/

router.get('/student_dashboard/:id', islogin, async (req, res) => {
  try {
    let id = req.params.id;
    const user = await User.findById(id).exec();
    const users = await User.find().exec();
    const login = await User.findById(req.session.login._id);
    if (user._id.toString() === login._id.toString()) {
      res.render("student_dashboard", {
        title: "Student Dashboard",
        users: users,
        login: login,
      });
    } else {
      req.session.message = {
        type: 'danger',
        message: 'Trying to take unauthorized access.'
      };
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*-----------------------------------*\
              Courses
\*-----------------------------------*/

router.get('/Courses', islogin, async (req, res) => {
  try {
    const users = await User.find().exec();
    const login = await User.findById(req.session.login._id);

    res.render("courses", {
      title: "Courses",
      users: users,
      login: login,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



/*-----------------------------------*\
              Rotuer
\*-----------------------------------*/

router.get('/login', (req, res) => {
  res.render('login', { title: "Welcome to login page" })
});





router.get('/Resetpassword', (req, res) => {
  res.render('Resetpassword', { title: "Reset Password" })
});

router.get('/Register', (req, res) => {
  res.render('Register', { title: "Register Page" })
});

router.get('/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    if (!user) {
      res.redirect(`/Admin/${req.session.login._id}`);
    }

    res.render('edit_users.ejs', {
      title: 'Update user',
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//delete user Route
router.get('/delete/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const result = await User.findByIdAndDelete(id);

    if (result && result.profileImage != '') {
      try {
        fs.unlinkSync('./uploads/' + result.profileImage);
      } catch (err) {
        console.log(err);
      }
    }
    if (result.playlists && result.playlists.length > 0) {
      result.playlists.forEach((playlist) => {
        // Delete each playlist's thumbnail if it exists
        if (playlist.thumbnail && fs.existsSync('./uploads/thumbnail/' + playlist.thumbnail)) {
          fs.unlinkSync('./uploads/thumbnail/' + playlist.thumbnail);
        }

        // Delete each video associated with the playlist if it exists
        playlist.videos.forEach((video) => {
          if (video.url && fs.existsSync('./uploads/video/' + video.url)) {
            fs.unlinkSync('./uploads/video/' + video.url);
          }
        });
      });
    }

    req.session.message = {
      type: 'success',
      message: 'The user has been deleted',
    };
    res.redirect(`/Admin/${req.session.login._id}`);
  } catch (err) {
    res.json({ message: err.message });
  }
});









router.get('/logout', (req, res) => {
  // Destroy only the req.session.login property
  delete req.session.login;

  // Redirect to the home page
  res.redirect('/');
});

module.exports = router;