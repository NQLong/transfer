import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, loadSpinner } from 'view/component/AdminPage';
import { } from './component';
import { getCongVanTrinhKy } from './redux';
const { } = require('../constant');

// const tienDoSelector = [...Array(11).keys()].map(i => ({ id: i * 10, text: `${i * 10}%` }));

class AdminEditPage extends AdminPage {
    state = { id: null }


    componentDidMount() {
        T.ready('/user', () => {
            const params = T.routeMatcher('/user/cong-van-trinh-ky/:id').parse(window.location.pathname);
            console.log({ params });
            this.setState({
                id: params.id === 'new' ? null : params.id,
            }, () => this.getData());
        });
    }

    // EditModal
    getData = () => {
        console.log({ state: this.state });
        if (this.state.id) {
            this.props.getCongVanTrinhKy(Number(this.state.id), (item) => this.setData(item));
        }
        else this.setData();
    }

    setData = (data = null) => {
        let { } = data ? data : {};
    };

    renderContent = () => {
        const item = this.props.hcthCongVanTrinhKy?.item;
        if (!item)
            return loadSpinner();
        else {
            const { congVanKy } = item;
            return <>
                <div className='tile row'>
                    <div className='form-group'>
                        <span style={{ fontWeight: 'bold' }}>Số công văn: </span> <Link to={`/user/cong-van-cac-phong/${item.congVan}`} target='_blank' rel='noopener noreferrer' >{congVanKy?.soCongVan || 'Chưa có số'}</Link>
                    </div>
                </div>
            </>;
        }
    }

    render() {
        const congVanTrinhKy = this.props.hcthCongVanTrinhKy || {},
            { congVanKy, canBoKy } = congVanTrinhKy;
        return this.renderPage({
            icon: 'fa fa-caret-square-o-left',
            title: 'Công văn trình ký',
            content: this.renderContent(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, hcthCongVanTrinhKy: state.hcth.hcthCongVanTrinhKy });
const mapActionsToProps = { getCongVanTrinhKy };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);