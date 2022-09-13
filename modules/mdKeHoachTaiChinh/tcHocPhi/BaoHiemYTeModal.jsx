
import React from 'react';
import { connect } from 'react-redux';
import { AdminModal } from 'view/component/AdminPage';
import { createSvBaoHiemYTe } from 'modules/mdSinhVien/svBaoHiemYTe/redux';
import T from 'view/js/common';

class BaoHiemModal extends AdminModal {
    state = {
        check12ThangBhyt: false, check15ThangBhyt: false, checkMienBhyt: false
    }
    onShow = (func) => {
        func && this.setState({ func });
    }
    handleMienDongBhyt = value => {
        this.setState({
            checkMienBhyt: value,
        }, () => {
            if (value) {
                this.setState({ check12ThangBhyt: !value, check15ThangBhyt: !value });
                // this.check12ThangBhyt.value(0);
                // this.check15ThangBhyt.value(0);
            }
        });
    }

    handleDong12Thang = value => {
        this.setState({
            check12ThangBhyt: value,
        }, () => {
            if (value) {
                this.setState({ checkMienBhyt: !value, check15ThangBhyt: !value });
                // this.checkMienBhyt.value(0);
                // this.check15ThangBhyt.value(0);
            }
        });
    }

    handleDong15Thang = value => {
        this.setState({
            check15ThangBhyt: value,
        }, () => {
            if (value) {
                this.setState({ checkMienBhyt: !value, check12ThangBhyt: !value });
                // this.checkMienBhyt.value(0);
                // this.check12ThangBhyt.value(0);
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
                this.props.createSvBaoHiemYTe({ dienDong }, () => {
                    if (this.state.func) {
                        this.hide();
                        this.state.func();
                    }
                    else location.reload();
                });
            }
        });
    }

    renderChoices = (item) => {
        return <div className={`btn ${this.state[item.key] ? 'btn-primary' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', padding: '20px' }} onClick={item.onClick}>

            <h5 style={{ whiteSpace: 'normal' }}>{item.title}</h5>
            <ul style={{ whiteSpace: 'normal', width: '100%', textAlign: 'left', fontWeight: 'normal', paddingLeft: 10 }}>
                {item.conditions.map((listItem, index) => <li key={index}>{listItem}</li>)}
            </ul>
        </div>;
    }

    render = () => {
        let { check12ThangBhyt, check15ThangBhyt, checkMienBhyt } = this.state;
        return this.renderModal({
            title: 'Bảo hiểm Y tế',
            size: 'elarge',
            isShowSubmit: check12ThangBhyt || check15ThangBhyt || checkMienBhyt,
            body: <div className='row'>
                <div className='text-danger form-group col-md-12'>* Sinh viên vui lòng chọn <b>1 trong 3 mức BHYT</b> để tiến hành đóng học phí</div>
                {/* <FormCheckbox className='col-md-12' ref={e => this.checkMienBhyt = e} label='Đối tượng được miễn đóng BHYT' onChange={this.handleMienDongBhyt} />
                <FormCheckbox className='col-md-12' ref={e => this.check12ThangBhyt = e} label='Tham gia BHYT 12 tháng (563.220 đồng, từ ngày 01/01/2023 đến 31/12/2023)' onChange={this.handleDong12Thang} />
                <FormCheckbox className='col-md-12' ref={e => this.check15ThangBhyt = e} label='Tham gia BHYT 15 tháng (704.025 đồng, từ ngày 01/10/2022 đến 31/12/2023)' onChange={this.handleDong15Thang} /> */}
                <div className='col-md-12 row'>
                    <div className='col-md-4'>
                        {this.renderChoices({ key: 'checkMienBhyt', title: 'Miễn BHYT', conditions: ['Sinh viên thuộc diện hộ nghèo.', 'Vùng dân tộc thiểu số', 'Gia đình chính sách theo quy định của Nhà nước.', <><span className='font-weight-bold'> Lưu ý: </span> Nếu thẻ BHYT có 2 ký tự đầu tiên là SV, HS thì không được miễn.</>], onClick: () => this.handleMienDongBhyt(!this.state.checkMienBhyt) })}
                    </div>
                    <div className='col-md-4'>
                        {this.renderChoices({ key: 'check12ThangBhyt', title: 'Tham gia BHYT 12 tháng', conditions: ['Thời hạn sử dụng thẻ BHYT cũ đến hết ngày 31/12/2022.', <>Sinh viên tra cứu thời hạn sử dụng thẻ BHYT <a style={{ color: this.state.check12ThangBhyt ? 'red' : 'blue' }} className='btn-link' target='_blank' rel='noopener noreferrer' href='https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-thoi-han-su-dung-the-bhyt.aspx'>tại đây</a> HOẶC soạn tin nhắn theo cú pháp: BH THE xxxxxxxxxx (10 số cuối thẻ BHYT) gửi 8079.</>, <><span className='font-weight-bold'>Số tiền: </span>{'563220'.numberDisplay()} đồng</>], onClick: () => this.handleDong12Thang(!this.state.check12ThangBhyt) })}

                    </div>
                    <div className='col-md-4'>
                        {this.renderChoices({
                            key: 'check15ThangBhyt', title: 'Tham gia BHYT 15 tháng', conditions: ['Sinh viên chưa có thẻ BHYT.', 'Thời hạn sử dụng thẻ BHYT cũ đến hết ngày 30/9/2022.', <>Sinh viên tra cứu thời hạn sử dụng thẻ BHYT <a style={{ color: this.state.check15ThangBhyt ? 'red' : 'blue' }} className='btn-link' target='_blank' rel='noopener noreferrer' href='https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-thoi-han-su-dung-the-bhyt.aspx'>tại đây</a> HOẶC soạn tin nhắn theo cú pháp: BH THE xxxxxxxxxx (10 số cuối thẻ BHYT) gửi 8079.</>, <><span className='font-weight-bold'>Số tiền: </span>{'704025'.numberDisplay()} đồng</>], onClick: () => this.handleDong15Thang(!this.state.check15ThangBhyt)
                        })}

                    </div>
                </div>

            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    createSvBaoHiemYTe
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(BaoHiemModal);
