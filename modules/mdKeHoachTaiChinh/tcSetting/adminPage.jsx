import React from 'react';
import { connect } from 'react-redux';
import { getTcSettingAll, getTcSetting, updateTcSetting, deleteTcSetting } from './redux';
import { AdminPage, FormSelect, FormTextBox, FormRichTextBox, FormEditor } from 'view/component/AdminPage';
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
        return (
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

                    <div className='tile'>
                        <h3 className='tile-header'>Hướng dẫn đóng học phí</h3>
                        <FormEditor ref={e => this.hocPhiHuongDan = e} readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiHuongDan')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-12'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <a className='nav-link active show' data-toggle='tab' href='#hocPhiEmailDong'>Email đóng học phí</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#hocPhiEmailPhatSinh'>Email phát sinh học phí</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#hocPhiEmailHoanTra'>Email hoàn trả học phí</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#hocPhiSmsDong'>SMS đóng học phí</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#hocPhiSmsPhatSinh'>SMS phát sinh học phí</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' data-toggle='tab' href='#hocPhiSmsHoanTra'>SMS hoàn trả học phí</a>
                        </li>
                    </ul>

                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='hocPhiEmailDong'>
                            <EmailItem ref={e => this.hocPhiEmailDong = e} params='{name}, {subject}, {message}' />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('TODO')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='hocPhiEmailPhatSinh'>
                            <EmailItem ref={e => this.hocPhiEmailPhatSinh = e} params='{name}, {subject}, {message}' />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('TODO')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='hocPhiEmailHoanTra'>
                            <EmailItem ref={e => this.hocPhiEmailHoanTra = e} params='{name}, {subject}, {message}' />
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('TODO')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='hocPhiSmsDong'>
                            <div className='tile-body'>
                                <small className='form-text text-muted'>Tham số: {'{name}, {subject}, {message}'}</small>
                                <FormRichTextBox ref={e => this.hocPhiSmsDong = e} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiSmsDong')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='hocPhiSmsPhatSinh'>
                            <div className='tile-body'>
                                <small className='form-text text-muted'>Tham số: {'{name}, {subject}, {message}'}</small>
                                <FormRichTextBox ref={e => this.hocPhiSmsPhatSinh = e} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiSmsPhatSinh')}>
                                    <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tab-pane fade' id='hocPhiSmsHoanTra'>
                            <div className='tile-body'>
                                <small className='form-text text-muted'>Tham số: {'{name}, {subject}, {message}'}</small>
                                <FormRichTextBox ref={e => this.hocPhiSmsHoanTra = e} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button className='btn btn-success' type='button' onClick={() => this.save('hocPhiSmsHoanTra')}>
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

const mapStateToProps = state => ({ system: state.system, TcSetting: state.finance.TcSetting });
const mapActionsToProps = { getTcSettingAll, getTcSetting, updateTcSetting, deleteTcSetting };
export default connect(mapStateToProps, mapActionsToProps)(TcSettingAdminPage);