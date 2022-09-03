import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { getAllDtSettings } from './redux';
import ScheduleConfigSection from './section/ScheduleConfigSection';

class DtSetting extends AdminPage {
    componentDidMount() {
        this.props.getAllDtSettings(items => {
            this.configSchedule.setValue(items);
        });
    }

    render() {
        return this.renderPage({
            title: 'Cấu hình',
            icon: 'fa fa-sliders',
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Cấu hình'
            ],
            backRoute: '/user/dao-tao',
            content: <div className='row'>
                <div className='col-md-6'>
                    <ScheduleConfigSection ref={e => this.configSchedule = e} />
                </div>
            </div>
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getAllDtSettings };
export default connect(mapStateToProps, mapActionsToProps)(DtSetting);