import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  JOBS = 'JOBS',
  QUESTS = 'QUESTS',
  LEADERBOARD = 'LEADERBOARD',
  PROFILE = 'PROFILE',
}