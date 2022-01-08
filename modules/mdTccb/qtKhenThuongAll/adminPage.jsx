import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtKhenThuongAllPage, getQtKhenThuongAllAll, updateQtKhenThuongAll,
    deleteQtKhenThuongAll, createQtKhenThuongAll, getQtKhenThuongAllGroupPage,
} from './redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { SelectAdapter_DmKhenThuongKyHieuV2 } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import { SelectAdapter_DmKhenThuongChuThichV2 } from 'modules/mdDanhMuc/dmKhenThuongChuThich/redux';
import { getDmKhenThuongLoaiDoiTuongAll } from 'modules/mdDanhMuc/dmKhenThuongLoaiDoiTuong/redux';
import { SelectAdapter_DmBoMon} from 'modules/mdDanhMuc/dmBoMon/redux';
import { SelectAdapter_DmDonVi} from 'modules/mdDanhMuc/dmDonVi/redux';
import Loading from 'view/component/Loading';

class EditModal extends AdminModal {
    state = { id: '', doiTuong: ''};
    multiple = false;
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
    }

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        let { id, maLoaiDoiTuong, ma, namDatDuoc, maThanhTich, maChuThich, diemThiDua } = item ? item : {
            id: '', maLoaiDoiTuong: '', ma: '', namDatDuoc: '', maThanhTich: '', maChuThich: '', diemThiDua: ''
        };
        this.setState({
            id: id, doiTuong: maLoaiDoiTuong
        });

        this.loaiDoiTuong.value(maLoaiDoiTuong ? maLoaiDoiTuong : '');
        if (maLoaiDoiTuong == '02') this.maCanBo.value(ma);
        else if (maLoaiDoiTuong == '03') this.maDonVi.value(ma);
        else if (maLoaiDoiTuong == '04') this.maBoMon.value(ma ? ma : '');

        this.namDatDuoc.value(namDatDuoc ? namDatDuoc : '');
        this.thanhTich.value(maThanhTich ? maThanhTich : '');
        this.chuThich.value(maChuThich ? maChuThich : '');
        this.diemThiDua.value(diemThiDua);
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        let list_ma = [];
        if (this.loaiDoiTuong.value() == '01') list_ma = ['01'];
        if (this.loaiDoiTuong.value() == '02') list_ma = this.maCanBo.value();
        if (this.loaiDoiTuong.value() == '03') list_ma = this.maDonVi.value();
        if (this.loaiDoiTuong.value() == '04') list_ma = this.maBoMon.value();
        if (!Array.isArray(list_ma)) {
            list_ma = [list_ma];
        }
        list_ma.forEach((ma, index) => {
            const changes = {
                loaiDoiTuong: this.loaiDoiTuong.value(),
                ma: ma,
                namDatDuoc: this.namDatDuoc.value(),
                thanhTich: this.thanhTich.value(),
                chuThich: this.chuThich.value(),  
                diemThiDua: this.diemThiDua.value(),
            };
            if (index == list_ma.length - 1) {
                this.state.id ? this.props.update(false, this.state.id, changes, this.hide) : this.props.create(false, changes, this.hide);
                this.setState({
                    id: '', doiTuong: ''
                });
                this.maCanBo.reset();
                this.maDonVi.reset();
                this.maBoMon.reset();
            }
            else {
                this.state.id ? this.props.update(false, this.state.id, changes) : this.props.create(false, changes);
            }
        });
    }

    onChangeDT = (value) => {
        this.setState({ doiTuong: value });
    }

    render = () => {
        const doiTuong = this.state.doiTuong;
        const readOnly = this.state.id ? true : this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình khen thưởng' : 'Tạo mới quá trình khen thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.loaiDoiTuong = e} label='Loại đối tượng' data={this.loaiDoiTuongTable} readOnly={readOnly} onChange={value => this.onChangeDT(value.id)} />

                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo}
                    style={doiTuong == '02' ? {} : { display: 'none' }}
                    readOnly={readOnly} />

                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maDonVi = e} label='Đơn vị' data={SelectAdapter_DmDonVi}
                    style={doiTuong == '03' ? {} : { display: 'none' }}
                    readOnly={readOnly} />

                <FormSelect className='col-md-12' multiple={this.multiple} ref={e => this.maBoMon = e} label='Bộ môn' data={SelectAdapter_DmBoMon} 
                    style={doiTuong == '04' ? {} : { display: 'none' }} 
                    readOnly={readOnly} />

                <FormSelect className='col-md-12' ref={e => this.thanhTich = e} label='Thành tích' data={SelectAdapter_DmKhenThuongKyHieuV2} readOnly={false} />
                <FormTextBox className='col-md-4' ref={e => this.namDatDuoc = e} label='Năm đạt được (yyyy)' type='year' readOnly={false} />
                <FormSelect className='col-md-8' ref={e => this.chuThich = e} label='Chú thích' data={SelectAdapter_DmKhenThuongChuThichV2} readOnly={false} />
                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={false} />

            </div>
        });
    }
}

