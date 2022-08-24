import React from 'react';
import { connect } from 'react-redux';
import { getTccbKhungDanhGiaDonViAll, deleteTccbKhungDanhGiaDonVi, createTccbKhungDanhGiaDonVi, updateTccbKhungDanhGiaDonVi, updateTccbKhungDanhGiaDonViThuTu } from './reduxKhungDanhGiaDonVi';
import { AdminModal, FormTextBox, AdminPage } from 'view/component/AdminPage';
import { Tooltip } from '@mui/material';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() =>
            this.noiDung.focus()
        ));
    }

    onShow = (item) => {
        if (item) {
            if (item.updateItem) {
                let { noiDung } = item.updateItem;
                this.noiDung.value(noiDung);
                this.setState({ item: item.updateItem });
            } else {
                const thuTu = item.submenus.length != 0 ? Math.max(...item.submenus.map(item => item.thuTu)) : 0;
                this.setState({ parentId: item.parentId, thuTu });
            }
        } else this.setState({ item });
    };

    onSubmit = (e) => {
        const changes = {
            noiDung: this.noiDung.value(),
        };
        if (changes.noiDung == '') {
            T.notify('Nội dung bị trống', 'danger');
            this.noiDung.focus();
        } else {
            if (!this.state.item)
                this.props.create({
                    ...changes,
                    nam: this.props.nam,
                    parentId: this.state.parentId || null,
                    thuTu: this.state.thuTu ? this.state.thuTu + 1 : this.props.thuTu + 1
                });
            else this.props.update(this.state.item.id, changes);
            this.setState({ item: null });
            this.noiDung.value('');
            this.hide();
        }
        e.preventDefault();
    };

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: this.state.item ? 'Cập nhật' : 'Tạo mới',
            body: <div className='row'>
                <FormTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung'
                    readOnly={readOnly} required />
            </div>
        });
    }
}

class ComponentDGDV extends AdminPage {
    componentDidMount() {
        this.load(() => {
            $('.menuList').sortable({ update: () => this.updateMenuPriorities() });
            $('.menuList').disableSelection();
        });

    }

    load = (done) => this.props.nam && this.props.getTccbKhungDanhGiaDonViAll({ nam: Number(this.props.nam) }, items => {
        let parentItems = items.filter(item => !item.parentId);
        parentItems = parentItems.map(parent => ({ ...parent, submenus: items.filter(item => item.parentId == parent.id) }));
        this.setState({ items: parentItems });
        done && done();
    });

    create = (item) => this.props.createTccbKhungDanhGiaDonVi(item, this.load);

    update = (id, changes) => this.props.updateTccbKhungDanhGiaDonVi(id, changes, this.load);

    updateMenuPriorities = () => {
        const changes = [];
        for (let i = 0, thuTu = 0, list1 = $('#menuMain').children(); i < list1.length; i++) {
            let menu = list1.eq(i);
            changes.push({ id: menu.attr('data-id'), thuTu });
            thuTu++;

            let list2 = menu.children();
            if (list2.length > 1) {
                list2 = list2.eq(1).children();
                for (let j = 0; j < list2.length; j++) {
                    changes.push({ id: list2.eq(j).attr('data-id'), thuTu });
                    thuTu++;
                }
            }
        }
        this.props.updateTccbKhungDanhGiaDonViThuTu(changes, this.load);
    }

    showModal = (e) => {
        e.preventDefault();
        this.modal.show();
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa mục', 'Bạn có chắc bạn muốn xóa mục này?', true, isConfirm =>
            isConfirm && this.props.deleteTccbKhungDanhGiaDonVi(item.id, this.load));
    }

    renderMenu = (index, menu, level, hasCreate, hasUpdate, hasDelete) => (
        <li key={menu.id} data-id={menu.id}>
            <div style={{ display: 'inline-flex' }}>
                {level == 0 ? <b>{`${index + 1}. ${menu.noiDung}`}</b> : `${index + 1}. ${menu.noiDung}`}
                &nbsp;
                <div className='buttons btn-group btn-group-sm'>
                    {hasCreate && level == 0 &&
                        <Tooltip title='Tạo mục con' arrow>
                            <a className='btn btn-warning' href='#' onClick={() => this.modal.show({ parentId: menu.id, submenus: menu.submenus || [] })}>
                                <i className='fa fa-lg fa-plus' />
                            </a>
                        </Tooltip>
                    }
                    {hasUpdate && <Tooltip title='Chỉnh sửa' arrow>
                        <a className='btn btn-info' href='#' onClick={() => this.modal.show({ updateItem: menu })}>
                            <i className='fa fa-lg fa-edit' />
                        </a>
                    </Tooltip>}
                    {hasDelete && <Tooltip title='Xoá' arrow>
                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, menu)}>
                            <i className='fa fa-lg fa-trash' />
                        </a>
                    </Tooltip>}
                </div>
            </div>

            {menu.submenus ? (
                <ul className='menuList'>
                    {menu.submenus.map((subMenu, index) => this.renderMenu(index, subMenu, level + 1, hasCreate, hasUpdate, hasDelete))}
                </ul>
            ) : null}
        </li>);

    render() {
        const permission = this.getUserPermission('tccbKhungDanhGiaDonVi'),
            hasCreate = permission.write,
            hasUpdate = permission.write,
            hasDelete = permission.delete;

        const items = this.state?.items || [];
        const thuTu = items.length != 0 ? Math.max(...items.map(item => item.thuTu)) : 0;
        return (
            <div>
                {
                    items.length == 0 ? (<b>Không có dữ liệu đánh giá đơn vị</b>) :
                        <div>
                            <ul id='menuMain' className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                {items.map((item, index) => this.renderMenu(index, item, 0, hasCreate, hasUpdate, hasDelete))}
                            </ul>
                        </div>
                }
                {hasCreate && (<div style={{ textAlign: 'right' }}>
                    <button className='btn btn-info' type='button' onClick={() => this.modal.show(null)}>
                        <i className='fa fa-fw fa-lg fa-plus' />Thêm mục cha
                    </button>
                </div>)}
                <EditModal ref={e => this.modal = e}
                    create={this.create} update={this.update} readOnly={!permission.write}
                    nam={this.props.nam}
                    thuTu={thuTu}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getTccbKhungDanhGiaDonViAll, deleteTccbKhungDanhGiaDonVi, createTccbKhungDanhGiaDonVi, updateTccbKhungDanhGiaDonVi, updateTccbKhungDanhGiaDonViThuTu };
export default connect(mapStateToProps, mapActionsToProps)(ComponentDGDV);