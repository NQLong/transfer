import React from 'react';
import { connect } from 'react-redux';
import { logout } from 'modules/_default/_init/reduxSystem';
import { Link } from 'react-router-dom';
import LanguageSwitch from './LanguageSwitch';
import { divisionHomeMenuGetAll, homeMenuGet } from 'modules/_default/fwMenu/redux';
import { getDvWebsite, getDvWebsiteAll } from 'modules/_default/websiteDonVi/redux';

const texts = {
    vi: {
        loginButton: 'ĐĂNG NHẬP',
        logoutButton: 'ĐĂNG XUẤT',
        search: '  TÌM KIẾM',
        adminPage: 'TRANG CÁ NHÂN',
    },
    en: {
        loginButton: 'SIGN IN',
        logoutButton: 'SIGN OUT',
        search: 'Search',
        adminPage: 'DASHBOARD'
    }
};

class HomeMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, divisionMenu: null, headerTitle: '', searchValue: '', headerMobile: '/img/logo-ussh.png?t=3' };
        this.nav = React.createRef();
    }

    componentDidMount() {
        this.updateDimensions();
        const donVi = $('meta[property=donVi]').attr('content');
        if (this.props.isDonVi) {
            this.getMenu(donVi);
        }
        const ready = () => {
            if ($.fn.classyNav && this.nav.current) {
                $(this.nav.current).classyNav();
                $('.clever-main-menu').sticky({ topSpacing: 0 });
            } else {
                setTimeout(ready, 100);
            }
            $('#ftco-nav').on('show.bs.collapse', function () {
                $('#dang-xuat').collapse('hide');
            });
            $('#dang-xuat').on('show.bs.collapse', function () {
                $('#ftco-nav').collapse('hide');
            });
        };
        $(document).ready(ready);
    }
    onKeyPress = (searchValue) => {
        if (searchValue.key == 'Enter')
            console.log($('#inputID').val());
    }

    updateDimensions = () => {
        this.setState({ width: window.innerWidth });
    };

    getMenu = (maDonVi) => {
        const path = window.location.pathname,
            link = path.endsWith('/') && path.length > 1 ? path.substring(0, path.length - 1) : path;
        this.props.homeMenuGet(link, (data) => {
            if (data.menu || maDonVi) {
                const condition = {
                    maDonVi: maDonVi ? maDonVi : data.menu.maDonVi, kichHoat: 1
                };
                if (data.menu && data.menu.maWebsite) condition.shortname = data.menu.maWebsite;
                this.props.getDvWebsiteAll(condition, websites => {
                    if (websites) {
                        if (websites.length > 0) {
                            this.setState({
                                header: websites[0].header,
                                headerLink: websites[0].headerLink,
                                headerTitle: websites[0].headerTitle,
                                showHeaderTitle: websites[0].showHeaderTitle,
                                headerMobile: websites[0].headerMobile ? websites[0].headerMobile : '/img/logo-ussh.png'
                            });
                        }
                    }
                });
                if (maDonVi == 39) data = { menu: { maWebsite: 'tuyensinh' } };
                this.props.divisionHomeMenuGetAll(maDonVi ? maDonVi : data.menu.maDonVi, data.menu ? data.menu.maWebsite : '', data => this.setState({ divisionMenu: data.items }));
            }
        });
    }

    onMenuClick = () => {
        $('#ftco-nav').removeClass('show');
    }

    logout = (e) => {
        e.preventDefault();
        if (this.props.system && this.props.system.user) {
            this.props.logout();
        } else {
            window.location = '/auth/google';
        }
    }

    render() {
        const language = T.language(texts);
        let menusView, menus = this.props.system && this.props.system.menus ? [...this.props.system.menus]
            .map(item => { delete item.submenus; return item; }) : [];
        if (this.props.isDonVi) {
            menus = this.state.divisionMenu;
        }
        let submenus = [], header = '', languageToggle = <div />;
        const { user } = this.props.system || {};
        if (window.location.hostname == 'localhost' || window.location.hostname == 'nvbk.hcmussh.edu.vn')
            languageToggle = <div className='ml-2'><LanguageSwitch /></div>;
        if (this.props.system && menus) {
            submenus = menus.filter(item => item.parentId).forEach(element => {
                menus.map(item => {
                    if (item.id === element.parentId) {
                        if (item.submenus) item.submenus.push(element);
                        else item.submenus = [element];
                    }
                    return item;
                });
            });
            menusView = menus.map((item, index) => {
                if (!item.active) return null;
                let link = item.link ? item.link.trim() : '/',
                    isExternalLink = link.startsWith('http://') || link.startsWith('https://');
                const title = item.link !== '/' ? T.language.parse(item.title) : <span className='fa fa-home fa-lg' />;
                if (!item.parentId) return (item.submenus && item.submenus.length > 0) ? (
                    <li key={index} className={`nav-item has-down ${index !== (menus.length - 1) && link !== '/' && 'menuStyle'} ${link !== '/' ? 'flex-lg-grow-1' : 'pr-4'}`}>
                        {isExternalLink ? <a href={link} target='_blank' className='nav-link d-flex align-items-center'
                            style={{ margin: 0, justifyContent: 'center' }}
                            htmlFor={`link${index}MenuCheck`} rel="noreferrer" ><h6 style={{ margin: '0 10px' }}><b>{title}</b></h6></a> :
                            (item.link ? <Link to={link} className='nav-link d-flex align-items-center'
                                htmlFor={`link${index}MenuCheck`} style={{ margin: 0, justifyContent: 'center' }} onClick={this.onMenuClick}><h6 style={{ margin: '0 10px' }}><b>{title}</b></h6></Link> :
                                <a href='#' className='nav-link' htmlFor={`link${index}MenuCheck`} style={{ margin: '0 10px', justifyContent: 'center' }} onClick={e => e.preventDefault()}>{title}</a>)
                        }
                        <label className='nav-link' htmlFor={`link${index}MenuCheck`}><h6 style={{ margin: '0 10px' }}><b>{title} <i className='fa fa-angle-down' aria-hidden='true'></i></b></h6> </label>
                        <input id={`link${index}MenuCheck`} type='checkbox' style={{ visibility: 'hidden', position: 'absolute' }} />
                        <ul className='menu-dropdown' style={{ backgroundColor: '#0139A6' }}>{
                            item.submenus.map((subMenu, subIndex) => {
                                const link = subMenu.link ? subMenu.link.trim() : '/',
                                    isExternalLink = link.startsWith('http://') || link.startsWith('https://');
                                if (subMenu.title == '-') {
                                    return <li key={subIndex}>---</li>;
                                } else if (subMenu.active) {
                                    let submenu2 = null;
                                    if (subMenu.submenus && subMenu.submenus.length > 0) {
                                        submenu2 =
                                            <ul className="dropdown-menu" style={{ backgroundColor: '#0139A6' }}>
                                                {subMenu.submenus.map((item, index) =>
                                                    <li className="dropdown-item" key={index}>
                                                        {item.link.includes('http')
                                                            ? <a href={'#'} onClick={() => window.open(item.link, '_blank')}
                                                                target='_blank' style={{ color: 'white', padding: 0, }} rel="noreferrer">
                                                                {T.language.parse(item.title)}</a>
                                                            : <Link to={item.link} onClick={this.onMenuClick}
                                                                style={{ color: 'white', padding: 0, }}>{T.language.parse(item.title)}
                                                            </Link>}
                                                    </li>)}
                                            </ul>;
                                    }
                                    return isExternalLink ?
                                        <li className="dropdown" key={subIndex}>
                                            <a href={link} id="menu"
                                                target='_blank'
                                                style={{ color: 'white', padding: '0 20px', marginLeft: 8, marginRight: 8, marginBottom: 0 }}
                                                data-toggle={submenu2 ? 'dropdown' : ''} className={submenu2 ? 'dropdown-toggle' : ''}
                                                data-display="static" rel="noreferrer">{T.language.parse(subMenu.title)}</a>
                                            {submenu2}
                                        </li> :
                                        <li className="dropdown" key={subIndex}>
                                            <Link onClick={this.onMenuClick} to={link}>
                                                <p id="menu"
                                                    style={{ color: 'white', padding: 0, marginLeft: 8, marginRight: 8, marginBottom: 0 }}
                                                    data-toggle={submenu2 ? 'dropdown' : ''} className={submenu2 ? 'dropdown-toggle' : ''}
                                                    data-display="static">{T.language.parse(subMenu.title)}</p>
                                                {submenu2}
                                            </Link>
                                        </li>
                                        ;
                                }
                            })}
                        </ul>
                    </li>
                ) :
                    (<li key={index} className={`nav-item d-flex justify-content-lg-center justify-content-left ${index !== (menus.length - 1) && link !== '/' && 'menuStyle'} ${link !== '/' ? 'flex-lg-grow-1' : 'pr-4'}`}>
                        {isExternalLink ? <a href={link} target='_blank' className='nav-link d-flex align-items-center' rel="noreferrer"><h6 style={{ margin: '0 10px' }}><b>{title}</b></h6></a> :
                            <Link to={link} className='nav-link d-flex align-items-center' onClick={this.onMenuClick}><h6 style={{ margin: '0 10px' }}><b>{title}</b></h6></Link>}
                    </li>);
            });
        }
        if (this.props.system && this.props.system.submenus) {
            submenus = this.props.system.submenus.map((item, index) => {
                let title = T.language.parse(item.title);
                let link = item.link ? item.link.toLowerCase().trim() : '/',
                    isExternalLink = link.startsWith('http://') || link.startsWith('https://');
                return (
                    <div key={index} className='menuStyle d-flex justify-content-center align-items-center px-2'
                        style={{ backgroundColor: item.highlight ? 'red' : '', borderRightWidth: 1, borderColor: '#0139A6' }}>
                        {isExternalLink ? <a href={link} target='_blank' style={{ color: '#0139a6', fontSize: '0.9vw', fontWeight: 'bold' }} rel="noreferrer">{title}</a> :
                            <Link to={Link} style={{ color: '#0139a6', fontSize: '0.9vw', fontWeight: 'bold' }}>{title}</Link>}
                    </div>
                );
            });
        }
        let headerImage, title, link, isExternalLink, showHeaderTitle;
        if (this.props.isDonVi) {
            headerImage = this.state.header ? this.state.header : this.props.system && this.props.system.header;
            title = T.language.parse(this.state.headerTitle ? this.state.headerTitle : '');
            link = this.state.headerLink ? this.state.headerLink.toLowerCase().trim() : '/';
            isExternalLink = link.startsWith('http://') || link.startsWith('https://'),
                showHeaderTitle = this.state.showHeaderTitle;
        } else {
            headerImage = this.props.system && this.props.system.header;
            title = this.props.system && this.props.system.headerTitle && T.language.parse(this.props.system.headerTitle);
            link = this.props.system && this.props.system.headerLink ? this.props.system.headerLink.toLowerCase().trim() : '/';
            isExternalLink = link.startsWith('http://') || link.startsWith('https://'),
                showHeaderTitle = this.props.system && this.props.system.isShowHeaderTitle && this.props.system.isShowHeaderTitle == '1' ? true : false;
        }
        header =
            <div className='d-none d-lg-flex row p-4' style={{ backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', minHeight: '12vw' }}>
                {showHeaderTitle ?
                    <div className='p-2 col-3 offset-9 d-flex align-items-center justify-content-center' style={{ backgroundColor: '#e2e3ff' }}>
                        {
                            isExternalLink ?
                                <a href={link} target='_blank' className='d-flex' rel="noreferrer"><h5 className='m-0 text-center p-2' style={{ color: '#303591' }}><b className='homeHeading'>{title}</b></h5></a> :
                                <Link to={link} className='d-flex'><h5 className='m-0 text-center' style={{ color: '#303591' }}><b className='homeHeading'>{title}</b></h5></Link>
                        }
                    </div> : ''}
            </div>;
        return (
            <>
                {header}
                <div className='d-lg-flex d-none justify-content-end'
                    style={{ paddingTop: 5, paddingBottom: 2, backgroundImage: this.props.isDonVi ? 'linear-gradient(90deg, rgba(255,255,255,1) 73%, #3FA9F5 100%)' : null }}>
                    {submenus}
                    <div className='d-flex align-items-center'>
                        {languageToggle}
                        <input type='text' className='mx-2 px-2 subMenu' id='inputID' onKeyPress={this.onKeyPress} placeholder={language.search}
                            style={{ borderColor: '#0139a6', backgroundColor: 'transparent', borderRadius: 5, marginLeft: 10, marginBottom: 2 }} />
                    </div>
                    <div className='d-flex align-items-center'>
                        {user &&
                            <a href='/user' target='_blank' style={{ color: '#0139a6', fontWeight: 'bold', fontSize: '0.9vw', paddingLeft: 5 }}>
                                <span>{language.adminPage}</span>
                            </a>
                        }
                        <a href='#' onClick={this.logout} className='nav-link' style={{ color: '#0139a6', padding: '0 10px', fontWeight: 'bold', fontSize: '0.9vw' }}>
                            <span>{user ? language.logoutButton : language.loginButton}</span>
                        </a>
                    </div>
                </div>
                <nav className='navbar navbar-expand-lg py-lg-2 ftco_navbar ftco-navbar-light' id='ftco-navbar' ref={this.nav}>
                    <div className='container-fluid' style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#ftco-nav' id='toggle1'
                                aria-controls="ftco-nav" aria-expanded='false' aria-label='Toggle navigation'>
                                <span className='oi oi-menu' />
                            </button>
                            {this.props.system && this.props.system.logo && this.state.width < 980 ?
                                <Link to={menus && menus[0] && menus[0].link ? menus[0].link : '/'}>
                                    <img src={this.state.headerMobile} style={{ height: 40, }} />
                                </Link>
                                : null}
                        </div>
                        <div style={{ width: '40px', cursor: 'pointer' }} onClick={(e) => !user && this.logout(e)}
                            className='navbar-toggler'>
                            <a style={{ color: 'grey' }}><i className='fa fa-lg fa-user'
                                data-toggle='collapse' data-target='#dang-xuat' aria-expanded="false"
                                aria-controls="dang-xuat" aria-label='Toggle navigation'
                                style={{ color: 'white' }} /></a>
                        </div>
                        <div className='collapse navbar-collapse' id='ftco-nav' >
                            <div className='navbar-nav d-lg-flex justify-content-lg-around flex-grow-1' >
                                <ul className='navbar-nav d-lg-flex flex-grow-1'>
                                    {menusView}
                                </ul>
                            </div>
                        </div>
                        {this.state.width < 980 &&
                            <div className='collapse navbar-collapse' id='dang-xuat' >
                                <div className='navbar-nav d-lg-flex justify-content-lg-around flex-grow-1' >
                                    <ul className='navbar-nav d-lg-flex flex-grow-1' style={{ textAlign: 'right', paddingRight: 13 }}>
                                        {user && <li className='nav-item'>
                                            <a href='/user' className='nav-link' style={{ fontWeight: 'bold', fontSize: 16, color: '#002060', }}>
                                                <span style={{ marginLeft: 10 }}>{language.adminPage}</span>
                                            </a>
                                        </li>}
                                        {user && <li className='nav-item'>
                                            <a href='#' onClick={this.logout} className='nav-link' style={{ fontWeight: 'bold', fontSize: 16, color: '#002060', }}>
                                                <span style={{ marginLeft: 10 }}>{language.logoutButton}</span>
                                            </a>
                                        </li>}
                                    </ul>
                                </div>
                            </div>}
                    </div>
                </nav>
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { logout, divisionHomeMenuGetAll, homeMenuGet, getDvWebsite, getDvWebsiteAll };
export default connect(mapStateToProps, mapActionsToProps)(HomeMenu);