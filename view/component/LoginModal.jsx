import React from 'react';

const texts = {
    vi: {
        registerTitle: 'Đăng ký',
        loginTitle: 'Đăng nhập',
        firstname: 'Tên',
        lastname: 'Họ',
        password: 'Mật khẩu',
        closeButton: 'Đóng',
        registerButton: 'Đăng ký',
        loginButton: 'Đăng nhập',
        forgotPassword: 'Quên mật khẩu?',
        invalidEmail: 'Email không hợp lệ!',
        errorWhenResetYourPassword: 'Lỗi khi phục hồi mật khẩu của bạn!',
        successWhenResetYourPassword: 'Mật khẩu của bạn đã được phục hồi. Bạn vui lòng kiểm tra email để có được mật khẩu mới!',
        emptyFirstname: 'Tên của bạn bị trống!',
        emptyLastname: 'Họ của bạn bị trống!',
        emptyEmail: 'Email bị trống!',
        emptyPassword: 'Mật khẩu bị trống!',
        welcomeNewMember: 'Chào mừng bạn trở thành thành viên của trang web. Vui lòng kiểm tra email để kích hoạt tài khoản của bạn.',
    },
    en: {
        registerTitle: 'Register',
        loginTitle: 'Login',
        firstname: 'Firstname',
        lastname: 'Lastname',
        password: 'Password',
        closeButton: 'Close',
        registerButton: 'Register',
        loginButton: 'Login',
        forgotPassword: 'Forgot password?',
        invalidEmail: 'Invalid email!',
        errorWhenResetYourPassword: 'Error when reset your password!',
        successWhenResetYourPassword: 'Your password has been reseted. Please check your email to get new password!',
        emptyFirstname: 'Your firstname is empty now!',
        emptyLastname: 'Your lastname is empty now!',
        emptyEmail: 'Your email is empty now!',
        emptyPassword: 'Your password is empty now!',
        welcomeNewMember: 'Thank you so much for becoming a member of our website. Please check your email to active account.',
    }
};

