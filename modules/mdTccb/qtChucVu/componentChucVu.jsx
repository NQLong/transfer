import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmBoMonAll } from 'modules/mdDanhMuc/dmBoMon/redux';
import { getStaffEdit } from 'modules/mdTccb/tccbCanBo/redux';
import { getQtChucVuAll, createQtChucVu, updateQtChucVu, deleteQtChucVu } from 'modules/mdTccb/qtChucVu/redux';
import { getChucVuByShcc } from './redux';

class ComponentChucVu extends AdminPage {
    state = { type: '', shcc: '', data: [] }
    loaiChucVuMap = {
        0: 'Chức vụ đoàn thể',
        1: 'Chức vụ chính quyền',
        2: 'Chức vụ Hội đồng trường',
        3: 'Chức vụ Đảng ủy',
        4: 'Chức vụ Công đoàn',
        5: 'Chức vụ Hội Cựu Chiến binh',
        6: 'Chức vụ Đoàn Thanh niên - Hội Sinh viên'
    };

    value = (type, shcc) => {
        this.setState({ type: type ? true : false, shcc }, () =>
            this.setState({ data: this.props.userEdit ? this.props.staff?.userItem?.chucVu.filter(i => i.lcv == this.state.type) : [] })
        );
    }

    render() {
        let dataChucVu = !this.props.userEdit ? this.props.staff?.selectedItem?.chucVu.filter(i => i.lcv == this.state.type) : [];
        let display = ((this.state.data && this.state.data.length > 0) || (dataChucVu && dataChucVu.length > 0)) ? true : false;
        const renderTableChucVu = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '30%', textAlign: 'center', whiteSpace: 'nowrap' }}>Chức vụ</th>
                        <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị cấp trường</th>
                        <th style={{ width: '25%', textAlign: 'center', whiteSpace: 'nowrap' }}>Đơn vị cấp khoa</th>
                        <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Quyết định bổ nhiệm</th>
                        {this.state.type == 1 && <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ chính</th>}
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={index + 1} />
                        <TableCell type='text' content={(
                            this.state.type == 1 ? <>
                                <span>{item.tenChucVu}</span><br />
                            </> :
                                <>
                                    <span>{item.tenChucVu}</span><br />
                                    <span>{this.loaiChucVuMap[item.loaiChucVu]}</span>
                                </>

                        )} />
                        <TableCell type='text' content={item.tenDonVi} />
                        <TableCell type='text' content={item.tenBoMon} />
                        <TableCell type='text' content={(
                            <>
                                <span>Số: {item.soQuyetDinh}</span><br />
                                <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQuyetDinh ? new Date(item.ngayRaQuyetDinh).ddmmyyyy() : ''}</span></span>
                            </>
                        )}
                        />
                        {this.state.type == 1 && <TableCell type='checkbox' content={item.chucVuChinh} />}
                    </tr>)
            })
        );

        return (
            (display || !this.props.userEdit) ?
                <>
                    <div>{this.props.label}
                        <div className='tile-body'>
                            {
                                this.props.userEdit ?
                                    (this.state.data && renderTableChucVu(this.state.data))
                                    :
                                    (dataChucVu && renderTableChucVu(dataChucVu))
                            }
                        </div>
                    </div>
                </> : null
        );

    }
}

const mapStateToProps = state => ({ staff: state.tccb.staff, system: state.system });
const mapActionsToProps = {
    getDmChucVuAll, getDmDonViAll, getDmBoMonAll, getQtChucVuAll,
    createQtChucVu, updateQtChucVu, deleteQtChucVu, getStaffEdit, getChucVuByShcc
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentChucVu);