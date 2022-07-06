import React from 'react';
import { connect } from 'react-redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDvWebsitePage, createDvWebsite, updateDvWebsite, deleteDvWebsite } from './redux';
import Pagination from 'view/component/Pagination';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, renderTable, TableCell } from 'view/component/AdminPage';

class ItemModal extends AdminModal {
    modal = React.createRef();
    selectDonVi = React.createRef();
    state = { donViSelected: [] };

    componentDidMount() {
        $(document).ready(() => {
            this.onShown(() => $('#dvWebsiteShortname').focus());
        });
    }

    onShow = () => {
        $('#dvWebsiteShortname').val('');
        $('#dvWebsiteWebsite').val('');
        this.setState({ donViSelected: [] });
        $(this.modal.current).modal('show');
    }

    save = e => {
        e.preventDefault();
        const item = {
            shortname: $('#dvWebsiteShortname').val().trim(),
            website: $('#dvWebsiteWebsite').val().trim(),
            maDonVi: this.state.donViSelected,
            kichHoat: 0,
        };
        if (item.shortname == '') {
            T.notify('Tên viết tắt bị trống');
            $('#dvWebsiteShortname').focus();
        } else if (item.maDonVi == '') {
            T.notify('Đơn vị bị trống');
            this.selectDonVi.current.focus();
        } else {
            this.props.create(item);
            $(this.modal.current).modal('hide');
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Tạo mới website đơn vị',
            body: <>

            </>
        });
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Tạo mới website đơn vị</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='dvWebsiteShortname'>Tên viết tắt</label>
                                <input type='text' className='form-control' id='dvWebsiteShortname' placeholder='Tên viết tắt' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dvWebsiteDonVi'>Đơn vị</label>
                                <Select ref={this.selectDonVi} id='dvWebsiteDonVi' placeholder='Chọn đơn vị'
                                    onChange={item => this.setState({ donViSelected: item.value })} options={this.props.donViOptions}
                                    value={this.props.donViOptions.filter(({ value }) => value == this.state.donViSelected)} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='dvWebsiteWebsite'>Website riêng</label>
                                <input type='text' className='form-control' id='dvWebsiteWebsite' placeholder='Website riêng' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary'>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class adminPage extends AdminPage {
    state = { donViOptions: [] }
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/website', () => {
            this.props.getDvWebsitePage();
        });
        this.props.getDmDonViAll(data => this.setState({ donViOptions: data.map(item => ({ value: item.ma, label: item.ten })) }));
    }

    changeActive = item => this.props.updateDvWebsite(item.shortname, { shortname: item.shortname, kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa website đơn vị', 'Bạn có chắc bạn muốn xóa website đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteDvWebsite(item.shortname));
    };

    render() {
        const permission = this.getUserPermission('website');
        let { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dvWebsite && this.props.dvWebsite.page ?
                this.props.dvWebsite.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            emptyTable: 'Không có dữ liệu',
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>#</th>
                    <th style={{ width: '20%', textAlign: 'left' }} nowrap='true'>Tên viết tắt</th>
                    <th style={{ width: '70%' }} nowrap='true'>Website riêng</th>
                    <th style={{ width: '10%', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ), renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' url={'/user/website/edit/' + item.id} content={item.shortname} />
                    <TableCell content={<a href={item.website} target='__blank' className='text-success'>{item.website}</a>} />
                    <TableCell type='checkbox' content={item.kichHoat} permission={permission} onChanged={() => this.changeActive(item, index)} />
                    <TableCell type='buttons' permission={permission} content={item} onEdit={`/user/website/edit/${item.id}`} onDelete={this.delete}>
                        <a href={`/${item.shortname}`} target='__blank' className='btn btn-success'>
                            <i className='fa fa-lg fa-chrome' style={{ margin: 'unset' }} />
                        </a>
                    </TableCell>
                </tr>
            )
        });

        return this.renderPage({
            title: 'Danh sách website đơn vị',
            icon: 'fa fa-chrome',
            breadcrumb: [
                <Link key={0} to='/user/websites'>Cấu hình</Link>,
                'Website'
            ],
            content: <>
                <div className='tile'>{table}</div>
                <ItemModal ref={this.modal} create={this.props.createDvWebsite} donViOptions={this.state.donViOptions} />
                <Pagination name='dvWebsite'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                    getPage={this.props.getDvWebsitePage} />
            </>,
            onSave: permission.write ? () => this.modal.current.show() : null
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsite: state.dvWebsite });
const mapActionsToProps = { getDvWebsitePage, createDvWebsite, updateDvWebsite, deleteDvWebsite, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(adminPage);