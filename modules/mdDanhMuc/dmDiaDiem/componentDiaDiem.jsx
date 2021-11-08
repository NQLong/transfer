import React from 'react';
import { FormTextBox, FormSelect } from 'view/component/AdminPage';
import { ajaxSelectTinhThanhPho } from 'modules/mdDanhMuc/dmDiaDiem/reduxTinhThanhPho';
import { ajaxSelectQuanHuyen } from 'modules/mdDanhMuc/dmDiaDiem/reduxQuanHuyen';
import { ajaxSelectPhuongXa } from 'modules/mdDanhMuc/dmDiaDiem/reduxPhuongXa';

export class ComponentDiaDiem extends React.Component {
    state = { maTinhThanhPho: '', maQuanHuyen: '', maPhuongXa: '' };
    componentDidMount() {
    }

    value = function (maTinhThanhPho, maQuanHuyen, maPhuongXa, soNhaDuong) {
        if (arguments.length) { // set value
            if (maTinhThanhPho) {
                this.setState({ maTinhThanhPho }, () => {
                    this.dmTinhThanhPho.value(maTinhThanhPho);
                    if (maQuanHuyen) {
                        this.setState({ maQuanHuyen }, () => {
                            this.dmQuanHuyen.value(maQuanHuyen);
                            if (maPhuongXa) {
                                this.dmPhuongXa.value(maPhuongXa);
                            } else {
                                this.dmPhuongXa.value(null);
                                maPhuongXa = '';
                            }
                        });
                    } else {
                        this.dmQuanHuyen.value(null); this.dmPhuongXa.value(null);
                        maQuanHuyen = maPhuongXa = '';
                    }
                });
            } else {
                this.dmTinhThanhPho.value(null); this.dmQuanHuyen.value(null); this.dmPhuongXa.value(null);
                maTinhThanhPho = maQuanHuyen = maPhuongXa = '';
            }
            this.soNhaDuong.value(soNhaDuong || '');
            this.setState({ maTinhThanhPho, maQuanHuyen, maPhuongXa });
        } else { // get value
            return ({
                maTinhThanhPho: this.dmTinhThanhPho.value(),
                maQuanHuyen: this.dmQuanHuyen.value(),
                maPhuongXa: this.dmPhuongXa.value(),
                soNhaDuong: this.soNhaDuong.value(),
            });
        }
    }

    changeTinhThanhPho = (value) => {
        if (this.state.maTinhThanhPho != value) {
            this.setState({ maTinhThanhPho: value }, () => {
                this.dmQuanHuyen.value(null); this.dmPhuongXa.value(null);
                this.dmQuanHuyen.focus();
            });
        }
    }

    changeQuanHuyen = (value) => {
        if (this.state.maQuanHuyen != value) {
            this.setState({ maQuanHuyen: value }, () => {
                this.dmPhuongXa.value(null);
                this.dmPhuongXa.focus();
            });
        }
    }

    changePhuongXa = (value) => {
        if (this.state.maPhuongXa != value) {
            this.setState({ maPhuongXa: value }, () => {
                this.soNhaDuong && this.soNhaDuong.focus();
            });
        }
    }

    render = () => {
        // const { label, className, style, readOnly = false, requiredTinh = true, requiredHuyen = true, requiredXa = true, requiredSoNhaDuong = false } = this.props;
        const { label, className, style, readOnly = false, requiredSoNhaDuong = false } = this.props;
        const { maTinhThanhPho = '', maQuanHuyen = '' } = this.state;
        return (
            <div className={(className || '')} style={style}>
                <label>{label || ''}:</label>
                <div className='row'>
                    <FormSelect ref={e => this.dmTinhThanhPho = e} data={ajaxSelectTinhThanhPho} onChange={value => this.changeTinhThanhPho(value.id)} readOnly={readOnly} className='col-md-4' placeholder='Thành phố / Tỉnh' />
                    <FormSelect ref={e => this.dmQuanHuyen = e} data={maTinhThanhPho ? ajaxSelectQuanHuyen(maTinhThanhPho) : []} onChange={value => this.changeQuanHuyen(value.id)} readOnly={readOnly} className='col-md-4' placeholder='Quận / Huyện' />
                    <FormSelect ref={e => this.dmPhuongXa = e} data={maQuanHuyen ? ajaxSelectPhuongXa(maQuanHuyen) : []} onChange={value => this.changePhuongXa(value.id)} readOnly={readOnly} className='col-md-4' placeholder='Phường / Xã' />
                    <FormTextBox ref={e => this.soNhaDuong = e} type='text' style={{ display: requiredSoNhaDuong ? 'block' : 'none' }} placeholder='Số nhà' readOnly={readOnly} className='col-md-6' />
                </div>
            </div>);
    }
}