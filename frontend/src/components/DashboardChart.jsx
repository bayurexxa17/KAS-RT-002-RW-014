import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const DashboardChart = ({ data, year }) => {
    const chartData = useMemo(() => {
        // Init last 12 months buckets
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = year || new Date().getFullYear();


        // Initialize arrays with 0
        const incomeData = new Array(12).fill(0);
        const expenseData = new Array(12).fill(0);

        if (data && data.length > 0) {
            data.forEach(t => {
                const date = new Date(t.tanggal);
                if (date.getFullYear() === currentYear) {
                    const monthIdx = date.getMonth();
                    if (t.tipe === 'Pemasukan') {
                        incomeData[monthIdx] += t.jumlah;
                    } else if (t.tipe === 'Pengeluaran') {
                        expenseData[monthIdx] += t.jumlah;
                    }
                }
            });
        }


        return {
            labels: months,
            datasets: [
                {
                    label: 'Pemasukan',
                    data: incomeData,
                    borderColor: '#5e72e4', // Argon Primary Blue
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(94, 114, 228, 0.4)'); // Primary with opacity
                        gradient.addColorStop(1, 'rgba(94, 114, 228, 0.05)');
                        return gradient;
                    },
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: true,
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData,
                    borderColor: '#f5365c', // Argon Danger Red
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    fill: false,
                }
            ],

        };
    }, [data, year]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#fff',
                titleColor: '#32325d',
                bodyColor: '#32325d',
                borderColor: '#e9ecef',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#8898aa',
                    font: {
                        family: '"Open Sans", sans-serif',
                        size: 11
                    }
                }
            },
            y: {
                grid: {
                    color: '#f4f5f7',
                    borderDash: [5, 5],
                    drawBorder: false,
                },
                ticks: {
                    color: '#8898aa',
                    padding: 10,
                    callback: function (value) {
                        if (value >= 1000000) return 'Rp' + value / 1000000 + 'Jt';
                        if (value >= 1000) return 'Rp' + value / 1000 + 'rb';
                        return value;
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="h-[300px] w-full">
            <Line options={options} data={chartData} />
        </div>
    );
};

export default DashboardChart;
