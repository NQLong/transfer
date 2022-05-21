import { Tooltip } from '@mui/material';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';
import { DaoTaoModal } from '../qtDaoTao/daoTaoModal';
import { SupportModal } from '../tccbCanBo/supportModal';
import { getPageTccbSupport, createTccbSupportReply, assignTccbSupport, getTccbReply } from './redux';
import { getItemQtDaoTao } from '../qtDaoTao/redux';
import PhanHoiModal from './PhanHoiModal';
import { getStaffEdit } from '../tccbCanBo/redux';
let CONSTANT = require('./constantTccbSupport'),
    { QT_MAPPER } = CONSTANT;

const TYPE_MAPPER = {
    create: <span className='text-success'><i className='fa fa-plus' /> Tạo mới</span>,
    update: <span className='text-primary'><i className='fa fa-edit' /> Cập nhật</span>,
    delete: <span className='text-danger'><i className='fa fa-trash' /> Xoá</span>,
},
    APPROVED_MAPPER = {
        1: <span className='text-success'><i className='fa fa-check' /> Đã duyệt</span>,
        0: <span className='text-warning'><i className='fa fa-clock-o' /> Đang chờ</span>,
        [-1]: <span className='text-danger'><i className='fa fa-times' /> Từ chối</span>,
    };

class AdminSupportPage extends AdminPage {

    componentDidMount() {
        T.ready('/user/tccb', () => {
            this.props.getPageTccbSupport();
        });
    }

    duyetYeuCau = (item) => {
        T.confirm('Duyệt yêu cầu hỗ trợ thông tin', 'Bạn có chắc muốn duyệt yêu cầu này?', 'warning', true, isConfirm => {
            isConfirm && this.props.assignTccbSupport(item);
        });
    }
    render() {
        const { pageNumber, pageSize, totalItem, pageTotal, list } = this.props.tccbSupport && this.props.tccbSupport.page ? this.props.tccbSupport.page : { pageNumber: 1, pageSize: 50, totalItem: 0, pageTotal: 0, list: null },
            permission = this.getUserPermission('tccbSupport');
        let table = renderTable({
            emptyTable: 'Không có dữ liệu yêu cầu hỗ trợ',
            stickyHead: true,
            header: 'thead-light',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Mã</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Cán bộ yêu cầu</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian gửi</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap', textAlign: 'center' }}>Loại</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Yêu cầu về</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Cán bộ xử lý</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thời gian xử lý</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ textAlign: 'right' }} content={item.id} onClick={e => e.preventDefault() || this[item.qt].show({ data: T.parse(item.data), qtId: item.qtId })} />
                    <TableCell content={<>{item.canBoYeuCau?.normalizedName() || ''}<br />{item.shcc}</>} />
                    <TableCell content={<>{item.sentDate ?
                        <>
                            {T.dateToText(item.sentDate, 'dd/mm/yyyy')}
                            <br />
                            {T.dateToText(item.sentDate, 'HH:mm:ss')}
                        </>
                        : ''}</>} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={TYPE_MAPPER[item.type]} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={QT_MAPPER[item.qt]} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.canBoXuLy?.normalizedName() || ''}<br />{item.shccAssign}</>} />
                    <TableCell content={<>{item.modifiedDate ?
                        <>
                            {T.dateToText(item.modifiedDate, 'dd/mm/yyyy')}
                            <br />
                            {T.dateToText(item.modifiedDate, 'HH:mm:ss')}
                        </>
                        : ''}</>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={APPROVED_MAPPER[item.approved]} />
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<>
                        {item.approved != 1 && <Tooltip title='Phản hồi' arrow>
                            <button className='btn btn-danger' onClick={e => e.preventDefault() || this.phanHoi.show({ maYeuCau: item.id, canBoYeuCau: item.canBoYeuCau, quaTrinh: QT_MAPPER[item.qt] })}>
                                <i className='fa fa-lg fa-comments-o' />
                            </button>
                        </Tooltip>}
                    </>
                    }>
                    </TableCell>
                </tr>
            )
        });
        return this.renderPage({
            title: 'Xử lý yêu cầu thông tin',
            icon: 'fa fa-universal-access',
            breadcrumb: [
                <Link key={0} to='/user'>Trang cá nhân</Link>,
                'Xử lý yêu cầu thông tin'
            ],
            backRoute: '/user',
            content: <div className='tile'>
                {table}
                <Pagination getPage={this.props.getPageTccbSupport} {...{ pageNumber, pageSize, pageTotal, totalItem }} style={{ marginLeft: '70px' }} />
                <DaoTaoModal ref={e => this.qtDaoTao = e} isSupport={true} readOnly={true} getItemQtDaoTao={this.props.getItemQtDaoTao} />
                <SupportModal ref={e => this.canBo = e} readOnly={true} isSupport={true} getStaffEdit={this.props.getStaffEdit} />
                <PhanHoiModal ref={e => this.phanHoi = e} permission={permission} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbSupport: state.tccb.tccbSupport });
const mapActionsToProps = {
    getPageTccbSupport, createTccbSupportReply, assignTccbSupport, getItemQtDaoTao, getTccbReply, getStaffEdit
};
export default connect(mapStateToProps, mapActionsToProps)(AdminSupportPage);