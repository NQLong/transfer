import React from 'react';
import TextInput, { Select } from 'view/component/Input';

const keyword = [
    { value: 't', text: 'Nhan đề' },
    { value: 'a', text: 'Tác giả' },
    { value: 'd', text: 'Chủ đề' },
    { value: 'j', text: 'Ký hiệu xếp giá' },
    { value: 'i', text: 'ISBN/ISSN' },
    { value: 'c', text: 'BARCODE' },
];
const libraries = [
    { value: '1', text: 'Tất cả các thư viện' },
    { value: '2', text: 'Thư viện trung tâm' },
    { value: '5', text: 'TV ĐH Bách Khoa' },
    { value: '8', text: 'TV ĐH Khoa học tự nhiên' },
    { value: '17', text: 'TV ĐH Công nghệ thông tin' },
    { value: '18', text: 'TV ĐH Kinh tế - Luật' },
    { value: '14', text: 'TV ĐH Quốc tế' },


];
class searchPage extends React.Component {

    constructor(props) {
        super(props);
        this.language = React.createRef();
    }

    componentDidMount() {
        this.searchType.setOption({ value: 'X', text: 'Từ khóa bất kỳ' });
        this.searchScope.setOption({ value: '11', text: 'TV ĐH Khoa học Xã hội & Nhân văn' });

    }
    search = () => {
        if ($('#tab2:visible').attr('id')) {
            if (this.keyword2.val()) {
                window.open(`http://search.ebscohost.com/login.aspx?direct=true&scope=site&site=eds-live&authtype=ip%2Cguest&custid=ns266778&groupid=main&profid=eds&bquery=${this.keyword2.val()}`, '_blank');
            }
        } else {
            window.open(`https://opac.vnulib.edu.vn/search*eng/?searchtype=${this.searchType.val()}&SORT=D&searcharg=${this.keyword1.val()}&searchscope=${this.searchScope.val()}`, '_blank');
        }

    }
    render() {
        return (
            <section data-aos='fade-up' className='row p-3'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0, }}><strong>Tra cứu tài liệu</strong></h3>
                </div>
                <div className='col-12' style={{ marginTop: 30 }}>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#tab1'>OPAC</a></li>
                        <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#tab2'>Tất cả các nguồn</a></li>
                    </ul>
                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='tab1'>
                            <div className='form-group row' style={{ paddingTop: 10 }}>
                                <div className='col-md-6 col-lg-4'>
                                    <Select label='    ' ref={e => this.searchType = e} data={keyword} hideSearchBox={true} />
                                </div>
                                <div className='col-md-6 col-lg-4'>
                                    <TextInput ref={e => this.keyword1 = e} label='   ' placeholder='Nhập từ khóa' disabled={false} />
                                </div>
                                <div className='col-md-6 col-lg-4' >
                                    <Select label='   ' ref={e => this.searchScope = e} data={libraries} />
                                </div>
                            </div>
                        </div>
                        <div className='tab-pane fade' id='tab2'>
                            <div className='form-group row' style={{ paddingTop: 10 }}>
                                <div className='col-md-6'>
                                    <TextInput ref={e => this.keyword2 = e} label='  ' placeholder='Nhập từ khóa' disabled={false} />
                                </div>
                            </div>

                        </div>
                        <div className='form-group' style={{ paddingLeft: 15, paddingTop: 10 }}>
                            <button className='btn btn-primary' style={{ borderRadius: 3, backgroundColor: '#0139A6' }}
                                type='button' onClick={e => this.search()}>
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
            </section >);
    }
}
export default searchPage;