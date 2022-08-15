import React from 'react';

import { Link } from 'react-router-dom';
import { AdminModal, FormCheckbox, FormSelect, FormTabs, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';

import { SelectAdapter_HoSo } from './redux';



export class TaoHoSoModal extends AdminModal {

    onShow = () => {
        this.tieuDe.value('');
    }

    onSubmit = () => {
        const data = {
            tieuDe: this.tieuDe.value()
        };
        if (!data.tieuDe) {
            T.notify('Tiêu đề hồ sơ bị trống', 'danger');
            this.tieuDe.focus();
        } else {
            this.props.create(data, () => {
                this.hide();
            });
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo hồ sơ',
            size: 'elarge',
            body: <div className="row">
                <FormTextBox ref={e => this.tieuDe = e} className="col-md-12" label='Tiêu đề' type='text' required />
            </div>
        });
    }
}

export class ThemVaoHoSoModal extends AdminModal {
    onShow = () => {
        this.hoSo.value('');
    }

    onSubmit = () => {
        const data = {
            hoSo: this.hoSo.value(),
            vanBan: this.props.vanBanId,
        };

        if (!data.hoSo) {
            T.notify('Chưa có hồ sơ nào được chọn', 'danger');
            this.hoSo.focus();
        } else {
            this.props.add(data.hoSo, { vanBan: data.vanBan }, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thêm văn bản vào hồ sơ',
            size: 'elarge',
            body: <div className="row">
                <FormSelect className="col-md-12" label='Hồ sơ' ref={e => this.hoSo = e} data={SelectAdapter_HoSo} required />
            </div>
        });
    }
}

const getYearRange = (from, to) => {
    if (!to) {
        to = from + 1;
    }
    return [new Date(`${from}-01-01`).getTime(), new Date(`${to}-01-01`).getTime()];
};

class VanBanDi extends React.Component {
    itemRef = {}

    state = { ids: [] }

    changeSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        const { pageNumber = 1, pageSize = 25 } = this.props.hcthHoSo?.vanBanDiPage || {},
            searchTerm = this.search.value(),
            year = this.year.value(),
            [fromTime, toTime] = year && Number.isInteger(Number(year)) ? getYearRange(Number(year)) : [],
            currentVanBan = this.props.hcthHoSo?.item?.vanBan?.filter(item => item.loaiB == 'VAN_BAN_DI') || [],
            filter = { fromTime, toTime, hasIds: 0, excludeIds: currentVanBan.map(item => item.keyB).toString() };

        if (this.tabs.selectedTabIndex() == 1) {
            filter.ids = this.state.ids.toString();
            filter.hasIds = 1;
        }


        this.setState({ filter }, () => this.getPage(pageNumber, pageSize, searchTerm, this.setItem));
    }

    setItem = () => {
        this.state.ids.forEach(id => this.itemRef[id]?.value(true));
    }

    getSelected = () => this.state.ids


    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.props.getVanBanDiSelector(pageNumber, pageSize, pageCondition, this.state.filter, (data) => {
            this.setItem();
            done(data);
        });
    }

    handleToggleItem = (item, value) => {
        if (value) {
            this.setState({ ids: [...this.state.ids, item.id] });
        } else {
            this.setState({ ids: this.state.ids.filter(id => id != item.id) });
        }
    }

    resetSearch = (e) => {
        e?.preventDefault && e.preventDefault();
        this.year.value('');
        this.search.value('');
        this.changeSearch();
    }

    resetState = () => {
        this.setState({
            ids: [],
            filter: {},
        });
    }

    render = () => {
        const { pageNumber = 1, pageSize = 25, pageTotal = 0, totalItem = 0, pageCondition = '', list = null } = this.props.hcthHoSo?.vanBanDiPage || {};

        const table = renderTable({
            loadingOverlay: false,
            loadingClassName: 'd-flex justify-content-center',
            getDataSource: () => list,
            renderHead: () => <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}></th>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số</th>
                <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Ngày gửi</th>
                <th style={{ width: '35%', whiteSpace: 'nowrap' }}>Đơn vị gửi</th>
                <th style={{ width: '65%', whiteSpace: 'nowrap' }}>Trích yếu</th>
            </tr>,
            renderRow: (item, index) => {
                return (<tr key={item.id}>
                    <TableCell style={{}} content={<FormCheckbox ref={e => this.itemRef[item.id] = e} onChange={value => this.handleToggleItem(item, value)} />} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={<Link to={`/user/van-ban-di/${item.id}`} target='_blank' rel='noopener noreferrer' >{item.soDi || 'Chưa có số'}</Link>} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayTao, 'dd/mm/yyyy')} />

                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.tenDonViGui} />

                    <TableCell contentClassName='multiple-lines-3' contentStyle={{ width: '100%' }} content={item.trichYeu} />
                </tr>);
            }
        });

        const TAB_ID = 'VanBanDiSelector';
        const tabs = [{ title: 'Danh sách' }, { title: 'Đã chọn' }];


        return (
            <div className="col-md-12">
                <div className="form-group row" onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}>
                    <FormTextBox label='Tìm kiếm' ref={e => this.search = e} className='col-md-8' />
                    <FormTextBox label='Năm' ref={e => this.year = e} className='col-md-4' />
                    <div className='col-md-12' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type='submit' className='btn btn-danger' onClick={this.resetSearch}>
                            <i className='fa fa-lg fa-times-circle-o' />Hủy tìm kiếm
                        </button>
                        <button type='submit' className='btn btn-success' onClick={this.changeSearch}>
                            <i className='fa fa-lg fa-search' />Tìm kiếm
                        </button>
                    </div>

                    <FormTabs className='col-md-12' style={tabs.length == 1 ? { display: 'none' } : {}} ref={e => this.tabs = e} tabs={tabs} id={TAB_ID} onChange={this.changeSearch} />

                    <div className="col-md-12" style={{ maxHeight: '40vh', overflowY: 'scroll', padding: '10px 10px 10px 10px' }}>
                        {table}
                    </div>

                    <Pagination style={{ marginLeft: '50px', position: 'static', marginTop: '10px' }} {...{ pageNumber, pageSize, pageTotal, totalItem, pageCondition }} getPage={this.getPage} />


                </div>
            </div>
        );
    }
}

export class ThemVanBanModal extends AdminModal {

    state = {};

    onShow = () => {
        this.setState({ showVanBan: true });
        if (this.state.showVanBan) {
            this.vanBanDi?.changeSearch();
        }
    }

    onHide = () => {
        this.vanBanDi?.resetState();
    }

    onSubmit = () => {
        const data = {
            id: this.props.hoSoId,
            vanBan: this.vanBanDi?.getSelected() || []
        };

        if (data.vanBan.length == 0) {
            T.notify('Chưa có văn bản nào được chọn', 'danger');
        } else {
            this.props.addVanBan(data.id, data, () => {
                this.hide();
            });
        }
    }
    render = () => {
        return this.renderModal({
            title: 'Thêm văn bản',
            size: 'elarge',
            body: <div className="row">
                {this.state.showVanBan && <VanBanDi {...this.props} ref={e => this.vanBanDi = e} />}
            </div>
        });
    };
}