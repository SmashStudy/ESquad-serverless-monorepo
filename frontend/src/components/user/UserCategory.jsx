import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Layout from './Layout'; // Layout 컴포넌트 재사용

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];
const MAX_USAGE = 5 * 1024; // 5GB in MB

const Category = () => {
  // S3 데이터
  const usageData = [
    { name: 'S3', usage: 1200, cost: 15 }, // Usage in MB
  ];

  const s3Usage = usageData[0].usage; // MB
  const remaining = MAX_USAGE - s3Usage;

  // 파이 차트 데이터
  const pieData = [
    { name: 'Used', value: s3Usage }, // S3 사용량
    { name: 'Remaining', value: remaining }, // 남은 용량
  ];

  return (
    <Layout>
      <Grid container spacing={3}>
        {/* S3 Storage Usage Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                S3 Storage Usage
              </Typography>
              {/* Storage Information */}
              <Box
                sx={{
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  padding: 1.5,
                  marginBottom: 2,
                }}
              >
                <Typography variant="body1">S3</Typography>
                <Typography variant="body2" color="textSecondary">
                  Used: {(s3Usage / 1024).toFixed(2)} GB
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Remaining: {(remaining / 1024).toFixed(2)} GB
                </Typography>
              </Box>
              {/* Pie Chart */}
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={200}
                    fill="#8884d8"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Category;
