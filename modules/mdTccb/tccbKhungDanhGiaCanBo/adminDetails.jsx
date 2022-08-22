import React from 'react';
import { connect } from 'react-redux';
import { createTccbKhungDanhGiaCanBo, updateTccbKhungDanhGiaCanBo, getTccbKhungDanhGiaCanBoAll } from './redux';
import { Link } from 'react-router-dom';
// import ComponentDGCB from './componentDGCB';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import Loading from 'view/component/Loading';
import T from 'view/js/common';
class TccbKhungDanhGiaCanBoDetails extends AdminPage {
    state = { isLoading: true }

    componentDidMount() {
        T.ready('/user/danh-gia', () => {
            const route = T.routeMatcher('/user/danh-gia/cau-truc-khung-danh-gia-can-bo/:nam');
            this.nam = route.parse(window.location.pathname)?.id;
            this.setState({ isLoading: false });
            const query = new URLSearchParams(this.props.location.search);
            const nam = query.get('nam');
            if (this.nam !== 'new') {
                this.getData(this.nam);
            } else {
                if (nam > 0) {
                    this.getData(nam, true);
                    return;
                } 
            }
        });
    }

    getData = (nam, isClone = false) => {
        this.props.getTccbKhungDanhGiaCanBoAll({ nam }, (items) => {
            this.nam.value(isClone ? Number(nam) + 1 : Number(nam));
            isClone && items.forEach(item => item.nam == Number(nam) + 1);
            this.danhGiaCanBo.setVal(items);
        });
    }

    validation = (selector) => {
        const data = selector.value();
        const isRequired = selector.props.required;
        if (data || data === 0) return data;
        if (isRequired) throw selector;
        return '';
    };

    save = () => {
        const data = { 
            nam: Number(this.nam.value()),
        };

        if (data.nam) {
            const danhGiaCanBo = this.danhGiaCanBo.getValue() || { items: [] };
            const items = danhGiaCanBo.items;
            const length = items.length;
            if (items.some((item, index) => {
                if(index >= length - 1) return item.from > item.to;
                else return item.from > item.to || items[index].from <= items[index + 1].to || items[index].from - items[index + 1].to > 1 ;
            })) {
                T.notify('Cấu trúc khung không hợp lệ', 'danger');
                return ;  
            } 

            if (items.some(item => !item.maMucXepLoai)) {
                T.notify('Mức xếp loại phải điền đầy đủ', 'danger');
                return ;
            }

            const changes = { ...data, content: T.stringify(items) };
            if (this.id == 'new') {
                this.props.createTccbKhungDanhGiaCanBo(changes, (item) => {
                    window.location = `/user/danh-gia/cau-truc-khung-danh-gia-can-bo/${item.id}`;
                });
            } else {
                this.props.updateTccbKhungDanhGiaCanBo(this.id, changes);
            }
        } else {
            T.notify('Năm đánh giá trống', 'danger');
            this.nam.focus();
        }
    }
    render() {
        const permission = this.getUserPermission('tccbKhungDanhGiaCanBo');
        const readOnly = !permission.write;

        return this.renderPage({
            icon: 'fa fa-university',
            title: this.nam !== 'new' ? 'Chỉnh sửa cấu trúc khung đánh giá cán bộ' : 'Tạo mới cấu trúc khung đánh giá cán bộ',
            breadcrumb: [
                <Link key={0} to='/user/danh-gia'>Đánh giá</Link>,
                <Link key={1} to='/user/danh-gia/cau-truc-khung-danh-gia-can-bo'>Cấu trúc khung đánh giá cán bộ</Link>,
                this.nam !== 'new' ? 'Chỉnh sửa' : 'Tạo mới',
            ],
            content: <>
                {this.state.isLoading && <Loading />}
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <FormTextBox type='year' ref={e => this.nam = e} label='Năm đánh giá' className='col-md-6' required readOnly={readOnly} />
                        </div>
                    </div>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cấu trúc đánh giá cán bộ</h3>
                    <div className='tile-body'>
                        {/* <ComponentDGCB ref={e => this.danhGiaCanBo = e} /> */}
                    </div>
                </div>
            </>,
            backRoute: '/user/danh-gia/cau-truc-khung-danh-gia-can-bo',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, tccbKhungDanhGiaCanBo: state.danhGia.tccbKhungDanhGiaCanBo });
const mapActionsToProps = { getTccbKhungDanhGiaCanBoAll, createTccbKhungDanhGiaCanBo, updateTccbKhungDanhGiaCanBo };
export default connect(mapStateToProps, mapActionsToProps)(TccbKhungDanhGiaCanBoDetails);