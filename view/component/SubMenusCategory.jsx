import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { AdminPage } from 'view/component/AdminPage';

const nonAccentVietnamese = str => str.toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
    .replace(/\u02C6|\u0306|\u031B/g, '');

const removeAccentHatVietnamese = str => str.toLowerCase()
    .replace(/â|ă/g, 'a')
    .replace(/à|ầ|ằ/g, 'à')
    .replace(/á|ấ|ắ/g, 'á')
    .replace(/ả|ẩ|ẳ/g, 'ả')
    .replace(/ã|ẫ|ẵ/g, 'ã')
    .replace(/ạ|ậ|ặ/g, 'ạ')
    .replace(/ê/g, 'e')
    .replace(/è|ề/g, 'è')
    .replace(/é|ế/g, 'é')
    .replace(/ẻ|ể/g, 'ẻ')
    .replace(/ẽ|ễ/g, 'ẽ')
    .replace(/ẹ|ệ/g, 'ẹ')
    .replace(/ô|ơ/g, 'o')
    .replace(/ò|ồ|ờ/g, 'ò')
    .replace(/ó|ố|ớ/g, 'ó')
    .replace(/ỏ|ổ|ở/g, 'ỏ')
    .replace(/õ|ỗ|ỗ/g, 'õ')
    .replace(/ọ|ộ|ợ/g, 'ọ')
    .replace(/ư/g, 'u')
    .replace(/ù|ừ/g, 'ù')
    .replace(/ú|ứ/g, 'ú')
    .replace(/ủ|ử/g, 'ủ')
    .replace(/ũ|ữ/g, 'ũ')
    .replace(/ụ|ự/g, 'ụ')
    .replace(/đ/g, 'd')
    .replace(/\u02C6|\u0306|\u031B/g, '');

const removeAccentMarksVietnamese = str => str.toLowerCase()
    .replace(/à|á|ả|ã|ạ/g, 'a')
    .replace(/ằ|ắ|ẳ|ẵ|ặ/g, 'ă')
    .replace(/ầ|ấ|ẩ|ẫ|ậ/g, 'â')
    .replace(/è|é|ẻ|ẽ|ẹ/g, 'e')
    .replace(/ề|ế|ể|ễ|ệ/g, 'ê')
    .replace(/ì|í|ỉ|ĩ|ị/g, 'i')
    .replace(/ò|ó|ỏ|õ|ọ/g, 'o')
    .replace(/ờ|ớ|ở|ỡ|ợ/g, 'ơ')
    .replace(/ồ|ố|ổ|ỗ|ộ/g, 'ô')
    .replace(/ù|ú|ủ|ũ|ụ/g, 'u')
    .replace(/ừ|ứ|ử|ữ|ự/g, 'ư')
    .replace(/ỳ|ý|ỷ|ỹ|ỵ/g, 'y')
    .replace(/\u0300|\u0301|\u0309|\u0303|\u0323/g, '');

const compareSearch = (item, searchValue) => {
    item = item.toLowerCase();
    searchValue = searchValue.toLowerCase();
    if (item.includes(searchValue)) {
        return true;
    } else if (!nonAccentVietnamese(item).includes(nonAccentVietnamese(searchValue))) {
        return false;
    } else {
        return (nonAccentVietnamese(item).includes(searchValue) ||
            removeAccentMarksVietnamese(item).includes(searchValue) ||
            removeAccentHatVietnamese(item).includes(searchValue));
    }
};

class SubMenusPage extends AdminPage {
    state = { mode: 'normal' };

    componentDidMount() {
        T.ready(this.props.menuLink, () => {
            if (this.props.ready) this.props.ready();
            const getMenu = () => {
                const menu = this.props.system && this.props.system.user ? this.props.system.user.menu[this.props.menuKey] : null;
                if (menu) {
                    const menuState = T.storage('menuKey' + this.props.menuKey);
                    Object.keys(menu.menus).forEach(key => {
                        menu.menus[key].key = key;
                        if (menuState[key] == null) menuState[key] = true;
                    });
                    T.storage('menuKey' + this.props.menuKey, menuState);
                    this.setState({ menuState, parentMenu: menu.parentMenu, menus: Object.values(menu.menus) });
                } else {
                    setTimeout(getMenu, 500);
                }
            };
            getMenu();

            T.onSearch = (searchText) => this.search(searchText || '');
            T.showSearchBox();
        });
    }

