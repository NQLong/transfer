import { connect } from 'react-redux';
import React from 'react';
import { FormCheckbox, FormSelect, FormTextBox, getValue } from 'view/component/AdminPage';
import { SelectAdapter_TcLoaiPhi } from '../tcLoaiPhi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { getDmSvLoaiHinhDaoTaoAll } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import { getDmHocSdhAll } from 'modules/mdDanhMuc/dmHocSdh/redux';
import { createTcDinhMucHocPhiMultiple } from './redux';
class sectionAdding extends React.Component {
    state = { step1: true, step2: false }
    heDaoTao = []
    soTien = {}
    selectLoai = {}

    componentDidMount() {
        this.setState({ step1: true, step2: false });
        this.props.getDmSvLoaiHinhDaoTaoAll(allHeDh => {
            allHeDh = allHeDh.filter(item => item.kichHoat == 1).map(item => ({ loaiDaoTao: item.ma, ten: item.ten, type: 'DH', tenBac: 'Đại học' }));
            this.props.getDmHocSdhAll(allHeSdh => {
                allHeSdh = allHeSdh.filter(item => item.kichHoat == 1).map(item => ({ loaiDaoTao: item.ma, ten: item.ten, type: 'SDH', tenBac: 'Sau Đại học' }));
                this.heDaoTao = [...allHeDh, ...allHeSdh];
            });
        });
    }

    componentDidUpdate(prev) {
        if (prev.config && this.props.config && T.stringify(prev.config) != T.stringify(this.props.config)) {
            this.setState({ step1: true, step2: false });
        }
    }

    handleNext = (e) => {
        e?.preventDefault();
        try {
            const data = {
                loaiPhi: getValue(this.loaiPhi),
                bacDaoTao: getValue(this.bacDaoTao),
                soTienMacDinh: getValue(this.soTienMacDinh)
            };

            this.setState({ step2: true, step1: false, bacDaoTao: data.bacDaoTao, soTienMacDinh: data.soTienMacDinh }, () => {
                this.loaiPhi.value(data.loaiPhi);
                this.bacDaoTao.value(data.bacDaoTao);
                this.soTienMacDinh.value(data.soTienMacDinh);
                this.heDaoTao.filter(item => this.state.bacDaoTao.includes(item.type)).forEach(item => {
                    this.soTien[item.loaiDaoTao].value(data.soTienMacDinh);
                    this.selectLoai[item.loaiDaoTao].value(1);
                });
            });
        } catch (input) {
            T.notify(`${input.props.label} bị trống!`, 'danger');
            input.focus();
        }

    }

    submit = (e) => {
        e.preventDefault();
        let data = [],
            { bacDaoTao } = this.state,
            namHoc = this.props.config.namHoc;
        this.heDaoTao.filter(item => bacDaoTao.includes(item.type)).forEach(item => {
            if (this.selectLoai[item.loaiDaoTao].value()) data.push({
                namHoc,
                loaiPhi: this.loaiPhi.value(),
                soTien: this.soTien[item.loaiDaoTao].value(),
                loaiDaoTao: item.loaiDaoTao,
                bacDaoTao: item.type
            });
        });
        this.props.createTcDinhMucHocPhiMultiple(data, result => {
            if (result.listError.length) {
                T.notify(`Tồn tại các hệ đã định mức NH ${namHoc}`, 'warning');
            }
            this.props.getBy();
        });
    }


    render() {
        let config = this.props.config,
            { namHoc } = config;
        let { step1, step2, bacDaoTao } = this.state;
        return (
            <div className='tile col-md-6'>
                <h5 className='tile-title'>Định phí năm học {namHoc}</h5>
                <div className='tile-body'>
                    <div className='row'>
                        <FormSelect className='col-md-4' ref={e => this.loaiPhi = e} label='Loại phí' data={SelectAdapter_TcLoaiPhi} readOnly={step2} required />
                        <FormSelect className='col-md-4' ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmSvBacDaoTao} multiple readOnly={step2} required />
                        <FormTextBox type='number' className='col-md-4' ref={e => this.soTienMacDinh = e} label='Số tiền mặc định' readOnly={step2} required />
                    </div>
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-outline-danger' style={{ display: step1 ? '' : 'none' }} onClick={this.handleNext} >Tiếp theo <i className='fa fa-lg fa-chevron-circle-down' /></button>
                    <div className='row' style={{ display: step2 ? '' : 'none', height: '40vh', overflow: 'scroll', }}>
                        {bacDaoTao && bacDaoTao.length && this.heDaoTao.filter(item => this.state.bacDaoTao.includes(item.type)).map((item, index) => (
                            <React.Fragment key={index} >
                                <FormCheckbox className='col-md-12' label={`${item.tenBac}: ${item.ten}`} onChange={value => value ? $(`#${item.loaiDaoTao.replace('+', '')}`).show() : $(`#${item.loaiDaoTao.replace('+', '')}`).hide()} ref={e => this.selectLoai[item.loaiDaoTao] = e}
                                    style={{ textAlign: 'left', marginBottom: '0' }} />
                                <div className='form-group col-md-12' id={item.loaiDaoTao.replace('+', '')}>
                                    <FormTextBox type='number' ref={e => this.soTien[item.loaiDaoTao] = e} style={{ textAlign: 'left' }} />
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className='tile-footer' style={{ textAlign: 'right', display: step2 ? '' : 'none' }}>
                    <button className='btn btn-outline-success' onClick={this.submit} ><i className='fa fa-lg fa-floppy-o' />&nbsp; Hoàn tất </button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {
    getDmSvLoaiHinhDaoTaoAll, getDmHocSdhAll, createTcDinhMucHocPhiMultiple
};
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(sectionAdding);