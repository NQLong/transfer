import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import xlsx from 'xlsx';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    createQtNckhStaff,
    updateQtNckhStaff, deleteQtNckhStaff,
    getQtNghienCuuKhoaHocGroupPage, getQtNghienCuuKhoaHocPage
}
    from './redux';

import { DateInput } from 'view/component/Input';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
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
            this.maCanBo.value(shcc);
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

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = this.maCanBo.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        if (list_ma.length == 0) {
            T.notify('Cán bộ thực hiện đề tài, dự án trống', 'danger');
            this.maCanBo.focus();
        } else if (!this.tenDeTai.value()) {
            T.notify('Tên đề tài, dự án trống', 'danger');
            this.tenDeTai.focus();
        } else if (!this.maSoCapQuanLy.value()) {
            T.notify('Mã số cấp quản lý trống', 'danger');
            this.maSoCapQuanLy.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu trống', 'danger');
            this.batDau.focus();
        } else if (!this.vaiTro.value()) {
            T.notify('Vai trò bị trống!', 'danger');
            this.vaiTro.focus();
        } else {
            list_ma.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
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
                if (index == list_ma.length - 1) {
                    this.state.id ? this.props.update(this.state.id, changes, this.hide, false) : this.props.create(changes, this.hide, false);
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes, null, false) : this.props.create(changes, null, false);
                }
            });
        }
    }

    render = () => {
        const readOnly = this.state.id ? true : this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin nghiên cứu khoa học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
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

class QtNghienCuuKhoaHoc extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromYear?.value('');
                this.toYear?.value('');
                this.loaiHocVi?.value('');
                this.maDonVi?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
                this.props.getQtNghienCuuKhoaHocGroupPage();
            } else {
                this.props.getQtNghienCuuKhoaHocPage();
            }
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page ? this.props.qtNghienCuuKhoaHoc.page : { pageNumber: 1, pageSize: 50 };
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const loaiHocVi = this.loaiHocVi?.value() == '' ? '' : this.loaiHocVi?.value().toString();
        const maDonVi = this.maDonVi?.value().toString() || '';
        const pageFilter = isInitial ? null : { maDonVi, fromYear, toYear, loaiHocVi };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.loaiHocVi?.value(filter.loaiHocVi || '');
                    this.maDonVi?.value(filter.maDonVi);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.loaiCt || filter.maDonVi)) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtNghienCuuKhoaHocGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtNghienCuuKhoaHocPage(pageN, pageS, pageC, this.state.filter, done);

    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (text, i, j) => {
        let deTais = text.split('??').map(str => <p key={i--} style={{ textTransform: 'uppercase' }}>{j - i}. {str}</p>);
        return deTais;
    }

    delete = (e, item) => {
        T.confirm('Xóa nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa nghiên cứu khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNckhStaff(item.id, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá nghiên cứu khoa học bị lỗi!', 'danger');
                else T.alert('Xoá nghiên cứu khoa học thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghienCuuKhoaHoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page_gr ?
                this.props.qtNghienCuuKhoaHoc.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page ? this.props.qtNghienCuuKhoaHoc.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Tổng đề tài, dự án</th>}
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>{!this.checked ? 'Tên đề tài, dự án' : 'Đề tài, dự án đã thực hiện'}</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mã số và cấp quản lý</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian thực hiện</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />

                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {!this.checked ? <span><a href='#' onClick={() => this.modal.show(item, false)}>{(item.hoCanBo ? item.hoCanBo : '' )+ ' ' + (item.tenCanBo ? item.tenCanBo : '')}</a><br /></span> :
                                <span style={{ color: 'blue' }}>{(item.hoCanBo ? item.hoCanBo : '' )+ ' ' + (item.tenCanBo ? item.tenCanBo : '')}<br/></span>}
                                {item.shcc + (item.hocViCanBo ? ' - ' + item.hocViCanBo : '')}<br />

                            </>
                        )}
                        />
                        {this.checked && <TableCell type='text' style={{ textAlign: 'right' }} content={item.soDeTai} />}
                        <TableCell type='text' content={
                            !this.checked ? <>
                                <p style={{ textAlign: 'justify', textTransform: 'uppercase' }}><i>{item.tenDeTai}</i></p>
                                {item.vaiTro ? <span style={{ whiteSpace: 'nowrap' }}>Vai trò: <span style={{ color: 'blue' }}>{item.vaiTro}</span></span> : null}
                            </> : <>
                                {this.list(item.danhSachDeTai, item.soDeTai, item.soDeTai)}
                            </>
                        }
                        />
                        {!this.checked && <TableCell type='text' content={item.maSoCapQuanLy} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ngayNghiemThu ? <span style={{ whiteSpace: 'nowrap' }}>Nghiệm thu: <span style={{ color: 'blue' }}>{item.ngayNghiemThu ? T.dateToText(item.ngayNghiemThu, item.ngayNghiemThuType ? item.ngayNghiemThuType : 'dd/mm/yyyy') : ''}</span></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked && <TableCell type='text' content={item.kinhPhi} />}
                        {!this.checked && <TableCell type='text' content={item.ketQua} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/nghien-cuu-khoa-hoc/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-wpexplorer',
            title: 'Quá trình nghiên cứu khoa học',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình nghiên cứu khoa học'
            ],
            advanceSearch: <>
                <div className='row'>
                    {!this.checked ? <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian (nghiệm thu)' onChange={() => this.changeAdvancedSearch()} /> : null}
                    {!this.checked ? <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian (nghiệm thu)' onChange={() => this.changeAdvancedSearch()} /> : null}
                    <FormSelect ref={e => this.loaiHocVi = e} label='Loại học vị' className='col-12 col-md-4' data={[
                        { id: '04', text: 'Cử nhân' },
                        { id: '03', text: 'Thạc sĩ' },
                        { id: '02', text: 'Tiến sĩ' },
                    ]} onChange={() => this.changeAdvancedSearch()} multiple={true} allowClear={true} />
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    create={this.props.createQtNckhStaff} update={this.props.updateQtNckhStaff}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onExport: () => xlsx.writeFile(xlsx.utils.table_to_book(document.querySelector('.table')), this.constructor.name + '.xlsx')
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghienCuuKhoaHoc: state.qtNghienCuuKhoaHoc });
const mapActionsToProps = {
    createQtNckhStaff, updateQtNckhStaff, deleteQtNckhStaff,
    getQtNghienCuuKhoaHocGroupPage, getQtNghienCuuKhoaHocPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghienCuuKhoaHoc);