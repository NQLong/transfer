import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormDatePicker, FormRichTextBox, FormTextBox, renderTable, TableCell, FormCheckbox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { DateInput } from 'view/component/Input';
import {
    getQtDiNuocNgoaiUserPage, deleteQtDiNuocNgoaiUserPage, createQtDiNuocNgoaiUserPage,
    updateQtDiNuocNgoaiUserPage, getThongKeMucDich
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
class EditModal extends AdminModal {
    state = {
        id: null,
        ngayDi: '',
        ngayVe: null,
        dangDienRa: true,
        ngayDiType: 'dd/mm/yyyy',
        ngayVeType: 'dd/mm/yyyy',
        tiepNhan: false,
        giaHan: false,
        mucDich: '',
        readOnly: false,
    };
    // Table name: QT_DI_NUOC_NGOAI { id, shcc, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, loaiChiPhi, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc }

    onShow = (item) => {
        let { id, quocGia, ngayDi, ngayDiType, ngayVe, ngayVeType, mucDich, noiDung, chiPhi, ghiChu, soQuyetDinh, ngayQuyetDinh, today, soQdTiepNhan, ngayQdTiepNhan, noiDungTiepNhan, ngayVeNuoc } = item && item.item ? item.item : {
            id: '', quocGia: '', ngayDi: null, ngayDiType: '', ngayVe: null, ngayVeType: '', mucDich: '', noiDung: '', chiPhi: null, ghiChu: '', soQuyetDinh: '', ngayQuyetDinh: null, today: new Date().getTime(), soQdTiepNhan: '', ngayQdTiepNhan: null, noiDungTiepNhan: '', ngayVeNuoc: null,
        };

        this.setState({
            id, ngayDiType: ngayDiType ? ngayDiType : 'dd/mm/yyyy',
            ngayVeType: ngayVeType ? ngayVeType : 'dd/mm/yyyy',
            ngayDi, ngayVe,
            dangDienRa: ngayVe ? (ngayVe == -1 || ngayVe >= today) : true,
            tiepNhan: soQdTiepNhan ? true : false,
            shcc: item.shcc,
            giaHan: false,
            mucDich: mucDich,
            readOnly: this.props.canEdit,
        }, () => {
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
            shcc: this.state.shcc,
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

    handleGiaHan = (value) => {
        if (value) {
            this.setState({ giaHan: true, readOnly: false }, () => {
                this.ghiChu.value('Đang chờ gia hạn');
                this.mucDich.value('16');
            });
        } else {
            this.setState({ giaHan: false, readOnly: true }, () => {
                this.mucDich.value(this.state.mucDich);
                this.ghiChu.value('');
            });
        }
    }

    render = () => {
        const readOnly = this.state.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình đi nước ngoài' : 'Tạo mới quá trình đi nước ngoài',
            size: 'elarge',
            body: <div className='row'>
                <FormTextBox className='col-md-3' ref={e => this.soQuyetDinh = e} type='text' label='Số quyết định' readOnly={this.props.canEdit} />
                <FormDatePicker className='col-md-3' ref={e => this.ngayQuyetDinh = e} type='date-mask' label='Ngày quyết định' readOnly={this.props.canEdit} />
                <FormSelect className='col-md-6' ref={e => this.mucDich = e} label='Mục đích' data={SelectAdapter_DmMucDichNuocNgoaiV2} readOnly={readOnly} />
                <FormRichTextBox className='col-md-12' ref={e => this.noiDung = e} rows={2} label='Nội dung' placeholder='Nhập nội dung đi nước ngoài (tối đa 1000 ký tự)' required readOnly={this.props.canEdit} />
                <FormSelect className='col-md-12' multiple={true} ref={e => this.quocGia = e} label='Quốc gia' data={SelectAdapter_DmQuocGia} required readOnly={this.props.canEdit} />
                <FormTextBox className='col-md-8' ref={e => this.chiPhi = e} rows={2} type='text' label='Chi phí' readOnly={this.props.canEdit} placeholder='Nhập chi phí (tối đa 500 ký tự)'/>
                <FormTextBox className='col-md-4' ref={e => this.ghiChu = e} type='text' label='Ghi chú' readOnly={this.props.canEdit} />

                <div className='form-group col-md-5'><DateInput ref={e => this.ngayDi = e} placeholder='Ngày đi'
                    label={
                        <div style={{ display: 'flex' }}>Ngày đi (&nbsp; <Dropdown ref={e => this.ngayDiType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayDiType: item })} readOnly={this.props.canEdit} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayDiType ? typeMapper[this.state.ngayDiType] : null} readOnly={this.props.canEdit} /></div>
                <FormCheckbox ref={e => this.denNayCheck = e} label='Đang diễn ra' onChange={this.handleNgayVe} className='form-group col-md-2' readOnly={readOnly} />
                <div className='form-group col-md-5' id='ketThucDate'><DateInput ref={e => this.ngayVe = e} placeholder='Ngày về'
                    label={
                        <div style={{ display: 'flex' }}>{this.state.dangDienRa ? 'Ngày về dự kiến' : 'Ngày về'} (&nbsp; <Dropdown ref={e => this.ngayVeType = e}
                            items={[...Object.keys(EnumDateType).map(key => EnumDateType[key].text)]}
                            onSelected={item => this.setState({ ngayVeType: item })} readOnly={readOnly} />)&nbsp;<span style={{ color: 'red' }}> *</span></div>
                    }
                    type={this.state.ngayVeType ? typeMapper[this.state.ngayVeType] : null} readOnly={readOnly} /></div>
                {this.state.tiepNhan && <FormCheckbox label='Đã tiếp nhận' className='form-group col-md-6' ref={e => this.tiepNhanCheck = e} readOnly={true} />}
                <div className='row form-group col-12' id='tiepNhan'>
                    <FormTextBox className='col-md-4' ref={e => this.soQdTiepNhan = e} type='text' label='Số quyết định tiếp nhận' readOnly={this.props.canEdit} required />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayQdTiepNhan = e} type='date-mask' label='Ngày quyết định tiếp nhận' readOnly={this.props.canEdit} />
                    <FormDatePicker className='col-md-4' ref={e => this.ngayVeNuoc = e} type='date-mask' label='Ngày về nước' readOnly={this.props.canEdit} />
                    <FormRichTextBox className='col-md-12' ref={e => this.noiDungTiepNhan = e} rows={3} readOnly={this.props.canEdit} label='Nội dung tiếp nhận' placeholder='Nhập nội dung tiếp nhận về nước (tối đa 1000 ký tự)' />
                </div>
                {!this.state.tiepNhan && <FormCheckbox label='Bấm vào đây nếu bạn muốn gia hạn' onChange={this.handleGiaHan} className='form-group col-md-6' />}
            </div>
        });
    }
}

