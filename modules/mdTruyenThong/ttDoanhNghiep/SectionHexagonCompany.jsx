import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { homeGetAllCompanies } from './reduxDoanhNghiep';
import './sectionHexagon.scss';

const settings = {
    maxColumns: 10,
    maxBoxMargin: 100
};

const logoBoxStyle = {
    width: 0, height: 0,
    transition: '1.5s all',
    position: 'absolute',
    overflow: 'visible'
};

class SectionHexagonCompany extends React.Component {
    state = { boxes: null, companies: [] };

    componentDidMount() {
        $(document).ready(() => {
            this.props.homeGetAllCompanies(this.props.loai, items => {
                if (items) {
                    // Shuffle companies array
                    const indexes = Array.from(Array(items.length).keys()), companies = [];
                    for (let i = 0; i < items.length; i++) {
                        let j = Math.floor(Math.random() * indexes.length), company = Object.assign({}, items[indexes[j]]);
                        indexes.splice(j, 1);
                        companies.push(company);
                    }
                    this.onResize(true, () => {
                        this.initItem(companies);
                        $('footer').fadeOut();
                        setTimeout(() => this.onResize(false), 750);
                    });
                }
            });

            $(window).on('resize', () => this.onResize(false));
        });
    }

    componentWillUnmount() {
        $(window).off('resize');
        $('footer').fadeIn();
    }

    onResize = (initial, done = () => { }) => {
        const windowWidth = window.innerWidth;
        // Responsive: 0, 576, 768, 992, 1200
        let boxMargin, columns;
        if (windowWidth >= 1200) {
            boxMargin = settings.maxBoxMargin;
            columns = settings.maxColumns;
        } else if (windowWidth >= 992) {
            boxMargin = settings.maxBoxMargin - 20;
            columns = settings.maxColumns - 2;
        } else if (windowWidth >= 768) {
            boxMargin = settings.maxBoxMargin - 50;
            columns = settings.maxColumns - 3;
        } else if (windowWidth >= 576) {
            boxMargin = settings.maxBoxMargin - 50;
            columns = Math.max(6, settings.maxColumns - 4);
        } else {
            boxMargin = 5;
            columns = Math.max(5, settings.maxColumns - 5);
        }

        // Calculate item size
        const boxWidth = windowWidth - 2 * boxMargin;
        const itemSize = boxWidth / columns;
        this.boxArea.style.width = boxWidth + 'px';
        this.boxArea.style.marginLeft = boxMargin + 'px';

        if (!initial) {
            const boxElements = this.boxArea.children;
            for (let i = 0; i < boxElements.length; i++) {
                const item = boxElements[i];
                const index = parseInt(item.dataset.index);
                const defs = item.children[0], pattern = defs.children[0], image = pattern.children[0];
                const polygon = item.children[1];

                const { col, row } = this.getPosition(index + 1, columns);
                item.style.width = itemSize + 'px';
                item.style.height = itemSize + 'px';
                item.style.top = ((row - 1) * 53 * itemSize / 60) + 'px';
                item.style.left = row % 2 == 1 ? (((col - 1) * itemSize) + 'px') : (((col * itemSize) - itemSize / 2) + 'px');
                const viewBox = `${-itemSize / 15} 0 ${itemSize} ${itemSize / 2}`;
                pattern.setAttribute('viewBox', viewBox);
                pattern.setAttribute('width', itemSize);
                pattern.setAttribute('height', itemSize);
                image.setAttribute('width', 13 * itemSize / 15);
                image.setAttribute('height', itemSize / 2);

                const points = `${itemSize / 2},${itemSize} ${itemSize / 15},${3 * itemSize / 4} ${itemSize / 15},${itemSize / 4} ${itemSize / 2},0 ${14 * itemSize / 15},${itemSize / 4} ${14 * itemSize / 15},${3 * itemSize / 4}`;
                polygon.setAttribute('points', points);
            }
        }

        done && done();
    }

    getPosition = (index, maxColumn) => {
        let currentCol = 1, currentRow = 1;
        if (index <= maxColumn) {
            currentCol = index;
        }

        while ((currentRow % 2 == 1 && index > maxColumn) || (currentRow % 2 == 0 && index > maxColumn - 1)) {
            if (currentRow % 2 == 1) index -= maxColumn;
            else index -= (maxColumn - 1);
            currentRow++;

            if ((currentRow % 2 == 1 && index <= maxColumn) || (currentRow % 2 == 0 && index <= maxColumn - 1)) {
                currentCol = index;
            }
        }

        return { col: currentCol, row: currentRow };
    }

    initItem = (companies) => {
        const boxLeft = parseFloat(this.boxArea.style.width) / 2, boxTop = (window.innerHeight - this.boxArea.offsetTop) / 2, boxes = [];
        for (let i = 0; i < companies.length; i++) {
            const company = { ...companies[i] };
            const style = {
                ...logoBoxStyle,
                left: boxLeft, top: boxTop,
                transition: (Math.random() + 1).toString() + 's all'
            };

            boxes.push(
                <svg key={company.id} className='hexagon-item' data-index={i} style={style} xmlns='http://www.w3.org/2000/svg' version='1.1' xmlnsXlink='http://www.w3.org/1999/xlink'>
                    <defs>
                        <pattern style={{ transition: '1.5s all' }} viewBox='0 0 0 0' id={'image-bg_' + company.id} x='0' y='0' height='0' width='0' patternUnits='userSpaceOnUse'>
                            <image width='0' height='0' xlinkHref={company.image || '/img/a_cong.png'} preserveAspectRatio='xMidYMid meet' />
                        </pattern>
                    </defs>
                    <polygon className='hex animate' onMouseMove={e => this.showTooltip(e, company.tenDayDu.viText())} onMouseOut={() => this.hideTooltip()}
                        points='0,0 0,0 0,0 0,0 0,0 0,0' fill={`url('#${'image-bg_' + company.id}')`} onClick={e => this.handleClick(e, company)} />
                </svg>
            );
        }
        this.setState({ boxes });
    }

    handleClick = (e, company) => {
        e.preventDefault();
        if (company.doiTac) {
            this.props.history.push(`/doanh-nghiep/${company.hiddenShortName}?${T.language.getLanguage()}`);
        } else {
            this.modal.show(company);
        }
    }

    showTooltip = (evt, text) => {
        const tooltip = $(this.tooltipArea);
        tooltip.html(text);
        tooltip.css('left', (evt.pageX + 10) + 'px');
        tooltip.css('top', (evt.pageY + 20) + 'px');
        tooltip.fadeIn(100);
    }

    hideTooltip = () => {
        const tooltip = $(this.tooltipArea);
        tooltip.fadeOut(10);
    }

    render() {
        return <>
            <div ref={e => this.boxArea = e} style={{ position: 'relative' }}>
                {this.state.boxes}
            </div>
            <div id='tooltip' ref={e => this.tooltipArea = e} style={{ position: 'absolute', display: 'none', background: 'rgba(0, 0, 0, 0.8)', color: '#fff', borderRadius: '5px', padding: '5px 10px' }} />
        </>;
    }
}

const mapStateToProps = state => ({ dnDoanhNghiep: state.doiNgoai.doanhNghiep });
const mapActionsToProps = { homeGetAllCompanies };
export default withRouter(connect(mapStateToProps, mapActionsToProps)(SectionHexagonCompany));