class QtKhenThuongAll extends AdminPage {
    checked = false;
    curState = '-1';
    stateTable = [
        { 'id': '-1', 'text': 'Tất cả' }
    ];
    searchText = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getDmKhenThuongLoaiDoiTuongAll(items => {
                if (items) {
                    this.stateTable = [
                        { 'id': '-1', 'text': 'Tất cả' }
                    ];
                    items.forEach(item => this.stateTable.push({
                        'id': item.ma,
                        'text': item.ten
                    }));
                }
            });
            T.onSearch = (searchText) => {
                this.searchText = searchText;
                if (this.checked) this.props.getQtKhenThuongAllGroupPage(undefined, undefined, this.curState, this.searchText || '');
                else this.props.getQtKhenThuongAllPage(undefined, undefined, this.curState, this.searchText || '');
            };
            T.showSearchBox(() => {
                this.loaiDoiTuong?.value('');
                setTimeout(() => this.changeAdvancedSearch(), 50);
                setTimeout(() => this.showAdvanceSearch(), 1000);
            });
            this.changeAdvancedSearch();
        });
    }

    changeAdvancedSearch = () => {
        let { pageNumber, pageSize } = this.props && this.props.qtKhenThuongAll && this.props.qtKhenThuongAll.page ? this.props.qtKhenThuongAll.page : { pageNumber: 1, pageSize: 50 };
        const loaiDoiTuong = this.loaiDoiTuong?.value() || '-1';
        this.curState = loaiDoiTuong;
        if (this.checked) this.props.getQtKhenThuongAllGroupPage(pageNumber, pageSize, this.curState, this.searchText || '');
        else this.props.getQtKhenThuongAllPage(pageNumber, pageSize, this.curState, this.searchText || '');
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    downloadExcel = (e) => {
        e.preventDefault();
        let name = 'khen_thuong', loaiDoiTuong = this.curState, maDoiTuong = '-1';
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
    }

    groupPage = () => {
        this.checked = !this.checked;
        if (this.checked) this.props.getQtKhenThuongAllGroupPage(undefined, undefined, this.curState, this.searchText || '');
        else this.props.getQtKhenThuongAllPage(undefined, undefined, this.curState, this.searchText || '');
    }
    delete = (e, item) => {
        T.confirm('Xóa khen thưởng', 'Bạn có chắc bạn muốn xóa khen thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKhenThuongAll(false, item.id, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá khen thưởng bị lỗi!', 'danger');
                else T.alert('Xoá khen thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtKhenThuongAll', ['read', 'write', 'delete']);
        let loaiDoiTuong = this.curState;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtKhenThuongAll && this.props.qtKhenThuongAll.page_gr ?
                this.props.qtKhenThuongAll.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtKhenThuongAll && this.props.qtKhenThuongAll.page ? this.props.qtKhenThuongAll.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] });
        let table = <Loading />;
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
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
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
                                        {item.maCanBo}
                                    </>
                                    : item.maLoaiDoiTuong == '03' ?
                                        <>
                                            <span>
                                                {item.tenDonVi}
                                            </span>
                                        </>
                                        : <>
                                            <span>{item.tenBoMon}</span> <br />
                                            {'KHOA ' + item.tenDonViBoMon}
                                        </>

                        )}
                        />
                        <TableCell type='text' style={{textAlign: 'center' }} content={(
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
                        {
                            !this.checked && <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                                onEdit={() => this.modal.show(item, false)} onDelete={this.delete} />
                        }
                        {
                            this.checked &&
                            <TableCell type='buttons' style={{ textAlign: 'center', width: '45px' }} content={item} permission={permission} >
                                <Link className='btn btn-success' to={`/user/tccb/qua-trinh/khen-thuong-all/group_dt/${item.maLoaiDoiTuong}/${item.ma}`} >
                                    <i className='fa fa-lg fa-compress' />
                                </Link>
                            </TableCell>
                        }
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-gift',
            title: ' Quá trình khen thưởng',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình khen thưởng'
            ],
            advanceSearch: <>
                <FormSelect className='col-md-3' ref={e => this.loaiDoiTuong = e} label='Chọn loại đối tượng' data={this.stateTable} onChange={() => this.changeAdvancedSearch()} />
            </>,
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Gom đối tượng' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition, loaiDoiTuong }}
                    getPage={this.checked ? this.props.getQtKhenThuongAllGroupPage : this.props.getQtKhenThuongAllPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtKhenThuongAll} update={this.props.updateQtKhenThuongAll}
                    permissions={currentPermissions}
                    getLoaiDoiTuong={this.props.getDmKhenThuongLoaiDoiTuongAll}
                    />
                {
                    permission.read &&
                    <button className='btn btn-success btn-circle' style={{ position: 'fixed', right: '70px', bottom: '10px' }} onClick={this.downloadExcel} >
                        <i className='fa fa-lg fa-print' />
                    </button>
                }
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKhenThuongAll: state.qtKhenThuongAll });
const mapActionsToProps = {
    getQtKhenThuongAllAll, getQtKhenThuongAllPage, deleteQtKhenThuongAll, createQtKhenThuongAll,
    updateQtKhenThuongAll, getDmKhenThuongLoaiDoiTuongAll, getQtKhenThuongAllGroupPage,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKhenThuongAll);