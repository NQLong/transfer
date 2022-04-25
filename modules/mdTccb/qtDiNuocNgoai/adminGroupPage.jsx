import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import {
    getQtDiNuocNgoaiGroupPageMa, deleteQtDiNuocNgoaiGroupPageMa, createQtDiNuocNgoaiGroupPageMa,
    updateQtDiNuocNgoaiGroupPageMa, getThongKeMucDich
} from './redux';
import { SelectAdapter_DmQuocGia } from 'modules/mdDanhMuc/dmQuocGia/redux';
import { SelectAdapter_DmMucDichNuocNgoaiV2 } from 'modules/mdDanhMuc/dmMucDichNuocNgoai/redux';

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
const timeList = [
    { id: 1, text: 'Theo ngày đi' },
    { id: 2, text: 'Theo ngày về' },
    { id: 3, text: 'Theo ngày quyết định đi nước ngoài' },
    { id: 4, text: 'Theo ngày quyết định tiếp nhận' },
];
class EditModal extends AdminModal {
    state = {
        id: null,
        ngayDi: '',
        ngayVe: null,
        dangDienRa: true,
        ngayDiType: 'dd/mm/yyyy',
        ngayVeType: 'dd/mm/yyyy',
        tiepNhan: false,
        daTiepNhan: false,
    };
    // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc }

