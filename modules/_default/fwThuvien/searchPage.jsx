import React from 'react';
import TextInput, { Select } from 'view/component/Input';

const keywordVi = [
    { value: 't', text: 'Nhan đề' },
    { value: 'a', text: 'Tác giả' },
    { value: 'd', text: 'Chủ đề' },
    { value: 'j', text: 'Ký hiệu xếp giá' },
    { value: 'i', text: 'ISBN/ISSN' },
    { value: 'c', text: 'BARCODE' },
];
const keywordEn = [
    { value: 't', text: 'Title' },
    { value: 'a', text: 'Author' },
    { value: 'd', text: 'Subject' },
    { value: 'j', text: 'Call Number' },
    { value: 'i', text: 'ISBN/ISSN' },
    { value: 'c', text: 'BARCODE' },
];
const librariesVi = [
    { value: '1', text: 'Tất cả các thư viện' },
    { value: '2', text: 'Thư viện trung tâm' },
    { value: '5', text: 'TV ĐH Bách Khoa' },
    { value: '8', text: 'TV ĐH Khoa học tự nhiên' },
    { value: '17', text: 'TV ĐH Công nghệ thông tin' },
    { value: '18', text: 'TV ĐH Kinh tế - Luật' },
    { value: '14', text: 'TV ĐH Quốc tế' },
];
const librariesEn = [
    { value: '1', text: 'View All Libraries' },
    { value: '2', text: 'Central Library' },
    { value: '5', text: 'University of Technology Library' },
    { value: '8', text: 'University of Science Library' },
    { value: '17', text: 'University of Information Technology Library' },
    { value: '18', text: 'University of Economics and Law Library' },
    { value: '14', text: 'International University Library' },
];

class searchPage extends React.Component {

    constructor(props) {
        super(props);
        this.language = React.createRef();
    }

    componentDidMount() {
        this.searchType.setOption({ value: 'X', text: T.language() == 'vi' ? 'Từ khóa bất kỳ' : 'Keyword' });
        this.searchScope.setOption({ value: '11', text: T.language() == 'vi' ? 'TV ĐH Khoa học Xã hội & Nhân văn' : 'HCMUSSH Library' });

    }
    onChange = (key) => {
        if (key == 'Enter') this.search();
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
        const detail = JSON.parse(this.props?.item?.detail || {});
        const viLanguage = T.language() == 'vi';
        return (
            <section data-aos='fade-up' className='row p-3'>
                <div className='col-12 homeBorderLeft'>
                    <h3 className='homeTitle' style={{ color: '#0139A6', margin: 0, }}><strong>{detail.valueTitleCom || 'Tra cứu tài liệu'}</strong></h3>
                </div>
                <div className='col-12' style={{ marginTop: 30 }}>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'><a className='nav-link active show' data-toggle='tab' href='#tab1'>OPAC</a></li>
                        <li className='nav-item'><a className='nav-link' data-toggle='tab' href='#tab2'>{viLanguage ? 'Tất cả các nguồn' : 'VNU-HCM Libraries Catalog'}</a></li>
                    </ul>
                    <div className='tab-content tile'>
                        <div className='tab-pane fade active show' id='tab1'>
                            <div className='form-group row' style={{ paddingTop: 10 }}>
                                <div className='col-md-6 col-lg-4'>
                                    <Select label='    ' ref={e => this.searchType = e} data={viLanguage ? keywordVi : keywordEn} hideSearchBox={true} />
                                </div>
                                <div className='col-md-6 col-lg-4'>
                                    <TextInput ref={e => this.keyword1 = e} label='   ' placeholder={viLanguage ? 'Nhập từ khóa' : 'Insert keyword'} disabled={false} onKeyPress={e => this.onChange(e.key)} />
                                </div>
                                <div className='col-md-6 col-lg-4'>
                                    <Select label='   ' ref={e => this.searchScope = e} data={viLanguage ? librariesVi : librariesEn} />
                                </div>
                            </div>
                        </div>
                        <div className='tab-pane fade' id='tab2'>
                            <div className='form-group row' style={{ paddingTop: 10 }}>
                                <div className='col-md-6'>
                                    <TextInput ref={e => this.keyword2 = e} label='  ' placeholder='Nhập từ khóa' disabled={false} onKeyPress={e => this.onChange(e.key)} />
                                </div>
                            </div>

                        </div>
                        <div className='form-group' style={{ paddingLeft: 15, paddingTop: 10 }}>
                            <button className='btn btn-primary' style={{ borderRadius: 3, backgroundColor: '#0139A6' }}
                                type='button' onClick={() => this.search()}>
                                {viLanguage ? 'Tìm kiếm' : 'Search'}
                            </button>
                        </div>
                    </div>
                </div>
            </section >);
    }
}
export default searchPage;