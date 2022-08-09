import React from 'react';
import { connect } from 'react-redux';
import { getHcthSettingAll, getHcthSetting, updateHcthSetting, deleteHcthSetting } from './redux';
import { AdminPage, FormTextBox, FormEditor } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class HcthSettingAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/hcth/setting', () => {
            this.props.getHcthSettingAll(items => {
                (items || []).forEach(item => {
                    if (item.key == 'chiDaoEmailEditorHtml') {
                        this.chiDaoEmailEditor.html(item.value);
                    } else if (item.key == 'nhanCongVanDenEmailEditorHtml') {
                        this.nhanCongVanDenEmailEditor.html(item.value);
                    } else {
                        const component = this[item.key];
                        component && component.value && component.value(item.value);
                    }
                });
            });
        });
    }

    save = function () {
        const changes = {};
        for (let i = 0; i < arguments.length; i++) {
            const key = arguments[i];
            changes[key] = this[key].value();
        }
        arguments.length && this.props.updateHcthSetting(changes);
    }

    changePassword = () => {
        const password1 = this.emailPassword1.value();
        const password2 = this.emailPassword2.value();
        if (!password1) {
            T.notify('Mật khẩu không được trống!', 'danger');
        } else if (!password2) {
            T.notify('Cần phải nhập lại mật khẩu!', 'danger');
        } else if (password1 != password2) {
            T.notify('Mật khẩu không trùng nhau!', 'danger');
        } else {
            this.props.updateHcthSetting({ emailPassword: password1 }, () => this.emailPassword1.value('') || this.emailPassword2.value(''));
        }
    }

    saveEmailTempate = (titleKey, editorKey) => {
        const changes = {};
        changes[titleKey] = this[titleKey].value();
        changes[editorKey + 'Text'] = this[editorKey].text();
        changes[editorKey + 'Html'] = this[editorKey].html();
        this.props.updateHcthSetting(changes);
    }

    render() {
        const permission = this.getUserPermission('hcthSetting'),
            readOnly = !permission.write;

        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-cog',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                'Cấu hình'
            ],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Email</h3>
                        <FormTextBox ref={e => this.email = e} label='Email' type='email' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('email')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Mật khẩu email</h3>
                        <FormTextBox ref={e => this.emailPassword1 = e} label='Mật khẩu email' type='password' readOnly={readOnly} />
                        <FormTextBox ref={e => this.emailPassword2 = e} label='Nhập lại mật khẩu email' type='password' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={this.changePassword}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </div>
                <div className='col-md-12'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <a className='nav-link active show' data-toggle='tab' href='#chiDaoEmail'>Email chỉ đạo</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#nhanCongVanDenEmail'>Email nhận văn bản đến</a>
                        </li>
                    </ul>

                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='chiDaoEmail'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.chiDaoEmailTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormEditor ref={e => this.chiDaoEmailEditor = e} label='Nội dung email' smallText='Tham số: {id}' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('chiDaoEmailTitle', 'chiDaoEmailEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                        <div className='tab-pane fade' id='nhanCongVanDenEmail'>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.nhanCongVanDenEmailTitle = e} label='Tiêu đề' readOnly={readOnly} />
                                <FormEditor ref={e => this.nhanCongVanDenEmailEditor = e} label='Nội dung email' smallText='Tham số: {id, soDen, soCongVan, donViGui, ngayCongVan, ngayNhan, trichYeu}' height={400} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.saveEmailTempate('nhanCongVanDenEmailTitle', 'nhanCongVanDenEmailEditor')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthSetting: state.hcth.hcthSetting });
const mapActionsToProps = { getHcthSettingAll, getHcthSetting, updateHcthSetting, deleteHcthSetting };
export default connect(mapStateToProps, mapActionsToProps)(HcthSettingAdminPage);