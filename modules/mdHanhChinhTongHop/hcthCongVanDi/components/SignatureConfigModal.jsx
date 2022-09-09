import { Tooltip } from '@mui/material';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import React from 'react';
import { Link } from 'react-router-dom';
import { AdminModal, FormSelect } from 'view/component/AdminPage';
const { vanBanDi, font } = require('../../constant');
import { updateConfig } from '../redux';


const fontSizeArray = () => {
    const start = 8;
    const array = [];
    for (let i = 0; i < 40; i++) {
        array.push(start + i * 0.5);
    }
    return array;
}


export default class SignatureConfigModal extends AdminModal {

    allRef = {}

    onShow = (item, capVanBan) => {
        this.clearForm();
        console.log(item);
        this.setState({ ...item }, () => {
            if (!this.state.config.length)
                this.initConfig();
            else this.setConfig();
        });
    }

    clearForm = () => {
        Object.keys(this.allRef).forEach(key => {
            try {
                this.allRef[key]?.value('');
            } catch {
                return;
            }
        })
    }

    setConfig = () => {
        this.state.config.forEach(item => {
            this.allRef[`${item.signType}_SIGNER`]?.value(item.shcc || '');
            if (item.signType == vanBanDi.signType.SO_VAN_BAN.id) {
                this.allRef.fontName?.value(item.fontName || '');
                this.allRef.fontSize?.value(item.fontSize || '');
            }
        })
    }


    initConfig = () => {
        if (!this.state.phuLuc) {
            this.setState({
                config: Object.values(vanBanDi.signType).filter(item => !item.phuLuc).map(item => ({
                    signType: item.id
                }))
            });
        }
    }

    onSubmit = () => {
        if (!this.state.phuLuc) {
            return this.onMainSubmit(() => { this.props.getFile(this.state.vanBanDi, (files) => this.props.setFiles(files) || this.hide()); });
        }
    }
    onMainSubmit = (done) => {
        const config = [];
        try {

            Object.values(vanBanDi.signType).filter(item => !item.phuLuc).forEach(item => {
                if ([vanBanDi.signType.KY_PHAT_HANH.id, vanBanDi.signType.NOI_DUNG.id, vanBanDi.signType.THE_THUC.id].includes(item.id)) {
                    const current = this.state.config.find(config => config.signType == item.id);
                    const newObject = {
                        ...current,
                        shcc: this.allRef[`${item.id}_SIGNER`].value(),
                    };
                    config.push(newObject);
                }
                else if (item.id == vanBanDi.signType.SO_VAN_BAN.id) {
                    const current = this.state.config.find(config => config.signType == item.id);
                    const newObject = {
                        ...current,
                        fontName: this.allRef.fontName.value(),
                        fontSize: this.allRef.fontSize.value(),
                    };
                    config.push(newObject);
                }
                else if (item.id == vanBanDi.signType.MOC_DO.id) {
                    const current = this.state.config.find(config => config.signType == 'MOC_DO');
                    config.push(current);
                }
            })
            updateConfig(this.state.id, config, done)();
        } catch (error) {
            console.error(error);
            return;
        }
    }

    onChangePosition = (data, signType) => {
        const config = [...this.state.config];
        let current = config.find(item => item.signType == signType);
        const index = config.indexOf(current);
        current = { ...current, ...data };
        config.splice(index, 1, current);
        console.log({ config })
        this.setState({ config });
    }

