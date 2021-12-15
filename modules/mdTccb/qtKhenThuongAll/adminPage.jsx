import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox, FormCheckbox} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtKhenThuongAllPage, getQtKhenThuongAllAll, updateQtKhenThuongAll,
    deleteQtKhenThuongAll, createQtKhenThuongAll, getQtKhenThuongAllGroupPage,
} from './redux';
import { getStaffAll } from 'modules/mdTccb/tccbCanBo/redux';
import { getDmKhenThuongKyHieuAll } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import { getDmKhenThuongChuThichAll } from 'modules/mdDanhMuc/dmKhenThuongChuThich/redux';
import { getDmKhenThuongLoaiDoiTuongAll } from 'modules/mdDanhMuc/dmKhenThuongLoaiDoiTuong/redux';
import { getDmBoMonAll, getDmBoMon} from 'modules/mdDanhMuc/dmBoMon/redux';
import { getDmDonViAll, getDmDonVi} from 'modules/mdDanhMuc/dmDonVi/redux';

class EditModal extends AdminModal {
    doiTuong = ''
    state = { id: '', doiTuong: ''};
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
        this.props.getStaff(items => {
            if (items) {
                this.staffTable = [];
                items.forEach(item => this.staffTable.push({
                    'id': item.shcc,
                    'text': item.shcc + ' - ' + item.ho + ' ' + item.ten
                }));
            }
        });
        this.props.getDonVi(items => {
            if (items) {
                this.donViTable = [];
                items.forEach(item => this.donViTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
        this.props.getBoMon(items => {
            if (items) {
                this.boMonTable = [];
                items.forEach(item => {
                    this.props.getDonViItem(item.maDv, data => {
                        if (data) {
                            this.boMonTable.push({
                                'id': item.ma,
                                'text': item.ten + ' (' + data.ten + ')'
                            });
                        }
                    });
                });
            }
        });
    }

    onShow = (item) => {
        let {id, maLoaiDoiTuong, ma, namDatDuoc, maThanhTich, maChuThich} = item ? item : {
            id : '', maLoaiDoiTuong: '', ma: '', namDatDuoc: '', maThanhTich: '', maChuThich: '',
        };
        this.setState({id: id, doiTuong: maLoaiDoiTuong});
        {
            this.state.doiTuong == '02' ? 
            <FormSelect className='col-md-12' ref={e => this.ma = e} label='Mã số cán bộ' data={this.staffTable} /> : 
            this.state.doiTuong == '03' ?
            <FormSelect className='col-md-12' ref={e => this.ma = e} label='Mã đơn vị' data={this.donViTable} /> : 
            this.state.doiTuong == '04' ?
            <FormSelect className='col-md-12' ref={e => this.ma = e} label='Mã bộ môn (đơn vị)' data={this.boMonTable} /> :
            null;
        }       
        this.loaiDoiTuong.value(maLoaiDoiTuong ? maLoaiDoiTuong : '');     
        this.ma && this.ma.value(ma ? ma : '');
        this.namDatDuoc.value(namDatDuoc ? namDatDuoc : '');
        this.thanhTich.value(maThanhTich ? maThanhTich : '');
        this.chuThich.value(maChuThich ? maChuThich : '');
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            loaiDoiTuong: this.loaiDoiTuong.value(),
            ma: this.ma ? this.ma.value() : '-1',
            namDatDuoc: this.namDatDuoc.value(), 
            thanhTich: this.thanhTich.value(),
            chuThich: this.chuThich.value(),
        };
        this.state.id ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    }

    onChangeDT = (value) => {
        this.setState({doiTuong: value});
    }
    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình khen thưởng' : 'Tạo mới quá trình khen thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-4' ref={e => this.loaiDoiTuong = e} label='Loại đối tượng' data={this.loaiDoiTuongTable} readOnly={readOnly} onChange={value => this.onChangeDT(value.id)} />
                {
                    this.state.doiTuong == '02' ? 
                    <FormSelect className='col-md-12' ref={e => this.ma = e} label='Mã số cán bộ' data={this.staffTable} readOnly={readOnly} /> : 
                    this.state.doiTuong == '03' ?
                    <FormSelect className='col-md-12' ref={e => this.ma = e} label='Mã đơn vị' data={this.donViTable} readOnly={readOnly} /> : 
                    this.state.doiTuong == '04' ?
                    <FormSelect className='col-md-12' ref={e => this.ma = e} label='Mã bộ môn (đơn vị)' data={this.boMonTable} readOnly={readOnly} /> :
                    null
                }       

                <FormSelect className='col-md-12' ref={e => this.thanhTich = e} label='Thành tích' data={this.thanhTichTable} readOnly={readOnly} /> 
                <FormTextBox className='col-md-4' ref={e => this.namDatDuoc = e} label='Năm đạt được (yyyy)' type='year' readOnly={readOnly} />
                <FormSelect className='col-md-8' ref={e => this.chuThich = e} label='Chú thích' data={this.chuThichTable} readOnly={readOnly} />
            </div>
        });
    }
}

