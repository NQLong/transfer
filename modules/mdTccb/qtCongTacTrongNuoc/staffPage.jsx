import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtCongTacTrongNuocUserPage, deleteQtCongTacTrongNuocUserPage, createQtCongTacTrongNuocUserPage,
    updateQtCongTacTrongNuocUserPage
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
class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };

    onShow = (item) => {
        let { id, noiDen, batDau, batDauType, ketThuc, ketThucType, vietTat, lyDo, kinhPhi, ghiChu, soCv, ngayQuyetDinh } = item && item.item ? item.item : {
            id: '', noiDen: '', batDau: null, batDauType: '', ketThuc: null, ketThucType: '', vietTat: '', lyDo: '', kinhPhi: null, ghiChu: '', soCv: '', ngayQuyetDinh: null,
        };

        this.setState({
            id, batDauType: batDauType ? batDauType : 'dd/mm/yyyy',
            ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
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
            this.ketThucType.setText({ text: ketThucType ? ketThucType : 'dd/mm/yyyy' });
            this.batDau.setVal(batDau ? batDau : '');
            this.ketThuc.setVal(ketThuc ? ketThuc : '');
        });
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.state.shcc,
            noiDen: this.noiDen.value().toString(),
            vietTat: this.vietTat.value(),
            lyDo: this.lyDo.value(),
            kinhPhi: this.kinhPhi.value(),
            ghiChu: this.ghiChu.value(),
            soCv: this.soCv.value(),
            ngayQuyetDinh: this.ngayQuyetDinh.value() ? Number(this.ngayQuyetDinh.value()) : '',

            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal()
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
        } else if (!this.ketThuc.getVal()) {
            T.notify('Ngày về trống', 'danger');
            this.ketThuc.focus();
        } else if (this.batDau.getVal() > this.ketThuc.getVal()) {
            T.notify('Ngày đi lớn hơn ngày về', 'danger');
            this.batDau.focus();
        } else {
            this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình công tác trong nước' : 'Tạo mới quá trình công tác trong nước',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-3' ref={e => this.soCv = e} type='text' label='Số công văn' readOnly={readOnly} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.vietTat = e} label='Mục đích' data={SelectAdapter_DmMucDichTrongNuoc} readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.lyDo = e} rows={2} readOnly={readOnly} label='Nội dung' placeholder='Nhập nội dung công tác trong nước (tối đa 500 ký tự)' required maxLength={500} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.noiDen = e} label='Nơi đến' data={SelectAdapter_DmTinhThanhPhoV2} required readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.kinhPhi = e} rows={2} type='text' label='Kinh phí' readOnly={readOnly} placeholder='Nhập kinh phí (tối đa 200 ký tự)' maxLength={200}/>

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (định dạng:&nbsp; <Dropdown ref={e => this.batDauType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ batDauType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} readOnly={readOnly} /></div>
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>Ngày về (định dạng:&nbsp; <Dropdown ref={e => this.ketThucType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ketThucType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} readOnly={readOnly} /></div>

                <FormTextBox className='col-md-12' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={readOnly} />
            </div>
        });
    }
}

class QtCongTacTrongNuocUserPage extends AdminPage {
    state = { filter: {} };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: null, tinhTrang: null, loaiHocVi: null, mucDich: null } });
            this.getPage();
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtCongTacTrongNuocUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin công tác trong nước', 'Bạn có chắc bạn muốn xóa thông tin công tác trong nước này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtCongTacTrongNuocUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin công tác trong nước bị lỗi!', 'danger');
                else T.alert('Xoá thông tin công tác trong nước thành công!', 'success', false, 800);
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtCongTacTrongNuoc && this.props.qtCongTacTrongNuoc.userPage ? this.props.qtCongTacTrongNuoc.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số công văn</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nơi đến</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Mục đích</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nội dung</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thời gian</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tình trạng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{color: 'blue'}} content={(item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : '')} />
                        <TableCell type='text' content={(<b> {item.soCv || ''} </b>)} />
                        <TableCell type='text' style={{color: 'blue'}} content={(item.danhSachTinh || '')} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(<b>{item.tenMucDich || ''}</b>)} />
                        <TableCell type='text' contentClassName='multiple-lines-5' content={(item.lyDo || '')} />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Ngày đi: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc ? <span style={{ whiteSpace: 'nowrap' }}>Ngày về: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                <span>{item.batDau > item.today ? <span style={{ whiteSpace: 'nowrap' }}><i>Chưa diễn ra</i></span> : item.ketThuc >= item.today ? <span style={{ color: 'blue', whiteSpace: 'nowrap' }}>Đang diễn ra</span> : <span style={{ color: 'red', whiteSpace: 'nowrap' }}>Đã kết thúc</span>}</span>
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
            icon: 'fa fa-pencil-square-o',
            title: 'Quá trình công tác trong nước',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Công tác trong nước'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtCongTacTrongNuocUserPage} update={this.props.updateQtCongTacTrongNuocUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtCongTacTrongNuoc: state.tccb.qtCongTacTrongNuoc });
const mapActionsToProps = {
    getQtCongTacTrongNuocUserPage, deleteQtCongTacTrongNuocUserPage,
    updateQtCongTacTrongNuocUserPage, createQtCongTacTrongNuocUserPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtCongTacTrongNuocUserPage);