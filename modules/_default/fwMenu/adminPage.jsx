import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAll, createMenu, updateMenuPriorities, updateMenu, deleteMenu, buildMenu } from './redux';
import { getAllSubMenu, createSubMenu, updateSubMenu, deleteSubMenu, swapSubMenu } from './reduxSubMenu';
import { getHeader, updateHeader } from './reduxHeader';
import ImageBox from 'view/component/ImageBox';

class EditModal extends React.Component {
    modal = React.createRef();
    state = {
        active: false,
        highlight: false
    };

    show = menu => {
        let { title, link, active, highlight, id } = menu || { title: '{ "vi": "", "en": "" }', link: '', active: false, highlight: false, id: '' };

        $('#submenuViTitle').val(JSON.parse(title).vi);
        $('#submenuEnTitle').val(JSON.parse(title).en);
        $('#submenuLink').val(link);
        this.setState({ active: !!active, highlight: !!highlight });

        $(this.modal.current).find('.modal-title').html(menu ? 'Cập nhật menu phụ' : 'Tạo mới menu phụ');
        $(this.modal.current).data('data-id', id).modal('show');
    }

    save = e => {
        e.preventDefault();
        const id = $(this.modal.current).data('data-id'),
            changes = {
                title: JSON.stringify({ vi: $('#submenuViTitle').val(), en: $('#submenuEnTitle').val() }),
                link: $('#submenuLink').val().trim(),
                active: this.state.active ? 1 : 0,
                highlight: this.state.highlight ? 1 : 0
            };

        if (id) {
            this.props.update(id, changes);
        } else {
            this.props.create(changes);
        }

        $(this.modal.current).modal('hide');
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'></h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='form-group col-12'>
                                <label htmlFor='submenuViTitle'>Tiêu đề (VI)</label>
                                <input type='text' className='form-control' id='submenuViTitle' placeholder='Tiêu đề (VI)' />
                            </div>
                            <div className='form-group col-12'>
                                <label htmlFor='submenuEnTitle'>Tiêu đề (EN)</label>
                                <input type='text' className='form-control' id='submenuEnTitle' placeholder='Tiêu đề (EN)' />
                            </div>
                            <div className='form-group col-12'>
                                <label htmlFor='submenuLink'>Link</label>
                                <input type='text' className='form-control' id='submenuLink' placeholder='Link' />
                            </div>
                            <div className='form-group col-12 row'>
                                <div className='col-6 d-flex'>
                                    <label className='control-label'>Kích hoạt: &nbsp;</label>
                                    <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='submenuActive' checked={this.state.active} onChange={e => this.props.hasCreate && this.setState({ active: e.target.checked })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='col-6 d-flex'>
                                    <label className='control-label'>Nổi bật: &nbsp;</label>
                                    <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='highlight' checked={this.state.highlight} onChange={e => this.props.hasCreate && this.setState({ highlight: e.target.checked })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-success' onClick={e => this.save(e)}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class MenuPage extends React.Component {
    modal = React.createRef();
    imageBox = React.createRef();
    state = { isShowHeaderTitle: false };
    componentDidMount() {
        this.props.getAll();
        this.getAllSubMenu();
        this.props.getHeader(data => {
            $('#headerViTitle').val(data.headerTitle ? JSON.parse(data.headerTitle).vi : '');
            $('#headerEnTitle').val(data.headerTitle ? JSON.parse(data.headerTitle).en : '');
            $('#headerLink').val(data.headerLink || 'a');
            this.setState({ isShowHeaderTitle: data.isShowHeaderTitle == '1' ? true : false });
        });
        T.ready(('/user/menu'), () => {
            $('.menuList').sortable({ update: () => this.updateMenuPriorities() });
            $('.menuList').disableSelection();
            $('.menuSub').sortable({
                start: (e, ui) => {
                    $(this).attr('data-prevIndex', ui.item.index());
                },
                update: (e, ui) => {
                    this.updateSubMenuPriorities(ui.item.index(), $(this).attr('data-prevIndex'));
                }
            });
            $('.menuSub').disableSelection();
        });
    }
    getAllSubMenu = () => {
        this.props.getAllSubMenu(data => {
            let maxPrioritySubmenu = 0;
            data.forEach(element => {
                if (element.priority > maxPrioritySubmenu) maxPrioritySubmenu = element.priority;
            });
            this.setState({ maxPrioritySubmenu });
        });
    }

    create = (e) => {
        this.props.createMenu(null, data => this.props.history.push('/user/menu/edit/' + data.item.id));
        e.preventDefault();
    }

    createChild = (e, item) => {
        this.props.createMenu(item.id, data => this.props.history.push('/user/menu/edit/' + data.item.id));
        e.preventDefault();
    }
    createSubMenu = (item) => {
        if (!item.title) return T.notify('Vui lòng điền đầy đủ thông tin!', 'danger');
        item.priority = this.state.maxPrioritySubmenu + 1;
        this.props.createSubMenu(item, () => this.getAllSubMenu());
    }

    updateSubMenuPriorities = (now, pre) => {
        this.props.swapSubMenu(this.props.submenu[pre].id, this.props.submenu[now].priority);
    }
    updateMenuPriorities = () => {
        const changes = [];
        for (let i = 0, priority = 0, list1 = $('#menuMain').children(); i < list1.length; i++) {
            let menu = list1.eq(i);
            priority++;
            changes.push({ id: menu.attr('data-id'), priority });

            let list2 = menu.children();
            if (list2.length > 1) {
                list2 = list2.eq(1).children();
                for (let j = 0; j < list2.length; j++) {
                    priority++;
                    changes.push({ id: list2.eq(j).attr('data-id'), priority });
                }
            }
        }
        this.props.updateMenuPriorities(changes);
    }

    changeActive = (e, item) => {
        e.preventDefault();
        this.props.updateMenu(item.id, { active: item.active ? 0 : 1 });
    }

    delete = (e, item) => {
        T.confirm('Xóa menu', 'Bạn có chắc bạn muốn xóa menu này?', true, isConfirm => isConfirm && this.props.deleteMenu(item.id));
        e.preventDefault();
    }

    changeSubMenuActive = (e, menu) => {
        e.preventDefault();
        this.props.updateSubMenu(menu.id, { active: !menu.active ? 1 : 0 });
    }

    deleteSubMenu = (e, menu) => {
        e.preventDefault();
        T.confirm('Xóa menu phụ', 'Bạn có chắc bạn muốn xóa menu phụ này?', true, isConfirm => isConfirm && this.props.deleteSubMenu(menu.id));
    }

    showSubMenu = (e, menu) => {
        e.preventDefault();
        this.modal.current.show(menu);
    }

    saveHeader = () => {
        let titleVi = $('#headerViTitle').val();
        let titleEn = $('#headerEnTitle').val();
        let link = $('#headerLink').val();
        if (!titleVi) {
            $('#headerViTitle').focus();
        } else if (!titleEn) {
            $('#headerEnTitle').focus();
        } else if (!link) {
            $('#headerLink').focus();
        } else {
            const payload = {
                headerTitle: JSON.stringify({ vi: titleVi, en: titleEn }),
                headerLink: link,
                isShowHeaderTitle: this.state.isShowHeaderTitle ? 1 : 0
            };
            this.props.updateHeader(payload);
        }
    }

    renderMenu = (menu, level, hasCreate, hasUpdate, hasDelete) => (
        <li key={menu.id} data-id={menu.id}>
            <div className='d-flex w-100 flex-grow-0 justify-content-between'>
                <div className='d-flex'>
                    <Link to={'/user/menu/edit/' + menu.id} style={{ color: menu.active ? '#009688' : 'gray' }}>
                        {T.language.parse(menu.title, true).vi}
                    </Link>&nbsp;
                    {menu.link ? <p>(<a href={menu.link} target='_blank' style={{ color: 'blue' }} rel="noreferrer">{menu.link}</a>)</p> : null}
                </div>
                <div className='buttons btn-group btn-group-sm'>
                    {hasCreate && level == 0 ?
                        <a className='btn btn-info' href='#' onClick={e => this.createChild(e, menu)}>
                            <i className='fa fa-lg fa-plus' />
                        </a> : null}
                    <a href='#' className={menu.active ? 'btn btn-warning' : 'btn btn-secondary'} onClick={e => hasUpdate && this.changeActive(e, menu)}>
                        <i className={'fa fa-lg ' + (menu.active ? 'fa-check' : 'fa-times')} />
                    </a>
                    <Link to={'/user/menu/edit/' + menu.id} className='btn btn-primary'>
                        <i className='fa fa-lg fa-edit' />
                    </Link>
                    {hasDelete ?
                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, menu)}>
                            <i className='fa fa-lg fa-trash' />
                        </a> : null}
                </div>
            </div>

            {menu.submenus ? (
                <ul className='menuList'>
                    {menu.submenus.map(subMenu => this.renderMenu(subMenu, level + 1, hasCreate, hasUpdate, hasDelete))}
                </ul>
            ) : null}
        </li>);

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('menu:write'),
            permissionDelete = currentPermissions.includes('menu:delete');
        const { header } = this.props.system ? this.props.system : { header: '' };
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Menu</h1>
                </div>

                <div className='row'>
                    <div className='col-6'>
                        <div className='tile'>
                            <h3>Menu chính</h3>
                            <ul id='menuMain' className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                {(this.props.menu ? this.props.menu : []).map(menu => this.renderMenu(menu, 0, permissionWrite, permissionWrite, permissionDelete))}
                            </ul>
                            {permissionWrite ?
                                <div className='tile-footer text-right'>
                                    <button type='button' className='btn btn-primary' onClick={this.create}>
                                        <i className='fa fa-fw fa-lg fa-plus' />Tạo mới
                                    </button>
                                </div> : null}
                        </div>
                    </div>

                    <div className='col-6'>
                        <div className='tile'>
                            <h3>Menu phụ</h3>
                            <ul id='menuSub' className='menuSub' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                {(this.props.submenu ? this.props.submenu : []).map((menu, index) => (
                                    <li key={index} data-id={menu.id}>
                                        <div className='d-flex w-100 flex-grow-0 justify-content-between'>
                                            <div className='d-flex'>
                                                <a href='#' onClick={(e) => this.showSubMenu(e, menu)} style={{ color: menu.active ? '#009688' : 'gray' }}>
                                                    {T.language.parse(menu.title)}
                                                </a>&nbsp;
                                                {menu.link ? <p>(<a href={menu.link} target='_blank' style={{ color: 'blue' }} rel="noreferrer">{menu.link}</a>)</p> : null}
                                            </div>
                                            <div className='buttons btn-group btn-group-sm'>
                                                <a href='#' className={menu.active ? 'btn btn-warning' : 'btn btn-secondary'} onClick={e => this.changeSubMenuActive(e, menu)}>
                                                    <i className={'fa fa-lg ' + (menu.active ? 'fa-check' : 'fa-times')} />
                                                </a>
                                                <a href='#' onClick={(e) => this.showSubMenu(e, menu)} className='btn btn-primary'>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a>
                                                {permissionDelete ?
                                                    <a className='btn btn-danger' href='#' onClick={e => this.deleteSubMenu(e, menu)}>
                                                        <i className='fa fa-lg fa-trash' />
                                                    </a> : null}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {permissionWrite ?
                                <div className='tile-footer text-right'>
                                    <button type='button' className='btn btn-primary' onClick={e => this.showSubMenu(e)}>
                                        <i className='fa fa-fw fa-lg fa-plus' />Tạo mới
                                    </button>
                                </div> : null}
                        </div>

                        <div className='tile'>
                            <h3>Menu Header</h3>
                            <div className='form-group'>
                                <label>Hình ảnh</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='SettingImage' userData='header' image={header} />
                            </div>
                            <div className='form-group d-flex'>
                                <label className='control-label'>Kích hoạt tiêu đề góc phải hình ảnh: &nbsp;</label>
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='submenuActive' checked={this.state.isShowHeaderTitle} onChange={e => this.setState({ isShowHeaderTitle: e.target.checked })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                            <div style={{ display: this.state.isShowHeaderTitle ? 'block' : 'none' }}>
                                <div className='form-group'>
                                    <label htmlFor='headerViTitle'>Tiêu đề (VI)</label>
                                    <input type='text' id='headerViTitle' className='form-control' />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='headerEnTitle'>Tiêu đề (EN)</label>
                                    <input type='text' id='headerEnTitle' className='form-control' />
                                </div>
                                <div className='form-group'>
                                    <label htmlFor='headerLink'>Link</label>
                                    <input type='text' id='headerLink' className='form-control' />
                                </div>
                            </div>
                            <div className='tile-footer text-right'>
                                <button type='button' className='btn btn-success' onClick={this.saveHeader}>
                                    <i className='fa fa-fw fa-lg fa-save' />Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button type='button' className='btn btn-danger btn-circle' style={{ position: 'fixed', right: 66, bottom: 10 }} onClick={this.props.buildMenu}>
                    <i className='fa fa-lg fa-refresh' />
                </button>

                {currentPermissions.includes('component:read') ?
                    <button type='button' className='btn btn-info btn-circle' style={{ position: 'fixed', right: 10, bottom: 10 }}
                        onClick={() => this.props.history.push('/user/component')}>
                        <i className='fa fa-lg fa-cogs' />
                    </button> : null}
                <EditModal ref={this.modal} create={this.createSubMenu} update={this.props.updateSubMenu} delete={this.props.deleteSubMenu} hasCreate={permissionWrite} hasUpdate={permissionWrite} hasDelete={permissionDelete} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, menu: state.menu, submenu: state.submenu });
const mapActionsToProps = { getAll, createMenu, updateMenuPriorities, updateMenu, deleteMenu, buildMenu, getAllSubMenu, createSubMenu, updateSubMenu, deleteSubMenu, getHeader, updateHeader, swapSubMenu };
export default connect(mapStateToProps, mapActionsToProps)(MenuPage);