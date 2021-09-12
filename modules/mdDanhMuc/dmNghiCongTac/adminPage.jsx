import React from 'react';
import { connect } from 'react-redux';
import { getDmNghiCongTacAll, createDmNghiCongTac, updateDmNghiCongTac, deleteDmNghiCongTac } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    modal = React.createRef();
    state = { kichHoat: false };

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: null, moTa: '', kichHoat: 1 };
        this.ma.value(ma);
        this.moTa.value(moTa);
        this.kichHoat.value(kichHoat);

        this.setState({kichHoat});

        $(this.modal).attr('data-ma', ma).modal('show');
    };

    onSubmit = () => {
        const maNghiCongTac = $(this.modal).attr('data-ma'),
            changes = {
                ma: this.ma.value().trim(),
                moTa: this.moTa.value().trim(),
                kichHoat: Number(this.kichHoat.value()),
            };
        if (changes.ma == '') {
            T.notify('Mã nghỉ công tác bị trống!', 'danger');
            this.ma.focus();
        } else if (changes.moTa == '') {
            T.notify('Mô tả nghỉ công tác bị trống!', 'danger');
            this.moTa.focus();
        } else {
            if (maNghiCongTac) {
                if (typeof this.state.ImportIndex == 'number') changes.ImportIndex = this.state.ImportIndex;
                this.props.update(maNghiCongTac, changes, () => {
                    T.notify('Cập nhật nghỉ công tác thành công!', 'success');
                    $(this.modal).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới nghỉ công tác thành công!', 'success');
                    $(this.modal).modal('hide');
                });
            }
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Cập nhật nghỉ công tác' : 'Tạo mới nghỉ công tác',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã nghỉ công tác' readOnly={readOnly} placeholder='Mã nghỉ công tác' required />
                <FormTextBox type='text' className='col-12' ref={e => this.moTa = e} label='Mô tả' readOnly={readOnly} placeholder='Mô tả' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
          
        );
    }
}

class dmNghiCongTacPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmNghiCongTacAll());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Nghỉ công tác', 'Bạn có chắc bạn muốn xóa nghỉ công tác này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmNghiCongTac(item.ma));
    };

    changeActive = item => this.props.updateDmNghiCongTac(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmNghiCongTac:write'),
            permission = this.getUserPermission('dmNghiCongTac', ['write', 'delete']);

        let items = this.props.dmNghiCongTac && this.props.dmNghiCongTac.items;

        const table = renderTable({
            getDataSource: () => items, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                    <th style={{ width: '100%' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='link' content={item.ma} style={{ textAlign: 'center' }} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.moTa} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Nghỉ công tác</h1>
                </div>
                <div className='tile'>{table}</div>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    create={this.props.createDmNghiCongTac} update={this.props.updateDmNghiCongTac} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmNghiCongTac: state.dmNghiCongTac });
const mapActionsToProps = { getDmNghiCongTacAll, createDmNghiCongTac, updateDmNghiCongTac, deleteDmNghiCongTac };
export default connect(mapStateToProps, mapActionsToProps)(dmNghiCongTacPage);
