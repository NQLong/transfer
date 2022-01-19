import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtDaoTaoPage,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { DateInput } from 'view/component/Input';
import Dropdown from 'view/component/Dropdown';
import { SelectApdater_DmBangDaoTao } from 'modules/mdDanhMuc/dmBangDaoTao/redux';
import { SelectAdapter_DmHinhThucDaoTaoV2 } from 'modules/mdDanhMuc/dmHinhThucDaoTao/redux';

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
    }

    onShow = (item) => {
        let { shcc, tenTruong, chuyenNganh, batDau, ketThuc, hinhThuc, loaiBangCap, id,
            batDauType, ketThucType, thoiGian, trinhDo, kinhPhi } = item ? item : {
                shcc: '', tenTruong: '', chuyenNganh: '', batDau: '', ketThuc: '', hinhThuc: '', loaiBangCap: '', id: '',
                batDauType: '', ketThucType: '', thoiGian: '', trinhDo: '', kinhPhi: ''
            };
        this.setState({ shcc, id });
        setTimeout(() => {
            this.maCanBo.value(shcc ? shcc : '');
            this.tenTruong.value(tenTruong ? tenTruong : '');
            this.chuyenNganh.value(chuyenNganh ? chuyenNganh : '');
            this.batDau.value(batDau ? batDau : '');
            this.ketThuc.value(ketThuc ? ketThuc : '');
            this.hinhThuc.value(hinhThuc ? hinhThuc : '');
            this.loaiBangCap.value(loaiBangCap ? loaiBangCap : '');
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            this.ketThucType.value(ketThucType ? ketThucType : 'dd/mm/yyyy');
            this.thoiGian.value(thoiGian ? thoiGian : '');
            this.trinhDo.value(trinhDo ? trinhDo : '');
            this.kinhPhi.value(kinhPhi ? kinhPhi : '');
        }, 500);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.shcc.value(),
            tenTruong: this.tenTruong.value(),
            chuyenNganh: this.chuyenNganh.value(),
            batDau: Number(this.batDau.value()),
            ketThuc: Number(this.ketThuc.value()),
            hinhThuc: this.hinhThuc.value(),
            loaiBangCap: this.loaiBangCap.value(),
            batDauType: this.state.batDauType,
            ketThucType: this.state.ketThucType,
            thoiGian: Number(this.thoiGian.value()),
        };
        if (!changes.shcc) {
            T.notify('Chưa chọn cán bộ', 'danger');
            this.shcc.focus();
        } else {
            this.state.shcc ? this.props.update(this.state.ma, changes, this.hide, false) : this.props.create(changes, this.hide, false);
        }
    }

    render = () => {
        const readOnly = this.state.shcc ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật thông tin quá trình đào tạo' : 'Tạo mới thông tin quá trình đào tạo',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} data={SelectAdapter_FwCanBo} label='Mã thẻ cán bộ' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-6' ref={e => this.tenTruong = e} label='Tên trường' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.chuyenNganh = e} label='Chuyên ngành' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.hinhThuc = e} data={SelectAdapter_DmHinhThucDaoTaoV2} label='Hình thức' readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.loaiBangCap = e} data={SelectApdater_DmBangDaoTao} label='Loại bằng cấp' readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.trinhDo = e} label="Trình độ" readOnly={readOnly} />
                <FormTextBox type='text' className='col-md-6' ref={e => this.kinhPhi = e} label="Kinh phí" readOnly={readOnly} />
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
                <FormTextBox type='text' className='col-md-4' ref={e => this.thoiGian = e} label='Thời gian' readOnly={readOnly} />
            </div>,
        });
    }
}

class QtDaoTaoGroupPage extends AdminPage {
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/dao-tao/:ma'),
                params = route.parse(window.location.pathname);
            this.ma = params.ma;
            T.onSearch = (searchText) => {
                this.props.getQtDaoTaoPage(undefined, undefined, searchText || '', this.ma);
            };
            T.showSearchBox();
            this.props.getQtDaoTaoPage(undefined, undefined, this.ma, () => {
                T.updatePage('pageQtDaoTao', undefined, undefined, '');
            });
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa thông tin quá trình đào tạo', 'Bạn có chắc bạn muốn xóa thông tin quá trình đào tạo này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtDaoTaoGroupPageMa(item.ma, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin quá trình đào tạo bị lỗi!', 'danger');
                else T.alert('Xoá thông tin quá trình đào tạo thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtDaoTao', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDaoTao && this.props.qtDaoTao.page ? this.props.qtDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap', textAlign: 'center' }}>Cán bộ</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Tên trường</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Chuyên ngành</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Thời gian đào tạo</th>
                        <th style={{ width: '20%', textAlign: 'center' }}>Hình thức</th>
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại bằng cấp</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{(item.hoCanBo ? item.hoCanBo : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo : ' ')}</span><br />
                                {item.shcc}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{}} content={item.tenTruong} />
                        <TableCell type='text' style={{}} content={item.chuyenNganh} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span style={{ whiteSpace: 'nowrap' }}>Từ: <span style={{ color: 'blue' }}>{item.batDau ? new Date(item.batDau).ddmmyyyy() : ''}</span></span><br />
                                <span style={{ whiteSpace: 'nowrap' }}>Đến: <span style={{ color: 'blue' }}>{item.ketThuc ? new Date(item.ketThuc).ddmmyyyy() : ''}</span></span><br />
                            </>
                        )}
                        />
                        <TableCell type='text' content={item.tenHTDT} />
                        <TableCell type='text' content={item.tenBDT} />
                        {
                            <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-podcast',
            title: 'Quá trình quá trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình quá trình đào tạo'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtDaoTaoPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/dao-tao',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDaoTao: state.qtDaoTao });
const mapActionsToProps = {
    getQtDaoTaoPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtDaoTaoGroupPage);