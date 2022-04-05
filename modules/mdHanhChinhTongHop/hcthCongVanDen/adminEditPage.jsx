import React from 'react';
import { connect } from 'react-redux';
import {
    AdminPage,
    FormDatePicker,
    renderTable,
    FormTextBox,
    FormSelect,
    TableCell,
    FormRichTextBox,
    FormFileBox
} from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import {
    getHcthCongVanDenAll,
    getHcthCongVanDenPage,
    createHcthCongVanDen,
    updateHcthCongVanDen,
    deleteHcthCongVanDen,
    getHcthCongVanDenSearchPage,
    deleteFile,
    getCongVanDen
} from './redux';
import { SelectAdapter_DmDonViGuiCongVan } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_FwCanBo, SelectAdapter_BanGiamHieu } from 'modules/mdTccb/tccbCanBo/redux';
import { EditModal } from 'modules/mdDanhMuc/dmDonViGuiCv/adminPage';
import { createDmDonViGuiCv } from 'modules/mdDanhMuc/dmDonViGuiCv/redux';
import { SelectAdapter_DmChucVuV2 } from 'modules/mdDanhMuc/dmChucVu/redux';
class AdminEditPage extends AdminPage {
    listFileRefs = {};

    state = {
        id: null,
        listFile: [],
        newChiDao: [],
        chiDao: [],
        user: {},
        shcc: null,
        chucVu: null,
    }

