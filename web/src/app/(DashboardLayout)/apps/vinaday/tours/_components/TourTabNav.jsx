'use client';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const TABS = [
  { label: 'Basic Info', path: '' },
  { label: 'Detail', path: '/detail' },
  { label: 'Photos', path: '/photos' },
  { label: 'Itinerary', path: '/itinerary' },
  { label: 'Rates Control', path: '/rates' },
  { label: 'Surcharges', path: '/surcharges' },
  { label: 'Promotions', path: '/promotions' },
];

export default function TourTabNav({ tourId, active }) {
  return (
    <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end">
      {TABS.map((tab) => {
        const isActive = tab.label === active;
        return (
          <Button
            key={tab.label}
            variant={isActive ? 'contained' : 'outlined'}
            color="success"
            size="small"
            disabled={isActive}
            href={isActive ? undefined : `/apps/vinaday/tours/${tourId}${tab.path}`}
          >
            {tab.label}
          </Button>
        );
      })}
    </Stack>
  );
}
