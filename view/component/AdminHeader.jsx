import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import { changeRole } from 'modules/_default/fwRole/redux';
import { getUnreadContacts, getContact } from 'modules/_default/fwContact/redux';
import { getUnreadNotification, addNotification, readNotification } from 'modules/_default/fwNotification/redux';
import { updateSystemState, logout } from 'modules/_default/_init/reduxSystem';
import { SelectAdapter_FwUser, switchUser } from 'modules/_default/fwUser/reduxUser';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminPage, } from 'view/component/AdminPage';

import { Select } from './Input';
import AdminContactModal from './AdminContactModal';

class DebugModal extends React.Component {
    modal = React.createRef();
    user = React.createRef();
    canBo = React.createRef();
    sinhVien = React.createRef();

    show = () => {
        this.canBo.current.setVal(null);
        this.user.current.setVal(null);
        $(this.modal.current).modal('show');
    }

    switchUser = () => {
        const email = this.user.current.val();
        const shcc = this.canBo.current.val();
        this.props.switchUser(email || shcc);
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Switch user</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label className='control-label'>Select user</label>
                                <Select ref={this.user} adapter={SelectAdapter_FwUser} displayLabel={false} label='Người dùng' />
                            </div>
                            <div className='form-group'>
                                <label className='control-label'>Select staff</label>
                                <Select ref={this.canBo} adapter={SelectAdapter_FwCanBo} displayLabel={false} label='Cán bộ' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-success' onClick={this.switchUser}>Switch</button>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const UrlItem = (props) => {
    const link = props.link || '#';
    if (link == '#') {
        return (
            <a href='#' className='app-notification__item' onClick={e => e.preventDefault() || (props.onClick && props.onClick(e))}>
                {props.children}
            </a>
        );
    } else if (link.startsWith('http')) {
        return (
            <a href={link} className='app-notification__item' target='_blank' rel='noreferrer' onClick={(e) => props.onClick && props.onClick(e)}>
                {props.children}
            </a>
        );
    } else {
        return (
            <Link to={link} className='app-notification__item' onClick={(e) => props.onClick && props.onClick(e)}>
                {props.children}
            </Link>
        );
    }
};

class NotificationItem extends AdminPage {
    componentDidMount() {
        const handleGetNotification = () => {
            if (this.props.system && this.props.system.user) {
                const contactRead = this.getUserPermission('contact', ['read']).read;
                if (contactRead) this.props.getUnreadContacts();
                this.props.getUnreadNotification(1, 10);
            } else setTimeout(handleGetNotification, 250);
        };
        handleGetNotification();
    }

    readNotify = (id, action) => {
        this.props.readNotification(id, action, () => this.props.getUnreadNotification(1, 10));
    }

    handleClickButton = (e, button, notiId) => {
        e.stopPropagation();
        e.preventDefault();
        let { method, url, body, text } = button;
        if (url) {
            if (!method) method = 'get';
            method = method.toLowerCase();
            // Redirect to another page
            if (method == 'get' && !url.startsWith('/api')) {
                // External link
                if (url.startsWith('http')) {
                    window.open(url, '_blank');
                } else if (!url.startsWith('/user')) {
                    // Homepage
                    document.location.pathname = url;
                } else {
                    this.props.history.push(url);
                }
                this.readNotify(notiId);
            } else {
                // Handle request
                T[method](url, body || {}, (data) => {
                    if (data) {
                        if (data.error) {
                            T.notify(data.error.message || 'Thao tác bị lỗi!', 'danger');
                        } else {
                            T.notify(data.success && data.success.message ? data.success.message : 'Thao tác thành công!', 'success');
                            this.readNotify(notiId, 'Đã ' + text.toLowerCase());
                        }
                    }
                }, () => T.notify('Thao tác bị lỗi!', 'danger'));
            }
        }
    }

