import React from 'react';
import { connect } from 'react-redux';
import { getDmHoSoCcvcNldAll, deleteDmHoSoCcvcNld, createDmHoSoCcvcNld, updateDmHoSoCcvcNld } from './redux';
import { Link } from 'react-router-dom';

class EditModal extends React.Component {
    state = { kichHoat: true, loaiQuyetDinh: true };
    modal = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dmHoSoCcvcNldTen').focus());
        }, 250));
    }

    show = (item, maCha) => {
        let { ma, ten, kichHoat, loaiQuyetDinh } = item ? item : { ma: null, ten: '', kichHoat: true, loaiQuyetDinh: true };
        $('#dmHoSoCcvcNldTen').val(ten);
        this.setState({ kichHoat, loaiQuyetDinh });

        if (maCha == null) maCha = -1;
        $(this.modal.current).attr('data-ma', ma).attr('data-ma-cha', maCha).modal('show');
    };

    save = (e) => {
        e.preventDefault();
        const ma = $(this.modal.current).attr('data-ma'),
            maCha = $(this.modal.current).attr('data-ma-cha'),
            changes = {
                ten: $('#dmHoSoCcvcNldTen').val().trim(),
                kichHoat: this.state.kichHoat ? 1 : 0,
                loaiQuyetDinh: this.state.loaiQuyetDinh ? 1 : 0,
            };
        if (maCha != -1) changes.maCha = maCha;
        if (changes.ten == '') {
            T.notify('Tên danh mục bị trống');
            $('#dmHoSoCcvcNldTen').focus();
        } else {
            if (ma) {
                this.props.updateDmHoSoCcvcNld(ma, changes);
            } else {
                this.props.createDmHoSoCcvcNld(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin danh mục Hồ sơ công chức viên chức - Người lao động</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dmHoSoCcvcNldTen'>Tên</label>
                                <input className='form-control' id='dmHoSoCcvcNldTen' type='text' placeholder='Tên' readOnly={readOnly} />
                            </div>
                            <div className='row'>
                                <div className='form-group col-6' style={{ display: 'inline-flex' }}>
                                    <label htmlFor='dmHoSoCcvcNldLoaiQuyetDinh'>Loại quyết định: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='dmHoSoCcvcNldLoaiQuyetDinh' checked={this.state.loaiQuyetDinh} onChange={() => !readOnly && this.setState({ loaiQuyetDinh: !this.state.loaiQuyetDinh })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='form-group col-6' style={{ display: 'inline-flex' }}>
                                    <label htmlFor='dmHoSoCcvcNldActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                        <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='dmHoSoCcvcNldActive' checked={this.state.kichHoat} onChange={() => !readOnly && this.setState({ kichHoat: !this.state.kichHoat })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
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

class DmHoSoCcvcNldPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/category');
        this.props.getDmHoSoCcvcNldAll();
    }

    edit = (e, item, maCha) => {
        e.preventDefault();
        this.modal.current.show(item, maCha);
    }

    changeKichHoat = (e, item) => {
        e.preventDefault();
        this.props.updateDmHoSoCcvcNld(item.ma, { kichHoat: item.kichHoat ? 0 : 1 })
    };

    changeQuyetDinh = (e, item) => {
        e.preventDefault();
        this.props.updateDmHoSoCcvcNld(item.ma, { loaiQuyetDinh: item.loaiQuyetDinh ? 0 : 1 })
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa thông tin', 'Bạn có chắc bạn muốn xóa thông tin này?', true, isConfirm =>
            isConfirm && this.props.deleteDmHoSoCcvcNld(item.ma));
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('dmHoSoCcvcNld:write'),
            permissionDelete = currentPermissions.includes('dmHoSoCcvcNld:delete');
        const list = this.props.dmHoSoCcvcNld && this.props.dmHoSoCcvcNld.items ? this.props.dmHoSoCcvcNld.items : [];
        let rowsList = 'Không có danh sách!';
        if (list && list.length > 0) {
            const mapper = {}, tree = {};
            list.forEach(item => mapper[item.ma] = item);
            Object.keys(mapper).sort((a, b) => a > b).forEach(ma => {
                const item = mapper[ma];
                if (item.maCha == null) {
                    tree[item.ma] = { value: item, items: [] };
                } else if (tree[item.maCha]) {
                    tree[item.maCha].items.push(item);
                }
            });
            rowsList = Object.keys(tree).map(key => {
                let { value: treeItemValue, items: treeItemChildren } = tree[key];
                if (treeItemChildren && treeItemChildren.length) {
                    treeItemChildren.sort((a, b) => a.ten > b.ten ? 1 : -1);
                } else {
                    treeItemChildren = [];
                }

                return {
                    name: treeItemValue.ten,
                    content: (
                        <li key={key}>
                            <div style={{ display: 'inline-flex' }}>
                                <a className={'text-primary' + (treeItemValue.kichHoat ? '' : ' font-italic')} style={{ textDecoration: treeItemValue.kichHoat ? 'none' : 'line-through' }} href='#' onClick={e => this.edit(e, treeItemValue)}>
                                    {treeItemValue.ten}{treeItemValue.loaiQuyetDinh ? ' (QĐ)' : ''}
                                </a>
                                <div className='buttons btn-group btn-group-sm'>
                                    {permissionWrite && treeItemValue.maCha == null &&
                                        <a className='btn btn-info' href='#' data-toggle='tooltip' title='Tạo hồ sơ' onClick={e => this.edit(e, null, treeItemValue.ma)}>
                                            <i className='fa fa-lg fa-plus' />
                                        </a>}
                                    <a className='btn btn-primary' href='#' data-toggle='tooltip' title='Chỉnh sửa' onClick={e => this.edit(e, treeItemValue)}>
                                        <i className='fa fa-lg fa-edit' />
                                    </a>
                                    <a href='#' className={treeItemValue.loaiQuyetDinh ? 'btn btn-success' : 'btn btn-secondary'} data-toggle='tooltip' title='Loại quyết định' onClick={e => permissionWrite && this.changeQuyetDinh(e, treeItemValue)}>
                                        <i className={'fa fa-lg ' + (treeItemValue.loaiQuyetDinh ? 'fa-check' : 'fa-times')} />
                                    </a>
                                    <a href='#' className={treeItemValue.kichHoat ? 'btn btn-warning' : 'btn btn-secondary'} data-toggle='tooltip' title='Kích hoạt' onClick={e => permissionWrite && this.changeKichHoat(e, treeItemValue)}>
                                        <i className={'fa fa-lg ' + (treeItemValue.kichHoat ? 'fa-check' : 'fa-times')} />
                                    </a>
                                    {permissionDelete &&
                                        <a className='btn btn-danger' href='#' data-toggle='tooltip' title='Xóa' onClick={e => this.delete(e, treeItemValue)}>
                                            <i className='fa fa-lg fa-trash-o' />
                                        </a>}
                                </div>
                            </div>
                            <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                {treeItemChildren.map(childItem => (
                                    <li key={childItem.ma}>
                                        <div style={{ display: 'inline-flex' }}>
                                            <a className={'text-dark' + (treeItemValue.kichHoat && childItem.kichHoat ? '' : ' font-italic')} style={{ textDecoration: treeItemValue.kichHoat && childItem.kichHoat ? 'none' : 'line-through' }} href='#' onClick={e => this.edit(e, childItem)}>
                                                {childItem.ten}{childItem.loaiQuyetDinh ? ' (QĐ)' : ''}
                                            </a>
                                            <div className='buttons btn-group btn-group-sm'>
                                                <a className='btn btn-primary' href='#' data-toggle='tooltip' title='Chỉnh sửa' onClick={e => this.edit(e, childItem)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a>
                                                <a href='#' className={childItem.loaiQuyetDinh ? 'btn btn-success' : 'btn btn-secondary'} data-toggle='tooltip' title='Loại quyết định' onClick={e => permissionWrite && this.changeQuyetDinh(e, childItem)}>
                                                    <i className={'fa fa-lg ' + (childItem.loaiQuyetDinh ? 'fa-check' : 'fa-times')} />
                                                </a>
                                                <a href='#' className={childItem.kichHoat ? 'btn btn-warning' : 'btn btn-secondary'} data-toggle='tooltip' title='Kích hoạt' onClick={e => permissionWrite && this.changeKichHoat(e, childItem)}>
                                                    <i className={'fa fa-lg ' + (childItem.kichHoat ? 'fa-check' : 'fa-times')} />
                                                </a>
                                                {permissionDelete &&
                                                    <a className='btn btn-danger' href='#' data-toggle='tooltip' title='Xóa' onClick={e => this.delete(e, childItem)}>
                                                        <i className='fa fa-lg fa-trash-o' />
                                                    </a>}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </li>)
                };
            });

            rowsList.sort((a, b) => a.name > b.name ? 1 : -1);
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-list-alt' /> Hồ sơ công chức viên chức - Người lao động</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/category'>Danh mục</Link>
                        &nbsp;/&nbsp;Hồ sơ công chức viên chức - Người lao động
                    </ul>
                </div>
                <div className='tile'>
                    <ul className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                        {typeof rowsList == 'string' ? rowsList : rowsList.map(item => item.content)}
                    </ul>
                </div>
                <EditModal ref={this.modal} readOnly={!permissionWrite} dmHoSoCcvcNld={this.props.dmHoSoCcvcNld}
                    createDmHoSoCcvcNld={this.props.createDmHoSoCcvcNld} updateDmHoSoCcvcNld={this.props.updateDmHoSoCcvcNld} />
                {permissionWrite &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} data-toggle='tooltip' title='Tạo' onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <Link to='/user/category' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dmHoSoCcvcNld: state.dmHoSoCcvcNld });
const mapActionsToProps = { getDmHoSoCcvcNldAll, deleteDmHoSoCcvcNld, createDmHoSoCcvcNld, updateDmHoSoCcvcNld };
export default connect(mapStateToProps, mapActionsToProps)(DmHoSoCcvcNldPage);