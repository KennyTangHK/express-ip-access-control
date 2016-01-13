Express IP Access Control
=========================
An express middleware for access control base on IP addresses.

Installation
------------

> `npm i express-ip-access-control`

Features
--------

* Control who can access resources base on IP addresses.
* Support **Express 4**.
* Support **IPv4**, **IPv6**, **CIDR format** & **IPv4 mapped IPv6 addresses** (thanks to [ipaddr.js](https://github.com/whitequark/ipaddr.js)).
* Deny mode (**Blacklist**) & Allow mode (**Whitelist**), similar to [Apache Access Control](https://httpd.apache.org/docs/2.2/howto/access.html).
* Choose from **connection address or real address**. You may find it useful if you are behind proxy and needed to reject direct access.
* Custom action on denied. (**Redirect** or **show error message**)
* Custom log function.

Usage
-----

> You may want to know somethings about [Express](http://expressjs.com) and [Express's middleware](http://expressjs.com/guide/using-middleware.html) first.

```javascript
var AccessControl = require('express-ip-access-control');

// Create middleware.
var middleware = AccessControl(options);

// Or directly load it into the app.
var express = require('express');
var app = express();
app.use(AccessControl(options));
```

Options
-------

```javascript
var options = {
	mode: 'deny',
	denys: [],
	allows: [],
	forceConnectionAddress: false,
	log: function(clientIp, access) {
		console.log(clientIp + (access ? ' accessed.' : ' denied.'));
	},

	statusCode: 401,
	redirectTo: '',
	message: 'Unauthorized'
};
```

### mode (default: `'deny'`)

#### `'deny'` mode (Blacklist)

Allow by default, only deny IPs in the blacklist (`denys`) and not excluded by the whitelist (`allows`).

#### `'allow'` mode (Whilelist)

Deny by default, only allow IPs in the whitelist (`allows`) and not excluded by the blacklist (`denys`).

### denys (default: `[]`)

The blacklist. Works differently in different mode. Support IPv4, IPv6, CIDR format or mixed. IPv4 mapped IPv6 addresses will be converted into IPv4.

### allows (default: `[]`)

The whitelist. Works differently in different mode. Support IPv4, IPv6, CIDR format or mixed. IPv4 mapped IPv6 addresses will be converted into IPv4.

### forceConnectionAddress (default: `false`)

If set to `true`, the connection address (`req.connection.remoteAddress`) will be used even `express.set('trust proxy', [])` set the `req.ip`. So that you can reject direct access if you are behind proxy and needed to do so.

### log (default: *Simple log function*)

Pass a log function or `false` to disable log.
The function should have signature like this `Function(String clientIp, Boolean access)`.

### statusCode (default: `401`)

The HTTP status code sent when denied. Set to `301` or `302` means redirect to `redirectTo`. Will be `parseInt(statusCode, 10)` to ensure it is a integer.

### redirectTo (default: `''`)

The URL to redirect when denied and `statusCode` is set to redirect. It will be passed into [`res.redirect(statusCode, redirectTo)`](http://expressjs.com/4x/api.html#res.redirect) directly, without any validation or manipulation.

### message (default: `'Unauthorized'`)

The message sent when denied and `statusCode` is not set to redirect. It will be passed into [`res.send(message)`](http://expressjs.com/4x/api.html#res.send) directly, without any validation or manipulation.

## Functions

### ipMatch()

```javascript
AccessControl.ipMatch(clientIp, list);
```

Return `true` if `clientIp` is in the `list`, `false` if not.  The function will return `false` if the `clientIp` is not valid or the `list` is empty.

* (String) `clientIp` is the IP address (IPv4 / IPv6) to check. IPv4 mapped IPv6 addresses will be converted into IPv4.
* (Array of String) `list` is the list / range of IP address. Support IPv4, IPv6, CIDR format or mixed. IPv4 mapped IPv6 addresses will be converted into IPv4.

Repository
----------

You may find the source code on [GitHub](https://github.com/KennyTangHK/express-ip-access-control). Please feel free to report bugs and contribute your changes.

License
-------

[MIT](LICENSE)