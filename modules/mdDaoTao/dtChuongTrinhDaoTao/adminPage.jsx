import React from 'react';
import { connect } from 'react-redux';
import { getDtChuongTrinhDaoTaoPage, getDtChuongTrinhDaoTao, SelectAdapter_NamDaoTaoFilter } from './redux';
import { getDmDonViAll, SelectAdapter_DmDonViFaculty_V2 } from 'modules/mdDanhMuc/dmDonVi/redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { SelectAdapter_DtCauTrucKhungDaoTao } from '../dtCauTrucKhungDaoTao/redux';
import { Tooltip } from '@mui/material';
import { SelectAdapter_DmSvLoaiHinhDaoTao } from 'modules/mdDanhMuc/dmSvLoaiHinhDaoTao/redux';

class TreeModal extends AdminModal {
    state = { chuongTrinhDaoTaoCha: {}, chuongTrinhDaoTaoCon: {}, monHoc: [], isSemesterMode: false, mucConSwitch: {}, hocKySwitch: {} }
    hocKyDuKien = [1, 2, 3, 4, 5, 6, 7, 8];
    onShow = (item) => {
        const { idNamDaoTao, tenNganh, id, namDaoTao } = item;
        this.namDaoTao = namDaoTao;
        this.tenNganh = tenNganh;
        this.props.getDtChuongTrinhDaoTao(id, (ctdt) => {
            SelectAdapter_DtCauTrucKhungDaoTao.fetchOne(idNamDaoTao, (rs) => {
                const { data } = rs;
                const mucCha = T.parse(data.mucCha, { mucTieuDaoTao: {}, chuongTrinhDaoTao: {} });
                const mucCon = T.parse(data.mucCon, { mucTieuDaoTao: {}, chuongTrinhDaoTao: {} });
                const { chuongTrinhDaoTao: chuongTrinhDaoTaoCha } = mucCha;
                const { chuongTrinhDaoTao: chuongTrinhDaoTaoCon } = mucCon;

                const mucConSwitch = {};
                Object.values(chuongTrinhDaoTaoCha).forEach(value => {
                    const { id } = value;
                    mucConSwitch[id] = false;
                });

                const hocKySwitch = {};
                this.hocKyDuKien.map(index => {
                    hocKySwitch[index] = false;
                });
                this.setState({ monHoc: ctdt, chuongTrinhDaoTaoCha: chuongTrinhDaoTaoCha, chuongTrinhDaoTaoCon: chuongTrinhDaoTaoCon, mucConSwitch: mucConSwitch, hocKySwitch: hocKySwitch });
            });
        });
    };

    onChangeMucConSwitch = (id) => {
        const mucConSwitchState = { ...this.state.mucConSwitch };
        mucConSwitchState[id] = !mucConSwitchState[id];
        this.setState({ mucConSwitch: mucConSwitchState });
    }

    onChangeHocKySwitch = (index) => {
        const hocKySwitchState = { ...this.state.hocKySwitch };
        hocKySwitchState[index] = !hocKySwitchState[index];
        this.setState({ hocKySwitch: hocKySwitchState });
    }

    initLevelMonHoc = (tenMonHoc, hasLevel3 = true) => {
        return (
            <li>
                <p className={`${hasLevel3 ? 'level-4' : 'level-4-no-level-3'} rectangle`}>{tenMonHoc}</p>
            </li>
        );
    }

    initLevelMucCon = (text, idCha, idCon) => {
        const { monHoc } = this.state;
        const monHocByKey = monHoc.filter(mh => {
            return mh.maKhoiKienThucCon >= 0
                ? parseInt(mh.maKhoiKienThuc) === parseInt(idCha) && parseInt(mh.maKhoiKienThucCon) === parseInt(idCon)
                : parseInt(mh.maKhoiKienThuc) === parseInt(idCha);
        }) || [];
        return (
            <li>
                <p className={`${monHocByKey.length > 0 ? 'level-3' : 'level-3-no-level-4'} rectangle`}>{text}</p>
                <ol className={`${monHocByKey.length > 0 ? 'level-4-wrapper' : 'level-4-wrapper-no-child'}`}>
                    {monHocByKey.map((monHoc, idx) => {
                        const { tenMonHoc } = monHoc;
                        return (<React.Fragment key={idx}>
                            {this.initLevelMonHoc(tenMonHoc)}
                        </React.Fragment>);
                    })
                    }
                </ol>
            </li>
        );
    }

    initLevelMucCha = (ctdt, idCha, mucCon = {}) => {
        const { mucConSwitch } = this.state;
        const mucConLength = Object.keys(mucCon).length;
        const { monHoc } = this.state;
        const styleLevel3Wrapper = {
            gridTemplateColumns: `repeat(${mucConLength}, 1fr)`,
            '--level-3-wrapper-left': `${(100 - 2 * (mucConLength - 1)) / (mucConLength * 2)}%`,
            '--level-3-wrapper-width': `${100 - ((100 - 2 * (mucConLength - 1)) / mucConLength)}%`,
        };
        let monHocByKey = [];
        if (mucConLength <= 0) {
            monHocByKey = monHoc.filter(mh => {
                return parseInt(mh.maKhoiKienThuc) === parseInt(idCha);
            }) || [];
        }

        return (
            <li>
                <p style={{ cursor: 'pointer' }} className={`${mucConSwitch[idCha] && mucConLength > 0 ? 'level-2' : 'level-2-no-level-3'} rectangle`} onClick={() => this.onChangeMucConSwitch(idCha)}>{ctdt}</p>
                {mucConSwitch[idCha] &&
                    (mucConLength > 0 ?
                        (<ol className="level-3-wrapper" style={styleLevel3Wrapper}>
                            {
                                mucCon && Object.keys(mucCon).map((key, idx) => {
                                    const { value: { text }, id: idCon } = mucCon[key];
                                    return (<React.Fragment key={idx}>
                                        {this.initLevelMucCon(text, idCha, idCon)}
                                    </React.Fragment>
                                    );
                                })
                            }

                        </ol>) : (
                            <ol className={`${monHocByKey.length > 0 ? 'level-4-wrapper-no-level-3' : null}`}>
                                {monHocByKey.map((monHoc, idx) => {
                                    const { tenMonHoc } = monHoc;
                                    return (<React.Fragment key={idx}>
                                        {this.initLevelMonHoc(tenMonHoc, false)}
                                    </React.Fragment>);
                                })
                                }
                            </ol>
                        ))
                }

            </li>
        );
    }


    initLevel2 = (itemCha, key, hasNextRow = false) => {
        const { chuongTrinhDaoTaoCon } = this.state;
        const mucChaLength = Object.keys(itemCha).length;
        const left = (parseInt(key) - 1) > 0 ? 0 : (100 - 1 * (mucChaLength - 1)) / (2 * mucChaLength);
        const width = !hasNextRow ? (parseInt(key) - 1) > 0 ? 100 - 100 / (mucChaLength * 2) + (mucChaLength - 1) / (2 * mucChaLength) : 100 - ((100 - 1 * (mucChaLength - 1)) / mucChaLength) : 100 - left;
        const styleLevel2Wrapper = {
            gridTemplateColumns: `repeat(${mucChaLength}, 1fr)`,
            '--level-2-wrapper-left': `${left}%`,
            '--level-2-wrapper-width': `${width}%`,
            marginTop: `${(parseInt(key) - 1) === 0 ? 0 : 50}px`,
        };
        return (
            <ol className="level-2-wrapper" style={styleLevel2Wrapper} key={key}>
                {itemCha && Object.keys(itemCha).map((key, idx) => {
                    const { text: ctdt, id } = itemCha[key];
                    const mucCon = chuongTrinhDaoTaoCon[key];
                    return (<React.Fragment key={idx}>
                        {this.initLevelMucCha(ctdt, id, mucCon)}
                    </React.Fragment>
                    );
                })
                }
            </ol>
        );
    }

    initChuongTrinhDaoTao = () => {
        const { chuongTrinhDaoTaoCha } = this.state;
        let item = {};
        let row = 0;
        return (
            chuongTrinhDaoTaoCha && Object.keys(chuongTrinhDaoTaoCha).map((key, idx) => {
                item[key] = chuongTrinhDaoTaoCha[key];
                const isLast = idx === Object.keys(chuongTrinhDaoTaoCha).length - 1;
                if (Object.keys(item).length >= 3 || (Object.keys(item).length > 0 && isLast)) {
                    const temp = { ...item };
                    item = {};
                    row++;
                    return (this.initLevel2(temp, row, !isLast));
                }
            })
        );
    }

    initLevel2HocKy = (itemCha, key, hasNextRow = false) => {
        const { hocKySwitch } = this.state;
        const mucChaLength = Object.keys(itemCha).length;
        const left = (parseInt(key) - 1) > 0 ? 0 : (100 - 1 * (mucChaLength - 1)) / (2 * mucChaLength);
        const width = !hasNextRow ? (parseInt(key) - 1) > 0 ? 100 - 100 / (mucChaLength * 2) + (mucChaLength - 1) / (2 * mucChaLength) : 100 - ((100 - 1 * (mucChaLength - 1)) / mucChaLength) : 100 - left;
        const styleLevel2Wrapper = {
            gridTemplateColumns: `repeat(${mucChaLength}, 1fr)`,
            '--level-2-wrapper-left': `${left}%`,
            '--level-2-wrapper-width': `${width}%`,
            marginTop: `${(parseInt(key) - 1) === 0 ? 0 : 50}px`,
        };
        const { monHoc } = this.state;
        return (
            <ol className="level-2-wrapper" style={styleLevel2Wrapper} key={key}>
                {itemCha && Object.keys(itemCha).map((key) => {
                    const { text: ctdt, id } = itemCha[key];
                    const monHocByKey = monHoc.filter(mh => {
                        return parseInt(mh.hocKyDuKien) === parseInt(id);
                    }) || [];
                    return (<React.Fragment key={id}>
                        <li>
                            <p style={{ cursor: 'pointer' }} className='level-2-no-level-3 rectangle' onClick={() => this.onChangeHocKySwitch(id)}>{ctdt}</p>
                            {hocKySwitch[id] && (<ol className={`${monHocByKey.length > 0 ? 'level-4-wrapper-no-level-3' : null}`}>
                                {monHocByKey.map((monHoc, idx) => {
                                    const { tenMonHoc } = monHoc;
                                    return (<React.Fragment key={idx}>
                                        {this.initLevelMonHoc(tenMonHoc, false)}
                                    </React.Fragment>);
                                })
                                }
                            </ol>)
                            }
                        </li>
                    </React.Fragment>
                    );
                })
                }
            </ol>
        );
    }

    initHocKyDuKien = () => {
        let item = {};
        let row = 0;
        // const { monHoc } = this.state;

        return (
            this.hocKyDuKien.map((hk, idx) => {
                item[hk] = { text: `Học kỳ ${hk}`, id: hk };
                const isLast = idx === Object.keys(this.hocKyDuKien).length - 1;
                if (Object.keys(item).length >= 3 || (Object.keys(item).length > 0 && isLast)) {
                    const temp = { ...item };
                    item = {};
                    row++;
                    return (this.initLevel2HocKy(temp, row, !isLast));
                }
            })
        );
    }


    render = () => {
        // const readOnly = this.props.readOnly;
        // const isDaoTao = this.props.permission.write;
        return this.renderModal({
            title: `Chương trình năm học - ${this.namDaoTao}`,
            size: 'elarge',
            buttons:
                <div style={{ textAlign: 'center' }} className='toggle'>
                    <label style={{ marginRight: 10 }}>Xem theo học kỳ dự kiến</label>
                    <label>
                        <input type='checkbox' checked={this.state.isSemesterMode} onChange={() => { this.setState({ isSemesterMode: !this.state.isSemesterMode }); }} />
                        <span className='button-indecator' />
                    </label>
                </div>,
            body: <div className='row'>
                <div className="container organization-tree">
                    <p className="level-1 rectangle">{this.tenNganh}</p>
                    {!this.state.isSemesterMode ? this.initChuongTrinhDaoTao() : this.initHocKyDuKien()}
                </div>
            </div>

        });
    }
}

class CloneModal extends AdminModal {

    onShow = (item) => {
        this.id = item.id;
    };

    onSubmit = (e) => {
        e.preventDefault();
        const id = this.id;
        const khoaDt = this.namDaoTao.value();
        this.props.history.push(`/user/dao-tao/chuong-trinh-dao-tao/new?id=${id}&khoaDt=${khoaDt}`);
    };


