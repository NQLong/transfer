import React from 'react';
import { connect } from 'react-redux';
import { getStaffEdit, userGetStaff } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDmNgoaiNguAll, SelectAdapter_DmNgoaiNgu } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';
import {
    createTrinhDoNNStaff, updateTrinhDoNNStaff, deleteTrinhDoNNStaff,
    createTrinhDoNNStaffUser, updateTrinhDoNNStaffUser, deleteTrinhDoNNStaffUser
} from './redux';
import { Select } from 'view/component/Input';

class TrinhDoNNModal extends AdminModal {
    onShow = (item) => {
        let { id, loaiNgonNgu, trinhDo } = item && item.item ? item.item : { id: null, loaiNgonNgu: null, trinhDo: '' };
        this.setState({ id, email: item.email, item, shcc: item.shcc });
        this.loaiNgonNgu.setVal(loaiNgonNgu);
        this.trinhDo.value(trinhDo);
    }

    onSubmit = () => {
        const changes = {
            shcc: this.state.shcc,
            email: this.state.email,
            loaiNgonNgu: this.loaiNgonNgu.getVal(),
            trinhDo: this.trinhDo.value()
        };
        if (this.state.id) {
            this.props.update(this.state.id, changes, this.hide);
        } else {
            this.props.create(changes, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin ngoại ngữ',
        size: 'large',
        body: <div className='row'>
            <div className='col-md-6'><Select ref={e => this.loaiNgonNgu = e} adapter={SelectAdapter_DmNgoaiNgu} label='Loại ngôn ngữ' required /></div>
            <FormTextBox className='col-md-6' ref={e => this.trinhDo = e} label='Trình độ' />
        </div>,
    });
}


class ComponentNN extends AdminPage {
    mapperNgonNgu = {};
    shcc = '';
    email = '';
    componentDidMount() {
        this.props.getDmNgoaiNguAll({ kichHoat: 1 }, items => {
            items.forEach(item => this.mapperNgonNgu[item.ma] = item.ten);
        });
    }

    value = (shcc, email) => {
        this.shcc = shcc;
        this.email = email;
    }

    showModal = (e, item) => {
        e.preventDefault();
        this.modal.show({ item: item, shcc: this.shcc, email: this.email });
    }

    deleteTrinhDoNN = (e, item) => {
        T.confirm('Xóa thông tin trình độ ngoại ngữ', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && (this.props.userEdit ? this.props.deleteTrinhDoNNStaffUser(item.id, () => this.props.userGetStaff(this.email)) : this.props.deleteTrinhDoNNStaff(item.id, () => this.props.getStaffEdit(this.shcc))));
        e.preventDefault();
    }

    render() {
        const dataTrinhDoNgoaiNgu = this.props.userEdit ? this.props.staff?.userItem?.trinhDoNN : this.props.staff?.selectedItem?.trinhDoNN;
        let permission = this.getUserPermission('staff', ['read', 'write', 'delete']);
        permission.read = true;
        permission.write = true;
        permission.delete = true;

        const renderNNTable = (items) => (
            renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: '30%' }}>Loại ngôn ngữ</th>
                        <th style={{ width: '70%' }}>Trình độ</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='link' content={item.tenLoaiNgonNgu} onClick={e => this.showModal(e, item)} />
                        <TableCell type='text' content={item.trinhDo} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={e => this.showModal(e, item)} onDelete={this.deleteTrinhDoNN}></TableCell>
                    </tr>)
            })
        );

        return (
            <div className='col-md-12 form-group'>
                <div>{this.props.label}
                    <div className='tile-body'>{dataTrinhDoNgoaiNgu ? renderNNTable(dataTrinhDoNgoaiNgu) : renderNNTable([])}</div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-info' type='button' onClick={e => this.showModal(e, null)}>
                            <i className='fa fa-fw fa-lg fa-plus' />Thêm trình độ ngoại ngữ
                        </button>
                    </div>
                    <TrinhDoNNModal ref={e => this.modal = e} shcc={this.shcc} email={this.email}
                        create={this.props.userEdit ? this.props.createTrinhDoNNStaffUser : this.props.createTrinhDoNNStaff}
                        update={this.props.userEdit ? this.props.updateTrinhDoNNStaffUser : this.props.updateTrinhDoNNStaff} />
                </div>
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, userGetStaff, getDmNgoaiNguAll, createTrinhDoNNStaff, updateTrinhDoNNStaff, deleteTrinhDoNNStaff, createTrinhDoNNStaffUser, updateTrinhDoNNStaffUser, deleteTrinhDoNNStaffUser
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentNN);