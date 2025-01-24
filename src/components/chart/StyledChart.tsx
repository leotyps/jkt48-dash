import { useColorModeValue, useToken } from '@chakra-ui/react';
import { deepmerge } from 'deepmerge-ts';
import dynamic from 'next/dynamic';
import type { Props as ChartProps } from 'react-apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export function StyledChart(props: ChartProps) {
  const theme = useColorModeValue('light', 'dark');
  const [textColorPrimary, textColorSecondary] = useToken('colors', [
    'TextPrimary',
    'TextSecondary',
  ]);

const options: ApexCharts.ApexOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      top: 10,
      left: 0,
      blur: 5,
      opacity: 0.2,
      color: '#00E396', // Warna lebih segar menyerupai gaya crypto
    },
    zoom: {
      enabled: true, // Tambahkan zoom untuk interaktivitas
      type: 'x',
      autoScaleYaxis: true,
    },
  },
  tooltip: {
    fillSeriesColor: false,
    theme: theme,
    x: {
      show: true, // Menampilkan label waktu di tooltip
      format: 'dd MMM yyyy HH:mm',
    },
    y: {
      formatter: (value) => `${value.toFixed(2)}`, // Format angka dengan dua desimal
    },
  },
  markers: {
    size: 5, // Ukuran marker untuk titik data
    colors: ['#00E396'], // Warna marker lebih menonjol
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: {
      size: 7,
    },
  },
  stroke: {
    curve: 'stepline', // Ubah ke gaya garis "step line" menyerupai gaya crypto
    width: 2, // Lebih tipis untuk tampilan modern
    colors: ['#00E396'], // Warna garis
  },
  legend: {
    labels: {
      colors: textColorSecondary,
    },
  },
  grid: {
    show: true,
    borderColor: '#EDEDED', // Grid abu-abu ringan
    strokeDashArray: 4, // Garis putus-putus
  },
  yaxis: {
    labels: {
      style: {
        colors: textColorSecondary,
      },
    },
    decimalsInFloat: 2, // Format angka dengan dua desimal
  },
  xaxis: {
    type: 'datetime', // Tipe datetime untuk sumbu X
    labels: {
      style: {
        colors: textColorSecondary,
        fontSize: '12px',
        fontWeight: '500',
      },
    },
    axisTicks: {
      show: true, // Tampilkan garis penunjuk di sumbu
      color: '#EDEDED',
    },
    axisBorder: {
      show: true,
      color: '#EDEDED',
    },
  },
};

  return <Chart {...props} options={deepmerge(options, props.options)} />;
}