    render = () => {
        return this.renderModal({
            title: 'Lựa chọn khoá đào tạo mới',
            submitText: 'Xác nhận',
            body: <div>
                <FormSelect ref={e => this.namDaoTao = e} label='Khóa đào tạo' data={SelectAdapter_DtCauTrucKhungDaoTao} required />
            </div>
        });
    }
}
class DtChuongTrinhDaoTaoPage extends AdminPage {
    state = { donViFilter: '', idNamDaoTao: '', heDaoTaoFilter: '' }
    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            T.clearSearchBox();
            this.setState({ donViFilter: this.props.system.user.staff?.maDonVi, idNamDaoTao: '', heDaoTaoFilter: '' });
            T.onSearch = (searchText) => this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                searchTerm: searchText || '',
            });
            T.showSearchBox(() => { });
            this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, { searchTerm: '' });

        });
    }

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa chương trình đào tạo', 'Bạn có chắc bạn muốn xóa chương trình đào tạo này?', true, isConfirm =>
            isConfirm && this.props.deleteDtChuongTrinhDaoTao(item.id));
    }

    render() {
        const permissionDaoTao = this.getUserPermission('dtChuongTrinhDaoTao', ['read', 'write', 'delete', 'manage']);
        let permission = {
            write: permissionDaoTao.write || permissionDaoTao.manage,
            delete: permissionDaoTao.delete || permissionDaoTao.manage
        };
        const permissionQuanLyDaoTao = this.getUserPermission('quanLyDaoTao', ['manager']);
        const { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dtChuongTrinhDaoTao && this.props.dtChuongTrinhDaoTao.page ?
            this.props.dtChuongTrinhDaoTao.page : {
                pageNumber: 1, pageSize: 200, pageTotal: 1, totalItem: 0, list: [], pageCondition: {
                    searchTerm: '', donViFilter: this.state.donViFilter, idNamDaoTao: this.state.idNamDaoTao, heDaoTaoFilter: this.state.heDaoTaoFilter
                }
            };

        let table = renderTable({
            emptyTable: 'Không có dữ liệu chương trình đào tạo',
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right', verticalAlign: 'middle' }}>STT</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Năm ĐT</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Mã ngành</th>
                    <th style={{ width: '100%', textAlign: 'center', whiteSpace: 'nowrap' }}>Tên ngành</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Trình độ</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Loại hình</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thời gian</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Khoa/Bộ môn</th>
                    <th style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.namDaoTao} />
                    <TableCell style={{ textAlign: 'center' }} content={item.maNganh} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<>{item.tenChuyenNganh ? <>{item.tenChuyenNganh} < br /> </> : ''} {item.tenNganh}</>} />
                    <TableCell style={{ textAlign: 'center' }} content={item.trinhDoDaoTao} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.loaiHinhDaoTao} />
                    <TableCell style={{ textAlign: 'center' }} content={item.thoiGianDaoTao + ' năm'} />
                    <TableCell content={item.tenKhoaBoMon} />
                    <TableCell style={{ textAlign: 'center' }} type='buttons' content={item} permission={permission}
                        onEdit={permission.write ? (e) => e.preventDefault() || this.props.history.push(`/user/dao-tao/chuong-trinh-dao-tao/${item.id}`) : null}
                    // onEdit={() => this.modal.show(item)}
                    // onClone={(e) => e.preventDefault() || this.props.history.push(`/user/dao-tao/chuong-trinh-dao-tao/new?id=${item.id}`)}
                    >
                        <Tooltip title='Xem cây chương trình' arrow placeholder='bottom' >
                            <a className='btn btn-info' href='#' onClick={e => e.preventDefault() || this.modal.show(item)}><i className='fa fa-lg fa-eye' /></a>
                        </Tooltip>
                        <Tooltip title='Sao chép' arrow>
                            <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.cloneModal.show(item)}>
                                <i className='fa fa-lg fa-clone ' />
                            </a>
                        </Tooltip>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Chương trình đào tạo',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Chương trình đào tạo'
            ],
            advanceSearch: permissionDaoTao.read && <div className='row'>
                <FormSelect className='col-md-4' placeholder='Năm đào tạo' onChange={value => {
                    T.clearSearchBox();
                    this.setState({ idNamDaoTao: value ? value.id : '' });
                    this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                        donViFilter: this.state.donViFilter,
                        heDaoTaoFilter: this.state.heDaoTaoFilter,
                        namDaoTao: value && value.id
                    });
                }} data={SelectAdapter_NamDaoTaoFilter} allowClear={true} />
                <FormSelect className='col-md-4' placeholder='Danh sách khoa/bộ môn' ref={e => this.donVi = e} onChange={value => {
                    T.clearSearchBox();
                    this.setState({ donViFilter: value ? value.id : '' });
                    this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                        donViFilter: value && value.id,
                        namDaoTao: this.state.idNamDaoTao,
                        heDaoTaoFilter: this.state.heDaoTaoFilter
                    });
                }} data={SelectAdapter_DmDonViFaculty_V2} allowClear={true} />
                {permissionQuanLyDaoTao.manager ? < FormSelect className='col-md-4' placeholder='Hệ đào tạo' ref={e => this.heDaoTao = e} onChange={value => {
                    T.clearSearchBox();
                    this.setState({ heDaoTaoFilter: value ? value.id : '' });
                    this.props.getDtChuongTrinhDaoTaoPage(undefined, undefined, {
                        searchTerm: '',
                        donViFilter: this.state.donViFilter,
                        namDaoTao: this.state.idNamDaoTao,
                        heDaoTaoFilter: value && value.id,
                    });
                }} data={SelectAdapter_DmSvLoaiHinhDaoTao} allowClear={true} /> : null}
            </div>,
            content: <>
                <div className='tile'>{table}</div>
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.props.getDtChuongTrinhDaoTaoPage} />
                <TreeModal ref={e => this.modal = e} permission={permissionDaoTao} readOnly={!permission.write} getDtChuongTrinhDaoTao={this.props.getDtChuongTrinhDaoTao} />
                <CloneModal ref={e => this.cloneModal = e} permission={permissionDaoTao} readOnly={!permission.write} history={this.props.history} />
            </>,
            backRoute: '/user/dao-tao',
            onCreate: permission.write ? (e) => e.preventDefault() || this.props.history.push('/user/dao-tao/chuong-trinh-dao-tao/new') : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { getDtChuongTrinhDaoTaoPage, getDtChuongTrinhDaoTao, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(DtChuongTrinhDaoTaoPage);