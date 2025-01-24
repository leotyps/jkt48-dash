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
    type: 'line', // Tetap menggunakan tipe garis
    toolbar: {
      show: false, // Nonaktifkan toolbar
    },
    zoom: {
      enabled: true, // Aktifkan fitur zoom
      type: 'x',
      autoScaleYaxis: true,
    },
    dropShadow: {
      enabled: true,
      top: 10,
      left: 0,
      blur: 3,
      opacity: 0.2,
      color: '#00E396', // Warna garis dengan efek drop shadow
    },
  },
  tooltip: {
    theme: theme,
    x: {
      format: 'dd MMM yyyy HH:mm', // Format tanggal untuk tooltip
    },
    y: {
      formatter: (value) => value.toFixed(2), // Format angka dua desimal
    },
  },
  markers: {
    size: 4, // Ukuran marker
    colors: ['#00E396'], // Warna marker
    strokeColors: '#ffffff', // Warna garis luar marker
    strokeWidth: 2,
    hover: {
      size: 6, // Ukuran marker saat hover
    },
  },
  stroke: {
    curve: 'smooth', // Gaya garis "smooth"
    width: 2, // Ketebalan garis
    colors: ['#00E396'], // Warna garis
  },
  legend: {
    labels: {
      colors: textColorSecondary,
    },
  },
  grid: {
    show: true, // Aktifkan grid
    borderColor: '#EDEDED', // Warna grid abu-abu terang
    strokeDashArray: 4, // Garis grid putus-putus
  },
  yaxis: {
    labels: {
      style: {
        colors: textColorSecondary,
      },
    },
    decimalsInFloat: 2, // Format angka desimal
  },
  xaxis: {
    type: 'datetime', // Sumbu X dengan tipe datetime
    labels: {
      style: {
        colors: textColorSecondary,
        fontSize: '12px',
        fontWeight: '500',
      },
    },
    axisTicks: {
      show: true,
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

