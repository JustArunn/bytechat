export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  status: 'online' | 'offline' | 'away';
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  messages: Message[];
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  plan: string;
}

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Arun',
    email: 'arun@example.com',
    avatar: 'https://github.com/shadcn.png',
    initials: 'AR',
    status: 'online',
  },
  {
    id: 'u2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatar: 'https://github.com/nutlope.png',
    initials: 'JD',
    status: 'online',
  },
  {
    id: 'u3',
    name: 'John Smith',
    email: 'john@example.com',
    avatar: 'https://github.com/shadcn.png',
    initials: 'JS',
    status: 'away',
  },
];

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'c1',
    name: 'general',
    description: 'General discussion for the whole team',
    messages: [
      { id: 'm1', userId: 'u2', content: 'Welcome to ByteChat!', timestamp: '10:00 AM' },
      { id: 'm2', userId: 'u3', content: 'Glad to be here. The UI looks amazing!', timestamp: '10:05 AM' },
    ],
  },
  {
    id: 'c2',
    name: 'development',
    description: 'Technical discussions and code reviews',
    messages: [
      { id: 'm3', userId: 'u1', content: 'Just pushed the new chat interface. Check it out!', timestamp: '11:00 AM' },
    ],
  },
  {
    id: 'c3',
    name: 'marketing',
    description: 'Campaigns and market research',
    messages: [],
  },
  {
    id: 'c4',
    name: 'random',
    description: 'Non-work related banter',
    messages: [
      { id: 'm4', userId: 'u2', content: 'Anyone seen that new movie?', timestamp: 'Yesterday' },
    ],
  },
];

export const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Acme Corp', logo: 'AC', plan: 'Enterprise' },
  { id: 't2', name: 'Design Studio', logo: 'DS', plan: 'Pro' },
  { id: 't3', name: 'Personal', logo: 'P', plan: 'Free' },
];
