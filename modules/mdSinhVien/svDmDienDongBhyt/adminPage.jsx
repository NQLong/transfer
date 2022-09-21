import React from 'react';
import { connect } from 'react-redux';
import { createDmDienDongBhyt, updateDmDienDongBhyt, deleteDmDienDongBhyt, getDmDienDongBhytPage} from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, getValue} from 'view/component/AdminPage';

class EditModal extends AdminModal {

    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            !this.ma.value() ? this.ma.focus() : this.ten.focus();
        }));
    }

    onShow = (item) => {
        let { ma, ten, moTa, soTien, namHoc } = item ? item : { ma: '', ten: '', moTa: '', soTien: '', namHoc: '' };
        this.setState({ ma, item });
        this.ma.value(ma);
        this.ten.value(ten);
        this.moTa.value(moTa);
        this.soTien.value(soTien);
        this.namHoc.value(namHoc);
    };

    onSubmit = (e) => {
        const changes = {
            ma: getValue(this.ma),
            ten: getValue(this.ten), 
            moTa: getValue(this.moTa),
            soTien: getValue(this.soTien),
            namHoc: getValue(this.namHoc)
        };
        this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        e.preventDefault();
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật diện đóng BHYT' : 'Tạo mới diện đóng BHYT',
            body: <div className = 'row'>
               <FormTextBox type='number' className='col-md-12' ref={e => this.ma = e} label='Mã' 
                    readOnly={this.state.ma ? true : readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên' 
                    readOnly={readOnly} required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả ' 
                    readOnly={readOnly} />
                <FormTextBox type='number' className='col-md-12' ref={e => this.soTien = e} label='Số tiền'
                    readOnly={readOnly} required/>
                <FormTextBox type='scholastic' className='col-md-12' ref={e => this.namHoc = e} label='Năm học' 
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class DmDienDongBhytPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/students', () => {
            T.onSearch = (searchText) => this.props.getDmDienDongBhytPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getDmDienDongBhytPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa diện đóng BHYT', 'Bạn có chắc bạn muốn xóa diện đóng BHYT này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmDienDongBhyt(item.ma));
    };

    render() {
        const permission = this.getUserPermission('dmDienDongBhyt');
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dmDienDongBhyt && this.props.dmDienDongBhyt.page ?
            this.props.dmDienDongBhyt.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
    
        let table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' ,whiteSpace: 'nowrap'}} >Mã</th>
                    <th style={{ width: '50%' ,whiteSpace: 'nowrap'}} >Tên</th>
                    <th style={{ width: '50%' ,whiteSpace: 'nowrap'}} >Mô tả</th>
                    <th style={{ width: 'auto' ,whiteSpace: 'nowrap'}} >Số tiền</th>
                    <th style={{ width: 'auto' ,whiteSpace: 'nowrap'}} >Năm học</th>
                    <th style={{ width: 'auto', textAlign: 'center' , whiteSpace: 'nowrap'}} >Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.ma ? item.ma : 0} />
                    <TableCell type="link" content={item.ten ? item.ten : ''} 
                        onClick={() => this.modal.show(item)} />
                    <TableCell type='text' content={item.moTa ? item.moTa : ''} />
                    <TableCell type='number' content={item.soTien ? item.soTien : 0} />
                    <TableCell type='text' content={item.namHoc ? item.namHoc : ''} />
                    <TableCell type='buttons' content={item} permission={permission} 
                        onEdit={() => this.modal.show(item)} onDelete={e => this.delete(e, item)} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Danh mục Diện đóng BHYT',
            breadcrumb: [
                <Link key={0} to='/user/students'>Sinh Viên</Link>,
                'Danh mục Diện đóng BHYT'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '60px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getDmDienDongBhytPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} 
                    create={this.props.createDmDienDongBhyt} update={this.props.updateDmDienDongBhyt}/>
            </>,
            backRoute: '/user/students',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dmDienDongBhyt: state.sinhVien.dmDienDongBhyt });
const mapActionsToProps = { createDmDienDongBhyt, updateDmDienDongBhyt, deleteDmDienDongBhyt, getDmDienDongBhytPage};
export default connect(mapStateToProps, mapActionsToProps)(DmDienDongBhytPage);