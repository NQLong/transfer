import React from 'react';
import { connect } from 'react-redux';
import { createDmLoaiDonVi, getDmLoaiDonViAll, updateDmLoaiDonVi, deleteDmLoaiDonVi } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { active: true };
    modal = React.createRef();

    onShow = (item) => {
        const { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 0 };

        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.setState({ active: kichHoat == 1 });

        $(this.modal).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal).modal('hide');

    onSubmit = () => {
        const maLDV = $(this.modal).attr('data-id'),
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };

        if (changes.ma == '') {
            T.notify('Mã loại đơn vị bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên loại đơn vị bị trống!', 'danger');
            this.ten.focus();
        } else {
            if (maLDV) {
                this.props.updateDmLoaiDonVi(maLDV, changes);
            } else {
                this.props.createDmLoaiDonVi(changes);
            }
            $(this.modal).modal('hide');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Loại đơn vị' : 'Tạo mới loại đơn vị',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã đơn vị' readOnly={readOnly} placeholder='Mã đơn vị' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên loại đơn vị' readOnly={readOnly} placeholder='Tên loại đơn vị' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.active })} />
            </div>
        }

        );
    }
}

class DmLoaiDonViPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmLoaiDonViAll());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmLoaiDonVi(item.ma, { ma: item.ma, kichHoat: item.kichHoat == 1 ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục loại đơn vị', 'Bạn có chắc bạn muốn xóa loại đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteDmLoaiDonVi(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmLoaiDonVi:write'),
            permission = this.getUserPermission('dmLoaiDonVi', ['write', 'delete']);

        let items = this.props.dmLoaiDonVi && this.props.dmLoaiDonVi.items ? this.props.dmLoaiDonVi.items : [];

        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                    <th style={{ width: '100%' }}>Tên đơn vị</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.ma} style={{ textAlign: 'right' }} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Loại đơn vị</h1>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmLoaiDonVi={this.props.createDmLoaiDonVi} updateDmLoaiDonVi={this.props.updateDmLoaiDonVi} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmLoaiDonVi: state.dmLoaiDonVi });
const mapActionsToProps = { getDmLoaiDonViAll, createDmLoaiDonVi, updateDmLoaiDonVi, deleteDmLoaiDonVi };
export default connect(mapStateToProps, mapActionsToProps)(DmLoaiDonViPage);