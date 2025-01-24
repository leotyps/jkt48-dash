import { useColorModeValue, useToken } from "@chakra-ui/react";
import { deepmerge } from "deepmerge-ts";
import dynamic from "next/dynamic";
import type { Props as ChartProps } from "react-apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function StyledChart(props: ChartProps) {
  const theme = useColorModeValue("light", "dark");
  const [textColorPrimary, textColorSecondary, lineHighlight] = useToken("colors", [
    "TextPrimary",
    "TextSecondary",
    "blue.500", // Warna highlight untuk garis
  ]);

  const options: ApexCharts.ApexOptions = {
    chart: {
      toolbar: {
        show: true,
      },
      dropShadow: {
        enabled: true,
        top: 10,
        left: 0,
        blur: 5,
        opacity: 0.3,
        color: lineHighlight,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      theme: theme,
      x: {
        show: true,
        format: "dd MMM yyyy HH:mm", // Format lebih detail seperti kripto
      },
    },
    markers: {
      size: 4,
      colors: ["#ffffff"],
      strokeColors: lineHighlight,
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3, // Ketebalan garis
      colors: [lineHighlight],
    },
    fill: {
      type: "gradient", // Tambahkan efek gradien
      gradient: {
        shade: theme,
        type: "vertical",
        gradientToColors: ["rgba(67, 24, 255, 0.2)"],
        stops: [0, 90, 100],
      },
    },
    legend: {
      labels: {
        colors: textColorSecondary,
      },
    },
    grid: {
      show: true,
      borderColor: textColorSecondary,
      strokeDashArray: 4,
    },
    yaxis: {
      labels: {
        style: {
          colors: textColorSecondary,
        },
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: textColorSecondary,
          fontSize: "12px",
          fontWeight: "500",
        },
      },
      type: "datetime", // Format waktu untuk chart kripto
    },
  };

  return <Chart {...props} options={deepmerge(options, props.options)} />;
}
