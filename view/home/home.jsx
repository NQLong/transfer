// import './scss/_select2.scss';
import './scss/style.scss';
import './home.scss';
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
import Loader from 'view/component/Loader';
import HomeMenu from 'view/component/HomeMenu';
import HomeFooter from 'view/component/HomeFooter';
import LoginModal from 'view/component/LoginModal';
import { getSystemState, register, login, forgotPassword, logout } from 'modules/_default/_init/reduxSystem';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import { modules } from './modules';

const reducers = {}, routeMapper = {},
    addRoute = route => {
        if (!route.path.startsWith('/user')) routeMapper[route.path] = <Route key={route.path} {...route} exact />;
    };
modules.forEach(module => {
    Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
    module.routes.forEach(addRoute);
});
const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
store.dispatch(getSystemState());
window.T = T;

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    loader = React.createRef();
    loginModal = React.createRef();
    state = { routes: [], loading: true };

    componentDidMount() {
        $(document).ready(() => {
            const handleHideLoader = () => {
                if (this.loader) {
                    this.loader.current.isShown() && this.loader.current.hide();
                    this.setState({ loading: false });
                }
            };

            this.props.getSystemState(data => {
                // Handle setup routes
                if (data && data.menus && data.menus.length) {
                    let menuList = [data.menus];
                    while (menuList.length) {
                        const menus = menuList.pop();
                        for (let i = 0; i < menus.length; i++) {
                            const item = menus[i],
                                link = item.link ? item.link.toLowerCase() : '/';
                            if (item.submenus && item.submenus.length > 0) {
                                menuList.push(item.submenus);
                            }
                            if (!link.startsWith('http://') && !link.startsWith('https://') && routeMapper[link] == undefined) {
                                addRoute({ path: link, component: Loadable({ loading: Loading, loader: () => import('view/component/MenuPage') }) });
                            }
                        }
                    }
                    this.setState({ routes: Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]) }, handleHideLoader);
                } else {
                    this.setState({ routes: Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]) }, handleHideLoader);
                }
            });
        });
    }

    showLoginModal = e => {
        e.preventDefault();
        if (this.props.system && this.props.system.user) {
            this.props.logout();
        } else {
            this.loginModal.current.showLogin();
        }
    }

    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                    <HomeMenu showLoginModal={this.showLoginModal} />
                    <Switch>
                        {this.state.routes}
                        {!this.state.loading && (
                            <Route path='**' component={Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') })} />
                        )}
                    </Switch>
                    <HomeFooter />
                    <LoginModal ref={this.loginModal} register={this.props.register} login={this.props.login} forgotPassword={this.props.forgotPassword} pushHistory={url => this.props.history.push(url)} />
                    <Loader ref={this.loader} />
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { register, login, forgotPassword, logout, getSystemState })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('app'));