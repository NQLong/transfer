import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormRichTextBox, FormTextBox, renderTable, TableCell, FormCheckbox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtNghiKhongLuongUserPage, deleteQtNghiKhongLuongUserPage, createQtNghiKhongLuongUserPage,
    updateQtNghiKhongLuongUserPage
}
    from './redux';

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
        let { id, soVanBan, batDau, batDauType, ketThuc, ketThucType, thoiGianDiLam, soThongBao, tongThoiGian, thoiGianTroLaiCongTac, ghiChu, thongBaoSo,
            thamGiaBHXH, thoiGianBaoGiam, thoiGianBaoTang } = item.item ? item.item : {
                id: '', soVanBan : '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', thoiGianDiLam: '', soThongBao: '', tongThoiGian: '', thoiGianTroLaiCongTac: '', ghiChu: '', thongBaoSo: '',
                thamGiaBHXH: '', thoiGianBaoGiam: '', thoiGianBaoTang: ''
        };
        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
            this.soVanBan.value(soVanBan ? soVanBan : '');
            this.thoiGianDiLam.value(thoiGianDiLam ? thoiGianDiLam : '');
            this.soThongBao.value(soThongBao ? soThongBao : '');
            this.tongThoiGian.value(tongThoiGian ? tongThoiGian : '');
            this.thoiGianTroLaiCongTac.value(thoiGianTroLaiCongTac ? thoiGianTroLaiCongTac : '');
            this.ghiChu.value(ghiChu ? ghiChu : '');
            this.thongBaoSo.value(thongBaoSo ? thongBaoSo : '');
            this.thamGiaBHXH.value(thamGiaBHXH ? thamGiaBHXH : 0);
            this.thoiGianBaoGiam.value(thoiGianBaoGiam ? thoiGianBaoGiam : '');
            this.thoiGianBaoTang.value(thoiGianBaoTang ? thoiGianBaoTang : '');

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
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: !this.state.denNay ? this.state.ketThucType : '',
            ketThuc: !this.state.denNay ? this.ketThuc.getVal() : -1,
            soVanBan: this.soVanBan.value(),
            thoiGianDiLam: this.thoiGianDiLam.value() ? Number(this.thoiGianDiLam.value()) : null,
            soThongBao: this.soThongBao.value(),
            tongThoiGian: this.tongThoiGian.value(),
            thoiGianTroLaiCongTac: this.thoiGianTroLaiCongTac.value() ? Number(this.thoiGianTroLaiCongTac.value()) : null,
            thongBaoSo: this.thongBaoSo.value(),
            thamGiaBHXH: this.thamGiaBHXH.value(),
            thoiGianBaoGiam: this.thoiGianBaoGiam.value(),
            thoiGianBaoTang: this.thoiGianBaoTang.value(),
            ghiChu: this.ghiChu.value(),
        };
        if (!changes.batDau) {
            T.notify('Ngày bắt đầu nghỉ không lương trống', 'danger');
            this.batDau.focus();
        } else if (!this.state.denNay && !this.ketThuc.getVal()) {
            T.notify('Ngày kết thúc nghỉ không lương trống', 'danger');
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
            title: this.state.shcc ? 'Cập nhật quá trình nghỉ không lương' : 'Tạo mới quá trình nghỉ không lương',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-4' ref={e => this.soVanBan = e} readOnly={readOnly} label='Số văn bản' />
                <FormTextBox className='col-md-4' ref={e => this.soThongBao = e} label='Số thông báo' />
                <FormTextBox className='col-md-4' ref={e => this.thongBaoSo = e} label='Thông báo số' />
                <FormCheckbox ref={e => this.thamGiaBHXH = e} label='Tham gia BHXH' className='col-md-12' />
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
                <span className='col-md-12'></span>
                <FormDatePicker className='col-md-4' ref={e => this.thoiGianDiLam = e} label='Thời gian đi làm' type='date-mask' readOnly={readOnly}/>
                <FormDatePicker className='col-md-4' ref={e => this.thoiGianTroLaiCongTac = e} label='Thời gian trở lại công tác' type='date-mask' readOnly={readOnly}/>
                <FormTextBox className='col-md-4' ref={e => this.tongThoiGian = e} label='Tổng thời gian' />
                <FormTextBox className='col-md-6' ref={e => this.thoiGianBaoGiam = e} label='Thời gian báo giảm' />
                <FormTextBox className='col-md-6' ref={e => this.thoiGianBaoTang = e} label='Thời gian báo tăng' />
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} rows={2} readOnly={readOnly} label='Ghi chú' placeholder='Ghi chú (tối đa 200 ký tự)' maxLength={200} />
            </div>
        });
    }
}

class QtNghiKhongLuongUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, tinhTrang: null, timeType: 0 } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtNghiKhongLuongUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin nghỉ không lương', 'Bạn có chắc bạn muốn xóa thông tin nghỉ không lương này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtNghiKhongLuongUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin nghỉ không lương bị lỗi!', 'danger');
                else T.alert('Xoá thông tin nghỉ không lương thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
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

    render() {
        let permission = this.getUserPermission('staff', ['login']);
        if (permission.login == true) {
            permission = {
                write: true,
                delete: true
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtNghiKhongLuong && this.props.qtNghiKhongLuong.userPage ? this.props.qtNghiKhongLuong.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Thông tin nghỉ</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian đi làm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tổng thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tham gia BHXH</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian báo giảm</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tham gia báo tăng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span></span> <br />
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ color: 'blue' }}>Số văn bản: </span>{item.soVanBan}<br/>
                                <span style={{ color: 'blue' }}>Thông báo số: </span>{item.thongBaoSo}<br/>
                                <span style={{ color: 'blue' }}>Số thông báo: </span>{item.soThongBao}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, 'dd/mm/yyyy') : ''}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.tongThoiGian}</span>
                            </>
                        )}
                        />
                        <TableCell type='checkbox' content={(
                            <>
                                <span>{item.thamGiaBHXH}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.thoiGianBaoGiam}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.thoiGianBaoTang}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{(item.ketThuc == -1 || item.ketThuc >= item.today) ? <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đang nghỉ</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc nghỉ</span>}</span>
                            </>
                        )}></TableCell>
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-window-close',
            title: 'Quá trình nghỉ không lương',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Danh sách nghỉ không lương'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtNghiKhongLuongUserPage} update={this.props.updateQtNghiKhongLuongUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtNghiKhongLuong: state.tccb.qtNghiKhongLuong });
const mapActionsToProps = {
    getQtNghiKhongLuongUserPage, deleteQtNghiKhongLuongUserPage,
    updateQtNghiKhongLuongUserPage, createQtNghiKhongLuongUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtNghiKhongLuongUserPage);