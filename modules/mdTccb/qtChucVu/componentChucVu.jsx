import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getChucVuByShcc } from './redux';

class ComponentChucVu extends AdminPage {
    loaiChucVuMap = {
        0: 'Chức vụ đoàn thể',
        1: 'Chức vụ chính quyền',
        2: 'Chức vụ Hội đồng trường',
        3: 'Chức vụ Đảng ủy',
        4: 'Chức vụ Công đoàn',
        5: 'Chức vụ Hội Cựu Chiến binh',
        6: 'Chức vụ Đoàn Thanh niên - Hội Sinh viên'
    };

    render() {
        let type = this.props.type,
            dataChucVu = (type == 'CQ') ? this.props.staff?.dataStaff?.chucVuChinhQuyen : this.props.staff?.dataStaff?.chucVuDoanThe;
        const renderTableChucVu = (items) => renderTable({
            getDataSource: () => items, stickyHead: false,
            header: 'thead-light',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '30%', whiteSpace: 'nowrap' }}>Chức vụ</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Đơn vị cấp trường</th>
                    <th style={{ width: '25%', whiteSpace: 'nowrap' }}>Đơn vị cấp khoa</th>
                    <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Quyết định bổ nhiệm</th>
                    {type == 'CQ' && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ chính</th>}
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' content={(
                        type == 'CQ' ? <span>{item.tenChucVu}</span>
                            : <>
                                <span>{item.tenChucVu}</span><br />
                                <span>{this.loaiChucVuMap[item.loaiChucVu]}</span>
                            </>)} />
                    <TableCell type='text' content={item.tenDonVi} />
                    <TableCell type='text' content={item.tenBoMon} />
                    <TableCell type='text' content={(
                        <>
                            <span>Số: {item.soQuyetDinh}</span><br />
                            <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQuyetDinh ? new Date(item.ngayRaQuyetDinh).ddmmyyyy() : ''}</span></span>
                        </>
                    )}
                    />
                    {type == 'CQ' && <TableCell style={{ textAlign: 'center' }} content={item.chucVuChinh ? 'x' : ''} />}
                </tr>)
        });

        return (
            (dataChucVu && dataChucVu.length) ?
                <div>{this.props.label}
                    <div className='tile-body' style={{ marginTop: '10px' }}>
                        {dataChucVu && renderTableChucVu(dataChucVu)}
                    </div>
                </div>
                : null);
    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getChucVuByShcc
};
export default connect(mapStateToProps, mapActionsToProps)(ComponentChucVu);