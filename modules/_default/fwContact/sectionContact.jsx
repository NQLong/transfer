import React from 'react';
import { connect } from 'react-redux';
import { createContact } from './redux';

const texts = {
    vi: {
        contactHeader: 'THÔNG TIN LIÊN HỆ',
        phone: 'Số điện thoại',
        address: 'Địa chỉ',
        yourName: 'Tên của bạn',
        yourEmail: 'Email của bạn',
        subject: 'Tiêu đề thư',
        message: 'Nội dung',
        sendMessage: 'Gửi',
        alertEmptyName: 'Tên của bạn đang trống!',
        alertEmptyEmail: 'Email của bạn đang trống!',
        alertInvalidEmail: 'Email không hợp lệ!',
        alertEmptySubject: 'Chủ đề thông điệp đang trống!',
        alertEmptyMessage: 'Nội dung thông điệp đang trống!',
        sendSuccess: 'Hệ thống đã ghi nhận thông tin của bạn',
    },
    en: {
        contactHeader: 'CONTACT US',
        phone: 'Phone',
        address: 'Address',
        yourName: 'Your name',
        yourEmail: 'Your email',
        subject: 'Subject',
        message: 'Message',
        sendMessage: 'Send message',
        alertEmptyName: 'Your name is empty!',
        alertEmptyEmail: 'Your email is empty!',
        alertInvalidEmail: 'Invalid email!',
        alertEmptySubject: 'Your subject is empty!',
        alertEmptyMessage: 'Your message is empty!',
        sendSuccess: 'Your message has been recorded.'
    }
};

class SectionContact extends React.Component {
    constructor(props) {
        super(props);
        this.name = React.createRef();
        this.email = React.createRef();
        this.subject = React.createRef();
        this.message = React.createRef();
        this.state = {
            address: ''
        };
    }
    componentDidMount() {
        if (this.props.dvWebsite && this.props.dvWebsite.items) {
            this.setState({ ...this.props.dvWebsite.items[0] });
        }
    }

    sendMessage = (e) => {
        e.preventDefault();
        const language = T.language(texts);
        if (this.name.current.value == '') {
            T.notify(language.alertEmptyName, 'danger');
            (this.name.current).focus();
        }
        // else if (this.email.current.value == '') {
        //     T.notify(language.alertEmptyEmail, 'danger');
        //     (this.email.current).focus();
        // } 
        // else if (!T.validateEmail(this.email.current.value)) {
        //     T.notify(language.alertInvalidEmail, 'danger');
        //     (this.email.current).focus();
        // } 
        else if (this.subject.current.value == '') {
            T.notify(language.alertEmptySubject, 'danger');
            (this.subject.current).focus();
        } else if (this.message.current.value == '') {
            T.notify(language.alertEmptyMessage, 'danger');
            (this.message.current).focus();
        } else {
            this.props.createContact({
                name: this.name.current.value,
                // email: this.email.current.value,
                subject: this.subject.current.value,
                message: this.message.current.value
            }, () => {
                this.name.current.value = this.subject.current.value = this.message.current.value = '';
                T.notify(language.sendSuccess, 'success', true, 3000);
            });
        }
    }

    render() {
        const language = T.language(texts);
        let { map, linkMap } = this.props.system ? this.props.system : { map: '', linkMap: '' };
        // address = T.language.parse(address);
        return (
            <section className='contact-section ftco-degree-bg' style={{ padding: '5em 0' }}>
                <div className='container'>
                    <div className='row d-flex mt5 mb-3 contact-info'>
                        <div className='col-md-12 mb-4'>
                            <h2 className='homeTitle' style={{ color: '#0139A6', fontWeight: 'bold' }}>{language.contactHeader}</h2>
                        </div>
                        <div className='w-100' />
                        <div className='col-md-6' style={{ fontSize: '17px' }}>
                            <p><span>{language.address}:</span> <a href={linkMap} target='_blank' rel="noreferrer">
                                {this.state.address}
                            </a></p>
                        </div>
                        <div className='col-md-6' style={{ fontSize: '17px' }}>
                            <p><span>{language.phone}:</span> <a href={'tel:' + this.state.phoneNumber}>{this.state.phoneNumber}</a></p>
                            <p><span>Email:</span> <a href={'mailto:' + this.state.email}>{this.state.email}</a></p>
                        </div>
                    </div>
                    <div className='row block-9'>
                        <div className='col-md-6 pr-md-5'>
                            <form onSubmit={this.sendMessage}>
                                <div className='form-group'>
                                    <input type='text' className='form-control' autoComplete='off' style={{ fontSize: '17px' }} ref={this.name} placeholder={language.yourName} />
                                </div>
                                {/* <div className='form-group'>
                                    <input type='email' className='form-control' autoComplete='off' style={{ fontSize: '17px' }} ref={this.email} placeholder={language.yourEmail} />
                                </div> */}
                                <div className='form-group'>
                                    <input type='text' className='form-control' autoComplete='off' style={{ fontSize: '17px' }} ref={this.subject} placeholder={language.subject} />
                                </div>
                                <div className='form-group'>
                                    <textarea name='message' className='form-control' style={{ fontSize: '17px' }} ref={this.message} cols='30' rows='7' placeholder={language.message} />
                                </div>
                                <div className='form-group'>
                                    <button onClick={this.sendMessage} type='submit' className='btn btn'
                                        style={{ fontSize: '17px', backgroundColor: '#313591', borderRadius: 10, borderWidth: '0px', padding: '15px 30px', color: 'white' }}>{language.sendMessage}</button>
                                </div>
                            </form>
                        </div>
                        <div className='col-md-6'>
                            <a href={linkMap} target='_blank' rel="noreferrer">
                                <img src={map} style={{ width: '100%' }} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsite: state.dvWebsite });
const mapActionsToProps = { createContact };
export default connect(mapStateToProps, mapActionsToProps)(SectionContact);