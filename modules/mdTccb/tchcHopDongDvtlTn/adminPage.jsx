import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {getTchcHopDongDvtlTnPage, getTchcHopDongDvtlTnAll, updateTchcHopDongDvtlTn, deleteTchcHopDongDvtlTn, createTchcHopDongDvtlTn} from './redux';



class TchcHopDongDvtlTn extends AdminPage {
    componentDidMount() {
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.props.getTchcHopDongDvtlTnPage(undefined, undefined, searchText || '');
            T.showSearchBox();
            this.props.getTchcHopDongDvtlTnPage();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        T.confirm('Xóa hợp đồng', `Bạn có chắc bạn muốn xóa hợp đồng ${item.soHopDong ? `<b>${item.soHopDong}</b>` : 'này'}?`, 'warning', true, isConfirm => {
            isConfirm && this.props.deleteTchcHopDongDvtlTn(item.ID, error => {
                if (error) T.notify(error.message ? error.message : `Xoá hợp đồng ${item.ten} bị lỗi!`, 'danger');
                else T.alert(`Xoá hợp đồng ${item.ten} thành công!`, 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        console.log(this.props);
        // const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
        //     permission = this.getUserPermission('tchcHopDongDvtlTn', ['read', 'write', 'delete']);
            let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.tchcHopDongDvtlTn && this.props.tchcHopDongDvtlTn.page ?
            this.props.tchcHopDongDvtlTn.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list };
        let table = 'Không có danh sách!';
        if (list && list.length > 0) {
            table = renderTable({
                getDataSource: () => list, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }}>Mã</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' style={{ textAlign: 'center' }} content={item.ID ? item.ID : ''}
                            onClick={() => this.modal.show(item)} />
                    </tr>
                )
            });
        }

        return this.renderPage({
            icon: 'fa fa-list-alt',
            title: 'Hợp đồng Đơn vị trả lương - Trách nhiệm',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Danh mục</Link>,
                'Hợp đồng Đơn vị trả lương - Trách nhiệm'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} 
                    getPage={this.props.getTchcHopDongDvtlTnPage} />
                {/* <EditModal ref={e => this.modal = e} permission={permission}
                    create={this.props.createTchcHopDongDvtlTn} update={this.props.updateTchcHopDongDvtlTn} 
                    permissions={currentPermissions} /> */}
            </>,
            backRoute: '/user/tccb',
            //onCreate: permission && permission.write ? (e) => this.showModal(e) : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tchcHopDongDvtlTn: state.tchcHopDongDvtlTn });
const mapActionsToProps = { getTchcHopDongDvtlTnPage, getTchcHopDongDvtlTnAll, updateTchcHopDongDvtlTn, deleteTchcHopDongDvtlTn, createTchcHopDongDvtlTn};
export default connect(mapStateToProps, mapActionsToProps)(TchcHopDongDvtlTn);