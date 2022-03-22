import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, AdminModal, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox, FormDatePicker, renderTable } from 'view/component/AdminPage';
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

    onShow = (data, multiple = false) => {
        this.multiple = multiple;
        let { id, shcc, batDauType, ketThucType, batDau, ketThuc,
            tenDeTai, maSoCapQuanLy, kinhPhi, vaiTro, ngayNghiemThu, ketQua, ngayNghiemThuType }
            = data ? data :
                {
                    id: null, shcc: shcc ? shcc : data.shcc, batDauType: 'dd/mm/yyyy', ketThucType: 'dd/mm/yyyy', batDau: null, ketThuc: null, tenDeTai: '',
                    maSoCapQuanLy: '', kinhPhi: '', vaiTro: '', ngayNghiemThu: null, ketQua: '', ngayNghiemThuType: 'dd/mm/yyyy', fileMinhChung: '[]'
                };
        this.setState({
            shcc: shcc,
            batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            ngayNghiemThuType: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy',
            id, batDau, ketThuc, ngayNghiemThu,
            denNay: ketThuc == -1 ? 1 : 0,
            nghiemThu: (ngayNghiemThu == -1 || ketThuc == -1) ? 1 : 0,
        }, () => {
            this.maCanBo.value(shcc ? shcc : '');
            this.tenDeTai.value(tenDeTai);
            this.maSo.value(maSoCapQuanLy);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            if (ngayNghiemThu != -1) {
                this.nghiemThuCheck.value(0);
                $('#done').show();
                this.ngayNghiemThu?.setVal(ngayNghiemThu ? ngayNghiemThu : '');
                this.ngayNghiemThuType?.setText({ text: ngayNghiemThuType ? ngayNghiemThuType : 'dd/mm/yyyy' });
            } else {
                this.nghiemThuCheck.value(1);
                $('#done').hide();

            }
            if (ketThuc != -1) {
                this.denNayCheck.value(0);

                $('#end').show();

                this.ketThucType?.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
                this.ketThuc?.setVal(ketThuc ? ketThuc : '');
            } else {
                this.denNayCheck.value(1);
                $('#end').hide();
                this.nghiemThuCheck.value(1);
                $('#done').hide();
            }
            this.batDau.setVal(batDau ? batDau : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
            this.vaiTro.value(vaiTro ? vaiTro : '');
            !this.state.nghiemThu && this.ketQua.value(ketQua ? ketQua : '');
            this.tenDeTai.focus();
        });
    }


    onSubmit = (e) => {
        e.preventDefault();
        let listMa = this.maCanBo.value();
        if (!Array.isArray(listMa)) {
            listMa = [listMa];
        }
        if (listMa.length == 0) {
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
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && !this.ngayNghiemThu.getVal()) {
            T.notify('Ngày nghiệm thu trống', 'danger');
            this.ngayNghiemThu.focus();
        } else if (!this.state.denNay && (this.batDau.getVal() && this.ketThuc.getVal()) && this.batDau.getVal() >= this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu phải nhỏ hơn kết thúc', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && (this.batDau.getVal() && this.ngayNghiemThu.getVal()) && this.batDau.getVal() >= this.ngayNghiemThu.getVal()) {
            T.notify('Ngày bắt đầu phải nhỏ hơn nghiệm thu', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && (this.ketThuc.getVal() && this.ngayNghiemThu.getVal()) && this.ketThuc.getVal() > this.ngayNghiemThu.getVal()) {
            T.notify('Ngày kết thúc lớn hơn ngày nghiệm thu', 'danger');
            this.ketThuc.focus();
        } else {
            listMa.forEach((ma, index) => {
                const changes = {
                    shcc: ma,
                    batDau: this.batDau.getVal(),
                    ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
                    batDauType: this.state.batDauType,
                    ketThucType: !this.state.denNay ? this.state.ketThucType : '',
                    tenDeTai: this.tenDeTai.value(),
                    maSoCapQuanLy: this.maSoCapQuanLy.value(),
                    kinhPhi: this.kinhPhi.value(),
                    vaiTro: this.vaiTro.value(),
                    ketQua: this.ketQua.value(),
                    ngayNghiemThu: !this.state.denNay ? this.ngayNghiemThu.getVal() : null,
                    ngayNghiemThuType: !this.state.denNay ? this.state.ngayNghiemThuType : '',
                };
                if (index == listMa.length - 1) {
                    if (this.state.id) {
                        this.props.update(this.state.id, changes, this.hide);
                    } else {
                        this.props.create(changes, this.hide);
                    }
                    this.setState({
                        id: ''
                    });
                    this.maCanBo.reset();
                }
                else {
                    this.state.id ? this.props.update(this.state.id, changes) : this.props.create(changes);
                }
            });
        }
    }

    handleKetThuc = (value) => {
        if (value) {
            $('#end').hide();
            this.handleNghiemThu(1);
            this.ketThucType?.setText({ text: '' });
        }
        else {
            $('#end').show();
            this.ketThucType?.setText({ text: this.state.ketThucType ? this.state.ketThucType : 'dd/mm/yyyy' });
            this.ketThuc.setVal(null);
        }
        this.setState({ denNay: value });
    }

    handleNghiemThu = (value) => {
        if (value) {
            this.ngayNghiemThuType?.setText({ text: '' });
            $('#done').hide();
            this.nghiemThuCheck.value(1);
        }
        else {
            $('#done').show();
            this.ngayNghiemThuType?.setText({ text: this.state.ngayNghiemThuType ? this.state.ngayNghiemThuType : 'dd/mm/yyyy' });
            this.ngayNghiemThu.setVal(null);
        }
        this.setState({ nghiemThu: value });
    }

    render = () => {
        const readOnly = this.state.id ? true : this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin nghiên cứu khoa học',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={readOnly} required />
                <FormRichTextBox className='col-12' ref={e => this.tenDeTai = e} label='Tên đề tài' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.maSo = e} label='Mã số và cấp quản lý' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.kinhPhi = e} label={'Kinh phí'} type='text' placeholder='Nhập kinh phí (triệu đồng' />

                <div className='form-group col-md-4'>Các mốc thời gian: </div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Chưa kết thúc' onChange={this.handleKetThuc} className='form-group col-md-4' />
                <FormCheckbox ref={e => this.nghiemThuCheck = e} label='Chưa nghiệm thu' onChange={this.handleNghiemThu} className='form-group col-md-4' />
                <div className='form-group col-md-4'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu &nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => { this.setState({ batDauType: item }); this.batDau.clear(); this.batDau.focus(); }} />&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                <div className='form-group col-md-4' id='end'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc &nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => { this.setState({ ketThucType: item }); this.ketThuc.clear(); this.ketThuc.focus(); }} />&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                <div className='form-group col-md-4' style={{ display: this.state.denNay ? 'block' : 'none' }} />
                <div className='form-group col-md-4' id='done'><DateInput ref={e => this.ngayNghiemThu = e} placeholder='Thời gian nghiệm thu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian nghiệm thu &nbsp; <Dropdown ref={e => this.ngayNghiemThuType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => { this.setState({ ngayNghiemThuType: item }); this.ngayNghiemThu.clear(); this.ngayNghiemThu.focus(); }} />&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayNghiemThuType ? typeMapper[this.state.ngayNghiemThuType] : null} /></div>
                <div className='form-group col-md-4' style={{ display: this.state.nghiemThu ? 'block' : 'none' }} />

                <FormSelect className='col-md-4' ref={e => this.vaiTro = e} label={'Vai trò'} data={[
                    { id: 'CN', text: 'Chủ nhiệm' }, { id: 'TG', text: 'Tham gia' }
                ]} type='text' required />
                {!this.state.nghiemThu && <FormTextBox className='col-md-4' ref={e => this.ketQua = e} label={'Kết quả'} type='text' />}
            </div>,
        });
    }
}

