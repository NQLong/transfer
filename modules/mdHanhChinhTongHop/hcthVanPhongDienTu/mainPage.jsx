import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class MainPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user');
    }

    render() {
        const { user } = this.props.system ? this.props.system : {},
            permissions = this.getCurrentPermissions();
        if (!user) this.props.history.goBack();

        const menuItems = [
            { title: 'Văn bản đến', backgroundColor: '#00aa00', link: '/user/van-ban-den', icon: 'fa-caret-square-o-left' },
            { title: 'Văn bản đi', backgroundColor: '#0B86AA', link: '/user/van-ban-di', icon: 'fa-caret-square-o-right' },
            { title: 'Văn bản trình ký', link: '/user/cong-van-trinh-ky', icon: 'fa-pencil-square-o', backgroundColor: '#832391' },
            permissions.some(item => ['manager:write', 'rectors:login', 'hcthMocDo:write'].includes(item)) && { title: 'Chữ ký', link: '/user/yeu-cau-tao-khoa', icon: 'fa-key', backgroundColor: '#DB2C2C' },
            { title: 'Nhiệm vụ', link: '/user/nhiem-vu', icon: 'fa-list-alt', backgroundColor: '#DE602F' },
            // { title: 'Quản lý số văn bản', link: '/user/dang-ky-so', icon: 'fa-sign-in', backgroundColor: '#b52b79' },
            { title: 'Hồ sơ', link: '/user/ho-so', icon: 'fa-file-text', backgroundColor: '#0B86AA' },
            { title: 'Hướng dẫn sử dụng', link: '/user/instruction', icon: 'fa-list', backgroundColor: '#7FB77E'},
        ];
        return this.renderPage({
            icon: 'fa fa-desktop',
            title: 'Văn phòng điện tử',
            breadcrumb: [<Link to='/user' key={0}>Trang cá nhân</Link>, 'Văn phòng điện tử'],
            content: <>

                <div className='row'>
                    {menuItems.map((item, key) => {
                        if (item) return (
                            <Link key={key} className='col-md-4' to={item.link}>
                                <div className='widget-small coloured-icon'>
                                    <i style={{ backgroundColor: item.backgroundColor }} className={'icon fa ' + item.icon} />
                                    <div className='info'>
                                        <p>{item.title}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

            </>,
            backRoute: '/user',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(MainPage);