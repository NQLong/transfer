import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getDmDonVi } from 'modules/mdDanhMuc/dmDonVi/redux';
import { getDvWebsite, updateDvWebsite } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class AdminEditPage extends AdminPage {
    state = { donVi: {}, id: '', donViId: '' };

    componentDidMount() {
        T.ready('/user/website', () => {
            const route = T.routeMatcher('/user/website/edit/:id'), id = route.parse(window.location.pathname).id;
            if (id) {
                this.props.getDvWebsite(id, item => {
                    this.shortname.value(item.shortname || '');
                    this.website.value(item.website || '');
                    this.email.value(item.email || '');
                    this.address.value(item.address || '');
                    this.phoneNumber.value(item.phoneNumber || '');
                    this.otherWebAddress.value(item.otherWebAddress || '');
                    this.kichHoat.value(item.kichHoat);
                    this.props.getDmDonVi(item.maDonVi, donVi => {
                        this.setState({ id: item.id, donVi, donViId: donVi.ma });
                    });
                });
            } else {
                this.props.history.push('/user/website');
            }
        });
    }

    save = () => {
        const item = {
            shortname: this.shortname.value(),
            website: this.website.value(),
            email: this.email.value(),
            phoneNumber: this.phoneNumber.value(),
            address: this.address.value(),
            kichHoat: this.kichHoat.value(),
            otherWebAddress: this.otherWebAddress.value()
        };
        if (item.shortname == '') {
            T.notify('Tên viết tắt bị trống');
            this.shortname.focus();
        } else {
            this.props.updateDvWebsite(this.state.id, item);
        }
    }

    menuClick = (e, item) => {
        e.preventDefault();
        this.props.history.push(item.link);
    }

    render() {
        const permission = this.getUserPermission('website');
        const menus = [
            { title: 'Cấu hình menu', link: `/user/menu/${this.state.id}` },
            { title: 'Bài viết', link: `/user/news-donvi/${this.state.donViId}` },
            { title: 'Sự kiện', link: `/user/event-donvi/${this.state.donViId}` },
            { title: 'Danh mục bài viết', link: '/user/news/category' },
            { title: 'Danh mục sự kiện', link: '/user/event/category' },
            { title: 'Danh mục tệp tin', link: '/user/storage/category' },
            { title: 'Thành phần giao diện', link: '/user/component' },
            { title: 'Bài viết chờ duyệt', link: '/user/news/draft' }
        ];

        const groupMenus = menus.map((item, index) => (
            <div key={index} className='col-md-6 col-lg-4' style={{ cursor: 'pointer' }} onClick={e => this.state.id && this.menuClick(e, item)}>
                <div className='widget-small coloured-icon'>
                    <i style={{ backgroundColor: '#00b0ff' }} className={'icon fa fa-3x ' + (item.icon || 'fa-tasks')} />
                    <div className='info'>
                        <p>{item.title}</p>
                    </div>
                </div>
            </div>
        ));

        return this.renderPage({
            icon: 'fa fa-chrome',
            title: 'Website đơn vị',
            subTitle: this.state.donVi ? <p>Website đơn vị: <span style={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'blue' }}>{this.state.donVi.ten}</span></p> : null,
            breadcrumb: [
                <Link key={0} to='/user/website'>Website</Link>,
                'Chỉnh sửa'
            ],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung </h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormTextBox ref={e => this.shortname = e} className='col-md-4' label='Tên viết tắt' required />
                            <FormTextBox ref={e => this.website = e} className='col-md-4' label='Website riêng' />
                            <FormTextBox ref={e => this.email = e} className='col-md-4' label='Email' />
                            <FormTextBox ref={e => this.phoneNumber = e} className='col-md-4' label='Số điện thoại' />
                            <FormTextBox ref={e => this.address = e} className='col-md-4' label='Địa chỉ' />
                            <FormTextBox ref={e => this.otherWebAddress = e} className='col-md-4' label='Địa chỉ trang web khác' />
                            <FormCheckbox ref={e => this.kichHoat = e} className='col-md-4' label='Kích hoạt' />
                        </div>
                    </div>
                </div>
                <div className='row'>{groupMenus}</div>
            </>,
            onSave: permission.write ? () => this.save() : null,
            backRoute: '/user/website'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, dvWebsite: state.dvWebsite });
const mapActionsToProps = { getDmDonVi, getDvWebsite, updateDvWebsite };
export default withRouter(connect(mapStateToProps, mapActionsToProps)(AdminEditPage));