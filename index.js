var Address = require('ipaddr.js');

var isNumber = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

var ipMatch = function(clientIp, list) {
	if (!clientIp || !Address.isValid(clientIp)) return false;
	clientIp = Address.process(clientIp);

	return list.some(function(e) {
		e = e || '';
		e = e.indexOf('/') === -1 ? e + '/128' : e;

		var range = e.split('/');
		if (range.length === 2 && Address.isValid(range[0]) && isNumber(range[1])) {
			var ip = Address.parse(range[0]);
			var byte = parseInt(range[1], 10);

			if (clientIp.kind() === ip.kind()) {
				return clientIp.match(ip, byte);
			}
		}

		return false;
	});
};

function AccessControl(opts) {
	var _options = {
		mode: 'deny',
		denys: [],
		allows: [],
		log: function(clientIp, access) {
			console.log(clientIp + (access ? ' accessed.' : ' denied.'));
		},
		forceConnectionAddress: false,
		statusCode: 401,
		message: 'Unauthorized',
		redirectTo: ''
	};

	opts = opts || {};
	for (var p in opts) if (opts.hasOwnProperty(p)) _options[p] = opts[p];
	_options.mode = _options.mode === 'allow';

	return function(req, res, next) {
		var clientIp = _options.forceConnectionAddress === true
			? req.connection.remoteAddress
			: req.ip || req.connection.remoteAddress;

		var allow = function() {
			if (typeof _options.log === 'function') _options.log.apply(null, [req.ip || req.connection.remoteAddress, true]);
			next();
		};

		var deny = function() {
			if (typeof _options.log === 'function') _options.log.apply(null, [req.ip || req.connection.remoteAddress, false]);
			if (_options.statusCode === 301 || _options.statusCode === 302) {
				res.redirect(_options.statusCode, _options.redirectTo);
			} else {
				res.status(_options.statusCode).end(_options.message);
			}
		};

		var inAllows = ipMatch(clientIp, _options.allows), inDenys = ipMatch(clientIp, _options.denys);
		if ((_options.mode === true && (inAllows && !inDenys) === false) || (_options.mode === false && (inDenys && !inAllows) === true)) {
			deny();
		} else {
			allow();
		}
	}
}

module.exports = exports = AccessControl;