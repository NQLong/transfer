import React from 'react';
import { connect } from 'react-redux';
import {
    AdminPage,
    FormDatePicker,
    FormSelect,
    FormRichTextBox,
} from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import {
    getHcthGiaoNhiemVuAll,
    getHcthGiaoNhiemVuPage,
    createHcthGiaoNhiemVu,
    updateHcthGiaoNhiemVu,
    deleteHcthGiaoNhiemVu,
    getHcthGiaoNhiemVuSearchPage,
    getGiaoNhiemVu
} from './redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';

class AdminEditPage extends AdminPage {
    state = {
        id: null,
        listFile: [],
        newPhanHoi: [],
        phanHoi: [],
        listCanBo: []
    }

    // renderPhanHoi = (listPhanHoi) => {
    //     const
    //         contentStyle = {
    //             display: 'flex',
    //             flexDirection: 'column',
    //             flex: 1,
    //             backgroundColor: '#E3E3E3',
    //             padding: '10px 10px 10px 10px',
    //             borderRadius: '5px',
    //         },
    //         containerStyle = {
    //             display: 'flex',
    //             flexDirection: 'row',
    //             gap: '15px'
    //         };
    //     return (
    //         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '10px' }}>
    //             {(!listPhanHoi || listPhanHoi.length == 0) ? <span>Chưa có phản hồi</span> : (

