import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtKhenThuongAllPage, getQtKhenThuongAllAll, updateQtKhenThuongAllGroupPageMa,
    deleteQtKhenThuongAll, createQtKhenThuongAll, getQtKhenThuongAllGroupPageMa, 
} from './redux';

import { getStaffAll, SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { getDmKhenThuongKyHieuAll } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import { getDmKhenThuongChuThichAll } from 'modules/mdDanhMuc/dmKhenThuongChuThich/redux';
import { getDmKhenThuongLoaiDoiTuongAll } from 'modules/mdDanhMuc/dmKhenThuongLoaiDoiTuong/redux';
import { getDmBoMonAll, getDmBoMon, SelectAdapter_DmBoMon} from 'modules/mdDanhMuc/dmBoMon/redux';
import { getDmDonViAll, getDmDonVi, SelectAdapter_DmDonVi} from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    state = { id: '', doiTuong: '' };
    componentDidMount() {
        this.props.getLoaiDoiTuong(items => {
            if (items) {
                this.loaiDoiTuongTable = [];
                items.forEach(item => this.loaiDoiTuongTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getThanhTich(items => {
            if (items) {
                this.thanhTichTable = [];
                items.forEach(item => this.thanhTichTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getChuThich(items => {
            if (items) {
                this.chuThichTable = [];
                items.forEach(item => this.chuThichTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
    }

    onShow = (item) => {
        let { id, maLoaiDoiTuong, ma, namDatDuoc, maThanhTich, maChuThich, diemThiDua } = item ? item : {
            id: '', maLoaiDoiTuong: '', ma: '', namDatDuoc: '', maThanhTich: '', maChuThich: '', diemThiDua: ''
        };
        this.setState({
            id: id, doiTuong: maLoaiDoiTuong
        });

        this.loaiDoiTuong.value(maLoaiDoiTuong ? maLoaiDoiTuong : '');
        if (maLoaiDoiTuong == '02') this.maCanBo.value(ma);
        else if (maLoaiDoiTuong == '03') this.maDonVi.value(ma);
        else if (maLoaiDoiTuong == '04') this.maBoMon.value(ma);

        this.namDatDuoc.value(namDatDuoc ? namDatDuoc : '');
        this.thanhTich.value(maThanhTich ? maThanhTich : '');
        this.chuThich.value(maChuThich ? maChuThich : '');
        this.diemThiDua.value(diemThiDua);
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        let ma = '-1';
        if (this.loaiDoiTuong.value() == '02') ma = this.maCanBo.value();
        if (this.loaiDoiTuong.value() == '03') ma = this.maDonVi.value();
        if (this.loaiDoiTuong.value() == '04') ma = this.maBoMon.value();

        const changes = {
            loaiDoiTuong: this.loaiDoiTuong.value(),
            ma: ma,
            namDatDuoc: this.namDatDuoc.value(),
            thanhTich: this.thanhTich.value(),
            chuThich: this.chuThich.value(),
            diemThiDua: this.diemThiDua.value(),
        };
        this.props.update(this.state.id, ma, changes, this.hide);
    }

    onChangeDT = (value) => {
        this.setState({ doiTuong: value });
    }
    render = () => {
        const doiTuong = this.state.doiTuong;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình khen thưởng' : 'Tạo mới quá trình khen thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.loaiDoiTuong = e} label='Loại đối tượng' data={this.loaiDoiTuongTable} readOnly={true}/>

                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo}
                    style={doiTuong == '02' ? {} : { display: 'none' }}
                    readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi}
                    style={doiTuong == '03' ? {} : { display: 'none' }}
                    readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.maBoMon = e} label='Bộ môn' data={SelectAdapter_DmBoMon} style={doiTuong == '04' ? {} : { display: 'none' }} readOnly={true} />

                <FormSelect className='col-md-12' ref={e => this.thanhTich = e} label='Thành tích' data={this.thanhTichTable} readOnly={false} />
                <FormTextBox className='col-md-4' ref={e => this.namDatDuoc = e} label='Năm đạt được (yyyy)' type='year' readOnly={false} />
                <FormSelect className='col-md-8' ref={e => this.chuThich = e} label='Chú thích' data={this.chuThichTable} readOnly={false} />
                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={false} />

            </div>
        });
    }
}
class QtKhenThuongAllGroupPage extends AdminPage {
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/khen-thuong-all/group_dt/:loaiDoiTuong/:ma'),
                params = route.parse(window.location.pathname);
            this.loaiDoiTuong = params.loaiDoiTuong;
            this.ma = params.ma;
            T.onSearch = (searchText) => this.props.getQtKhenThuongAllPage(undefined, undefined, this.loaiDoiTuong, searchText || '');
            T.showSearchBox();
            this.props.getQtKhenThuongAllGroupPageMa(undefined, undefined, this.loaiDoiTuong, this.ma);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    downloadExcel = (e) => {
        e.preventDefault();
        let name = 'khen_thuong', loaiDoiTuong = this.loaiDoiTuong, maDoiTuong = this.ma;
        if (loaiDoiTuong == '-1') {
            name += '_all';
        }
        else {
            if (loaiDoiTuong == '01') {
                name += '_truong';
            }
            else {
                if (loaiDoiTuong == '02') name += '_canbo_';
                if (loaiDoiTuong == '03') name += '_donvi_';
                if (loaiDoiTuong == '04') name += '_bomon_';
                if (maDoiTuong == '-1') name += 'all';
                else name += maDoiTuong;
            }
        }
        name += '.xlsx';
        T.download(T.url(`/api/tccb/qua-trinh/khen-thuong-all/download-excel/${loaiDoiTuong}/${maDoiTuong}`), name);
        //this.props.downloadExcel('', '')
    }

    delete = (e, item) => {
        T.confirm('Xóa khen thưởng', 'Bạn có chắc bạn muốn xóa khen thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKhenThuongAll(item.id, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá khen thưởng bị lỗi!', 'danger');
                else T.alert('Xoá khen thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtKhenThuongAll', ['read', 'write', 'delete']);
        let loaiDoiTuong = this.loaiDoiTuong;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = 
        this.props.qtKhenThuongAll && this.props.qtKhenThuongAll.page ?
            this.props.qtKhenThuongAll.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Đối tượng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                        <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Thành tích</th>
                        <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Điểm thi đua</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loại đối tượng</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{textAlign:'right'}} content={index + 1} />
                        <TableCell type='link' onClick = {() => this.modal.show(item)} content={(
                            item.maLoaiDoiTuong == '01' ? 
                            <>
                                <span>
                                     {'Trường Đại học Khoa học Xã hội và Nhân Văn, TP. HCM'}
                                </span>
                            </>
                            :
                            item.maLoaiDoiTuong == '02' ? 
                                <>
                                    <span>{item.hoCanBo + ' ' + item.tenCanBo}</span><br />
                                    {item.ma}
                                </>
                            : item.maLoaiDoiTuong == '03' ? 
                                <>
                                    <span>
                                        {item.tenDonVi}
                                    </span>
                                </>
                            : <>
                                    <span>{item.tenBoMon}</span> <br/>
                                    {'KHOA ' + item.tenDonViBoMon }
                                </>

                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.namDatDuoc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.tenThanhTich}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{textAlign:'right'}} content={item.diemThiDua} />
                        <TableCell type='text' content={item.tenLoaiDoiTuong} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-gift',
            title: 'Quá trình khen thưởng',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình khen thưởng'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition, loaiDoiTuong}}
                    getPage={this.props.getQtKhenThuongAllPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtKhenThuongAll} update={this.props.updateQtKhenThuongAllGroupPageMa}
                    getThanhTich={this.props.getDmKhenThuongKyHieuAll} permissions={currentPermissions}
                    getChuThich={this.props.getDmKhenThuongChuThichAll}
                    getLoaiDoiTuong={this.props.getDmKhenThuongLoaiDoiTuongAll}
                    getBoMon={this.props.getDmBoMonAll}
                    getDonVi={this.props.getDmDonViAll}
                    getStaff={this.props.getStaffAll} 
                    getDonViItem = {this.props.getDmDonVi}    
                    getBoMonItem = {this.props.getDmBoMon}
                />
                {
                    permission.read &&
                    <button className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} onClick={this.downloadExcel} >
                        <i className='fa fa-lg fa-print' />
                    </button>
                }
            </>,
            backRoute: '/user/tccb/qua-trinh/khen-thuong-all',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKhenThuongAll: state.qtKhenThuongAll });
const mapActionsToProps = {
    getQtKhenThuongAllAll, getQtKhenThuongAllPage, deleteQtKhenThuongAll, createQtKhenThuongAll,
    updateQtKhenThuongAllGroupPageMa, getStaffAll, getDmKhenThuongKyHieuAll, getDmKhenThuongChuThichAll, 
    getDmKhenThuongLoaiDoiTuongAll, getDmBoMonAll, getDmDonViAll, getQtKhenThuongAllGroupPageMa, getDmDonVi, getDmBoMon,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKhenThuongAllGroupPage);