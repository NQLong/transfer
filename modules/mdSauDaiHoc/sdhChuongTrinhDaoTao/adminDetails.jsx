import React from 'react';
import { connect } from 'react-redux';
import { createMultiSdhChuongTrinhDaoTao, createSdhChuongTrinhDaoTao, updateSdhChuongTrinhDaoTao, getSdhChuongTrinhDaoTao, getSdhKhungDaoTao, deleteMultiSdhChuongTrinhDaoTao, downloadWord } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, CirclePageButton, FormSelect, FormTabs, FormTextBox } from 'view/component/AdminPage';
import ComponentKienThuc from './componentKienThuc';
import { SelectAdapter_DmNganhSdh } from '../dmNganhSauDaiHoc/redux';
import { SelectAdapter_DmSvBacDaoTao } from 'modules/mdDanhMuc/dmSvBacDaoTao/redux';
import Loading from 'view/component/Loading';
import { SelectAdapter_SdhCauTrucKhungDaoTao } from '../sdhCauTrucKhungDaoTao/redux';
import T from 'view/js/common';
import { SelectAdapter_DmHocSdhVer2 } from 'modules/mdDanhMuc/dmHocSdh/redux';
import { SelectAdapter_DmKhoaSdh } from 'modules/mdDanhMuc/dmKhoaSauDaiHoc/redux';
// import ComponentKT from './ComponentKT';


class SdhChuongTrinhDaoTaoDetails extends AdminPage {
    state = {
        isLoading: true,
        // mucTieuDaoTao: {},
        chuongTrinhDaoTao: {}
    };
    mucTieu = {};
    chuongTrinh = {};
    listMonHocChosen = []

    componentDidMount() {
        T.ready('/user/sau-dai-hoc/chuong-trinh-dao-tao', () => {
            const route = T.routeMatcher('/user/sau-dai-hoc/chuong-trinh-dao-tao/:ma');
            this.ma = route.parse(window.location.pathname)?.ma;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const id = query.get('id');
            const khoaSdh = query.get('khoaSdh');
            if (this.ma !== 'new') {
                this.getData(this.ma);
            } else {
                if (id >= 0 && khoaSdh >= 0) {
                    this.getData(id, true, khoaSdh);
                    return;
                }
                this.maKhoa = this.props.system.user.staff ? this.props.system.user.staff.maDonVi : '';
                this.khoa.value(this.maKhoa == 37 ? '' : this.maKhoa);
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

    getData = (id, isClone = false, khoaSdh) => {
        this.trinhDoDaoTao.value('SDH');
        id && this.props.getSdhKhungDaoTao(id, (data) => {
            this.khoa.value(data.maKhoa);
            this.maNganh.value(data.maNganh);
            // this.setState({ chuyenNganh: data?.chuyenNganh || '' });
            // this.chuyenNganh.value(data.chuyenNganh);
            this.setState({ maNganh: data.maNganh });
            this.tenNganhVi.value(T.parse(data.tenNganh).vi || '');
            this.tenNganhEn.value(T.parse(data.tenNganh).en || '');
            this.bacDaoTao.value(data.bacDaoTao);
            this.thoiGianDaoTao.value(data.thoiGianDaoTao || '');
            this.tenVanBangVi.value(T.parse(data.tenVanBang).vi || '');
            this.tenVanBangEn.value(T.parse(data.tenVanBang).en || '');
            const mucTieu = T.parse(data.mucTieu || '{}');
            this.khoaSdh = !isClone ? data.namDaoTao : khoaSdh;
            this.props.getSdhChuongTrinhDaoTao(id, (ctsdh) => {
                SelectAdapter_SdhCauTrucKhungDaoTao.fetchOne(this.khoaSdh, (rs) => {
                    this.setNamDaoTao(rs, mucTieu, ctsdh);
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
                bacDaoTao: this.validation(this.bacDaoTao),
                thoiGianDaoTao: this.validation(this.thoiGianDaoTao),
                tenVanBangVi: this.validation(this.tenVanBangVi),
                tenVanBangEn: this.validation(this.tenVanBangEn),
                tenVanBang: T.stringify({ vi: this.tenVanBangVi.value(), en: this.tenVanBangEn.value() }),
                maKhoa: this.validation(this.khoa),
                mucTieu: T.stringify(mucTieu),
                // chuyenNganh: this.validation(this.chuyenNganh)
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
            this.ma == 'new' ? (updateItems.length && this.props.createSdhChuongTrinhDaoTao(updateDatas, (item) => {
                window.location = `/user/sau-dai-hoc/chuong-trinh-dao-tao/${item.id}`;
            })) : (updateItems.length && this.props.updateSdhChuongTrinhDaoTao(this.ma, updateDatas, () => {
            }));
        }
    }

    setNamDaoTao = (value, mucTieu, ctsdh) => {
        const { data, id } = value;
        this.khoaSdh = id;
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
            // !ctsdh && this.chuyenNganh.value('');
            !ctsdh && this.maNganh.focus();
            Object.keys(this.chuongTrinh).forEach(key => {
                const childs = mucCon.chuongTrinhDaoTao[key] || null;
                const data = ctsdh?.filter(item => item.maKhoiKienThuc === parseInt(mucCha.chuongTrinhDaoTao[key].id));
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
        // const chuyenNganh = this.chuyenNganh.data()?.text || '';
        SelectAdapter_SdhCauTrucKhungDaoTao.fetchOne(namDaoTao, res => {
            const { text: textNamDaoTao } = res;
            this.props.downloadWord(this.ma, data => {
                T.FileSaver(new Blob([new Uint8Array(data.data)]), textNamDaoTao + '_' + maNganh + '.docx');
            });
        });

    }

    render() {
        const permission = this.getUserPermission('sdhChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        const readOnly = !(permission.write || permission.manage),
            isSdh = permission.write;

        const {
            // mucTieuDaoTao,
            chuongTrinhDaoTao } = this.state;
        return this.renderPage({
            icon: 'fa fa-university',
            title: this.ma !== 'new' ? 'Chỉnh sửa chương trình đào tạo' : 'Tạo mới chương trình đào tạo',
            subTitle: <span style={{ color: 'red' }}>Lưu ý: Các mục đánh dấu * là bắt buộc</span>,
            breadcrumb: [
                <Link key={1} to='/user/sau-dai-hoc/chuong-trinh-dao-tao'>Chương trình đào tạo</Link>,
                this.ma !== 'new' ? 'Chỉnh sửa' : 'Tạo mới',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='tile'>
                    <h3 className='tile-title'>1. Thông tin chung về chương trình đào tạo</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormSelect ref={e => this.namDaoTao = e} label='Năm học' data={SelectAdapter_SdhCauTrucKhungDaoTao} className='col-md-6' required readOnly={readOnly} onChange={value => this.setNamDaoTao(value)} />

                            <FormSelect ref={e => this.maNganh = e} data={SelectAdapter_DmNganhSdh()} label='Mã ngành' className='col-md-6' onChange={this.handleNganh} required />
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
                            <FormSelect ref={e => this.bacDaoTao = e} label='Bậc đào tạo' data={SelectAdapter_DmHocSdhVer2} className='col-md-4' required readOnly={readOnly} />
                            <FormSelect data={[
                                { id: 4, text: '4 năm' },
                                { id: 3.5, text: '3,5 năm' }
                            ]} ref={e => this.thoiGianDaoTao = e} label='Thời gian đào tạo' className='col-md-4' required readOnly={readOnly} />
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
                            <FormSelect ref={e => this.khoa = e} data={SelectAdapter_DmKhoaSdh} label='Nơi đào tạo' className='col-12' readOnly={!isSdh} />
                        </div>
                    </div>
                </div>
                {
                    chuongTrinhDaoTao && chuongTrinhDaoTao.parents && Object.keys(chuongTrinhDaoTao.parents).map((key) => {
                        const childs = chuongTrinhDaoTao.childs;
                        const pIdx = `${this.khoaSdh}_${key}`;
                        const { id, text } = chuongTrinhDaoTao.parents[key];
                        return (
                            <ComponentKienThuc key={pIdx} title={text} khoiKienThucId={id} childs={childs[key]} ref={e => this.chuongTrinh[key] = e} pushMonHocChosen={this.pushMonHocChosen} removeMonHoc={this.removeMonHoc} />
                        );
                    })
                }
                {this.ma && <CirclePageButton type='custom' tooltip='Tải về chương trình đào tạo' customIcon='fa-file-word-o' customClassName='btn-warning' style={{ marginRight: '60px' }} onClick={(e) => this.downloadWord(e)} />}
            </>,
            backRoute: '/user/sau-dai-hoc/chuong-trinh-dao-tao',
            onSave: permission.write || permission.manage ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sdhChuongTrinhDaoTao: state.daoTao.sdhChuongTrinhDaoTao });
const mapActionsToProps = { createMultiSdhChuongTrinhDaoTao, getSdhChuongTrinhDaoTao, getSdhKhungDaoTao, createSdhChuongTrinhDaoTao, updateSdhChuongTrinhDaoTao, deleteMultiSdhChuongTrinhDaoTao, downloadWord };
export default connect(mapStateToProps, mapActionsToProps)(SdhChuongTrinhDaoTaoDetails);