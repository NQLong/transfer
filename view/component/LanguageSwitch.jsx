import React from 'react';
import { connect } from 'react-redux';
import { homeMenuGet } from 'modules/_default/fwMenu/redux';

class LanguageSwitch extends React.Component {
    componentDidMount() {
        $(document).ready(() => {
            if (this.props.languages) {
                T.language.setLanguages(this.props.languages);
            }
        });
    }

    componentDidUpdate(prevProps) {
        $(document).ready(() => {
            if (this.props.languages && (!prevProps.languages || this.props.languages.toString() != prevProps.languages.toString())) {
                T.language.setLanguages(this.props.languages);
            }
        });
    }

    componentWillUnmount() {
        T.language.setLanguages(['vi', 'en']);
    }

    change = (e) => {
        this.onSwitch(e, T.language.next());
    }

    onSwitch = (e, keyCode) => {
        e.preventDefault();
        const languages = this.props.languages;
        let pathname = window.location.pathname;
        let newPathname = pathname;
        if (keyCode != 'vi') newPathname += (pathname == '/' ? '' : '/') + keyCode;
        this.props.homeMenuGet(newPathname, data => {
            if (data.menu) {
                window.open(newPathname, '_self');
            } else {
                window.open(pathname + '?lang=' + keyCode, '_self');
            }
        });
    }

    render() {
        const languages = this.props.languages && this.props.languages.length ? this.props.languages : ['vi', 'en'];
        if (languages.length <= 2) {
            return <img src={this.props.address == 'https://hcmussh.edu.vn/nvduc/de' ? '/img/flag/de.png' : `/img/flag/${T.language.next()}.png`} alt='Nation flag' style={{ height: '1.4vw', cursor: 'pointer' }} onClick={this.change} />;
        } else {
            let dropdownItems = languages.map((keyCode, index) =>
                <a key={index} className='dropdown-item' href='#' onClick={e => this.onSwitch(e, keyCode)}>
                    <img src={`/img/flag/${keyCode}.png`} alt={keyCode} style={{ height: '1.4vw' }} /> {keyCode}
                </a>);

            return <>
                <div className='dropdown' style={{ whiteSpace: 'nowrap', textDecoration: 'none', pointerEvents: 'auto' }}>
                    <a className='dropdown-toggle' href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                        <img src={this.props.address == 'https://hcmussh.edu.vn/nvduc/de' ? '/img/flag/de.png' : `/img/flag/${T.language()}.png`} alt='Nation flag' style={{ height: '1.4vw' }} />
                    </a>
                    <div className='dropdown-menu'>{dropdownItems}</div>
                </div>
            </>;
        }
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { homeMenuGet };
export default connect(mapStateToProps, mapActionsToProps)(LanguageSwitch);