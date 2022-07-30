import React from 'react';
import { connect } from 'react-redux';
import { createDmMonHocSdh, getDmMonHocSdhPage, updateDmMonHocSdh, deleteDmMonHocSdh } from './redux';
import { SelectAdapter_DmDonViFaculty_V2, getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { maNganh, tenTiengViet, tenTiengAnh, kichHoat, tcLyThuyet, tcThucHanh, khoaSdh } = item ? item : { maNganh: null, tenTiengViet: '', tenTiengAnh: '', tcLyThuyet: '', tcThucHanh: '', kichHoat: true, khoaSdh: '' };
        this.setState({ ma: maNganh, item });
        this.ma.value(maNganh);
        this.tenTiengViet.value(tenTiengViet);
        this.tenTiengAnh.value(tenTiengAnh);
        this.tcLyThuyet.value(tcLyThuyet);
        this.tcThucHanh.value(tcThucHanh);
        this.kichHoat.value(kichHoat);
        this.khoaSdh.value(khoaSdh);
    }

    onSubmit = (e) => {
        const changes = {
            ma: this.ma.value(),
            tenTiengViet: this.tenTiengViet.value(),
            tenTiengAnh: this.tenTiengAnh.value(),
            tcLyThuyet: this.tcLyThuyet.value(),
            tcThucHanh: this.tcThucHanh.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            khoaSdh: this.khoaSdh.value()
        };
        if (changes.ma == '') {
            T.notify('Mã môn học sau đại học bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên môn học sau đại học bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật môn học sau đại học' : 'Tạo mới môn học sau đại học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.ma = e} label='Mã môn học'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-12' ref={e => this.tenTiengViet = e} label='Tên tiếng Việt' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenTiengAnh = e} label='Tên tiếng Anh' readOnly={readOnly} />
                <FormTextBox type='number' className='col-md-3' ref={e => this.tcLyThuyet = e} label='Tín chỉ lý thuyết' min={1} max={99} readOnly={readOnly} />
                <FormTextBox type='number' className='col-md-3' ref={e => this.tcThucHanh = e} label='Tín chỉ thực hành' min={1} max={99} readOnly={readOnly} />
                <FormSelect ref={e => this.khoaSdh = e} className='col-md-6' data={SelectAdapter_DmDonViFaculty_V2} label='Khoa sau đại học' readOnly={readOnly} />
            </div>
        });
    }
}

class DmMonHocSdhPage extends AdminPage {
    state = { dmKhoaSdh: {} };
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmMonHocSdhPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmMonHocSdhPage();
            this.props.getDmDonViFaculty(items => {
                let dmKhoaSdh = {};
                items.forEach(item => dmKhoaSdh[item.ma] = item.ten);
                this.setState({ dmKhoaSdh });
            });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeActive = item => this.props.updateDmMonHocSdh(item.ma, { kichHoat: item.kichHoat });
 
    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục môn học sau đại học', 'Bạn có chắc bạn muốn xóa môn học này?', true, isConfirm =>
            isConfirm && this.props.deleteDmMonHocSdh(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmMonHocSdh', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmMonHocSdh && this.props.dmMonHocSdh.page ?
            this.props.dmMonHocSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách môn học sau đại học!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                        <th style={{ width: '50%' }} nowrap='true'>Tên tiếng Việt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Tên tiếng Anh</th>
                        <th style={{ width: 'auto' }} nowrap='true'>TC Lý thuyết</th>
                        <th style={{ width: 'auto' }} nowrap='true'>TC Thực hành</th>
                        <th style={{ width: '50%', textAlign: 'center' }}>Khoa</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' style={{ textAlign: 'right' }} content={item.ma ? item.ma : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.tenTiengViet ? item.tenTiengViet : ''} />
                        <TableCell type='text' content={item.tenTiengAnh ? item.tenTiengAnh : ''} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.tcLyThuyet ? item.tcLyThuyet : ''} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.tcThucHanh ? item.tcThucHanh : ''} />
                        <TableCell type='text' content={item.khoaSdh ? this.state.dmKhoaSdh[item.khoaSdh] : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={() => this.changeActive(item)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục môn học sau đại học',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục môn học sau đại học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmMonHocSdhPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmMonHocSdh} update={this.props.updateDmMonHocSdh} permissions={currentPermissions} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/danh-muc/mon-hoc-sdh/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmMonHocSdh: state.danhMuc.dmMonHocSdh });
const mapActionsToProps = { createDmMonHocSdh, getDmMonHocSdhPage, updateDmMonHocSdh, deleteDmMonHocSdh, getDmDonViFaculty };
export default connect(mapStateToProps, mapActionsToProps)(DmMonHocSdhPage);