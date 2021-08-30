import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { changeRole } from 'modules/_default/fwRole/redux';
import { updateSystemState, logout } from 'modules/_default/_init/reduxSystem';
import { SelectAdapter_FwUser, switchUser } from 'modules/_default/fwUser/reduxUser';
import { SelectAdapter_FwCanBo } from 'modules/_default/fwCanBo/redux';

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

class AdminHeader extends React.Component {
    debugModal = React.createRef();

    logout = (e) => {
        e.preventDefault();
        this.props.logout();
    }

    debugAsRole = (e, role) => {
        this.props.changeRole(role, user => this.props.updateSystemState({ user }));
        e.preventDefault();
    }

    genClassName = (_id) => {
        if (this.props.system && this.props.system.user) {
            const roles = this.props.system.user.roles;
            return roles && roles.contains(_id) ? 'btn btn-success' : 'btn btn-light';
        } else {
            return 'btn btn-light';
        }
    }
    showDebugModal = e => {
        e.preventDefault();
        this.debugModal.current.show();
    }

    render() {
        const isDebug = this.props.system && this.props.system.isDebug,
            isAdmin = this.props.system && this.props.system.user &&
                this.props.system.user.email.indexOf('@hcmut.edu.vn') != -1;
        return (
            <>
                <header className='app-header' style={{ backgroundColor: 'rgb(48, 53, 145)' }}>
                    <Link className='app-header__logo' to='/user' style={{ backgroundColor: 'rgb(48, 53, 100)' }}>HCMUSSH</Link>
                    <a className='app-sidebar__toggle' href='#' data-toggle='sidebar' aria-label='Hide Sidebar' />
                    <ul className='app-nav'>
                        {this.props.system && this.props.system.isDebug && this.props.system.roles && this.props.system.roles.length ? (
                            <li className='dropdown'>
                                <a className='app-nav__item' href='#' data-toggle='dropdown' aria-label='Show notifications'>
                                    Debug as &nbsp;<span style={{ color: '#1488db' }}>{(this.props.system.user ? this.props.system.user.roles : []).map(role => role.name.toUpperCase()).toString()}</span>
                                </a>
                                <ul className='app-notification dropdown-menu dropdown-menu-right'>
                                    {this.props.system.roles.map((item, index) =>
                                        <li key={index} className='app-notification__title' style={{ width: '100%', backgroundColor: 'rgb(48, 53, 145)' }}>
                                            <a href='#' style={{ color: 'white', width: '100%', display: 'block' }} onClick={(e) => this.debugAsRole(e, item)}>{item.name}</a>
                                        </li>
                                    )}
                                </ul>
                            </li>
                        ) : ''}
                        {isDebug || isAdmin ?
                            <li className='app-nav__item'>
                                <a href='#' style={{ color: 'white' }} onClick={this.showDebugModal}>Switch user</a>
                            </li> : null}
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
                </header>
                <DebugModal key={2} ref={this.debugModal} switchUser={this.props.switchUser} updateSystemState={this.props.updateSystemState} />
            </>

        );
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, role: state.role });
const mapActionsToProps = { changeRole, updateSystemState, switchUser, logout };
export default connect(mapStateToProps, mapActionsToProps)(AdminHeader);