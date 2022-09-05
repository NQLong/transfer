import React from 'react';
import { connect } from 'react-redux';
import { getDtDmThuAll, deleteDtDmThu, createDtDmThu, updateDtDmThu } from './redux';
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
        let { ma, ten, kichHoat } = item ? item : { ma: '', ten: '', kichHoat: 1 };
        this.setState({ ma});
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
    };

    onSubmit = (e) => {
        const changes = {
            // ma: this.ma.value(),
            // ten: this.ten.value(),
            // kichHoat: this.kichHoat.value() ? 1 : 0,
            ma: getValue(this.ma),
            ten: getValue(this.ten),
            kichHoat: Number(getValue(this.kichHoat))
        };
        if (changes.ten == '') {
            T.notify('Tên thứ bị trống!', 'danger');
            this.ten.focus();
        } else {
            this.state.ma ? this.props.update(this.state.ma, changes, this.hide) : this.props.create(changes, this.hide);
        }
        e.preventDefault();
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.ma ? 'Cập nhật Thứ' : 'Tạo mới Thứ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Ma' readOnly={readOnly} required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex' }} required />
            </div>
        }
        );
    };
}

class DtDmThuPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            this.props.getDtDmThuAll();
        });
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa Thứ', `Bạn có chắc bạn muốn xóa Thứ ${item.ten ? `<b>${item.ten}</b>` : 'này'} ?`, true, isConfirm => {
            isConfirm && this.props.deleteDtDmThu(item.ma);
        });
    }

    render() {
        const permission = this.getUserPermission('dtDmThu');
        let list = this.props.dtDmThu && this.props.dtDmThu.items ? this.props.dtDmThu.items : null;
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            emptyTable: 'Chưa có dữ liệu Thứ!',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>#</th>
                    <th style={{ width: '80%' }} nowrap='true'>Tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission}
                        onChanged={() => this.props.updateDtDmThu(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 })} />
                    <TableCell type='buttons' content={item} permission={permission}
                        onEdit={() => this.modal.show(item)} onDelete={this.delete} />
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Thứ',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Thứ'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <EditModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDtDmThu} update={this.props.updateDtDmThu} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission && permission.write ? (e) => this.showModal(e) : null
        });
    }


}

const mapStateToProps = state => ({ system: state.system, dtDmThu: state.daoTao.dtDmThu });
const mapActionsToProps = { getDtDmThuAll, deleteDtDmThu, createDtDmThu, updateDtDmThu };
export default connect(mapStateToProps, mapActionsToProps)(DtDmThuPage);