    renderComment = (comment) => {
        const
            contentStyle = {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                backgroundColor: '#E3E3E3',
                padding: '10px 10px 10px 10px',
                borderRadius: '5px',
            },
            containerStyle = {
                display: 'flex',
                flexDirection: 'row',
                gap: '15px'
            };
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '10px' }}>
                {(!comment || comment.length == 0) ? <span>Chưa có chỉ đạo</span> : (

                    comment.map((item, index) => {
                        let { ho, ten, chucVu, image, thoiGian } = item;
                        return (
                            <div key={index} style={containerStyle}>
                                <div style={{}}><img src={image || '/img/avatar.png'} style={{ width: '48px', height: 'auto', paddingTop: '5px' }} /></div>
                                <div style={contentStyle}>
                                    <div style={{ borderBottom: '1px solid #000000 ', paddingLeft: '5px', ...containerStyle }}>
                                        <b style={{ flex: 1 }}>{chucVu} - {ho?.normalizedName()} {ten?.normalizedName()}</b>
                                        <span>{T.dateToText(thoiGian, 'dd/mm/yyyy HH:MM')}</span>
                                    </div>
                                    <div style={{ paddingTop: '5px' }}>{item.chiDao}</div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    }


    componentDidMount() {
        T.ready('/user/hcth', () => {
            const params = T.routeMatcher('/user/hcth/cong-van-den/:id').parse(window.location.pathname),
                user = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '', staff: {}, lastName: '', firstName: '' },
                { shcc, staff } = user;
            this.setState({
                id: params.id === 'new' ? null : params.id,
                shcc,
                chucVu: null,
                user
            }, () => this.getData());
            if (staff && staff.listChucVu?.length > 0)
                SelectAdapter_DmChucVuV2.fetchOne(staff.listChucVu[0].maChucVu, (item) => this.setState({ chucVu: item.text }));
        });
    }




    getData = () => {
        if (this.state.id) {
            this.props.getCongVanDen(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        let { ngayCongVan, ngayNhan, ngayHetHan, soCongVan, donViGui, donViNhan, canBoNhan, trichYeu, listFile = [], quyenChiDao, danhSachChiDao = [] } = data ? data :
            { ngayCongVan: '', ngayNhan: '', ngayHetHan: '', soCongVan: '', donViGui: '', donViNhan: '', canBoNhan: '', trichYeu: '', quyenChiDao: '' };
        if (donViNhan) {
            donViNhan = donViNhan.split(',');
        }
        if (canBoNhan) {
            canBoNhan = canBoNhan.split(',');
        }
        if (quyenChiDao) {
            quyenChiDao = quyenChiDao.split(',');
        }
        this.ngayCongVan.value(ngayCongVan || '');
        this.ngayNhan.value(ngayNhan || '');
        this.ngayHetHan.value(ngayHetHan || '');
        this.soCongVan.value(soCongVan ? soCongVan : '');
        this.donViGui.value(donViGui || '');
        this.donViNhan.value(donViNhan ? donViNhan : '');
        this.canBoNhan.value(canBoNhan ? canBoNhan : '');
        this.trichYeu.value(trichYeu || '');
        this.chiDao?.value('');
        this.quyenChiDao.value(quyenChiDao || '');
        this.setState({ listFile, chiDao: danhSachChiDao }, () => {
            listFile.map((item, index) => this.listFileRefs[index]?.value(item.viTri));
        });
        this.fileBox?.setData('hcthCongVanDenFile:' + (this.state.id ? this.state.id : 'new'));
    }

    onSuccess = (response) => {
        if (response.error) T.notify(response.error, 'danger');
        else if (response.item) {
            let listFile = this.state.listFile.length ? [...this.state.listFile] : [];
            listFile.push(response.item);
            let linkCongVan = '[]';
            try {
                linkCongVan = JSON.stringify(listFile);
            } catch (exception) {
                T.notify(exception, 'danger');
                return;
            }
            this.state.id && this.props.updateHcthCongVanDen(this.state.id, { linkCongVan });
            this.setState({ listFile });
        }
    }

    deleteFile = (e, index, item) => {
        e.preventDefault();
        const { id: fileId, ten: file } = item;
        T.confirm('Tập tin đính kèm', 'Bạn có chắc muốn xóa tập tin đính kèm này, tập tin sau khi xóa sẽ không thể khôi phục lại được', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteFile(this.state.id ? this.state.id : null, fileId, file, () => {
                let listFile = [...this.state.listFile];
                listFile.splice(index, 1);
                this.setState({ listFile });
            }));
    }

    onViTriChange = (e, index) => {
        e.preventDefault();
        let listFile = [...this.state.listFile];
        listFile[index].viTri = this.listFileRefs[index].value() || '';
        this.setState({ listFile });
    }


    // rederComment = (data) =>


    tableListFile = (data, id, permission) => renderTable({
        getDataSource: () => data,
        stickyHead: false,
        emptyTable: 'Chưa có file công văn nào!',
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ width: '80%' }}>Tên tập tin</th>
                <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Vị trí</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
            </tr>
        ),
        renderRow: (item, index) => {
            const
                timeStamp = item.thoiGian,
                originalName = item.ten,
                linkFile = `/api/hcth/cong-van-den/download/${id || 'new'}/${originalName}`;
            return (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ wordBreak: 'break-all' }} content={<>
                        <a href={linkFile} download>{originalName}</a>
                    </>
                    } />
                    <TableCell style={{}} content={(
                        <FormTextBox type='text' placeholder='Nhập vị trí' style={{ marginBottom: 0 }} ref={e => this.listFileRefs[index] = e} onChange={e => this.onViTriChange(e, index)} />
                    )} />
                    <TableCell style={{ textAlign: 'center' }} content={T.dateToText(timeStamp, 'dd/mm/yyyy HH:MM')} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission} onDelete={e => this.deleteFile(e, index, item)}>
                        <a className='btn btn-info' href={linkFile} download>
                            <i className='fa fa-lg fa-download' />
                        </a>
                    </TableCell>
                </tr>
            );
        }
    });

    save = () => {
        const changes = {
            ngayCongVan: Number(this.ngayCongVan.value()),
            ngayNhan: Number(this.ngayNhan.value()),
            ngayHetHan: Number(this.ngayHetHan.value()),
            soCongVan: this.soCongVan.value(),
            donViGui: this.donViGui.value(),
            donViNhan: this.donViNhan.value().toString() || null,
            canBoNhan: this.canBoNhan.value().toString() || null,
            quyenChiDao: this.quyenChiDao.value().toString() || null,
            trichYeu: this.trichYeu.value(),
            chiDao: this.state.newChiDao,
            fileList: this.state.listFile || [],
        };
        if (!changes.ngayCongVan) {
            T.notify('Ngày công văn bị trống', 'danger');
            this.ngayCongVan.focus();
        } else if (!changes.ngayNhan) {
            T.notify('Ngày nhận công văn bị trống', 'danger');
            this.ngayNhan.focus();
        } else if (!changes.donViGui || (Array.isArray(changes.donViGui) && changes.donViGui.length === 0)) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.maDonViGuiCV.focus();
        } else if (!changes.trichYeu) {
            T.notify('Trích yếu công văn bị trống', 'danger');
            this.trichYeu.focus();
        } else if (changes.ngayNhan < changes.ngayCongVan) {
            T.notify('Ngày nhận công văn trước ngày công văn', 'danger');
            this.ngayNhan.focus();
        } else if (changes.ngayHetHan && changes.ngayHetHan < changes.ngayCongVan) {
            T.notify('Ngày công văn hết hạn trước ngày công văn', 'danger');
            this.ngayNhan.focus();
        }
        else {
            if (this.state.id) {
                this.props.updateHcthCongVanDen(this.state.id, changes, this.getData);
            } else {
                this.props.createHcthCongVanDen(changes, () => this.props.history.push('/user/hcth/cong-van-den'));
            }
        }
    }

    onCreateDonviGui = (data, done) => {
        this.props.createDmDonViGuiCv(data, ({ error, item }) => {
            if (!error) {
                const { id } = item;
                this.donViGui?.value(id);
                done && done({ error, item });
            }
            this.modal.hide();
        });
    }

    onCreateChiDao = (e) => {
        e.preventDefault();
        if (this.chiDao.value()) {
            const { shcc } = this.state;
            const newChiDao = {
                canBo: shcc,
                chiDao: this.chiDao.value(),
                thoiGian: new Date().getTime(),
                congVan: this.state.id,
            };
            this.setState({
                'newChiDao': [...this.state.newChiDao, newChiDao],
                chiDao: [...this.state.chiDao, {
                    ...newChiDao,
                    chucVu: this.state.chucVu,
                    ho: this.state.user.lastName,
                    ten: this.state.user.firstName,
                }]
            }, () => this.chiDao?.value(''));
        }
    }

    render() {
        const permission = this.getUserPermission('hcthCongVanDen', ['read', 'write', 'delete']),
            dmDonViGuiCvPermission = this.getUserPermission('dmDonViGuiCv', ['read', 'write', 'delete']),
            // presidentPermission = this.getUserPermission('president', ['login']),
            readOnly = !permission.write;
        let { quyenChiDao } = this.props.hcthCongVanDen && this.props.hcthCongVanDen.item ? this.props.hcthCongVanDen.item : { quyenChiDao: '' },
            { shcc } = this.props.system && this.props.system.user ? this.props.system.user : { shcc: '' },
            danhSachCanBoChiDao = quyenChiDao.split(','),
            canChiDao = danhSachCanBoChiDao.includes(shcc) || permission.write,
            isNew = !this.state.id;


        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn đến',
            breadcrumb: [
                <Link key={0} to='/user/hcth'>Hành chính tổng hợp</Link>,
                <Link key={1} to='/user/hcth/cong-van-den'>Danh sách Công văn đến</Link>,
                isNew ? 'Tạo mới' : 'Cập nhật'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>{!this.state.id ? 'Tạo mới công văn đến' : 'Cập nhật công văn đến'}</h3>
                    <div className='tile-body row'>
                        <FormTextBox type='text' className='col-md-4' ref={e => this.soCongVan = e} label='Mã số CV' readOnly={readOnly} />
                        <FormSelect className='col-md-8' ref={e => this.donViGui = e} label={(<>
                            Đơn vị gửi công văn
                            {!readOnly && <>
                                (
                                <Link to='#' onClick={() => this.modal.show(null)}>Nhấn vào đây để thêm</Link>
                                )
                            </>
                            }
                        </>)} data={SelectAdapter_DmDonViGuiCongVan} placeholder='Đơn vị gửi công văn' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayCongVan = e} label='Ngày CV' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayNhan = e} label='Ngày nhận' readOnly={readOnly} required />
                        <FormDatePicker type='date-mask' className='col-md-4' ref={e => this.ngayHetHan = e} label='Ngày hết hạn' readOnly={readOnly} />
                        <FormRichTextBox type='text' className='col-md-12' ref={e => this.trichYeu = e} label='Trích yếu' readOnly={readOnly} required />
                        <FormSelect multiple={true} className='col-md-12' ref={e => this.donViNhan = e} label='Đơn vị nhận công văn' data={SelectAdapter_DmDonVi} readOnly={readOnly} />
                        <FormSelect multiple={true} className='col-md-12' ref={e => this.canBoNhan = e} label='Cán bộ nhận công văn' data={SelectAdapter_FwCanBo} readOnly={readOnly} />
                        <FormSelect multiple={true} className='col-md-12' ref={e => this.quyenChiDao = e} label='Cán bộ chỉ đạo' data={SelectAdapter_BanGiamHieu} readOnly={readOnly} />
                    </div>
                </div>
                <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Chỉ đạo</h3>
                        <div className='tile-body row'>
                            <div className='col-md-12'>
                                {
                                    this.renderComment(this.state.chiDao)
                                }
                            </div>
                            {
                                canChiDao && (<>

                                    <FormRichTextBox type='text' className='col-md-12' ref={e => this.chiDao = e} label='Thêm chỉ đạo' readOnly={readOnly && !canChiDao} />
                                    <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <button type='submit' className='btn btn-primary' onClick={this.onCreateChiDao}>
                                            Thêm
                                        </button>
                                    </div>
                                </>)
                            }
                        </div>
                    </div>
                </div>
                <div className='tile'>
                    <div className='form-group'>
                        <h3 className='tile-title'>Danh sách công văn</h3>
                        <div className='tile-body row'>
                            <div className={'form-group' + readOnly ? 'col-md-8' : 'col-md-12'}>
                                {this.tableListFile(this.state.listFile, this.state.id, permission)}
                            </div>
                            {!readOnly && <FormFileBox className='col-md-4' ref={e => this.fileBox = e} label='Tải lên tập tin công văn' postUrl='/user/upload' uploadType='hcthCongVanDenFile' userData='hcthCongVanDenFile' style={{ width: '100%', backgroundColor: '#fdfdfd' }} onSuccess={this.onSuccess} />}
                        </div>
                    </div>
                </div>
                <EditModal ref={e => this.modal = e}
                    permissions={dmDonViGuiCvPermission}
                    create={this.onCreateDonviGui}
                />
            </>,
            backRoute: '/user/hcth/cong-van-den',
            onSave: (permission && permission.write) || canChiDao ? this.save : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanDen: state.hcth.hcthCongVanDen });
const mapActionsToProps = {
    getHcthCongVanDenAll,
    getHcthCongVanDenPage,
    createHcthCongVanDen,
    updateHcthCongVanDen,
    deleteHcthCongVanDen,
    getHcthCongVanDenSearchPage,
    getCongVanDen,
    deleteFile,
    createDmDonViGuiCv
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);