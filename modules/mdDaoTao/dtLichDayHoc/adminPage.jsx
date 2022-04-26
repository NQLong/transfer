import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import Calendar from 'view/component/Calendar';
import { connect } from 'react-redux';
import { getDtLichDayHoc } from '../dtThoiKhoaBieu/redux';
import { SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';

class LichDayHocPage extends AdminPage {
    state = { data: [] }
    componentDidMount() {
        T.ready('user/dao-tao', () => {
            this.phong.focus();
        });
    }
    init = (items) => {
        let data = items.map(item => ({
            title: `${item.maMonHoc} - L${item.nhom}`,
            start: item.thoiGianBatDau,
            end: item.thoiGianKetThuc,
            dow: item.thu
        }));
        this.setState({ data });
    }
    render() {
        return this.renderPage({
            icon: 'fa fa-calendar-check-o',
            title: 'Lịch dạy học',
            header: <FormSelect style={{ width: '300px', marginBottom: '0' }} ref={e => this.phong = e} placeholder='Chọn phòng' data={SelectAdapter_DmPhong} onChange={(value) => this.props.getDtLichDayHoc(value.id, items => this.init(items))} />,
            content: <>
                <div className='tile'>
                    <Calendar data={this.state.data} />
                </div>
            </>,
            breadcrumb: [
                <Link key={0} to='/user/dao-tao'>Đào tạo</Link>,
                'Lịch dạy học'
            ],
            backRoute: '/user/dao-tao'
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDtLichDayHoc };
export default connect(mapStateToProps, mapActionsToProps)(LichDayHocPage);