export interface Statistic {
  icon: string;
  number: string;
  label: string;
  color: 'primary' | 'secondary' | 'accent' | 'light';
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface CoreValue {
  icon: string;
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
} 