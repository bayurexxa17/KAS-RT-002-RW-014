import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ data, year }) => {
    const chartData = useMemo(() => {
        const currentYear = year || new Date().getFullYear();
        const categoryMap = {};

        if (data) {
            data.forEach(t => {
                const date = new Date(t.tanggal);
                if (date.getFullYear() === currentYear && t.tipe === 'Pengeluaran') {
                    if (!categoryMap[t.kategori]) {
                        categoryMap[t.kategori] = 0;
                    }
                    categoryMap[t.kategori] += t.jumlah;
                }
            });
        }

        const labels = Object.keys(categoryMap);
        const values = Object.values(categoryMap);

        // Argon/Modern Colors Palette
        const backgroundColors = [
            '#f5365c', // Danger Red
            '#fb6340', // Orange
            '#ffd600', // Yellow
            '#2dce89', // Success Green
            '#11cdef', // Info Blue
            '#5e72e4', // Primary Blue
            '#8965e0', // Purple
        ];

        return {
            labels: labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderColor: '#ffffff',
                    borderWidth: 2,
                },
            ],
        };
    }, [data, year]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: '"Open Sans", sans-serif',
                        size: 11
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
        cutout: '70%', // Doughnut style
    };

    if (chartData.labels.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                <p className="text-xs font-bold uppercase tracking-widest">Belum ada pengeluaran</p>
                <p className="text-[10px]">Tahun {year || new Date().getFullYear()}</p>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <Doughnut data={chartData} options={options} />
        </div>
    );
};

export default ExpensePieChart;
