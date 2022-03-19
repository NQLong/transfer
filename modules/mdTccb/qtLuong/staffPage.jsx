import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormDatePicker, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';
import {
    updateQtLuongUserPage, deleteQtLuongUserPage,
    createQtLuongUserPage, getQtLuongUserPage,
} from './redux';

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
    };

    onShow = (item) => {
        let { id, batDau, batDauType, ketThuc, ketThucType, chucDanhNgheNghiep, bac, heSoLuong,
            phuCapThamNienVuotKhung, ngayHuong, mocNangBacLuong, soHieuVanBan } = item && item.item ? item.item : {
                id: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', chucDanhNgheNghiep: '', bac: '', heSoLuong: '',
                phuCapThamNienVuotKhung: '', ngayHuong: '', mocNangBacLuong: '', soHieuVanBan: ''
            };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
            this.chucDanhNgheNghiep.value(chucDanhNgheNghiep ? chucDanhNgheNghiep : '');
            this.bac.value(bac ? bac : '');
            this.heSoLuong.value(heSoLuong ? heSoLuong : '');
            this.phuCapThamNienVuotKhung.value(phuCapThamNienVuotKhung ? phuCapThamNienVuotKhung : '');
            this.ngayHuong.value(ngayHuong ? ngayHuong : '');
            this.mocNangBacLuong.value(mocNangBacLuong ? mocNangBacLuong : '');
            this.soHieuVanBan.value(soHieuVanBan ? soHieuVanBan : '');
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
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            chucDanhNgheNghiep: this.chucDanhNgheNghiep.value(),
            bac: this.bac.value(),
            heSoLuong: this.heSoLuong.value(),
            phuCapThamNienVuotKhung: this.phuCapThamNienVuotKhung.value(),
            ngayHuong: Number(this.ngayHuong.value()),
            mocNangBacLuong: this.mocNangBacLuong.value(),
            soHieuVanBan: this.soHieuVanBan.value(),
        };
        if (!this.ngayHuong.value()) {
            T.notify('Ngày hưởng lương trống', 'danger');
            this.ngayHuong.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Ngày bắt đầu trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày bắt đầu lớn hơn ngày kết thúc', 'danger');
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
            title: this.state.id ? 'Cập nhật thông tin lương' : 'Tạo mới thông tin lương',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-4' ref={e => this.chucDanhNgheNghiep = e} label='Chức danh nghề nghiệp' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.bac = e} label='Bậc' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-4' ref={e => this.heSoLuong = e} label='Hệ số lương' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.phuCapThamNienVuotKhung = e} label='Phụ cấp thâm niên vượt khung' readOnly={readOnly} />
                <FormDatePicker className='col-md-6' type='date-mask' ref={e => this.ngayHuong = e} label="Ngày hưởng" readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.mocNangBacLuong = e} label='Mốc nâng bậc lương' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soHieuVanBan = e} label='Số hiệu văn bản' readOnly={readOnly} />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
            </div>,
        });
    }
}


class QtLuongUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: 0, tinhTrang: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtLuongUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin lương', 'Bạn có chắc bạn muốn xóa thông tin lương này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtLuongUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin lương bị lỗi!', 'danger');
                else T.alert('Xoá thông tin lương thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: false,
                delete: false
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtLuong && this.props.qtLuong.userPage ? this.props.qtLuong.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức danh nghề nghiệp</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Số hiệu văn bản</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.chucDanhNgheNghiep} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Bậc: </i></span> <span>{item.bac}</span> <br />
                                <span><i>Hệ số lương: </i></span><span>{item.heSoLuong}</span> <br />
                                <span><i>Phụ cấp thâm niên vượt khung: </i></span><span>{item.phuCapThamNienVuotKhung}</span> <br />
                                <span><i>Mốc nâng bậc lương: </i></span><span>{item.mocNangBacLuong}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ngayHuong ? <span style={{ whiteSpace: 'nowrap' }}>Ngày hưởng: <span style={{ color: 'blue' }}>{item.ngayHuong ? T.dateToText(item.ngayHuong, 'dd/mm/yyyy') : ''}</span></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.soHieuVanBan} />
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
                            </>
                        )}></TableCell>
                        {
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} >
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Quá trình lương',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Lương'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtLuongUserPage} update={this.props.updateQtLuongUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtLuong: state.tccb.qtLuong });
const mapActionsToProps = {
    updateQtLuongUserPage, deleteQtLuongUserPage,
    createQtLuongUserPage, getQtLuongUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtLuongUserPage);