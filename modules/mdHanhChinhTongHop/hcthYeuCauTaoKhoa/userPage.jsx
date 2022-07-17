import React from 'react';
import { AdminPage, renderTable } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { TableCell } from '@mui/material';

export class UserYeuCauTaoKhoa extends AdminPage {
    componentDidMount() {
        T.ready(this.pageConfig.ready, () => {
        })
    }

    renderTable = (data) => renderTable({
        getDataSource: () => data,
        emptyTable: 'Chưa có yêu cầu tạo khóa',
        renderHead: () => <tr>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>#</th>
            <th style={{ width: '100%', whiteSpace: 'nowrap' }}>Người yêu cầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày yêu cầu</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày duyệt</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
        </tr>,
        renderRow: (item, index) => {
            return <tr key={index}>
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.R || index} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.shcc}: ` + `${item.ho} ${item.ten}`.trim().normalizedName()} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayTao && T.dateToText(new Date(item.ngayTao), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.ngayDuyet && T.dateToText(new Date(item.ngayDuyet), 'HH:MM dd/mm/yyyy')} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={item.trangThai} />
                <TableCell style={{ whiteSpace: 'nowrap' }} content={''} />
            </tr>
        }
    });

    pageConfig = {
        title: 'Yêu cầu tạo khóa',
        ready: '/user',
        icon: 'fa fa-key'
    }


    render() {
        return this.renderPage({
            title: this.pageConfig.title,
            icon: this.pageConfig.icon,
            content: <>
                <div className='tile row'>
                    <h3 className='tile-header'>Khóa của bạn</h3>
                    <div className='col-md-12'>
                        {this.renderTable([{}])}
                    </div>
                </div>
                <div className='tile row'>
                    <h3 className='tile-header'>Lịch sử yêu cầu tạo khóa</h3>
                    <div className='tile-body col-md-12'>
                        {this.renderTable({})}
                    </div>
                </div>
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthYeuCauTaoKhoa: state.hcth.hcthYeuCauTaoKhoa });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserYeuCauTaoKhoa);