import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { divisionMenuGetAll, createDivisionMenu, updateDivisionMenuPriorities, updateDivisionMenu, deleteDivisionMenu, buildMenu } from './redux';
import { getDvWebsite, updateDvWebsite } from 'modules/_default/websiteDonVi/redux';
import ImageBox from 'view/component/ImageBox';

class adminDivisionPage extends React.Component {
    state = { showHeaderTitle: 0 };
    imageBox = React.createRef();
    imageBox2 = React.createRef();

    componentDidMount() {
        this.getData();
        T.ready('/user/website', () => {
            $('.menuList').sortable({ update: () => this.updateDivisionMenuPriorities() });
            $('.menuList').disableSelection();
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/menu/:divisionId'),
            divisionId = route.parse(window.location.pathname).divisionId;
        this.props.getDvWebsite(divisionId, (item) => {
            $('#headerViTitle').val(item.headerTitle ? T.language.parse(item.headerTitle, true).vi : '');
            $('#headerEnTitle').val(item.headerTitle ? T.language.parse(item.headerTitle, true).en : '');
            $('#headerLink').val(item.headerLink ? item.headerLink : '');
            this.props.divisionMenuGetAll(item.maDonVi, item.shortname);
            this.imageBox.current.setData('divisionHeader:' + item.shortname);
            this.imageBox2.current.setData('divisionHeaderMobile:' + item.shortname);
            this.setState(item);
        });
    }

    create = (e) => {
        e.preventDefault();
        this.props.createDivisionMenu(null, this.state.maDonVi, this.state.shortname, data => this.props.history.push('/user/menu/edit/' + this.state.id + '/' + data.item.id));
    }

    createChild = (e, item) => {
        e.preventDefault();
        this.props.createDivisionMenu(item.id, this.state.maDonVi, this.state.shortname, data => this.props.history.push('/user/menu/edit/' + this.state.id + '/' + data.item.id));
    }

    updateDivisionMenuPriorities = () => {
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
        this.props.updateDivisionMenuPriorities(changes, () => this.getData());
    }

    changeActive = (e, item) => {
        e.preventDefault();
        this.props.updateDivisionMenu(item.id, { active: item.active ? 0 : 1 }, () => {
            this.getData();
        });
    }

    delete = (e, item) => {
        T.confirm('Xóa menu', 'Bạn có chắc bạn muốn xóa menu này?', true, isConfirm => isConfirm && this.props.deleteDivisionMenu(item.id, this.state.maDonVi, this.state.shortname));
        e.preventDefault();
    }

    saveHeader = () => {
        let titleVi = $('#headerViTitle').val(),
            titleEn = $('#headerEnTitle').val(),
            link = $('#headerLink').val();
        if (!titleVi) {
            T.notify('Tiêu đề trống', 'danger');
            $('#headerViTitle').focus();
        } else if (!titleEn) {
            T.notify('Title is empty', 'danger');
            $('#headerEnTitle').focus();
        } else if (!link) {
            T.notify('Đường dẫn trống', 'danger');
            $('#headerLink').focus();
        } else {
            const payload = {
                headerTitle: JSON.stringify({ vi: titleVi, en: titleEn }),
                headerLink: link,
                showHeaderTitle: this.state.showHeaderTitle ? 1 : 0
            };
            this.props.updateDvWebsite(this.state.id, payload, () => this.getData());
        }
    }

    renderMenu = (menu, level, hasCreate, hasUpdate, hasDelete) => (
        <li key={menu.id} data-id={menu.id}>
            <div style={{ display: 'inline-flex' }}>
                <Link to={'/user/menu/edit/' + this.state.id + '/' + menu.id} style={{ color: menu.active ? '#009688' : 'gray' }}>
                    {T.language.parse(menu.title, true).vi}
                </Link>&nbsp;
                {menu.link ? <p>(<a href={menu.link} target='_blank' style={{ color: 'blue' }} rel='noreferrer'>
                    {menu.link.length > 60 ? menu.link.slice(0, 60) + '...' : menu.link}
                </a>)</p> : null}

                <div className='buttons btn-group btn-group-sm'>
                    {hasCreate ?
                        <a className='btn btn-info' href='#' onClick={e => this.createChild(e, menu)}>
                            <i className='fa fa-lg fa-plus' />
                        </a> : null}
                    <a href='#' className={menu.active ? 'btn btn-warning' : 'btn btn-secondary'} onClick={e => hasUpdate && this.changeActive(e, menu)}>
                        <i className={'fa fa-lg ' + (menu.active ? 'fa-check' : 'fa-times')} />
                    </a>
                    <Link to={'/user/menu/edit/' + this.state.id + '/' + menu.id} className='btn btn-primary'>
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
            hasCreate = currentPermissions.includes('menu:write'),
            hasUpdate = currentPermissions.includes('menu:write'),
            hasDelete = currentPermissions.includes('menu:delete');
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-bars' /> Website {this.state.shortname}: Menu chính</h1>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-6'>
                        <div className='tile'>
                            <ul id='menuMain' className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                {(this.props.menu ? this.props.menu : []).map(menu => this.renderMenu(menu, 0, hasCreate, hasUpdate, hasDelete))}
                            </ul>
                        </div>
                    </div>
                    <div className='col-12 col-md-6'>
                        <div className='tile'>
                            <h3>Menu Header</h3>
                            <div className='form-group'>
                                <label>Header desktop</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='divisionHeader' userData='divisionHeader' image={this.state.header} />
                            </div>
                            <div className='form-group'>
                                <label>Header mobile</label>
                                <ImageBox ref={this.imageBox2} postUrl='/user/upload' uploadType='divisionHeaderMobile' userData='divisionHeader' image={this.state.headerMobile} />
                            </div>
                            <div className='form-group d-flex'>
                                <label className='control-label'>Kích hoạt tiêu đề góc phải hình ảnh: &nbsp;</label>
                                <div className='toggle'>
                                    <label>
                                        <input type='checkbox' id='submenuActive' checked={this.state.showHeaderTitle} onChange={e => this.setState({ showHeaderTitle: e.target.checked })} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                            <div style={{ display: this.state.showHeaderTitle ? 'block' : 'none' }}>
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

                <Link to={'/user/website/edit/' + this.state.id} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <button type='button' className='btn btn-danger btn-circle' style={{ position: 'fixed', bottom: 10, marginLeft: '66px' }} onClick={this.props.buildMenu}>
                    <i className='fa fa-lg fa-refresh' />
                </button>

                {currentPermissions.includes('component:read') ?
                    <button type='button' className='btn btn-info btn-circle' style={{ position: 'fixed', right: '66px', bottom: '10px' }} onClick={() => this.props.history.push('/user/component')}>
                        <i className='fa fa-lg fa-cogs' />
                    </button> : null}

                {hasCreate ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, menu: state.menu });
const mapActionsToProps = {
    divisionMenuGetAll, createDivisionMenu, updateDivisionMenuPriorities,
    updateDivisionMenu, deleteDivisionMenu, getDvWebsite, updateDvWebsite, buildMenu
};
export default connect(mapStateToProps, mapActionsToProps)(adminDivisionPage);