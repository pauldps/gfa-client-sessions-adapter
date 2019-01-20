'use strict'

const {SessionAdapter} = require('@gfa/core/adapters/SessionAdapter')
const ClientSessions = require('client-sessions')

class ClientSessionsAdapter extends SessionAdapter {
  constructor (options) {
    super(options)
    var opts = {
      cookieName: this.name,
      secret: this.secret,
      duration: this.duration,
      activeDuration: this.activeDuration
    }
    if (options.cookie) {
      opts.cookie = options.cookie
    }
    this.instance = ClientSessions(opts) // returns a function
  }

  load (req, res, callback) {
    this.instance(req, res, (err) => {
      callback(err, req, res)
    })
  }

  create (req, res, userRecord, callback) {
    this.instance(req, res, (err) => {
      if (err) {
        return callback(err, req, res)
      }
      // Changes to the session object will write SetCookie headers in response
      var session = req[this.name]
      var field
      for (field of this.expose) {
        session[field] = userRecord[field]
      }
      callback(null, req, res)
    })
  }

  destroy (req, res, callback) {
    this.instance(req, res, (err) => {
      if (err) {
        return callback(err, req, res)
      }
      req[this.name].reset() // writes a SetCookie destructor
      callback(null, req, res)
    })
  }

  data (req, res) {
    var session = req[this.name]
    if (!session || !session.id) {
      return null
    }
    var obj = {id: session.id}
    var field
    for (field of this.expose) {
      obj[field] = session[field]
    }
    return obj
  }
}

module.exports = ClientSessionsAdapter
