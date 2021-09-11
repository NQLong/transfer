import React from 'react';
import { connect } from 'react-redux';
import { getDmGiamBhxhAll, deleteDmGiamBhxh, createDmGiamBhxh, updateDmGiamBhxh } from './reduxGiamBhxh';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox  } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true };
    modal = React.createRef();

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };
 
        this.setState({ kichHoat });
        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);
        $(this.modal).attr('data-id', ma).modal('show');
    };
    hide = () => $(this.modal).modal('hide');

    onSubmit = () => {
        const ma = $(this.modal).attr('data-id'),
            changes = {
                ma: this.ma.value(),
                moTa: this.moTa.value(),
                kichHoat: Number(this.state.kichHoat),
            };
        
        if (changes.ma == '') {
            T.notify('Mã giảm BHXH bị trống', 'danger');
            this.ma.focus();
        }
        else if (changes.moTa == '') {
            T.notify('Mô tả BHXH bị trống', 'danger');
            this.ma.focus();
        }
        else {
            if (ma) {
                this.props.updateDmGiamBhxh(ma, changes);
            } else {
                this.props.createDmGiamBhxh(changes);
            }
            $(this.modal).modal('hide');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Cập nhật giảm BHXH' : 'Tạo mới giảm BHXH',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} placeholder='Mã giảm BHXH' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả' placeholder='Mô tả' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} 
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        })
    }
}

class DmGiamBhxhPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmGiamBhxhAll());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmGiamBhxh(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa thông tin này?', true, isConfirm =>
            isConfirm && this.props.deleteDmGiamBhxh(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmGiamBhxh:write'),
            permission = this.getUserPermission('dmGiamBhxh', ['write', 'delete']);

        let items = this.props.dmGiamBhxh && this.props.dmGiamBhxh.items ? this.props.dmGiamBhxh.items : [];
        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>Mã</th>
                    <th style={{ width: '100%' }}>Mô tả</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.ma} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.moTa} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}></TableCell>
                </tr>
            ),
        })


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' />  Giảm Bảo hiểm xã hội</h1>
                </div>
                <div className='tile'>{table}
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        createDmGiamBhxh={this.props.createDmGiamBhxh} updateDmGiamBhxh={this.props.updateDmGiamBhxh} />
                    <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                        <i className='fa fa-lg fa-reply' />
                    </Link>
                    {permissionWrite && (
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>)}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmGiamBhxh: state.dmGiamBhxh });
const mapActionsToProps = { getDmGiamBhxhAll, deleteDmGiamBhxh, createDmGiamBhxh, updateDmGiamBhxh };
export default connect(mapStateToProps, mapActionsToProps)(DmGiamBhxhPage);