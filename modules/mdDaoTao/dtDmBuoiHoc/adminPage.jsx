import React from 'react';
import { connect } from 'react-redux';
import { getDtDmBuoiHocAll, deleteDtDmBuoiHoc, createDtDmBuoiHoc, updateDtDmBuoiHoc } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue, FormSelect } from 'view/component/AdminPage';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
class EditModal extends AdminModal {
    // Always begin with componentDidMount
    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });
    }
    onShow = (item) => {
        let { id, ten, kichHoat, loaiHinh } = item ? item : { id: null, ten: '', kichHoat: true, loaiHinh: '' };
        this.setState({ id, ten, item });
        this.ten.value(ten);
        this.loaiHinh.value(loaiHinh.split(','));
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            loaiHinh: getValue(this.loaiHinh).join(','),
            kichHoat: Number(getValue(this.kichHoat))
        };
        this.state.ten ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ten ? 'Cập nhật buổi học' : 'Tạo mới buổi học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-6' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormSelect ref={e => this.loaiHinh = e} label='Hệ đào tạo' readOnly={readOnly} data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-6' multiple />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
            </div>
        }
        );
    };
}

class DtDmBuoiHocPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmBuoiHocAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa Buổi học', `Bạn có chắc bạn muốn xóa Buổi học ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteDtDmBuoiHoc(item.id);
        });
    }

    render() {
        const permission = this.getUserPermission('dtDmBuoiHoc');
        let list = this.props.dtDmBuoiHoc && this.props.dtDmBuoiHoc.items ? this.props.dtDmBuoiHoc.items : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu Buổi học!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Tên</th>
                    <th style={{ width: '90%' }} nowrap='true'>Hệ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.ten} onClick={() => this.modal.show(item)} />
                    <TableCell content={item.tenLoaiHinh.join(', ')} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateDtDmBuoiHoc(item.id, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Buổi học',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Buổi học'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtDmBuoiHoc} update={this.props.updateDtDmBuoiHoc} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }


}

const mapStateToProps = state => ({ system: state.system, dtDmBuoiHoc: state.daoTao.dtDmBuoiHoc });
const mapActionsToProps = { getDtDmBuoiHocAll, deleteDtDmBuoiHoc, createDtDmBuoiHoc, updateDtDmBuoiHoc };
export default connect(mapStateToProps, mapActionsToProps)(DtDmBuoiHocPage);