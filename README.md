# Express IP Access Control
An express.js middleware for access control.

## Installation

`npm install ipaddr.js`

## Feature

* Support **Express**.
* Control who can access resources base on IP address.
* Support **IPv4, IPv6, CIDR format & IPv4 mapped IPv6 addresses** (thanks to [ipaddr.js](https://github.com/whitequark/ipaddr.js)).
* Deny mode (**Blacklist**) & Allow mode (**Whitelist**), similar [Apache Access Control](https://httpd.apache.org/docs/2.2/howto/access.html).
* Choose from **connection address or real address**. You may find it useful if you are behind proxy and needed to reject direct access.
* Custom action on denied. (**Redirect or show error message**)
* Custom log function.

## Usage

> If you are not familiar with Express and Express's middleware,
> you are recommended to see these first.
> * [Express](http://expressjs.com)
> * [Express's middleware](http://expressjs.com/guide/using-middleware.html)

```javascript
var accessControl = require('express-ip-access-control');
```

Create middleware by calling `accessControl(options)` or directly load it into your app by `app.use(accessControl(options))`.

## Options

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

Allow by default, only deny IP in the blacklist (`denys`) and not excluded by the whitelist (`allows`).

#### `'allow'` mode (Whilelist)

Deny by default, only allow IP in the whitelist (`allows`) and not excluded by the blacklist (`denys`).

### denys (default: [])

The blacklist. Works differently in different mode.

### allows (default: [])

The whitelist. Works differently in different mode.

### forceConnectionAddress (default: false)

If set to `true`, the connection address (`req.connection.remoteAddress`) will be used even `express.set('trust proxy', [])` is set. So that you can reject direct access if you are behind proxy and needed to do so.

### log (default: Simple log function)

Pass a log function or `false` to disable log.
The function should have signature like this `Function(String clientIp, Boolean access)`.

### statusCode (default: 401)

The HTTP status code sent when denied. Set to 301 or 302 means redirect to `redirectTo`.

### redirectTo (default: '')

The URL to redirect when denied and `statusCode` is set to redirect.

### message (default: 'Unauthorized')

The message sent when denied and `statusCode` is not set to redirect.

## Repository

You may find the source code at [GitHub](https://github.com/KennyTangHK/express-ip-access-control). Please feel free to report bugs and contribute your changes.

## License

[MIT](LICENSE)