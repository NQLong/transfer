import React from 'react';
import { connect } from 'react-redux';
import { AdminModal, AdminPage, FormSelect, FormTextBox, FormCheckbox, renderTable, TableCell } from 'view/component/AdminPage';
import { SelectAdapter_FwCanBo } from 'modules/mdTccb/tccbCanBo/redux';
import { Link } from 'react-router-dom';
import { SelectAdapter_CongVanDi } from '../hcthCongVanDi/redux'
import { createCongVanTrinhKy, searchCongVanTrinhKy } from './redux';
const { loaiCongVan } = require('../constant');

class CreateModal extends AdminModal {
    componentDidMount() {
        T.ready(() => this.onShown(() => { }));
    }

    onSubmit = (e) => {
        e.preventDefault();
        const data = {
            congVan: this.congVan.value(),
            canBoKy: this.danhSachCaNBo.value()
        };
        if (!data.congVan) {
            T.notify('Công văn cần trình ký trống', 'danger');
            this.congVan.focus();
        } else if (!data.canBoKy || data.canBoKy.length == 0) {
            T.notify('Cán bộ ký công văn trống', 'danger');
        } else
            this.props.create(data, this.hide);
    };

    render = () => {
        return this.renderModal({
            title: 'Tạo công văn trình ký',
            size: 'elarge',
            body: <div className='row'>
                <FormSelect ref={e => this.congVan = e} data={SelectAdapter_CongVanDi} label='Công văn đi' className='col-md-12' />
                <FormSelect ref={e => this.danhSachCaNBo = e} data={SelectAdapter_FwCanBo} label='Cán bộ kí' className='col-md-12' multiple={true} />
            </div>
        });
    }

}


class HcthCongVanTrinhKyUserPage extends AdminPage {

    state = { filter: {} };

    componentDidMount() {
        T.ready('/user', () => {
            T.clearSearchBox();
            T.onSearch = (searchText) => this.getPage(undefined, undefined, searchText || '');
            T.showSearchBox(() => {
                setTimeout(() => this.changeAdvancedSearch(), 50);
            });
            this.changeAdvancedSearch(true);
        });
    }

    changeAdvancedSearch = (isInitial = false) => {
        let { pageNumber, pageSize } = this.props && this.props.hcthCongVanTrinhKy && this.props.hcthCongVanTrinhKy.page ? this.props.hcthCongVanTrinhKy.page : { pageNumber: 1, pageSize: 50 };
        let pageFilter = isInitial ? {} : {};
        this.setState({ filter: pageFilter }, () => {
            this.getPage(pageNumber, pageSize, '', (page) => { })
        });
    };

    getPage = (pageN, pageS, pageC, done) => {
        this.props.searchCongVanTrinhKy(pageN, pageS, pageC, this.state.filter, done);
    }


    render() {
        const table = renderTable({
            getDataSource: () => this.props.hcthCongVanTrinhKy?.page?.list,
            renderHead: () => {
                return <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Người tạo</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Công văn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Loai công văn</th>
                    <th style={{ width: '60%', whiteSpace: 'nowrap' }}>Trích yếu công văn</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Cán bộ kí</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trạng thái</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>
            },
            renderRow: (item) => {
                const canBoKy = item.danhSachCanBoKy?.split(';') || [];

                return <tr key={item.id}>
                    <TableCell type='number' content={item.R} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={`${item.hoNguoiTao} ${item.tenNguoiTao}`.trim().normalizedName()} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} url={`/user/cong-van-di/${item.congVanId}`} content={item.soCongVan || 'Công văn chưa có số'} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: item.loaiCongVan ? loaiCongVan[item.loaiCongVan]?.color : 'blue' }} content={item.loaiCongVan ? loaiCongVan[item.loaiCongVan]?.text : ''} />
                    <TableCell type='text' content={item.trichYeu} contentClassName='multiple-lines-3' />
                    <TableCell type='text' content={
                        canBoKy.map((item, index) => (
                            <span key={index}>
                                <b style={{ color: 'blue' }}>{item.normalizedName()}</b>
                                <br />
                            </span>
                        ))} />
                    <TableCell type='text' content='' />
                </tr>
            },
        });
        return this.renderPage({
            icon: 'fa fa-pencil-square-o',
            title: 'Công văn trình ký',
            content: <>
                <div className='tile'>
                    {table}
                </div>,
                <CreateModal ref={e => this.createModal = e} create={this.props.createCongVanTrinhKy} permissions={{}} permission={{}} />
            </>,
            onCreate: (e) => {
                e.preventDefault();
                this.createModal.show(null);
            },
        });
    }
}


const mapStateToProps = state => ({ system: state.system, hcthCongVanTrinhKy: state.hcth.hcthCongVanTrinhKy });
const mapActionsToProps = { createCongVanTrinhKy, searchCongVanTrinhKy };
export default connect(mapStateToProps, mapActionsToProps)(HcthCongVanTrinhKyUserPage);
