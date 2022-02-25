import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtNghienCuuKhoaHocPage, createQtNckhStaffGroup, updateQtNckhStaffGroup, deleteQtNckhStaffGroup
}
    from './redux';

import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import Dropdown from 'view/component/Dropdown';

const EnumDateType = Object.freeze({
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' },
}), typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};
class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        ngayNghiemThuType: 'dd/mm/yyyy',
    }

    multiple = false;

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, shcc, batDauType, ketThucType, batDau, ketThuc, tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, ngayNghiemThuType, thoiGian }
            = item ? item :
                {
                    id: null, shcc: '', batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenDeTai: '',
                    maSoCapQuanLy: '', kinhPhi: '', vaiTro: '', ngayNghiemThu: null, ketQua: '', ngayNghiemThuType: 'dd/mm/yyyy', thoiGian: null
                };
        this.setState({
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThuc ? ketThucType : 'dd/mm/yyyy',
            ngayNghiemThuType: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy',
            id, batDau, ketThuc, ngayNghiemThu
        });
        setTimeout(() => {
            this.maCanBo.value(shcc ? shcc : this.props.shcc);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.ngayNghiemThuType.setText({ text: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau ? batDau : '');
            this.ketThuc.setVal(ketThuc ? ketThuc : '');
            this.tenDeTai.value(tenDeTai);
            this.maSoCapQuanLy.value(maSoCapQuanLy ? maSoCapQuanLy : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
            this.thoiGian.value(thoiGian);
            this.vaiTro.value(vaiTro ? vaiTro : '');
            this.ngayNghiemThu.setVal(ngayNghiemThu ? ngayNghiemThu : '');
            this.ketQua.value(ketQua ? ketQua : '');
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.maCanBo.value(),
            batDau: this.batDau.getVal(),
            ketThuc: this.ketThuc.getVal(),
            batDauType: this.state.batDauType,
            ketThucType: this.state.ketThucType,
            tenDeTai: this.tenDeTai.value(),
            maSoCapQuanLy: this.maSoCapQuanLy.value(),
            kinhPhi: this.kinhPhi.value(),
            thoiGian: this.thoiGian.value(),
            vaiTro: this.vaiTro.value(),
            ketQua: this.ketQua.value(),
            ngayNghiemThu: this.ngayNghiemThu.getVal(),
            ngayNghiemThuType: this.state.ngayNghiemThuType,
        };
        if (!changes.tenDeTai) {
            T.notify('Tên đề tài bị trống!', 'danger');
            this.tenDeTai.focus();
        } else if (!changes.maSoCapQuanLy) {
            T.notify('Mã số và cấp quản lý bị trống!', 'danger');
            this.maSoCapQuanLy.focus();
        }
        else if (!changes.batDau) {
            T.notify('Thời gian bắt đầu bị trống!', 'danger');
            this.batDau.focus();
        }
        else if (!changes.vaiTro) {
            T.notify('Vai trò bị trống!', 'danger');
            this.vaiTro.focus();
        }
        else this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);

    }

    render = () => {
        return this.renderModal({
            title: 'Thông tin nghiên cứu khoa học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormRichTextBox className='col-12' ref={e => this.tenDeTai = e} label={'Tên đề tài'} type='text' required />
                <FormRichTextBox className='col-md-12' ref={e => this.maSoCapQuanLy = e} label={'Mã số và cấp quản lý'} type='text' required />
                <FormTextBox className='col-md-6' ref={e => this.thoiGian = e} label={'Thời gian thực hiện (tháng)'} type='number' />
                <FormTextBox className='col-md-6' ref={e => this.kinhPhi = e} label={'Kinh phí'} type='text' />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                <FormTextBox className='col-md-6' ref={e => this.vaiTro = e} label={'Vai trò'} type='text' required />
                <div className='form-group col-md-6'><DateInput ref={e => this.ngayNghiemThu = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian nghiệm thu (định dạng:&nbsp; <Dropdown ref={e => this.ngayNghiemThuType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayNghiemThuType: item })} />)</div>
                    }
                    type={this.state.ngayNghiemThuType ? typeMapper[this.state.ngayNghiemThuType] : null} /></div>
                <FormTextBox className='col-md-12' ref={e => this.ketQua = e} label={'Kết quả'} type='text' />

            </div>,
        });
    }
}

class QtNghienCuuKhoaHocGroupPage extends AdminPage {
    state = { shcc: '' };
    componentDidMount() {
        T.ready('/user/khcn', () => {
            const route = T.routeMatcher('/user/khcn/qua-trinh/nghien-cuu-khoa-hoc/group/:shcc'),
                shcc = route.parse(window.location.pathname);
            T.onSearch = (searchText) => {
                this.props.getQtNghienCuuKhoaHocPage(undefined, undefined, searchText || '', shcc.shcc);
            };
            T.showSearchBox();
            this.setState({ shcc: shcc.shcc });
            this.props.getQtNghienCuuKhoaHocPage(undefined, undefined, shcc.shcc, () => {
                T.updatePage('pageQtNghienCuuKhoaHoc', undefined, undefined, '');
            });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa nghiên cứu khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNckhStaffGroup(item.id, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá nghiên cứu khoa học bị lỗi!', 'danger');
                else T.alert('Xoá nghiên cứu khoa học thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghienCuuKhoaHoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page ? this.props.qtNghienCuuKhoaHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Tên đề tài, dự án</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số và cấp quản lý</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thực hiện</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <a href='#' onClick={e => { e.preventDefault(); this.modal.show(item, false); }}>
                                    <span>{(item.hoCanBo ? item.hoCanBo : '') + ' ' + (item.tenCanBo ? item.tenCanBo : '')}</span><br />
                                    {item.shcc}</a>
                            </>
                        )}
                        />
                        <TableCell type='text' content={
                            <>
                                <span><i style={{ textAlign: 'justify' }}>{item.tenDeTai}</i></span><br /><br />
                                {item.vaiTro ? <span style={{ whiteSpace: 'nowrap' }}>Vai trò: <span style={{ color: 'blue' }}>{item.vaiTro}</span></span> : null}
                            </>
                        } />
                        <TableCell type='text' content={item.maSoCapQuanLy} />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ngayNghiemThu ? <span style={{ whiteSpace: 'nowrap' }}>Nghiệm thu: <span style={{ color: 'blue' }}>{item.ngayNghiemThu ? T.dateToText(item.ngayNghiemThu, item.ngayNghiemThuType ? item.ngayNghiemThuType : 'dd/mm/yyyy') : ''}</span></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.kinhPhi} />
                        <TableCell type='text' content={item.ketQua} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-wpexplorer',
            title: 'Quá trình nghiên cứu khoa học - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/khcn'>Khoa học công nghệ</Link>,
                <Link key={1} to='/user/khcn/qua-trinh/nghien-cuu-khoa-hoc'>Quá trình nghiên cứu khoa học</Link>,
                'Quá trình nghiên cứu khoa học - Cán bộ'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtNghienCuuKhoaHocPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions} shcc={this.state.shcc}
                    create={this.props.createQtNckhStaffGroup}
                    update={this.props.updateQtNckhStaffGroup}
                />
            </>,
            backRoute: '/user/khcn/qua-trinh/nghien-cuu-khoa-hoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghienCuuKhoaHoc: state.khcn.qtNghienCuuKhoaHoc });
const mapActionsToProps = {
    getQtNghienCuuKhoaHocPage, createQtNckhStaffGroup, updateQtNckhStaffGroup, deleteQtNckhStaffGroup
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghienCuuKhoaHocGroupPage);