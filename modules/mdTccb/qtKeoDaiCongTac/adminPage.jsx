import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormDatePicker, FormCheckbox, FormTextBox, CirclePageButton } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtKeoDaiCongTacPage, getQtKeoDaiCongTacGroupPage, updateQtKeoDaiCongTacStaff,
    createQtKeoDaiCongTacStaff, deleteQtKeoDaiCongTacStaff, getListItem, updateMultipleQuyetDinh
} from './redux';
import { getTuoiNghiHuu } from 'modules/mdDanhMuc/dmNghiHuu/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';

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
    { id: 0, text: 'Theo ngày bắt đầu' },
    { id: 1, text: 'Theo ngày kết thúc' }
];

const
    start = new Date().getFullYear() - 10,
    end = new Date().getFullYear() + 2,
    yearSelector = [...Array(end - start + 1).keys()].map(i => ({
        id: end - i,
        text: end - i
    }));

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
            id: '', shcc: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', phai: '', ngaySinh: '', soQuyetDinh: '', ngayQuyetDinh: ''
        };
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

    handleCanBo = (value) => {
        if (value) {
            let { phai, ngaySinh } = value.data;
            this.phai.value(phai == '01' ? 'Nam' : 'Nữ');
            this.ngaySinh.value(ngaySinh);
            if (phai && ngaySinh) {
                this.props.getTuoiNghiHuu(phai, ngaySinh, (itemNghiHuu) => {
                    this.ngayNghiHuu.value(new Date(itemNghiHuu.resultDate).getTime());
                });
            } else {
                this.ngayNghiHuu.value('');
            }
        } else {
            this.phai.value('');
            this.ngaySinh.value('');
            this.ngayNghiHuu.value('');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const canEdit = this.state.id ? false : true;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật thông tin kéo dài công tác' : 'Tạo mới thông tin kéo dài công tác',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.shcc = e} data={SelectAdapter_FwCanBo} label='Cán bộ' readOnly={!canEdit} required onChange={this.handleCanBo} />
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

class UpdateQuyetDinhModal extends AdminModal {
    state = {
        data: [],
    }

    tableData = (data) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức danh khoa học<br />Trình độ chuyên môn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                    <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian được kéo dài</th>
                </tr>
            ),
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
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
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                    </tr>
                );
            }
        });
    }

    componentDidMount() {
        this.onShown(() => {
            this.year.focus();
        });
    }
    onSubmit = (e) => {
        e.preventDefault();
        if (!this.soQuyetDinh.value()) {
            T.notify('Số quyết định trống', 'danger');
            this.soQuyetDinh.focus();
        } else if (!this.ngayQuyetDinh.value()) {
            T.notify('Ngày quyết định trống', 'danger');
            this.ngayQuyetDinh.focus();
        } else {
            for (let index = 0; index < this.state.data.length; index++) {
                this.state.data[index].soQuyetDinh = this.soQuyetDinh.value();
                this.state.data[index].ngayQuyetDinh = Number(this.ngayQuyetDinh.value());
            }
            this.props.updateMultipleQuyetDinh(this.state.data, this.hide);
        }
    }


    handleYear = (value) => {
        if (value) {
            let fromYear = new Date(value.id, 0, 1, 0, 0, 0, 0);
            let toYear = new Date(value.id, 11, 31, 23, 59, 59, 999);
            fromYear = fromYear.getTime();
            toYear = toYear.getTime();
            let filter = {
                fromYear, toYear,
                timeType: 0,
            };
            this.props.getListItem('', filter, items => {
                this.setState({ data: items });
            });
        } else {
            this.setState({ data: [] });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Cập nhật quyết định theo năm',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect className='col-12' ref={e => this.year = e} data={yearSelector} label='Năm' onChange={this.handleYear} allowClear={true} />
                <FormTextBox className='col-md-8' style={{ display: this.state.data.length ? 'block' : 'none' }} ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' required />
                <FormDatePicker className='col-md-4' ref={e => this.ngayQuyetDinh = e} style={{ display: this.state.data.length ? 'block' : 'none' }} type='date-mask' label='Ngày quyết định' required />
                <FormTextBox className='col-md-12' style={{ display: this.state.data.length ? 'block' : 'none' }} type='text' label={<b>{'Có ' + this.state.data.length + ' kết quả'}</b>} readOnly={true} />
                <div className='form-group col-md-12'>{this.tableData(this.state.data)}</div>
            </div>
        });
    }
}

