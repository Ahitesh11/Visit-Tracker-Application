import { FmsVisit, MasterParty, User } from './types';

export const INITIAL_USERS: User[] = [
  { username: 'admin', password: '123', name: 'Alok Sharma (Director)', role: 'Admin' },
  { username: 'hitesh', password: '123', name: 'Hitesh Chandra', role: 'Salesperson' },
  { username: 'amit', password: '123', name: 'Amit Kumar', role: 'Salesperson' },
  { username: 'pooja', password: '123', name: 'Pooja Verma', role: 'Salesperson' },
  { username: 'sanjay', password: '123', name: 'Sanjay Rawat', role: 'Salesperson' }
];

export const INITIAL_PARTIES: MasterParty[] = [
  { id: 'm1', partyName: 'Tata Motors Corp', location: 'Worli, Mumbai', concernPerson: 'Mr. Rajesh Sen' },
  { id: 'm2', partyName: 'Reliance Industries', location: 'Navi Mumbai', concernPerson: 'Mrs. Neeta Ambani' },
  { id: 'm3', partyName: 'Infosys Limited', location: 'Electronic City, Bengaluru', concernPerson: 'Mr. Nandan N.' },
  { id: 'm4', partyName: 'Wipro Technologies', location: 'Sarjapur, Bengaluru', concernPerson: 'Dr. Anurag J.' },
  { id: 'm5', partyName: 'Adani Power Plant', location: 'Mundra, Gujarat', concernPerson: 'Mr. G. Adani' },
  { id: 'm6', partyName: 'Airtel HQ', location: 'Vasant Kunj, Delhi', concernPerson: 'Ms. Meenakshi S.' },
  { id: 'm7', partyName: 'HDFC Bank Corporate Office', location: 'Senapati Bapat Marg, Mumbai', concernPerson: 'Mr. Shashidhar J.' }
];

export const INITIAL_VISITS: FmsVisit[] = [
  {
    id: '1',
    timestamp: '2026-05-18 10:30:15',
    visitNo: 'VIS-1001',
    salesPersonName: 'Hitesh Chandra',
    partyName: 'Tata Motors Corp',
    location: 'Worli, Mumbai (GPS: 18.9983, 72.8152)',
    dateOfVisit: '2026-05-18',
    planned: 'Yes',
    actual: 'Completed',
    delay: 'None',
    headOfVisit: 'Product Demo & Contract Renewal',
    concernPerson: 'Mr. Rajesh Sen',
    whatCustomerSaid: 'Extremely satisfied with the new trial. They requested a quote for 250 licenses of the enterprise model and asked us to meet again next week.',
    nextVisitDate: '2026-05-25'
  },
  {
    id: '2',
    timestamp: '2026-05-19 14:15:00',
    visitNo: 'VIS-1002',
    salesPersonName: 'Hitesh Chandra',
    partyName: 'Reliance Industries',
    location: 'Navi Mumbai (GPS: 19.1176, 73.0077)',
    dateOfVisit: '2026-05-19',
    planned: 'No',
    actual: 'Completed',
    delay: '15 mins',
    headOfVisit: 'Urgent Bug Resolution Support Call',
    concernPerson: 'Mrs. Neeta Ambani',
    whatCustomerSaid: 'Team resolved the DB lag. They praised our instant field responsiveness and requested scheduled monthly maintenance audits going forward.',
    nextVisitDate: '2026-06-19'
  },
  {
    id: '3',
    timestamp: '2026-05-20 11:00:22',
    visitNo: 'VIS-1003',
    salesPersonName: 'Amit Kumar',
    partyName: 'Infosys Limited',
    location: 'Electronic City, Bengaluru',
    dateOfVisit: '2026-05-20',
    planned: 'Yes',
    actual: 'Completed',
    delay: '30 mins',
    headOfVisit: 'Bi-annual Strategic Review',
    concernPerson: 'Mr. Nandan N.',
    whatCustomerSaid: 'Discussion about the cloud migration pipeline was excellent. However, budget approval is delayed until the next quarterly boardroom meeting.',
    nextVisitDate: '2026-06-15'
  },
  {
    id: '4',
    timestamp: '2026-05-20 16:30:00',
    visitNo: 'VIS-1004',
    salesPersonName: 'Pooja Verma',
    partyName: 'Airtel HQ',
    location: 'Vasant Kunj, Delhi',
    dateOfVisit: '2026-05-20',
    planned: 'Yes',
    actual: 'Rescheduled',
    delay: 'None',
    headOfVisit: 'API Integration Onboarding',
    concernPerson: 'Ms. Meenakshi S.',
    whatCustomerSaid: 'Pushed back because client met with unexpected regulatory audit. Shifted to tomorrow morning.',
    nextVisitDate: '2026-05-21'
  },
  {
    id: '5',
    timestamp: '2026-05-21 09:12:05',
    visitNo: 'VIS-1005',
    salesPersonName: 'Amit Kumar',
    partyName: 'Wipro Technologies',
    location: 'Sarjapur, Bengaluru',
    dateOfVisit: '2026-05-21',
    planned: 'Yes',
    actual: 'Pending',
    delay: 'None',
    headOfVisit: 'Custom Dashboard Feedback Session',
    concernPerson: 'Dr. Anurag J.',
    whatCustomerSaid: 'Waiting for representative to start the dynamic walk-through slides.',
    nextVisitDate: '2026-05-28'
  },
  {
    id: '6',
    timestamp: '2026-05-21 11:45:00',
    visitNo: 'VIS-1006',
    salesPersonName: 'Pooja Verma',
    partyName: 'Adani Power Plant',
    location: 'Mundra, Gujarat',
    dateOfVisit: '2026-05-21',
    planned: 'Yes',
    actual: 'No Show',
    delay: '45 mins',
    headOfVisit: 'Hardware Inspection Visit',
    concernPerson: 'Mr. G. Adani',
    whatCustomerSaid: 'Representative arrived but the scheduled contact was unavailable due to factory site tour. Rescheduled follow up.',
    nextVisitDate: '2026-05-24'
  },
  {
    id: '7',
    timestamp: '2026-05-21 12:00:00',
    visitNo: 'VIS-1007',
    salesPersonName: 'Sanjay Rawat',
    partyName: 'HDFC Bank Corporate Office',
    location: 'Senapati Bapat Marg, Mumbai',
    dateOfVisit: '2026-05-21',
    planned: 'No',
    actual: 'Completed',
    delay: 'None',
    headOfVisit: 'Ad-hoc Sales pitch introduction',
    concernPerson: 'Mr. Shashidhar J.',
    whatCustomerSaid: 'Initial discussions occurred. Good positive reception. They will review our brochure and let us know.',
    nextVisitDate: '2026-05-30'
  }
];