const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo thời gian bắt đầu' },
    { id: 2, text: 'Theo thời gian kết thúc' },
    { id: 3, text: 'Theo thời gian nghiệm thu' }
];

class QtNghienCuuKhoaHoc extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {} };
    menu = '';
    componentDidMount() {
        this.menu = T.routeMatcher('/user/:tccb/qua-trinh/nghien-cuu-khoa-hoc').parse(window.location.pathname).tccb;
        T.ready('/user/' + this.menu, () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.timeType?.value(0);
                this.fromYear?.value('');
                this.toYear?.value('');
                this.loaiHocVi?.value('');
                this.maDonVi?.value('');
                this.mulCanBo?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            if (this.checked) {
                this.hienThiTheoCanBo.value(true);
            }
            this.getPage();
            this.changeAdvancedSearch(true);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page ? this.props.qtNghienCuuKhoaHoc.page : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const loaiHocVi = this.loaiHocVi?.value() == '' ? '' : this.loaiHocVi?.value().toString();
        const maDonVi = this.maDonVi?.value().toString() || '';
        const maSoCanBo = this.mulCanBo?.value().toString() || '';
        const pageFilter = isInitial ? null : { maDonVi, fromYear, toYear, loaiHocVi, maSoCanBo, timeType };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.timeType?.value(filter.timeType);
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.loaiHocVi?.value(filter.loaiHocVi || '');
                    this.maDonVi?.value(filter.maDonVi);
                    this.mulCanBo?.value(filter.maSoCanBo);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.loaiHocVi || filter.maDonVi || filter.timeType || filter.maSoCanBo)) {
                        this.showAdvanceSearch();
                        window.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }
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
        if (i == 0) return [];
        let deTais = text.split('??').map(str => <div key={i--} style={{}}>{j - i}. {str}</div>);
        return deTais;
    }

    delete = (e, item) => {
        T.confirm('Xóa nghiên cứu khoa học', 'Bạn có chắc bạn muốn xóa nghiên cứu khoa học này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNckhStaff(item.id, null);
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtNghienCuuKhoaHoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.pageGr ?
                this.props.qtNghienCuuKhoaHoc.pageGr : { pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtNghienCuuKhoaHoc && this.props.qtNghienCuuKhoaHoc.page ? this.props.qtNghienCuuKhoaHoc.page : { pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        {this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng đề tài</th>}
                        {this.checked && <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Danh sách</th>}
                        {!this.checked && <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Đề tài nghiên cứu khoa học</th>}
                        {!this.checked && <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Mã số và cấp quản lý</th>}
                        {!this.checked && <th style={{ width: '20%', whiteSpace: 'nowrap' }}>Thời gian thực hiện</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Kinh phí <br /><small>(triệu đồng)</small></th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Vai trò</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Nghiệm thu</th>}
                        {!this.checked && <th style={{ width: '10%', whiteSpace: 'nowrap', textAlign: 'center' }}>Kết quả</th>}
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />

                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {!this.checked ? <span><a href='#' onClick={(e) => { e.preventDefault(); this.modal.show(item, false); }}>{(item.hoCanBo ? item.hoCanBo : '') + ' ' + (item.tenCanBo ? item.tenCanBo : '')}</a><br /></span> :
                                    <span style={{ color: 'blue' }}>{(item.hoCanBo ? item.hoCanBo : '') + ' ' + (item.tenCanBo ? item.tenCanBo : '')}<br /></span>}
                                {item.shcc + (item.hocViCanBo ? ' - ' + item.hocViCanBo : '')}<br />

                            </>
                        )}
                        />
                        {this.checked && <TableCell type='text' style={{ textAlign: 'center' }} content={item.soDeTai} />}
                        <TableCell type='text' content={
                            !this.checked ? <>
                                <div><br />{item.tenDeTai ? item.tenDeTai : ''}</div> <br />
                            </> : <>
                                {this.list(item.danhSachDeTai, item.soDeTai, item.soDeTai)}
                            </>
                        }
                        />
                        {!this.checked && <TableCell type='text' content={item.maSoCapQuanLy ? item.maSoCapQuanLy : ''} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc == -1 ? <span style={{ whiteSpace: 'nowrap', color: 'red' }}>Đang diễn ra<br /></span> : null}
                            </>
                        )}
                        />}
                        {!this.checked &&
                            <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'right' }} content={(item.kinhPhi ? item.kinhPhi : '').numberWithCommas()} />
                        }
                        {!this.checked && <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.vaiTro == 'CN' ? 'Chủ nhiệm' : 'Tham gia'} />}
                        {!this.checked &&
                            <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                                item.ngayNghiemThu ?
                                    <span style={{ color: 'red' }}>{item.ngayNghiemThu == -1 ? 'Chưa nghiệm thu' : T.dateToText(item.ngayNghiemThu, item.ngayNghiemThuType ? item.ngayNghiemThuType : 'dd/mm/yyyy')}</span>
                                    : ''} />
                        }
                        {!this.checked && <TableCell type='text' content={item.ketQua ? item.ketQua : ''} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} >
                            </TableCell>
                        }
                        {
                            this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/${this.menu}/qua-trinh/nghien-cuu-khoa-hoc/group/${item.shcc}`} >
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
                <Link key={0} to='/user/khcn'>Khoa học công nghệ</Link>,
                'Quá trình nghiên cứu khoa học'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />}
                    {this.timeType && this.timeType.value() && this.timeType.value() != 0 && <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />}
                    <FormSelect ref={e => this.loaiHocVi = e} label='Loại học vị' className='col-12 col-md-3' data={[
                        { id: '04', text: 'Cử nhân' },
                        { id: '03', text: 'Thạc sĩ' },
                        { id: '02', text: 'Tiến sĩ' },
                    ]} onChange={() => this.changeAdvancedSearch()} multiple={true} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-3' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-12' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
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
                    permissions={currentPermissions} deleteFile={this.props.deleteFile}
                    create={this.props.createQtNckhStaff} update={this.props.updateQtNckhStaff}
                />
            </>,
            backRoute: '/user/' + this.menu,
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onExport: !this.checked ? (e) => {
                e.preventDefault();
                const { maDonVi, fromYear, toYear, loaiHocVi, maSoCanBo, timeType } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : {
                    maDonVi: '', fromYear: null, toYear: null, loaiHocVi: '', maSoCanBo: '', timeType: 0,
                };
                T.download(T.url(`/api/qua-trinh/nckh/download-excel/${maDonVi !== '' ? maDonVi : null}/${fromYear != null ? fromYear : null}/${toYear != null ? toYear : null}/${loaiHocVi != '' ? loaiHocVi : null}/${maSoCanBo != '' ? maSoCanBo : null}/${timeType}`), 'NCKH.xlsx');
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghienCuuKhoaHoc: state.khcn.qtNghienCuuKhoaHoc });
const mapActionsToProps = {
    createQtNckhStaff, updateQtNckhStaff, deleteQtNckhStaff,
    getQtNghienCuuKhoaHocGroupPage, getQtNghienCuuKhoaHocPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghienCuuKhoaHoc);