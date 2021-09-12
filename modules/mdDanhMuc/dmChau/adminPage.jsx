import React from 'react';
import { connect } from 'react-redux';
import { getDmChauAll, createDmChau, updateDmChau, deleteDmChau } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class EditModal extends React.Component {
    modal = React.createRef();
    state = { active: false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmChauMa').focus());
        });
    }

    show = (item) => {
        let { ma, ten, territory, kichHoat } = item ? item : { ma: null, ten: '', territory: '', kichHoat: 1 };
        $('#dmChauMa').val(ma);
        $('#dmChauTen').val(ten);
        $('#dmChauTerritory').val(territory);
        $(this.modal.current).find('.modal-title').html(item ? 'Cập nhật châu' : 'Tạo mới châu');
        this.setState({ active: kichHoat == 1 });

        $(this.modal.current).attr('data-ma', ma).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const maChau = $(this.modal.current).attr('data-ma'),
            changes = {
                ma: $('#dmChauMa').val().trim(),
                ten: $('#dmChauTen').val().trim(),
                territory: $('#dmChauTerritory').val().trim(),
                kichHoat: this.state.active ? 1 : 0,
            };
        if (changes.ma == '') {
            T.notify('Mã châu bị trống!', 'danger');
            $('#dmChauMa').focus();
        } else if (changes.ten == '') {
            T.notify('Tên châu bị trống!', 'danger');
            $('#dmChauTen').focus();
        } else if (changes.territory == '') {
            T.notify('Territory bị trống!', 'danger');
            $('#dmChauTerritory').focus();
        } else {
            if (maChau) {
                this.props.update(maChau, changes, () => {
                    T.notify('Cập nhật châu thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else {
                this.props.create(changes, () => {
                    T.notify('Tạo mới châu thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            }
        }
    };

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmChauMa'>Mã châu</label>
                                <input className='form-control' id='dmChauMa' placeholder='Mã châu' type='text' auto-focus='' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmChauTen'>Tên châu</label>
                                <input className='form-control' id='dmChauTen' placeholder='Tên châu' type='text' readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dmChauTerritory'>Territory</label>
                                <input className='form-control' id='dmChauTerritory' placeholder='Territory' type='text' readOnly={readOnly} />
                            </div>
                            <div style={{ display: 'inline-flex', width: '100%', margin: 0 }}>
                                <label htmlFor='dmChauKichHoat'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='dmChauKichHoat' checked={this.state.active} onChange={() => !readOnly && this.setState({ active: !this.state.active })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly && <button type='submit' className='btn btn-primary'>Lưu</button>}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DmChauPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDmChauAll();
        T.ready('/user/category');
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.current.show(item);
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Châu', 'Bạn có chắc bạn muốn xóa châu này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteDmChau(item.ma));
    };

    changeActive = item => this.props.updateDmChau(item.ma, { kichHoat: item.kichHoat == 1 ? 0 : 1 });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmChau:write'),
            permissionDelete = currentPermissions.includes('dmChau:delete'),
            permission = this.getUserPermission('dmChau', ['write', 'delete']);

        let table = 'Không có dữ liệu!',
            items = this.props.dmChau && this.props.dmChau.items;
        if (items && items.length > 0) {
            table = renderTable({
                getDataSource: () => items, stickyHead: false,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto' }} nowrap='true'>Mã</th>
                        <th style={{ width: '100%' }} nowrap='true'>Tên</th>
                        <th style={{ width: '100%' }} nowrap='true'>Territory</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>
                ),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='text' content={item.ma ? item.ma : ''} />
                        <TableCell type="link" content={item.ten ? item.ten : ''} onClick={e => this.edit(e, item)} />
                        <TableCell type='text' content={item.territory ? item.territory : ''} />
                        <TableCell type='checkbox' content={item.kichHoat} permission={permissionWrite}
                            onChange={() => permissionWrite && this.changeActive(item)} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={e => this.edit(e, item)}
                            onDelete={e => permissionDelete && this.delete(e, item)} />
                    </tr>
                )
            });
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Danh mục Châu</h1>
                    {/* <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Châu
                    </ul> */}
                </div>
                <div className='tile'>{table}</div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} create={this.props.createDmChau} update={this.props.updateDmChau} />
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ zIndex: 100, position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmChau: state.dmChau });
const mapActionsToProps = { getDmChauAll, createDmChau, updateDmChau, deleteDmChau };
export default connect(mapStateToProps, mapActionsToProps)(DmChauPage);