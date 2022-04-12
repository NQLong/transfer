import { SelectAdapter_DmMonHoc, SelectAdapter_DmMonHocFaculty, getDmMonHoc } from 'modules/mdDaoTao/dmMonHoc/redux';
import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormSelect, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
import { deleteDtChuongTrinhDaoTao } from './redux';
export class ComponentKienThuc extends AdminPage {
     maKhoa = null;
     rows = {};

     state = { datas: {} };

     // componentDidMount() {
     //     this.addRow(0);
     // }

     addRow = (idx, item) => {
          const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['write', 'manage']);
          const id = item ? item.id : -1;
          const editFlag = (permission.write || permission.manage) ? (id > 0 ? false : true) : false;
          const isDeleted = false;
          this.rows[idx] = {
               maMonHoc: null,
               loaiMonHoc: null,
               tongSoTc: null,
               tinChiLyThuyet: null,
               tinChiThucHanh: null,
               soTiet: null,
               phongTn: null,
          };
          this.setEditState(idx, editFlag, id, isDeleted, () => {
               this.rows[idx].loaiMonHoc.value(item ? item.loaiMonHoc : 0);
               this.rows[idx].tinChiLyThuyet.value(item ? item.tinChiLyThuyet : 0);
               this.rows[idx].tinChiThucHanh.value(item ? item.tinChiThucHanh : 0);
               if (item) {
                    SelectAdapter_DmMonHoc.fetchOneItem(item.maMonHoc, ({ item }) => {
                         const { soTinChi, tongSoTiet } = item;
                         // this.setEditState(idx`x, true, this.state.datas[idx].id);
                         this.rows[idx].tongSoTc.value(soTinChi);
                         this.rows[idx].soTiet.value(tongSoTiet);
                    });
                    this.rows[idx].maMonHoc.value(item.maMonHoc);
               }
          });
     }

     setEditState = (idx, editFlag, id, isDeleted, done) => {
          this.setState({
               datas: {
                    ...this.state.datas,
                    [idx]: {
                         edit: editFlag,
                         id: id,
                         isDeleted: isDeleted,
                    }
               }
          }, () => {
               done && done();
          });
     }

     editRow = (e, idx) => {
          if (!this.rows[idx].maMonHoc.value()) {
               return;
          }
          const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['write']);
          if (permission.write || permission.manage) {
               const curEdit = this.state.datas[idx].edit;
               const id = this.state.datas[idx].id;
               const isDeleted = this.state.datas[idx].isDeleted;
               this.setEditState(idx, !curEdit, id, isDeleted, () => {
                    this.rows[idx].maMonHoc.value(this.rows[idx].maMonHoc.value());
                    this.rows[idx].loaiMonHoc.value(this.rows[idx].loaiMonHoc.value());
               });
          }
     }

     removeRow = (e, idx) => {
          const id = this.state.datas[idx].id;
          if (id > 0) {
               T.confirm('Xóa môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => {
                    isConfirm && this.props.deleteDtChuongTrinhDaoTao(id, error => {
                         if (error) {
                              T.notify(error.message ? error.message : 'Xóa môn học bị lỗi!', 'danger');
                         }
                         else {
                              T.alert('Xóa môn học thành công!', 'success', false, 800);
                              this.setEditState(idx, false, id, true);
                         }
                    });
               });
          } else {
               this.setEditState(idx, false, id, true);
          }
     }


     setMonHoc = (idx, id) => {
          if (this.rows[idx - 1] && this.state.datas[idx - 1]?.edit) {
               this.editRow(idx - 1);
          }
          SelectAdapter_DmMonHoc.fetchOneItem(id, ({ item }) => {
               const { soTinChi, tongSoTiet } = item;
               // this.setEditState(idx, true, this.state.datas[idx].id);
               this.rows[idx].tongSoTc.value(soTinChi);
               this.rows[idx].soTiet.value(tongSoTiet);
               this.addRow(idx + 1);
          });

     }

     selectMh = (idx) => {
          return (
               <FormSelect ref={e => this.rows[idx].maMonHoc = e} data={SelectAdapter_DmMonHocFaculty(this.props.khoiKienThucId == 1 ? 33 : this.maKhoa)} className='col-12' style={{ marginBottom: 0, textDecoration: `${this.state.datas[idx]?.isDeleted ? 'line-through' : null}` }} readOnly={!this.state.datas[idx].edit} onChange={value => this.setMonHoc(idx, value.id)} />
          );
     };
     insertLoaiMh = (idx) => {
          return (<FormSelect ref={e => this.rows[idx].loaiMonHoc = e} data={[{ id: 0, text: 'Bắt buộc' }, { id: 1, text: 'Tự chọn' }]} className='col-12' style={{ marginBottom: 0, textDecoration: `${this.state.datas[idx]?.isDeleted ? 'line-through' : null}` }} readOnly={!this.state.datas[idx].edit} />);
     };
     insertTongSoTc = (idx) => {
          return (<FormTextBox type="number" ref={e => this.rows[idx].tongSoTc = e} className='col-12' readOnly={true} style={{ marginBottom: 0, textDecoration: `${this.state.datas[idx].isDeleted ? 'line-through' : null}` }} />);
     };
     insertTinChiLt = (idx) => {
          return (<FormTextBox type="number" ref={e => this.rows[idx].tinChiLyThuyet = e} className='col-12' readOnly={!this.state.datas[idx].edit} max={999} style={{ marginBottom: 0, textDecoration: `${this.state.datas[idx]?.isDeleted ? 'line-through' : null}` }} />);
     };
     insertTinChiTh = (idx) => {
          return (<FormTextBox type="number" ref={e => this.rows[idx].tinChiThucHanh = e} className='col-12' readOnly={!this.state.datas[idx].edit} style={{ marginBottom: 0, textDecoration: `${this.state.datas[idx]?.isDeleted ? 'line-through' : null}` }} />);
     };
     insertSoTiet = (idx) => {
          return (<FormTextBox type="number" ref={e => this.rows[idx].soTiet = e} className='col-12' readOnly={true} style={{ marginBottom: 0, textDecoration: `${this.state.datas[idx]?.isDeleted ? 'line-through' : null}` }} />);
     };
     insertPhongTn = (idx) => {
          return (<FormTextBox type="text" ref={e => this.rows[idx].phongTn = e} className='col-12' readOnly={!this.state.datas[idx].edit} style={{ marginBottom: 0, textDecoration: `${this.state.datas[idx]?.isDeleted ? 'line-through' : null}` }} />);
     };



     convertObjToArr = () => {
          const keys = Object.keys(this.state.datas);
          const tmp = [];
          keys.forEach(key => {
               tmp.push(this.state.datas[key]);
          });
          return tmp;
     }

     getValue = () => {
          try {
               const keys = Object.keys(this.rows);
               const data = [];
               keys.forEach((key) => {
                    const item = {
                         id: this.state.datas[key].id,
                         maMonHoc: this.rows[key].maMonHoc?.value(),
                         loaiMonHoc: this.rows[key].loaiMonHoc?.value(),
                         tinChiLyThuyet: this.rows[key].tinChiLyThuyet?.value(),
                         tinChiThucHanh: this.rows[key].tinChiThucHanh?.value(),
                         phongTn: this.rows[key].phongTn?.value(),
                         maKhoiKienThuc: this.props.khoiKienThucId,
                    };
                    if (item.maMonHoc && !this.state.datas[key].isDeleted) {
                         data.push(item);
                    }
               });
               return data;
          } catch (e) {
               return false;
          }
     }

     setVal = (items = [], maKhoa) => {
          this.maKhoa = maKhoa;
          let length = 0;
          items.forEach((item) => {
               // const { id, loaiMonHoc, maMonHoc, phongThiNghiem, tinChiLyThuyet, tinChiThucHanh } =
               //     item ? item : { id: '', loaiMonHoc: 0, maMonHoc: '', phongThiNghiem: null, tinChiLyThuyet: null, tinChiThucHanh: null };
               if (item.maKhoiKienThuc.toString() === this.props.khoiKienThucId.toString()) {
                    this.addRow(length, item);
                    length++;
               }
          });
          this.addRow(length);


     }


     render() {
          const permission = this.getUserPermission(this.props.prefixPermission || 'dtChuongTrinhDaoTao', ['read', 'manage', 'write', 'delete']);
          const title = this.props.title;

          const table = renderTable({
               getDataSource: () => this.convertObjToArr(),
               stickyHead: false,
               emptyTable: 'Không có dữ liệu',
               renderHead: () => (
                    <>
                         <tr>
                              <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>#</th>
                              <th rowSpan='2' style={{ width: '40%', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Tên Môn Học</th>
                              <th rowSpan='2' style={{ width: '15%', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Loại MH</th>
                              <th colSpan='3' rowSpan='1' style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Tín chỉ
                              </th>
                              <th rowSpan='2' style={{ width: 'auto', verticalAlign: 'middle', textAlign: 'center' }} nowrap='true'>Số tiết</th>
                              <th rowSpan='2' style={{ width: '10%', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Phòng TN</th>
                              <th rowSpan='2' style={{ width: 'auto', textAlign: 'center', verticalAlign: 'middle' }} nowrap='true'>Thao tác</th>
                         </tr>
                         <tr>
                              <th style={{ width: '5%', whiteSpace: 'nowrap', textAlign: 'center' }}>TC</th>
                              <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>LT</th>
                              <th style={{ width: '15%', whiteSpace: 'nowrap', textAlign: 'center' }}>TH/TN</th>
                         </tr>

                    </>),
               renderRow: (item, index) => (
                    <tr key={index}>
                         <TableCell type='text' style={{ textAlign: 'center', textDecoration: `${item.isDeleted ? 'line-through' : null}` }} content={item.id > 0 ? index + 1 : null} />
                         <TableCell content={this.selectMh(index)} />
                         <TableCell content={this.insertLoaiMh(index)} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={this.insertTongSoTc(index)} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={this.insertTinChiLt(index)} />
                         <TableCell type='number' style={{ textAlign: 'center' }} content={this.insertTinChiTh(index)} />
                         <TableCell type='number' content={this.insertSoTiet(index)} />
                         <TableCell type='number' content={this.insertPhongTn(index)} />
                         <td rowSpan={1} colSpan={1} style={{ textAlign: 'center' }}>
                              <div className='btn-group'>
                                   {
                                        (permission.write || permission.manage) && !item.isDeleted ?
                                             <>
                                                  <a className='btn btn-primary' href='#' title={!item.edit ? 'Chỉnh sửa' : 'Xong'} onClick={(e) => this.editRow(e, index)}><i className={'fa fa-lg ' + (!item.edit ? 'fa-edit' : 'fa-check')} /></a>
                                                  {!item.edit && <a className='btn btn-danger' href='#' title='Xóa' onClick={(e) => this.removeRow(e, index)}><i className='fa fa-lg fa-trash' /></a>}
                                             </>
                                             : null

                                   }

                              </div>
                         </td>
                    </tr>
               ),
          });

          return (<>
               <div className='tile'>
                    <div>
                         <h4>{title}</h4>
                         <p>{this.props.subTitle}</p>
                    </div>
                    {table}

               </div>
          </>
          );

     }
}

const mapStateToProps = state => ({ system: state.system, dtChuongTrinhDaoTao: state.daoTao.dtChuongTrinhDaoTao });
const mapActionsToProps = { getDmMonHoc, deleteDtChuongTrinhDaoTao };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(ComponentKienThuc);