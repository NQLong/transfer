import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormDatePicker } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtKeoDaiCongTacUserPage, deleteQtKeoDaiCongTacUserPage,
    createQtKeoDaiCongTacUserPage, getQtKeoDaiCongTacUserPage,
} from './redux';
import { getTuoiNghiHuu } from 'modules/mdDanhMuc/dmNghiHuu/redux';
import { DateInput } from 'view/component/Input';
import { getStaff } from 'modules/mdTccb/tccbCanBo/redux';
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

class EditModal extends AdminModal {
    state = {
        id: null,
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
    };


    onShow = (item) => {
        let { id, batDau, batDauType, ketThuc, ketThucType, soQuyetDinh, ngayQuyetDinh } = item && item.item ? item.item : {
            id: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', soQuyetDinh: '', ngayQuyetDinh: '',
        };
        this.setState({
            id, batDauType: 'dd/mm/yyyy',
            ketThucType: 'dd/mm/yyyy',
            batDau, ketThuc,
            shcc: item.shcc
        }, () => {
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
            shcc: this.state.shcc,
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

class QtKeoDaiCongTacUserPage extends AdminPage {
    state = { filter: {}, canBo: {}, ngayNghiHuu: ''};
    componentDidMount() {
        T.ready('/user', () => {
            const { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' };
            this.props.getStaff(shcc, item => {
                this.props.getTuoiNghiHuu(item.item.phai, item.item.ngaySinh, itemNghiHuu => {
                    this.setState({ filter: { listShcc: shcc, listDv: '' }, canBo: item.item, ngayNghiHuu: new Date(itemNghiHuu.resultDate).getTime() }, () => {
                        this.getPage();
                    });
                });
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getQtKeoDaiCongTacUserPage(pageN, pageS, pageC, this.state.filter, done);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show({ item: null, shcc: this.state.canBo.shcc });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin kéo dài công tác', 'Bạn có chắc bạn muốn xóa thông tin kéo dài công tác này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKeoDaiCongTacUserPage(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin kéo dài công tác bị lỗi!', 'danger');
                else T.alert('Xoá thông tin kéo dài công tác thành công!', 'success', false, 800);
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
        const phai = isStaff ? this.state.canBo.phai == '01' ? 'Nam' : 'Nữ' : '';
        const ngaySinh = isStaff ? T.dateToText(this.state.canBo.ngaySinh, 'dd/mm/yyyy') : '';
        const name = isStaff ? `${lastName} ${firstName} (${shcc})` : '';
        const textGioiTinh = isStaff ? `Giới tính: ${phai}` : '';
        const textNgaySinh = isStaff ? `Ngày sinh: ${ngaySinh}` : '';
        const textNgayNghiHuu = isStaff && this.state.ngayNghiHuu ? `Ngày đủ tuổi nghỉ hưu: ${T.dateToText(this.state.ngayNghiHuu, 'dd/mm/yyyy')}` : '';
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtKeoDaiCongTac && this.props.qtKeoDaiCongTac.userPage ? this.props.qtKeoDaiCongTac.userPage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày quyết định</th>
                        <th style={{ width: '100%', whiteSpace: 'nowrap', textAlign: 'center' }}>Thời gian được kéo dài</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={(<b> {item.soQuyetDinh || ''} </b>)} />
                        <TableCell type='text' style={{color: 'blue'}} content={(item.ngayQuyetDinh ? T.dateToText(item.ngayQuyetDinh, 'dd/mm/yyyy') : '')} />
                        <TableCell type='text' content={(
                            <>
                                {item.batDau ? <span style={{ whiteSpace: 'nowrap' }}>Bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                                {item.ketThuc && item.ketThuc != -1 ? <span style={{ whiteSpace: 'nowrap' }}>Kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc && item.ketThuc != -1 ? T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : ''}</span><br /></span> : null}
                            </>
                        )}
                        />
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
            icon: 'fa fa-hourglass-start',
            title: 'Quá trình kéo dài công tác',
            subTitle: <span style={{ color: 'blue' }}>Cán bộ: {name}<br/>{textGioiTinh}<br/>{textNgaySinh}<br/>{textNgayNghiHuu}</span>,
            breadcrumb: [
                <Link key={0} to='/user/'>Trang cá nhân</Link>,
                'Kéo dài công tác'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />
                <EditModal ref={e => this.modal = e} shcc={this.shcc} readOnly={!permission.write}
                    create={this.props.createQtKeoDaiCongTacUserPage} update={this.props.updateQtKeoDaiCongTacUserPage}
                />
            </>,
            backRoute: '/user',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKeoDaiCongTac: state.tccb.qtKeoDaiCongTac });
const mapActionsToProps = {
    updateQtKeoDaiCongTacUserPage, deleteQtKeoDaiCongTacUserPage,
    createQtKeoDaiCongTacUserPage, getQtKeoDaiCongTacUserPage, getStaff, getTuoiNghiHuu
};
export default connect(mapStateToProps, mapActionsToProps)(QtKeoDaiCongTacUserPage);