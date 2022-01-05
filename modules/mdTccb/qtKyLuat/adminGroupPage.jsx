import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormSelect, FormTextBox} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    getQtKyLuatPage, getQtKyLuatAll, updateQtKyLuat,
    deleteQtKyLuat, getQtKyLuatGroupPageMa, 
} from './redux';
import { DateInput } from 'view/component/Input';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { getDmKyLuatAll } from 'modules/mdDanhMuc/dmKhenThuongKyLuat/reduxKyLuat';


const dateType = [
    { id: 'yyyy', text: 'yyyy' },
    { id: 'mm/yyyy', text: 'mm/yyyy' },
    { id: 'dd/mm/yyyy', text: 'dd/mm/yyyy' }
], typeMapper = {
    'yyyy': 'year',
    'mm/yyyy': 'month',
    'dd/mm/yyyy': 'date'
};
class EditModal extends AdminModal {
    state = { 
        id: '', 
        batDau: '',
        ketThuc: '',
        batDauType: 'dd/mm/yyyy',
        ketThucType: 'dd/mm/yyyy',
        doiTuong: ''
    };
    multiple = false;
    componentDidMount() {
        this.props.getKyLuat(items => {
            if (items) {
                this.kyLuatTable = [];
                items.forEach(item => this.kyLuatTable.push({
                    'id': item.ma,
                    'text': item.ten
                }));
            }
        });
    }

