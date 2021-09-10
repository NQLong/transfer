import React from 'react';
import { connect } from 'react-redux';
import { createDmDoiTuongCanBo, getDmDoiTuongCanBoAll, updateDmDoiTuongCanBo, deleteDmDoiTuongCanBo } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormRichTextBox, FormCheckbox } from 'view/component/AdminPage';
import AdminSearchBox from 'view/component/AdminSearchBox';

class EditModal extends AdminModal {
    state = { kichHoat: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal).on('shown.bs.modal', () => $('#dmDoiTuongCanBoMa').focus());
        }, 250));
    }

    onShow = (item) => {
        let { ma, ten, kichHoat, ghiChu } = item ? item : { ma: null, ten: '', kichHoat: 1, ghiChu: '' };
        $('#dmDoiTuongCanBoMa').val(ma);
        $('#dmDoiTuongCanBoTen').val(ten);
        $('#dmDoiTuongCanBoGhiChu').val(ghiChu);

        this.setState({ kichHoat });
        this.ma.value(ma);
        this.ten.value(ten);
        this.kichHoat.value(kichHoat);
        this.ghiChu.value(ghiChu);

        $(this.modal).attr('data-id', ma).modal('show');
    }

    hide = () => $(this.modal).modal('hide');

    onSubmit = () => {
        const ma = $(this.modal).attr('data-id'),
            changes = {
                ten: this.ten.value(),
                ma: this.ma.value(),
                ghiChu: this.ghiChu.value(),
                kichHoat: Number(this.state.kichHoat)
            };

        if (changes.ten == '') {
            T.notify('Tên đối tượng cán bộ bị trống!', 'danger');
            $('#dmDoiTuongCanBoTen').focus();
        } else {
            if (ma) {
                this.props.updateDmDoiTuongCanBo(ma, changes);
            } else {
                this.props.createDmDoiTuongCanBo(changes);
            }
            $(this.modal).modal('hide');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Đối tượng cán bộ',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã Đối tượng cán bộ' readOnly={readOnly} placeholder='Mã Đối tượng cán bộ' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.ten = e} label='Tên Đối tượng cán bộ' readOnly={readOnly} placeholder='Tên Đối tượng cán bộ' required />
                <FormRichTextBox className='col-md-12' ref={e => this.ghiChu = e} style={{ minHeight: 40 }} label='Ghi chú' placeholder='Ghi chú' readOnly={readOnly} />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }}
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        });
    }
}

class dmDoiTuongCanBoAdminPage extends AdminPage {
    state = { searching: false };
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmDoiTuongCanBoAll());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => this.props.updateDmDoiTuongCanBo(item.ma, { ma: item.ma, kichHoat: item.kichHoat == '1' ? '0' : '1' });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa danh mục đối tượng cán bộ', 'Bạn có chắc bạn muốn xóa đối tượng cán bộ này?', true, isConfirm =>
            isConfirm && this.props.deleteDmDoiTuongCanBo(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmDoiTuongCanBo:write'),
            permissionDelete = currentPermissions.includes('dmDoiTuongCanBo:delete'),
            permission = this.getUserPermission('dmDoiTuongCanBo', ['write', 'delete']);
        let table = 'Không có danh sách đối tượng cán bộ!',
            items = this.props.dmDoiTuongCanBo && this.props.dmDoiTuongCanBo.items ? this.props.dmDoiTuongCanBo.items : [];
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                        <th style={{ width: 'auto' }}>Tên</th>
                        <th style={{ width: '100%' }}>Ghi chú</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type="text" content={item.ma} style={{ textAlign: 'right' }} />
                        <TableCell type='link' content={item.ten} onClick={e => this.edit(e, item)} />
                        <TableCell type='text' content={item.ghiChu} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite} onChanged={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}></TableCell>
                    </tr>
                )
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Đối tượng cán bộ</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmDanTocPage} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite}
                    createDmDoiTuongCanBo={this.props.createDmDoiTuongCanBo} updateDmDoiTuongCanBo={this.props.updateDmDoiTuongCanBo} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmDoiTuongCanBo: state.dmDoiTuongCanBo });
const mapActionsToProps = { getDmDoiTuongCanBoAll, createDmDoiTuongCanBo, updateDmDoiTuongCanBo, deleteDmDoiTuongCanBo };
export default connect(mapStateToProps, mapActionsToProps)(dmDoiTuongCanBoAdminPage);