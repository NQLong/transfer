import React from 'react';
import { AdminModal, FormCheckbox } from 'view/component/AdminPage';
import FileBox from 'view/component/FileBox';



export default class SubmitFileModal extends AdminModal {

    onSubmit = () => {
        try {
            this.fileBox.onUploadFile({ phuLuc: Number(this.isPhuLuc.value()), id: this.props.id });
        } catch (error) {
            console.error(error);
        }
    }

    onSuccess = (data) => {
        try {
            if (data.error) {
                return T.notify('Tải lên tập tin văn bản thất bại', 'danger');
            }
            this.props.success(data, () => {

                this.fileBox.setData('hcthVanBanDiFileV2');
                this.hide();
            });
        }
        catch (error) {
            console.error(error);
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm văn bản',
            body: <div className='row'>
                <FormCheckbox ref={e => this.isPhuLuc = e} className='col-md-12' label='Phụ lục' />
                <FileBox ref={e => this.fileBox = e} className='col-md-12' label='Tải lên tập tin văn bản' postUrl='/user/upload' uploadType='hcthVanBanDiFileV2' userData='hcthVanBanDiFileV2' pending={true} success={this.onSuccess} />
            </div>
        });
    }
}
