const DataLoader = require('dataloader');

const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

const eventLoader = new DataLoader(eventIds => {
	return events(eventIds);
});

const userLoader = new DataLoader(userIds => {
	return User.find({ _id: { $in: userIds } });
});

const transformEvent = event => {
	return {
		...event._doc,
		date: dateToString(event._doc.date),
		creator: user.bind(this, event.creator)
	};
};

const transformBooking = booking => {
	return {
		...booking._doc,
		user: user.bind(this, booking._doc.user),
		event: singleEvent.bind(this, booking._doc.event),
		createdAt: dateToString(booking._doc.createdAt),
		updatedAt: dateToString(booking._doc.updatedAt)
	};
};

const events = async eventIds => {
	try {
		const events = await Event.find({ _id: { $in: eventIds } });
		events.sort((p, q) => {
			return eventIds.indexOf(p._id.toString()) - eventIds.indexOf(q._id.toString());
		});
		return events.map(event => {
			return transformEvent(event);
		});
	} catch (err) {
		throw err;
	}
};

const singleEvent = async eventId => {
	try {
		const event = await eventLoader.load(eventId.toString());
		return event;
	} catch (err) {
		throw err;
	}
};

const user = async userId => {
	const user = await userLoader.load(userId.toString());
	try {
		return {
			...user._doc,
			createdEvents: () => eventLoader.loadMany(user._doc.createdEvents)
		};
	} catch (err) {
		throw err;
	}
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
