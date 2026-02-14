const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

interface RequestOptions {
  token?: string | null;
}

export async function graphqlRequest<T = any>(
  query: string,
  variables?: Record<string, any>,
  options?: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors) {
    const message = json.errors[0]?.message || 'GraphQL Error';
    throw new Error(message);
  }

  if (!json.data) {
    throw new Error('No data returned');
  }

  return json.data;
}

// Auth Queries & Mutations
export const AUTH_MUTATIONS = {
  LOGIN: `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        refreshToken
        user {
          id
          email
          role
          studentName
          parentName
          teacherName
          avatar
          isActive
        }
      }
    }
  `,
  REFRESH_TOKEN: `
    mutation RefreshToken($input: RefreshTokenInput!) {
      refreshToken(input: $input) {
        accessToken
        refreshToken
      }
    }
  `,
  CHANGE_PASSWORD: `
    mutation ChangePassword($input: ChangePasswordInput!) {
      changePassword(input: $input) {
        success
        message
      }
    }
  `,
};

export const AUTH_QUERIES = {
  ME: `
    query Me {
      me {
        id
        email
        role
        studentName
        parentName
        teacherName
        avatar
        isActive
        lastLoginAt
        createdAt
      }
    }
  `,
};

// User Queries & Mutations
export const USER_MUTATIONS = {
  CREATE_STUDENT: `
    mutation CreateStudent($input: CreateStudentInput!) {
      createStudent(input: $input) {
        id
        email
        studentName
        parentName
        role
        isActive
      }
    }
  `,
  UPDATE_PROFILE: `
    mutation UpdateProfile($input: UpdateProfileInput!) {
      updateProfile(input: $input) {
        id
        studentName
        parentName
        teacherName
        avatar
      }
    }
  `,
  TOGGLE_STUDENT_ACTIVE: `
    mutation ToggleStudentActive($studentUserId: String!) {
      toggleStudentActive(studentUserId: $studentUserId) {
        id
        isActive
      }
    }
  `,
};

export const USER_QUERIES = {
  MY_STUDENTS: `
    query MyStudents {
      myStudents {
        id
        userId
        level
        totalXP
        currentXP
        user {
          id
          email
          studentName
          parentName
          avatar
          isActive
          lastLoginAt
        }
      }
    }
  `,
  MY_CLASSROOMS: `
    query MyClassrooms {
      myClassrooms {
        id
        name
        description
        studentCount
        subjectCount
        createdAt
      }
    }
  `,
};
