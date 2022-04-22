import React from 'react';
import { connect } from 'react-redux';
import { createMultiDtChuongTrinhDaoTao, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, getDtChuongTrinhDaoTao, getDtKhungDaoTao, deleteMultiDtChuongTrinhDaoTao } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormRichTextBox, FormSelect, FormTabs, FormTextBox } from 'view/component/AdminPage';
import ComponentKienThuc from './componentKienThuc';
import { SelectAdapter_DtNganhDaoTaoMa } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import Loading from 'view/component/Loading';


class DtChuongTrinhDaoTaoDetails extends AdminPage {
    state = { isLoading: true }

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/chuong-trinh-dao-tao/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const id = query.get('id');
            if (this.ma !== 'new') {
                this.getData(this.ma);
            } else {
                if (id > 0) {
                    this.getData(id, true);
                    return;
                }
                const maKhoa = this.props.system.user.staff ? this.props.system.user.staff.maDonVi : '';
                this.khoa.value(maKhoa == 33 ? '' : maKhoa);
                [this.kienThucDaiCuong, this.kienThucCoSoNganh, this.kienThucChuyenNganh, this.kienThucBoTro, this.kienThucLVTN].forEach(e => e.setVal([], maKhoa));
            }
        });
    }

    getData = (id, isClone = false) => {
        this.props.getDtKhungDaoTao(id, (data) => {
            this.khoa.value(data.maKhoa);
            this.namDaoTao.value(!isClone ? data.namDaoTao : parseInt(data.namDaoTao) + 1);
            this.maNganh.value(data.maNganh);
            this.tenNganhVi.value(T.parse(data.tenNganh).vi || '');
            this.tenNganhEn.value(T.parse(data.tenNganh).en || '');
            this.trinhDoDaoTao.value(data.trinhDoDaoTao);
            this.loaiHinhDaoTao.value(data.loaiHinhDaoTao);
            this.thoiGianDaoTao.value(data.thoiGianDaoTao || '');
            this.tenVanBangVi.value(T.parse(data.tenVanBang).vi || '');
            this.tenVanBangEn.value(T.parse(data.tenVanBang).en || '');
            this.mucTieuChung.value(data.mucTieuChung);

            let mucTieuCuThe = T.parse(data.mucTieuCuThe || '{}');
            this.mucTieuCuThe1.value(mucTieuCuThe[1] || '');
            this.mucTieuCuThe2.value(mucTieuCuThe[2] || '');
            this.mucTieuCuThe3.value(mucTieuCuThe[3] || '');
            this.mucTieuCuThe4.value(mucTieuCuThe[4] || '');
            this.props.getDtChuongTrinhDaoTao(id, (ctdt) => {
                //TODO: Group SQL
                [this.kienThucDaiCuong, this.kienThucCoSoNganh, this.kienThucChuyenNganh, this.kienThucBoTro, this.kienThucLVTN].forEach(e => e.setVal(ctdt, data.maKhoa));
            });
        });
    }

    validation = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    getValue = () => {
        try {
            let data = {
                maNganh: this.validation(this.maNganh),
                tenNganhVi: this.validation(this.tenNganhVi),
                tenNganhEn: this.validation(this.tenNganhEn),
                tenNganh: T.stringify({ vi: this.tenNganhVi.value(), en: this.tenNganhEn.value() }),
                namDaoTao: this.validation(this.namDaoTao),
                trinhDoDaoTao: this.validation(this.trinhDoDaoTao),
                loaiHinhDaoTao: this.validation(this.loaiHinhDaoTao),
                thoiGianDaoTao: this.validation(this.thoiGianDaoTao),
                tenVanBangVi: this.validation(this.tenVanBangVi),
                tenVanBangEn: this.validation(this.tenVanBangEn),
                tenVanBang: T.stringify({ vi: this.tenVanBangVi.value(), en: this.tenVanBangEn.value() }),
                maKhoa: this.validation(this.khoa),
                mucTieuChung: this.validation(this.mucTieuChung),
                mucTieu1: this.validation(this.mucTieuCuThe1),
                mucTieu2: this.validation(this.mucTieuCuThe2),
                mucTieu3: this.validation(this.mucTieuCuThe3),
                mucTieu4: this.validation(this.mucTieuCuThe4),
                mucTieuCuThe: T.stringify({ 1: this.mucTieuCuThe1.value(), 2: this.mucTieuCuThe2.value(), 3: this.mucTieuCuThe3.value(), 4: this.mucTieuCuThe4.value() })
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    save = () => {
        let data = this.getValue();
        if (data) {
            const kienThucDaiCuong = this.kienThucDaiCuong.getValue() || { updateDatas: [], deleteDatas: [] };
            const kienThucCoSoNganh = this.kienThucCoSoNganh.getValue() || { updateDatas: [], deleteDatas: [] };
            const kienThucChuyenNganh = this.kienThucChuyenNganh.getValue() || { updateDatas: [], deleteDatas: [] };
            const kienThucBoTro = this.kienThucBoTro.getValue() || { updateDatas: [], deleteDatas: [] };
            const kienThucLVTN = this.kienThucLVTN.getValue() || { updateDatas: [], deleteDatas: [] };
            const updateItems = [
                ...kienThucDaiCuong.updateDatas,
                ...kienThucCoSoNganh.updateDatas,
                ...kienThucChuyenNganh.updateDatas,
                ...kienThucBoTro.updateDatas,
                ...kienThucLVTN.updateDatas
            ];
            // const deleteItems = [
            //     ...kienThucDaiCuong.deleteDatas,
            //     ...kienThucCoSoNganh.deleteDatas,
            //     ...kienThucChuyenNganh.deleteDatas,
            //     ...kienThucBoTro.deleteDatas,
            //     ...kienThucLVTN.deleteDatas
            // ];
            const updateDatas = { items: updateItems, ...{ id: this.ma, data } };
            // const deleteDatas = { items: deleteItems };
            this.ma == 'new' ? this.props.createDtChuongTrinhDaoTao(updateDatas, (item) => {
                location.replace('/new', `/${item.id}`);
                location.reload();
            }) : this.props.updateDtChuongTrinhDaoTao(this.ma, updateDatas, () => {
                // location.reload();
            });
            // this.props.deleteMultiDtChuongTrinhDaoTao(deleteDatas, () => { });
        }
    }
    render() {
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        const readOnly = !(permission.write || permission.manage),
            isPhongDaoTao = permission.write;

        return this.renderPage({
            icon: 'fa fa-university',
            title: this.ma !== 'new' ? 'Chỉnh sửa chương trình đào tạo' : 'Tạo mới chương trình đào tạo',
            subTitle: <span style={{ color: 'red' }}>Lưu ý: Các mục đánh dấu * là bắt buộc</span>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                <Link key={1} to='/user/chuong-trinh-dao-tao'>Chương trình đào tạo</Link>,
                this.ma !== 'new' ? 'Chỉnh sửa' : 'Tạo mới',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='tile'>
                    <h3 className='tile-title'>1. Thông tin chung về chương trình đào tạo</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='row col-12' style={{ display: 'flex', alignItems: 'end' }}>
                                <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoMa} label='Mã ngành' className='col-md-4' onChange={value => {
                                    this.tenNganhVi.value(value.name);
                                    this.setState({ tenNganhVi: value.name });
                                }} required />
                                <div style={{ marginBottom: '0' }} className='form-group col-md-8'>
                                    <FormTabs tabs={[
                                        {
                                            title: <>Tên ngành tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                                            component: <FormTextBox ref={e => this.tenNganhVi = e} placeholder='Tên ngành (tiếng Việt)' required />
                                        },
                                        {
                                            title: <>Tên ngành tiếng Anh  <span style={{ color: 'red' }}>*</span></>,
                                            component: <FormTextBox ref={e => this.tenNganhEn = e} placeholder='Tên ngành (tiếng Anh)' required />
                                        }
                                    ]} />
                                </div>
                            </div>

                            <FormTextBox ref={e => this.namDaoTao = e} label='Năm đào tạo' className='col-md-3' required readOnly={readOnly} />

                            <FormSelect ref={e => this.trinhDoDaoTao = e} label='Trình độ đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-3' required readOnly={readOnly} />
                            <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTao} className='col-md-3' required readOnly={readOnly} />
                            <FormTextBox type='number' suffix=' năm' step={0.5} ref={e => this.thoiGianDaoTao = e} label='Thời gian đào tạo' className='col-md-3' required readOnly={readOnly} />
                            <div className='form-group col-md-12'>
                                <label>Tên văn bằng sau khi tốt nghiệp: </label>
                                <FormTabs tabs={[
                                    {
                                        title: <>Tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                                        component: <FormTextBox ref={e => this.tenVanBangVi = e} placeholder='Tên văn bằng (tiếng Việt)' />
                                    },
                                    {
                                        title: <>Tiếng Anh  <span style={{ color: 'red' }}>*</span></>,
                                        component: <FormTextBox ref={e => this.tenVanBangEn = e} placeholder='Tên văn bằng (tiếng Anh)' />
                                    }
                                ]} />
                            </div>
                            <FormSelect ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Nơi đào tạo' className='col-12' readOnly={!isPhongDaoTao} />
                        </div>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>2. Mục tiêu đào tạo</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <h4 className='form-group col-12'>2.1. Mục tiêu chung <span style={{ color: 'red' }}>*</span></h4>
                            <FormRichTextBox ref={e => this.mucTieuChung = e} placeholder='Mục tiêu chung' className='form-group col-12' rows={5} required />
                            <h4 className='form-group col-12'>2.1. Mục tiêu cụ thể</h4>
                            <p className='form-group col-12'>Sinh viên tốt nghiệp ngành {this.state.tenNganhVi || ''} có các kiến thức, kỹ năng và năng lực nghề nghiệp như sau:</p>

                            {/*TODO: DT_MUC_TIEU_DAO_DAO*/}
                            <FormRichTextBox ref={e => this.mucTieuCuThe1 = e} label={<b><i>1. Kiến thức và lập luận ngành</i></b>} placeholder='Kiến thức và lập luận ngành' className='form-group col-12' required />
                            <FormRichTextBox ref={e => this.mucTieuCuThe2 = e} label={<b><i>2. Kỹ năng, phẩm chất cá nhân và nghề nghiệp</i></b>} placeholder='Kỹ năng, phẩm chất cá nhân và nghề nghiệp' className='form-group col-12' required />
                            <FormRichTextBox ref={e => this.mucTieuCuThe3 = e} label={<b><i>3. Kỹ năng làm việc nhóm và giao tiếp</i></b>} placeholder='Kỹ năng làm việc nhóm và giao tiếp' className='form-group col-12' required />
                            <FormRichTextBox ref={e => this.mucTieuCuThe4 = e} label={<b><i>4. Năng lực thực hành nghề nghiệp</i></b>} placeholder='Năng lực thực hành nghề nghiệp' className='form-group col-12' required />
                        </div>
                    </div>
                </div>

                <ComponentKienThuc title={'Kiến thức giáo dục đại cương'} khoiKienThucId={1} ref={e => this.kienThucDaiCuong = e} />
                <ComponentKienThuc title={'Kiến thức cơ sở ngành'} khoiKienThucId={9} ref={e => this.kienThucCoSoNganh = e} />
                <ComponentKienThuc title={'Kiến thức chuyên ngành'} khoiKienThucId={10} ref={e => this.kienThucChuyenNganh = e} />
                <ComponentKienThuc title={'Kiến thức bổ trợ'} khoiKienThucId={33} ref={e => this.kienThucBoTro = e} />
                <ComponentKienThuc title={'Thực tập, khóa luận/luận văn tốt nghiệp'} khoiKienThucId={11} ref={e => this.kienThucLVTN = e} />

            </>,
            backRoute: '/user/dao-tao/chuong-trinh-dao-tao',
            onSave: permission.write || permission.manage ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { createMultiDtChuongTrinhDaoTao, getDtChuongTrinhDaoTao, getDtKhungDaoTao, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, deleteMultiDtChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoDetails);