import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, renderTable, TableCell, FormTextBox, FormImageBox, FormCheckbox, FormSelect, getValue } from 'view/component/AdminPage';
import { getDnUserDoanhNghiepPage, createUserDoanhNghiep, updateUserDoanhNghiep, deleteUserDoanhNghiep, SelectAdapter_DnDoanhNghiep } from './reduxDoanhNghiep';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';

class EditModal extends AdminModal {
    state = { email: '' };

    componentDidMount() {
        this.onShown(() => {
            this.lastName.focus();
        });
    }

    onShow = item => {
        if (item) {
            const { lastName = '', firstName = '', email = '', image = '/img/avatar.png', active = 0, companies = [] } = item;
            this.lastName.value(lastName);
            this.firstName.value(firstName);
            this.email.value(email);
            this.active.value(active);
            this.companies.value(companies.map(company => ({ id: company.id, text: company.tenDayDu.viText() })));
            this.image.setData('dnDoanhNghiep:' + item.email, image);
            this.setState({ email });
        } else {
            this.lastName.value('');
            this.firstName.value('');
            this.email.value('');
            this.active.value(false);
            this.companies.value(null);
            this.image.setData('', '');
            this.setState({ email: '' });
        }
    }

    onSubmit = () => {
        const changes = {
            email: getValue(this.email),
            lastName: getValue(this.lastName),
            firstName: getValue(this.firstName),
            active: Number(getValue(this.active))
        };
        let companies = getValue(this.companies);
        if (companies.length == 0) companies = 'empty';
        if (this.state.email) {
            this.props.update(this.state.email, changes, companies, () => {
                T.notify('Cập nhật người dùng thành công!', 'success');
                this.hide();
            });
        } else {
            this.props.create(changes, companies, () => {
                this.hide();
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin người đại diện',
            size: 'large',
            body: <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.lastName = e} label='Họ và tên lót' readOnly={readOnly} required />
                    <FormTextBox ref={e => this.firstName = e} label='Tên' readOnly={readOnly} required />
                    <FormTextBox ref={e => this.email = e} label='Email' readOnly={readOnly} required />
                </div>
                <div className='col-md-4'>
                    <FormImageBox ref={e => this.image = e} style={{ visibility: this.state.email ? '' : 'hidden' }} uploadType='NguoiDaiDienImage' />
                    <FormCheckbox ref={e => this.active = e} label='Kích hoạt' readOnly={readOnly} />
                </div>
                <FormSelect ref={e => this.companies = e} className='col-md-12' data={SelectAdapter_DnDoanhNghiep} label='Doanh nghiệp đại diện' required multiple readOnly={readOnly} />
            </div>
        });
    }
}

class PasswordModal extends AdminModal {
    state = { email: '' };

    onShow = (item) => {
        this.setState({ email: item?.email });
    }

    onSubmit = () => {
        const password = getValue(this.password), retypePassword = getValue(this.retypePassword);
        if (password == retypePassword) {
            this.props.update(this.state.email, { password }, null, () => {
                T.notify('Thay đổi mật khẩu thành công!', 'success');
                this.hide();
            });
        } else {
            T.notify('Mật khẩu được nhập lại không trùng với mật khẩu mới', 'danger');
            this.retypePassword.focus();
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Cập nhật mật khẩu',
            body: <>
                <FormTextBox ref={e => this.password = e} type='password' label='Mật khẩu mới' required />
                <FormTextBox ref={e => this.retypePassword = e} type='password' label='Nhập lại mật khẩu' required />
            </>
        });
    }
}

class AdminDaiDienDoanhNghiepPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/ero', () => {
            T.onSearch = (searchText) => this.props.getDnUserDoanhNghiepPage(undefined, undefined, searchText);
            T.showSearchBox();
            this.props.getDnUserDoanhNghiepPage(undefined, undefined, undefined, page => {
                if (page.pageCondition) T.setTextSearchBox(page.pageCondition);
            });
        });
    }

    renderCompanies = (item) => {
        const companies = item.companies || [];
        const elements = [];
        for (const company of companies) {
            elements.push(<Link key={item.email + '_' + company.id} to={'/user/ero/doanh-nghiep/edit/' + company.id}>{company.tenDayDu.viText().toString()}</Link>);
            elements.push(<br key={item.email + '_' + elements.length} />);
        }
        return elements.slice(0, elements.length - 1);
    }

    removeUser = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa người đại diện', 'Bạn có chắc muốn xóa người đại diện này?', 'info', isConfirm => isConfirm && this.props.deleteUserDoanhNghiep(item.email));
    }

    render() {
        const permission = this.getUserPermission('dnDoanhNghiep');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.doanhNghiep && this.props.doanhNghiep.userDoanhNghiepPage ?
            this.props.doanhNghiep.userDoanhNghiepPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: null };

        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có người đại diện',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Họ và tên</th>
                    <th style={{ width: '55%', textAlign: 'center' }} nowrap='true'>Doanh nghiệp đại diện</th>
                    <th style={{ width: '15%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={Math.max(pageNumber - 1, 0) * pageSize + index + 1} />
                    <TableCell type='link' onClick={e => e.preventDefault() || this.modal.show(item)} content={<>
                        {item.lastName} {item.firstName}<br />
                        {item.email}
                    </>} />
                    <TableCell content={this.renderCompanies(item)} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateUserDoanhNghiep(item.email, { active })} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.removeUser}>
                        {permission.write && <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || this.passwordModal.show(item)}><i className='fa fa-lg fa-key' /></a>}
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Người đại diện doanh nghiệp',
            breadcrumb: [<Link to='/user/ero' key={0}> Đối ngoại</Link>, 'Người đại diện doanh nghiệp'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDnUserDoanhNghiepPage} />
                <EditModal ref={e => this.modal = e} create={this.props.createUserDoanhNghiep} update={this.props.updateUserDoanhNghiep} />
                <PasswordModal ref={e => this.passwordModal = e} update={this.props.updateUserDoanhNghiep} />
            </>,
            backRoute: '/user/ero',
            onCreate: () => this.modal.show()
        });
    }
}

const mapStateToProps = state => ({ system: state.system, doanhNghiep: state.doiNgoai.doanhNghiep });
const mapActionsToProps = { getDnUserDoanhNghiepPage, createUserDoanhNghiep, updateUserDoanhNghiep, deleteUserDoanhNghiep };
export default connect(mapStateToProps, mapActionsToProps)(AdminDaiDienDoanhNghiepPage);