class QtKeoDaiCongTac extends AdminPage {
    checked = parseInt(T.cookie('hienThiTheoCanBo')) == 1 ? true : false;
    state = { filter: {}, visibleTime: false };

    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                let filterCookie = T.getCookiePage('pageQtKeoDaiCongTac', 'F'), {
                    timeType = '', fromYear = '', toYear = '', listDv = '', listShcc = '',
                } = filterCookie;
                this.timeType.value(timeType);
                this.fromYear.value(fromYear);
                this.toYear.value(toYear);
                this.maDonVi.value(listDv);
                this.mulCanBo.value(listShcc);
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

    changeAdvancedSearch = (isInitial = false, isReset = false) => {
        let { pageNumber, pageSize, pageCondition } = this.props && this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.page ? this.props.qtKeoDaiCongTac.page : { pageNumber: 1, pageSize: 50, pageCondition: {} };

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
        const listDv = this.maDonVi.value().toString() || '';
        const listShcc = this.mulCanBo.value().toString() || '';
        const pageFilter = (isInitial || isReset) ? {} : { listDv, fromYear, toYear, listShcc, timeType };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, pageCondition, (page) => {
                if (isInitial) {
                    const filter = page.filter || {};
                    const filterCookie = T.getCookiePage('pageQtKeoDaiCongTac', 'F');
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });

                    this.timeType.value(filter.timeType || filterCookie.timeType);
                    this.fromYear?.value(filter.fromYear || filterCookie.fromYear || '');
                    this.toYear?.value(filter.toYear || filterCookie.toYear || '');
                    this.maDonVi.value(filter.listDv || filterCookie.listDv);
                    this.mulCanBo.value(filter.listShcc || filterCookie.listShcc);
                } else if (isReset) {
                    this.timeType.value('');
                    this.fromYear?.value('');
                    this.toYear?.value('');
                    this.maDonVi.value('');
                    this.mulCanBo.value('');
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        if (this.checked) this.props.getQtKeoDaiCongTacGroupPage(pageN, pageS, pageC, this.state.filter, done);
        else this.props.getQtKeoDaiCongTacPage(pageN, pageS, pageC, this.state.filter, done);
    }

    groupPage = () => {
        this.checked = !this.checked;
        T.cookie('hienThiTheoCanBo', this.checked ? 1 : 0);
        this.getPage();
    }

    list = (batDauList, ketThucList, batDauTypeList, ketThucTypeList, soQt) => {
        if (soQt == 0) return [];
        let batDaus = batDauList.split('??');
        let ketThucs = ketThucList.split('??');
        let batDauTypes = batDauTypeList.split('??');
        let ketThucTypes = ketThucTypeList.split('??');
        let results = [];
        for (let i = 0; i < soQt; i++) {
            batDaus[i] = batDaus[i].trim();
            ketThucs[i] = ketThucs[i].trim();
            batDauTypes[i] = batDauTypes[i].trim();
            ketThucTypes[i] = ketThucTypes[i].trim();
        }
        for (let i = 0; i < soQt; i++) {
            if (ketThucs[i] && ketThucs[i] == -1) {
                results.push(<div key={results.length}>{i + 1}. Bắt đầu: <span style={{ color: 'blue' }}>{batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : ''}</span> - Đến nay</div>);
            } else {
                results.push(<div key={results.length}>{i + 1}. Bắt đầu: <span style={{ color: 'blue' }}>{batDaus[i] ? T.dateToText(Number(batDaus[i]), batDauTypes[i] ? batDauTypes[i] : 'dd/mm/yyyy') : ''}</span> -
                    Kết thúc: <span style={{ color: 'blue' }}>{ketThucs[i] ? T.dateToText(Number(ketThucs[i]), ketThucTypes[i] ? ketThucTypes[i] : 'dd/mm/yyyy') : ''}</span></div>);
            }
        }
        return results;
    }

