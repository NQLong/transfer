import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import { getQtHoTroHocPhiUserPage, deleteQtHoTroHocPhiUserPage, updateQtHoTroHocPhiUserPage, createQtHoTroHocPhiUserPage } from './redux';
import { SelectAdapter_DmHoTroHocPhiCoSo } from 'modules/mdDanhMuc/dmHoTroHocPhiCoSo/redux';

const EnumDateType = Object.freeze({
    0: { text: '' },
    1: { text: 'dd/mm/yyyy' },
    2: { text: 'mm/yyyy' },
    3: { text: 'yyyy' }
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
        ketThucType: 'dd/mm/yyyy'
    };
    onShow = (item) => {
        let { id, ngayLamDon, noiDung, coSoDaoTao, batDau, batDauType, ketThuc, ketThucType, hocKyHoTro, soTien, hoSo, ghiChu } = item && item.item ? item.item : {
            id: '', ngayLamDon: null, noiDung: '', coSoDaoTao: '', batDau: null, batDauType: '', ketThucType: '', hocKyHoTro: '', soTien: '', hoSo: '', ghiChu: ''
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
            this.ngayLamDon.value(ngayLamDon ? ngayLamDon : '');
            this.noiDung.value(noiDung ? noiDung : '');
            this.coSoDaoTao.value(coSoDaoTao);
            this.hocKyHoTro.value(hocKyHoTro ? hocKyHoTro : '');
            this.soTien.value(soTien ? soTien : '');
            this.hoSo.value(hoSo ? hoSo : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');

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
            shcc: this.state.shcc,
            ngayLamDon: this.ngayLamDon.value() ? Number(this.ngayLamDon.value()) : '',
            noiDung: this.noiDung.value(),
            coSoDaoTao: this.coSoDaoTao.value(),
            hocKyHoTro: this.hocKyHoTro.value(),
            soTien: this.soTien.value(),
            hoSo: this.hoSo.value(),
            ghiChu: this.ghiChu.value(),

            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1
        };
        if (!this.ngayLamDon.value()) {
            T.notify('Ngày làm đơn trống', 'danger');
            this.ngayLamDon.focus();
        } else if (!this.coSoDaoTao.value()) {
            T.notify('Cơ sở đào tạo trống', 'danger');
            this.coSoDaoTao.focus();
        } else if (!this.batDau.getVal()) {
            T.notify('Bắt đầu trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Kết thúc trống', 'danger');
            this.ketThuc.focus();
        } else if (!this.state.denNay && this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Bắt đầu lớn hơn kết thúc', 'danger');
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
            title: this.state.id ? 'Cập nhật quá trình hỗ trợ học phí' : 'Tạo mới quá trình hỗ trợ học phí',
            size: 'large',
            body: <div className='row'>
                <FormDatePicker className='col-md-4' ref={e => this.ngayLamDon = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} required />
                <FormSelect className='col-md-8' ref={e => this.coSoDaoTao = e} label='Cơ sở đào tạo' data={SelectAdapter_DmHoTroHocPhiCoSo} required readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} readOnly={readOnly} label='Nội dung xin hỗ trợ' placeholder='Nhập nội dung xin hỗ trợ học phí (tối đa 100 ký tự)' maxLength={100} />
                <FormTextBox className='col-md-6' ref={e => this.hocKyHoTro = e} type='text' label='Học kỳ hỗ trợ' readOnly={readOnly} />
                <FormTextBox className='col-md-6' ref={e => this.soTien = e} type='number' label='Số tiền' readOnly={readOnly} />
                <FormTextBox className='col-md-12' ref={e => this.hoSo = e} type='text' label='Hồ sơ đi kèm' readOnly={readOnly} />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Bắt đầu' label={
                    <div style={{ display: 'flex' }}>Bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e} items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]} onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                } type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đến nay' onChange={this.handleKetThuc} className='form-group col-md-3' />
                <div className='form-group col-md-6' id='ketThucDate'><DateInput ref={e => this.ketThuc = e} placeholder='Kết thúc' label={
                    <div style={{ display: 'flex' }}>Kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e} items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]} onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                } type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>

                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} rows={2} readOnly={readOnly} label='Ghi chú' placeholder='Nhập ghi chú (tối đa 100 ký tự)' maxLength={100} />
            </div>
        });
    }
}

class QtHoTroHocPhiUserPage extends AdminPage {
    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: 0, tinhTrang: null, loaiHocVi: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtHoTroHocPhiUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin hỗ trợ học phí', 'Bạn có chắc bạn muốn xóa thông tin hỗ trợ học phí này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtHoTroHocPhiUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin hỗ trợ học phí bị lỗi!', 'danger');
                else T.alert('Xoá thông tin hỗ trợ học phí thành công!', 'success', false, 800);
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtHoTroHocPhi && this.props.qtHoTroHocPhi.userPage ? this.props.qtHoTroHocPhi.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày làm đơn</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Nội dung hỗ trợ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cơ sở đào tạo</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian/Khóa học</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học kỳ hỗ trợ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số tiền hỗ trợ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='date' dateFormat='dd/mm/yyyy' content={item.ngayLamDon} />
                        <TableCell type='text' content={(<i> {item.noiDung || ''}</i>)} />
                        <TableCell type='text' content={(<b> {item.tenTruong || ''}</b>)} />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span></span> : null}
                            </>
                        )} />
                        <TableCell type='text' content={(<b> {item.hocKyHoTro || ''} </b>)} />
                        <TableCell type='text' content={(<b>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.soTien)}</b>)} />
                        <TableCell type='text' content={
                            (item.ketThuc == -1 || item.ketThuc >= item.today) ?
                                <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang diễn ra</span> :
                                <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>
                        } />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-usd',
            title: 'Quá trình hỗ trợ học phí',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Công tác trong nước'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write} create={this.props.createQtHoTroHocPhiUserPage} update={this.props.updateQtHoTroHocPhiUserPage} />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtHoTroHocPhi: state.tccb.qtHoTroHocPhi });
const mapActionsToProps = { getQtHoTroHocPhiUserPage, deleteQtHoTroHocPhiUserPage, createQtHoTroHocPhiUserPage, updateQtHoTroHocPhiUserPage };
export default connect(mapStateToProps, mapActionsToProps)(QtHoTroHocPhiUserPage);