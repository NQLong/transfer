import React from 'react';
import { connect } from 'react-redux';
import { homeGetCompanyDoiTac } from './reduxDoanhNghiep';

const texts = {
    vi: {
        companyInfo: 'Thông tin doanh nghiệp',
        nationInfo: 'Quốc gia',
        foundedYearInfo: 'Năm thành lập',
        phoneNumberInfo: 'Số điện thoại',
        addressInfo: 'Địa chỉ',
        statusUpdate: 'Chưa cập nhật',
        descriptionInfo: 'Mô tả về doanh nghiệp',
        noInfo: 'Không có thông tin',
        areaActivityInfo: 'Lĩnh vực hoạt động của doanh nghiệp',
        close: 'Đóng',
        coopAddress: 'Địa điểm',
        coopTime: 'Thời gian',
        coopImage: 'Image',
        cooperation: 'Ký kết hợp tác',
        coopLogoPartner: 'Logo đối tác',
        recpTime: 'Ngày tiếp',
        recpContent: 'Nội dung dự kiến',
        recpResult: 'Kết quả',
        moTaHopTacInfo: 'Thông tin hợp tác',
        ketQuaHopTacInfo: 'Kết quả hợp tác'
    }, en: {
        companyInfo: 'Company information',
        nationInfo: 'Nation',
        foundedYearInfo: 'Founded year',
        phoneNumberInfo: 'Phone number',
        addressInfo: 'Address',
        statusUpdate: 'Not updated',
        descriptionInfo: 'Description about the company',
        noInfo: 'No informations',
        areaActivityInfo: 'Area of company activities',
        close: 'Close',
        cooperation: 'Signed cooperation',
        coopAddress: 'Address',
        coopTime: 'Time',
        coopImage: 'Image',
        coopLogoPartner: 'Logo of partner',
        recpTime: 'Time reception',
        recpContent: 'Expected Content',
        recpResult: 'Result',
        moTaHopTacInfo: 'Cooperate information',
        ketQuaHopTacInfo: 'Kết quả hợp tác'
    }
};

const h4Style = { fontSize: '1.5rem', lineHeight: '1.3', color: 'rgba(0, 0, 0, 0.8)', fontWeight: '700', marginBottom: '20px' };
const h6Style = { color: 'rgba(0, 0, 0, 0.8)', lineHeight: 1.3, fontWeight: 700 };

class PageCompany extends React.Component {
    state = { company: {} };

    componentDidMount() {
        $(document).ready(() => {
            let hiddenShortName = this.props.match.params.hiddenShortName;
            this.props.homeGetCompanyDoiTac(hiddenShortName, company => {
                this.setState({ company });
            });
        });
        $('footer').fadeIn();
        $('#paddingFooterSection').fadeIn();
    }

