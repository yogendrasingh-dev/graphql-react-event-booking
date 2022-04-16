const authResolver = require('./user');
const eventsResolver = require('./events');
const bookingResolver = require('./booking');

const rootResolver = {
	...authResolver,
	...eventsResolver,
	...bookingResolver
};

module.exports = rootResolver;
