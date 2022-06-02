import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import {
    getListNghiHuuInYear, createMultiQtNghiViecFromNghiHuu
} from './redux';


const
    start = new Date().getFullYear(),
    end = start + 20,
    yearSelector = [...Array(end - start + 1).keys()].map(i => ({
        id: i + start,
        text: i + start
    }));


class CreateListYear extends AdminPage {
    state = {
        listData: [],
        year: null,
        loading: null,
    }

    componentDidMount() {
        T.hideSearchBox();
        this.year.focus();
    }
    delete = (index, done) => {
        T.confirm('Xóa dữ liệu', 'Bạn có chắc bạn muốn xóa dữ liệu này?', 'warning', true, isConfirm => {
            if (isConfirm) {
                const listData = this.state.listData;
                listData.splice(index, 1);
                this.setState({ listData }
                    , () => T.notify('Cập nhật dữ liệu thành công', 'success'));
                done && done();
            }
        });
    };

    tableList = (data, permission) => {
        return renderTable({
            getDataSource: () => data,
            stickyHead: false,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'right' }}>#</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Họ và tên</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nam</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Nữ</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh GS, PGS</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Trình độ chuyên môn</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức danh nghề nghiệp</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Chức vụ, đơn vị công tác</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Ngày đủ tuổi nghỉ hưu</th>
                    <th style={{ width: '50%', whiteSpace: 'nowrap' }}>Thời điểm nghỉ hưu từ ...</th>
                    <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' style={{ textAlign: 'right' }} content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={(item.hoCanBo ? item.hoCanBo.normalizedName() : ' ') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : ' ')} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap' }} dateFormat='dd/mm/yyyy' content={item.phai == '01' ? item.ngaySinh : ''} />
                    <TableCell type='date' style={{ whiteSpace: 'nowrap' }} dateFormat='dd/mm/yyyy' content={item.phai == '02' ? item.ngaySinh : ''} />
                    <TableCell type='text' content={item.tenChucDanh ? item.tenChucDanh.getFirstLetters() + '.' : ''} />
                    <TableCell type='text' content={item.tenHocVi ? item.tenHocVi.getFirstLetters() : item.trinhDoPhoThong} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucDanhNgheNghiep || ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.tenChucVu + ' ' + (item.tenDonVi || '')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'red' }} content={T.dateToText(item.ngayNghiHuu, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', color: 'blue' }} content={T.dateToText(item.thoiDiemNghiHuuSauKeoDai, 'dd/mm/yyyy')} />
                    {
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} permission={permission}
                            onDelete={() => this.delete(index)} >
                        </TableCell>
                    }
                </tr>
            )
        });
    }

    handleTime = (value) => {
        if (value) {
            this.setState({ loading: true });
            let year = parseInt(value.id);
            this.props.getListNghiHuuInYear(year, (listData) => {
                this.setState({ year, listData, loading: false });
            });
        } else {
            this.setState({ listData: [], year: null, loading: null });
        }
    }

    render() {
        const { listData, year } = this.state,
            permission = this.getUserPermission('qtNghiViec', ['read', 'write', 'delete']);
        const table = this.tableList(listData, permission);
        return this.renderPage({
            icon: 'fa fa-hourglass-start',
            title: 'Tạo danh sách nghỉ hưu dự kiến',
            header: <FormSelect style={{ width: '150px', marginBottom: '0' }} ref={e => this.year = e} allowClear={true} placeholder='Năm' onChange={this.handleTime} data={yearSelector} />,
            breadcrumb: [
                <Link key={0} to='/user/tccb/qua-trinh/nghi-viec'>Quá trình nghỉ việc</Link>, 'Import nghỉ hưu dự kiến'
            ],
            content: <>
                <div className='tile'> {(this.state.loading == null || this.state.loading == false) ? table : this.tableList()} </div>
            </>,
            onExport: this.year && this.year.value() ? (e) => {
                e.preventDefault();
                T.download(`/api/tccb/qua-trinh/download-nghi-huu-du-kien?year=${year}`, 'Nghỉ hưu dự kiến năm ' + year + '.xlsx');
            } : null,
            backRoute: '/user/tccb/qua-trinh/nghi-viec',
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {
    getListNghiHuuInYear, createMultiQtNghiViecFromNghiHuu
};
export default connect(mapStateToProps, mapActionsToProps)(CreateListYear);
