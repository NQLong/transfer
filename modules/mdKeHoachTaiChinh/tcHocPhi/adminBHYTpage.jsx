import { SelectAdapter_FwStudent } from 'modules/mdSinhVien/fwStudents/redux';
import React from 'react';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import { BaoHiemModal } from './BaoHiemYTeModal';
import { connect } from 'react-redux';
import { createSvBaoHiemYTe } from 'modules/mdSinhVien/svBaoHiemYTe/redux';

class AdminBhytModal extends BaoHiemModal {
    onShow = (mssv) => {
        this.setState({ mssv });
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
                this.props.createSvBaoHiemYTe({ dienDong, mssv: this.state.mssv }, () => {
                    this.hide();
                });
            }
        });
    }
}


class AdminBhytPage extends AdminPage {
    showModal = (e) => {
        e.preventDefault();
        const mssv = this.mssv.value();
        if (mssv) {
            this.modal.show(mssv);
        } else {
            // this.modal.show(mssv || 12345);
            T.notify('Bạn chưa chọn sinh viên', 'danger');
            this.mssv.focus();
        }
    }

    render() {
        return this.renderPage({
            title: 'Đăng ký Bảo hiểm y tế sinh viên',
            content: <div>
                <div className='tile'>
                    <div className='tile-body row'>
                        <FormSelect ref={e => this.mssv = e} label='Sinh viên' data={SelectAdapter_FwStudent} className='col-md-12' />
                        <div className='col-md-12 d-flex justify-content-end'>
                            <button className='btn btn-success' onClick={e => this.showModal(e)}>
                                <i className='fa fa-lg fa-cog' /> Chọn mức BHYT
                            </button>
                        </div>
                    </div>
                </div>
                <AdminBhytModal ref={e => this.modal = e} createSvBaoHiemYTe={this.props.createSvBaoHiemYTe} />
            </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createSvBaoHiemYTe };
export default connect(mapStateToProps, mapActionsToProps)(AdminBhytPage);
