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

// ============================================
// CLASSROOM Queries & Mutations
// ============================================

export const CLASSROOM_MUTATIONS = {
  CREATE: `
    mutation CreateClassroom($input: CreateClassroomInput!) {
      createClassroom(input: $input) {
        id
        name
        description
        isActive
        studentCount
        subjectCount
        createdAt
      }
    }
  `,
  UPDATE: `
    mutation UpdateClassroom($input: UpdateClassroomInput!) {
      updateClassroom(input: $input) {
        id
        name
        description
        isActive
        studentCount
        subjectCount
        createdAt
      }
    }
  `,
  DELETE: `
    mutation DeleteClassroom($classroomId: String!) {
      deleteClassroom(classroomId: $classroomId) {
        success
        message
      }
    }
  `,
  ENROLL_STUDENT: `
    mutation EnrollStudent($input: EnrollStudentInput!) {
      enrollStudent(input: $input) {
        success
        message
      }
    }
  `,
  UNENROLL_STUDENT: `
    mutation UnenrollStudent($input: UnenrollStudentInput!) {
      unenrollStudent(input: $input) {
        success
        message
      }
    }
  `,
};

export const CLASSROOM_QUERIES = {
  LIST: `
    query Classrooms {
      classrooms {
        id
        name
        description
        isActive
        studentCount
        subjectCount
        createdAt
      }
    }
  `,
  DETAIL: `
    query ClassroomDetail($classroomId: String!) {
      classroomDetail(classroomId: $classroomId) {
        id
        name
        description
        isActive
        studentCount
        subjectCount
        students {
          id
          enrolledAt
          student {
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
            }
          }
        }
        subjects {
          id
          name
          description
          icon
          color
          order
          isActive
          moduleCount
        }
        createdAt
        updatedAt
      }
    }
  `,
  AVAILABLE_STUDENTS: `
    query AvailableStudents($classroomId: String!) {
      availableStudents(classroomId: $classroomId) {
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
        }
      }
    }
  `,
};

// ============================================
// SUBJECT Queries & Mutations
// ============================================

export const SUBJECT_MUTATIONS = {
  CREATE: `
    mutation CreateSubject($input: CreateSubjectInput!) {
      createSubject(input: $input) {
        id
        name
        description
        icon
        color
        order
        classroomId
        isActive
        moduleCount
        createdAt
        updatedAt
      }
    }
  `,
  UPDATE: `
    mutation UpdateSubject($input: UpdateSubjectInput!) {
      updateSubject(input: $input) {
        id
        name
        description
        icon
        color
        order
        classroomId
        isActive
        moduleCount
        createdAt
        updatedAt
      }
    }
  `,
  DELETE: `
    mutation DeleteSubject($subjectId: String!) {
      deleteSubject(subjectId: $subjectId) {
        success
        message
      }
    }
  `,
};

export const SUBJECT_QUERIES = {
  BY_CLASSROOM: `
    query Subjects($classroomId: String!) {
      subjects(classroomId: $classroomId) {
        id
        name
        description
        icon
        color
        order
        classroomId
        isActive
        moduleCount
        createdAt
        updatedAt
      }
    }
  `,
  DETAIL: `
    query SubjectDetail($subjectId: String!) {
      subjectDetail(subjectId: $subjectId) {
        id
        name
        description
        icon
        color
        order
        classroomId
        isActive
        moduleCount
        modules {
          id
          name
          description
          order
          isActive
          lessonCount
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  `,
};

// ============================================
// MODULE Queries & Mutations
// ============================================

export const MODULE_MUTATIONS = {
  CREATE: `
    mutation CreateModule($input: CreateModuleInput!) {
      createModule(input: $input) {
        id
        name
        description
        order
        subjectId
        isActive
        lessonCount
        createdAt
        updatedAt
      }
    }
  `,
  UPDATE: `
    mutation UpdateModule($input: UpdateModuleInput!) {
      updateModule(input: $input) {
        id
        name
        description
        order
        subjectId
        isActive
        lessonCount
        createdAt
        updatedAt
      }
    }
  `,
  DELETE: `
    mutation DeleteModule($moduleId: String!) {
      deleteModule(moduleId: $moduleId) {
        success
        message
      }
    }
  `,
};

export const MODULE_QUERIES = {
  BY_SUBJECT: `
    query Modules($subjectId: String!) {
      modules(subjectId: $subjectId) {
        id
        name
        description
        order
        subjectId
        isActive
        lessonCount
        createdAt
        updatedAt
      }
    }
  `,
  DETAIL: `
    query ModuleDetail($moduleId: String!) {
      moduleDetail(moduleId: $moduleId) {
        id
        name
        description
        order
        subjectId
        isActive
        lessonCount
        lessons {
          id
          title
          description
          order
          isDraft
          isActive
          mediaCount
          assignmentCount
          createdAt
        }
        createdAt
        updatedAt
      }
    }
  `,
};

// ============================================
// LESSON Queries & Mutations
// ============================================

export const LESSON_MUTATIONS = {
  CREATE: `
    mutation CreateLesson($input: CreateLessonInput!) {
      createLesson(input: $input) {
        id
        title
        description
        content
        order
        moduleId
        isDraft
        isActive
        mediaCount
        assignmentCount
        createdAt
        updatedAt
      }
    }
  `,
  UPDATE: `
    mutation UpdateLesson($input: UpdateLessonInput!) {
      updateLesson(input: $input) {
        id
        title
        description
        content
        order
        moduleId
        isDraft
        isActive
        mediaCount
        assignmentCount
        createdAt
        updatedAt
      }
    }
  `,
  DELETE: `
    mutation DeleteLesson($lessonId: String!) {
      deleteLesson(lessonId: $lessonId) {
        success
        message
      }
    }
  `,
  TOGGLE_DRAFT: `
    mutation ToggleLessonDraft($lessonId: String!) {
      toggleLessonDraft(lessonId: $lessonId) {
        id
        title
        isDraft
        isActive
      }
    }
  `,
};

export const LESSON_QUERIES = {
  BY_MODULE: `
    query Lessons($moduleId: String!) {
      lessons(moduleId: $moduleId) {
        id
        title
        description
        order
        isDraft
        isActive
        mediaCount
        assignmentCount
        createdAt
        updatedAt
      }
    }
  `,
  DETAIL: `
    query LessonDetail($lessonId: String!) {
      lessonDetail(lessonId: $lessonId) {
        id
        title
        description
        content
        order
        moduleId
        isDraft
        isActive
        mediaCount
        assignmentCount
        media {
          id
          order
          media {
            id
            filename
            originalName
            mimeType
            size
            type
            url
            createdAt
          }
        }
        createdAt
        updatedAt
      }
    }
  `,
};
