import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtDaoTaoPage, getQtDaoTaoAll, updateQtDaoTao,
    deleteQtDaoTao, createQtDaoTao
} from './redux';
import { getStaffAll, SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class EditModal extends AdminModal {
    state = { id: null };
    componentDidMount() {
    }

    onShow = (item) => {
        let { shcc, tenTruong, chuyenNganh, batDau, ketThuc, hinhThuc, loaiBangCap, id,
        batDauType, ketThucType, thoiGian } = item ? item : {
            shcc: '', tenTruong: '', chuyenNganh: '', batDau: '', ketThuc: '', hinhThuc: '', loaiBangCap: '', id: '',
            batDauType: '', ketThucType: '', thoiGian: ''
            };
        this.setState({ id, item });
        this.shcc.value(shcc ? shcc : '');
        this.tenTruong.value(tenTruong ? tenTruong : '');
        this.chuyenNganh.value(chuyenNganh ? chuyenNganh : '');
        this.batDau.value(batDau ? batDau : '');
        this.ketThuc.value(ketThuc ? ketThuc : '');
        this.hinhThuc.value(hinhThuc ? hinhThuc : '');
        this.loaiBangCap.value(loaiBangCap ? loaiBangCap : '');
        this.batDauType.value(batDauType ? batDauType : '');
        this.ketThucType.value(ketThucType ? ketThucType : '');
        this.thoiGian.value(thoiGian ? thoiGian : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            tenTruong: this.tenTruong.value(),
            chuyenNganh: this.chuyenNganh.value(),
            batDau: Number(this.batDau.value()),
            ketThuc: Number(this.ketThuc.value()),
            hinhThuc: this.hinhThuc.value(),
            loaiBangCap: this.loaiBangCap.value(),
            batDauType: this.batDauType.value(),
            ketThucType: this.ketThucType.value(),
            thoiGian: Number(this.thoiGian.value()),
        };
        if (changes.shcc == '') {
            T.notify('Mã số cán bộ bị trống');
            this.shcc.focus();
        } else {
            this.state.id ? this.props.update(this.state.stt, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.stt ? 'Cập nhật quá trình đào tạo' : 'Tạo mới quá trình đào tạo',
            size: 'large',
            body: <div className='row'>
                <FormSelect type='text' className='col-md-6' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Mã thẻ cán bộ' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.tenTruong = e} label='Tên trường' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.chuyenNganh = e} label='Chuyên ngành' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.batDau = e} label='Thời gian bắt đầu' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' ref={e => this.ketThuc = e} label='Thời gian kết thúc' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.hinhThuc = e} label='Hình thức' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.loaiBangCap = e} label='Loại bằng cấp' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.batDauType = e} label='Loại bắt đầu' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.ketThucType = e} label='Loại kết thúc' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.thoiGian = e} label='Thời gian' readOnly={readOnly} />
            </div>
        });
    }
}

class QtDaoTao extends AdminPage {
    checked = true;

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                // if (this.checked) this.props.getQtDaoTaoGroupPage(undefined, undefined, searchText || ''); 
                this.props.getQtDaoTaoPage(undefined, undefined, searchText || '');
            };
            T.showSearchBox();
            this.props.getQtDaoTaoPage(undefined, undefined, '');
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    // groupPage = () => {
    //     this.checked = !this.checked;
    //     this.props.getQtDaoTaoGroupPage(undefined, undefined, '');
    // }

    delete = (e, item) => {
        T.confirm('Xóa quá trình đào tạo', 'Bạn có chắc bạn muốn xóa quá trình đào tạo này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDaoTao(item.stt, error => {
                if (error) T.notify(error.message ? error.message : `Xoá quá trình đào tạo ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá quá trình đào tạo ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtDaoTao', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = (this.props.qtDaoTao && this.props.qtDaoTao.page ? this.props.qtDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });

        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Tên trường</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Chuyên ngành</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Thời gian đào tạo</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Hình thức</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Loại bằng cấp</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {/* <span>{item.ho + ' ' + item.ten}</span><br /> */}
                                <a href='#' onClick={() => this.modal.show(item)}>{item.shcc}</a>
                            </>
                        )}
                        />
                        <TableCell type='text' style={{}} content={item.tenTruong} />
                        <TableCell type='text' style={{}} content={item.chuyenNganh} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ: <span style={{ color: 'blue' }}>{item.batDau ? new Date(item.batDau).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến: <span style={{ color: 'blue' }}>{item.ketThuc ? new Date(item.ketThuc).ddmmyyyy() : ''}</span></span><br />
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.hinhThuc} />
                        <TableCell type='text' content={item.loaiBangCap} />
                        {
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} > </TableCell>
                        }
                        {/* {
                            // this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nghi-thai-san/group/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        } */}
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Quá trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình đào tạo'
            ],
            content: <>
                <div className='tile'>
                    {/* <FormCheckbox label='Hiển thị theo cán bộ' onChange={this.groupPage} /> */}
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtDaoTaoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtDaoTao} update={this.props.updateQtDaoTao}
                    getDonVi={this.props.getDmDonViAll} permissions={currentPermissions}
                    getChucVu={this.props.getDmChucVuAll}
                    getStaff={this.props.getStaffAll} />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDaoTao: state.qtDaoTao });
const mapActionsToProps = {
    getQtDaoTaoAll, getQtDaoTaoPage, deleteQtDaoTao, createQtDaoTao,
    updateQtDaoTao, getStaffAll
};
export default connect(mapStateToProps, mapActionsToProps)(QtDaoTao);