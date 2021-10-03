import React from 'react';
import fwHome from 'modules/_default/fwHome/index';
import fwNews from 'modules/_default/fwNews/index';
import fwEvent from 'modules/_default/fwEvent/index';
import fwContact from 'modules/_default/fwContact/index';
import fWLoaiDonVi from 'modules/mdDanhMuc/dmLoaiDonVi/index';
import fwThuVien from 'modules/_default/fwThuvien/index';
export default class MenuPage extends React.Component {
    state = { component: null };

    componentDidMount() {
        T.get('/api/menu', { language: T.language() }, res => {
            if (res.error) {
                // this.props.history.push('/');
                window.open('/', '_self');
            } else {
                this.setState({ component: res });
            }
        });
    }

    renderComponents(index, ins, outs, isFirst) {
        if (index < ins.length) {
            let item = ins[index],
                itemView = null,
                itemStyle = {};
            if (item.style) {
                let [key, value] = item.style.split(':');
                key = key ? key.trim() : '';
                value = value ? value.trim() : '';
                itemStyle[key] = value;
            }
            if (item.viewType == 'carousel') {
                itemView = <fwHome.Section.SectionCarousel viewId={item.viewId} />;
            } else if (item.viewType == 'video') {
                itemView = <fwHome.Section.SectionVideo item={item} />;
            } else if (item.viewType == 'feature') {
                itemView = <fwHome.Section.SectionFeature featureId={item.viewId} />;
            } else if (item.viewType == 'last news') {
                itemView = <fwNews.Section.SectionNews />;
            } else if (item.viewType == 'last events') {
                itemView = <fwEvent.Section.SectionEvent item={item} />;
            } else if (item.viewType == 'all news') {
                itemView = <fwNews.Section.SectionNewsList item={item} />;
            } else if (item.viewType == 'all events') {
                itemView = <fwEvent.Section.SectionEventList item={item} />;
            } else if (item.viewType == 'all divisions') {
                itemView = <fWLoaiDonVi.Section.SectionAllDivision viewId={item.viewId} />;
            } else if (item.viewType == 'notification') {
                itemView = <fwNews.Section.SectionNotification item={item} />;
            } else if (item.viewType == 'admission') {
                itemView = <fwNews.Section.SectionAdmission />;
            } else if (item.viewType == 'gallery') {
                itemView = <fwHome.Section.SectionGallery item={item} />;
            } else if (item.viewType == 'content') {
                itemView = <fwHome.Section.SectionContent contentId={item.viewId} />;
            } else if (item.viewType == 'contact') {
                itemView = <fwContact.Section.SectionContact />;
            } else if (item.viewType == 'tin tức chung' && item.detail && JSON.parse(item.detail).viewTypeDisplay == 'Template 1') {
                itemView = <fwNews.Section.SectionNews item={item} />;
            } else if (item.viewType == 'tin tức chung' && item.detail && JSON.parse(item.detail).viewTypeDisplay == 'Template 2') {
                itemView = <fwNews.Section.SectionAdmission item={item} />;
            } else if (item.viewType == 'tin tức chung' && item.detail && JSON.parse(item.detail).viewTypeDisplay == 'Template 3') {
                itemView = <fwNews.Section.SectionHighLightNews item={item} />;
            } else if (item.viewType == 'tin tức chung' && item.detail && JSON.parse(item.detail).viewTypeDisplay == 'Template 4') {
                itemView = <fwNews.Section.SectionInsight item={item} />;
            } else if (item.viewType == 'thư viện' && item.detail && JSON.parse(item.detail).viewTypeDisplay == 'Tìm kiếm') {
                itemView = <fwThuVien.Section.SectionSearch item={item} />;
            } else if (item.viewType == 'thư viện' && item.detail && JSON.parse(item.detail).viewTypeDisplay == 'Giới thiệu sách') {
                itemView = <fwThuVien.Section.SectionDocumentIntro item={item} />;
            } else if (item.viewType == 'thư viện' && item.detail && JSON.parse(item.detail).viewTypeDisplay == 'CSDL') {
                itemView = <fwThuVien.Section.SectionIntro item={item} />;
            } else if (item.viewType == 'thư viện' && item.detail && JSON.parse(item.detail).viewTypeDisplay == 'Hỗ trợ') {
                itemView = <fwThuVien.Section.SectionSupport item={item} />;
            }

            let childComponents = [];
            if (item.components) {
                this.renderComponents(0, item.components, childComponents);
            }

            outs.push(
                <div key={index} className={item.className + (isFirst ? ' first-component' : '')} style={itemStyle}>
                    {itemView}
                    {childComponents}
                </div>
            );
            outs.push(this.renderComponents(index + 1, ins, outs));
        }
    }

    render() {
        let components = [];
        if (this.state.component) {
            this.renderComponents(0, [this.state.component], components, true);
        }
        return components;
    }
}