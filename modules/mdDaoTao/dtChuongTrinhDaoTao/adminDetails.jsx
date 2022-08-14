import React from 'react';
import { connect } from 'react-redux';
import { createMultiDtChuongTrinhDaoTao, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, getDtChuongTrinhDaoTao, getDtKhungDaoTao, deleteMultiDtChuongTrinhDaoTao, downloadWord } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, CirclePageButton, FormSelect, FormTabs, FormTextBox } from 'view/component/AdminPage';
import ComponentKienThuc from './componentKienThuc';
import { SelectAdapter_DtNganhDaoTaoMa } from '../dtNganhDaoTao/redux';
import { SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import { SelectAdapter_DmSvLoaiHinhDaoTaoFilter } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';
import Loading from 'view/component/Loading';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import T from 'view/js/common';
import { SelectAdapter_DtDanhSachChuyenNganh } from '../dtDanhSachChuyenNganh/redux';
import { SelectAdapter_DtDmThoiGianDaoTaoAll } from '../dtDmThoiGianDaoTao/redux';



class DtChuongTrinhDaoTaoDetails extends AdminPage {
    state = {
        isLoading: true,
        // mucTieuDaoTao: {},
        chuongTrinhDaoTao: {}
    };
    mucTieu = {};
    chuongTrinh = {};
    listMonHocChosen = []

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            const route = T.routeMatcher('/user/dao-tao/chuong-trinh-dao-tao/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const id = query.get('id');
            const khoaDt = query.get('khoaDt');
            if (this.ma !== 'new') {
                this.getData(this.ma);
            } else {
                if (id >= 0 && khoaDt >= 0) {
                    this.getData(id, true, khoaDt);
                    return;
                }
                this.maKhoa = this.props.system.user.staff ? this.props.system.user.staff.maDonVi : '';
                this.khoa.value(this.maKhoa == 33 ? '' : this.maKhoa);
            }
        });
    }

    pushMonHocChosen = (maMonHoc) => {
        if (maMonHoc) {
            if (this.listMonHocChosen.includes(maMonHoc)) {
                T.notify(`Trùng môn học <b>${maMonHoc}<b/>, vui lòng chọn môn học khác`, 'danger');
                return false;
            } else {
                this.listMonHocChosen.push(maMonHoc);
                return true;
            }
        }
        return false;
    }

    removeMonHoc = (maMonHoc) => {
        if (maMonHoc) this.listMonHocChosen = this.listMonHocChosen.filter(item => item != maMonHoc);
    }

    getData = (id, isClone = false, khoaDt) => {
        this.trinhDoDaoTao.value('DH');
        id && this.props.getDtKhungDaoTao(id, (data) => {
            this.khoa.value(data.maKhoa);
            this.maNganh.value(data.maNganh);
            this.setState({ chuyenNganh: data?.chuyenNganh || '' });
            this.chuyenNganh.value(data.chuyenNganh);
            this.setState({ maNganh: data.maNganh });
            this.tenNganhVi.value(T.parse(data.tenNganh).vi || '');
            this.tenNganhEn.value(T.parse(data.tenNganh).en || '');
            this.loaiHinhDaoTao.value(data.loaiHinhDaoTao);
            this.thoiGianDaoTao.value(data.thoiGianDaoTao || '');
            this.tenVanBangVi.value(T.parse(data.tenVanBang).vi || '');
            this.tenVanBangEn.value(T.parse(data.tenVanBang).en || '');
            const mucTieu = T.parse(data.mucTieu || '{}');
            this.khoaDt = !isClone ? data.namDaoTao : khoaDt;
            this.props.getDtChuongTrinhDaoTao(id, (ctdt) => {
                SelectAdapter_DtCauTrucKhungDaoTao.fetchOne(this.khoaDt, (rs) => {
                    this.setNamDaoTao(rs, mucTieu, ctdt);
                    this.namDaoTao.value(rs.id);
                });
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
            const mucTieu =
                Object.keys(this.mucTieu).map(key => {
                    return { id: key, value: this.mucTieu[key]?.value() };
                });
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
                mucTieu: T.stringify(mucTieu),
                chuyenNganh: this.validation(this.chuyenNganh)
            };
            return data;
        } catch (selector) {
            selector.focus();
            T.notify('<b>' + (selector.props.placeholder || selector.props.label || 'Dữ liệu') + '</b> bị trống!', 'danger');
            return false;
        }
    }

    handleNganh = (value) => {
        this.tenNganhVi.value(value.name);
        this.khoa.value(value.khoa);
        this.tenVanBangVi.value('Cử nhân ' + value.name);
        this.setState({ tenNganhVi: value.name, maNganh: value?.id || null }, () => {
            this.chuyenNganh.value('');
            this.chuyenNganh.focus();
        });
    }

    save = () => {
        let data = this.getValue();
        if (data) {
            const kienThucs =
                Object.keys(this.chuongTrinh).map(key => {
                    return (this.chuongTrinh[key]?.getValue() || { updateDatas: [], deleteDatas: [] })?.updateDatas;
                });
            let updateItems = [];
            kienThucs.forEach(kienThuc => {
                updateItems = [...updateItems, ...kienThuc];
            });
            const updateDatas = { items: updateItems, ...{ id: this.ma, data } };
            this.ma == 'new' ? (updateItems.length && this.props.createDtChuongTrinhDaoTao(updateDatas, (item) => {
                window.location = `/user/dao-tao/chuong-trinh-dao-tao/${item.id}`;
            })) : (updateItems.length && this.props.updateDtChuongTrinhDaoTao(this.ma, updateDatas, () => {
            }));
        }
    }

    setNamDaoTao = (value, mucTieu, ctdt) => {
        const { data, id } = value;
        this.khoaDt = id;
        const mucCha = T.parse(data.mucCha, {
            // mucTieuDaoTao: {},
            chuongTrinhDaoTao: {}
        });
        const mucCon = T.parse(data.mucCon, {
            // mucTieuDaoTao: {},
            chuongTrinhDaoTao: {}
        });
        this.setState({
            namHoc: value.id,
            // mucTieuDaoTao: { parents: mucCha.mucTieuDaoTao, childs: mucCon.mucTieuDaoTao },
            chuongTrinhDaoTao: { parents: mucCha.chuongTrinhDaoTao, childs: mucCon.chuongTrinhDaoTao }
        }, () => {
            !ctdt && this.chuyenNganh.value('');
            !ctdt && this.maNganh.focus();
            Object.keys(this.chuongTrinh).forEach(key => {
                const childs = mucCon.chuongTrinhDaoTao[key] || null;
                const data = ctdt?.filter(item => item.maKhoiKienThuc === parseInt(mucCha.chuongTrinhDaoTao[key].id));
                this.chuongTrinh[key]?.setVal(data, this.maKhoa, childs);
            });
            mucTieu?.forEach(mt => {
                this.mucTieu[mt.id]?.value(mt.value);
            });
        });
    }

    downloadWord = (e) => {
        e.preventDefault();
        if (!this.ma) return;
        const namDaoTao = this.validation(this.namDaoTao);
        const maNganh = this.validation(this.maNganh);
        const chuyenNganh = this.chuyenNganh.data()?.text || '';
        SelectAdapter_DtCauTrucKhungDaoTao.fetchOne(namDaoTao, res => {
            const { text: textNamDaoTao } = res;
            this.props.downloadWord(this.ma, data => {
                T.FileSaver(new Blob([new Uint8Array(data.data)]), textNamDaoTao + '_' + maNganh + '_' + chuyenNganh + '.docx');
            });
        });

    }

    render() {
        const permission = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        const readOnly = !(permission.write || permission.manage),
            isPhongDaoTao = permission.write;

        const {
            // mucTieuDaoTao,
            chuongTrinhDaoTao } = this.state;
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
                            <FormSelect ref={e => this.namDaoTao = e} label='Năm học' data={SelectAdapter_DtCauTrucKhungDaoTao} className='col-md-4' required readOnly={readOnly} onChange={value => this.setNamDaoTao(value)} />

                            <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DtNganhDaoTaoMa} label='Mã ngành' className='col-md-4' onChange={this.handleNganh} required />
                            <FormSelect ref={e => this.chuyenNganh = e} data={SelectAdapter_DtDanhSachChuyenNganh(this.state.maNganh, this.state.namHoc)} label='Chuyên ngành' className='col-md-4' onChange={value => this.setState({ chuyenNganh: value?.text || '' })} />
                            <div style={{ marginBottom: '0' }} className='form-group col-md-12'>
                                <FormTabs tabs={[
                                    {
                                        title: <>Tên ngành tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                                        component: <FormTextBox ref={e => this.tenNganhVi = e} placeholder='Tên ngành (tiếng Việt)' required />
                                    },
                                    {
                                        title: <>Tên ngành tiếng Anh</>,
                                        component: <FormTextBox ref={e => this.tenNganhEn = e} placeholder='Tên ngành (tiếng Anh)' />
                                    }
                                ]} />
                            </div>

                            <FormSelect ref={e => this.trinhDoDaoTao = e} label='Trình độ đào tạo' data={SelectAdapter_DmSvBacDaoTao} className='col-md-4' required readOnly />
                            <FormSelect ref={e => this.loaiHinhDaoTao = e} label='Loại hình đào tạo' data={SelectAdapter_DmSvLoaiHinhDaoTaoFilter} className='col-md-4' required readOnly={readOnly} />
                            <FormSelect data={SelectAdapter_DtDmThoiGianDaoTaoAll} ref={e => this.thoiGianDaoTao = e} label='Thời gian đào tạo' className='col-md-4' required readOnly={readOnly} />
                            <div className='form-group col-md-12'>
                                <label>Tên văn bằng sau khi tốt nghiệp: </label>
                                <FormTabs tabs={[
                                    {
                                        title: <>Tiếng Việt  <span style={{ color: 'red' }}>*</span></>,
                                        component: <FormTextBox ref={e => this.tenVanBangVi = e} placeholder='Tên văn bằng (tiếng Việt)' required />
                                    },
                                    {
                                        title: <>Tiếng Anh</>,
                                        component: <FormTextBox ref={e => this.tenVanBangEn = e} placeholder='Tên văn bằng (tiếng Anh)' />
                                    }
                                ]} />
                            </div>
                            <FormSelect ref={e => this.khoa = e} data={SelectAdapter_DmDonViFaculty_V2} label='Nơi đào tạo' className='col-12' readOnly={!isPhongDaoTao} />
                        </div>
                    </div>
                </div>

                {/* {mucTieuDaoTao && mucTieuDaoTao.parents &&
                    <div className='tile'>
                        <h3 className='tile-title'>2. Mục tiêu đào tạo</h3>
                        <div className='tile-body'>
                            <div className='row'>
                                {
                                    Object.keys(mucTieuDaoTao.parents).map((key) => {
                                        const childs = mucTieuDaoTao.childs;
                                        const pIdx = parseInt(key) + 1;
                                        return (
                                            <React.Fragment key={pIdx}>
                                                <h4 className='form-group col-12'>{`2.${pIdx}. ${mucTieuDaoTao.parents[key]} `}<span style={{ color: 'red' }}>*</span></h4>
                                                {
                                                    childs[key] ? childs[key].map((cItem, idx) => {
                                                        const { value } = cItem;
                                                        return (<FormRichTextBox key={`${key}_${idx}`} ref={e => this.mucTieu[`${key}_${idx}`] = e} label={<b><i>{`${idx + 1}. ${value}`}</i></b>} placeholder={value} className='form-group col-12' required />);
                                                    }) :
                                                        <FormRichTextBox ref={e => this.mucTieu[key] = e} placeholder='Mục tiêu chung' className='form-group col-12' rows={5} required />
                                                }
                                            </React.Fragment>);
                                    })
                                }
                            </div>
                        </div>
                    </div>
                } */}
                {
                    chuongTrinhDaoTao && chuongTrinhDaoTao.parents && Object.keys(chuongTrinhDaoTao.parents).map((key) => {
                        const childs = chuongTrinhDaoTao.childs;
                        const pIdx = `${this.khoaDt}_${key}`;
                        const { id, text } = chuongTrinhDaoTao.parents[key];
                        return (
                            <ComponentKienThuc key={pIdx} title={text} khoiKienThucId={id} childs={childs[key]} ref={e => this.chuongTrinh[key] = e} pushMonHocChosen={this.pushMonHocChosen} removeMonHoc={this.removeMonHoc} />
                        );
                    })
                }
                {this.ma && <CirclePageButton type='custom' tooltip='Tải về chương trình đào tạo' customIcon='fa-file-word-o' customClassName='btn-warning' style={{ marginRight: '60px' }} onClick={(e) => this.downloadWord(e)} />}
            </>,
            backRoute: '/user/dao-tao/chuong-trinh-dao-tao',
            onSave: permission.write || permission.manage ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { createMultiDtChuongTrinhDaoTao, getDtChuongTrinhDaoTao, getDtKhungDaoTao, createDtChuongTrinhDaoTao, updateDtChuongTrinhDaoTao, deleteMultiDtChuongTrinhDaoTao, downloadWord };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoDetails);