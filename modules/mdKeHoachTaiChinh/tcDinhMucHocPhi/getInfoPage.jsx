// import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
// import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTextBox, getValue, renderTable, TableCell } from 'view/component/AdminPage';
// import { SelectAdapter_TcLoaiPhi } from '../tcLoaiPhi/redux';
import { getTcDinhMucHocPhiBy } from './redux';
import SectionAdding from './sectionAdding';
class GetInfoPageDinhMuc extends AdminPage {
    state = {}
    duplicateData = []
    componentDidMount() {
        T.ready('/user/finance/dinh-muc-hoc-phi', () => {
            this.namHoc.value('20');
        });
    }

    getBy = (e, duplicateData = []) => {
        e?.preventDefault();
        try {
            const data = {
                namHoc: getValue(this.namHoc),
                // hocKy: getValue(this.hocKy)
            };
            this.setState({ data });
            this.props.getTcDinhMucHocPhiBy(data, item => {
                this.setState({ tcDinhMucHocPhi: item }, () => {
                    if (item && item.length == 0) T.notify(`Năm học ${data.namHoc} chưa có định phí!`,
                        'warning');
                    if (duplicateData.length) this.duplicateData = duplicateData;
                });
            });
        } catch (input) {
            T.notify(`${input.props.label} trống!`, 'danger');
            input.focus();
        }
    }

    handleNamHoc = (value) => {
        let [start] = value.split(' - ');
        if (!isNaN(start)) {
            this.namHoc.value(`${start} - ${parseInt(start) + 1}`);
            this.namHoc.focus();
        }
    }

    renderListError = () => {
        return (
            <div className='tile'>
                <h5 className='tile-title'>Danh sách trùng</h5>
                <div className='tile-body'>
                    {renderTable({
                        getDataSource: () => this.duplicateData,
                        header: 'thead-light',
                        renderHead: () => <tr>
                            <th style={{ width: '70%' }}>Hệ</th>
                            <th style={{ width: '30%' }}>Bậc</th>
                            <th style={{ width: 'auto', textAlign: 'right' }}>ĐM cũ</th>
                            <th style={{ width: 'auto', textAlign: 'right' }}>ĐM mới</th>
                            <th style={{ width: 'auto' }}>Thao tác</th>
                        </tr>,
                        renderRow: (item, index) => <tr key={index}>
                            <TableCell content={item.loaiDaoTao} />
                            <TableCell content={item.bacDaoTao} />
                            <TableCell type='number' content={item.soTienCu} />
                            <TableCell type='number' content={item.soTien} />
                            <TableCell type='buttons'><button className='btn btn-outline-danger' ><i className='fa fa-lg fa-check' /> Đè</button></TableCell>
                        </tr>
                    })}
                </div>
            </div>
        );
    }

    render() {
        const item = this.state.tcDinhMucHocPhi || [];
        let { data } = this.state;
        return this.renderPage({
            title: 'Định phí cho năm học',
            icon: 'fa fa-sliders',
            breadcrumb: ['Định phí'],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h5 className='tile-title'>Cấu hình tra cứu</h5>
                        <div className='tile-body row'>
                            <FormTextBox type='scholastic' ref={e => this.namHoc = e} label='Năm học' className='col-md-12' required onChange={this.handleNamHoc} />
                            {/* <FormSelect className='col-md-4' ref={e => this.hocKy = e} label='Học kỳ' data={[1, 2, 3]} required /> */}
                            {/* <div style={{ display: item && item.length ? '' : 'none' }} className='col-md-12 form-group' >
                                <div className='row'>
                                    <FormSelect ref={e => this.bacDaoTao = e} data={SelectAdapter_DmSvBacDaoTao} label='Bậc đào tạo' className='col-md-12' />
                                    <FormSelect ref={e => this.loaiDaoTao = e} data={SelectAdapter_DmSvLoaiHinhDaoTao} label='Hệ đào tạo' className='col-md-12' />
                                    <FormSelect ref={e => this.loaiPhi = e} data={SelectAdapter_TcLoaiPhi} label='Loại phí' className='col-md-12' />
                                </div>
                            </div> */}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-outline-primary' onClick={this.getBy}>Tra cứu <i className='fa fa-lg fa-chevron-circle-right' /></button>
                        </div>
                    </div>
                    {/* {this.renderListError([{
                        loaiDaoTao: 'CQ',
                        bacDaoTao: 'DH',
                        soTien: 1000000,
                        soTienCu: 500000
                    }])} */}
                </div>
                <div className='tile col-md-6' style={{ display: item && item.length ? '' : 'none' }}>
                    <h5 className='tile-title'>Thông tin định phí năm học {this.state.data?.namHoc || ''}</h5>
                    <div className='tile-body row'>
                        {item && Object.keys(item.groupBy('tenLoaiPhi')).map((key, index) => (<div className='form-group col-md-12' key={index}>{renderTable({
                            emptyTable: 'Chưa có dữ liệu',
                            header: 'thead-light',
                            getDataSource: () => item.groupBy('tenLoaiPhi')[key],
                            renderHead: () => (
                                <tr>
                                    <th style={{ width: '100%' }}>{key}</th>
                                    <th style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>Số tiền (VNĐ)</th>
                                </tr>
                            ),
                            renderRow: (detail, i) => (
                                <tr key={i}>
                                    <TableCell content={<><span>{detail.tenHeDh || detail.tenHeSdh || ''}</span> <span>({detail.bacDaoTao})</span></>} />
                                    <TableCell type='number' content={detail.soTien ? T.numberDisplay(detail.soTien, ',') : ''} />
                                </tr>
                            )
                        })}</div>))}
                    </div>
                </div>

                {data && item && item.length == 0 && <SectionAdding ref={e => this.add = e} config={this.state.data} getBy={this.getBy} />}
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system, tcDinhMucHocPhi: state.finance.tcDinhMucHocPhi });
const mapActionsToProps = {
    getTcDinhMucHocPhiBy
};
export default connect(mapStateToProps, mapActionsToProps)(GetInfoPageDinhMuc);