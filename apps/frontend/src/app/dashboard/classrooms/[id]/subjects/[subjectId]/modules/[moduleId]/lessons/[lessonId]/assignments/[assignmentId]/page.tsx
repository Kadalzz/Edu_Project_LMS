'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import {
  graphqlRequest,
  ASSIGNMENT_QUERIES,
  ASSIGNMENT_MUTATIONS,
} from '@/lib/graphql-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  FileQuestion,
  ListChecks,
  CheckCircle2,
  XCircle,
  Users,
  Star,
  GripVertical,
  ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

// ============================================
// TEACHER: Quiz Question Editor
// ============================================

function QuizQuestionEditor({
  assignmentId,
  questions,
  accessToken,
}: {
  assignmentId: string;
  questions: any[];
  accessToken: string | null;
}) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const [options, setOptions] = useState([
    { optionKey: 'A', text: '', image: '', isCorrect: true },
    { optionKey: 'B', text: '', image: '', isCorrect: false },
    { optionKey: 'C', text: '', image: '', isCorrect: false },
    { optionKey: 'D', text: '', image: '', isCorrect: false },
  ]);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);

  const addMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.ADD_QUIZ_QUESTION, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (questionId: string) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.DELETE_QUIZ_QUESTION, { questionId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      setDeletingQuestionId(null);
    },
  });

  const resetForm = () => {
    setShowAddForm(false);
    setQuestionText('');
    setQuestionImage('');
    setOptions([
      { optionKey: 'A', text: '', image: '', isCorrect: true },
      { optionKey: 'B', text: '', image: '', isCorrect: false },
      { optionKey: 'C', text: '', image: '', isCorrect: false },
      { optionKey: 'D', text: '', image: '', isCorrect: false },
    ]);
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) return;
    const filledOptions = options.filter((o) => o.text.trim());
    if (filledOptions.length < 2) return;

    addMutation.mutate({
      assignmentId,
      question: questionText.trim(),
      questionImage: questionImage.trim() || undefined,
      options: filledOptions.map((o) => ({
        optionKey: o.optionKey,
        text: o.text.trim(),
        image: o.image.trim() || undefined,
        isCorrect: o.isCorrect,
      })),
    });
  };

  const setCorrectOption = (key: string) => {
    setOptions(options.map((o) => ({ ...o, isCorrect: o.optionKey === key })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Pertanyaan Quiz ({questions.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Pertanyaan
        </Button>
      </div>

      {/* Existing Questions */}
      <div className="space-y-3 mb-4">
        {questions.map((q: any, index: number) => (
          <Card key={q.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="font-medium text-gray-900">{q.question}</p>
                  </div>
                  {q.questionImage && (
                    <div className="ml-8 mb-2">
                      <img src={q.questionImage} alt="Question" className="max-h-32 rounded-lg" />
                    </div>
                  )}
                  <div className="ml-8 grid grid-cols-2 gap-2">
                    {q.options.map((opt: any) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                          opt.isCorrect
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <span className="font-bold">{opt.optionKey}.</span>
                        <span className="flex-1">{opt.text}</span>
                        {opt.isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      </div>
                    ))}
                  </div>
                </div>
                {deletingQuestionId === q.id ? (
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => deleteMutation.mutate(q.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ya'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setDeletingQuestionId(null)}
                    >
                      Batal
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDeletingQuestionId(q.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Question Form */}
      {showAddForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tambah Pertanyaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pertanyaan *</Label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Tulis pertanyaan..."
              />
            </div>

            <div className="space-y-2">
              <Label>Gambar Pertanyaan (URL, opsional)</Label>
              <Input
                value={questionImage}
                onChange={(e) => setQuestionImage(e.target.value)}
                placeholder="https://... (opsional)"
              />
            </div>

            <div className="space-y-3">
              <Label>Pilihan Jawaban (klik radio untuk jawaban benar)</Label>
              {options.map((opt) => (
                <div key={opt.optionKey} className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrectOption(opt.optionKey)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                      opt.isCorrect
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {opt.optionKey}
                  </button>
                  <Input
                    value={opt.text}
                    onChange={(e) =>
                      setOptions(
                        options.map((o) =>
                          o.optionKey === opt.optionKey ? { ...o, text: e.target.value } : o,
                        ),
                      )
                    }
                    placeholder={`Pilihan ${opt.optionKey}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>

            {addMutation.error && (
              <p className="text-sm text-red-500">{(addMutation.error as Error).message}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleAddQuestion}
                disabled={addMutation.isPending || !questionText.trim()}
              >
                {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                Tambah
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// TEACHER: Task Step Editor
// ============================================

function TaskStepEditor({
  assignmentId,
  steps,
  accessToken,
}: {
  assignmentId: string;
  steps: any[];
  accessToken: string | null;
}) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [isMandatory, setIsMandatory] = useState(true);
  const [deletingStepId, setDeletingStepId] = useState<string | null>(null);

  const addMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.ADD_TASK_STEP, { input }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (stepId: string) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.DELETE_TASK_STEP, { stepId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      setDeletingStepId(null);
    },
  });

  const resetForm = () => {
    setShowAddForm(false);
    setInstruction('');
    setReferenceImage('');
    setIsMandatory(true);
  };

  const handleAddStep = () => {
    if (!instruction.trim()) return;
    addMutation.mutate({
      assignmentId,
      stepNumber: steps.length + 1,
      instruction: instruction.trim(),
      referenceImage: referenceImage.trim() || undefined,
      isMandatory,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Langkah Task Analysis ({steps.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Langkah
        </Button>
      </div>

      {/* Existing Steps */}
      <div className="space-y-3 mb-4">
        {steps.map((step: any) => (
          <Card key={step.id} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                    {step.stepNumber}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{step.instruction}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {step.isMandatory ? (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                          Wajib
                        </span>
                      ) : (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          Opsional
                        </span>
                      )}
                      {step.referenceImage && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          Gambar referensi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {deletingStepId === step.id ? (
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => deleteMutation.mutate(step.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ya'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setDeletingStepId(null)}
                    >
                      Batal
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setDeletingStepId(step.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Step Form */}
      {showAddForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tambah Langkah #{steps.length + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instruksi *</Label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
                placeholder="Instruksi untuk langkah ini..."
              />
            </div>

            <div className="space-y-2">
              <Label>Gambar Referensi (URL, opsional)</Label>
              <Input
                value={referenceImage}
                onChange={(e) => setReferenceImage(e.target.value)}
                placeholder="https://... (opsional)"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mandatory"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="mandatory" className="text-sm">
                Langkah ini wajib dikerjakan
              </Label>
            </div>

            {addMutation.error && (
              <p className="text-sm text-red-500">{(addMutation.error as Error).message}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleAddStep}
                disabled={addMutation.isPending || !instruction.trim()}
              >
                {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                Tambah
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// STUDENT: Quiz Taking
// ============================================

function QuizTaker({
  assignment,
  accessToken,
}: {
  assignment: any;
  accessToken: string | null;
}) {
  const queryClient = useQueryClient();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const startMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.START_SUBMISSION, { assignmentId: assignment.id }, { token: accessToken }),
    onSuccess: (data: any) => {
      setSubmissionId(data.startSubmission.id);
    },
  });

  const answerMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.SUBMIT_QUIZ_ANSWER, { input }, { token: accessToken }),
  });

  const completeMutation = useMutation({
    mutationFn: (subId: string) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.COMPLETE_QUIZ, { submissionId: subId }, { token: accessToken }),
    onSuccess: (data: any) => {
      setResult(data.completeQuizSubmission);
      queryClient.invalidateQueries({ queryKey: ['mySubmission', assignment.id] });
    },
  });

  const questions = assignment.quizQuestions || [];

  const handleSelectAnswer = (questionId: string, optionKey: string) => {
    setAnswers({ ...answers, [questionId]: optionKey });
    if (submissionId) {
      answerMutation.mutate({
        submissionId,
        questionId,
        selectedOption: optionKey,
      });
    }
  };

  const handleComplete = () => {
    if (submissionId) {
      completeMutation.mutate(submissionId);
    }
  };

  // Show result
  if (result) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${
            result.score >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {Math.round(result.score)}%
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {result.score >= 60 ? '🎉 Selamat!' : '💪 Terus Semangat!'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Kamu menjawab benar {result.correctCount} dari {result.totalQuestions} pertanyaan
          </p>
          {result.xpEarned > 0 && (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
              <Star className="h-4 w-4" />
              +{result.xpEarned} XP
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Start quiz button
  if (!submissionId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileQuestion className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Quiz: {assignment.title}</h3>
          <p className="text-sm text-muted-foreground mb-1">{questions.length} pertanyaan</p>
          <p className="text-sm text-muted-foreground mb-4">
            XP Reward: <span className="font-medium text-yellow-600">{assignment.xpReward} XP</span>
          </p>
          {startMutation.error && (
            <p className="text-sm text-red-500 mb-3">{(startMutation.error as Error).message}</p>
          )}
          <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
            {startMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Mulai Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Quiz in progress
  const q = questions[currentQuestion];
  if (!q) return null;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">
          {currentQuestion + 1}/{questions.length}
        </span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <p className="text-lg font-medium text-gray-900 mb-4">{q.question}</p>
          {q.questionImage && (
            <img src={q.questionImage} alt="Question" className="max-h-48 rounded-lg mb-4" />
          )}
          <div className="space-y-2">
            {q.options.map((opt: any) => (
              <button
                key={opt.optionKey}
                onClick={() => handleSelectAnswer(q.id, opt.optionKey)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  answers[q.id] === opt.optionKey
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-bold mr-2">{opt.optionKey}.</span>
                {opt.text}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Sebelumnya
        </Button>
        <div className="flex gap-1">
          {questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium ${
                i === currentQuestion
                  ? 'bg-primary text-white'
                  : answers[questions[i]?.id]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {currentQuestion < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
            Selanjutnya
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={completeMutation.isPending || Object.keys(answers).length < questions.length}
          >
            {completeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Selesai & Kirim
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// STUDENT: Task Analysis Submission
// ============================================

function TaskSubmitter({
  assignment,
  accessToken,
}: {
  assignment: any;
  accessToken: string | null;
}) {
  const queryClient = useQueryClient();
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [stepPhotos, setStepPhotos] = useState<Record<string, string>>({});
  const [stepVideos, setStepVideos] = useState<Record<string, string>>({});
  const [submittedSteps, setSubmittedSteps] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  const startMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.START_SUBMISSION, { assignmentId: assignment.id }, { token: accessToken }),
    onSuccess: (data: any) => {
      setSubmissionId(data.startSubmission.id);
    },
  });

  const submitStepMutation = useMutation({
    mutationFn: (input: any) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.SUBMIT_TASK_STEP, { input }, { token: accessToken }),
    onSuccess: (_data: any, variables: any) => {
      setSubmittedSteps(new Set([...submittedSteps, variables.stepId]));
    },
  });

  const completeMutation = useMutation({
    mutationFn: (subId: string) =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.COMPLETE_TASK, { submissionId: subId }, { token: accessToken }),
    onSuccess: () => {
      setIsCompleted(true);
      queryClient.invalidateQueries({ queryKey: ['mySubmission', assignment.id] });
    },
  });

  const steps = assignment.taskSteps || [];

  if (isCompleted) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Tugas Dikumpulkan!</h3>
          <p className="text-sm text-muted-foreground">
            Guru akan mereview dan menilai tugas Anda.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!submissionId) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <ListChecks className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Task Analysis: {assignment.title}</h3>
          <p className="text-sm text-muted-foreground mb-1">{steps.length} langkah</p>
          <p className="text-sm text-muted-foreground mb-4">
            XP Reward: <span className="font-medium text-yellow-600">{assignment.xpReward} XP</span>
          </p>
          {startMutation.error && (
            <p className="text-sm text-red-500 mb-3">{(startMutation.error as Error).message}</p>
          )}
          <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
            {startMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Mulai Tugas
          </Button>
        </CardContent>
      </Card>
    );
  }

  const mandatorySteps = steps.filter((s: any) => s.isMandatory);
  const allMandatoryDone = mandatorySteps.every((s: any) => submittedSteps.has(s.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Langkah-langkah</h3>
        <span className="text-sm text-muted-foreground">
          {submittedSteps.size}/{steps.length} selesai
        </span>
      </div>

      {steps.map((step: any) => (
        <Card key={step.id} className={submittedSteps.has(step.id) ? 'border-green-300 bg-green-50/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                submittedSteps.has(step.id)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {submittedSteps.has(step.id) ? <CheckCircle2 className="h-4 w-4" /> : step.stepNumber}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">{step.instruction}</p>
                <div className="flex items-center gap-2 mb-3">
                  {step.isMandatory && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">Wajib</span>
                  )}
                  {step.referenceImage && (
                    <a href={step.referenceImage} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" /> Lihat referensi
                    </a>
                  )}
                </div>

                {!submittedSteps.has(step.id) && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs">URL Foto Bukti *</Label>
                      <Input
                        value={stepPhotos[step.id] || ''}
                        onChange={(e) => setStepPhotos({ ...stepPhotos, [step.id]: e.target.value })}
                        placeholder="URL foto bukti pengerjaan"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">URL Video (opsional)</Label>
                      <Input
                        value={stepVideos[step.id] || ''}
                        onChange={(e) => setStepVideos({ ...stepVideos, [step.id]: e.target.value })}
                        placeholder="URL video bukti (opsional)"
                        className="text-sm"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        submitStepMutation.mutate({
                          submissionId,
                          stepId: step.id,
                          photoUrl: stepPhotos[step.id]?.trim(),
                          videoUrl: stepVideos[step.id]?.trim() || undefined,
                        })
                      }
                      disabled={submitStepMutation.isPending || !stepPhotos[step.id]?.trim()}
                    >
                      {submitStepMutation.isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                      Submit Langkah
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Submit All */}
      <div className="pt-4">
        {completeMutation.error && (
          <p className="text-sm text-red-500 mb-3">{(completeMutation.error as Error).message}</p>
        )}
        <Button
          className="w-full"
          onClick={() => completeMutation.mutate(submissionId)}
          disabled={completeMutation.isPending || !allMandatoryDone}
        >
          {completeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
          Kumpulkan Tugas
        </Button>
        {!allMandatoryDone && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Selesaikan semua langkah wajib terlebih dahulu
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// TEACHER: Submissions View
// ============================================

function SubmissionsView({
  assignmentId,
  accessToken,
}: {
  assignmentId: string;
  accessToken: string | null;
}) {
  const router = useRouter();
  const params = useParams();
  const classroomId = params.id as string;
  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () =>
      graphqlRequest(ASSIGNMENT_QUERIES.SUBMISSIONS, { assignmentId }, { token: accessToken }),
    enabled: !!accessToken,
  });

  const submissions = data?.submissions || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Belum ada submission</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {submissions.map((sub: any) => (
        <div
          key={sub.id}
          onClick={() =>
            router.push(
              `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}/assignments/${assignmentId}/submissions/${sub.id}`,
            )
          }
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {sub.student?.studentName?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-sm font-medium">{sub.student?.studentName || 'Siswa'}</p>
              <p className="text-xs text-muted-foreground">Level {sub.student?.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sub.score !== null && sub.score !== undefined && (
              <span className={`text-sm font-bold ${sub.score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.round(sub.score)}%
              </span>
            )}
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                sub.status === 'GRADED'
                  ? 'bg-green-100 text-green-700'
                  : sub.status === 'SUBMITTED'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {sub.status === 'GRADED' ? 'Dinilai' : sub.status === 'SUBMITTED' ? 'Dikumpulkan' : 'Draft'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;
  const subjectId = params.subjectId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;
  const assignmentId = params.assignmentId as string;
  const { accessToken, user } = useAuthStore();
  const queryClient = useQueryClient();

  const isTeacher = user?.role === 'TEACHER';

  // Teacher view: uses assignmentDetail (with correct answers)
  // Student view: uses assignmentForStudent (no answers)
  const { data, isLoading, error } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () =>
      isTeacher
        ? graphqlRequest(ASSIGNMENT_QUERIES.DETAIL, { assignmentId }, { token: accessToken })
        : graphqlRequest(ASSIGNMENT_QUERIES.FOR_STUDENT, { assignmentId }, { token: accessToken }),
    enabled: !!accessToken && !!assignmentId,
  });

  // Student: check existing submission
  const { data: subData } = useQuery({
    queryKey: ['mySubmission', assignmentId],
    queryFn: () =>
      graphqlRequest(ASSIGNMENT_QUERIES.MY_SUBMISSION, { assignmentId }, { token: accessToken }),
    enabled: !!accessToken && !isTeacher,
  });

  const assignment = isTeacher ? data?.assignmentDetail : data?.assignmentForStudent;
  const mySubmission = subData?.mySubmission;

  const toggleDraftMutation = useMutation({
    mutationFn: () =>
      graphqlRequest(ASSIGNMENT_MUTATIONS.TOGGLE_DRAFT, { assignmentId }, { token: accessToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['assignments', lessonId] });
    },
  });

  const basePath = `/dashboard/classrooms/${classroomId}/subjects/${subjectId}/modules/${moduleId}/lessons/${lessonId}`;
  const backUrl = `${basePath}/assignments`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error ? (error as Error).message : 'Tugas tidak ditemukan'}</p>
        <Link href={backUrl}>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Kelas', href: '/dashboard/classrooms' },
        { label: 'Detail Kelas', href: `/dashboard/classrooms/${classroomId}` },
        { label: 'Modul', href: `${basePath.split('/lessons')[0]}` },
        { label: 'Materi', href: basePath },
        { label: assignment.title }
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{assignment.title}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                assignment.type === 'QUIZ' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {assignment.type === 'QUIZ' ? 'Quiz' : 'Task Analysis'}
              </span>
            </div>
            {assignment.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{assignment.description}</p>
            )}
          </div>
        </div>
        {isTeacher && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleDraftMutation.mutate()}
              disabled={toggleDraftMutation.isPending}
            >
              {assignment.isDraft ? <Eye className="h-4 w-4 mr-1.5" /> : <EyeOff className="h-4 w-4 mr-1.5" />}
              {assignment.isDraft ? 'Publish' : 'Ke Draft'}
            </Button>
          </div>
        )}
      </div>

      {/* Info Bar */}
      <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          {assignment.xpReward} XP
        </span>
        <span>
          {assignment.questionCount || 0} {assignment.type === 'QUIZ' ? 'pertanyaan' : 'langkah'}
        </span>
        {isTeacher && (
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {assignment.submissionCount || 0} submission
          </span>
        )}
        {assignment.isDraft && (
          <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">
            Draft
          </span>
        )}
      </div>

      {/* TEACHER VIEW */}
      {isTeacher && (
        <div className="space-y-6">
          {/* Questions / Steps Editor */}
          <Card>
            <CardContent className="p-4">
              {assignment.type === 'QUIZ' ? (
                <QuizQuestionEditor
                  assignmentId={assignmentId}
                  questions={assignment.quizQuestions || []}
                  accessToken={accessToken}
                />
              ) : (
                <TaskStepEditor
                  assignmentId={assignmentId}
                  steps={assignment.taskSteps || []}
                  accessToken={accessToken}
                />
              )}
            </CardContent>
          </Card>

          {/* Submissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionsView assignmentId={assignmentId} accessToken={accessToken} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* STUDENT VIEW */}
      {!isTeacher && (
        <div>
          {/* Already submitted */}
          {mySubmission && (mySubmission.status === 'SUBMITTED' || mySubmission.status === 'GRADED') ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {mySubmission.status === 'GRADED' ? 'Sudah Dinilai' : 'Sudah Dikumpulkan'}
                </h3>
                {mySubmission.score !== null && mySubmission.score !== undefined && (
                  <div className={`text-3xl font-bold mb-2 ${
                    mySubmission.score >= 60 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.round(mySubmission.score)}%
                  </div>
                )}
                {mySubmission.grading?.feedback && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 text-sm text-blue-700 max-w-md mx-auto">
                    <p className="font-medium mb-1">Feedback Guru:</p>
                    <p>{mySubmission.grading.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : assignment.type === 'QUIZ' ? (
            <QuizTaker assignment={assignment} accessToken={accessToken} />
          ) : (
            <TaskSubmitter assignment={assignment} accessToken={accessToken} />
          )}
        </div>
      )}
    </div>
  );
}
