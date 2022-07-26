import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAll, createMenu, updateMenuPriorities, updateMenu, deleteMenu, buildMenu } from './redux';
import { getAllSubMenu, createSubMenu, updateSubMenu, deleteSubMenu, swapSubMenu } from './reduxSubMenu';
import { getHeader, updateHeader } from './reduxHeader';
import { AdminModal, AdminPage, FormCheckbox, FormImageBox, FormTextBox } from 'view/component/AdminPage';

class EditModal extends AdminModal {
    state = { menu: null };

    onShow = menu => {
        let { title, link, active, highlight } = menu || { title: '{ "vi": "", "en": "" }', link: '', active: false, highlight: false, id: '' };
        title = T.language.parse(title, true);
        this.submenuViTitle.value(title.vi || '');
        this.submenuEnTitle.value(title.en || '');
        this.submenuLink.value(link);
        this.submenuActive.value(active);
        this.submenuHighlight.value(highlight);
        this.setState({ menu });
    }

    onSubmit = () => {
        const changes = {
            title: JSON.stringify({ vi: this.submenuViTitle.value(), en: this.submenuEnTitle.value() }),
            link: this.submenuLink.value(),
            active: Number(this.submenuActive.value()),
            highlight: Number(this.submenuHighlight.value())
        };

        if (this.state.menu && this.state.menu.id) {
            this.props.update(this.state.menu.id, changes);
        } else {
            this.props.create(changes);
        }
        this.hide();
    }

    render = () => {
        return this.renderModal({
            title: this.state.menu ? 'Cập nhật menu phụ' : 'Tạo mới menu phụ',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.submenuViTitle = e} className='col-12' label='Tiêu đề (VI)' />
                    <FormTextBox ref={e => this.submenuEnTitle = e} className='col-12' label='Tiêu đề (EN)' />
                    <FormTextBox ref={e => this.submenuLink = e} className='col-12' label='Link' />
                    <FormCheckbox ref={e => this.submenuActive = e} className='col-6' label='Kích hoạt' />
                    <FormCheckbox ref={e => this.submenuHighlight = e} className='col-6' label='Nổi bật' />
                </div>
            </>
        });
    }
}

class MenuPage extends AdminPage {
    state = { isShowHeaderTitle: false };

    componentDidMount() {
        this.props.getAll();
        this.getAllSubMenu();
        this.props.getHeader(data => {
            this.headerViTitle.value(data.headerTitle ? JSON.parse(data.headerTitle).vi : '');
            this.headerEnTitle.value(data.headerTitle ? JSON.parse(data.headerTitle).en : '');
            this.headerLink.value(data.headerLink || 'a');
            this.setState({ isShowHeaderTitle: data.isShowHeaderTitle == '1' });
        });

        T.ready(('/user/truyen-thong'), () => {
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
        this.modal.show(menu);
    }

    saveHeader = () => {
        let titleVi = this.headerViTitle.value();
        let titleEn = this.headerEnTitle.value();
        let link = this.headerLink.value();

        if (!titleVi) {
            this.headerViTitle.focus();
        } else if (!titleEn) {
            this.headerEnTitle.focus();
        } else if (!link) {
            this.headerLink.focus();
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
                    {menu.link ? <p>(<a href={menu.link} target='_blank' style={{ color: 'blue' }} rel='noreferrer'>{menu.link}</a>)</p> : null}
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
        const permission = this.getUserPermission('menu');
        const componentPermission = this.getUserPermission('component', ['read']);
        const { header } = this.props.system ? this.props.system : { header: '' };
        return this.renderPage({
            icon: 'fa fa-bars',
            title: 'Menu',
            content: <>
                <div className='row'>
                    <div className='col-6'>
                        <div className='tile'>
                            <h3>Menu chính</h3>
                            <ul id='menuMain' className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                {(this.props.menu ? this.props.menu : []).map(menu => this.renderMenu(menu, 0, permission.write, permission.write, permission.delete))}
                            </ul>
                            {permission.write ?
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
                                                {menu.link ? <p>(<a href={menu.link} target='_blank' style={{ color: 'blue' }} rel='noreferrer'>{menu.link}</a>)</p> : null}
                                            </div>
                                            <div className='buttons btn-group btn-group-sm'>
                                                <a href='#' className={menu.active ? 'btn btn-warning' : 'btn btn-secondary'} onClick={e => this.changeSubMenuActive(e, menu)}>
                                                    <i className={'fa fa-lg ' + (menu.active ? 'fa-check' : 'fa-times')} />
                                                </a>
                                                <a href='#' onClick={(e) => this.showSubMenu(e, menu)} className='btn btn-primary'>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a>
                                                {permission.delete ?
                                                    <a className='btn btn-danger' href='#' onClick={e => this.deleteSubMenu(e, menu)}>
                                                        <i className='fa fa-lg fa-trash' />
                                                    </a> : null}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {permission.write ?
                                <div className='tile-footer text-right'>
                                    <button type='button' className='btn btn-primary' onClick={e => this.showSubMenu(e)}>
                                        <i className='fa fa-fw fa-lg fa-plus' />Tạo mới
                                    </button>
                                </div> : null}
                        </div>

                        <div className='tile'>
                            <h3>Menu Header</h3>
                            <FormImageBox ref={e => this.imageBox = e} label='Hình ảnh' postUrl='/user/upload' uploadType='SettingImage' userData='header' image={header} />
                            <div className='form-group d-flex'>
                                <label className='control-label'>Kích hoạt tiêu đề góc phải hình ảnh: &nbsp;</label>
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='submenuActive' checked={this.state.isShowHeaderTitle} onChange={e => this.setState({ isShowHeaderTitle: e.target.checked })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                            <div style={{ display: this.state.isShowHeaderTitle ? '' : 'none' }}>
                                <FormTextBox ref={e => this.headerViTitle = e} label='Tiêu đề (VI)' />
                                <FormTextBox ref={e => this.headerEnTitle = e} label='Tiêu đề (EN)' />
                                <FormTextBox ref={e => this.headerLink = e} label='Link' />
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

                {componentPermission.read ?
                    <button type='button' className='btn btn-info btn-circle' style={{ position: 'fixed', right: 10, bottom: 10 }} onClick={() => this.props.history.push('/user/component')}>
                        <i className='fa fa-lg fa-cogs' />
                    </button> : null}
                <EditModal ref={e => this.modal = e} create={this.createSubMenu} update={this.props.updateSubMenu} delete={this.props.deleteSubMenu} hasCreate={permission.write} hasUpdate={permission.write} hasDelete={permission.delete} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, menu: state.menu, submenu: state.submenu });
const mapActionsToProps = { getAll, createMenu, updateMenuPriorities, updateMenu, deleteMenu, buildMenu, getAllSubMenu, createSubMenu, updateSubMenu, deleteSubMenu, getHeader, updateHeader, swapSubMenu };
export default connect(mapStateToProps, mapActionsToProps)(MenuPage);