    componentWillUnmount() {
        T.onSearch = null;
        T.onAdvanceSearchHide = null;
    }

    search = (searchValue) => {
        const menus = this.state.menus.slice();
        for (let i = 0; i < menus.length; i++) {
            if (menus[i].subTitle) {
                menus[i].show = compareSearch(menus[i].subTitle, searchValue);
            }
            if (!menus[i].show) menus[i].show = compareSearch(menus[i].title, searchValue);
        }
        this.setState({ menus });
    }

    menuClick = (e, item) => {
        e.preventDefault();
        this.props.history.push(item.link);
    }

    changeIconState = (e, item) => {
        e.preventDefault();
        const menuState = this.state.menuState;
        menuState[item.key] = !menuState[item.key];
        this.setState({ menuState });
    }
    selectAllIcons = (value) => {
        const menuState = this.state.menuState;
        Object.keys(menuState).forEach(key => menuState[key] = value);
        this.setState({ menuState });
    }
    cancelUserPage = () => {
        const menuState = T.storage('menuKey' + this.props.menuKey);
        this.setState({ mode: 'normal', menuState });
    }
    saveUserPage = () => {
        const menuState = this.state.menuState;
        T.storage('menuKey' + this.props.menuKey, menuState);
        this.setState({ mode: 'normal' });
    }

    getFirstChar = (title) => {
        return title[0];
    }

    render() {
        const { mode, menuState, parentMenu, menus } = this.state;
        const isEditMode = mode == 'edit';
        // const noGroup = parentMenu && (parentMenu.groups == null || parentMenu.groups.length == 0);
        const pinMenus = [];
        const listGroupMenus = [];
        let alphabetGroup = (parentMenu && menus) ?
            Object.keys(menus.groupBy('title'))
                .map(item => item.charAt(0))
                .sort()
                .filter((value, index, list) => !index || value != list[index - 1]) : [''];
        parentMenu && menus && alphabetGroup.forEach((groupText, groupIndex) => {
                const groupMenus = [];
                menus.forEach((item, index) => {
                    if ((item.show == null || item.show == true) && (item.title.charAt(0) == groupText) && (isEditMode || menuState[item.key])) {
                        (!item.pin ? groupMenus : pinMenus).push(
                            <div key={index} href='#' style={{
                                cursor: 'pointer'
                            }} className='col-md-6 col-lg-4' onClick={e => isEditMode ? this.changeIconState(e, item) : this.menuClick(e, item)}>
                                <div className='widget-small coloured-icon'>
                                    <i style={{ color: item.color || 'white', backgroundColor: menuState[item.key] ? item.backgroundColor || '#00b0ff' : '#aaa' }} className={'icon fa fa-3x ' + (item.icon || 'fa-tasks')} />
                                    <div className='info'>
                                        <p>{item.title}</p>
                                        {item.subTitle ? <small style={{ color: 'grey' }}><i>{item.subTitle}</i></small> : null}
                                        {isEditMode ? <i className={'fa fa-lg ' + (menuState[item.key] ? 'fa-check text-success' : 'fa-times text-danger')} style={{ position: 'absolute', right: 24, top: 12 }} /> : null}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                });
                if (groupMenus.length) {
                    const groupItem = (
                        <div key={groupIndex + 1} className='row'>
                            {groupText ? <h4 className='col-12'>{groupText}</h4> : null}
                            {groupMenus}
                        </div>);
                    listGroupMenus.push(groupItem);
                }
            }
        );

        return this.renderPage({
            icon: 'fa ' + this.props.headerIcon,
            title: parentMenu ? parentMenu.title : '',
            content: <>
                <div key={0} className='row'>
                    {pinMenus}
                </div>
                {listGroupMenus}
                {/* {edit} */}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(withRouter(SubMenusPage));
