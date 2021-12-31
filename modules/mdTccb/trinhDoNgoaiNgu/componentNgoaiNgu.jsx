import React from 'react';
import { connect } from 'react-redux';
import { getStaffEdit } from 'modules/mdTccb/tccbCanBo/redux';
import { AdminModal, AdminPage, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { getDmNgoaiNguAll, SelectAdapter_DmNgoaiNgu } from 'modules/mdDanhMuc/dmNgoaiNgu/redux';
import { createTrinhDoNNStaff, updateTrinhDoNNStaff, deleteTrinhDoNNStaff } from './redux';
import { Select } from 'view/component/Input';

class TrinhDoNNModal extends AdminModal {
    state = {
        id: null,
        shcc: '',
    }

    onShow = (item) => {
        let { id, loaiNgonNgu, trinhDo } = item ? item : { id: null, loaiNgonNgu: null, trinhDo: '' };
        this.setState({ id });
        setTimeout(() => {
            this.loaiNgonNgu.setVal(loaiNgonNgu);
            this.trinhDo.value(trinhDo);
        }, 500);
    }

    onSubmit = () => {
        const id = this.state.id,
            shcc = this.props.shcc,
            changes = {
                loaiNgonNgu: this.loaiNgonNgu.getVal(),
                trinhDo: this.trinhDo.value()
            };
        if (id) {
            this.props.update(id, changes, this.hide);
        } else {
            changes.shcc = shcc;
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
    componentDidMount() {
        this.props.getDmNgoaiNguAll({ kichHoat: 1 }, items => {
            items.forEach(item => this.mapperNgonNgu[item.ma] = item.ten);
        });
    }

    value = (shcc) => {
        console.log(shcc);
        this.shcc = shcc;
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show(null);
    }

    deleteTrinhDoNN = (e, item) => {
        T.confirm('Xóa thông tin trình độ ngoại ngữ', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteTrinhDoNNStaff(item.id, () => this.props.getStaffEdit(this.shcc)));
        e.preventDefault();
    }

    render() {
        const dataTrinhDoNgoaiNgu = this.props.staff?.selectedItem?.trinhDoNN;
        let permission = this.getUserPermission('staff', ['read', 'write', 'delete']);
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
                        <TableCell type='link' content={this.mapperNgonNgu[item.loaiNgonNgu]} onClick={() => this.modal.show(item)} />
                        <TableCell type='text' content={item.trinhDo} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.modal.show(item)} onDelete={this.deleteTrinhDoNN}></TableCell>
                    </tr>)
            })
        );

        return (
            <div className='col-md-12 form-group'>
                <p>{this.props.label}</p>
                <div className='tile-body'>{dataTrinhDoNgoaiNgu ? renderNNTable(dataTrinhDoNgoaiNgu) : renderNNTable([])}</div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={e => this.showModal(e)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm trình độ ngoại ngữ
                    </button>
                </div>
                <TrinhDoNNModal ref={e => this.modal = e} shcc={this.shcc} create={this.props.createTrinhDoNNStaff} update={this.props.updateTrinhDoNNStaff} getData={this.props.getStaffEdit} />
            </div>
        );
    }
}
const mapStateToProps = state => ({ staff: state.staff, system: state.system });
const mapActionsToProps = {
    getStaffEdit, getDmNgoaiNguAll, createTrinhDoNNStaff, updateTrinhDoNNStaff, deleteTrinhDoNNStaff
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentNN);