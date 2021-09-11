import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getUserPage, createUser, updateUser, deleteUser, changeUser, } from './reduxUser';
import { getRoleAll } from '../fwRole/redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import ImageBox from 'view/component/ImageBox';
import { SelectAdapter_DmDonVi } from '../../mdDanhMuc/dmDonVi/redux';
import { Select } from 'view/component/Input';
class RolesModal extends React.Component {
    state = {};
    modal = React.createRef();
    donVi = React.createRef();

    componentDidMount() {
        T.ready(() => {
            $('#userRoles').select2();
            $(this.modal.current).on('shown.bs.modal', () => $('#userRoles').focus());
        });
    }

    show = user => {
        const { email, roles } = user ? user : { roles: [] };
        if (email) {
            this.setState({ email });
            let allRoles = this.props.allRoles.map(item => ({ id: item.id, text: item.name }));
            $('#roleModalRoles').select2({ placeholder: 'Lựa chọn Vai trò', data: allRoles }).val(roles).trigger('change');

            $(this.modal.current).modal('show');
        }

    };

    save = e => {
        e.preventDefault();
        this.props.updateUser(this.state.email, { roles: $('#roleModalRoles').val() });
        $(this.modal.current).modal('hide');
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Cập nhật vai trò</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='roleModalRoles' className='control-label'>Vai trò</label><br />
                                <select className='form-control' id='roleModalRoles' multiple={true} defaultValue={[]}>
                                    <optgroup label='Lựa chọn Vai trò' />
                                </select>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-success'>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class UserModal extends React.Component {
    state = { isStaff: true, isStudent: false, active: true, image: null };
    modal = React.createRef();
    imageBox = React.createRef();
    donVi = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#userEmail').focus());
        }, 250));
    }

    show = (user) => {
        let allRoles = this.props.allRoles.map(role => ({ id: role.id, text: role.name }));
        let { email, firstName, lastName, shcc, studentId, isStaff, isStudent, image, active, roles, maDonVi } = user ? user : { email: null, firstName: '', lastName: '', shcc: '', studentId: '', isStaff: 1, isStudent: 0, image, active: 1, roles: [], maDonVi: 0 };
        active = (active == 1 || active == '1');
        isStaff = (isStaff == 1 || isStaff == '1');
        isStudent = (isStudent == 1 || isStudent == '1');
        this.donVi.current.setVal(maDonVi ? maDonVi : null);
        $('#userEmail').val(email || '');
        $('#userFirstName').val(firstName || '');
        $('#userLastName').val(lastName || '');
        $('#userShcc').val(shcc || '');
        $('#userMssv').val(studentId || '');
        $('#userRoles').select2({ placeholder: 'Lựa chọn Vai trò', data: allRoles }).val(roles).trigger('change');
        this.imageBox.current.setData('user:' + email);
        this.setState({ user, email, isStaff, isStudent, image, active });
        $(this.modal.current).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const changes = {
            email: $('#userEmail').val().trim(),
            firstName: $('#userFirstName').val().trim(),
            lastName: $('#userLastName').val().trim(),
            shcc: this.state.isStaff ? ($('#userShcc').val() && $('#userShcc').val().trim()) : null,
            studentId: this.state.isStudent ? ($('#userMssv').val() && $('#userMssv').val().trim()) : null,
            isStaff: this.state.isStaff ? 1 : 0,
            active: this.state.active ? 1 : 0,
            roles: $('#userRoles').val(),
        };
        if (this.donVi.current) changes.maDonVi = this.donVi.current.val();
        if (!changes.email) {
            T.notify('Email bị trống!', 'danger');
            $('#userEmail').focus();
        } else if (changes.isStaff && !changes.shcc) {
            T.notify('Số hiệu công chức bị trống!', 'danger');
            $('#userShcc').focus();
        } else if (!changes.firstName) {
            T.notify('Tên bị trống!', 'danger');
            $('#userFirstName').focus();
        } else if (!changes.lastName) {
            T.notify('Họ và chữ lót bị trống!', 'danger');
            $('#userLastName').focus();
        } else if (changes.isStudent && !changes.studentId) {
            T.notify('Mã số sinh viên bị trống!', 'danger');
            $('#userMssv').focus();
        } else {
            if (this.state.email) {
                this.props.updateUser(this.state.email, changes, () => $(this.modal.current).modal('hide'));
            } else {
                this.props.createUser(changes, () => $(this.modal.current).modal('hide'));
            }
        }
    };

    render() {
        const permissionWrite = this.props.permissionWrite;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin người dùng</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='col-12 col-md-8'>
                                <div className='form-group'>
                                    <label htmlFor='userEmail'>Email</label>
                                    <input className='form-control' id='userEmail' type='email' placeholder='Email' readOnly={!permissionWrite} />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='userLastName'>Họ và chữ lót</label>
                                    <input className='form-control' id='userLastName' type='text' placeholder='Họ và chữ lót' readOnly={!permissionWrite} />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='userFirstName'>Tên</label>
                                    <input className='form-control' id='userFirstName' type='text' placeholder='Tên' readOnly={!permissionWrite} />
                                </div>
                            </div>

                            <div className='col-12 col-md-4'>
                                <div className='form-group' style={{ display: this.state.email ? 'block' : 'none' }}>
                                    <label>Hình đại diện</label>
                                    <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='UserImage' userData='UserImage' image={this.state.image ? this.state.image : '/img/avatar.png'}
                                        success={data => data.error == null && this.props.changeUser(Object.assign(this.state.user, { image: data.image }))} />
                                </div>
                                <div className='form-group' style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                    <label htmlFor='userActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='userActive' checked={this.state.active} onChange={() => permissionWrite && this.setState({ active: !this.state.active })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 col-md-6'>
                                <div className='form-group' style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                    <label htmlFor='userIsStaff'>Người dùng là Cán bộ: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='userIsStaff' checked={this.state.isStaff} onChange={() => permissionWrite && this.setState({ isStaff: !this.state.isStaff })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <input className='form-control' id='userShcc' type='text' placeholder='Số hiệu công chức' style={{ display: this.state.isStaff ? 'block' : 'none' }} readOnly={!permissionWrite} />
                                </div>
                            </div>
                            <div className='col-12 col-md-6'>
                                <div className='form-group' style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                    <label htmlFor='userIsStudent'>Người dùng là Sinh viên: </label>&nbsp;&nbsp;
                                            <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='userIsStudent' checked={this.state.isStudent} onChange={() => permissionWrite && this.setState({ isStudent: !this.state.isStudent })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <input className='form-control' id='userMssv' type='text' placeholder='Mã số sinh viên' style={{ display: this.state.isStudent ? 'block' : 'none' }} readOnly={!permissionWrite} />
                                </div>
                            </div>


                            <div className='col-12 form-group'>
                                <div className='form-group '>
                                    <Select adapter={SelectAdapter_DmDonVi} ref={this.donVi} label='Đơn vị' />
                                </div>
                                <label htmlFor='userRoles' className='control-label'>Vai trò</label><br />
                                <select className='form-control' id='userRoles' multiple={true} defaultValue={[]}>
                                    <optgroup label='Lựa chọn Vai trò' />
                                </select>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-success'>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class UserPage extends React.Component {
    state = { personType: 'Tất cả', searchText: '', isSearching: false };
    searchBox = React.createRef();
    roleMapper = {};
    userModal = React.createRef();
    rolesModal = React.createRef();

    componentDidMount() {
        this.props.getRoleAll(items => items && items.forEach(role => this.roleMapper[role.id] = role.name));
        T.tooltip();
        T.ready(() => this.searchBox.current.getPage());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.userModal.current.show(item);
    };

    editRoles = (e, item) => {
        e.preventDefault();
        this.rolesModal.current.show(item);
    };

    changeActive = item => this.props.updateUser(item.email, { active: item.active ? 0 : 1 })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Người dùng: Xóa người dùng', 'Bạn có chắc bạn muốn xóa người dùng này?', true, isConfirm =>
            isConfirm && this.props.deleteUser(item.email));
    };

    search = (e, personType) => {
        e.preventDefault();
        let condition = {},
            searchText = $('#searchTextBox').val();
        if (personType == undefined) personType = this.state.personType;
        if (searchText) condition.searchText = searchText;
        if (personType == 'Nhân sự') condition.isStaff = 1;
        if (personType == 'Sinh viên') condition.isStudent = 1;
        this.props.getUserPage(undefined, undefined, condition, () => {
            const isSearching = Object.keys(condition).length > 0;
            this.setState({ personType, searchText, isSearching });
        });
    };

    render() {
        const permissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = permissions.includes('user:write'),
            permissionDelete = permissions.includes('user:delete');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.user && this.props.user.page ?
            this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: null };
        let table = 'Không có người dùng!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '50%' }}>Email</th>
                            <th style={{ width: '50%' }}>Họ tên</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Vai trò</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.user.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.edit(e, item)}>{item.email}</a>
                                    {item.isStaff || item.isStudent ?
                                        <><br />{item.isStaff ? <span> Cán bộ</span> : null}{item.isStudent ? <span> Sinh viên</span> : null}</> : null}
                                </td>
                                <td>{item.lastName} {item.firstName}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td style={{ textAlign: 'left' }}>
                                    {item.roles ?
                                        item.roles.map(roleId => <label style={{ whiteSpace: 'nowrap' }} key={roleId}> {this.roleMapper && this.roleMapper[roleId] ? this.roleMapper[roleId] : ''}</label>) :
                                        '<nothing>'}
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => this.changeActive(item, index)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className={item.default ? '' : 'btn-group'}>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {item.default == false && !item.email.endsWith('@hcmussh.edu.vn') ?
                                            <a className='btn btn-info' href='#' onClick={e => this.changePassword(e, item)}><i className='fa fa-lg fa-key' /></a> : ''}
                                        {item.default && permissionDelete ? null :
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-user' /> Người dùng</h1>
                    </div>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getUserPage} setSearching={value => this.setState({ searching: value })} />
                </div>

                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <Pagination name='adminUser' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.searchBox.current && this.searchBox.current.getPage} />

                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>

                    <UserModal ref={this.userModal} permissionWrite={permissionWrite}
                        allRoles={this.props.system && this.props.system.roles ? this.props.system.roles : []}
                        updateUser={this.props.updateUser} createUser={this.props.createUser} changeUser={this.props.changeUser} />
                    <RolesModal ref={this.rolesModal} permissionWrite={permissionWrite}
                        allRoles={this.props.system && this.props.system.roles ? this.props.system.roles : []}
                        updateUser={this.props.updateUser} />
                </div>
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, division: state.division, user: state.user, role: state.role });
const mapActionsToProps = { getUserPage, createUser, updateUser, deleteUser, changeUser, getRoleAll };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
