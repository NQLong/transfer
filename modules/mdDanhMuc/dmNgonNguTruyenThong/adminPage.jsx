import React from 'react';
import { connect } from 'react-redux';
import { getDmNgonNguAll, createDmNgonNgu, updateDmNgonNgu, deleteDmNgonNgu } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue, FormImageBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { maCode: '' };

    componentDidMount() {
        $(document).ready(() => {
            this.onShown(() => this.tenNgonNgu.focus());
            this.disabledClickOutside();
        });
    }

    onShow = (item) => {
        let { maCode, tenNgonNgu, timKiem, trangCaNhan, dangNhap, dangXuat, xemTatCa, tapTinDinhKem, khongTinTuc, khongSuKien, ketNoi, ketNoiVnu, khongTuyenSinh } = item ? item : { maCode: '', tenNgonNgu: '', timKiem: '', trangCaNhan: '', dangNhap: '', dangXuat: '', xemTatCa: '', tapTinDinhKem: '', khongTinTuc: '', khongSuKien: '', ketNoi: '', ketNoiVnu: '', khongTuyenSinh: '' };
        this.setState({ maCode, item });
        this.maCode.value(maCode);
        this.tenNgonNgu.value(tenNgonNgu || '');
        this.timKiem.value(timKiem || '');
        this.trangCaNhan.value(trangCaNhan || '');
        this.dangNhap.value(dangNhap || '');
        this.dangXuat.value(dangXuat || '');
        this.xemTatCa.value(xemTatCa || '');
        this.tapTinDinhKem.value(tapTinDinhKem || '');
        this.khongTinTuc.value(khongTinTuc || '');
        this.khongSuKien.value(khongSuKien || '');
        this.ketNoi.value(ketNoi || '');
        this.ketNoiVnu.value(ketNoiVnu || '');
        this.khongTuyenSinh.value(khongTuyenSinh || '');

        maCode && this.imageBox.setData('nationFlag:' + maCode, '/img/flag/' + maCode + '.png');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            maCode: getValue(this.maCode).toLowerCase(),
            tenNgonNgu: getValue(this.tenNgonNgu),
            timKiem: getValue(this.timKiem),
            trangCaNhan: getValue(this.trangCaNhan),
            dangNhap: getValue(this.dangNhap),
            dangXuat: getValue(this.dangXuat),
            xemTatCa: getValue(this.xemTatCa),
            tapTinDinhKem: getValue(this.tapTinDinhKem),
            khongTinTuc: getValue(this.khongTinTuc),
            khongSuKien: getValue(this.khongSuKien),
            ketNoi: getValue(this.ketNoi),
            ketNoiVnu: getValue(this.ketNoiVnu),
            khongTuyenSinh: getValue(this.khongTuyenSinh)
        };

        if (changes.maCode == '') {
            T.notify('Mã ngô ngữ bị trống!', 'danger');
            this.maCode.focus();
        } else {
            this.state.maCode ? this.props.update(this.state.maCode, changes, this.hide) : this.props.create(changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const maCode = this.state.maCode;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật danh mục ngoại ngữ' : 'Tạo mới danh mục ngoại ngữ',
            size: 'large',
            body: <div className='row'>
                <div className='col-md-6'>
                    <FormTextBox ref={e => this.maCode = e} label='Mã ngôn ngữ' readOnly={this.state.maCode ? true : readOnly} required />
                    <FormTextBox ref={e => this.tenNgonNgu = e} label='Tên ngôn ngữ' readOnly={readOnly} />
                </div>
                <div className='col-md-6'>
                    <FormImageBox ref={e => this.imageBox = e} readOnly={readOnly} style={{ display: maCode ? '' : 'none' }} uploadType='NationFlag' onSuccess={() => this.props.getAll('')} />
                </div>
                <div className='col-md-12'>
                    <h4 className='tile-title'>Ngôn ngữ hiển thị</h4>
                    <h6 className='tile-title'>Header</h6>
                    <div className='row'>
                        <FormTextBox ref={e => this.timKiem = e} label='Khung tìm kiếm' className='col-md-6' required />
                        <FormTextBox ref={e => this.trangCaNhan = e} label='Trang cá nhân' className='col-md-6' required />
                        <FormTextBox ref={e => this.dangNhap = e} label='Đăng nhập' className='col-md-6' required />
                        <FormTextBox ref={e => this.dangXuat = e} label='Đăng xuất' className='col-md-6' required />
                    </div>

                    <h6 className='tile-title'>Tin tức, sự kiện</h6>
                    <div className='row'>
                        <FormTextBox ref={e => this.xemTatCa = e} label='Xem tất cả' className='col-md-6' required />
                        <FormTextBox ref={e => this.tapTinDinhKem = e} label='Tập tin đính kèm' className='col-md-6' required />
                        <FormTextBox ref={e => this.khongTinTuc = e} label='Không có tin tức' className='col-md-6' required />
                        <FormTextBox ref={e => this.khongSuKien = e} label='Không có sự kiện' className='col-md-6' required />
                    </div>

                    <h6 className='tile-title'>Tuyển sinh</h6>
                    <div className='row'>
                        <FormTextBox ref={e => this.khongTuyenSinh = e} label='Không có tin tuyển sinh' className='col-md-6' required />
                    </div>

                    <h6 className='tile-title'>Footer</h6>
                    <div className='row'>
                        <FormTextBox ref={e => this.ketNoi = e} label='Kết nối với USSH' className='col-md-6' required />
                        <FormTextBox ref={e => this.ketNoiVnu = e} label='Kết nối với VNUHCM' className='col-md-6' required />
                    </div>
                </div>
            </div>
        });
    }
}

class DmNgonNguPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/category', () => {
            T.onSearch = (searchText) => this.props.getDmNgonNguAll(searchText || '');
            T.showSearchBox();
            this.props.getDmNgonNguAll();
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa ngoại ngữ này?', true, isConfirm => isConfirm && this.props.deleteDmNgonNgu(item.maCode));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('dmNgonNgu');
        const items = this.props.ngonNgu && this.props.ngonNgu.items ? this.props.ngonNgu.items : [];

        const table = renderTable({
            getDataSource: () => items,
            emptyTable: 'Không có ngôn ngữ!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '30%' }}>Mã</th>
                    <th style={{ width: '50%' }}>Tên ngoại ngữ</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Logo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.maCode || ''} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.tenNgonNgu || ''} onClick={() => this.modal.show(item)} />
                    <TableCell type='image' content={`/img/flag/${item.maCode}.png`} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục ngôn ngữ',
            breadcrumb: [
                <Link key={0} to='/user/category'>Danh mục</Link>,
                'Danh mục ngôn ngữ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDmNgonNgu} update={this.props.updateDmNgonNgu} getAll={this.props.getDmNgonNguAll} />
            </>,
            backRoute: '/user/category',
            onCreate: permission && permission.write ? () => this.modal.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, ngonNgu: state.danhMuc.ngonNgu });
const mapActionsToProps = { getDmNgonNguAll, createDmNgonNgu, updateDmNgonNgu, deleteDmNgonNgu };
export default connect(mapStateToProps, mapActionsToProps)(DmNgonNguPage);