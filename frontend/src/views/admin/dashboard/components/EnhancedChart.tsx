import { Box, useColorMode } from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnhancedChartProps {
  periodData: { text: string; value: number; count: number }[];
  dataType: 'sales' | 'revenue';
}

const EnhancedChart = ({ periodData, dataType }: EnhancedChartProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Create gradient colors
  const createGradient = (ctx: CanvasRenderingContext2D, color1: string, color2: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };

  const data = {
    labels: periodData.map((item) => item.text),
    datasets: [
      {
        label: dataType === 'sales' ? 'Orders' : 'Revenue (₹)',
        data: periodData.map((item) => (dataType === 'sales' ? item.count : item.value)),
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return dataType === 'sales' 
              ? 'rgba(153, 102, 255, 0.6)' 
              : 'rgba(75, 192, 192, 0.6)';
          }
          return createGradient(
            ctx,
            dataType === 'sales' 
              ? 'rgba(153, 102, 255, 0.8)' 
              : 'rgba(75, 192, 192, 0.8)',
            dataType === 'sales' 
              ? 'rgba(153, 102, 255, 0.2)' 
              : 'rgba(75, 192, 192, 0.2)'
          );
        },
        borderColor: dataType === 'sales' 
          ? 'rgba(153, 102, 255, 1)' 
          : 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        titleColor: isDark ? 'black' : 'white',
        bodyColor: isDark ? 'black' : 'white',
        borderColor: dataType === 'sales' ? 'rgba(153, 102, 255, 1)' : 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            if (dataType === 'sales') {
              return `Orders: ${context.parsed.y}`;
            } else {
              return `Revenue: ₹${context.parsed.y.toLocaleString('en-IN')}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#A0AEC0' : '#718096',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#A0AEC0' : '#718096',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            if (dataType === 'revenue') {
              return '₹' + value.toLocaleString('en-IN');
            }
            return value;
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <Box h={{ base: '250px', md: '300px', lg: '350px' }}>
      <Bar data={data} options={options} />
    </Box>
  );
};

export default EnhancedChart;

