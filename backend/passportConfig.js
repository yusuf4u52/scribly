const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');

// Configure the local strategy for authentication
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find the user in the database
      const user = await User.findOne({ where: { username } });
      if (!user) return done(null, false, { message: 'Incorrect username.' });

      // Compare the password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password.' });

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.username);
});

// Deserialize user from session
passport.deserializeUser(async (username, done) => {
  try {
    const user = await User.findOne({ where: { username } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});
