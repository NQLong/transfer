import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import { getDmChucVuAll } from 'modules/mdDanhMuc/dmChucVu/redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDmBoMonAll } from 'modules/mdDanhMuc/dmBoMon/redux';
import { EditModal } from 'modules/mdTccb/qtChucVu/adminPage';
import { getQtChucVuAll } from 'modules/mdTccb/qtChucVu/redux';
class ComponentChucVu extends AdminPage {
    data = [];
    mapperChucVu = {}; mapperDonVi = {}; mapperBoMon = {}; mapperChucVu1 = {};
    type = '';
    loaiChucVuMap = {
        0: 'Chức vụ đoàn thể',
        1: 'Chức vụ chính quyền',
        2: 'Chức vụ Hội đồng trường',
        3: 'Chức vụ Đảng ủy',
        4: 'Chức vụ Công đoàn',
        5: 'Chức vụ Hội Cựu Chiến binh',
        6: 'Chức vụ Đoàn Thanh niên - Hội Sinh viên'
    };

    componentDidMount() {
        this.props.getDmChucVuAll(items => items.forEach(i => this.mapperChucVu[i.ma] = i.loaiChucVu));
        this.props.getDmChucVuAll(items => items.forEach(i => this.mapperChucVu1[i.ma] = i.ten));
        this.props.getDmDonViAll(items => items.forEach(i => this.mapperDonVi[i.ma] = i.ten));
        this.props.getDmBoMonAll(items => items.forEach(i => this.mapperBoMon[i.ma] = i.ten));

    }
    value(item, type) {
        this.data = item;
        this.type = type;
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }
    render() {
        const permission = this.getUserPermission('staff', ['read', 'write', 'delete']);
        const renderTableChucVu = (items) => renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: '70%', textAlign: 'center' }}>Chức vụ</th>
                    <th style={{ width: '30%', textAlign: 'center' }}>Quyết định bổ nhiệm</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Chức vụ chính</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>

                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' content={(
                        this.type == 1 ? <>
                            <span>{this.mapperChucVu1[item.maChucVu]}</span><br />
                            <span>{item.maDonVi ? 'Đơn vị: ' + this.mapperDonVi[item.maDonVi] : 'Bộ môn/Phòng: ' + this.mapperBoMon[item.maBoMon]}</span>
                        </> :
                            <>
                                <span>{this.mapperChucVu1[item.maChucVu]}</span><br />
                                <span>{this.loaiChucVuMap[this.type]}</span>
                            </>

                    )} />
                    <TableCell type='text' content={(
                        <>
                            <span>Số: {item.soQd}</span><br />
                            <span>Ngày: <span style={{ color: 'blue' }}>{item.ngayRaQd ? new Date(item.ngayRaQd).ddmmyyyy() : ''}</span></span>
                        </>
                    )}
                    />
                    <TableCell type='checkbox' content={item.chucVuChinh} />

                    <TableCell type='buttons' content={item} permission={permission} permissionDelete={true}
                        onEdit={() => this.modal.show(item)}
                        onDelete={e => this.delete(e, item)}></TableCell>
                </tr>)
        });

        return (
            <div className='col-md-12 form-group'>
                <p>{this.props.label}</p>
                <div className='tile-body'>{renderTableChucVu(this.data && this.type == 1 ? this.data.filter(i => this.mapperChucVu[i.maChucVu] == this.type) : this.data.filter(i => this.mapperChucVu[i.maChucVu] != 1))}</div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={e => this.showModal(e)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm {this.loaiChucVuMap[this.type]}
                    </button>
                </div>
                <EditModal ref={e => this.modal = e}
                    getQtChucVuAll={this.props.getQtChucVuAll}
                    create={this.props.createQtChucVu} update={this.props.updateQtChucVu}
                />
            </div>


        );

    }
}

const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getDmChucVuAll, getDmDonViAll, getDmBoMonAll, getQtChucVuAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentChucVu);
