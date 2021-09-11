import React from 'react';
import { connect } from 'react-redux';
import { getDmSoHuuTriTueAll, deleteDmSoHuuTriTue, createDmSoHuuTriTue, updateDmSoHuuTriTue } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormCheckbox, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = {kichHoat: true};
    modal = React.createRef();

    onShow = (item) => {
        let { ma, ten, ghiChu, kichHoat } = item ? item : { ma: '', ten: '', ghiChu: '', kichHoat: true };

        this.ma.value(ma);
        this.ten.value(ten);
        this.ghiChu.value(ghiChu);
        this.kichHoat.value(kichHoat);
        this.setState({ kichHoat });

        $(this.modal).attr('data-id', ma).modal('show');
    };

    onSubmit = () => {
        const ma = $(this.modal).attr('data-id'),
            changes = {
                ma: this.ma.value(),
                ten: this.ten.value(),
                ghiChu: this.ghiChu.value(),
                kichHoat: Number(this.kichHoat.value())
            };
        if (changes.ten == '') {
            T.notify('Tên bị trống!', 'danger');
            this.ten.focus();
        } else if (changes.ma == '') {
            T.notify('Mã bị trống!', 'danger');
            this.ma.focus();
        } else {
            if (ma) {
                this.props.update(ma, changes);
            } else this.props.create(changes);
            $(this.modal).modal('hide');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.ma ? 'Tạo mới sở hữu trí tuệ' : 'Cập nhật sở hữu trí tuệ',
            size: 'large',
            body: <div className='row'>
                <FormTextBox type='text' className='col-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} placeholder='Mã' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ten = e} label='Tên' readOnly={readOnly} placeholder='Tên' required />
                <FormTextBox type='text' className='col-12' ref={e => this.ghiChu = e} label='Ghi chú' readOnly={readOnly} placeholder='Ghi chú' required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        }
        );
    }
}

class DmSoHuuTriTuePage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmSoHuuTriTueAll());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmSoHuuTriTue(item.ma, { kichHoat: Number(!item.kichHoat) })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa sở hữu trí tuệ', 'Bạn có chắc bạn muốn xóa danh mục này?', true, isConfirm =>
            isConfirm && this.props.deleteDmSoHuuTriTue(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmSoHuuTriTue:write'),
            permission = this.getUserPermission('dmSoHuuTriTue', ['write', 'delete']);

        let items = this.props.dmSoHuuTriTue && this.props.dmSoHuuTriTue.items ? this.props.dmSoHuuTriTue.items : [];

        items.sort((a, b) => a.ma < b.ma ? -1 : 1);
        const table = renderTable({
            getDataSource: () => list, stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                    <th style={{ width: '40%' }} nowrap='true'>Tên</th>
                    <th style={{ width: '60%' }} nowrap='true'>Ghi chú</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} style={{ textAlign: 'right' }} />
                    <TableCell type='link' content={item.ma} onClick={(e) => this.edit(e, item)} />
                    <TableCell type='text' content={item.ten} />
                    <TableCell type='text' content={item.ghiChu} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });


        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Sở hữu trí tuệ</h1>
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmSoHuuTriTue={this.props.dmSoHuuTriTue}
                    create={this.props.createDmSoHuuTriTue} update={this.props.updateDmSoHuuTriTue} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' data-toggle='tooltip' title='Tạo' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmSoHuuTriTue: state.dmSoHuuTriTue });
const mapActionsToProps = { getDmSoHuuTriTueAll, deleteDmSoHuuTriTue, createDmSoHuuTriTue, updateDmSoHuuTriTue };
export default connect(mapStateToProps, mapActionsToProps)(DmSoHuuTriTuePage);