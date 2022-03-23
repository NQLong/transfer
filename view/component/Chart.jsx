
import React from 'react';

export const DefaultColors = {
    red: '#dc3545',
    orange: 'rgb(255, 159, 64)',
    yellow: '#ffc107',
    green: '#28a745',
    blue: '#007bff',
    info: '#11a2b8',
    grey: 'rgb(201, 203, 207)',
    purple: 'rgb(153, 102, 255)',
};
export class AdminChart extends React.Component {

    optionChart = (type, isPercent = null) => {
        return {
            aspectRatio: 1.7,
            events: false,
            legend: {
                position: 'bottom'
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 20,
                    bottom: 0
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart',
                onComplete: function () {
                    let chartInstance = this.chart,
                        ctx = chartInstance.ctx;
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    if (type === 'pie' || type === 'doughnut') {
                        this.data.datasets.forEach(function (dataset) {

                            for (let i = 0; i < dataset.data.length; i++) {
                                let model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,

                                    mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
                                    start_angle = model.startAngle,
                                    end_angle = model.endAngle,
                                    mid_angle = start_angle + (end_angle - start_angle) / 2;

                                let x = mid_radius * Math.cos(mid_angle);
                                let y = mid_radius * Math.sin(mid_angle);

                                ctx.fillStyle = '#fff';
                                if (i == 3) { // Darker text color for lighter background
                                    ctx.fillStyle = '#444';
                                }

                                let valueDisplay = dataset.data[i];
                                if (isPercent) {
                                    let total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                                        percent = String(Math.round(dataset.data[i] / total * 100)) + '%';
                                    valueDisplay = percent;
                                }
                                //Don't Display if value is 0
                                if (dataset.data[i] != 0) {
                                    ctx.fillText(valueDisplay, model.x + x, model.y + y + 5);
                                }
                            }
                        });
                    } else if (type === 'bar' || type === 'line') {
                        this.data.datasets.forEach(function (dataset, i) {
                            let meta = chartInstance.controller.getDatasetMeta(i);
                            meta.data.forEach(function (bar, index) {
                                let data = dataset.data[index];
                                ctx.fillText(data, bar._model.x, bar._model.y - 6);
                            });
                        });
                    }
                }
            }
        };
    }

    componentDidMount() {
        let { type = null, data = {}, percent = null } = this.props;
        this.chart = new window.Chart(this.canvasChart, this.init(type, data, percent));
    }

    componentDidUpdate(prevProps) {
        const prevConfig = prevProps.data;
        const config = this.props.data;

        const prevDatasets = prevConfig.datasets ? prevConfig.datasets : [];
        const thisDatasets = config.datasets ? config.datasets : [];
        if (prevDatasets.length || (thisDatasets.length && JSON.stringify(prevDatasets) !== JSON.stringify(thisDatasets))) {
            this.chart.data = config;
            this.chart.update();
        }
    }

    init = (type, data, percent) => {
        return {
            type: type,
            data: {
                datasets: data.datasets,
                labels: data.labels
            },
            options: this.optionChart(type, percent)
        };
    }

    render = () => <canvas ref={e => this.canvasChart = e} />;
}