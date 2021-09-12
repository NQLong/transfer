import React from 'react';
import { connect } from 'react-redux';
import { getDmTinhTrangCongTacAll, createDmTinhTrangCongTac, updateDmTinhTrangCongTac, deleteDmTinhTrangCongTac } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: true }

    onShow = (item) => {
        let { ma, ten, kichHoat } = item ? item : { ma: null, ten: '', kichHoat: 1 };

        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.setState({ kichHoat});

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const ma = $(this.modal).attr('data-ma'),
            changes = {
                ten: this.ten.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };
         if (changes.ten == '') {
            T.notify('Tên tình trạng công tác bị trống!', 'danger');
            this.ten.focus();
        } else {
            if (ma) {
                this.props.update(ma, changes);
            } else {
                this.props.create(changes);
            }
            $(this.modal).modal('hide');

        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Tạo mới tình trạng công tác' : 'Cập nhật tình trạng công tác',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên tình trạng công tác' readOnly={readOnly} placeholder='Tên tình trạng công tác' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class dmTinhTrangCongTacPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmTinhTrangCongTacAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Tình trạng công tác', 'Bạn có chắc bạn muốn xóa tình trạng công tác này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmTinhTrangCongTac(item.ma));
    };

    changeActive = item => this.props.updateDmTinhTrangCongTac(item.ma, { kichHoat: Number(!item.kichHoat) });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTinhTrangCongTac:write'),
            permission = this.getUserPermission('dmTinhTrangCongTac', ['write', 'delete']);

        let items = this.props.dmTinhTrangCongTac && this.props.dmTinhTrangCongTac.items;

        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên tình trạng công tác</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                    <TableCell type='link' content={item.ten} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Tình trạng công tác</h1>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmTinhTrangCongTac} update={this.props.updateDmTinhTrangCongTac} />
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

const mapStateToProps = state => ({ system: state.system, dmTinhTrangCongTac: state.dmTinhTrangCongTac });
const mapActionsToProps = { getDmTinhTrangCongTacAll, createDmTinhTrangCongTac, updateDmTinhTrangCongTac, deleteDmTinhTrangCongTac };
export default connect(mapStateToProps, mapActionsToProps)(dmTinhTrangCongTacPage);