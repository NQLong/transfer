import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormRichTextBox, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import { sendSmsViettel } from './redux';

class SmsMainPage extends AdminPage {
    state = {}
    componentDidMount() {
        T.ready('/user/truyen-thong', () => {

        });
    }
    send = (e) => {
        e?.preventDefault();
        try {
            let data = {
                phone: getValue(this.phone),
                mess: getValue(this.mess)
            };
            this.props.sendSmsViettel(data);
        } catch (input) {
            input && T.notify('Vui lòng điền đủ dữ liệu', 'danger');
        }
    }

    xoaDau = (str) => {
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
        str = str.replace(/đ/g, 'd');
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
        str = str.replace(/Đ/g, 'D');
        return str;
    }

    handleTiengVietCoDau = (value) => {
        this.setState({ tiengVietCoDau: value }, () => {
            if (!value) {
                let currentValue = this.mess.value();
                currentValue = currentValue.split('').map(item => this.xoaDau(item)).join('');
                this.mess.value(currentValue);
            }
        });
    }
    handleSizeMess = (e) => {
        if (this.state.tiengVietCoDau) {
            if (e.target.value.length <= 70) {
                this.mess.value(e.target.value);
            } else {
                this.mess.value(e.target.value.substring(0, 71));
            }
        } else {
            if (this.xoaDau(e.target.value).length <= 160) {
                this.mess.value(this.xoaDau(e.target.value));
            } else {
                this.mess.value(e.target.value.substring(0, 161));
            }
        }
    };

    render() {
        let { tiengVietCoDau } = this.state;
        return this.renderPage({
            title: 'SMS - Tổng đài 1900 3033',
            icon: 'fa fa-envelope',
            content: <div className='row'>
                <div className='form-group col-md-6'>
                    <div className='tile'>
                        <h4 className='tile-title'>Kiểm thử tích hợp Viettel</h4>
                        <div className='tile-body'>
                            <div className='row'>
                                <FormTextBox className='col-md-12' type='phone' ref={e => this.phone = e} label='Số điện thoại' required />
                                <FormCheckbox className='col-md-12' ref={e => this.tiengVietCoDau = e} label='Nội dung có dấu' onChange={this.handleTiengVietCoDau} />
                                <FormRichTextBox className='col-md-12' ref={e => this.mess = e} onChange={this.handleSizeMess} label={`Nội dung (${tiengVietCoDau ? 'tối đa 70 ký tự' : 'tối đa 160 ký tự'})`} required />
                            </div>
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-outline-primary' type='button' onClick={this.send}>
                                <i className='fa fa-lg fa-paper-plane' /> Gửi
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    sendSmsViettel
};
export default connect(mapStateToProps, mapActionsToProps)(SmsMainPage);