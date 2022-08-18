import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormFileBox } from 'view/component/AdminPage';

class TachMssvModal extends AdminModal {
    componentDidMount() {
        this.fileBox.setData('TachMssv');
    }
    onSuccess = (data) => {
        if (!data.srcPath) {
            T.notify('Lỗi upload file', 'danger');
        } else {
            T.download(`/api/finance/download-excel-tach-mssv/${data.srcPath}`, 'TACH_MSSV_BIDV.xlsx');
            this.hide();
        }
    }
    render = () => {
        return this.renderModal({
            title: 'Tách MSSV từ sổ phụ BIDV',
            body: <div>
                <FormFileBox ref={e => this.fileBox = e} postUrl='/user/upload' uploadType='TachMssv' userData='TachMssv' onSuccess={this.onSuccess} />
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(TachMssvModal);