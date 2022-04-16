import React, { Component } from 'react';
import AuthContext from '../../context/AuthContext';
import BackDrop from '../BackDrop/BackDrop';
import './Event.css';
import Modal from '../Modal/Modal';
import Spinner from '../Spinner/Spinner';
import EventList from './EventList';

class EventComponent extends Component {
	constructor(props) {
		super(props);
		this.titleElRef = React.createRef();
		this.priceElRef = React.createRef();
		this.dateElRef = React.createRef();
		this.descriptionElRef = React.createRef();
	}
	isActive = true;

	componentDidMount() {
		this.fetchEvents();
		console.log('compenntdid');
	}

	componentWillUnmount() {
		console.log('compenntdidun');
		this.isActive = false;
	}

	static contextType = AuthContext;
	state = {
		creating: false,
		events: [],
		isLoading: false,
		selectedEvent: null
	};

	startCreatEventHandler = () => {
		this.setState({ creating: true });
	};

	modalConfirmHandler = () => {
		this.setState({ creating: false });
		const title = this.titleElRef.current.value;
		const price = +this.priceElRef.current.value;
		const date = this.dateElRef.current.value;
		const description = this.descriptionElRef.current.value;
		if (title.trim().length === 0 || price <= 0 || date.trim().length === 0 || description.trim().length === 0) {
			return;
		}

		let requestBody = {
			query: `
					mutation {
						createEvent(eventInput:{title:"${title}",description:"${description}",price:${price},date:"${date}"}){
							_id
							title
							description
							price
							date
						}
					}
			`
		};

		const token = this.context.token;

		fetch('http://localhost:8000/api', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token
			}
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed!');
				}
				return res.json();
			})
			.then(resData => {
				this.setState(prevState => {
					const updatedEvents = [...prevState.events];
					updatedEvents.push({
						_id: resData.data.createEvent._id,
						title: resData.data.createEvent.title,
						description: resData.data.createEvent.description,
						date: resData.data.createEvent.date,
						price: resData.data.createEvent.price,
						creator: {
							_id: this.context.userId
						}
					});
					return { events: updatedEvents };
				});
			})
			.catch(err => console.log(err));
	};

	modalCancelHandler = () => {
		this.setState({ creating: false, selectedEvent: null });
	};

	fetchEvents() {
		this.setState({ isLoading: true });
		let requestBody = {
			query: `
					query {
						events{
							_id
							title
							description
							price
							date
							 creator {
                _id
                email
              }
						}
					}
			`
		};

		fetch('http://localhost:8000/api', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed!');
				}
				return res.json();
			})
			.then(resData => {
				console.log(resData);
				const events = resData.data.events;
				if (this.isActive) {
					this.setState({ events: events, isLoading: false });
				}
			})
			.catch(err => {
				console.log(err);
				if (this.isActive) {
					this.setState({ isLoading: false });
				}
			});
	}

	showDetailHandler = eventId => {
		this.setState(prevState => {
			const selectedEvent = prevState.events.find(e => e._id === eventId);
			return { selectedEvent: selectedEvent };
		});
	};

	bookEventHandler = () => {
		if (!this.context.token) {
			this.setState({ selectedEvent: null });
			return;
		}
		let requestBody = {
			query: `
					mutation {
						bookEvent(eventId:"${this.state.selectedEvent._id}"){
							_id
							createdAt
							updatedAt
						}
					}
			`
		};

		fetch('http://localhost:8000/api', {
			method: 'POST',
			body: JSON.stringify(requestBody),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this.context.token
			}
		})
			.then(res => {
				if (res.status !== 200 && res.status !== 201) {
					throw new Error('Failed!');
				}
				return res.json();
			})
			.then(resData => {
				this.setState({ selectedEvent: null });
				console.log(resData);
			})
			.catch(err => {
				console.log(err);
			});
	};

	render() {
		return (
			<React.Fragment>
				{(this.state.creating || this.state.selectedEvent) && <BackDrop />}
				{this.state.creating && (
					<Modal
						title="Add Event"
						canCancel
						canConfirm
						onCancel={this.modalCancelHandler}
						onConfirm={this.modalConfirmHandler}
						confirmText="Confirm"
					>
						<form>
							<div className="form-control">
								<label htmlFor="title">Title</label>
								<input type="text" id="title" ref={this.titleElRef} />
							</div>
							<div className="form-control">
								<label htmlFor="price">Price</label>
								<input type="number" id="price" ref={this.priceElRef} />
							</div>
							<div className="form-control">
								<label htmlFor="date">Date</label>
								<input type="datetime-local" id="date" ref={this.dateElRef} />
							</div>
							<div className="form-control">
								<label htmlFor="description">Description</label>
								<textarea id="description" rows="4" ref={this.descriptionElRef} />
							</div>
						</form>
					</Modal>
				)}
				{this.state.selectedEvent && (
					<Modal
						title={this.state.selectedEvent.title}
						canCancel
						canConfirm
						onCancel={this.modalCancelHandler}
						onConfirm={this.bookEventHandler}
						confirmText={this.context.token ? 'Book' : 'Confirm'}
					>
						<h1>{this.state.selectedEvent.title}</h1>
						<h2>
							${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}
						</h2>
						<p>{this.state.selectedEvent.description}</p>
					</Modal>
				)}
				{this.context.token && (
					<div className="events-control">
						<p>Share your own Events Here!</p>
						<button className="btn" onClick={this.startCreatEventHandler}>
							Create Event
						</button>
					</div>
				)}
				{this.state.isLoading || this.state.events.length == 0 ? (
					<Spinner />
				) : (
					<EventList
						events={this.state.events}
						authUserId={this.context.userId}
						onViewDetail={this.showDetailHandler}
					/>
				)}
			</React.Fragment>
		);
	}
}

export default EventComponent;
