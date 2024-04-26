const passport = require('passport');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser((data, next) => {
  next(null, data.user.id);
});

passport.deserializeUser((id, next) => {
  User.findById(id)
    .then(user => next(null, user))
    .catch(next);
});

// passport.use('google-auth', new GoogleStrategy({
//   clientID: process.env.G_CLIENT_ID,
//   clientSecret: process.env.G_CLIENT_SECRET,
//   callbackURL: '/api/authenticate/google/cb',
// }, (accessToken, refreshToken, profile, next) => {
//   const googleId = profile.id;
//   const name = profile.displayName;
//   const email = profile.emails[0] ? profile.emails[0].value : undefined;
//   const username = email ? email.split('@')[0] : undefined;

//   if (googleId && name && username) {
//     User.findOne({ $or: [
//         { username },
//         {'social.google': googleId }
//       ]})
//       .then(user => {
//         if (!user) {
//           user = new User({
//             name,
//             username,
//             avatar: profile.photos[0].value,
//             password: mongoose.Types.ObjectId(),
//             social: {
//               google: googleId
//             }
//           });

//           return user.save()
//             .then(user => next(null, user))
//         } else {
//           next(null, user);
//         }
//       })
//       .catch(next)
//   } else {
//     next(null, null, { oauth: 'invalid google oauth response' })
//   }
// }));

passport.use('local-auth', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, next) => {
  User.findOne({ email })
    .then(user => {
      if (!user) {
        next(null, null, { message: 'Invalid email or password' })
      } else if (!user.active) {
        next(null, null, { message: 'Your account is not active' })
      } else {
        return user.checkPassword(password)
          .then(match => {
            if (match) {
              // User authenticated successfully, generate a JWT
              const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
              };
              const token = jwt.sign(payload, 'MI_SUPER_SECRET_KEY', { expiresIn: '1h' });

              // Pass the user and token to the next middleware
              next(null, { user, token });
            } else {
              next(null, null, { message: 'Invalid email or password' })
            }
          })
      }
    }).catch(next)
}));
