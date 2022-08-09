import React from 'react';
import { connect } from 'react-redux';
import { saveSystemState, createFooterItem, updateFooterItem, swapFooterItem, getFooterSystem, deleteFooterItem, updateFwSetting, getValueFwSetting } from './reduxSystem';
import { getDmNgonNguAll } from 'modules/mdDanhMuc/dmNgonNguTruyenThong/redux';
import { AdminPage, AdminModal, FormImageBox, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
import { FormMultipleLanguage } from 'view/component/MultipleLanguageForm';

const listKeysViettel = ['usernameViettel', 'passViettel', 'brandName', 'totalSMSViettel'];

class EditFooterModal extends AdminModal {
    state = { id: null };

    onShow = menu => {
        let { title, link, active, header, id } = menu || { title: '{ "vi": "", "en": "" }', link: '', active: false, header: false, id: '' };
        this.title.value(title);
        this.link.value(link);
        this.active.value(active);
        this.header.value(header);
        this.setState({ id });
    }

    onSubmit = () => {
        const id = this.state.id,
            changes = {
                title: this.title.value(),
                link: this.link.value(),
                active: Number(this.active.value()),
                header: Number(this.header.value())
            };

        if (id) {
            this.props.update(id, changes);
        } else {
            this.props.create(changes);
        }
        this.hide();
    }

    render = () => {
        return this.renderModal({
            title: 'Thông tin footer',
            size: 'large',
            body: <>
                <FormMultipleLanguage ref={e => this.title = e} gridClassName='col-md-6' languages={this.props.languages} FormElement={FormTextBox} title='Tiêu đề' />
                <div className='row'>
                    <FormTextBox ref={e => this.link = e} className='col-md-6' label='Link' />
                    <div className='col-md-6'>
                        <label/>
                        <div className='row'>
                            <FormCheckbox ref={e => this.active = e} className='col-md-6' label='Kích hoạt' />
                            <FormCheckbox ref={e => this.header = e} className='col-md-6' label='Mục chính' />
                        </div>
                    </div>
                </div>
            </>
        });
    }
}

class SettingsPage extends AdminPage {
    modal = React.createRef();
    state = { languages: ['vi', 'en'] };

    componentDidMount() {
        this.getFooterSystem();
        T.ready('/user/truyen-thong', () => {
            this.props.getValueFwSetting(listKeysViettel, (data) => {
                listKeysViettel.forEach(ref => this[ref].value(data[ref] || ''));
            });
            this.props.getDmNgonNguAll({}, languages => {
                this.setState({ languages: languages.map(item => item.maCode) }, () => {
                    let { address, address2, email, mobile, fax, facebook, youtube, twitter, instagram, logo, linkMap, map } = this.props.system ?
                        this.props.system : { address: '', address2: '', email: '', mobile: '', fax: '', facebook: '', youtube: '', twitter: '', instagram: '', logo: '', linkMap: '' };
                    this.address.value(address);
                    this.address2.value(address2);
                    this.email.value(email || '');
                    this.mobile.value(mobile || '');
                    this.fax.value(fax || '');
                    this.facebook.value(facebook || '');
                    this.youtube.value(youtube || '');
                    this.twitter.value(twitter || '');
                    this.instagram.value(instagram || '');
                    this.logoBox.setData('logo', logo);
                    this.linkMap.value(linkMap || '');
                    this.mapBox.setData('map', map);
                });
            });
            $('.menuList').sortable({
                start: (e, ui) => {
                    $(this).attr('data-prevIndex', ui.item.index());
                },
                update: (e, ui) => {
                    this.updateMenuPriorities(ui.item.index(), $(this).attr('data-prevIndex'));
                }
            });
            $('.menuList').disableSelection();
        });
    }

    updateMenuPriorities = (now, pre) => {
        this.props.swapFooterItem(this.props.system.footerItem[pre].id, this.props.system.footerItem[now].priority);
    }

    getFooterSystem = () => {
        this.props.getFooterSystem(data => {
            let maxPrioritySubmenu = 0;
            data.item.forEach(element => {
                if (element.priority > maxPrioritySubmenu) maxPrioritySubmenu = element.priority;
            });
            this.setState({ maxPrioritySubmenu });
        });
    }

    saveCommonInfo = () => {
        this.props.saveSystemState({
            address: this.address.value(),
            address2: this.address2.value(),
            email: this.email.value(),
            mobile: this.mobile.value(),
            fax: this.fax.value(),
            facebook: this.facebook.value(),
            youtube: this.youtube.value(),
            twitter: this.twitter.value(),
            instagram: this.instagram.value()
        });
    }

    saveMapInfo = () => {
        this.props.saveSystemState({
            linkMap: this.linkMap.value()
        });
    }

    save = function () {
        const changes = {};
        for (let i = 0; i < arguments.length; i++) {
            const key = arguments[i];
            changes[key] = this[key].value();
        }
        arguments.length && this.props.updateFwSetting(changes);
    }

    showSubMenu = (e, menu) => {
        e.preventDefault();
        this.modal.current.show(menu);
    }

    createFooterItem = (item) => {
        if (!item.title) return T.notify('Vui lòng điền đầy đủ thông tin!', 'danger');
        item.priority = this.state.maxPrioritySubmenu + 1;
        this.props.createFooterItem(item, () => this.getFooterSystem());
    }

    changeFooterActive = (e, menu) => {
        e.preventDefault();
        this.props.updateFooterItem(menu.id, { active: !menu.active ? 1 : 0 });
    }

    changeFooterHeader = (e, menu) => {
        e.preventDefault();
        this.props.updateFooterItem(menu.id, { header: !menu.header ? 1 : 0 });

    }

    deleteFooterItem = (e, menu) => {
        e.preventDefault();
        T.confirm('Xóa menu phụ', 'Bạn có chắc bạn muốn xóa menu phụ này?', true,
            isConfirm => isConfirm && this.props.deleteFooterItem(menu.id));
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-cog',
            title: 'Cấu hình',
            content: <>
                <div className='row'>
                    <div className='col-md-7'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin USSH</h3>
                            <div className='tile-body'>
                                <FormMultipleLanguage ref={e => this.address = e} languages={this.state.languages} FormElement={FormTextBox} title='Địa chỉ CS1' tabRender />
                                <FormMultipleLanguage ref={e => this.address2 = e} languages={this.state.languages} FormElement={FormTextBox} title='Địa chỉ CS2' tabRender />
                                <FormTextBox ref={e => this.email = e} label='Email' />
                                <FormTextBox ref={e => this.mobile = e} label='Số điện thoại' />
                                <FormTextBox ref={e => this.fax = e} label='Fax' />
                                <FormTextBox ref={e => this.facebook = e} label='Facebook' />
                                <FormTextBox ref={e => this.youtube = e} label='Youtube' />
                                <FormTextBox ref={e => this.twitter = e} label='Twitter' />
                                <FormTextBox ref={e => this.instagram = e} label='Instagram' />
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.saveCommonInfo}>
                                    <i className='fa fa-fw fa-lg fa-save' />Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Viettel SMS</h3>
                            <FormTextBox ref={e => this.brandName = e} label='Tên thương hiệu (cấp cho Viettel)' />
                            <FormTextBox ref={e => this.usernameViettel = e} label='Username' />
                            <FormTextBox ref={e => this.passViettel = e} label='Password' />
                            <FormTextBox ref={e => this.totalSMSViettel = e} label='Tổng số tin nhắn' readOnly />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('brandName', 'usernameViettel', 'passViettel')}>
                                    <i className='fa fa-fw fa-lg fa-save' />Lưu
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-5'>
                        <div className='tile'>
                            <h3 className='tile-title'>Hình ảnh</h3>
                            <div className='tile-body'>
                                <FormImageBox ref={e => this.logoBox = e} label='Logo' postUrl='/user/upload' uploadType='SettingImage' userData='logo' />
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Bản đồ</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.linkMap = e} label='Địa chỉ Google Map' />
                                <FormImageBox ref={e => this.mapBox = e} label='Bản đồ' postUrl='/user/upload' uploadType='SettingImage' userData='map' />
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.saveMapInfo}>
                                    <i className='fa fa-fw fa-lg fa-save'/>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Footer</h3>
                            <div className='tile-body'>
                                <ul id='menuSub' className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                    {this.props.system && this.props.system.footerItem && this.props.system.footerItem.map((menu, index) => (
                                        <li key={index} data-id={menu.id} style={{ marginLeft: menu.header ? 0 : '25px' }}>
                                            <div className='d-flex w-100 flex-grow-0 justify-content-between'>
                                                <div className='d-flex'>
                                                    <a href='#' onClick={(e) => this.showSubMenu(e, menu)} style={{
                                                        color: menu.active ? (menu.header ? '#009688' : 'black') : 'gray',
                                                        fontWeight: menu.header ? 'bold' : 'normal', fontSize: menu.header ? 16 : 14
                                                    }}>
                                                        {T.language.parse(menu.title, true).vi}
                                                    </a>&nbsp;
                                                    {/* {menu.link ? <p>(<a href={menu.link} target='_blank' style={{ color: 'blue' }}>{menu.link}</a>)</p> : null} */}
                                                </div>
                                                <div className='buttons btn-group btn-group-sm'>
                                                    <a href='#' className={menu.active ? 'btn btn-warning' : 'btn btn-secondary'} onClick={e => this.changeFooterActive(e, menu)}>
                                                        <i className={'fa fa-lg ' + (menu.active ? 'fa-check' : 'fa-times')} />
                                                    </a>
                                                    <a href='#' className={menu.header ? 'btn btn-success' : 'btn btn-secondary'} onClick={e => this.changeFooterHeader(e, menu)}>
                                                        <i className={'fa fa-lg fa-star'} />
                                                    </a>
                                                    <a href='#' className='btn btn-primary' onClick={(e) => this.showSubMenu(e, menu)}>
                                                        <i className='fa fa-lg fa-edit' />
                                                    </a>
                                                    <a href='#' className='btn btn-danger' onClick={e => this.deleteFooterItem(e, menu)}>
                                                        <i className='fa fa-lg fa-trash' />
                                                    </a>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={e => this.showSubMenu(e)}>
                                    <i className='fa fa-fw fa-lg fa-plus-circle'/>Thêm
                                </button>
                                &nbsp;&nbsp;&nbsp;
                                <button className='btn btn-success' type='button' onClick={this.saveMapInfo}>
                                    <i className='fa fa-fw fa-lg fa-save'/>Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <EditFooterModal ref={this.modal} create={this.createFooterItem} languages={this.state.languages} update={this.props.updateFooterItem} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { saveSystemState, createFooterItem, swapFooterItem, updateFooterItem, getFooterSystem, deleteFooterItem, updateFwSetting, getValueFwSetting, getDmNgonNguAll };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);