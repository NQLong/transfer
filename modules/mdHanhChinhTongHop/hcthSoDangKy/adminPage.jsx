import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminModal, AdminPage, FormCheckbox, FormSelect, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';

import Pagination from 'view/component/Pagination';

import { SelectAdapter_DmDonViFilter } from 'modules/mdDanhMuc/dmDonVi/redux';
import { SelectAdapter_DmLoaiCongVan } from 'modules/mdDanhMuc/dmLoaiCongVan/redux';
import { createSoNhapTay, createSoTuDong, getDangKySearchPage } from './redux';


const { loaiCongVan } = require('../constant.js');
const TAB_ID = 'soDangKyTabs';


class CreateModal extends AdminModal {
    state = { soTuDong: true };

    onShow = () => {
        this.soDangKy?.value('');
        this.soTuDong?.value(this.state.soTuDong);
        this.capVanBan?.value('TRUONG');
        this.loaiVanBan?.value('');
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            soDangKy: this.soDangKy?.value(),
            capVanBan: this.capVanBan?.value(),
            loaiVanBan: this.loaiVanBan?.value(),
            donViGui: this.donViGui?.value(),
            tuDong: Number(this.soTuDong?.value())
        };

        if (!data.soDangKy && !this.state.soTuDong) {
            T.notify('Số cần đăng ký bị trống!', 'danger');
            this.soDangKy.focus();
        } else if (!data.donViGui) {
            T.notify('Đơn vị gửi bị trống', 'danger');
            this.donViGui.focus();
        } else {
            if (data.tuDong) {
                this.props.createSoTuDong(data, () => {
                    this.props.getPage(this.props.pageNumber, this.props.pageSize, '', () => this.hide());
                });
            } else {
                this.props.createSoNhapTay(data, () => {
                    this.props.getPage(this.props.pageNumber, this.props.pageSize, '', () => this.hide());
                });
            }
        }

    }

    render = () => {
        let maDonVi = this.props.system?.user?.staff?.maDonVi;
        const capVanBanArr = Object.values(loaiCongVan);
        return this.renderModal({
            title: 'Đăng ký số',
            size: 'elarge',
            body: <div className="row">
                <FormCheckbox isSwitch className="col-md-12" label='Số tự động' ref={e => this.soTuDong = e} onChange={value => this.setState({ soTuDong: value })} />
                {!this.state.soTuDong && <>
                    <FormTextBox ref={e => this.soDangKy = e} className="col-md-6" label='Chọn số đăng ký' type='text' required />
                </>
                }

                {this.state.soTuDong && <>
                    <FormSelect className='col-md-6' label='Loại văn bản' placeholder='Chọn loại văn bản' ref={e => this.loaiVanBan = e} data={SelectAdapter_DmLoaiCongVan} allowClear={true} />
                </>
                }
                <FormSelect className='col-md-6' label='Cấp văn bản' placeholder='Chọn cấp văn bản' ref={e => this.capVanBan = e} data={capVanBanArr} required />

                <FormSelect ref={e => this.donViGui = e} className="col-md-12" label='Đơn vị gửi' data={SelectAdapter_DmDonViFilter(maDonVi)} required />
            </div>
        });
    }
}

class HcthDangKySo extends AdminPage {
    state = { filter: {}, tab: 0 };

    componentDidMount() {
        T.ready('/user', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthDangKySo && this.props.hcthDangKySo.page ? this.props.hcthDangKySo.page : { pageNumber: 1, pageSize: 50 };

        let tab = this.tabs?.selectedTabIndex();

        const pageFilter = isInitial ? {} : { tab };
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => {
                this.setState({ loading: false });
                if (isInitial) {
                    const filter = page.filter || {};
                    this.setState({ filter: !$.isEmptyObject(filter) ? filter : pageFilter });
                }
            });
        });
    }

    getPage = (pageN, pageS, pageC, done) => {
        this.props.getDangKySearchPage(pageN, pageS, pageC, this.state.filter, done);
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition } = this.props.hcthDangKySo && this.props.hcthDangKySo.page ? this.props.hcthDangKySo.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: null };

        const table = renderTable({
            getDataSource: () => this.state.loading ? null : this.props.hcthDangKySo?.page?.list,
            style: { marginTop: '8px' },
            emptyTable: 'Không có dữ liệu số đăng ký',
            stickyHead: true,
            renderHead: () => {
                return (<tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '45%', whiteSpace: 'nowrap' }}>Số công văn</th>
                    <th style={{ width: '10%', whiteSpace: 'nowrap' }} >Ngày tạo</th>
                    <th style={{ width: '45%', whiteSpace: 'nowrap' }} >Đơn vị gửi</th>
                </tr>);
            },
            renderRow: (item, index) => {
                return (
                    <tr key={index}>
                        <TableCell type='text' style={{ textAlign: 'center' }} content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue', fontWeight: 'bold' }} content={`${item.soCongVan}`} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={T.dateToText(item.ngayTao, 'dd/mm/yyyy')} />
                        <TableCell type='text' contentClassName='multiple-lines' content={item.tenDonViGui} />
                    </tr>
                );
            }
        });

        let tabList = {
            all: {
                title: 'Tất cả'
            },
            tuDong: {
                title: 'Tự động'
            },
            nhapTay: {
                title: 'Nhập tay'
            }
        };

        const tabs = [tabList.all, tabList.tuDong, tabList.nhapTay];

        return this.renderPage({
            icon: 'fa fa-sign-in',
            title: 'Đăng ký số',
            stickyHead: true,
            content: <>
                <div className="tile">
                    <FormTabs ref={e => this.tabs = e} tabs={tabs} id={TAB_ID} onChange={() => this.setState({ loading: true }, this.changeAdvancedSearch())} />
                    {table}
                </div>,
                <Pagination style={{ marginLeft: '70px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }}
                    getPage={this.getPage} />,
                <CreateModal ref={e => this.createModal = e} {...this.props} getPage={this.getPage} {...{ pageNumber, pageSize }} />
            </>,
            backRoute: '/user',
            breadcrumb: [
                <Link key={0} to='/user' >Trang cá nhân</Link>,
                'Danh sách số đăng ký'
            ],
            onCreate: (e) => {
                e.preventDefault();
                this.createModal.show(null);
            }
        });
    }

}

const mapStateToProps = state => ({ system: state.system, hcthDangKySo: state.hcth.hcthDangKySo });
const mapActionsToProps = { getDangKySearchPage, createSoTuDong, createSoNhapTay };
export default connect(mapStateToProps, mapActionsToProps)(HcthDangKySo);
