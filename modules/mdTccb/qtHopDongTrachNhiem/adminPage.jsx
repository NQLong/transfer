import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getQtHopDongTrachNhiemPage } from './redux';


class QtHopDongTrachNhiem extends AdminPage {
    state = { filter: {} }
    componentDidMount() {
        T.clearSearchBox();
        T.ready('/user/tccb', () => {
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                this.fromTime?.value('');
                this.toTime?.value('');
                this.donVi?.value('');
                this.canBo?.value('');
            });
            this.props.getQtHopDongTrachNhiemPage(undefined, undefined, '', {});
        });
    }

    render() {
        const permission = this.getUserPermission('qtHopDongTrachNhiem', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } =
            this.props.qtHopDongTrachNhiem && this.props.qtHopDongTrachNhiem.page ? this.props.qtHopDongTrachNhiem.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };
        let table = renderTable({
            emptyTable: 'Chưa có dữ liệu',
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Giới tính</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày sinh</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số hợp đồng</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người ký</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={() => this.modal.show({ item })} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            <span>{(item.ho ? item.ho.normalizedName() : ' ') + ' ' + (item.ten ? item.ten.normalizedName() : ' ')}</span><br />
                            {item.shcc}
                        </>
                    )} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.phai == '01' ? 'Nam' : 'Nữ'} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngaySinh ? T.dateToText(item.ngaySinh, 'dd/mm/yyyy') : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<b>{item.soHopDong}</b>} />
                    <TableCell content={<>
                        <span>Ngày ký: <b>{T.dateToText(item.ngayKyHopDong, 'dd/mm/yyyy')}</b> <br /></span>
                        <span>Hết hạn: <b>{T.dateToText(item.ketThucHopDong, 'dd/mm/yyyy')}</b></span>
                    </>} />
                    <TableCell type='link' onClick={() => this.modal.show({ item })} style={{ whiteSpace: 'nowrap' }} content={(
                        <>
                            {(item.hoNguoiKy ? item.hoNguoiKy.normalizedName() : ' ') + ' ' + (item.tenNguoiKy ? item.tenNguoiKy.normalizedName() : ' ')}<br />
                            {item.shccNguoiKy}
                        </>
                    )} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                        onEdit={`/user/tccb/qua-trinh/hop-dong-trach-nhiem/${item.ma}`}
                    >
                    </TableCell>
                </tr>
            )
        });
        return this.renderPage({
            title: 'Hợp đồng trách nhiệm',
            breadcrumb: [
                <Link key={0} to='/user/tccb'>Tổ chức cán bộ</Link>,
                'Hợp đồng trách nhiệm'
            ],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getQtHopDongTrachNhiemPage} />
            </>,
        });
    }
}
const mapStateToProps = state => ({ system: state.system, qtHopDongTrachNhiem: state.tccb.qtHopDongTrachNhiem });
const mapActionsToProps = {
    getQtHopDongTrachNhiemPage
};
export default connect(mapStateToProps, mapActionsToProps)(QtHopDongTrachNhiem);