export default class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.txtFirstname = React.createRef();
        this.txtLastname = React.createRef();
        this.txtEmail = React.createRef();
        this.txtPassword = React.createRef();
        this.btnForgotPassword = React.createRef();
        this.btnSend = React.createRef();
        this.errorMessage = React.createRef();
    }

    componentDidMount() {
        $(this.modal.current).on('shown.bs.modal', () => {
            // if ($(this.btnSend.current).attr('data-action') === 'register') {
            //     $(this.txtFirstname.current).focus();
            // } else {
            //     $(this.txtEmail.current).focus();
            // }
            $(this.txtEmail.current).focus();
        });
    }

    updateView = (state) => {
        const modal = $(this.modal.current);
        modal.find('a.nav-link').removeClass('active').removeClass('show');
        modal.find(`a.nav-link[href='#${state}']`).addClass('active').addClass('show');

        modal.find('div.modal-content div.modal-body div.form-group').css('display', 'flex');
        const language = T.language(texts);
        if (state === 'register') {
            $(this.btnForgotPassword.current).css('display', 'none');
            modal.find('input').val('');
            $(this.btnSend.current).attr('data-action', state).html(language.registerButton);
        } else {
            $(this.btnForgotPassword.current).css('display', 'block');
            $(this.txtFirstname.current).parent().parent().css('display', 'none');
            $(this.txtLastname.current).parent().parent().css('display', 'none');
            $(this.btnSend.current).attr('data-action', state).html(language.loginButton);
        }
    }

    showRegister = () => {
        $('input').val('');
        $(this.errorMessage.current).html('');
        this.updateView('register');
        $(this.modal.current).modal('show');
    }

    showLogin = () => {
        $('input').val('');
        $(this.errorMessage.current).html('');
        this.updateView('login');
        $(this.modal.current).modal('show');
    }

    onNavLinkClick = (e) => {
        e.preventDefault();
        const state = $(e.target).attr('href').substring(1).toLowerCase();
        this.updateView(state);
    }

    onForgotPasswordClick = (event) => {
        const language = T.language(texts);
        const email = this.txtEmail.current.value.trim(),
            errorMessage = $(this.errorMessage.current);
        if (T.validateEmail(email) === false || email === '') {
            errorMessage.html(language.invalidEmail);
            $(this.txtEmail.current).focus();
        } else {
            this.props.forgotPassword(email, result => {
                if (result.error) {
                    errorMessage.html(language.errorWhenResetYourPassword);
                } else {
                    errorMessage.html(language.successWhenResetYourPassword);
                }
            }, () => errorMessage.html(language.errorWhenResetYourPassword));
        }
        event.preventDefault();
    }

    onSubmit = (e) => {
        const language = T.language(texts);
        e.preventDefault();

        console.log('alo');
        let btnSend = $(this.btnSend.current).attr('disabled', true),
            errorMessage = $(this.errorMessage.current),
            data = {
                email: this.txtEmail.current.value.trim(),
                password: this.txtPassword.current.value
            };

        if (data.email === '') {
            btnSend.attr('disabled', false);
            errorMessage.html(language.emptyEmail);
            $(this.txtEmail.current).focus();
        } else if (!T.validateEmail(data.email)) {
            btnSend.attr('disabled', false);
            errorMessage.html('Email không hợp lệ!');
            $(this.txtEmail.current).focus();
        } else if (data.password === '') {
            btnSend.attr('disabled', false);
            errorMessage.html(language.emptyPassword);
            $(this.txtPassword.current).focus();
        } else {
            this.props.login(data, result => {
                btnSend.attr('disabled', false);
                errorMessage.html(result.error);
                if (result.user) {
                    $(this.modal.current).modal('hide');
                    window.location = '/user';
                }
            });
        }


        // let btnSend = $(this.btnSend.current).attr('disabled', true),
        //     errorMessage = $(this.errorMessage.current),
        //     data = {
        //         lastname: this.txtFirstname.current.value.trim(),
        //         firstname: this.txtLastname.current.value.trim(),
        //         email: this.txtEmail.current.value.trim(),
        //         password: this.txtPassword.current.value
        //     };
        //
        // if (btnSend.attr('data-action') === 'register') { // Register
        //     if (data.firstname === '') {
        //         btnSend.attr('disabled', false);
        //         errorMessage.html(language.emptyFirstname);
        //         $(this.txtFirstname.current).focus();
        //     } else if (data.lastname === '') {
        //         btnSend.attr('disabled', false);
        //         errorMessage.html(language.emptyLastname);
        //         $(this.txtLastname.current).focus();
        //     } else if (data.email === '') {
        //         btnSend.attr('disabled', false);
        //         errorMessage.html(language.emptyEmail);
        //         $(this.txtEmail.current).focus();
        //     } else if (data.password === '') {
        //         btnSend.attr('disabled', false);
        //         errorMessage.html(language.emptyPassword);
        //         $(this.txtPassword.current).focus();
        //     } else {
        //         this.props.register(data, result => {
        //             btnSend.attr('disabled', false);
        //             errorMessage.html(result.error);
        //
        //             if (result.user) {
        //                 $(this.modal.current).modal('hide');
        //                 T.alert(language.welcomeNewMember);
        //             }
        //         });
        //     }
        // } else { // Login
        //     if (data.email === '') {
        //         btnSend.attr('disabled', false);
        //         errorMessage.html(language.emptyEmail);
        //         $(this.txtEmail.current).focus();
        //     } else if (data.password === '') {
        //         btnSend.attr('disabled', false);
        //         errorMessage.html(language.emptyPassword);
        //         $(this.txtPassword.current).focus();
        //     } else {
        //         this.props.login(data, result => {
        //             btnSend.attr('disabled', false);
        //             errorMessage.html(result.error);
        //
        //             if (result.user) {
        //                 $(this.modal.current).modal('hide');
        //                 window.location = '/user';
        //             }
        //         });
        //     }
        // }
    }

    render() {
        const language = T.language(texts);
        return (
            <div ref={this.modal} className='modal' tabIndex='-1' role='dialog'>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header' style={{ padding: 0 }}>
                            <ul className='nav nav-pills nav-fill'
                                style={{ width: '100%', display: 'flex' }}>
                                {/*<li className='nav-item'>*/}
                                {/*    <a href='#register' onClick={this.onNavLinkClick} className='nav-link' style={{ paddingTop: '12px', paddingBottom: '12px', borderRadius: '4.5px 0 0 0' }}>{language.registerTitle}</a>*/}
                                {/*</li>*/}
                                <li className='nav-item'>
                                    <a href='#login' className='nav-link' style={{ paddingTop: '12px', paddingBottom: '12px', borderRadius: '0 4.5px 0 0' }}>{language.loginTitle}</a>
                                </li>
                            </ul>
                        </div>
                        <form className='needs-validation' onSubmit={this.onSubmit} noValidate={true}>
                            <div className='modal-body'>
                                {/*<div className='form-group row'>*/}
                                {/*    <label className='col-sm-3 col-form-label'>{language.firstname}</label>*/}
                                {/*    <div className='col-sm-9'>*/}
                                {/*        <input type='text' className='form-control' required={true} placeholder={language.firstname} ref={this.txtFirstname} />*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*<div className='form-group row'>*/}
                                {/*    <label className='col-sm-3 col-form-label'>{language.lastname}</label>*/}
                                {/*    <div className='col-sm-9'>*/}
                                {/*        <input type='text' className='form-control' required={true} placeholder={language.lastname} ref={this.txtLastname} />*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                <div className='form-group row'>
                                    <label htmlFor='loginModalEmail' className='col-sm-4 col-form-label'>Email</label>
                                    <div className='col-sm-8'>
                                        <input type='email' className='form-control' required={true} placeholder='Email' id='loginModalEmail' ref={this.txtEmail} />
                                    </div>
                                </div>
                                <div className='form-group row'>
                                    <label className='col-sm-4 col-form-label'>Mật khẩu được cấp ban đầu</label>
                                    <div className='col-sm-8'>
                                         <input type='password' className='form-control' required={true} placeholder={language.password} id='loginModalPassword' ref={this.txtPassword} />
                                        {/*<a style={{ margin: '10px' }} ref={this.btnForgotPassword} href='#' className='onlyLoginForm' onClick={this.onForgotPasswordClick}>{language.forgotPassword}</a>*/}
                                    </div>
                                </div>
                                <p ref={this.errorMessage} className='text-danger' />
                            </div>
                            <div className='modal-footer'>
                                {/*<a href='/auth/cas' className='btn' style={{ border: 'solid 1px #eee' }}>*/}
                                {/*    <img src='/img/hcmussh.png' style={{ width: 'auto', height: '24px' }} /> user*/}
                                {/*</a>*/}
                                <button type='button' className='btn btn-secondary' data-dismiss='modal' style={{ width: '100px' }}>{language.closeButton}</button>
                                <button type='submit' className='btn btn-primary' ref={this.btnSend} style={{ width: '100px' }} data-action='register'>{language.registerButton}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}