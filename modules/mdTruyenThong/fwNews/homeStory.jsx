import React from 'react';
import { connect } from 'react-redux';
import { getNewsByUser } from './redux';

class NewsDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = { language: '' };
  }

  componentDidMount() {
    let url = window.location.pathname,
      params = T.routeMatcher('/story/:link').parse(url);
    this.setState({
      id: null,
      link: params.link,
      type: 'vi'
    });
  }

  componentDidUpdate() {
    if (this.state.language != T.language()) {
      this.props.getNewsByUser(this.state.id, this.state.link, this.state.type);
      this.setState({ language: T.language() });
    }

    setTimeout(() => {
      T.ftcoAnimate();
      $('html, body').stop().animate({ scrollTop: 0 }, 500, 'swing');
    }, 250);
  }

  render() {
    const item = this.props.news && this.props.news.userNews ? this.props.news.userNews : null;
    const width = $(window).width();
    if (item == null) {
      return <p>...</p>;
    } else {
      let categories = !item.categories ? [] : item.categories.map((categorieItem, index) =>
        <a key={index} href='#' className='tag-cloud-link'>{T.language.parse(categorieItem.text)}</a>);
      let attachments = item.listAttachment ? attachments = item.listAttachment.map((item, index) =>
        <div key={index}>
          <a href={'/download/' + item.path} download>{item.nameDisplay} </a>
        </div>
      ) : null;
      let content = T.language.parse(item.content)
        .replaceAll('<strong>', '<b style="font-weight: bold;">')
        .replaceAll('</strong>', '</b>');
      return (
        <section className='ftco-section ftco-degree-bg'>
          <div className='container-fluid'>
            <div className='row'>
              <div className='col-md-12 ftco-animate'>
                <h2 className='mb-3' style={{ fontSize: width < 500 ? '25px' : '30px' }}>
                  {T.language.parse(item.title)}
                </h2>
                {item.displayCover && item.image ?
                  <p style={{ display: 'block', textAlign: 'center' }}>
                    <img src={item.image}
                      style={{ width: '100%' }} className='img-fluid'
                      alt={item.isTranslate == 1 ? T.language.parse(item.title) : T.language.parse(item.title, true)[item.language]} />
                  </p> : null}
                <p className='homeContent'
                  dangerouslySetInnerHTML={{
                    __html: content
                  }} />
                {attachments &&
                  <div>
                    Tệp tin đính kèm:
                                   {attachments}
                  </div>}
                {width < 500 ? <div style={{ width: '100%', }}>
                  <img src='https://i.giphy.com/media/Y3alJyRof3xcddXkew/giphy.webp' style={{ width: '100%', height: '100%', }} />
                </div> : null}

                <div className='tag-widget post-tag-container mb-5 mt-5'>
                  <div className='tagcloud'>
                    {categories}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }
  }
}

const mapStateToProps = state => ({ news: state.news });
const mapActionsToProps = { getNewsByUser };
export default connect(mapStateToProps, mapActionsToProps)(NewsDetail);