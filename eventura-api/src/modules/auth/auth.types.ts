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
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  sub: string;             // userId
  email: string;
  activeContext: {
    role: string;
    collegeId: string | null;
    clubId: string | null;
    permissions: string[];
  };
  iss: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
