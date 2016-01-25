var Address = require('ipaddr.js');

var isNumeric = function(n) { return !isNaN(parseFloat(n)) && isFinite(n); };

var ipMatch = function(clientIp, list) {
	if (clientIp && Address.isValid(clientIp)) {
		// `Address.process` return the IP instance in IPv4 or IPv6 form.
		// It will return IPv4 instance if it's a IPv4 mapped IPv6 address
		clientIp = Address.process(clientIp);

		return list.some(function(e) {
			// IPv6 address has 128 bits and IPv4 has 32 bits.
			// Setting the routing prefix to all bits in a CIDR address means only the specified address is allowed.
			e = e || '';
			e = e.indexOf('/') === -1 ? e + '/128' : e;

			var range = e.split('/');
			if (range.length === 2 && Address.isValid(range[0]) && isNumeric(range[1])) {
				var ip = Address.process(range[0]);
				var bit = parseInt(range[1], 10);

				// `IP.kind()` return `'ipv4'` or `'ipv6'`. Only same type can be `match`.
				if (clientIp.kind() === ip.kind()) {
					return clientIp.match(ip, bit);
				}
			}

			return false;
		});
	}

	return false;
};

function AccessControl(opts) {
	var _options = {
		// mode: `'deny'` or `'allow'`. See README.md or below.
		mode: 'deny',
		// denys: The blacklist. Works differently in different `mode`. See README.md or below.
		denys: [],
		// allows: The whitelist. Works differently in different `mode`. See README.md or below.
		allows: [],
		// forceConnectionAddress: Use the connection address (`req.connection.remoteAddress`) even `express.set('trust proxy', [])` set the `req.ip`.
		forceConnectionAddress: false,
		// log: Pass a log function or `false` to disable log.
		// `Function(String clientIp, Boolean access)`
		log: function(clientIp, access) {
			console.log(clientIp + (access ? ' accessed.' : ' denied.'));
		},

		// statusCode: The HTTP status code sent when denied. Set to 301 or 302 means redirect to `redirectTo`.
		statusCode: 401,
		// redirectTo: The URL to redirect when denied and `statusCode` is set to redirect.
		redirectTo: '',
		// message: The message sent when denied and `statusCode` is not set to redirect.
		message: 'Unauthorized'
	};

	// Override default options.
	opts = opts || {};
	for (var p in opts) if (opts.hasOwnProperty(p)) _options[p] = opts[p];
	_options.allowMode = _options.mode === 'allow';
	_options.statusCode = parseInt(_options.statusCode, 10);
	_options.forceConnectionAddress = !!_options.forceConnectionAddress;

	// The middleware.
	return function(req, res, next) {
		var clientIp = _options.forceConnectionAddress === true
			? req.connection.remoteAddress
			: req.ip || req.connection.remoteAddress;

		var inAllows = ipMatch(clientIp, _options.allows);
		var inDenys = ipMatch(clientIp, _options.denys);

		// If it is `'allow'` mode, and the IP *IS NOT* in the whitelist (`allows`) list (or excluded by blacklist (`denys`)), deny it.
		// If it is `'deny'` mode, and the IP *IS* in the blacklist (`denys`) list (and not excluded by whitelist (`allows`)), deny it.
		var isDenied = (_options.allowMode === true && (inAllows && !inDenys) === false) || (_options.allowMode === false && (inDenys && !inAllows) === true);

		if (typeof _options.log === 'function') {
			_options.log.apply(null, [req.ip || req.connection.remoteAddress, !isDenied]);
		}

		if (isDenied) {
			if (_options.statusCode === 301 || _options.statusCode === 302) {
				res.redirect(_options.statusCode, _options.redirectTo);
			} else {
				res.status(_options.statusCode).send(_options.message);
			}
		} else {
			next();
		}
	}
}

AccessControl.ipMatch = ipMatch;

module.exports = exports = AccessControl;