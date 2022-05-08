import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect } from 'view/component/AdminPage';
import Calendar from 'view/component/Calendar';
import { connect } from 'react-redux';
import { getDtLichDayHoc } from '../dtThoiKhoaBieu/redux';
import { SelectAdapter_DmPhong } from 'modules/mdDanhMuc/dmPhong/redux';
import T from 'view/js/common';

class LichDayHocPage extends AdminPage {
    state = { data: [] }
    componentDidMount() {
        T.ready('user/dao-tao', () => {
            // this.phong.focus();
            this.props.getDtLichDayHoc('', this.init);
        });
    }

    init = (data) => {
        let dataMonHoc = data.items?.map(item => ({
            title: `${item.maMonHoc} - L${item.nhom}`,
            start: item.thoiGianBatDau,
            end: item.thoiGianKetThuc,
            dateStart: T.dateToText(item.ngayBatDau, 'yyyy-mm-dd'),
            dateEnd: T.dateToText(item.ngayKetThuc, 'yyyy-mm-dd'),
            thu: item.thu - 1,
            isRepeat: true,
            exceptDates: data.listNgayLe.filter(ngayLe => ngayLe.ngay > item.ngayBatDau && ngayLe.ngay <= item.ngayKetThuc && new Date(ngayLe.ngay).getDay() == item.thu - 1).map(item => T.dateToText(item.ngay, 'yyyy-mm-dd'))
        })) || [];
        let dataNgayLe = data.listNgayLe.map(item => ({
            title: item.moTa,
            start: T.dateToText(item.ngay, 'yyyy-mm-dd'),
            allDay: true
        }));
        this.setState({ data: [...dataMonHoc, ...dataNgayLe] });
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-calendar-check-o',
            title: 'Lịch dạy học',
            header: <FormSelect style={{ width: '300px', marginBottom: '0' }} ref={e => this.phong = e} placeholder='Chọn phòng' data={SelectAdapter_DmPhong} onChange={(value) => this.props.getDtLichDayHoc(value.id, this.init)} />,
            content: <>
                <div className='tile'>
                    <Calendar data={this.state.data} isRepeat />
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