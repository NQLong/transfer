import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
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
            item, batDau, ketThuc,
            shcc: item.shcc
        });

        setTimeout(() => {
            this.batDau.setVal(batDau);
            this.ketThuc.setVal(ketThuc);
            this.batDauType.setText({ text: batDauType ? batDauType : 'dd/mm/yyyy' });
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.chucDanhNgheNghiep.value(chucDanhNgheNghiep ? chucDanhNgheNghiep : '');
            this.bac.value(bac ? bac : '');
            this.heSoLuong.value(heSoLuong ? heSoLuong : '');
            this.phuCapThamNienVuotKhung.value(phuCapThamNienVuotKhung ? phuCapThamNienVuotKhung : '');
            this.ngayHuong.value(ngayHuong ? ngayHuong : '');
            this.mocNangBacLuong.value(mocNangBacLuong ? mocNangBacLuong : '');
            this.soHieuVanBan.value(soHieuVanBan ? soHieuVanBan : '');
        }, 500);
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            chucDanhNgheNghiep: this.chucDanhNgheNghiep.value(),
            bac: this.bac.value(),
            heSoLuong: this.heSoLuong.value(),
            phuCapThamNienVuotKhung: this.phuCapThamNienVuotKhung.value(),
            ngayHuong: Number(this.ngayHuong.value()),
            mocNangBacLuong: this.mocNangBacLuong.value(),
            soHieuVanBan: this.soHieuVanBan.value(),
        };
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
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
                <FormDatePicker className='col-md-6' ref={e => this.ngayHuong = e} label="Ngày hưởng" readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.mocNangBacLuong = e} label='Mốc nâng bậc lương' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.soHieuVanBan = e} label='Số hiệu văn bản' readOnly={readOnly} />
                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Thời gian bắt đầu'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian bắt đầu (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Thời gian kết thúc'
                    label={
                        <div style={{ display: 'flex' }}>Thời gian kết thúc (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)</div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>
            </div>,
        });
    }
}


class QtLuongUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready(() => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { list_shcc: shcc, list_dv: '', fromYear: null, toYear: null, timeType: 0 } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtLuongUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({item: null, shcc: this.state.filter.list_shcc});
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
                write: true,
                delete: true
            };
        }
        const { isStaff, shcc } = this.props.system && this.props.system.user ? this.props.system.user : { isStaff: false, shcc: '' };
        const { firstName, lastName } = isStaff && this.props.system.user || { firstName: '', lastName: '' };
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtLuong && this.props.qtLuong.user_page ? this.props.qtLuong.user_page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
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
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={item.chucDanhNgheNghiep}/>
                        <TableCell type='text' style={{  whiteSpace: 'nowrap' }} content={(
                            <>
                                <span><i>Bậc: </i></span> <span>{item.bac}</span> <br/>
                                <span><i>Hệ số lương: </i></span><span>{item.heSoLuong}</span> <br/>
                                <span><i>Phụ cấp thâm niên vượt khung: </i></span><span>{item.phuCapThamNienVuotKhung}</span> <br/>
                                <span><i>Mốc nâng bậc lương: </i></span><span>{item.mocNangBacLuong}</span>
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br/></span> : null}
                                {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br/></span> : null}
                                {item.ngayHuong ? <span style={{ whiteSpace: 'nowrap' }}>Ngày hưởng: <span style={{ color: 'blue' }}>{item.ngayHuong ? T.dateToText(item.ngayHuong, 'dd/mm/yyyy') : ''}</span></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.soHieuVanBan}/>
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