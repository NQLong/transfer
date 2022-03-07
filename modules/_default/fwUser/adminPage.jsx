import React from 'react';
import { connect } from 'react-redux';
import { getUserPage, createUser, updateUser, deleteUser, changeUser } from './reduxUser';
import { getRoleAll } from '../fwRole/redux';
import Pagination from 'view/component/Pagination';
import { AdminModal, AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { ModalContent } from './userModelEdit';

class UserModal extends AdminModal {
    state = { create: false }

    componentDidMount() {
        T.ready(() => this.onShown(() => this.modalContent.email.focus()));
    }

    onShow = (item) => {
        this.setState({ create: item == null });
        this.modalContent.setVal(item);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = this.modalContent.getValue();
        this.state.create ? this.props.createUser(data, this.hide) : this.props.updateUser(data.email, data, this.hide);
    }
    render = () => {
        return this.renderModal({
            title: 'Thông tin người dùng',
            size: 'large',
            body: <div className='rows'>
                <ModalContent ref={e => this.modalContent = e} allRoles={this.props.allRoles} changeUser={this.props.changeUser} />
            </div>
        });
    }

}

class UserPage extends AdminPage {
    roleMapper = {};
    componentDidMount() {
        this.props.getRoleAll(items => items && items.forEach(role => this.roleMapper[role.id] = role.name));
        T.ready('/user/settings', () => {
            T.onSearch = (searchText) => this.props.getUserPage(undefined, undefined, searchText);
            T.showSearchBox();
        });
        this.props.getUserPage();
    }

    edit = (e, item) => {
        e.preventDefault();
        this.userModal.show(item);
    };

    editRoles = (e, item) => {
        e.preventDefault();
        this.rolesModal.show(item);
    };

    changeActive = item => this.props.updateUser(item.email, { active: item.active ? 0 : 1 })

    delete = (e, item) => {
        e.preventDefault();
        console.log(item);
        T.confirm('Người dùng: Xóa người dùng', 'Bạn có chắc bạn muốn xóa người dùng này?', true, isConfirm =>
            isConfirm && this.props.deleteUser(item.email));
    };

    render() {
        const permission = this.getUserPermission('user');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.user && this.props.user.page ?
            this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: null };
        const allRoles = this.props.role && this.props.role.items ? this.props.role.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            emptyTable: 'Không có người dùng!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Email</th>
                    <th style={{ width: '50%' }}>Họ tên</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Vai trò</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={e => this.edit(e, item)} content={<>
                        {item.email}
                        {item.isStaff || item.isStudent ? <><br />{item.isStaff ? <span> Cán bộ</span> : null}{item.isStudent ? <span> Sinh viên</span> : null}</> : null}
                    </>} />
                    <TableCell content={item.lastName + ' ' + item.firstName} />
                    <TableCell type='image' content={item.image ? item.image : '/img/avatar.png'} />
                    <TableCell content={item.roles ?
                        item.roles.map(roleId => <label style={{ whiteSpace: 'nowrap' }} key={roleId}> {this.roleMapper && this.roleMapper[roleId] ? this.roleMapper[roleId] : ''}</label>) :
                        '<nothing>'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={() => this.changeActive(item, index)} />
                    <TableCell type='buttons' permission={{ write: permission.write, delete: permission.delete && !item.default }} content={item} onEdit={e => this.edit(e, item)} onDelete={this.delete}>
                        {!item.default && !item.email?.endsWith('@hcmussh.edu.vn') ? <a className='btn btn-info' href='#' onClick={e => this.changePassword(e, item)}><i className='fa fa-lg fa-key' /></a> : ''}
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            title: 'Người dùng',
            icon: 'fa fa-user',
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '65px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.props.getUserPage} />
                <UserModal ref={e => this.userModal = e} permissionWrite={permission.write} allRoles={allRoles} updateUser={this.props.updateUser} createUser={this.props.createUser} changeUser={this.props.changeUser} />
            </>,
            onCreate: permission && permission.write ? e => this.edit(e, null) : null,
            backRoute: '/user/settings'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division, user: state.user, role: state.role });
const mapActionsToProps = { getUserPage, createUser, updateUser, deleteUser, changeUser, getRoleAll };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
