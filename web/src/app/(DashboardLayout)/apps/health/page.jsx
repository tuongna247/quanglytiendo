'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PageContainer from '@/app/components/container/PageContainer';
import WeightTab from './WeightTab';
import PlanTab from './PlanTab';
import ProgressTab from './ProgressTab';
import BmiGoalTab from './BmiGoalTab';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function HealthPage() {
  const [tab, setTab] = useState(0);

  return (
    <PageContainer title="Sức khỏe" description="Theo dõi sức khỏe">
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 0 }}
      >
        <Tab label="Cân nặng" />
        <Tab label="Giáo án" />
        <Tab label="Tiến độ" />
        <Tab label="BMI & Mục tiêu" />
      </Tabs>
      <TabPanel value={tab} index={0}><WeightTab /></TabPanel>
      <TabPanel value={tab} index={1}><PlanTab /></TabPanel>
      <TabPanel value={tab} index={2}><ProgressTab /></TabPanel>
      <TabPanel value={tab} index={3}><BmiGoalTab /></TabPanel>
    </PageContainer>
  );
}
