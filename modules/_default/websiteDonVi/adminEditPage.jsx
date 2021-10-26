import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDvWebsite, updateDvWebsite } from './redux';
import { Link } from 'react-router-dom';

class AdminEditPage extends React.Component {
    selectDonVi = React.createRef();
    imageBox = React.createRef();
    state = { donVi: null, image: null, id: 0, kichHoat: true };

    componentDidMount() {
        T.ready('/user/website', () => {
            const route = T.routeMatcher('/user/website/edit/:shortname'),
                shortname = route.parse(window.location.pathname).shortname;
            if (shortname) {
                this.props.getDvWebsite(shortname, data => {
                    if (data) {
                        $('#dvWebsiteShortname').val(data.shortname);
                        $('#dvWebsiteWebsite').val(data.website);
                        $('#email').val(data.email);
                        $('#address').val(data.address);
                        $('#phoneNumber').val(data.phoneNumber);

                        this.props.getDmDonVi(data.maDonVi, donVi => this.setState({
                            shortname, donVi,
                            kichHoat: data.kichHoat, id: donVi.ma,
                            image: data.image ? data.image : '/img/hcmussh.png'
                        }));
                    } else {
                        this.props.history.push('/user/website');
                    }
                });
            } else {
                this.props.history.push('/user/website');
            }
        });
    }

    save = () => {
        const item = {
            shortname: $('#dvWebsiteShortname').val().trim(),
            website: $('#dvWebsiteWebsite').val().trim(),
            phoneNumber: $('#phoneNumber').val().trim(),
            address: $('#address').val().trim(),
            email: $('#email').val().trim(),
            kichHoat: this.state.kichHoat,
        };
        if (item.shortname == '') {
            T.notify('Tên viết tắt bị trống');
            $('#dvWebsiteShortname').focus();
        } else {
            this.props.updateDvWebsite(this.state.shortname, item);
        }
    }

    changeImage = (data) => {
        if (data.image) this.setState({ image: data.image });
    }

    menuClick = (e, item) => {
        e.preventDefault();
        this.props.history.push(item.link);
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            permissionWrite = currentPermissions.includes('website:write');
        let groupMenus = [], menus = [
            { title: 'Cấu hình menu', link: `/user/menu/${this.state.shortname}` },
            { title: 'Bài viết', link: `/user/news-donvi/${this.state.id}` },
            { title: 'Sự kiện', link: `/user/event-donvi/${this.state.id}` },
            { title: 'Danh mục bài viết', link: '/user/news/category' },
            { title: 'Danh mục sự kiện', link: '/user/event/category' },
            { title: 'Danh mục tệp tin', link: '/user/storage/category' },
            { title: 'Thành phần giao diện', link: '/user/component' },
            { title: 'Bài viết chờ duyệt', link: '/user/news/draft' },

        ];
        menus.forEach((item, index) => {
            groupMenus.push(
                <div key={index} href='#' className='col-md-6 col-lg-4' style={{ cursor: 'pointer' }}
                    onClick={e => this.state.shortname && this.menuClick(e, item)} >
                    <div className='widget-small coloured-icon'>
                        <i style={{ backgroundColor: '#00b0ff' }} className={'icon fa fa-3x ' + (item.icon || 'fa-tasks')} />
                        <div className='info'>
                            <p>{item.title}</p>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-chrome' /> Website đơn vị</h1>
                        {this.state.donVi ? <p>Website đơn vị: <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'blue' }}>{this.state.donVi.ten}</span></p> : null}
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        {/* <Link to='/user/settings'>Cấu hình</Link>&nbsp;/&nbsp; */}
                        <Link to='/user/website'>Website</Link>&nbsp;/&nbsp;
                        Chỉnh sửa
                    </ul>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>
                        Thông tin chung
                    </h3>
                    <div className='tile-body row'>
                        <div className='col-md-12'>
                            <div className='row'>
                                <div className='form-group col-md-4'>
                                    <label htmlFor='dvWebsiteShortname'>Tên viết tắt</label>
                                    <input type='text' className='form-control' id='dvWebsiteShortname' placeholder='Tên viết tắt' />
                                </div>
                                <div className='form-group col-md-4'>
                                    <label htmlFor='dvWebsiteWebsite'>Website riêng</label>
                                    <input type='text' className='form-control' id='dvWebsiteWebsite' placeholder='Website riêng' />
                                </div>
                                <div className='form-group col-md-4'>
                                    <label htmlFor='email'>Email</label>
                                    <input type='text' className='form-control' id='email' placeholder='Email' />
                                </div>
                                <div className='form-group col-md-4'>
                                    <label htmlFor='phoneNumber'>Số điện thoại</label>
                                    <input type='text' className='form-control' id='phoneNumber' placeholder='Số điện thoại' />
                                </div>
                                <div className='form-group col-md-4'>
                                    <label htmlFor='address'>Địa chỉ</label>
                                    <input type='text' className='form-control' id='address' placeholder='Địa chỉ' />
                                </div>
                                <div className='form-group col-12'>
                                    <div style={{ display: 'inline-flex', margin: 0, fontSize: '14px', fontWeight: 'normal' }}>
                                        <label htmlFor='dvWebsiteKichHoat'>Kích hoạt:</label>&nbsp;
                                        <div className='toggle'>
                                            <label>
                                                <input type='checkbox' id='dvWebsiteKichHoat' checked={this.state.kichHoat}
                                                    onChange={() => permissionWrite && this.setState({ kichHoat: this.state.kichHoat ? 0 : 1 })} />
                                                <span className='button-indecator' />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {permissionWrite ?
                        <div className='tile-footer text-right'>
                            <button className='btn btn-success' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' />Lưu
                            </button>
                        </div> : null}
                </div>
                <div className='row'>
                    {groupMenus}
                </div>
                <Link to='/user/website' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsite: state.dvWebsite });
const mapActionsToProps = { getDmDonVi, getDvWebsite, updateDvWebsite };
export default connect(mapStateToProps, mapActionsToProps)(withRouter(AdminEditPage));
