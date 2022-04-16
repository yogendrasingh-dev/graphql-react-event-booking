import React, { Component } from 'react';
import AuthContext from '../../context/AuthContext';
import Spinner from '../Spinner/Spinner';
import BookingList from './BookingList';

class BookingComponent extends Component {
	state = {
		isLoading: false,
		bookings: []
	};

	static contextType = AuthContext;

	componentDidMount() {
		this.fetchBookings();
	}

	fetchBookings = () => {
		this.setState({ isLoading: true });
		//not passing dynamic data so can use this format.
		const requestBody = {
			query: `
          query {
            bookings {
              _id
             createdAt
             event {
               _id
               title
               date
             }
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
				const bookings = resData.data.bookings;
				this.setState({ bookings: bookings, isLoading: false });
			})
			.catch(err => {
				console.log(err);
				this.setState({ isLoading: false });
			});
	};

	deleteBookingHandler = bookingId => {
		this.setState({ isLoading: true });

		//passing dynamic data
		const requestBody = {
			query: `
          mutation CancelBooking($id:ID!){
            cancelBooking(bookingId: $id) {
            _id
             title
            }
          }
        `,
			variables: {
				id: bookingId
			}
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
				this.setState(prevState => {
					const updatedBookings = prevState.bookings.filter(booking => {
						return booking._id !== bookingId;
					});
					return { bookings: updatedBookings, isLoading: false };
				});
			})
			.catch(err => {
				console.log(err);
				this.setState({ isLoading: false });
			});
	};

	render() {
		return (
			<React.Fragment>
				{this.state.isLoading ? (
					<Spinner />
				) : (
					<BookingList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
				)}
			</React.Fragment>
		);
	}
}

export default BookingComponent;
