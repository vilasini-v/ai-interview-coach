-- CreateTable
CREATE TABLE "ResumeSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resumeText" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobDescText" TEXT NOT NULL,
    "gapAnalysis" TEXT,
    "keywordMatch" TEXT,
    "rewrites" TEXT,
    "agentTrace" TEXT
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleTitle" TEXT NOT NULL,
    "jobDescText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "resumeSessionId" TEXT,
    CONSTRAINT "InterviewSession_resumeSessionId_fkey" FOREIGN KEY ("resumeSessionId") REFERENCES "ResumeSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interviewSessionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "parentId" TEXT,
    "answerText" TEXT,
    "answerMode" TEXT,
    "feedback" TEXT,
    "answeredAt" DATETIME,
    CONSTRAINT "InterviewQuestion_interviewSessionId_fkey" FOREIGN KEY ("interviewSessionId") REFERENCES "InterviewSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