    onShow = (item, multiple = true) => {
        this.multiple = multiple;
        this.batDau.clear();
        this.ketThuc.clear();

        let {id, maCanBo, lyDoHinhThuc, capQuyetDinh, batDau, batDauType, ketThuc, ketThucType, diemThiDua} = item ? item : {
            id : '', maCanBo: '', lyDoHinhThuc: '', capQuyetDinh: '', batDau: '', batDauType: '', ketThuc: '', ketThucType: '', diemThiDua: ''
        };
        
        this.setState({id: id});    
        this.setState({ batDauType: batDauType ? batDauType : 'dd/mm/yyyy', ketThucType: ketThucType ? ketThucType : 'dd/mm/yyyy'});

        setTimeout(() => {
            this.maCanBo.value(maCanBo);
            this.hinhThucKyLuat.value(lyDoHinhThuc);
            this.capQuyetDinh.value(capQuyetDinh ? capQuyetDinh : '');
            this.batDauType.value(batDauType ? batDauType : 'dd/mm/yyyy');
            this.ketThucType.value(ketThucType ? ketThucType : 'dd/mm/yyyy');
            this.batDau.setVal(batDau);
            this.ketThuc.setVal(ketThuc);
            this.diemThiDua.value(diemThiDua);
        }, 500);
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            shcc: this.maCanBo.value(),
            lyDoHinhThuc: this.hinhThucKyLuat.value(),
            capQuyetDinh: this.capQuyetDinh.value(),
            batDauType: this.state.batDauType,
            batDau: this.batDau.getVal(),
            ketThucType: this.state.ketThucType,
            ketThuc: this.ketThuc.getVal(),
            diemThiDua: this.diemThiDua.value(),
        };
        this.props.update(this.state.id, changes, this.hide);
    }

    changeType = (isBatDau, type) => {
        if (isBatDau) {
            this.setState({ batDauType: type });
            this.batDau.setVal(this.state.batDau);
        } else {
            this.setState({ ketThucType: type });
            this.ketThuc.setVal(this.state.ketThuc);
        }
    }
    render = () => {
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình kỷ luật' : 'Tạo mới quá trình kỷ luật',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Mã số cán bộ' data={SelectAdapter_FwCanBo} readOnly={true} /> 

                <FormSelect className='col-md-12' ref={e => this.hinhThucKyLuat = e} label='Hình thức kỷ luật' data={this.kyLuatTable} readOnly={false} /> 

                <FormTextBox className='col-md-12' ref={e => this.capQuyetDinh = e} type='text' label='Cấp quyết định' readOnly={false} />

                <div className='form-group col-md-6'><DateInput ref={e => this.batDau = e} label='Bắt đầu' type={this.state.batDauType ? typeMapper[this.state.batDauType] : null} /></div>
                <FormSelect className='col-md-6' ref={e => this.batDauType = e} label='Loại thời gian bắt đầu' data={dateType} onChange={data => this.changeType(true, data.id)} />
                <div className='form-group col-md-6'><DateInput ref={e => this.ketThuc = e} label='Kết thúc' type={this.state.ketThucType ? typeMapper[this.state.ketThucType] : null} /></div>
                <FormSelect className='col-md-6' ref={e => this.ketThucType = e} label='Loại thời gian kết thúc' data={dateType} onChange={data => this.changeType(false, data.id)} />

                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm thi đua' readOnly={false} />

            </div>
        });
    }
}
class QtKyLuatGroupPage extends AdminPage {
    ma = ''; loaiDoiTuong = '-1';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/ky-luat/group_kl/:loaiDoiTuong/:ma'),
                params = route.parse(window.location.pathname);
            this.loaiDoiTuong = params.loaiDoiTuong;
            this.ma = params.ma;
            T.onSearch = (searchText) => this.props.getQtKyLuatPage(undefined, undefined, this.loaiDoiTuong, searchText || '');
            T.showSearchBox();
            this.props.getQtKyLuatGroupPageMa(undefined, undefined, this.loaiDoiTuong, this.ma);
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa kỷ luật', 'Bạn có chắc bạn muốn xóa kỷ luật này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKyLuat(false, item.id, null, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá kỷ luật bị lỗi!', 'danger');
                else T.alert('Xoá kỷ luật thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permission = this.getUserPermission('qtKyLuat', ['read', 'write', 'delete']);
        let loaiDoiTuong = this.loaiDoiTuong;
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtKyLuat && this.props.qtKyLuat.page ? this.props.qtKyLuat.page : {pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: []};
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Hình thức kỷ luật</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap'}}>Cấp quyết định</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Điểm thi đua</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{textAlign:'right'}} content={index + 1} />
                        <TableCell type='link' onClick = {() => this.modal.show(item, false)} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.hoCanBo + ' ' + item.tenCanBo}</span><br />
                                    {item.maCanBo}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                    <span style={{ whiteSpace: 'nowrap' }}>{item.tenKyLuat}</span><br />
                                    <span style={{ whiteSpace: 'nowrap' }}>Thời gian bắt đầu: <span style={{ color: 'blue' }}>{item.batDau ? T.dateToText(item.batDau, item.batDauType) : ''}</span></span><br />
                                    <span style={{ whiteSpace: 'nowrap' }}>Thời gian kết thúc: <span style={{ color: 'blue' }}>{item.ketThuc ? T.dateToText(item.ketThuc, item.ketThucType) : ''}</span></span>
                            </>
                        )}
                        />
                        <TableCell type='text'  content={(
                            <>
                                {item.capQuyetDinh ? item.capQuyetDinh : ''}
                            </>
                        )}
                        />
                        <TableCell type='text' style={{textAlign:'right'}} content={item.diemThiDua} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show(item)} onDelete={this.delete} >
                        </TableCell>
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Quá trình kỷ luật',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Quá trình kỷ luật'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition, loaiDoiTuong}}
                    getPage={this.props.getQtKyLuatPage} />
                <EditModal ref={e => this.modal = e} permission={permission}
                    permissions={currentPermissions}
                    update={this.props.updateQtKyLuat}
                    getKyLuat={this.props.getDmKyLuatAll} 
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/ky-luat/',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtKyLuat: state.qtKyLuat });
const mapActionsToProps = {
    getQtKyLuatAll, getQtKyLuatPage, deleteQtKyLuat,
    updateQtKyLuat, getQtKyLuatGroupPageMa, getDmKyLuatAll,
};
export default connect(mapStateToProps, mapActionsToProps)(QtKyLuatGroupPage);