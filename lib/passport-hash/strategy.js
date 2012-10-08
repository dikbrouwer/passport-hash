/**
 * Module dependencies.
 */
var passport = require('passport')
  , util = require('util')
  , BadRequestError = require('./errors/badrequesterror');


/**
 * `Strategy` constructor.
 *
 * The hash authentication strategy authenticates requests based on the
 * hash link.
 *
 * Applications must supply a `verify` callback which accepts `token`, and then
 * calls the `done` callback supplying a
 * `user`, which should be set to `false` if the hash is not valid.
 * If an exception occured, `err` should be set.
 *
 * Optionally, `options` can be used to change the parameter in which the
 * token is found.
 *
 * Options:
 *   - `hashParam`  parameter name where the hash is found, defaults to _hash_
 *   - `passReqToCallback`  when `true`, `req` is the first argument to the verify callback (default: `false`)
 *
 * Examples:
 *
 *     passport.use(new TokenStrategy(
 *       function(hash, done) {
 *         User.findOne({ hash: hash }, function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('hash authentication strategy requires a verify function');
  
  this._hashParam = options.hashParam || 'token';
  
  passport.Strategy.call(this);
  this.name = 'token';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a hash link.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  // get authorization token
  var hash = req.headers.authorization.split(/\s+/)[1] ||  // token can be in the header
            req.param(this._hashParam, null);  // or in the params, using express body parser to get data

  if (!hash) {
    return this.fail(new BadRequestError('Missing hash parameter'));
  }
  
  var self = this;
  
  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }
  
  if (self._passReqToCallback) {
    this._verify(req, hash, verified);
  } else {
    this._verify(hash, verified);
  }
}


/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;
