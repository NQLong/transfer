import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {
    updateQtDaoTao, deleteQtDaoTao, getQtDaoTaoPage, createQtDaoTao
} from './redux';
import T from 'view/js/common';
import DaoTaoModal from './daoTaoModal';

class QtDaoTaoGroupPage extends AdminPage {
    ma = '';
    componentDidMount() {
        T.ready('/user/tccb', () => {
            const route = T.routeMatcher('/user/tccb/qua-trinh/dao-tao/:ma'),
                params = route.parse(window.location.pathname);
            this.ma = params.ma;
            T.onSearch = (searchText) => {
                this.props.getQtDaoTaoPage(undefined, undefined, searchText || '', { listShcc: this.ma });
            };
            T.showSearchBox();
            this.props.getQtDaoTaoPage(undefined, undefined, '', { listShcc: this.ma }, () => {
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
            isConfirm && this.props.deleteQtDaoTao(item.id, item.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá thông tin quá trình đào tạo bị lỗi!', 'danger');
                else T.alert('Xoá thông tin quá trình đào tạo thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('qtDaoTao', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.qtDaoTao && this.props.qtDaoTao.page ? this.props.qtDaoTao.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu',
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Học vị</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ<br />Đơn vị công tác</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Nội dung bồi dưỡng</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Tên cơ sở</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hình thức</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kinh phí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kết quả</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Minh chứng</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show({ item })} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')}</span><br />
                            {item.shcc}
                        </>
                    )} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHocVi || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            {item.tenChucVu ? <>{item.tenChucVu} <br /></> : ''}
                            {(item.tenDonVi || '')}
                        </>
                    )} />
                    <TableCell type='text' style={{}} content={item.chuyenNganh} />
                    <TableCell type='text' style={{}} content={item.tenTruong} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenHinhThuc || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                        {item.batDau && <span>Từ: <span style={{ color: 'blue' }}>{T.dateToText(item.batDau, item.batDauType ? item.batDauType : 'dd/mm/yyyy')}</span><br /></span>}
                        {item.ketThuc && <span>Đến: <span style={{ color: 'blue' }}>{T.dateToText(item.ketThuc, item.ketThucType ? item.ketThucType : 'dd/mm/yyyy')}</span></span>}
                    </>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.kinhPhi || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<>
                        {item.loaiBangCap && <span style={{ color: 'blue' }}>{item.tenLoaiBangCap}<br /></span>}
                        {item.trinhDo && <span>Kết quả: <span style={{ color: 'red' }}>{item.tenTrinhDo ? item.tenTrinhDo : item.trinhDo}<br /></span></span>}
                    </>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={
                        item.minhChung && T.parse(item.minhChung).length ? <span className='text-success'>Đã nộp</span> : <span className='text-danger'>Chưa có</span>
                    } />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={() => this.modal.show({ item })} onDelete={this.delete} >
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-podcast',
            title: 'Quá trình đào tạo: cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                <Link key={0} to='/user/tccb/qua-trinh/dao-tao'>Đào tạo</Link>,
                'Quá trình đào tạo: cán bộ'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtDaoTaoPage} />
                <DaoTaoModal ref={e => this.modal = e} isCanBo={false}
                    create={this.props.createQtDaoTao} update={this.props.updateQtDaoTao}
                />
            </>,
            backRoute: '/user/tccb/qua-trinh/dao-tao',
            onCreate: e => e.preventDefault() || this.modal.show({ shcc: this.ma }),
            onExport: (e) => {
                e.preventDefault();
                const listShcc = this.ma;
                T.download(T.url(`/api/qua-trinh/dao-tao/download-excel/${listShcc ? listShcc : null}/${null}/${null}/${null}/${null}`), 'daotaoboiduong.xlsx');
            }
        });
    }
}

const mapStateToProps = state => ({ system: state.system, qtDaoTao: state.tccb.qtDaoTao });
const mapActionsToProps = {
    deleteQtDaoTao, updateQtDaoTao,
    getQtDaoTaoPage, createQtDaoTao
};
export default connect(mapStateToProps, mapActionsToProps)(QtDaoTaoGroupPage);