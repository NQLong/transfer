import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox, FormRichTextBox, FormSelect, getValue } from 'view/component/AdminPage';
import { getListPurposeByShcc } from '../fwSmsDmPurpose/redux';
import { SelectAdapter_FwSmsParameter } from '../fwSmsParameter/redux';
import { fwSmsTemplateDraftCreate, fwSmsTemplateDraftUpdate } from './redux';

class ModalDraft extends AdminModal {
    state = { tiengVietCoDau: false }
    componentDidMount() {
        this.props.getListPurposeByShcc(listPurpose => {
            this.setState({ listPurpose });
        });
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

    onShow = (item) => {
        this.setState({ item });
        if (item) {
            let { content, purpose, thamSo, isTiengViet } = item;
            this.content.value(content);
            this.purpose.value(purpose);
            this.thamSo.value(thamSo?.split(',') || '');
            this.tiengVietCoDau.value(isTiengViet);
        }
    }

    handleSizeMess = (e) => {
        if (this.state.tiengVietCoDau) {
            if (e.target.value.length <= 70) {
                this.content.value(e.target.value);
            } else {
                this.content.value(e.target.value.substring(0, 71));
            }
        } else {
            if (this.xoaDau(e.target.value).length <= 160) {
                this.content.value(this.xoaDau(e.target.value));
            } else {
                this.content.value(e.target.value.substring(0, 161));
            }
        }
    };

    handleTiengVietCoDau = (value) => {
        this.setState({ tiengVietCoDau: value }, () => {
            if (!value) {
                let currentValue = this.content.value();
                currentValue = currentValue.split('').map(item => this.xoaDau(item)).join('');
                this.content.value(currentValue);
            }
        });
    }

    handleChooseParam = (value) => {
        if (value.selected) {
            let currentValue = this.content.value();
            this.content.value(currentValue + value.ten);
        } else {
            let currentValue = this.content.value();
            this.content.value(currentValue.replaceAll(value.ten, ''));
        }
    }

    onSubmit = () => {
        const data = {
            purpose: getValue(this.purpose),
            thamSo: getValue(this.thamSo).join(','),
            content: getValue(this.content),
            isTiengViet: Number(this.tiengVietCoDau.value())
        };
        this.state.item ? this.props.fwSmsTemplateDraftUpdate(this.state.item.id, data, this.hide) : this.props.fwSmsTemplateDraftCreate(data, this.hide);
    }

    render = () => {
        let { tiengVietCoDau } = this.state;
        return this.renderModal({
            title: 'Tạo mới template',
            size: 'large',
            body: <div className='row'>
                <FormSelect label='Mục đích sử dụng template' data={this.state.listPurpose} ref={e => this.purpose = e} className='col-md-12' required />
                <FormSelect ref={e => this.thamSo = e} data={SelectAdapter_FwSmsParameter} label='Tham số' multiple required className='col-md-12' onChange={this.handleChooseParam} />
                <FormCheckbox className='col-md-12' ref={e => this.tiengVietCoDau = e} label='Tiếng Việt có dấu' onChange={this.handleTiengVietCoDau} />
                <FormRichTextBox label='Nội dung' ref={e => this.content = e} className='col-md-12' required placeholder={`${tiengVietCoDau ? 'Tối đa 70 ký tự' : 'Tối đa 160 ký tự'}`} onChange={this.handleSizeMess} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getListPurposeByShcc, fwSmsTemplateDraftCreate, fwSmsTemplateDraftUpdate
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ModalDraft);