    //                 listPhanHoi.map((item, index) => {
    //                     let { ho, ten, image, ngayTao, noiDung } = item;
    //                     return (
    //                         <div key={index} style={containerStyle}>
    //                             <div style={{}}><img src={image || '/img/avatar.png'} style={{ width: '48px', height: 'auto', paddingTop: '5px' }} /></div>
    //                             <div style={contentStyle}>
    //                                 <div style={{ borderBottom: '1px solid #000000 ', paddingLeft: '5px', ...containerStyle }}>
    //                                     <b style={{ flex: 1 }}>{ho?.normalizedName()} {ten?.normalizedName()}</b>
    //                                     <span>{T.dateToText(ngayTao, 'dd/mm/yyyy HH:MM')}</span>
    //                                 </div>
    //                                 <div style={{ paddingTop: '5px' }}>{noiDung}</div>
    //                             </div>
    //                         </div>
    //                     );
    //                 })
    //             )}
    //         </div>
    //     );
    // }


    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/giao-nhiem-vu/:id').parse(window.location.pathname),
            user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '' },
                { shcc, staff } = user;
            this.setState({ 
                id: params.id === 'new' ? null : params.id ,
                shcc,
                maDonVi: staff.maDonVi,
                user
            }, () => this.getData());

            // if (staff && staff.maDonVi)
            //     SelectAdapter_FwCanBo.getListByMaDonVi(staff.maDonVi, (item) => {
            //         this.setState({ listCanBo: item });
            //     });
        });
    }

    getData = () => {
        if (this.state.id) {
            this.props.getGiaoNhiemVu(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        let { donViNhan, canBoNhan, noiDung, ngayHetHan, danhSachPhanHoi = [] } = data ? data :
            { donViGui: '', donViNhan: '', canBoNhan: '', ngayHetHan: '' };
        if (donViNhan) {
            donViNhan = donViNhan.split(',');
            this.donViNhan.value(donViNhan ? donViNhan : '');
        }
        if (canBoNhan) {
            canBoNhan = canBoNhan.split(',');
            this.canBoNhan.value(canBoNhan ? canBoNhan : '');
        }
        this.noiDung.value(noiDung || '');
        this.ngayHetHan.value(ngayHetHan || '');
        this.phanHoi?.value('');
        this.setState({ 
            phanHoi: danhSachPhanHoi
        });
    };
    save = () => {
        const changes = {
            canBoNhan: this.canBoNhan.value().toString() || null,
            noiDung: this.noiDung.value(),
            ngayHetHan: Number(this.ngayHetHan.value())
        };
        if (this.donViNhan) changes.donViNhan = this.donViNhan.value().toString();
        
        if (!changes.noiDung) {
            T.notify('Nội dung công việc bị trống', 'danger');
            this.noiDung.focus();
        } 
        else if (changes.ngayHetHan && changes.ngayHetHan < changes.ngayCongVan) {
            T.notify('Ngày hết hạn bị trống', 'danger');
            this.ngayNhan.focus();
        }
        else {
            changes.nguoiTao = this.props.system.user.ma;

            if (this.state.id) {
                this.props.updateHcthGiaoNhiemVu(this.state.id, changes, this.getData);
            } else {
                this.props.createHcthGiaoNhiemVu(changes, () => this.props.history.push('/user/hcth/giao-nhiem-vu'));
            }
        }
        //console.log(this.props.system);
    }

    onCreatePhanHoi = (e) => {
        e.preventDefault();
        if (this.phanHoi.value()) {
            const { shcc } = this.state;
            const newPhanHoi = {
                canBoGui: shcc,
                canBoNhan: this.canBoNhan.value(),
                noiDung: this.phanHoi.value(),
                ngayTao: new Date().getTime(),
                maNhiemVu: this.props.match.params.id
            };

            this.setState({
                newPhanHoi: [...this.state.newPhanHoi, newPhanHoi],
                phanHoi: [...this.state.phanHoi, {
                    ...newPhanHoi,
                    ho: this.state.user.lastName,
                    ten: this.state.user.firstName,
                }]
            }, () => this.phanHoi?.value(''));
            // this.setState({
            //     'newChiDao': [...this.state.newChiDao, newChiDao],
            //     chiDao: [...this.state.chiDao, {
            //         ...newChiDao,
            //         chucVu: this.state.chucVu,
            //         ho: this.state.user.lastName,
            //         ten: this.state.user.firstName,
            //     }]
            // }, () => this.chiDao?.value(''));
        }
    }

    render() {
        const permission = this.getUserPermission('hcthGiaoNhiemVu', ['read', 'write', 'delete']),
            presidentPermission = this.getUserPermission('president', ['login']),
            readOnly = !permission.read;
        const isNew = !this.state.id;
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Giao nhiệm vụ',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                <Link key={1} to='/user/hcth/giao-nhiem-vu'>Danh sách Giao nhiệm vụ</Link>,
                isNew ? 'Tạo mới' : 'Cập nhật'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>{!this.state.id ? 'Tạo mới giao nhiệm vụ' : 'Cập nhật giao nhiệm vụ'}</h3>
                    <div className='tile-body row'>
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.noiDung = e} label='Nội dung' readOnly={readOnly} required />
                        { presidentPermission && presidentPermission.login && 
                            <FormSelect multiple={true} className='col-md-6' ref={e => this.donViNhan = e} label='Đơn vị nhận công việc' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                        }
                        <FormSelect multiple={true} className='col-md-6' ref={e => this.canBoNhan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                        <FormDatePicker type='date-mask' className='col-md-6' ref={e => this.ngayHetHan = e} label='Ngày hết hạn' readOnly={readOnly} required />
                    </div>
                </div>
                {/* <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Phản hồi</h3>
                        <div className='tile-body row'>
                            <div className='col-md-12'>
                                {
                                    this.renderPhanHoi(this.state.phanHoi)
                                }
                            </div>

                            <FormRichTextBox type='text' className='col-md-12' ref={e => this.phanHoi = e} label='Thêm phản hồi' readOnly={readOnly} />
                            <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <button type='submit' className='btn btn-primary' onClick={this.onCreatePhanHoi}>
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                </div> */}

            </>,
            backRoute: '/user/hcth/giao-nhiem-vu',
            onSave: permission && permission.write ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcth: state.hcth.hcthGiaoNhiemVu });
const mapActionsToProps = {
    getHcthGiaoNhiemVuAll,
    getHcthGiaoNhiemVuPage,
    createHcthGiaoNhiemVu,
    updateHcthGiaoNhiemVu,
    deleteHcthGiaoNhiemVu,
    getHcthGiaoNhiemVuSearchPage,
    getGiaoNhiemVu,
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);