    renderMainForm = () => {
        const signType = vanBanDi.signType;
        return <ol style={{ width: '100%' }}>
            {Object.values(vanBanDi.signType).filter(item => !item.phuLuc).map((item, index) => {
                if ([signType.KY_PHAT_HANH.id, signType.NOI_DUNG.id, signType.THE_THUC.id].includes(item.id)) {
                    const { height = 50, width = 50, text } = item;
                    const { xCoordinate, yCoordinate, pageNumber } = this.state.config?.find(config => config.signType == item.id) || {};
                    return <React.Fragment key={index}>
                        <li className='col-md-12 font-weight-bold'>{text}</li>
                        <div className='col-md-12 d-flex align-items-center justify-content-center' style={{ gap: 10, marginBottom: 15 }}>
                            <FormSelect ref={e => this.allRef[`${item.id}_SIGNER`] = e} className='d-flex align-items-center justify-content-center' allowClear placeholder='Cán bộ ký' data={SelectAdapter_FwCanBo} style={{ flex: 1, margin: 'auto' }} />
                            <div className='d-flex align-items-center justify-content-center' style={{ gap: 10 }}>
                                <Tooltip title='Vị trí chữ ký' arrow>
                                    <button className='btn btn-secondary' onClick={(e) => e.preventDefault() || this.props.pdfModal.show({ id: this.state.id, xCoordinate, yCoordinate, height, width, pageNumber, submit: (data) => this.onChangePosition(data, item.id) })}>
                                        <i className='fa fa-lg fa-crosshairs' />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </React.Fragment>;
                }
                else if (item.id == signType.SO_VAN_BAN.id) {
                    const { height = 50, width = 50, text } = item;
                    const { xCoordinate, yCoordinate, pageNumber } = this.state.config?.find(config => config.signType == item.id) || {};

                    return <React.Fragment key={index}>
                        <li className='col-md-12 font-weight-bold'>{text}</li>
                        <div className='col-md-12 d-flex align-items-center justify-content-center' style={{ gap: 10, marginBottom: 15 }}>
                            <FormSelect ref={e => this.allRef.fontName = e} placeholder='Kiểu font' data={Object.values(font).reverse()} style={{ flex: 1, margin: 'auto' }} />
                            <FormSelect ref={e => this.allRef.fontSize = e} placeholder='Kích thuớc font' data={fontSizeArray()} style={{ flex: 1, margin: 'auto' }} />
                            <Tooltip title='Vị trí chữ ký' arrow>
                                <button className='btn btn-secondary' onClick={(e) => e.preventDefault() || this.props.pdfModal.show({ id: this.state.id, xCoordinate, yCoordinate, height, width, pageNumber, submit: (data) => this.onChangePosition(data, index) })}>
                                    <i className='fa fa-lg fa-crosshairs' />
                                </button>
                            </Tooltip>
                        </div>
                    </React.Fragment>
                }
                else if (item.id == signType.MOC_DO.id) {
                    const { height = 50, width = 50, text } = item;
                    const { xCoordinate, yCoordinate, pageNumber } = this.state.config?.find(config => config.signType == item.id) || {};

                    return <React.Fragment key={index}>

                        <li className='col-md-12 font-weight-bold'><div className='d-flex align-items-center justify-content-between'>
                            <span>{text}</span>
                            <Tooltip title='Vị trí chữ ký' arrow>
                                <button className='btn btn-secondary' onClick={(e) => e.preventDefault() || this.props.pdfModal.show({ id: this.state.id, xCoordinate, yCoordinate, height, width, pageNumber, submit: (data) => this.onChangePosition(data, vanBanDi.signType.MOC_DO.id) })}>
                                    <i className='fa fa-lg fa-crosshairs' />
                                </button>
                            </Tooltip>
                        </div></li>

                    </React.Fragment>
                }
                else {
                    throw new Error('missing sign type');
                }
            })}
        </ol >
    }

    renderPhuLucForm = () => {

    }

    render = () => {
        return this.renderModal({
            title: 'Cấu hình chữ ký',
            size: 'large',
            body: <div className='row' onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}>
                {/* {this.renderConfig()} */}
                {/* {(this.state.editing || this.state.creating) && this.renderForm()} */}
                {this.state.phuLuc ? this.renderPhuLucForm() : this.renderMainForm()}
                {/* <div className='col-md-12 d-flex justify-content-end'>


                    <button className='btn btn-success' onClick={(e) => { e.preventDefault(); this.setState({ config: [...this.state.config, {}] }) }}><i className='fa fa-lg fa-plus' />Thêm thông tin chữ ký</button>
                </div> */}
            </div>
        })
    }
}

// const mapStateToProps = state => ({ system: state.system, hcthCongVanDi: state.hcth.hcthCongVanDi, phanHoi: state.hcth.hcthPhanHoi });
// const mapActionsToProps = {
//     updateConfig
// };
// export default connect(mapStateToProps, mapActionsToProps)(SignatureConfigModal);