    delete = (e, item) => {
        T.confirm('Xóa quá trình kéo dài công tác', 'Bạn có chắc bạn muốn xóa quá trình kéo dài công tác này', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKeoDaiCongTacStaff(item.id, error => {
                if (error) T.notify(error.message ? error.message : `Xoá quá trình kéo dài công tác ${item.ten} bị lỗi!`, 'danger');
                else T.alert('Xoá quá trình kéo dài công tác thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    handleTime = (value) => {
        value ? this.setState({ visibleTime: true }) : this.setState({ visibleTime: false });
    }

    render() {
        const permission = this.getUserPermission('qtKeoDaiCongTac', ['read', 'write', 'delete', 'export']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.pageGr ?
                this.props.qtKeoDaiCongTac.pageGr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.page ? this.props.qtKeoDaiCongTac.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức danh khoa học<br />Trình độ chuyên môn</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>}
                        {!this.checked && <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày quyết định</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Ngày đủ tuổi nghỉ hưu</th>}
                        {!this.checked && <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thời gian được kéo dài</th>}
                        {this.checked && <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số quá trình<br />kéo dài công tác</th>}
                        {this.checked && <th style={{ width: '50%', textAlign: 'center' }}>Danh sách thời gian<br />kéo dài công tác</th>}
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr >
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
                        {!this.checked && <TableCell type='text' content={(<b> {item.soQuyetDinh || ''} </b>)} />}
                        {!this.checked && <TableCell type='text' style={{ color: 'blue' }} content={(item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : '')} />}
                        {!this.checked && <TableCell type='date' style={{ whiteSpace: 'nowrap', color: 'red' }} dateFormat='dd/mm/yyyy' content={item.ngayNghiHuu} />}
                        {!this.checked && <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />}
                        {this.checked && <TableCell type='text' content={item.soQuaTrinh} />}
                        {this.checked && <TableCell type='text' content={this.list(item.danhSachBatDau, item.danhSachKetThuc, item.danhSachBatDauType, item.danhSachKetThucType, item.soQuaTrinh)} />}
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} > </TableCell>
                        }
                        {
                            this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission}>
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/keo-dai-cong-tac/${item.shcc}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-hourglass-start',
            title: 'Quá trình kéo dài công tác',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình kéo dài công tác'
            ],
            advanceSearch: <>
                <div className='row'>
                    <FormSelect className='col-12 col-md-4' ref={e => this.timeType = e} label='Chọn loại thời gian' data={timeList} onChange={this.handleTime} />
                    {this.state.visibleTime &&
                        <>
                            <FormDatePicker type='date-mask' ref={e => this.fromYear = e} className='col-12 col-md-2' label='Từ thời gian' />
                            <FormDatePicker type='date-mask' ref={e => this.toYear = e} className='col-12 col-md-2' label='Đến thời gian' />
                        </>}
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi} allowClear={true} minimumResultsForSearch={-1} />
                    <FormSelect className='col-12 col-md-6' multiple={true} ref={e => this.mulCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} allowClear={true} minimumResultsForSearch={-1} />
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
                    <FormCheckbox label='Hiển thị theo cán bộ' ref={e => this.hienThiTheoCanBo = e} onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createQtKeoDaiCongTacStaff} update={this.props.updateQtKeoDaiCongTacStaff} getTuoiNghiHuu={this.props.getTuoiNghiHuu}
                />
                <UpdateQuyetDinhModal ref={e => this.updateQdModal = e} getListItem={this.props.getListItem}
                    updateMultipleQuyetDinh={this.props.updateMultipleQuyetDinh}
                />
                {!this.checked && permission.write && <CirclePageButton type='custom' className='btn-warning' style={{ marginRight: '180px' }} tooltip='Cập nhật số quyết định theo năm' customIcon='fa-th-list' onClick={e => {
                    e.preventDefault();
                    this.updateQdModal.show();
                }} />}
            </>,
            backRoute: '/user/tccb',
            onImport: !this.checked && permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/tccb/qua-trinh/keo-dai-cong-tac/create-list') : '',
            onCreate: permission && permission.write && !this.checked ? (e) => this.showModal(e) : null,
            onExport: !this.checked && permission.export ? (e) => {
                e.preventDefault();
                let { pageCondition } = this.props && this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.page ? this.props.qtKeoDaiCongTac.page : { pageCondition: {} };
                pageCondition = typeof pageCondition === 'string' ? pageCondition : '';
                if (pageCondition.length == 0) pageCondition = null;

                const filter = T.stringify(this.state.filter);
                T.download(T.url(`/api/tccb/qua-trinh/keo-dai-cong-tac/download-excel/${filter}/${pageCondition}`), 'KEO DAI CONG TAC.xlsx');
            } : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKeoDaiCongTac: state.tccb.qtKeoDaiCongTac });
const mapActionsToProps = {
    getQtKeoDaiCongTacPage, getQtKeoDaiCongTacGroupPage, updateQtKeoDaiCongTacStaff,
    createQtKeoDaiCongTacStaff, deleteQtKeoDaiCongTacStaff, getTuoiNghiHuu, getListItem, updateMultipleQuyetDinh
};
export default connect(mapStateToProps, mapActionsToProps)(QtKeoDaiCongTac);