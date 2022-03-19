import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    updateQtBaoHiemXaHoiUserPage, deleteQtBaoHiemXaHoiUserPage,
    createQtBaoHiemXaHoiUserPage, getQtBaoHiemXaHoiUserPage,
} from './redux';
import { SelectAdapter_DmChucVuV1 } from 'modules/mdDanhMuc/dmChucVu/redux';

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
        let { id, batDau, batDauType, ketThuc, ketThucType, chucVu, mucDong, phuCapChucVu, phuCapThamNienVuotKhung, phuCapThamNienNghe, tyLeDong } = item && item.item ? item.item : {
            id: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', chucVu: '', mucDong: '', phuCapChucVu: '', phuCapThamNienVuotKhung: '', phuCapThamNienNghe: '', tyLeDong: ''
        };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau);
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
            this.state.ketThuc != -1 && this.ketThuc.setVal(ketThuc ? ketThuc : '');
            this.chucVu.value(chucVu ? chucVu : '');
            this.mucDong.value(mucDong ? mucDong : '');
            this.phuCapChucVu.value(phuCapChucVu ? phuCapChucVu : '');
            this.phuCapThamNienVuotKhung.value(phuCapThamNienVuotKhung ? phuCapThamNienVuotKhung : '');
            this.phuCapThamNienNghe.value(phuCapThamNienNghe ? phuCapThamNienNghe : '');
            this.tyLeDong.value(tyLeDong ? tyLeDong : '');
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
            chucVu: this.chucVu.value(),
            mucDong: this.mucDong.value(),
            phuCapChucVu: this.phuCapChucVu.value(),
            phuCapThamNienVuotKhung: this.phuCapThamNienVuotKhung.value(),
            phuCapThamNienNghe: this.phuCapThamNienNghe.value(),
            tyLeDong: this.tyLeDong.value(),
        };
        if (!this.batDau.getVal()) {
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
            title: this.state.id ? 'Cập nhật thông tin bảo hiểm xã hội' : 'Tạo mới thông tin bảo hiểm xã hội',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-6' ref={e => this.chucVu = e} label='Chức vụ' data={SelectAdapter_DmChucVuV1} readOnly={readOnly} />
                <FormTextBox className='col-md-3' type='number' ref={e => this.mucDong = e} label='Mức đóng' readOnly={readOnly} />
                <FormTextBox className='col-md-3' type='number' ref={e => this.tyLeDong = e} label='Tỷ lệ đóng' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapChucVu = e} label='Phụ cấp chức vụ' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapThamNienVuotKhung = e} label='Phụ cấp thâm niên vượt khung' readOnly={readOnly} />
                <FormTextBox className='col-md-4' type='number' ref={e => this.phuCapThamNienNghe = e} label='Phụ cấp thâm niên nghề' readOnly={readOnly} />
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
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
            </div>,
        });
    }
}

class QtBaoHiemXaHoiUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: 0, tinhTrang: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtBaoHiemXaHoiUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin bảo hiểm xã hội', 'Bạn có chắc bạn muốn xóa thông tin bảo hiểm xã hội này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtBaoHiemXaHoiUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin bảo hiểm xã hội bị lỗi!', 'danger');
                else T.alert('Xoá thông tin bảo hiểm xã hội thành công!', 'success', false, 800);
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtBaoHiemXaHoi && this.props.qtBaoHiemXaHoi.userPage ? this.props.qtBaoHiemXaHoi.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin tham gia</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thông tin phụ cấp</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucVu} />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Mức đóng: </i></span> <span>{item.mucDong}</span> <br />
                                <span><i>Tỷ lệ đóng: </i></span><span>{item.tyLeDong}</span> <br />
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Phụ cấp chức vụ: </i></span> <span>{item.phuCapChucVu}</span> <br />
                                <span><i>Phụ cấp thâm niên vượt khung: </i></span> <span>{item.phuCapThamNienVuotKhung}</span> <br />
                                <span><i>Phụ cấp thâm niên nghề: </i></span> <span>{item.phuCapThamNienNghe}</span> <br />
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
                            </>
                        )}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc })} onDelete={e => this.delete(e, item)} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-life-ring',
            title: 'Quá trình bảo hiểm xã hội',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Bảo hiểm xã hội'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtBaoHiemXaHoiUserPage} update={this.props.updateQtBaoHiemXaHoiUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtBaoHiemXaHoi: state.tccb.qtBaoHiemXaHoi });
const mapActionsToProps = {
    updateQtBaoHiemXaHoiUserPage, deleteQtBaoHiemXaHoiUserPage,
    createQtBaoHiemXaHoiUserPage, getQtBaoHiemXaHoiUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtBaoHiemXaHoiUserPage);