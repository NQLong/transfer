import React from 'react';
import { connect } from 'react-redux';
import { getDmTrinhDoAll, createDmTrinhDo, updateDmTrinhDo, deleteDmTrinhDo } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: true }

    onShow = (item) => {
        let { ma, tenTiengAnh, vietTat, vietTatTiengAnh, kichHoat } = item ? item : { ma: null, tenTiengAnh: '', vietTat: '', vietTatTiengAnh: '', kichHoat: 1 };

        this.ma.value(ma);
        this.ten.value(tenTiengAnh);
        this.vietTat.value(vietTat);
        this.vietTatTiengAnh.value(vietTatTiengAnh);
        this.kichHoat.value(kichHoat);
        this.setState({ kichHoat });

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const maTrinhDo = $(this.modal).attr('data-ma'),
            changes = {
                ma: this.ma.value().trim(),
                ten: this.ten.value().trim(),
                tenTiengAnh: this.ten.value().trim(),
                vietTat: this.vietTat.value().trim(),
                vietTatTiengAnh: this.vietTatTiengAnh.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.ma == '') {
            T.notify('Mã trình độ bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.ten == '') {
            T.notify('Tên trình độ bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.tenTiengAnh == '') {
            T.notify('Tên trình độ tiếng Anh bị trống!', 'danger');
            this.tenTiengAnh.focus();
        } else {
            if (maTrinhDo) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
                this.props.update(maTrinhDo, changes, () => {
                    T.notify('Cập nhật trình độ thành công!', 'success');
                    $(this.modal).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới trình độ thành công!', 'success');
                    $(this.modal).modal('hide');
                });
            }
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Tạo mới trình độ' : 'Cập nhật trình độ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã trình độ' readOnly={readOnly} placeholder='Mã trình độ' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên trình độ' readOnly={readOnly} placeholder='Tên trình độ' required />
                <FormTextBox type='text' className='col-12' ref={e => this.tenTiengAnh = e} label='Tên trình độ tiếng Anh' readOnly={readOnly} placeholder='Tên trình độ tiếng Anh' required />
                <FormTextBox type='text' className='col-12' ref={e => this.vietTat = e} label='Tên viết tắt' readOnly={readOnly} placeholder='Tên viết tắt' />
                <FormTextBox type='text' className='col-12' ref={e => this.vietTatTiengAnh = e} label='Tên viết tắt tiếng Anh' readOnly={readOnly} placeholder='Tên viết tắt Tiếng Anh' />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class dmTrinhDoAdminPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmTrinhDoAll());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Trình độ', 'Bạn có chắc bạn muốn xóa trình độ này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTrinhDo(item.ma));
    };

    changeActive = item => this.props.updateDmTrinhDo(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTrinhDo:write'),
            permission = this.getUserPermission('dmTrinhDo', ['write', 'delete']);
        let items = this.props.dmTrinhDo && this.props.dmTrinhDo.items ? this.props.dmTrinhDo.items : [];

        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên tiếng Anh</th>
                    <th style={{ width: '100%' }} nowrap='true'>Viết tắt</th>
                    <th style={{ width: '100%' }} nowrap='true'>Viết tắt tiếng Anh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item.ma} style={{ textAlign: 'center' }} />
                    <TableCell type='link' content={item.ten} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.tenTiengAnh} />
                    <TableCell type='text' content={item.vietTat} />
                    <TableCell type='text' content={item.vietTatTiengAnh} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Trình độ</h1>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    create={this.props.createDmTrinhDo} update={this.props.updateDmTrinhDo} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmTrinhDo: state.dmTrinhDo });
const mapActionsToProps = { getDmTrinhDoAll, createDmTrinhDo, updateDmTrinhDo, deleteDmTrinhDo };
export default connect(mapStateToProps, mapActionsToProps)(dmTrinhDoAdminPage);