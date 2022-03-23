import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from '../tccbCanBo/redux';
import {
    getQtCongTacTrongNuocGroupPageMa, deleteQtCongTacTrongNuocGroupPageMa, createQtCongTacTrongNuocGroupPageMa,
    updateQtCongTacTrongNuocGroupPageMa
} from './redux';
import { SelectAdapter_DmTinhThanhPhoV2 } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { SelectAdapter_DmMucDichTrongNuoc } from 'modules/mdDanhMuc/dmMucDichTrongNuoc/redux';

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
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày đi' },
    { id: 2, text: 'Theo ngày quyết định' }
];
class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };

    onShow = (item) => {
        let { id, shcc, noiDen, batDau, batDauType, ketThuc, ketThucType, vietTat, lyDo, kinhPhi, ghiChu, soCv, ngayQuyetDinh } = item ? item : {
            id: '', shcc: '', noiDen: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', vietTat: '', lyDo: '', kinhPhi: null, ghiChu: '', soCv: '', ngayQuyetDinh: null,
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc
        }, () => {
            this.shcc.value(shcc ? shcc : this.props.shcc);
            if (noiDen) {
                noiDen = noiDen.split(',');
                this.noiDen.value(noiDen);
            } else this.noiDen.value('');
            this.vietTat.value(vietTat);
            this.lyDo.value(lyDo ? lyDo : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.soCv.value(soCv ? soCv : '');
            this.ngayQuyetDinh.value(ngayQuyetDinh ? ngayQuyetDinh : '');

            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.state.ketThuc != -1 && this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            if (this.state.ketThuc == -1) {
                this.setState({ denNay: true });
                this.denNayCheck.value(true);
                $('#ketThucDate').hide();
            } else {
                this.setState({ denNay: false });
                this.denNayCheck.value(false);
                $('#ketThucDate').show();
            }
            this.batDau.setVal(batDau ? batDau : '');
            this.state.ketThuc != -1 && this.ketThuc.setVal(ketThuc ? ketThuc : '');
        });
    };

    
    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            noiDen: this.noiDen.value().toString(),
            vietTat: this.vietTat.value(),
            lyDo: this.lyDo.value(),
            kinhPhi: this.kinhPhi.value(),
            ghiChu: this.ghiChu.value(),
            soCv: this.soCv.value(),
            ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.shcc.focus();
        } else if (!this.lyDo.value()) {
            T.notify('Nội dung công tác trong nước trống', 'danger');
            this.lyDo.focus();
        } else if (!this.noiDen.value().length) {
            T.notify('Danh sách tỉnh thành trống', 'danger');
            this.noiDen.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày đi trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày về trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    handleKetThuc = (value) => {
        value ? $('#ketThucDate').hide() : $('#ketThucDate').show();
        this.setState({ denNay: value });
        if (!value) {
            this.ketThucType?.setText({ text: this.state.ketThucType ? this.state.ketThucType : 'dd/mm/yyyy' });
        } else {
            this.ketThucType?.setText({ text: '' });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình công tác trong nước' : 'Tạo mới quá trình công tác trong nước',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} required />
                <FormTextBox className='col-md-3' ref={e => this.soCv = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.vietTat = e} label='Mục đích' data={SelectAdapter_DmMucDichTrongNuoc} />
                <FormRichTextBox className='col-md-12' ref={e => this.lyDo = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung công tác trong nước (tối đa 500 ký tự)' required maxLength={500} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.noiDen = e} label='Nơi đến' data={SelectAdapter_DmTinhThanhPhoV2} required />
                <FormRichTextBox className='col-md-12' ref={e => this.kinhPhi = e} rows={2} type='text' label='Kinh phí' readOnly={readOnly} placeholder='Nhập kinh phí (tối đa 200 ký tự)' maxLength={200}/>

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>Ngày về (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>

                <FormTextBox className='col-md-12' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class QtCongTacTrongNuocGroupPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/tccb/qua-trinh/cong-tac-trong-nuoc/group/:shcc'),
                params = route.parse(window.location.pathname);
            this.shcc = params.shcc;
            this.setState({ filter: { listShcc: params.shcc, listDv: '', timeType: 0, loaiHocVi: null } });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                this.timeType?.value(0);
                this.fromYear?.value('');
                this.toYear?.value('');
                this.tinhTrang?.value('');
                this.mucDich?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.getPage();
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.qtCongTacTrongNuoc && this.props.qtCongTacTrongNuoc.pageMa ? this.props.qtCongTacTrongNuoc.pageMa : { pageNumber: 1, pageSize: 50 };
        const timeType = this.timeType?.value() || 0;
        const fromYear = this.fromYear?.value() == '' ? null : this.fromYear?.value().getTime();
        const toYear = this.toYear?.value() == '' ? null : this.toYear?.value().getTime();
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const loaiHocVi = this.state.filter.loaiHocVi;
        const tinhTrang = this.tinhTrang?.value() == '' ? null : this.tinhTrang?.value();
        const mucDich = this.mucDich?.value() == '' ? '' : this.mucDich?.value().toString();
        const pageFilter = isInitial ? null : { listDv, fromYear, toYear, listShcc, tinhTrang, timeType, loaiHocVi, mucDich };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                    this.fromYear?.value(filter.fromYear || '');
                    this.toYear?.value(filter.toYear || '');
                    this.timeType?.value(filter.timeType);
                    this.tinhTrang?.value(filter.tinhTrang);
                    this.mucDich?.value(filter.mucDich);
                    if (!$.isEmptyObject(filter) && filter && (filter.fromYear || filter.toYear || filter.timeType || filter.tinhTrang || filter.mucDich )) this.showAdvanceSearch();
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtCongTacTrongNuocGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin công tác trong nước', 'Bạn có chắc bạn muốn xóa thông tin công tác trong nước này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtCongTacTrongNuocGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin công tác trong nước bị lỗi!', 'danger');
                else T.alert('Xoá thông tin công tác trong nước thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }


    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtCongTacTrongNuoc', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtCongTacTrongNuoc && this.props.qtCongTacTrongNuoc.pageMa ? this.props.qtCongTacTrongNuoc.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số công văn</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thông tin chuyến đi</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <b> {item.soCv ? item.soCv : ''} </b> <br/><br/>
                                {item.ngayQuyetDinh ? <span style={{ whiteSpace: 'nowrap' }}>Ngày quyết định: <span style={{ color: 'blue' }}>{item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>Nơi đến: <span>{item.danhSachTinh ? item.danhSachTinh : ''}</span></span> <br/> <br/>
                                <span>Mục đích: <span><b>{item.tenMucDich ? item.tenMucDich : ''}</b></span></span> <br/> <br/>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Ngày đi: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Ngày về: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.lyDo ? item.lyDo : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
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
            icon: 'fa fa-pencil-square-o',
            title: 'Quá trình công tác trong nước - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/cong-tac-trong-nuoc'>Quá trình công tác trong nước</Link>,
                'Quá trình công tác trong nước - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={() => this.changeAdvancedSearch()} />
                    {(this.timeType && this.timeType.value() >= 1) &&
                        <>
                            <FormDatePicker type='month-mask' ref={e => this.fromYear = e} className='col-12 col-md-4' label='Từ thời gian' onChange={() => this.changeAdvancedSearch()} />
                            <FormDatePicker type='month-mask' ref={e => this.toYear = e} className='col-12 col-md-4' label='Đến thời gian' onChange={() => this.changeAdvancedSearch()} />
                        </>}
                    <FormSelect className='col-12 col-md-4' ref={e => this.tinhTrang = e} label='Tình trạng'
                        data={[
                            { id: 1, text: 'Đã kết thúc' }, { id: 2, text: 'Đang diễn ra' }
                        ]} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichTrongNuoc} onChange={() => this.changeAdvancedSearch()} allowClear={true} minimumResultsForSearch={-1} />
                </div>
            </>,
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions} shcc={this.shcc}
                    create={this.props.createQtCongTacTrongNuocGroupPageMa} update={this.props.updateQtCongTacTrongNuocGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/cong-tac-trong-nuoc',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
            onExport: (e) => {
                e.preventDefault();
                const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang, loaiHocVi, mucDich } = (this.state.filter && this.state.filter != '%%%%%%%%') ? this.state.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null, loaiHocVi: null, mucDich: null };

                T.download(T.url(`/api/qua-trinh/cong-tac-trong-nuoc/download-excel/${listShcc ? listShcc : null}/${listDv ? listDv : null}/${fromYear ? fromYear : null}/${toYear ? toYear : null}/${timeType}/${tinhTrang ? tinhTrang : null}/${loaiHocVi ? loaiHocVi : null}/${mucDich ? mucDich : null}`), 'congtactrongnuoc.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtCongTacTrongNuoc: state.tccb.qtCongTacTrongNuoc });
const mapActionsToProps = {
    getQtCongTacTrongNuocGroupPageMa, deleteQtCongTacTrongNuocGroupPageMa,
    updateQtCongTacTrongNuocGroupPageMa, createQtCongTacTrongNuocGroupPageMa,
};
export default connect(mapStateToProps, mapActionsToProps)(QtCongTacTrongNuocGroupPage);