class QtDiNuocNgoaiUserPage extends AdminPage {
    state = { filter: {}, listMucDich: [] };
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.thongKeMucDich('', { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: null, tinhTrang: null, loaiHocVi: null, mucDich: null }, (items) => {
                this.setState({ filter: { listShcc: shcc, listDv: '', fromYear: null, toYear: null, timeType: null, tinhTrang: null, loaiHocVi: null, mucDich: null }, listMucDich: this.setUp(items, 'tenMucDich') }, () => {
                    this.getPage();
                });
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
    
    thongKeMucDich = (pageC, filter, done) => {
        this.props.getThongKeMucDich(pageC, filter, done);
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtDiNuocNgoaiUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.filter.listShcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin đi nước ngoài', 'Bạn có chắc bạn muốn xóa thông tin đi nước ngoài này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDiNuocNgoaiUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin đi nước ngoài bị lỗi!', 'danger');
                else T.alert('Xoá thông tin đi nước ngoài thành công!', 'success', false, 800);
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDiNuocNgoai && this.props.qtDiNuocNgoai.userPage ? this.props.qtDiNuocNgoai.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: true,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
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
                            onEdit={() => this.modal.show({ item, shcc })} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-fighter-jet',
            title: 'Quá trình đi nước ngoài',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Công tác ngoài nước'
            ],
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
                <EditModal ref={e => this.modal = e} shcc={this.shcc} canEdit={!permission.write}
                    create={this.props.createQtDiNuocNgoaiUserPage} update={this.props.updateQtDiNuocNgoaiUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDiNuocNgoai: state.tccb.qtDiNuocNgoai });
const mapActionsToProps = {
    getQtDiNuocNgoaiUserPage, deleteQtDiNuocNgoaiUserPage,
    updateQtDiNuocNgoaiUserPage, createQtDiNuocNgoaiUserPage, getThongKeMucDich
};
export default connect(mapStateToProps, mapActionsToProps)(QtDiNuocNgoaiUserPage);