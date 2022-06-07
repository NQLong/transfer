import React from 'react';
import { connect } from 'react-redux';
import { getTcSettingAll, getTcSetting, updateTcSetting, deleteTcSetting } from './redux';
import { AdminPage, FormSelect, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import Editor from 'view/component/CkEditor4';

class EmailItem extends React.Component {
    constructor(props) {
        super(props);
        this.title = React.createRef();
        this.editor = React.createRef();
    }

    set(title, text, html) {
        this.title.current.value = title;
        this.editor.current.html(html);
    }

    get() {
        return {
            title: this.title.current.value,
            text: this.editor.current.text(),
            html: this.editor.current.html(),
        };
    }

    render() {
        const className = this.props.active ? 'tab-pane fade active show' : 'tab-pane fade';
        return (
            <div className={className} id={this.props.id}>
                <div className='tile-body'>
                    <div className='form-group'>
                        <label className='control-label'>Tiêu đề</label>
                        <input className='form-control' type='text' defaultValue='' ref={this.title} placeholder='Tiêu đề email' />
                    </div>
                    <div className='form-group'>
                        <label className='control-label'>HTML</label>
                        <small className='form-text text-muted'>Tham số: {this.props.params}</small>
                        <Editor ref={this.editor} placeholder='Nội dung email' height={600} />
                    </div>
                </div>
            </div>
        );
    }
}

class TcSettingAdminPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance/setting', () => {
            this.props.getTcSettingAll(items => {
                (items || []).forEach(item => {
                    const component = this[item.key];
                    component && component.value && component.value(item.value);
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
        arguments.length && this.props.updateTcSetting(changes);
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
            this.props.updateTcSetting({ emailPassword: password1 }, () => this.emailPassword1.value('') || this.emailPassword2.value(''));
        }
    }

    render() {
        const permission = this.getUserPermission('TcSetting'),
            readOnly = !permission.write;

        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-cog',
            breadcrumb: ['Cấu hình'],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-header'>Cấu hình</h3>
                        <FormTextBox ref={e => this.hocPhiNamHoc = e} label='Học phí: Năm học' type='year' readOnly={readOnly} />
                        <FormSelect ref={e => this.hocPhiHocKy = e} label='Học phí: Học kỳ' data={[1, 2, 3]} readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiNamHoc', 'hocPhiHocKy')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-header'>Ngân hàng: Chuỗi bí mật</h3>
                        <FormTextBox ref={e => this.secretCodeBidv = e} label='BIDV' readOnly={readOnly} />
                        <FormTextBox ref={e => this.secretCodeVcb = e} label='VCB' readOnly={readOnly} />
                        <FormTextBox ref={e => this.secretCodeAgri = e} label='Agribank' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('secretCodeBidv', 'secretCodeVcb', 'secretCodeAgri')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-header'>Email</h3>
                        <FormTextBox ref={e => this.email = e} label='Email' type='email' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('email')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>

                        <h3 className='tile-header'>Mật khẩu email</h3>
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
                            <a className='nav-link active show' data-toggle='tab' href='#emailHocPhi'>Học phí: Email</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#smsHocPhi'>Học phí: SMS</a>
                        </li>
                    </ul>

                    <div className='tab-content tile'>
                        <EmailItem ref={e => this.emailHocPhi = e} id='emailHocPhi' active={true} params='{name}, {subject}, {message}' />

                        <div className='tab-pane fade' id='smsHocPhi'>
                            <div className='tile-body'>
                                <small className='form-text text-muted'>Tham số: {'{name}, {subject}, {message}'}</small>
                                <FormRichTextBox ref={e => this.hocPhiSms = e} />
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiSms')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, TcSetting: state.finance.TcSetting });
const mapActionsToProps = { getTcSettingAll, getTcSetting, updateTcSetting, deleteTcSetting };
export default connect(mapStateToProps, mapActionsToProps)(TcSettingAdminPage);