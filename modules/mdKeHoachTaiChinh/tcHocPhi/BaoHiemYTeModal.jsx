
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, FormCheckbox } from 'view/component/AdminPage';
import { createSvBaoHiemYTe } from 'modules/mdSinhVien/svBaoHiemYTe/redux';
import T from 'view/js/common';

class BaoHiemModal extends AdminModal {
    state = {
        check12ThangBhyt: false, check15ThangBhyt: false, checkMienBhyt: false
    }
    onShow = () => {

    }
    handleMienDongBhyt = value => {
        this.setState({
            checkMienBhyt: value,
        }, () => {
            if (value) {
                this.setState({ check12ThangBhyt: !value, check15ThangBhyt: !value });
                this.check12ThangBhyt.value(0);
                this.check15ThangBhyt.value(0);
            }
        });
    }

    handleDong12Thang = value => {
        this.setState({
            check12ThangBhyt: value,
        }, () => {
            if (value) {
                this.setState({ checkMienBhyt: !value, check15ThangBhyt: !value });
                this.checkMienBhyt.value(0);
                this.check15ThangBhyt.value(0);
            }
        });
    }

    handleDong15Thang = value => {
        this.setState({
            check15ThangBhyt: value,
        }, () => {
            if (value) {
                this.setState({ checkMienBhyt: !value, check12ThangBhyt: !value });
                this.checkMienBhyt.value(0);
                this.check12ThangBhyt.value(0);
            }
        });
    }

    onSubmit = () => {
        // temp
        let tinhTrangMapper = {
            'check12ThangBhyt': 'tham gia BHYT 12 tháng (563.220 đồng, từ ngày 01/01/2023 đến 31/12/2023)',
            'check15ThangBhyt': 'tham gia BHYT 15 tháng (704.025 đồng, từ ngày 01/10/2022 đến 31/12/2023)',
            'checkMienBhyt': 'thuộc đối tượng được miễn đóng BHYT'
        }, dienMapper = {
            'check12ThangBhyt': 12,
            'check15ThangBhyt': 15,
            'checkMienBhyt': 0
        };
        let tinhTrang = '', dienDong = 0;
        Object.keys(tinhTrangMapper).forEach(key => {
            if (this.state[key]) {
                tinhTrang = tinhTrangMapper[key];
                dienDong = dienMapper[key];
            }
        });
        T.confirm('Xác nhận', `Xác nhận bạn ${tinhTrang}`, 'warning', true, isConfirm => {
            if (isConfirm) {
                this.props.createSvBaoHiemYTe({ dienDong }, () => location.reload());
            }
        });
    }
    render = () => {
        let { check12ThangBhyt, check15ThangBhyt, checkMienBhyt } = this.state;
        return this.renderModal({
            title: 'Diện Bảo hiểm y tế',
            size: 'large',
            isShowSubmit: check12ThangBhyt || check15ThangBhyt || checkMienBhyt,
            body: <div className='row'>
                <div className='text-danger form-group col-md-12'>* Sinh viên vui lòng chọn <b>1 trong 3 diện</b> để tiến hành đóng học phí</div>
                <FormCheckbox className='col-md-12' ref={e => this.checkMienBhyt = e} label='Đối tượng được miễn đóng BHYT' onChange={this.handleMienDongBhyt} />
                <FormCheckbox className='col-md-12' ref={e => this.check12ThangBhyt = e} label='Tham gia BHYT 12 tháng (563.220 đồng, từ ngày 01/01/2023 đến 31/12/2023)' onChange={this.handleDong12Thang} />
                <FormCheckbox className='col-md-12' ref={e => this.check15ThangBhyt = e} label='Tham gia BHYT 15 tháng (704.025 đồng, từ ngày 01/10/2022 đến 31/12/2023)' onChange={this.handleDong15Thang} />
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    createSvBaoHiemYTe
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoHiemModal);