    onShow = (item) => {
        let { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, today, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc } = item ? item : {
            id: '', shcc: '', quocGia: '', ngayDi: null, ngayDiType: '', ngayVe: null, ngayVeType: '', mucDich: '', noiDung: '', chiPhi: null, ghiChu: '', soQuyetDinh: '', ngayQuyetDinh: null, today: new Date().getTime(), soQdTiepNhan: '', ngayQdTiepNhan: null, noiDungTiepNhan: '', ngayVeNuoc: null,
        };

        this.setState({
            id, ngayDiType: ngayDiType ? ngayDiType : 'dd/mm/yyyy',
            ngayVeType: ngayVeType ? ngayVeType : 'dd/mm/yyyy',
            ngayDi, ngayVe,
            dangDienRa: ngayVe ? (ngayVe == -1 || ngayVe >= today) : true,
            tiepNhan: soQdTiepNhan ? true : false,
            daTiepNhan: soQdTiepNhan ? true : false,
        }, () => {
            this.shcc.value(shcc ? shcc : this.props.shcc);
            if (quocGia) {
                quocGia = quocGia.split(',');
                this.quocGia.value(quocGia);
            } else this.quocGia.value('');
            this.mucDich.value(mucDich);
            this.noiDung.value(noiDung || '');
            this.chiPhi.value(chiPhi || '');
            this.ghiChu.value(ghiChu || '');
            this.soQuyetDinh.value(soQuyetDinh || '');
            this.ngayQuyetDinh.value(ngayQuyetDinh || '');

            this.ngayDiType.setText({ text: ngayDiType ? ngayDiType : 'dd/mm/yyyy' });
            this.ngayDi.setVal(ngayDi || '');
            this.denNayCheck.value(this.state.dangDienRa);
            this.ngayVeType.setText({ text: ngayVeType ? ngayVeType : 'dd/mm/yyyy' });
            if (this.state.ngayVe) {
                this.state.ngayVe != -1 && this.ngayVe.setVal(ngayVe);
            } else this.ngayVe.setVal(null);
            if (this.state.tiepNhan) {
                this.tiepNhanCheck.value(true);
                $('#tiepNhan').show();
            } else {
                $('#tiepNhan').hide();
                this.tiepNhanCheck.value(false);
            }
            this.soQdTiepNhan.value(soQdTiepNhan || '');
            this.ngayQdTiepNhan.value(ngayQdTiepNhan || '');
            this.noiDungTiepNhan.value(noiDungTiepNhan || '');
            this.ngayVeNuoc.value(ngayVeNuoc || '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            quocGia: this.quocGia.value().toString(),
            mucDich: this.mucDich.value(),
            noiDung: this.noiDung.value(),
            chiPhi: this.chiPhi.value(),
            ghiChu: this.ghiChu.value(),
            soQuyetDinh: this.soQuyetDinh.value(),
            ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

            ngayDiType: this.state.ngayDiType,
            ngayDi: this.ngayDi.getVal(),
            ngayVeType: this.state.ngayVeType,
            ngayVe: this.ngayVe.getVal(),

            soQdTiepNhan: this.state.tiepNhan ? this.soQdTiepNhan.value() : null,
            ngayQdTiepNhan: this.state.tiepNhan ? Number(this.ngayQdTiepNhan.value()) : null,
            noiDungTiepNhan: this.state.tiepNhan ? this.noiDungTiepNhan.value() : null,
            ngayVeNuoc: this.state.tiepNhan ? this.ngayVeNuoc.value() : null,
        };
        if (!this.noiDung.value()) {
            T.notify('Nội dung đi nước ngoài trống', 'danger');
            this.noiDung.focus();
        } else if (!this.quocGia.value().length) {
            T.notify('Danh sách quốc gia trống', 'danger');
            this.quocGia.focus();
        } else if (!this.ngayDi.getVal()) {
            T.notify('Ngày đi nước ngoài trống', 'danger');
            this.ngayDi.focus();
        } else if (!this.ngayVe.getVal()) {
            T.notify('Ngày về nước trống', 'danger');
            this.ngayVe.focus();
        } else if (this.ngayDi.getVal() > this.ngayVe.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.ngayDi.focus();
        } else if (this.state.tiepNhan && !this.soQdTiepNhan.value()) {
            T.notify('Số quyết định tiếp nhận trống', 'danger');
            this.soQdTiepNhan.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    handleNgayVe = (value) => {
        this.setState({ dangDienRa: value });
    }

    handleTiepNhan = (value) => {
        this.tiepNhanCheck.value(value);
        if (value) {
            this.setState({ tiepNhan: true }, () => {
                $('#tiepNhan').show();
            });
        } else {
            this.setState({ tiepNhan: false }, () => {
                $('#tiepNhan').hide();
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormTextBox className='col-md-3' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 1000 ký tự)' required readOnly={readOnly} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} required readOnly={readOnly} />
                <FormTextBox className='col-md-8' ref={e => this.chiPhi = e} rows={2} type='text' label='Chi phí' readOnly={readOnly} placeholder='Nhập chi phí (tối đa 500 ký tự)'/>
                <FormTextBox className='col-md-4' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />

                <div className='form-group col-md-5'><DateInput ref={e => this.ngayDi = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (&nbsp; <Dropdown ref={e => this.ngayDiType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayDiType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayDiType ? typeMapper[this.state.ngayDiType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đang diễn ra' onChange={this.handleNgayVe} className='form-group col-md-2' readOnly={readOnly} />
                <div className='form-group col-md-5' id='ketThucDate'><DateInput ref={e => this.ngayVe = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>{this.state.dangDienRa ? 'Ngày về dự kiến' : 'Ngày về'} (&nbsp; <Dropdown ref={e => this.ngayVeType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayVeType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayVeType ? typeMapper[this.state.ngayVeType] : null} readOnly={readOnly} /></div>
                <FormCheckbox label={this.state.daTiepNhan ? 'Đã tiếp nhận' : this.state.tiepNhan ? 'Đang nhập dữ liệu tiếp nhận' : 'Bấm vào đây nếu muốn tạo mới tiếp nhận'} onChange={this.handleTiepNhan} className='form-group col-md-6' ref={e => this.tiepNhanCheck = e} readOnly={readOnly} />
                <div className='row form-group col-12' id='tiepNhan'>
                    <FormTextBox className='col-md-4' ref={e => this.soQdTiepNhan = e} type='text' label='Số quyết định tiếp nhận' readOnly={readOnly} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayQdTiepNhan = e} type='date-mask' label='Ngày quyết định tiếp nhận' readOnly={readOnly} />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayVeNuoc = e} type='date-mask' label='Ngày về nước' readOnly={readOnly} />
                    <FormRichTextBox className='col-md-12' ref={e => this.noiDungTiepNhan = e} rows={3} readOnly={readOnly} label='Nội dung tiếp nhận' placeholder='Nhập nội dung tiếp nhận về nước (tối đa 1000 ký tự)' />
                </div>
            </div>
        });
    }
}

class QtDiNuocNgoaiGroupPage extends AdminPage {
    state = { filter: {}, visibleTime: false, listMucDich: [] };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/tccb/qua-trinh/di-nuoc-ngoai/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.thongKeMucDich('', { listShcc: params.shcc, listDv: '', loaiHocVi: null }, (items) => {
                this.setState({ filter: { listShcc: params.shcc, listDv: '', loaiHocVi: null }, listMucDich: this.setUp(items, 'tenMucDich')}, () => {
                    this.changeAdvancedSearch(true);
                });
            });
            T.onSearch = (searchText) => {
                this.thongKeMucDich(searchText, this.state.filter, (items) => {
                    this.setState({ listMucDich: this.setUp(items, 'tenMucDich') }, () => {
                        this.getPage(undefined, undefined, searchText || '');
                    });
                });
            };
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('groupPageMaQtDiNuocNgoai', 'F'), {
                    timeType = '', fromYear = '', toYear = '', tinhTrang = '', mucDich = '',
                } = filterCookie;
                this.timeType.value(timeType);
                this.fromYear?.value(fromYear);
                this.toYear?.value(toYear);
                this.tinhTrang.value(tinhTrang);
                this.mucDich.value(mucDich);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
        });
    }

    setUp = (data = [], keyGroup) => {
        let dataGroupBy = data.groupBy(keyGroup);
        let filterData = [];
        Object.keys(dataGroupBy).filter(item => dataGroupBy[item].length > 0).map(item => {
            filterData.push({ id: item, len: dataGroupBy[item].length });
        });
        filterData.sort(function(a, b) { //sắp xếp theo số lượng giảm dần
            return -(a.len - b.len);
        });
        let result = [];
        filterData.forEach(item => {
            result.push(<div key={item.id}><b><span>{' - ' + item.id + ': ' + item.len}</span></b></div>);
        });
        return result;
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.pageMa ? this.props.qtDiNuocNgoai.pageMa : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);

        const timeType = this.timeType.value() || '';
        let fromYear = null;
        if (this.fromYear?.value()) {
            fromYear = this.fromYear?.value();
            fromYear.setHours(0, 0, 0, 0);
            fromYear = fromYear.getTime();
        }
        let toYear = null;
        if (this.toYear?.value()) {
            toYear = this.toYear?.value();
            toYear.setHours(23, 59, 59, 999);
            toYear = toYear.getTime();
        }
        
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const loaiHocVi = this.state.filter.loaiHocVi;
        const tinhTrang = this.tinhTrang.value() == '' ? null : this.tinhTrang.value();
        const mucDich = this.mucDich.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? { listShcc, listDv, loaiHocVi } : { listDv, fromYear, toYear, listShcc, tinhTrang, timeType, loaiHocVi, mucDich };
        this.thongKeMucDich(pageCondition, pageFilter, (items) => {
            this.setState({ filter: pageFilter, listMucDich: this.setUp(items, 'tenMucDich') }, () => {
                this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                    if (isInitial) {
                        const filter = page.filter || { listShcc, listDv, loaiHocVi };
                        const filterCookie = T.getCookiePage('groupPageMaQtDiNuocNgoai', 'F');
                        this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                        this.fromYear?.value(filter.fromYear || filterCookie.fromYear || '');
                        this.toYear?.value(filter.toYear || filterCookie.toYear || '');
                        this.timeType.value(filter.timeType || filterCookie.timeType || '');
                        this.tinhTrang.value(filter.tinhTrang || filterCookie.tinhTrang || '');
                        this.mucDich.value(filter.mucDich || filterCookie.mucDich || '');
                        if (this.fromYear?.value() || this.toYear?.value() || this.timeType.value() || this.tinhTrang.value() || this.mucDich.value()) this.showAdvanceSearch();
                    } else if (isReset) {
                        this.fromYear?.value('');
                        this.toYear?.value('');
                        this.timeType.value('');
                        this.tinhTrang.value('');
                        this.mucDich.value('');
                    }
                });
            });
        });
    }

    thongKeMucDich = (pageC, filter, done) => {
        this.props.getThongKeMucDich(pageC, filter, done);
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtDiNuocNgoaiGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin đi nước ngoài', 'Bạn có chắc bạn muốn xóa thông tin đi nước ngoài này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDiNuocNgoaiGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin đi nước ngoài bị lỗi!', 'danger');
                else T.alert('Xoá thông tin đi nước ngoài thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    handleTime = (value) => {
        value ? this.setState({ visibleTime: true }) : this.setState({ visibleTime: false });
    }

    render() {
        const permission = this.getUserPermission('qtDiNuocNgoai');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.pageMa ? this.props.qtDiNuocNgoai.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br/>Đơn vị công tác</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi đến</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Mục đích</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '').normalizedName()}
                            </>
                        )} />
                        <TableCell type='text' style={{color: 'blue'}} content={(item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : '')} />
                        <TableCell type='text' content={(<b> {item.soQuyetDinh || ''} </b>)} />
                        <TableCell type='text' style={{color: 'blue'}} content={(item.danhSachQuocGia || '')} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(<b>{item.tenMucDich || ''}</b>)} />
                        <TableCell type='text' contentClassName='multiple-lines-5' content={(item.noiDung || '')} />
                        <TableCell type='text' content={(
                            <>
                                {item.ngayDi ? <span style={{ whiteSpace: 'nowrap' }}>Ngày đi: <span style={{ color: 'blue' }}>{item.ngayDi ? T.dateToText(item.ngayDi, item.ngayDiType ? item.ngayDiType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ngayVe && item.ngayVe != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Ngày về: <span style={{ color: 'blue' }}>{item.ngayVe && item.ngayVe != -1 ? T.dateToText(item.ngayVe, item.ngayVeType ? item.ngayVeType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.ngayVe >= item.today ? <span style={{ whiteSpace: 'nowrap' }}><i>Đang ở<br/>nước ngoài</i></span> : item.soQdTiepNhan ? <span style={{ color: 'blue', whiteSpace: 'nowrap' }}> Đã tiếp nhận<br/>về nước</span>: <span style={{ color: 'red', whiteSpace: 'nowrap' }}> Hết hạn và<br/>chưa tiếp nhận </span>} </span>
                            </>
                        )}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: 'Quá trình đi nước ngoài - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/di-nuoc-ngoai'>Quá trình đi nước ngoài</Link>,
                'Quá trình đi nước ngoài - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} allowClear={true} onChange={this.handleTime} />
                    {this.state.visibleTime && 
                        <>
                            <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian' />
                            <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian' />
                        </>}
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrang = e} label='Tình trạng'
                        data={[
                            { id: 1, text: 'Đã tiếp nhận về nước' },
                            { id: 2, text: 'Hết hạn và chưa tiếp nhận' },
                            { id: 3, text: 'Đang ở nước ngoài' },
                        ]} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} allowClear={true} minimumResultsForSearch={-1} />
                    <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                        <button className='btn btn-danger' style={{ marginRight: '10px' }} type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch(null, true)}>
                            <i className='fa fa-fw fa-lg fa-times' />Xóa bộ lọc
                        </button>
                        <button className='btn btn-info' type='button' onClick={e => e.preventDefault() || this.changeAdvancedSearch()}>
                            <i className='fa fa-fw fa-lg fa-search-plus' />Tìm kiếm
                        </button>
                    </div>
                </div>
            </>,
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>
                        Thống kê
                    </h3>
                    <div>{this.state.listMucDich}</div>
                    <big><b>{'Tổng cộng: ' + totalItem.toString()}</b></big>
                </div>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    shcc={this.shcc}
                    create={this.props.createQtDiNuocNgoaiGroupPageMa} update={this.props.updateQtDiNuocNgoaiGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/di-nuoc-ngoai',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onExport: (e) => {
                e.preventDefault();
                let { pageCondition } = this.props && this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.pageMa ? this.props.qtDiNuocNgoai.pageMa : { pageCondition: {} };
                pageCondition = typeof pageCondition === 'string' ? pageCondition : '';
                if (pageCondition.length == 0) pageCondition = null;
                
                const filter = T.stringify(this.state.filter);

                T.download(T.url(`/api/qua-trinh/di-nuoc-ngoai/download-excel/${filter}/${pageCondition}`), 'dinuocngoai.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDiNuocNgoai: state.tccb.qtDiNuocNgoai });
const mapActionsToProps = {
    getQtDiNuocNgoaiGroupPageMa, deleteQtDiNuocNgoaiGroupPageMa,
    updateQtDiNuocNgoaiGroupPageMa, createQtDiNuocNgoaiGroupPageMa, getThongKeMucDich
};
export default connect(mapStateToProps, mapActionsToProps)(QtDiNuocNgoaiGroupPage);