    render() {
        const contactRead = this.getUserPermission('contact', ['read']).read;
        const contacts = this.props.contact && this.props.contact.unreads ? this.props.contact.unreads : [];
        const notifications = this.props.notification && this.props.notification.unread && this.props.notification.unread ? this.props.notification.unread : [];
        const notificationLength = contacts.length + notifications.length;
        const contactElements = contacts.map((item, index) => (
            <li key={index}>
                <a className='app-notification__item' href='#' onClick={e => this.props.showContact(e, item.id)}>
                    <span className='app-notification__icon'>
                        <span className='fa-stack fa-lg'>
                            <i className='fa fa-circle fa-stack-2x text-primary' />
                            <i className='fa fa-envelope fa-stack-1x fa-inverse' />
                        </span>
                    </span>
                    <div>
                        <p className='app-notification__message' style={{ fontWeight: 'bold' }}>{item.subject}</p>
                        <p className='app-notification__meta'>{new Date(item.createdDate).getText()}</p>
                    </div>
                </a>
            </li>));
        const notificationElements = notifications.map((item, index) => {
            let buttons;
            try {
                if (item.buttonLink) {
                    buttons = JSON.parse(item.buttonLink);
                } else {
                    buttons = [];
                }
            } catch (e) {
                console.error(e);
                buttons = [];
            }
            if (buttons.length) item.targetLink = '#';
            return (
                <li key={index}>
                    <UrlItem link={item.targetLink} onClick={e => buttons.length == 0 ? this.readNotify(item.id) : e.preventDefault()}>
                        <span className='app-notification__icon'>
                            <span className='fa-stack fa-lg'>
                                <i className='fa fa-circle fa-stack-2x' style={{ color: item.iconColor }} />
                                <i className={`fa ${item.icon} fa-stack-1x fa-inverse`} />
                            </span>
                        </span>
                        <div>
                            <p className='app-notification__message' style={{ fontWeight: 'bold' }}>{item.title}</p>
                            <p className='app-notification__meta'>{new Date(item.sendTime).getText()}</p>
                            <p className='app-notification__meta'>{item.subTitle}</p>
                            {buttons.length ? (
                                <div className='row'>
                                    {buttons.map((button, index) => (
                                        <div key={index} className='col-auto' style={{ padding: '0 5px' }}>
                                            <button key={index} className={`btn btn-${button.type} btn-sm`} onClick={(e) => this.handleClickButton(e, button, item.id)}>{button.text}</button>
                                        </div>
                                    ))}
                                </div>
                            ) : ''}
                        </div>
                    </UrlItem>
                </li>
            );
        });

        return (
            <li className='dropdown'>
                <a className='app-nav__item' href='#' data-toggle='dropdown' aria-label='Show notifications'>
                    <i className='fa fa-bell-o fa-lg' />
                    {notificationLength ? <span className='badge badge-pill badge-danger' style={{ position: 'absolute', top: '6px', right: notificationLength >= 10 ? '-8px' : '-2px', fontSize: '87%' }}>{notificationLength}</span> : ''}
                </a>
                <ul className='app-notification dropdown-menu dropdown-menu-right'>
                    <li className='app-notification__title'>{notificationLength ? `Bạn có ${notificationLength} thông báo mới` : 'Bạn không có thông báo mới nào'}</li>
                    {contactRead && (<>
                        <div className='app-notification__content'>
                            {contactElements}
                        </div>
                        <li className='app-notification__footer'>
                            <Link to='/user/contact'>Đến trang liên hệ</Link>
                        </li>
                    </>)}

                    <div className='app-notification__content'>
                        {notificationElements}
                    </div>
                    <li className='app-notification__footer'>
                        <Link to='/user/notification'>Đến trang thông báo</Link>
                    </li>
                </ul>
            </li>
        );
    }
}

const SectionNotification = withRouter(connect(state => ({ system: state.system, notification: state.notification, contact: state.contact }), { getUnreadNotification, readNotification, getUnreadContacts })(NotificationItem));

class AdminHeader extends AdminPage {
    componentDidMount() {
        T.showSearchBox = (onSearchHide = null) => {
            this.searchBox && $(this.searchBox).parent().css('display', 'flex');
            this.advancedSearch && $(this.advancedSearch).css('display', onSearchHide ? 'flex' : 'none');
            if (onSearchHide && typeof onSearchHide == 'function') {
                T.onAdvanceSearchHide = onSearchHide;
            } else {
                T.onAdvanceSearchHide = null;
            }
        };
        T.setTextSearchBox = (searchText) => {
            this.searchBox && $(this.searchBox).val(searchText);
        };
        T.hideSearchBox = () => {
            this.searchBox && $(this.searchBox).parent().css('display', 'none');
            this.advancedSearch && $(this.advancedSearch).css('display', 'none');
        };
        T.clearSearchBox = () => {
            if (this.searchBox) this.searchBox.value = '';
        };
        T.socket.on('receive-notification', (email, notifyItem) => {
            const user = this.props.system && this.props.system.user ? this.props.system.user : {};
            if (user.email && user.email == email) {
                this.props.addNotification(notifyItem);
            }
        });
    }