    render() {
        const { company } = this.state;
        const language = T.language(texts);
        // const hopTacBox = (company.listKyKet && company.listKyKet.length ? company.listKyKet : []).map((item, index) => {
        //     return (
        //         <div key={index}>
        //             {index != 0 && <div style={{ padding: '20px 0' }}><hr width='50%' align='center' /></div>}
        //             <h4 className='text-uppercase' style={h4Style}>{item.tieuDe}</h4>
        //             {item.thoiGian &&
        //                 <>
        //                 <h6 style={h6Style}>
        //                     Thời gian diễn ra buổi ký kết:&nbsp;
        //                     <span className='text-success'>{T.dateToText(item.thoiGian, 'dd/mm/yyyy')}</span></h6>
        //                 </>
        //             }
        //             {item.diaDiem && T.language.parse(item.diaDiem) &&
        //                 <h6 style={h6Style}>
        //                 Nơi diễn ra buổi ký kết: &nbsp;
        //                 <span className='text-success'>{T.language.parse(item.diaDiem)}</span></h6>
        //             }
        //
        //
        //             {item.image && (
        //                 <div style={{
        //                     textAlign: 'center',
        //                     height: '400px',
        //                     backgroundImage: `url(${item.image || '/img/bk.png'})`,
        //                     backgroundPosition: 'center',
        //                     backgroundRepeat: 'no-repeat',
        //                     backgroundSize: 'contain'
        //                 }}/>
        //             )}
        //         </div>
        //     );
        // });

        // const tiepDoanBox = (company.listTiepDoan && company.listTiepDoan.length ? company.listTiepDoan : []).map((item, index) => {
        //     return (
        //         <div key={index}>
        //             {index != 0 && <div style={{ padding: '20px 0' }}><hr width='50%' align='center' /></div>}
        //             <h4 className='text-uppercase' style={h4Style}>{T.language.parse(item.ten)}</h4>
        //             {item.ngayTiep &&
        //                 <h6 style={h6Style}>
        //                 Thời gian diễn ra buổi tiếp đoàn:&nbsp;
        //                 <span className='text-success'>{T.dateToText(item.ngayTiep, 'dd/mm/yyyy')}</span></h6>
        //
        //             }
        //             {item.diaDiem && T.language.parse(item.diaDiem) &&
        //                 <h6 style={h6Style}>
        //                 Nơi diễn ra buổi tiếp đoàn: &nbsp;
        //                 <span className='text-success'>{T.language.parse(item.diaDiem)}</span></h6>
        //             }
        //             {item.ketQua &&
        //                 <h6 style={h6Style}>{language.recpResult}: &nbsp;
        //                 <span className='text-success'>{T.language.parse(item.ketQua)}</span></h6>
        //             }
        //             {item.noiDungDuKien &&
        //                 <>
        //                 <h6 style={h6Style}>Nội dung của buổi tiếp đoàn:&nbsp;</h6>
        //                 <p className='text-justify'>{T.language.parse(item.noiDungDuKien)}</p>
        //                 </>
        //             }
        //             {item.ketQua &&
        //                 <><h6 style={h6Style}>Kết quả của buổi tiếp đoàn:&nbsp;</h6>
        //                 <p className='text-justify'>{T.language.parse(item.ketQua)}</p>
        //                 </>
        //             }
        //         </div>
        //     );
        // });


        return (
            <div className='container' style={{ width: '100%', paddingTop: '30px' }}>
                {company ? (
                    <div className='row'>
                        <div className='col-lg-6 col-md-8 col-12 m-auto'>
                            <div className='course--content'>
                                <div className='clever-description'>
                                    <div className='about-course mb-30' style={{ padding: '30px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)', marginBottom: '30px' }}>
                                        <a href='#' onClick={(e) => company.website ? window.open(company.website, '_blank') : e.preventDefault()}>
                                            <img src={company.image || '/img/a_cong.png'} width='100%' alt={T.language.parse(company.tenDayDu)} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-12' style={{ marginBottom: '100px' }}>
                            <div className='course--content'>
                                <div className='about-course mb-30' style={{ padding: '40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)' }}>
                                    <h4 className='text-center text-uppercase' style={h4Style}>{T.language.parse(company.tenDayDu)}</h4>
                                    <div className='row' style={{ margin: '0 -15px 8px -15px' }}>
                                        {company.quocGia &&
                                        <div className='col-12 col-md-6'>
                                            <h6 style={h6Style}>{language.nationInfo}: &nbsp;<span style={{ color: 'rgb(1, 57, 166)' }}>{T.language.parse(company.tenQuocGia)}</span></h6>
                                        </div>
                                        }

                                        {company.namThanhLap &&
                                        <div className='col-12 col-md-6'>
                                            <h6 style={h6Style}>{language.foundedYearInfo}:&nbsp;<span style={{ color: 'rgb(1, 57, 166)' }}>{company.namThanhLap}</span></h6>
                                        </div>
                                        }
                                    </div>
                                    <div className='row' style={{ margin: '0 -15px 8px -15px' }}>
                                        {company.phone &&
                                        <div className='col-12 col-md-6'>
                                            <h6 style={h6Style}>{language.phoneNumberInfo}:&nbsp;<span style={{ color: 'rgb(1, 57, 166)' }}>{company.phone}</span></h6>
                                        </div>
                                        }
                                        {company.email &&
                                        <div className='col-12 col-md-6'>
                                            <h6 style={h6Style}>Email:&nbsp;<span style={{ color: 'rgb(1, 57, 166)' }}>{company.email}</span></h6>
                                        </div>
                                        }
                                    </div>

                                    {company.diaChi && T.language.parse(company.diaChi) &&
                                    <>
                                        <h6 style={h6Style}>{language.addressInfo}:&nbsp;</h6>
                                        <p className='text-justify'>{T.language.parse(company.diaChi)}</p>
                                    </>
                                    }
                                    {company.tenCacLinhVuc ? (
                                        <div>
                                            <h6 style={h6Style}>{language.areaActivityInfo}:</h6>
                                            {company.tenCacLinhVuc.map((linhvuc, index) => <p key={index}>- {linhvuc.ten}</p>)}
                                        </div>
                                    ) : null}

                                    {company.moTa && T.language.parse(company.moTa) ? (
                                        <div>
                                            <h6 style={h6Style}>{language.descriptionInfo}:</h6>
                                            <p className='text-justify' dangerouslySetInnerHTML={{ __html: T.language.parse(company.moTa) }} />
                                        </div>
                                    ) : null}
                                    {company.website &&
                                    <h6 style={h6Style}>Website:&nbsp;
                                        <a href={company.website} target='_blank' rel='noreferrer'><span style={{ fontWeight: '300' }}>{company.website}</span></a>
                                    </h6>
                                    }

                                    {company.moTaHopTac && T.language.parse(company.moTaHopTac) ? (
                                        <div>
                                            <h6 style={h6Style}>{language.moTaHopTacInfo}:</h6>
                                            <p className='text-justify' dangerouslySetInnerHTML={{ __html: T.language.parse(company.moTaHopTac) }} />
                                        </div>
                                    ) : null}

                                    {company.ketQuaHopTac && T.language.parse(company.ketQuaHopTac) ? (
                                        <div>
                                            <h6 style={h6Style}>{language.ketQuaHopTacInfo}:</h6>
                                            <p className='text-justify' dangerouslySetInnerHTML={{ __html: T.language.parse(company.ketQuaHopTac) }} />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                        {/*{company.listKyKet && company.listKyKet.length ?*/}
                        {/*    <div className='col-12' style={{ marginBottom: '100px' }}>*/}
                        {/*        <div className='course--content'>*/}
                        {/*            <div className='about-course mb-30' style={{ padding: '40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)' }}>*/}
                        {/*                <h4 className='text-center text-uppercase' style={h4Style}>*/}
                        {/*                    Các buổi ký kết thỏa thuận hợp tác với doanh nghiệp*/}
                        {/*                </h4>*/}
                        {/*                {hopTacBox}*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        {/*    </div>: null*/}
                        {/*    }*/}
                        {/*{company.listTiepDoan && company.listTiepDoan.length?*/}
                        {/*    <div className='col-12' style={{ marginBottom: '100px' }}>*/}
                        {/*        <div className='course--content'>*/}
                        {/*            <div className='about-course mb-30' style={{ padding: '40px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)' }}>*/}
                        {/*                <h4 className='text-center text-uppercase' style={h4Style}>*/}
                        {/*                    Các buổi tiếp đoàn với doanh nghiệp*/}
                        {/*                </h4>*/}
                        {/*                {tiepDoanBox}*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        {/*    </div>: null*/}
                        {/*}*/}
                    </div>
                ) : <p>{language.noInfo}</p>}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeGetCompanyDoiTac };
export default connect(mapStateToProps, mapActionsToProps)(PageCompany);