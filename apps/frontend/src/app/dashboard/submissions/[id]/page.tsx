'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { graphqlRequest } from '@/lib/graphql-client';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2 } from 'lucide-react';

const GET_SUBMISSION_CONTEXT = `
  query GetSubmissionContext($submissionId: String!) {
    submission(id: $submissionId) {
      id
      assignment {
        id
        lesson {
          id
          module {
            id
            subject {
              id
              classroomId
            }
          }
        }
      }
    }
  }
`;

interface SubmissionContext {
  id: string;
  assignment: {
    id: string;
    lesson: {
      id: string;
      module: {
        id: string;
        subject: {
          id: string;
          classroomId: string;
        };
      };
    };
  };
}

export default function SubmissionRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const submissionId = params.id as string;

  const { data, isLoading, error } = useQuery<{ submission: SubmissionContext }>({
    queryKey: ['submission-context', submissionId],
    queryFn: async () => {
      const result = await graphqlRequest<{ submission: SubmissionContext }>(
        GET_SUBMISSION_CONTEXT,
        { submissionId },
        { token: accessToken }
      );
      return result;
    },
    enabled: !!submissionId && !!accessToken,
  });

  // Redirect to proper URL when data loaded
  if (data?.submission) {
    const { assignment } = data.submission;
    const classroomId = assignment.lesson.module.subject.classroomId;
    const subjectId = assignment.lesson.module.subject.id;
    const moduleId = assignment.lesson.module.id;
    const lessonId = assignment.lesson.id;
    const assignmentId = assignment.id;

    const fullPath = `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}/assignments/${assignmentId}/submissions/${submissionId}`;

    router.replace(fullPath);
    
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Redirecting to submission...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Submission</h2>
          <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-muted-foreground">Loading submission context...</p>
      </div>
    </div>
  );
}
