import React from 'react';
import { connect } from 'react-redux';
import { getTcSettingAll, getTcSetting, updateTcSetting, deleteTcSetting } from './redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';

class AdminSettingsPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/finance/admin-setting', () => {
            this.props.getTcSettingAll(items => {
                (items || []).forEach(item => {
                    const component = this[item.key];
                    component && component.value && component.value(item.value || '');
                });
            });
        });
    }

    save = function () {
        const changes = {};
        for (let i = 0; i < arguments.length; i++) {
            const key = arguments[i];
            changes[key] = this[key].value();
        }
        arguments.length && this.props.updateTcSetting(changes);
    }

    render() {
        const permission = this.getUserPermission('TcSetting'),
            readOnly = !permission.write;

        return this.renderPage({
            title: 'Cấu hình Admin',
            icon: 'fa fa-cog',
            breadcrumb: ['Cấu hình Admin'],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>VNPAY</h3>
                        <FormTextBox ref={e => this.vnp_TmnCode = e} label='Mã website' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_HashSecret = e} label='Secret key' type='password' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_Version = e} label='Version VNPay' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_Command = e} label='Mã lệnh (default: pay)' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnp_CurrCode = e} label='Đơn vị tiền tệ (defaut: VND)' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnpayUrl = e} label='VNPAY create bill url' readOnly={readOnly} />
                        <FormTextBox ref={e => this.vnpayQueryUrl = e} label='VNPAY query bill url' readOnly={readOnly} />

                        <FormTextBox ref={e => this.vnp_ReturnUrl = e} label='URL sau khi thanh toán thành công' readOnly={readOnly} />

                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('vnp_TmnCode', 'vnp_HashSecret', 'vnp_Version', 'vnp_Command', 'vnp_CurrCode', 'vnp_ReturnUrl', 'vnpayUrl', 'vnpayQueryUrl')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>

                </div>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Ngân hàng: Chuỗi bí mật</h3>
                        <FormTextBox ref={e => this.secretCodeBidv = e} label='BIDV' readOnly={readOnly} />
                        <FormTextBox ref={e => this.secretCodeVcb = e} label='VCB' readOnly={readOnly} />
                        <FormTextBox ref={e => this.secretCodeAgri = e} label='Agribank' readOnly={readOnly} />
                        <div style={{ textAlign: 'right' }}>
                            <button className='btn btn-success' type='button' onClick={() => this.save('secretCodeBidv', 'secretCodeVcb', 'secretCodeAgri')}>
                                <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                            </button>
                        </div>
                    </div>


                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, TcSetting: state.finance.TcSetting });
const mapActionsToProps = { getTcSettingAll, getTcSetting, updateTcSetting, deleteTcSetting };
export default connect(mapStateToProps, mapActionsToProps)(AdminSettingsPage);