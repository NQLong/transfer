import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtKeoDaiCongTacGroupPageMa, deleteQtKeoDaiCongTacGroupPageMa,
    createQtKeoDaiCongTacGroupPageMa, getQtKeoDaiCongTacGroupPageMa,
} from './redux';
import { getTuoiNghiHuu } from 'modules/mdDanhMuc/dmNghiHuu/redux';
import { SelectAdapter_FwCanBo, getStaff } from 'modules/mdTccb/tccbCanBo/redux';
import { DateInput } from 'view/component/Input';
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
const timeList = [
    { id: 0, text: 'Không' },
    { id: 1, text: 'Theo ngày bắt đầu' }
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
        let { id, shcc, batDau, batDauType, ketThuc, ketThucType, phai, ngaySinh, soQuyetDinh, ngayQuyetDinh } = item ? item : {
            id: '', shcc: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', phai: '', ngaySinh: '', soQuyetDinh: '', ngayQuyetDinh: '',
        };
        if (!shcc) {
            shcc = this.props.canBo.shcc;
            phai = this.props.canBo.phai;
            ngaySinh = this.props.canBo.ngaySinh;
        }
        if (phai && ngaySinh) {
            this.props.getTuoiNghiHuu(phai, ngaySinh, (itemNghiHuu) => {
                this.ngayNghiHuu.value(new Date(itemNghiHuu.resultDate).getTime());
            });
        } else {
            this.ngayNghiHuu.value('');
        }
        this.setState({
            id, batDauType: 'dd/mm/yyyy',
            ketThucType: 'dd/mm/yyyy',
            batDau, ketThuc
        }, () => {
            this.shcc.value(shcc);
            this.phai.value(phai ? (phai == '01' ? 'Nam' : 'Nữ') : '');
            this.ngaySinh.value(ngaySinh);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau ? batDau : '');
            this.ketThuc.setVal(ketThuc ? ketThuc : '');
            this.soQuyetDinh.value(soQuyetDinh || '');
            this.ngayQuyetDinh.value(ngayQuyetDinh || '');
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.shcc.value(),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            soQuyetDinh: this.soQuyetDinh.value(),
            ngayQuyetDinh: Number(this.ngayQuyetDinh.value()),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.maCanBo.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu kéo dài công tác trống', 'danger');
            this.batDau.focus();
        } else if (!this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc kéo dài công tác trống', 'danger');
            this.ketThuc.focus();
        } else if (this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật thông tin kéo dài công tác' : 'Tạo mới thông tin kéo dài công tác',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={true} required />
                <FormTextBox className='col-md-4' ref={e => this.phai = e} type='text' label='Giới tính' readOnly={true} />
                <FormDatePicker className='col-md-8' ref={e => this.ngaySinh = e} type='date-mask' label='Ngày sinh' readOnly={true} />
                <FormDatePicker className='col-md-12' ref={e => this.ngayNghiHuu = e} type='date-mask' label='Ngày đủ tuổi nghỉ hưu' readOnly={true} />
                <FormTextBox className='col-md-8' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={readOnly} />
                <FormDatePicker className='col-md-4' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={true} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={true} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
            </div>,
        });
    }
}

class QtKeoDaiCongTacGroupPage extends AdminPage {
    state = { filter: {}, canBo: {}, visibleTime: false };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            const route = T.routeMatcher('/user/tccb/qua-trinh/keo-dai-cong-tac/:shcc'),
                params = route.parse(window.location.pathname);
            this.props.getStaff(params.shcc, item => {
                this.setState({ filter: { listShcc: params.shcc, listDv: '' }, canBo: item.item }, () => {
                    this.changeAdvancedSearch(true);
                });
            });
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');

            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('groupPageMaQtKeoDaiCongTac', 'F'), {
                    timeType = '', fromYear = '', toYear = '',
                } = filterCookie;
                this.timeType.value(timeType);
                this.fromYear?.value(fromYear);
                this.toYear?.value(toYear);
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.pageMa ? this.props.qtKeoDaiCongTac.pageMa : { pageNumber: 1, pageSize: 50, pageCondition: {} };

