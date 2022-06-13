import React from 'react';
import { connect } from 'react-redux';
import { getRolePage, createRole, updateRole, deleteRole, UpdateSessionRole } from './redux';
import Pagination from 'view/component/Pagination';
class RoleModal extends React.Component {
    state = { isAdmin: false };
    modal = React.createRef();
    btnSave = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#roleName').focus());
        }, 250));
    }

    show = (item, isAdmin) => {
        const { id, name, description } = item ?
            item : { id: null, name: '', permission: [], active: false, };
        this.setState({ isAdmin, name, description });
        $(this.btnSave.current).data('id', id);
        $('#roleName').val(name);
        $('#description').val(description);
        $(this.modal.current).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const id = $(this.btnSave.current).data('id'),
            changes = {
                name: $('#roleName').val().trim(),
                description: $('#description').val()
            };

        if (changes.name == '') {
            T.notify('Tên bị trống!', 'danger');
            $('#roleName').focus();
        } else {
            if (this.state.name == 'admin') delete changes.name;
            if (id) {
                this.props.updateRole(id, changes, () => this.props.getPage && this.props.getPage());
            } else {
                this.props.createRole(changes, () => this.props.getPage && this.props.getPage());
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin vai trò</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='roleName'>Tên vai trò{this.state.name == 'admin' ? ': admin' : ''}</label>
                                <input className='form-control' id='roleName' type='text' placeholder='Tên vai trò' style={{ display: this.state.name == 'admin' ? 'none' : 'block' }} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='description'>Thông tin chi tiết</label>
                                {this.state.name != 'admin' || this.state.isAdmin ?
                                    <input className='form-control' id='description' type='text' placeholder='Thông tin chi tiết' /> : ': ' + this.state.description}
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {this.state.name != 'admin' || this.state.isAdmin ?
                                <button type='submit' className='btn btn-success' ref={this.btnSave}>Lưu</button> : ''}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class Select2 extends React.Component {
    select = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            $(this.select.current).select2({ data: this.props.list }).val(this.props.selectedList).trigger('change');
            $(this.select.current).on('change', e => {
                const permission = [];
                for (let i = 0; i < e.target.selectedOptions.length; i++) {
                    permission.push(e.target.selectedOptions[i].value);
                }
                this.props.update(this.props.id, { permission });
            });
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.id != this.props.id) {
            $(this.select.current).select2({ data: this.props.list }).val(this.props.selectedList).trigger('change');
        }
    }

    render() {
        return (
            <select ref={this.select} className='select2-input' multiple={true} defaultValue={[]} style={{ 'width': '100%' }}>
                <optgroup label='Lựa chọn quyền' />
            </select>
        );
    }
}

class RolePage extends React.Component {
    roleModal = React.createRef();

    componentDidMount() {
        this.props.getRolePage();
        T.ready('/user/settings');
    }

    createRole = (e) => {
        e.preventDefault();
        this.roleModal.current.show(null);
    }

    editRole = (e, item) => {
        e.preventDefault();
        let isAdmin = this.props.system.user.roles.reduce((result, item) => result || item.name == 'admin', false);
        this.roleModal.current.show(item, isAdmin);
    }

    refreshSessionRole = (e, id) => {
        e.preventDefault();
        T.confirm('Cập nhật session', 'Bạn có chắc bạn muốn cập nhật session của vai trò này?', true, isConfirm =>
            isConfirm && this.props.UpdateSessionRole(id));
    };

    changeRoleActive = (item) => {
        this.props.updateRole(item.id, { active: item.active ? 0 : 1 }, () => this.props.getRolePage());
    }

    changeRoleDefault = (item) => {
        if (item.isDefault == 0) this.props.updateRole(item.id, { isDefault: 1 }, () => this.props.getRolePage());
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa vai trò', 'Bạn có chắc bạn muốn xóa vai trò này?', true, isConfirm =>
            isConfirm && this.props.deleteRole(item.id, () => this.props.getRolePage()));
    }

    render() {
        const permissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = permissions.includes('role:write'),
            permissionDelete = permissions.includes('role:delete');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.role && this.props.role.page ?
            this.props.role.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const permissionList = this.props.role && this.props.role.page ? this.props.role.page.permissionList : null;

        let table = <p>Không có vai trò!</p>;
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto' }}>Tên</th>
                            <th style={{ width: '100%', textAlign: 'center' }}>Quyền</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mặc định</th>
                            {permissionWrite || permissionDelete ? <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th> : ''}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    {permissionWrite ? <a href='#' onClick={e => this.editRole(e, item)} style={{ whiteSpace: 'nowrap' }}>{item.name}</a> : item.name}
                                </td>
                                <td style={{ padding: 6 }}>
                                    {permissionWrite && item.name != 'admin' ?
                                        <Select2 key={index} list={permissionList} selectedList={item.permission} id={item.id} update={this.props.updateRole} /> :
                                        permissionList.toString().replaceAll(',', ', ')}
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => permissionWrite && item.name != 'admin' && this.changeRoleActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.isDefault} onChange={() => permissionWrite && this.changeRoleDefault(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                {permissionWrite || permissionDelete ?
                                    <td>
                                        <div className='btn-group'>
                                            {permissionWrite ?
                                                <a className='btn btn-warning' href='#' onClick={e => this.refreshSessionRole(e, item.id)}>
                                                    <i className='fa fa-lg fa-refresh' />
                                                </a> : ''}
                                            {permissionWrite ?
                                                <a className='btn btn-primary' href='#' onClick={e => this.editRole(e, item)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a> : ''}
                                            {permissionDelete && item.name != 'admin' ?
                                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </a> : ''}
                                        </div>
                                    </td> : ''}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-users' /> Vai trò</h1>
                </div>
                <div className='tile'>{table}</div>
                <Pagination name='adminRole' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getRolePage} />
                {permissionWrite ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.createRole}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}

                <RoleModal ref={this.roleModal} permissionList={permissionList}
                    updateRole={this.props.updateRole} getPage={this.props.getRolePage} createRole={this.props.createRole} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, role: state.role });
const mapActionsToProps = { getRolePage, createRole, updateRole, deleteRole, UpdateSessionRole };
export default connect(mapStateToProps, mapActionsToProps)(RolePage);
