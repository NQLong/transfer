import './scss/bootstrap/bootstrap.scss';
import './scss/admin/main.scss';
import './admin.scss';

import T from '../js/common';
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import AdminHeader from 'view/component/AdminHeader';
import AdminMenu from 'view/component/AdminMenu';

import { getSystemState, updateSystemState } from 'modules/_default/_init/reduxSystem';
import { changeUser } from 'modules/_default/fwUser/reduxUser';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import { modules } from './modules';
const reducers = {}, routeMapper = {},
    addRoute = route => {
        if (route.path.startsWith('/user')) routeMapper[route.path] = <Route key={route.path} {...route} />;
    };
modules.forEach(module => {
    if (module.redux) Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
    module.routes.forEach(addRoute);
});

const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
// store.dispatch(getSystemState());
window.T = T;

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    state = { routes: [] };

    componentDidMount() {
        const routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);
        // T.socket.on('contact-changed', item => store.dispatch(changeContact(item)));
        T.cookie('language', 'vi');
        this.props.getSystemState(() => this.setState({ routes }));
        T.socket.on('user-changed', user => {
            if (this.props.system && this.props.system.user && this.props.system.user._id == user._id) {
                store.dispatch(updateSystemState({ user: Object.assign({}, this.props.system.user, user) }));
            }
            store.dispatch(changeUser(user));
        });

        T.socket.on('debug-user-changed', user => {
            store.dispatch(updateSystemState({ user }));
        });

        T.socket.on('debug-role-changed', roles => {
            if (this.props.system && this.props.system.isDebug) {
                this.props.updateSystemState({ roles });
            }
        });
    }

    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                    <AdminHeader />
                    <AdminMenu />
                    <div className='site-content'>
                        <Switch>
                            {this.state.routes}
                            <Route path='**' component={Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') })} />
                        </Switch>
                    </div>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { updateSystemState, getSystemState })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('app'));