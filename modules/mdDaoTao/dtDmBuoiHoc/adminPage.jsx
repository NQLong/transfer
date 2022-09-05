import React from 'react';
import { connect } from 'react-redux';
import { getDtDmBuoiHocAll, deleteDtDmBuoiHoc, createDtDmBuoiHoc, updateDtDmBuoiHoc } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox, getValue} from 'view/component/AdminPage';
class EditModal extends AdminModal {
    //Always begin with componentDidMount
    componentDidMount() {
        this.onShown(() => {
            this.ten.focus();
        });

    }
    onShow = (item) => {
        let { id, ten, kichHoat } = item ? item : { id: null, ten: '', kichHoat: true };
        this.setState({ id, ten, item });
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        e.preventDefault();
        const changes = {
            ten: getValue(this.ten),
            kichHoat: Number(getValue(this.kichHoat))
        };
        if (changes.ten == '') {
            T.notify('Tên Buổi Học bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ten ? this.props.update(this.state.id, changes, this.hide) : this.props.create(changes, this.hide);
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ten ? 'Cập nhật Buổi Học' : 'Tạo mới Buổi Học',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
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
        T.confirm('Xóa Buổi Học', `Bạn có chắc bạn muốn xóa Buổi Học ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteDtDmBuoiHoc(item.id);
        });
    }

    render() {
        const permission = this.getUserPermission('dtDmBuoiHoc');
        let list = this.props.dtDmBuoiHoc && this.props.dtDmBuoiHoc.items ? this.props.dtDmBuoiHoc.items : null;
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu Buổi Học!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>#</th>
                    <th style={{ width: '80%' }} nowrap='true'>Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Loại Hình</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateDtDmBuoiHoc(item.id, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell content={item.loaiHinh} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Buổi Học',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Buổi Học'
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