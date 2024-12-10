import React, { useEffect, useState } from "react";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import { TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { Card, CardContent, Typography, Box, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { styled } from "@mui/system";
import dummyData from "../../../../public/data/dummy_data.json";

// ECharts 등록
echarts.use([BarChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

// Styled components
const StyledCard = styled(Card)({
  width: "80%",
  margin: "20px auto",
  backgroundColor: "#f9f9f9",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  padding: "20px",
});

const StyledChartContainer = styled(Box)({
  width: "100%",
  height: "30vh",
});

const FilterContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  marginBottom: "20px",
});

const StudyTeamChart = ({ teamId }) => {
  const [chartInstance, setChartInstance] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("1"); // Default: January
  const [selectedWeek, setSelectedWeek] = useState("1주");

  // ECharts 차트 인스턴스 설정
  useEffect(() => {
    const chartDom = document.getElementById("team-study-chart");
    const chart = echarts.init(chartDom);
    setChartInstance(chart);

    return () => {
      chart.dispose(); // 컴포넌트 언마운트 시 ECharts 정리
    };
  }, []);

  // 차트 데이터 처리 및 ECharts 옵션 설정
  useEffect(() => {
    if (chartInstance) {
      const processedData = dummyData.reduce((acc, curr) => {
        const startDate = new Date(curr.start_At);
        const endDate = new Date(curr.end_At);

        if (curr.end_At && curr.start_At) {
          const month = (startDate.getMonth() + 1).toString(); // 1-indexed month
          const week = `${Math.ceil(startDate.getDate() / 7)}주`;
          const day = startDate.toISOString().split("T")[0];
          const team = curr.team_Id.split("#")[1];
          const duration = (endDate - startDate) / 60000; // in minutes

          if (!acc[month]) acc[month] = { weeks: {}, teams: {} };

          if (!acc[month].weeks[week]) acc[month].weeks[week] = {};
          if (!acc[month].weeks[week][day]) acc[month].weeks[week][day] = {};
          if (!acc[month].weeks[week][day][team]) acc[month].weeks[week][day][team] = {
            totalDuration: 0,
            sessionCount: 0,
          };

          acc[month].weeks[week][day][team].totalDuration += duration;
          acc[month].weeks[week][day][team].sessionCount += 1;

          if (!acc[month].teams[team]) acc[month].teams[team] = { totalDuration: 0, sessionCount: 0 };
          acc[month].teams[team].totalDuration += duration;
          acc[month].teams[team].sessionCount += 1;
        }
        return acc;
      }, {});

      if (selectedMonth && selectedWeek) {
        const days = Object.keys(processedData[selectedMonth]?.weeks[selectedWeek] || []);
        const teams = Array.from(
          new Set(
            days.flatMap((day) =>
              Object.keys(processedData[selectedMonth]?.weeks[selectedWeek][day] || {})
            )
          )
        );

        const seriesData = teams.map((team) => {
          const data = days.map(
            (day) =>
              processedData[selectedMonth]?.weeks[selectedWeek][day]?.[team]?.totalDuration /
                processedData[selectedMonth]?.weeks[selectedWeek][day]?.[team]?.sessionCount || 0
          );
          return {
            name: team,
            type: "bar",
            stack: "total",
            data,
          };
        });

        const option = {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "10%",
            containLabel: true,
          },
          xAxis: {
            type: "value",
            name: "평균 시간 (분)",
          },
          yAxis: {
            type: "category",
            data: days,
            name: "날짜",
            axisLabel: {
              formatter: (value) => value.slice(5), // Show MM-DD only
            },
          },
          series: seriesData,
        };

        chartInstance.setOption(option);
      }
    }
  }, [chartInstance, selectedMonth, selectedWeek]);

  // 주 목록 처리 (선택된 월에 따라 주 목록 필터링)
  const weeksInMonth = (month) => {
    const weekKeys = Object.keys(dummyData.reduce((acc, curr) => {
      const startDate = new Date(curr.start_At);
      if ((startDate.getMonth() + 1).toString() === month) {
        const week = `${Math.ceil(startDate.getDate() / 7)}주`;
        acc[week] = true;
      }
      return acc;
    }, {}));
    return weekKeys.sort();
  };

  return (
    < >
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          스터디 세션 분석
        </Typography>
        <FilterContainer>
          <FormControl style={{ minWidth: 100, marginRight: "20px" }}>
            <InputLabel>월</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedWeek(weeksInMonth(e.target.value)[0] || ""); // Reset week to first valid week
              }}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString();
                return (
                  <MenuItem key={month} value={month}>
                    {`${month}월`}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl style={{ minWidth: 100 }} disabled={!weeksInMonth(selectedMonth).length}>
            <InputLabel>주</InputLabel>
            <Select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {weeksInMonth(selectedMonth).map((week) => (
                <MenuItem key={week} value={week}>
                  {week}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FilterContainer>
        <StyledChartContainer id="team-study-chart"></StyledChartContainer>
    </>
  );
};

export default StudyTeamChart;