class QtKhenThuongAll extends AdminPage {
    checked = false;
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => {
                if (this.checked) this.props.getQtKhenThuongAllGroupPage(undefined, undefined, searchText || '');
                else this.props.getQtKhenThuongAllPage(undefined, undefined, searchText || '');
            };
            T.showSearchBox();
            this.props.getQtKhenThuongAllPage(undefined, undefined,'');
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    groupPage = () => {
        this.checked = !this.checked;
        this.props.getQtKhenThuongAllGroupPage(undefined, undefined, '');
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
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.checked ? (
            this.props.qtKhenThuongAll && this.props.qtKhenThuongAll.page_gr ?
            this.props.qtKhenThuongAll.page_gr : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list })
            : (this.props.qtKhenThuongAll && this.props.qtKhenThuongAll.page ? this.props.qtKhenThuongAll.page : {pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: []});
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Loại đối tượng</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Đối tượng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thành tích</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chú thích</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{textAlign:'right'}} content={index + 1} />
                        <TableCell type='text' content={item.tenLoaiDoiTuong} />
                        <TableCell type='link' onClick = {() => this.modal.show(item)} style={{ whiteSpace: 'nowrap' }} content={(
                            item.maLoaiDoiTuong == '01' ? 
                            <>
                                <span>
                                    {/* {item.tenLoaiDoiTuong} */}
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
                                    <span>
                                        {item.tenBoMon + ' (' + item.tenDonViBoMon + ')'}
                                    </span>
                                </>

                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.namDatDuoc}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.tenThanhTich}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                {item.tenChuThich}
                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                            {this.checked && <Link className='btn btn-success' to={`/user/tccb/qua-trinh/khen-thuong-all/group_dt/${item.ma}`} style={{ width: '45px' }}>
                            <i className='fa fa-lg fa-compress' />
                            </Link>}
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quá trình khen thưởng',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình khen thưởng'
            ],
            content: <>
                <div className='tile'>
                    <FormCheckbox label='Hiển thị theo đối tượng' onChange={this.groupPage} />
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.checked ? this.props.getQtKhenThuongAllGroupPage : this.props.getQtKhenThuongAllPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createQtKhenThuongAll} update={this.props.updateQtKhenThuongAll}
                    getThanhTich={this.props.getDmKhenThuongKyHieuAll} permissions={currentPermissions}
                    getChuThich={this.props.getDmKhenThuongChuThichAll}
                    getLoaiDoiTuong={this.props.getDmKhenThuongLoaiDoiTuongAll}
                    getBoMon={this.props.getDmBoMonAll}
                    getDonVi={this.props.getDmDonViAll}
                    getStaff={this.props.getStaffAll} 
                    getDonViItem = {this.props.getDmDonVi}    
                    getBoMonItem = {this.props.getDmBoMon}
                />
            </>,
            backRoute: '/user/tccb',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKhenThuongAll: state.qtKhenThuongAll });
const mapActionsToProps = {
    getQtKhenThuongAllAll, getQtKhenThuongAllPage, deleteQtKhenThuongAll, createQtKhenThuongAll,
    updateQtKhenThuongAll, getStaffAll, getDmKhenThuongKyHieuAll, getDmKhenThuongChuThichAll, 
    getDmKhenThuongLoaiDoiTuongAll, getDmBoMonAll, getDmDonViAll, getQtKhenThuongAllGroupPage, getDmDonVi, getDmBoMon,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKhenThuongAll);