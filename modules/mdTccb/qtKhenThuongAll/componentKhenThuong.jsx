import { SelectAdapter_DmKhenThuongChuThichV2 } from 'modules/mdDanhMuc/dmKhenThuongChuThich/redux';
import { SelectAdapter_DmKhenThuongKyHieuV2 } from 'modules/mdDanhMuc/dmKhenThuongKyHieu/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { createQtKhenThuongAll, updateQtKhenThuongAll, deleteQtKhenThuongAll } from './redux';
import { getStaffEdit, SelectAdapter_FwCanBo } from '../tccbCanBo/redux';

class EditModal extends AdminModal {
    state = { id: '' };

    onShow = (item) => {
        let { id, namDatDuoc, maThanhTich, maChuThich, diemThiDua } = item && item.item ? item.item : {
            id: '', ma: '', namDatDuoc: '', maThanhTich: '', maChuThich: '', diemThiDua: ''
        };
        this.maCanBo.value(item.shcc);
        this.namDatDuoc.value(namDatDuoc ? namDatDuoc : '');
        this.thanhTich.value(maThanhTich ? maThanhTich : '');
        this.chuThich.value(maChuThich ? maChuThich : '');
        this.diemThiDua.value(diemThiDua);

        this.setState({id, item, shcc: item.shcc});
    };

    changeKichHoat = (value, target) => target.value(value ? 1 : 0) || target.value(value);

    onSubmit = (e) => {
        e.preventDefault();

        const changes = {
            loaiDoiTuong: '02',
            ma: this.state.shcc,
            namDatDuoc: this.namDatDuoc.value(),
            thanhTich: this.thanhTich.value(),
            chuThich: this.chuThich.value(),
            diemThiDua: this.diemThiDua.value() ? this.diemThiDua.value() : null,
        };
        if (!changes.namDatDuoc) {
            T.notify('Năm đạt được thành tích bị trống!', 'danger');
            this.namDatDuoc.focus();
        }
        else if (!changes.thanhTich) {
            T.notify('Thành tích bị trống!', 'danger');
            this.thanhTich.focus();
        }
        else {
            this.state.id ? this.props.update(true, this.state.id, changes, this.hide) : this.props.create(true, changes, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.id ? 'Cập nhật quá trình khen thưởng' : 'Tạo mới quá trình khen thưởng',
            size: 'large',
            body: <div className='row'>
                <FormSelect className='col-md-12' ref={e => this.maCanBo = e} label='Cán bộ' data={SelectAdapter_FwCanBo} readOnly/>
                <FormSelect className='col-md-12' ref={e => this.thanhTich = e} label='Thành tích' data={SelectAdapter_DmKhenThuongKyHieuV2} readOnly={readOnly} required/>
                <FormTextBox className='col-md-4' ref={e => this.namDatDuoc = e} label='Năm đạt được (yyyy)' type='year' readOnly={readOnly} required/>
                <FormSelect className='col-md-8' ref={e => this.chuThich = e} label='Chú thích' data={SelectAdapter_DmKhenThuongChuThichV2} readOnly={readOnly} required/>
                <FormTextBox className='col-md-4' ref={e => this.diemThiDua = e} type='number' label='Điểm khen thưởng' readOnly={readOnly} />
            </div>
        });
    }
}
class ComponentKhenThuong extends AdminPage {
    state = { shcc: '', data: [] };
    value = (shcc) => {
        this.setState({ shcc }, () =>
            this.setState({ data: this.props.userEdit ? this.props.staff?.userItem?.khenThuong : [] }));
    }

    delete = (e, item) => {
        T.confirm('Xóa khen thưởng', 'Bạn có chắc bạn muốn xóa khen thưởng này?', 'warning', true, isConfirm => {
            isConfirm && this.props.deleteQtKhenThuongAll(true, item.id, this.state.shcc, error => {
                if (error) T.notify(error.message ? error.message : 'Xoá khen thưởng bị lỗi!', 'danger');
                else T.alert('Xoá khen thưởng thành công!', 'success', false, 800);
            });
        });
        e.preventDefault();
    }

    showModal = (e, item, shcc) => {
        e.preventDefault();
        this.modal.show({item: item, shcc: shcc});
    }

    render = () => {
        let dataKhenThuong = !this.props.userEdit ? this.props.staff?.selectedItem?.khenThuong : [];
        const permission = this.getUserPermission('staff', ['read', 'write', 'delete']);
        const renderTableKhenThuong = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Đối tượng</th>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Năm đạt được</th>
                        <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thành tích</th>
                        <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                        <TableCell type='link' onClick={() => this.modal.show({item: item, shcc: item.maCanBo})} style={{ whiteSpace: 'nowrap' }} content={(
                            <>
                                <span>{item.hoCanBo + ' ' + item.tenCanBo}</span><br />
                                {item.maCanBo}
                            </>

                        )}
                        />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(
                            <>
                                {item.namDatDuoc}
                            </>
                        )}
                        />
                        <TableCell type='text' content={(
                            <>
                                {item.tenThanhTich}
                            </>
                        )}
                        />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onEdit={() => this.modal.show({item: item, shcc: item.maCanBo})} onDelete={this.delete} />
                    </tr>
                )
            })
        );

        return (
            <div className='tile'>
                <h3 className='tile-title'>Thông tin khen thưởng</h3>
                <div className='tile-body'>
                    <p>{this.props.label}</p>
                    {
                        this.props.userEdit ?
                            (this.state.data && renderTableKhenThuong(this.state.data))
                            :
                            (dataKhenThuong && renderTableKhenThuong(dataKhenThuong))
                    }
                    {
                        !this.props.userEdit ? <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null, this.state.shcc)}>
                                <i className='fa fa-fw fa-lg fa-plus' />Thêm thông tin khen thưởng
                            </button>
                        </div> : null
                    }
                    <EditModal ref={e => this.modal = e} permission={permission} readOnly={this.props.userEdit}
                    create={this.props.createQtKhenThuongAll} update={this.props.updateQtKhenThuongAll}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, staff: state.tccb.staff });
const mapActionsToProps = {
    getStaffEdit, createQtKhenThuongAll, updateQtKhenThuongAll, deleteQtKhenThuongAll
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentKhenThuong);