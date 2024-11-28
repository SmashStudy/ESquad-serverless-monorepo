import React, {useEffect, useState} from 'react';
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
import Layout from './Layout';
import useUserEmail from "../../hooks/user/UseUserEmail.jsx";
import useUserUsage from "../../hooks/storage/UseUserUsage.jsx";
import {formatFileSize} from "../../utils/fileFormatUtils.js";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];
const MAX_USAGE = 5 * 1024 * 1024 * 1024; // 5GB in bytes

const UserStorageUsage = () => {
  const [loading, setLoading] = useState()
  const { email, error: emailError} = useUserEmail();
  const {usage, userLoading, error: usageError} = useUserUsage(email);

  const s3Usage = usage || 0; // Bytes
  const remaining = MAX_USAGE - s3Usage;

  const pieData = [
    {name: '사용됨', value: s3Usage},
    {name: '남은 공간', value: remaining > 0 ? remaining : 0},
  ];

  return (
      <Layout>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{marginBottom: 2}}>
                  S3 Storage Usage
                </Typography>
                {loading ? (
                    <Typography variant="body1">Loading...</Typography>
                ) : usageError || emailError ? (
                    <Typography variant="body1" color="error">
                      Error: {usageError?.message || emailError?.message}
                    </Typography>
                ) : (
                    <>
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
                          사용됨: {formatFileSize(s3Usage)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          남은 공간: {formatFileSize(remaining)}
                        </Typography>
                      </Box>
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
                              label={({name, value, percent}) =>
                                  `${name}: ${formatFileSize(value)} (${(percent
                                      * 100).toFixed(2)}%)`
                              }
                          >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}/>
                            ))}
                          </Pie>
                          <Tooltip
                              formatter={(value) => formatFileSize(value)}/>
                          <Tooltip/>
                        </PieChart>
                      </ResponsiveContainer>
                    </>
                )}
              </CardContent>
            </Card>
      </Layout>
  );
};

export default UserStorageUsage;
