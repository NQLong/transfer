import React from 'react';
import { connect } from 'react-redux';
import { getDmDonViAll } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDvWebsitePage, createDvWebsite, updateDvWebsite, deleteDvWebsite } from './redux';
import Pagination, { OverlayLoading } from 'view/component/Pagination';
import AdminSearchBox from 'view/component/AdminSearchBox';
import Select from 'react-select';
import { Link } from 'react-router-dom';

class ItemModal extends React.Component {
    modal = React.createRef();
    selectDonVi = React.createRef();
    state = { donViSelected: [] };

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dvWebsiteShortname').focus());
        }, 250));
    }

    show = () => {
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

    render() {
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

class AdminPage extends React.Component {
    state = { searching: false, donViOptions: [] }
    searchBox = React.createRef();
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/website', () => this.searchBox.current.getPage());
        this.props.getDmDonViAll(data => this.setState({ donViOptions: data.map(item => ({ value: item.ma, label: item.ten })) }));
    }

    changeActive = item => this.props.updateDvWebsite(item.shortname, { kichHoat: item.kichHoat ? 0 : 1 });

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa website đơn vị', 'Bạn có chắc bạn muốn xóa website đơn vị này?', true, isConfirm =>
            isConfirm && this.props.deleteDvWebsite(item.shortname));
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('website:write'),
            permissionDelete = currentPermissions.includes('website:delete');
        let table = 'Không có dữ liệu!',
            { pageNumber, pageSize, pageTotal, totalItem, pageCondition, list } = this.props.dvWebsite && this.props.dvWebsite.page ?
                this.props.dvWebsite.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: {}, list: [] };
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>#</th>
                            <th style={{ width: '20%', textAlign: 'left' }} nowrap='true'>Tên viết tắt</th>
                            {/* <th style={{ width: '50%' }} nowrap='true'>Tên đơn vị</th> */}
                            <th style={{ width: '70%' }} nowrap='true'>Website riêng</th>
                            <th style={{ width: '10%', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td style={{ textAlign: 'left' }}><Link to={'/user/website/edit/' + item.shortname}>{item.shortname}</Link></td>
                                {/* <td><a href={'/user/website/edit/' + item.shortname} style={{ color: 'black' }}>{item.tenDonVi}</a></td> */}
                                <td><a href={item.website} target='__blank' className='text-success'>{item.website}</a></td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.kichHoat} onChange={() => this.changeActive(item, index)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className='btn-group'>
                                        <a href={`/${item.shortname}`} target='__blank' className='btn btn-success'>
                                            <i className='fa fa-lg fa-chrome' style={{ margin: 'unset' }} />
                                        </a>
                                        <Link className='btn btn-primary' to={`/user/website/edit/${item.shortname}`}>
                                            <i className='fa fa-lg fa-edit' style={{ margin: 'unset' }} />
                                        </Link>
                                        {permissionDelete &&
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-trash-o fa-lg' style={{ margin: 'unset' }} />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-chrome' /> Danh sách website đơn vị</h1>
                    <AdminSearchBox ref={this.searchBox} getPage={this.props.getDvWebsitePage} setSearching={value => this.setState({ searching: value })} />
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/websites'>Cấu hình</Link>&nbsp;/&nbsp;
                        Website
                    </ul>
                </div>
                <div className='tile'>
                    {!this.state.searching ? table : <OverlayLoading text='Đang tải..' />}
                </div>
                <ItemModal ref={this.modal} create={this.props.createDvWebsite} donViOptions={this.state.donViOptions} />
                <Pagination name='dvWebsite'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                    getPage={this.searchBox.current && this.searchBox.current.getPage} />
                {/* <Link to='/user/websites' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link> */}
                {permissionWrite ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={() => this.modal.current.show()}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsite: state.dvWebsite });
const mapActionsToProps = { getDvWebsitePage, createDvWebsite, updateDvWebsite, deleteDvWebsite, getDmDonViAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminPage);