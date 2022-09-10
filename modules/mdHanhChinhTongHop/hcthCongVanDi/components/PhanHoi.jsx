import React from 'react';
import { AdminPage, renderComment, FormRichTextBox } from 'view/component/AdminPage';
import { connect } from 'react-redux';
import { createPhanHoi, returnVanBan } from '../redux';
import { vanBanDi } from 'modules/mdHanhChinhTongHop/constant';

class PhanHoi extends AdminPage {

    checkNotDonVi = () => {
        const donViQuanLy = this.getDonViQuanLy();
        return this.props.id && ((donViQuanLy.length && !donViQuanLy.includes(this.props.donViGui)) || (donViQuanLy.length == 0 && (this.getDonVi() != this.props.donViGui)));
    }

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        if (this.phanHoi.value()) {
            const { shcc } = this.props.system.user.shcc;
            const newPhanHoi = {
                canBoGui: shcc,
                noiDung: this.phanHoi.value(),
                ngayTao: new Date().getTime(),
                key: this.props.id,
                loai: 'DI'
            };
            this.props.createPhanHoi(newPhanHoi, () => this.getData());
        } else {
            T.notify('Nội dung phản hồi bị trống', 'danger');
            this.phanHoi.focus();
        }
    }

    onReturn = (e) => {
        e.preventDefault();
        const lyDo = this.phanHoi.value();
        if (!lyDo) {
            this.lyDo.focus();
            return T.notify('Vui lòng nhập lý do trả lại văn bản!', 'danger');
        }
        this.props.returnVanBan(this.props.id, lyDo, () => window.location.reload());
    }

    canReturn = () => {
        if (this.props.trangThai == vanBanDi.trangThai.KIEM_TRA_NOI_DUNG.id) {
            return this.props.isManager;
        } else if (this.props.trangThai == vanBanDi.trangThai.KIEM_TRA_THE_THUC.id) {
            return this.getCurrentPermissions().includes('hcthCongVanDi:manage');
        } else if (this.props.trangThai == vanBanDi.trangThai.KY_PHAT_HANH.id) {
            return this.getCurrentPermissions().includes('rectors:login');
        }
        return false;
    }

    renderPhanHoi = (listPhanHoi) => {
        return renderComment({
            getDataSource: () => listPhanHoi,
            emptyComment: 'Chưa có phản hồi',
            renderAvatar: (item) => <img src={item.image || '/img/avatar.png'} style={{ width: '48px', height: '48px', paddingTop: '5px', borderRadius: '50%' }} />,
            renderName: (item) => <><span style={{ color: 'blue' }}>{item.ho?.normalizedName()} {item.ten?.normalizedName()}</span></>,
            renderTime: (item) => T.dateToText(item.ngayTao, 'dd/mm/yyyy HH:MM'),
            renderContent: (item) => item.noiDung
        });
    }

    render() {
        return <React.Fragment>
            <div className='tile'>
                <div className='form-group'>
                    <h3 className='tile-title'>Phản hồi</h3>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            {
                                this.renderPhanHoi(this.props.hcthCongVanDi?.item?.phanHoi)
                            }
                        </div>
                        <FormRichTextBox type='text' className='col-md-12 mt-3' ref={e => this.phanHoi = e} label='Thêm phản hồi' />
                        <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <button type='submit' className='btn btn-success mr-2' onClick={this.onCreatePhanHoi}>
                                <i className='fa fa-paper-plane' />Thêm
                            </button>
                            {this.canReturn() && <button type='submit' className='btn btn-danger' onClick={this.onReturn}>
                                <i className='fa fa-reply' />Trả lại
                            </button>}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
const mapActionsToProps = { createPhanHoi, returnVanBan };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(PhanHoi);