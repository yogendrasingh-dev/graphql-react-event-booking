import './App.css';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import BookingComponent from './component/Bookings/BookingComponent';
import MainNavigation from './component/Navigation/MainNavigation';
import React, { Component } from 'react';
import AuthContext from './context/AuthContext';
import EventComponent from './component/Events/EventComponent';
import AuthComponent from './component/Auth/Auth';

class App extends Component {
	state = {
		token: null,
		userId: null
	};
	login = (token, userId, tokenExpiration) => {
		this.setState({ token: token, userId: userId });
	};
	logout = () => {
		this.setState({
			token: null,
			userId: null
		});
	};
	render() {
		return (
			<BrowserRouter>
				<React.Fragment>
					<AuthContext.Provider
						value={{ token: this.state.token, userId: this.state.userId, login: this.login, logout: this.logout }}
					>
						<MainNavigation />
						<main className="main-content">
							<Switch>
								{this.state.token && <Redirect from="/" to="/events" exact />}
								{this.state.token && <Redirect from="/auth" to="/events" exact />}
								{!this.state.token && <Route path="/auth" component={AuthComponent} />}
								<Route path="/events" component={EventComponent} />
								{this.state.token && <Route path="/bookings" component={BookingComponent} />}
								{!this.state.token && <Redirect to="/auth" exact />}
							</Switch>
						</main>
					</AuthContext.Provider>
				</React.Fragment>
			</BrowserRouter>
		);
	}
}

export default App;