        if (pageCondition && (typeof pageCondition == 'string')) T.setTextSearchBox(pageCondition);
        let fromYear = null;
        if (this.fromYear?.value()) {
            fromYear = this.fromYear.value();
            fromYear.setHours(0, 0, 0, 0);
            fromYear = fromYear.getTime();
        }
        let toYear = null;
        if (this.toYear?.value()) {
            toYear = this.toYear.value();
            toYear.setHours(23, 59, 59, 999);
            toYear = toYear.getTime();
        }
        const timeType = this.timeType.value() == '' ? null : this.timeType.value();
        const listDv = this.state.filter.listDv;
        const listShcc = this.state.filter.listShcc;
        const pageFilter = (isInitial || isReset) ? { listDv, listShcc } : { listDv, fromYear, toYear, listShcc, timeType };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || { listDv, listShcc };
                    const filterCookie = T.getCookiePage('groupPageMaQtKeoDaiCongTac', 'F');
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.timeType.value(filter.timeType || filterCookie.timeType);
                    this.fromYear?.value(filter.fromYear || filterCookie.fromYear || '');
                    this.toYear?.value(filter.toYear || filterCookie.toYear || '');
                } else if (isReset) {
                    this.timeType.value('');
                    this.fromYear?.value('');
                    this.toYear?.value('');
                }
            });
        });
    }


    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtKeoDaiCongTacGroupPageMa(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin kéo dài công tác', 'Bạn có chắc bạn muốn xóa thông tin kéo dài công tác này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKeoDaiCongTacGroupPageMa(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin kéo dài công tác bị lỗi!', 'danger');
                else T.alert('Xoá thông tin kéo dài công tác thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    handleTime = (value) => {
        value ? this.setState({ visibleTime: true }) : this.setState({ visibleTime: false });
    }

    render() {
        const permission = this.getUserPermission('qtKeoDaiCongTac', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.pageMa ? this.props.qtKeoDaiCongTac.pageMa : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức danh khoa học<br />Trình độ chuyên môn</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày quyết định</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Ngày đủ tuổi nghỉ hưu</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian được kéo dài</th>
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
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.phai == '01' ? 'Nam' : 'Nữ'} />
                        <TableCell type='date' style={{ whiteSpace: 'nowrap' }} dateFormat='dd/mm/yyyy' content={item.ngaySinh} />
                        <TableCell type='text' content={<>
                            {item.tenChucDanh && <span> {item.tenChucDanh}<br /></span>}
                            {item.tenHocVi}
                        </>} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span> {item.tenChucVu || ''}<br /> </span>
                                {(item.tenDonVi || '')}
                            </>
                        )} />
                        <TableCell type='text' content={(<b> {item.soQuyetDinh || ''} </b>)} />
                        <TableCell type='text' style={{ color: 'blue' }} content={(item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : '')} />
                        <TableCell type='date' style={{ whiteSpace: 'nowrap', color: 'red' }} dateFormat='dd/mm/yyyy' content={item.ngayNghiHuu} />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        {
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-hourglass-start',
            title: 'Quá trình kéo dài công tác - Cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/keo-dai-cong-tac'>Quá trình kéo dài công tác</Link>,
                'Quá trình kéo dài công tác - Cán bộ'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={this.handleTime} />
                    {this.state.visibleTime &&
                        <>
                            <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian' />
                            <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian' />
                        </>}
                    <div className='form-group col-12' style={{ justifyContent: 'end', display: 'flex' }}>
                        <div style={{ marginRight: '10px' }}>Tìm thấy: &nbsp;{<b>{totalItem}</b>} kết quả</div>
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
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} canBo={this.state.canBo} getTuoiNghiHuu={this.props.getTuoiNghiHuu}
                    create={this.props.createQtKeoDaiCongTacGroupPageMa} update={this.props.updateQtKeoDaiCongTacGroupPageMa}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/keo-dai-cong-tac',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKeoDaiCongTac: state.tccb.qtKeoDaiCongTac });
const mapActionsToProps = {
    updateQtKeoDaiCongTacGroupPageMa, deleteQtKeoDaiCongTacGroupPageMa,
    createQtKeoDaiCongTacGroupPageMa, getQtKeoDaiCongTacGroupPageMa, getStaff, getTuoiNghiHuu
};
export default connect(mapStateToProps, mapActionsToProps)(QtKeoDaiCongTacGroupPage);