    willUnmount = () => {
        T.socket.off('receive-notification');
    }

    search = (e) => e.preventDefault() || T.onSearch && T.onSearch(this.searchBox.value);

    onAdvanceSearch = (e) => {
        e.preventDefault();
        if ($('.app-advance-search')) {
            // Close advance search
            if ($('.app-advance-search').hasClass('show')) {
                T.onAdvanceSearchHide && T.onAdvanceSearchHide();
            }

            $('.app-advance-search').toggleClass('show');
        }
    }

    showContact = (e, contactId) => {
        e.preventDefault();
        this.props.getContact(contactId, contact => this.contactModal.show(contact));
    }

    showDebugModal = e => {
        e.preventDefault();
        this.debugModal.show();
    }

    logout = (e) => {
        e.preventDefault();
        this.props.logout();
    }

    render() {
        const isDebug = this.props.system && this.props.system.isDebug,
            isAdmin = this.props.system && this.props.system.user && this.props.system.user.roles.some(role => role.name == 'admin');
        return [
            <header key={0} className='app-header'>
                <Link className='app-header__logo' to='/user'>HCMUSSH</Link>
                <a className='app-sidebar__toggle' href='#' data-toggle='sidebar' aria-label='Hide Sidebar' />
                <ul className='app-nav'>
                    {isAdmin || isDebug ?
                        <li className='app-nav__item'>
                            <a href='#' style={{ color: 'white' }} onClick={this.showDebugModal}>Switch user</a>
                        </li> : null}
                    <li className='app-search col-md-4' style={{ display: 'none' }}>
                        <input ref={e => this.searchBox = e} className='app-search__input col-md-12' type='search' placeholder='Tìm kiếm' onKeyUp={e => e.keyCode == 13 && this.search(e)} />
                        <button className='app-search__button' onClick={this.search}><i className='fa fa-search' /></button>
                    </li>
                    <li ref={e => this.advancedSearch = e} style={{ display: 'none' }} onClick={this.onAdvanceSearch}>
                        <a className='app-nav__item' href='#'>
                            <i className='fa fa-search-plus fa-lg' />
                        </a>
                    </li>
                    <SectionNotification showContact={this.showContact} />
                    <li>
                        <Link className='app-nav__item' to='/user'>
                            <i className='fa fa-user fa-lg' />
                        </Link>
                    </li>
                    <li>
                        <a className='app-nav__item' href='#' onClick={this.logout}>
                            <i className='fa fa-power-off fa-lg' style={{ color: 'red' }} />
                        </a>
                    </li>
                </ul>
            </header>,
            <AdminContactModal key={1} ref={e => this.contactModal = e} />,
            <DebugModal key={2} ref={e => this.debugModal = e} switchUser={this.props.switchUser} updateSystemState={this.props.updateSystemState} />
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, role: state.role });
const mapActionsToProps = { changeRole, updateSystemState, switchUser, logout, getContact, addNotification };
export default connect(mapStateToProps, mapActionsToProps)(AdminHeader);