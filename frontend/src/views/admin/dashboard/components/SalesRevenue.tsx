import { Box } from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SalesAndRevenueProps {
  periodData: { text: string; value: number; count: number }[];
  dataType: 'sales' | 'revenue';
}

const SalesAndRevenue = ({ periodData, dataType }: SalesAndRevenueProps) => {
  const data = {
    labels: periodData.map((item) => item.text),
    datasets: [
      {
        label: dataType === 'sales' ? 'Orders' : 'Revenue',
        data: periodData.map((item) => (dataType === 'sales' ? item.count : item.value)),
        backgroundColor: dataType === 'sales' ? 'rgba(153, 102, 255, 0.6)' : 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: dataType === 'sales' ? 'Sales Overview' : 'Revenue Overview',
      },
    },
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Bar data={data} options={options} />
    </Box>
  );
};

export default SalesAndRevenue;