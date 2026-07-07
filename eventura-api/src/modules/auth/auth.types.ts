export interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  requestedRole: 'ATTENDEE' | 'COLLEGE_ADMIN' | 'CLUB_PRESIDENT';
  collegeName?: string;    // Required if COLLEGE_ADMIN
  collegeDomain?: string;  // Required if COLLEGE_ADMIN
  clubName?: string;       // Required if CLUB_PRESIDENT
  collegeId?: string;      // Required if CLUB_PRESIDENT
  orgCategory?: string;    // UNIVERSITY/COMPANY/COMMUNITY/CREATOR/NGO/SPORTS/ENTERTAINMENT/GOVERNMENT
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface OrgLabels {
  team: string;
  members: string;
  teamAdmin: string;
  guests: string;
}

export interface JwtPayload {
  sub: string;             // userId
  email: string;
  jti: string;             // Unique token ID for blacklisting on logout
  activeContext: {
    role: string;
    collegeId: string | null;
    clubId: string | null;
    permissions: string[];
    orgType: string | null;
    accountMode: 'COLLEGE' | 'OPEN' | null;
    labels: OrgLabels | null;
  };
  iss: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
