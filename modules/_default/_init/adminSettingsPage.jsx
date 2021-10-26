import React from 'react';
import { connect } from 'react-redux';
import { saveSystemState, createFooterItem, updateFooterItem, swapFooterItem, getFooterSystem, deleteFooterItem } from './reduxSystem';
import ImageBox from 'view/component/ImageBox';

class EditFooterModal extends React.Component {
    modal = React.createRef();
    state = {
        active: false,
        header: false
    };

    show = menu => {
        let { title, link, active, header, id } = menu || { title: '{ "vi": "", "en": "" }', link: '', active: false, header: false, id: '' };
        $('#submenuViTitle').val(JSON.parse(title).vi);
        $('#submenuEnTitle').val(JSON.parse(title).en);
        $('#submenuLink').val(link);
        this.setState({ active: !!active, header: !!header });

        $(this.modal.current).find('.modal-title').html(menu ? 'Cập nhật Footer' : 'Tạo mới Footer');
        $(this.modal.current).data('data-id', id).modal('show');
    }

    save = e => {
        e.preventDefault();
        const id = $(this.modal.current).data('data-id'),
            changes = {
                title: JSON.stringify({ vi: $('#submenuViTitle').val(), en: $('#submenuEnTitle').val() }),
                link: $('#submenuLink').val().trim(),
                active: this.state.active ? 1 : 0,
                header: this.state.header ? 1 : 0,
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
                                            <input type='checkbox' id='submenuActive' checked={this.state.active} onChange={e => this.setState({ active: e.target.checked })} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='col-6 d-flex'>
                                    <label className='control-label'>Mục chính: &nbsp;</label>
                                    <div className='toggle'>
                                        <label>
                                            <input type='checkbox' id='header' checked={this.state.header} onChange={e => this.setState({ header: e.target.checked })} />
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

class SettingsPage extends React.Component {
    modal = React.createRef();
    constructor(props) {
        super(props);
        this.enAddress = React.createRef();
        this.viAddress = React.createRef();
        this.enAddress2 = React.createRef();
        this.viAddress2 = React.createRef();
        this.email = React.createRef();
        this.emailPassword1 = React.createRef();
        this.emailPassword2 = React.createRef();
        this.mobile = React.createRef();
        this.fax = React.createRef();
        this.facebook = React.createRef();
        this.youtube = React.createRef();
        this.twitter = React.createRef();
        this.instagram = React.createRef();
        this.logoImage = React.createRef();
        this.footerImage = React.createRef();
        this.logoUploadBox = React.createRef();
        this.footerUploadBox = React.createRef();
        this.linkMap = React.createRef();
    }

    componentDidMount() {
        this.getFooterSystem();
        T.ready('/user/truyen-thong', () => {
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
            address: JSON.stringify({ en: $(this.enAddress.current).val().trim(), vi: $(this.viAddress.current).val().trim() }),
            address2: JSON.stringify({ en: $(this.enAddress2.current).val().trim(), vi: $(this.viAddress2.current).val().trim() }),
            email: $(this.email.current).val().trim(),
            mobile: $(this.mobile.current).val().trim(),
            fax: $(this.fax.current).val().trim(),
            facebook: $(this.facebook.current).val().trim(),
            youtube: $(this.youtube.current).val().trim(),
            twitter: $(this.twitter.current).val().trim(),
            instagram: $(this.instagram.current).val().trim(),
            linkMap: $(this.linkMap.current).val().trim()
        });
    }

    saveMapInfo = () => {
        this.props.saveSystemState({
            linkMap: $(this.linkMap.current).val().trim(),
        });
    }

    changePassword = () => {
        const emailPassword1 = $(this.emailPassword1.current).val(),
            emailPassword2 = $(this.emailPassword2.current).val();
        if (emailPassword1 == '') {
            T.notify('Mật khẩu mới của email hiện tại bị trống!', 'danger');
            $(this.emailPassword1.current).focus();
        } else if (emailPassword2 == '') {
            T.notify('Vui lòng nhập lại mật khẩu mới của email!', 'danger');
            $(this.emailPassword2.current);
        } else if (emailPassword1 != emailPassword2) {
            T.notify('Mật khẩu mới của email không trùng nhau!', 'danger');
            $(this.emailPassword1.current);
        } else {
            this.props.saveSystemState({ password: emailPassword1 });
            $(this.emailPassword1.current).val('');
            $(this.emailPassword2.current).val('');
        }
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
        let { address, address2, email, mobile, fax, facebook, youtube, twitter, instagram, logo, linkMap, map } = this.props.system ?
            this.props.system : { address: '', address2: '', email: '', mobile: '', fax: '', facebook: '', youtube: '', twitter: '', instagram: '', logo: '', linkMap: '' };
        address = T.language.parse(address, true);
        address2 = T.language.parse(address2, true);
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-cog' /> Cấu hình</h1>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin USSH</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Địa chỉ CS1</label>
                                    <input className='form-control' type='text' placeholder='Địa chỉ CS1' ref={this.viAddress} defaultValue={address.vi} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Address 1</label>
                                    <input className='form-control' type='text' placeholder='Address 1' ref={this.enAddress} defaultValue={address.en} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Địa chỉ CS2</label>
                                    <input className='form-control' type='text' placeholder='Địa chỉ CS2' ref={this.viAddress2} defaultValue={address2.vi} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Address 2</label>
                                    <input className='form-control' type='text' placeholder='Address 2' ref={this.enAddress2} defaultValue={address2.en} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Email</label>
                                    <input className='form-control' type='email' placeholder='Email' ref={this.email} defaultValue={email} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Số điện thoại</label>
                                    <input className='form-control' type='text' placeholder='Số điện thoại' ref={this.mobile} defaultValue={mobile} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Fax</label>
                                    <input className='form-control' type='text' placeholder='Fax' ref={this.fax} defaultValue={fax} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Facebook</label>
                                    <input className='form-control' type='text' placeholder='Facebook' ref={this.facebook} defaultValue={facebook} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Youtube</label>
                                    <input className='form-control' type='text' placeholder='Youtube' ref={this.youtube} defaultValue={youtube} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Twitter</label>
                                    <input className='form-control' type='text' placeholder='Twitter' ref={this.twitter} defaultValue={twitter} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Instagram</label>
                                    <input className='form-control' type='text' placeholder='Instagram' ref={this.instagram} defaultValue={instagram} />
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.saveCommonInfo}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>


                    </div>

                    <div className='col-md-6'>
                        {/* <div className='tile'>
                            <h3 className='tile-title'>Đổi mật khẩu Email khoa</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Mật khẩu mới</label>
                                    <input className='form-control mb-3' type='password' placeholder='Mật khẩu mới' ref={this.emailPassword1} defaultValue='' autoComplete='new-password' />
                                    <input className='form-control' type='password' placeholder='Nhập lại mật khẩu' ref={this.emailPassword2} defaultValue='' autoComplete='new-password' />
                                </div>
                            </div>
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-success' type='button' onClick={this.changePassword}>
                                            <i className='fa fa-fw fa-lg fa-save'></i>Đổi mật khẩu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        <div className='tile'>
                            <h3 className='tile-title'>Hình ảnh</h3>
                            <div className='tile-body'>
                                <div className='tile-body'>
                                    <div className='form-group'>
                                        <label className='control-label'>Logo</label>
                                        <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='logo' image={logo} />
                                    </div>
                                    {/* <div className='form-group'>
                                        <label className='control-label'>Hình ảnh Footer</label>
                                        <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='footer' image={footer} />
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Bản đồ</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Địa chỉ Google Map</label>
                                    <input className='form-control' type='text' placeholder='Địa chỉ Google Map' ref={this.linkMap} defaultValue={linkMap} />
                                </div>
                                {/* <div className='form-group'>
                                    <label className='control-label'>Longitude</label>
                                    <input className='form-control' type='number' placeholder='Longitude' ref={this.longitude} defaultValue={longitude} />
                                </div> */}
                                <div className='form-group'>
                                    <label className='control-label'>Bản đồ</label>
                                    <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='map' image={map} />
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={this.saveMapInfo}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                        <EditFooterModal ref={this.modal} create={this.createFooterItem} update={this.props.updateFooterItem} />
                        <div className='tile'>
                            <h3 className='tile-title'>Footer</h3>
                            <div className='tile-body'>
                                <ul id='menuSub' className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                                    {this.props.system && this.props.system.footerItem && this.props.system.footerItem.map((menu, index) => (
                                        <li key={index} data-id={menu.id} style={{ marginLeft: menu.header ? 0 : '25px' }}>
                                            <div className='d-flex w-100 flex-grow-0 justify-content-between'>
                                                <div className='d-flex'>
                                                    <a href='#' onClick={(e) => this.showSubMenu(e, menu)}
                                                        style={{
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
                                                    <a href='#' className='btn btn-primary' onClick={(e) => this.showSubMenu(e, menu)} >
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
                                    <i className='fa fa-fw fa-lg fa-plus-circle'></i>Thêm
                                </button>&nbsp;&nbsp;&nbsp;
                                <button className='btn btn-success' type='button' onClick={this.saveMapInfo}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { saveSystemState, createFooterItem, swapFooterItem, updateFooterItem, getFooterSystem, deleteFooterItem };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);