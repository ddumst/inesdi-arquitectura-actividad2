const createError = require('http-errors');
const User = require('../models/user.model');
const passport = require('passport');

module.exports.create = (req, res, next) => {
  const { name, bio, password, email } = req.body

  User.create({
    name,
    bio,
    password,
    email,
  })
    .then(user => res.status(201).json(user))
    .catch(next)
}

module.exports.get = (req, res, next) => {
  User.findById(req.params.id)
    .then(user => res.status(200).json(user))
    .catch(next)
}

module.exports.delete = (req, res, next) => {
  User.findByIdAndDelete(req.params.id)
    .then(user => res.status(204).end())
    .catch(next)
}

module.exports.update = (req, res, next) => {
  const { id } = req.params;
  const data = { name, bio, avatar, password } = req.body

  if (req.file) {
    data.avatar = req.file.path
  }

  User.findByIdAndUpdate(id, data, { new: true })
    .then(user => res.status(200).json(user))
    .catch(next)
}

module.exports.logout = (req, res, next) => {
  req.logout();
  res.status(204).end()
}

module.exports.login = (req, res, next) => {
  passport.authenticate('local-auth', (error, user, validations) => {
    if (error) {
      next(error);
    } else if (!user) {
      next(createError(400, validations))
    } else {
      req.login(user, error => {
        if (error) next(error)
        else res.json(user)
      })
    }
  })(req, res, next);
};

module.exports.loginWithGoogle = (req, res, next) => {
  const passportController = passport.authenticate('google-auth', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
  });

  passportController(req, res, next);
};

module.exports.doLoginWithGoogle = (req, res, next) => {
  const passportController = passport.authenticate('google-auth', (error, user, validations) => {
    if (error) {
      next(error);
    } else {
      req.login(user, error => {
        if (error) {
          next(error)
        } else {
          res.redirect(process.env.WEB_URL)
        }
      })
    }
  })
  
  passportController(req, res, next);
}

module.exports.activate = (req, res, next) => {
  const { id } = req.params;

  User.findByIdAndUpdate(id, { active: true }, { new: true })
    .then(user => res.status(200).json(user))
    .catch(next)
}