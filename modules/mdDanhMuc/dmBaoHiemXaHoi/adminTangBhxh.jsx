import React from 'react';
import { connect } from 'react-redux';
import { getDmTangBhxhAll, deleteDmTangBhxh, createDmTangBhxh, updateDmTangBhxh } from './reduxTangBhxh';
import { Link } from 'react-router-dom';
import AdminSearchBox from 'view/component/AdminSearchBox';
import { OverlayLoading } from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { kichHoat: true};
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal).on('shown.bs.modal', () => $('#dmTangBhxhMa').focus());
        }, 250));
    }

    onShow = (item) => {
        let { ma, moTa, kichHoat } = item ? item : { ma: '', moTa: '', kichHoat: true };
        $('#dmTangBhxhMa').val(ma);
        $('#dmTangBhxhMoTa').val(moTa);
        this.setState({kichHoat });
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
            T.notify('Mã danh mục bị trống');
            $('#dmTangBhxhMa').focus();
        } 
        else {
            if (ma) {
                this.props.updateDmTangBhxh(ma, changes);
            } else {
                this.props.createDmTangBhxh(changes);
            }
            $(this.modal).modal('hide');
        }
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin danh mục Tăng Bảo hiểm xã hội',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.ma = e} label='Mã' readOnly={readOnly} placeholder='Mã danh mục' required />
                <FormTextBox type='text' className='col-md-12' ref={e => this.moTa = e} label='Mô tả' placeholder='Mô tả' readOnly={readOnly} required />
                <FormCheckbox className='col-md-6' ref={e => this.kichHoat = e} label='Kích hoạt' isSwitch={true} readOnly={readOnly} style={{ display: 'inline-flex', margin: 0 }} 
                    onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
            </div>
        })
    }
}

class DmTangBhxhPage extends AdminPage {
    state = { searching: false };
    modal = React.createRef();
    searchBox = React.createRef();

    componentDidMount() {
        T.ready('/user/category', () => this.props.getDmTangBhxhAll());
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    }

    changeActive = item => {
        this.props.updateDmTangBhxh(item.ma, { kichHoat: Number(!item.kichHoat) })
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa thông tin này?', true, isConfirm =>
            isConfirm && this.props.deleteDmTangBhxh(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmTangBhxh:write'),
            permission = this.getUserPermission('dmTangBhxh', ['write', 'delete']);
        let items = this.props.dmTangBhxh && this.props.dmTangBhxh.items ? this.props.dmTangBhxh.items : [];
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
        });

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Tăng Bảo hiểm xã hội</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDmTangBhxhAll} setSearching={value => this.setState({ searching: value })} />
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                    <EditModal ref={this.modal} readOnly={!permissionWrite}
                        createDmTangBhxh={this.props.createDmTangBhxh} updateDmTangBhxh={this.props.updateDmTangBhxh} />
                    {permissionWrite && (
                        <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                            <i className='fa fa-lg fa-reply' />
                        </Link>)}
                    {permissionWrite && (
                        <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                            <i className='fa fa-lg fa-plus' />
                        </button>)}
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmTangBhxh: state.dmTangBhxh });
const mapActionsToProps = { getDmTangBhxhAll, deleteDmTangBhxh, createDmTangBhxh, updateDmTangBhxh };
export default connect(mapStateToProps, mapActionsToProps)(DmTangBhxhPage);