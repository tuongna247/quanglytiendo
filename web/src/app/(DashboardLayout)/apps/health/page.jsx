'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PageContainer from '@/app/components/container/PageContainer';
import WeightTab from './WeightTab';
import GymTab from './GymTab';
import PlanTab from './PlanTab';
import ProgressTab from './ProgressTab';
import BmiGoalTab from './BmiGoalTab';
import CheckInTab from './CheckInTab';

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
        <Tab label="Gym" />
        <Tab label="Giáo án" />
        <Tab label="Tiến độ" />
        <Tab label="BMI & Mục tiêu" />
        <Tab label="Lắng nghe cơ thể" />
      </Tabs>
      <TabPanel value={tab} index={0}><WeightTab /></TabPanel>
      <TabPanel value={tab} index={1}><GymTab /></TabPanel>
      <TabPanel value={tab} index={2}><PlanTab /></TabPanel>
      <TabPanel value={tab} index={3}><ProgressTab /></TabPanel>
      <TabPanel value={tab} index={4}><BmiGoalTab /></TabPanel>
      <TabPanel value={tab} index={5}><CheckInTab /></TabPanel>
    </PageContainer>
  );
}
