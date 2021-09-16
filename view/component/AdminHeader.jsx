import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { changeRole } from 'modules/_default/fwRole/redux';
import { updateSystemState, logout } from 'modules/_default/_init/reduxSystem';
import { SelectAdapter_FwUser, switchUser } from 'modules/_default/fwUser/reduxUser';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminPage, } from 'view/component/AdminPage';

import { Select } from './Input';

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
                    <li className='app-search' style={{ display: 'none' }}>
                        <input ref={e => this.searchBox = e} className='app-search__input' type='search' placeholder='Tìm kiếm' onKeyUp={e => e.keyCode == 13 && this.search(e)} />
                        <button className='app-search__button' onClick={this.search}><i className='fa fa-search' /></button>
                    </li>
                    <li ref={e => this.advancedSearch = e} style={{ display: 'none' }} onClick={this.onAdvanceSearch}>
                        <a className='app-nav__item' href='#'>
                            <i className='fa fa-search-plus fa-lg' />
                        </a>
                    </li>
                    {/* <SectionNotification showContact={this.showContact}/> */}
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
            // <ContactModal key={1} ref={e => this.contactModal = e} />,
            <DebugModal key={2} ref={e => this.debugModal = e} switchUser={this.props.switchUser} updateSystemState={this.props.updateSystemState} />
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, role: state.role });
const mapActionsToProps = { changeRole, updateSystemState, switchUser, logout };
export default connect(mapStateToProps, mapActionsToProps)(AdminHeader);