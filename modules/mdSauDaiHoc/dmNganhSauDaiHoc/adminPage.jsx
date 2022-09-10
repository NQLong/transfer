import React from 'react';
import { connect } from 'react-redux';
import { createDmNganhSdh, getDmNganhSdhPage, updateDmNganhSdh, deleteDmNganhSdh } from './redux';
import { SelectAdapter_DmDonViFaculty_V2, getDmDonViFaculty } from 'modules/mdDanhMuc/dmDonVi/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormSelect } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        const { maNganh, ten, ghiChu, kichHoat, maKhoa } = item ? item : { maNganh: null, ten: '', ghiChu: '', kichHoat: true, maKhoa: '' };
        this.setState({ ma: maNganh, item });
        this.ma.value(maNganh);
        this.ten.value(ten);
        this.ghiChu.value(ghiChu ? ghiChu : '');
        this.kichHoat.value(kichHoat);
        this.khoaSdh.value(maKhoa);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maNganh: this.ma.value(),
            ten: this.ten.value(),
            ghiChu: this.ghiChu.value(),
            kichHoat: this.kichHoat.value() ? 1 : 0,
            maKhoa: this.khoaSdh.value(),
        };
        if (changes.ma == '') {
            T.notify('Mã ngành sau đại học bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên ngành sau đại học bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    changeKichHoat = value => this.kichHoat.value(value ? 1 : 0) || this.kichHoat.value(value);

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật ngành sau đại học' : 'Tạo mới ngành sau đại học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-6' ref={e => this.ma = e} label='Mã ngành'
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true}
                    readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={value => this.changeKichHoat(value ? 1 : 0)} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.ten = e} label='Tên ngành'
                    readOnly={readOnly} required />
                <FormSelect ref={e => this.khoaSdh = e} className='col-md-6' data={SelectAdapter_DmDonViFaculty_V2} label='Khoa sau đại học' readOnly={readOnly} />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class DmNganhSdhPage extends AdminPage {
    state = { dmKhoaSdh: {} };
    componentDidMount() {
        T.ready('/user/sau-dai-hoc/danh-sach-nganh', () => {
            T.onSearch = (searchText) => this.props.getDmNganhSdhPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmNganhSdhPage();
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

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục ngành sau đại học', 'Bạn có chắc bạn muốn xóa ngành này?', true, isConfirm =>
            isConfirm && this.props.deleteDmNganhSdh(item.maNganh));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('dmNganhSdh', ['read', 'write', 'delete']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmNganhSdh && this.props.dmNganhSdh.page ?
            this.props.dmNganhSdh.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        let table = 'Không có danh sách ngành sau đại học!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>STT</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã ngành</th>
                        <th style={{ width: '50%' }}>Tên ngành</th>
                        <th style={{ width: '50%' }}>Khoa</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' style={{ textAlign: 'right' }} content={item.maNganh ? item.maNganh : ''}
                            onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.ten ? item.ten : ''} />
                        <TableCell type='text' content={item.maKhoa ? this.state.dmKhoaSdh[item.maKhoa] : ''} />
                        <TableCell type='checkbox' style={{ textAlign: 'center' }} content={item.kichHoat} permission={permission}
                            onChanged={value => this.props.updateDmNganhSdh(item.maNganh, { kichHoat: Number(value) })} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục ngành sau đại học',
            breadcrumb: [
                'Danh mục ngành sau đại học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDmNganhSdhPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createDmNganhSdh} update={this.props.updateDmNganhSdh} permissions={currentPermissions} />
            </>,
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onImport: permission && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/sau-dai-hoc/danh-sach-nganh/upload') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmNganhSdh: state.sdh.dmNganhSdh });
const mapActionsToProps = { createDmNganhSdh, getDmNganhSdhPage, updateDmNganhSdh, deleteDmNganhSdh, getDmDonViFaculty };
export default connect(mapStateToProps, mapActionsToProps)(DmNganhSdhPage);