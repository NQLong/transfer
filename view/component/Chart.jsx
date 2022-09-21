
import React from 'react';

export const DefaultColors = {
    blue: '#007bff',
    red: '#dc3545',
    yellow: '#ffc107',
    info: '#11a2b8',
    green: '#28a745',
    orange: 'rgb(255, 159, 64)',
    grey: 'rgb(201, 203, 207)',
    purple: 'rgb(153, 102, 255)',
    darkGrey: '#565656',
    lemon: '#DAF7A6',
    maroon: '#800000',
    olive: '#808000',
    navy: '#000080',
    fuchsia: '#FF00FF',
    lightGreen: '#40E0D0'
};

export class AdminChart extends React.Component {
    // canvasChart = React.ref()

    optionChart = (type, isPercent = null) => {
        return {
            aspectRatio: this.props.aspectRatio || 1.7,
            events: false,
            legend: {
                display: type === 'pie' || type === 'doughnut',
                position: 'bottom',
                labels: {
                    fontStyle: 'bold',
                    fontFamily: 'Roboto',
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 20,
                    bottom: 0
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: type === 'bar' || type === 'line' ? {
                yAxes: [{
                    ticks: {
                        display: false,
                        beginAtZero: true
                    }
                }],
            } : null,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart',
                onComplete: function () {
                    let chartInstance = this.chart,
                        ctx = chartInstance.ctx;
                    ctx.font = Chart.helpers.fontString(13, 'bold', Chart.defaults.global.defaultFontFamily);
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
                                if (i == 2) { // Darker text color for lighter background
                                    ctx.fillStyle = '#000';
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
        let { type = '', data = {}, percent = null } = this.props;
        this.init(type, data, percent);
    }

    componentDidUpdate(prevProps) {
        const prevConfig = prevProps.data;
        let { type = '', data = {}, percent = null } = this.props;
        if (JSON.stringify(Object.values(prevConfig)) !== JSON.stringify(Object.values(data))) {
            this.init(type, data, percent);
        }
    }

    init = (type, data, percent) => {
        let { labels = [], datas = {}, colors = null } = data;
        let datasets = [];
        new Promise(resolve => {
            if (!data) resolve({});
            else
                Object.keys(datas).forEach((label, index, array) => {
                    datasets.push({
                        label: label,
                        data: Object.values(datas)[index],
                        fill: false,
                        backgroundColor: type !== 'line' ? (colors ? (typeof colors === 'object' &&
                            !Array.isArray(colors) ? colors[label] : colors) : Object.values(DefaultColors)) : DefaultColors.darkGrey,
                        borderColor: type === 'line' ? colors : undefined
                    });
                    if (index === array.length - 1) {
                        resolve({
                            type: type,
                            data: {
                                datasets: datasets,
                                labels: labels
                            },
                            options: this.optionChart(type, percent)
                        });
                    }
                });
        }).then((initData) => {
            this.chart = new window.Chart(this.canvasChart, initData);
            this.chart.data = initData.data;
            this.chart.update();
        });

    }

    render = () => <canvas ref={e => this.canvasChart = e} />;
}