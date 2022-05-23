import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormRichTextBox, FormTextBox, getValue } from 'view/component/AdminPage';
import T from 'view/js/common';
import Comment from './Comment';
import { getTccbReply, createTccbSupportReply } from './redux';

export class PhanHoiModal extends AdminModal {
    onShow = (item) => {
        this.setState({ shcc: item.shcc });
        this.maYeuCau.value(item.maYeuCau);
        this.canBoYeuCau.value(item.canBoYeuCau);
        this.qt.value(item.quaTrinh);
        this.props.getTccbReply(item.maYeuCau);
    }

    onSubmit = (e) => {
        e.preventDefault();
        getValue(this.phanHoi) && T.confirm('Gửi phản hồi', 'Gửi phản hồi và từ chối yêu cầu này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                let dataPhanHoi = {
                    maYeuCau: getValue(this.maYeuCau),
                    noiDung: getValue(this.phanHoi),
                    thoiGian: new Date().getTime(),
                    canBoYeuCau: this.state.shcc
                };
                this.props.createTccbSupportReply(dataPhanHoi, () => {
                    this.phanHoi.clear();
                    T.notify('Tạo phản hồi thành công', 'success');
                });
            }
        });
    }
    render = () => {
        let comments = this.props.tccbSupportReply && this.props.tccbSupportReply.items;
        comments && comments.map(item => {
            item.name = item.canBoPhanHoi;
            item.time = item.thoiGian;
            item.content = item.noiDung;
            return item;
        });
        const permission = this.props.permission;
        return this.renderModal({
            title: 'Phản hồi lý do từ chối yêu cầu',
            size: 'elarge',
            isShowSubmit: false,
            body: <>
                <div className='row'>
                    <FormTextBox className='col-md-4' ref={e => this.maYeuCau = e} label='Mã yêu cầu' readOnly />
                    <FormTextBox className='col-md-4' ref={e => this.canBoYeuCau = e} label='Cán bộ yêu cầu' readOnly />
                    <FormTextBox className='col-md-4' ref={e => this.qt = e} label='Về' readOnly />
                </div>
                <h5 style={{ marginBottom: '15px' }}>Phản hồi</h5>
                {comments && comments.length ? comments.map((comment, index) => comment.noiDung && <div key={index}><Comment data={comment} /></div>) : 'Chưa có phản hồi'}
                {permission.write && <div className='row'>
                    <FormRichTextBox style={{ marginTop: '15px' }} className='col-md-12' ref={e => this.phanHoi = e} placeholder='Phản hồi' icon={
                        <button className='btn btn-primary' style={{ position: 'absolute', top: '20px', right: '30px' }} onClick={this.onSubmit}>
                            <i className='fa fa-lg fa-paper-plane' />
                        </button>
                    } />
                </div>}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbSupportReply: state.tccb.tccbSupportReply });
const mapActionsToProps = {
    getTccbReply, createTccbSupportReply
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(PhanHoiModal);