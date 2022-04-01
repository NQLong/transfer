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
                    ajaxSelectTinhThanhPho.fetchOne(maTinhThanhPho, data => this.setState({ tenTinhThanh: data.text }));
                    if (!this.props.onlyTinhThanh) {
                        if (maQuanHuyen) {
                            this.setState({ maQuanHuyen }, () => {
                                this.dmQuanHuyen.value(maQuanHuyen);
                                ajaxSelectQuanHuyen(maTinhThanhPho).fetchOne(maQuanHuyen, data => this.setState({ tenQuanHuyen: data.text }));
                                if (maPhuongXa) {
                                    this.dmPhuongXa.value(maPhuongXa);
                                    ajaxSelectPhuongXa(maQuanHuyen).fetchOne(maPhuongXa, data => this.setState({ tenPhuongXa: data.text }));
                                } else {
                                    this.dmPhuongXa.value(null);
                                    maPhuongXa = '';
                                }
                            });
                        } else {
                            this.dmQuanHuyen.value(null); this.dmPhuongXa.value(null);
                            maQuanHuyen = maPhuongXa = '';
                        }
                    }
                });
            } else {
                this.dmTinhThanhPho.value(null);
                if (this.props.onlyTinhThanh == false) {
                    this.dmQuanHuyen.value(null);
                    this.dmPhuongXa.value(null);
                }
                maTinhThanhPho = maQuanHuyen = maPhuongXa = '';
            }
            if (this.props.requiredSoNhaDuong) this.soNhaDuong.value(soNhaDuong || '');
            this.setState({ maTinhThanhPho, maQuanHuyen, maPhuongXa });
        } else { // get value
            return ({
                maTinhThanhPho: this.dmTinhThanhPho.value(),
                maQuanHuyen: !this.props.onlyTinhThanh ? this.dmQuanHuyen.value() : null,
                maPhuongXa: !this.props.onlyTinhThanh ? this.dmPhuongXa.value() : null,
                soNhaDuong: !this.props.onlyTinhThanh && this.props.requiredSoNhaDuong ? this.soNhaDuong.value() : null,
            });
        }
    }

    changeTinhThanhPho = (value) => {
        if (!this.props.onlyTinhThanh) {
            if (this.state.maTinhThanhPho != value.id) {
                this.setState({ maTinhThanhPho: value.id, tenTinhThanh: value.text }, () => {
                    this.dmQuanHuyen.value(null); this.dmPhuongXa.value(null);
                    this.dmQuanHuyen.focus();
                });
            }
        }
    }

    changeQuanHuyen = (value) => {
        if (this.state.maQuanHuyen != value.id) {
            this.setState({ maQuanHuyen: value.id, tenQuanHuyen: value.text }, () => {
                this.dmPhuongXa.value(null);
                this.dmPhuongXa.focus();
            });
        }
    }

    changePhuongXa = (value) => {
        if (this.state.maPhuongXa != value.id) {
            this.setState({ maPhuongXa: value.id, tenPhuongXa: value.text }, () => {
                this.soNhaDuong && this.soNhaDuong.focus();
            });
        }
    }

    render = () => {
        // const { label, className, style, readOnly = false, requiredTinh = true, requiredHuyen = true, requiredXa = true, requiredSoNhaDuong = false } = this.props;
        const { label, className, style, readOnly = false, requiredSoNhaDuong = false, onlyTinhThanh = false } = this.props;
        const { maTinhThanhPho = '', maQuanHuyen = '', tenTinhThanh = '', tenQuanHuyen = '', tenPhuongXa = '' } = this.state;

        return (
            <div className={(className || '')} style={style}>
                <span style={{ display: readOnly ? 'block' : 'none' }}><label onClick={() => this.input.focus()}>{label}</label>{readOnly ? <>: <b>{`${tenTinhThanh}${tenQuanHuyen ? ', ' + tenQuanHuyen : ''}${tenPhuongXa ? ', ' + tenPhuongXa : ''}.`}</b></> : ''}</span>
                <span style={{ display: readOnly ? 'none' : 'block' }}>
                    <label>{label || ''}:</label>
                    <div className='row'>
                        <FormSelect ref={e => this.dmTinhThanhPho = e} data={ajaxSelectTinhThanhPho} onChange={value => this.changeTinhThanhPho(value)} readOnly={readOnly} className={onlyTinhThanh ? 'col-md-12' : 'col-md-4'} placeholder='Thành phố / Tỉnh' />
                        {!onlyTinhThanh ? <FormSelect ref={e => this.dmQuanHuyen = e} data={maTinhThanhPho ? ajaxSelectQuanHuyen(maTinhThanhPho) : []} onChange={value => this.changeQuanHuyen(value.id)} readOnly={readOnly} className='col-md-4' placeholder='Quận / Huyện' /> : null}
                        {!onlyTinhThanh ? <FormSelect ref={e => this.dmPhuongXa = e} data={maQuanHuyen ? ajaxSelectPhuongXa(maQuanHuyen) : []} onChange={value => this.changePhuongXa(value.id)} readOnly={readOnly} className='col-md-4' placeholder='Phường / Xã' /> : null}
                        {!onlyTinhThanh ? <FormTextBox ref={e => this.soNhaDuong = e} type='text' style={{ display: requiredSoNhaDuong ? 'block' : 'none' }} placeholder='Số nhà, đường' readOnly={readOnly} className='col-md-6' /> : null}
                    </div>
                </span>
            </div>);
    }
}