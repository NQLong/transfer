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
                this.dmTinhThanhPho.value(null);
                this.dmQuanHuyen.value(null);
                this.dmPhuongXa.value(null);
                maTinhThanhPho = maQuanHuyen = maPhuongXa = '';
            }
            if (this.props.requiredSoNhaDuong) this.soNhaDuong.value(soNhaDuong || '');
            this.setState({ maTinhThanhPho, maQuanHuyen, maPhuongXa });
        } else { // get value
            return ({
                maTinhThanhPho: this.dmTinhThanhPho.value(),
                maQuanHuyen: this.dmQuanHuyen.value(),
                maPhuongXa: this.dmPhuongXa.value(),
                soNhaDuong: this.props.requiredSoNhaDuong ? this.soNhaDuong.value() : null,
            });
        }
    }

    changeTinhThanhPho = (value) => {
        if (this.state.maTinhThanhPho != value.id) {
            this.setState({ maTinhThanhPho: value.id }, () => {
                this.dmQuanHuyen.value(null); this.dmPhuongXa.value(null);
                this.dmQuanHuyen.focus();
            });
        }
    }

    changeQuanHuyen = (value) => {
        if (this.state.maQuanHuyen != value.id) {
            this.setState({ maQuanHuyen: value.id }, () => {
                this.dmPhuongXa.value(null);
                this.dmPhuongXa.focus();
            });
        }
    }

    changePhuongXa = (value) => {
        if (this.state.maPhuongXa != value.id) {
            this.setState({ maPhuongXa: value.id }, () => {
                this.soNhaDuong && this.soNhaDuong.focus();
            });
        }
    }

    render = () => {
        const { label, className, style, readOnly = false, requiredSoNhaDuong = false } = this.props;
        const { maTinhThanhPho = '', maQuanHuyen = '' } = this.state;

        return (
            <div className={(className || '')} style={style}>
                <span>
                    <label>{label || 'Địa chỉ'}:</label>
                    <div className='row'>
                        <FormSelect ref={e => this.dmTinhThanhPho = e} data={ajaxSelectTinhThanhPho} onChange={value => this.changeTinhThanhPho(value)} readOnly={readOnly} className='col-4' label={readOnly ? 'Thành phố, tỉnh' : null} placeholder='Thành phố, tỉnh' />
                        <FormSelect ref={e => this.dmQuanHuyen = e} data={maTinhThanhPho ? ajaxSelectQuanHuyen(maTinhThanhPho) : []} onChange={value => this.changeQuanHuyen(value)} readOnly={readOnly} className='col-4' label={readOnly ? 'Quận, huyện' : null} placeholder='Quận, huyện' />
                        <FormSelect ref={e => this.dmPhuongXa = e} data={maQuanHuyen ? ajaxSelectPhuongXa(maQuanHuyen) : []} onChange={value => this.changePhuongXa(value)} readOnly={readOnly} className='col-4' label={readOnly ? 'Phường, xã' : null} placeholder='Phường, xã' />
                        <FormTextBox ref={e => this.soNhaDuong = e} type='text' style={{ display: requiredSoNhaDuong ? 'block' : 'none' }} label={readOnly ? 'Số nhà, đường' : null} placeholder='Số nhà, đường' readOnly={readOnly} className='col-6' />
                    </div>
                </span>
            </div >);
    }
}