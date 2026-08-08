import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

export interface AdmissionAgentInput {
  admissionId: string;
  studentId: string;
  fullName: string;
  parentName: string;
  phone: string;
  whatsApp: string;
  email: string;
  age: number;
  batch: string;
  branch: string;
  coachName: string;
  feesStatus: string;
  schoolName?: string;
  createdAt: number;
}

const TENANT_ID = 'lions-karate-club-pune';

export async function runAdmissionAgent(input: AdmissionAgentInput) {
  const now = Date.now();
  const intent = classifyAdmissionIntent(input);
  const missingFields = findMissingFields(input);
  const plan = missingFields.length > 0
    ? [
        'Save the admission enquiry under the Lions tenant.',
        'Identify missing parent or student details.',
        'Create an admin follow-up task.',
        'Request owner approval before sending a follow-up message.',
      ]
    : [
        'Classify the admission enquiry intent.',
        'Save the lead and admission context under the Lions tenant.',
        'Check selected batch, branch, coach, and fee status.',
        'Create a trial or admission follow-up task.',
        'Draft an admin notification.',
        'Request owner approval before any external reply.',
      ];

  const enquiryDoc = await addDoc(collection(db, 'agent_enquiries'), {
    tenantId: TENANT_ID,
    source: 'website_admission_form',
    admissionId: input.admissionId,
    studentId: input.studentId,
    parentName: input.parentName,
    studentName: input.fullName,
    phone: input.phone,
    whatsApp: input.whatsApp,
    email: input.email,
    childAge: input.age,
    batch: input.batch,
    branch: input.branch,
    coachName: input.coachName,
    feesStatus: input.feesStatus,
    schoolName: input.schoolName || '',
    intent,
    status: 'new',
    createdAt: now,
  });

  const approvalMessage = missingFields.length > 0
    ? `Please contact ${input.parentName || input.fullName} and collect: ${missingFields.join(', ')}.`
    : `New Lions Karate admission enquiry from ${input.parentName || input.fullName}. Student: ${input.fullName}, age ${input.age}, batch ${input.batch}, branch ${input.branch}. Please approve the next reply/follow-up.`;

  const approvalDoc = await addDoc(collection(db, 'agent_approvals'), {
    tenantId: TENANT_ID,
    enquiryId: enquiryDoc.id,
    admissionId: input.admissionId,
    action: missingFields.length > 0 ? 'send_missing_info_followup' : 'send_admission_followup',
    status: 'pending_owner_approval',
    message: approvalMessage,
    createdAt: now,
  });

  const runPayload = {
    tenantId: TENANT_ID,
    enquiryId: enquiryDoc.id,
    admissionId: input.admissionId,
    status: 'completed',
    intent,
    goal: `Handle Lions Karate admission enquiry for ${input.fullName}`,
    plan,
    missingFields,
    toolCalls: [
      { name: 'create_lead', status: 'completed', collection: 'agent_enquiries' },
      { name: 'lookup_batches', status: 'completed', selectedBatch: input.batch },
      { name: 'create_followup_task', status: 'completed', collection: 'agent_followups' },
      { name: 'request_owner_approval', status: 'completed', approvalId: approvalDoc.id },
      { name: 'draft_admin_notification', status: 'completed', collection: 'agent_notifications' },
    ],
    result: missingFields.length > 0
      ? `Saved enquiry and requested approval to collect missing fields: ${missingFields.join(', ')}.`
      : 'Saved enquiry, created follow-up, drafted admin notification, and queued owner approval.',
    createdAt: now,
  };

  const runDoc = await addDoc(collection(db, 'agent_runs'), runPayload);

  await addDoc(collection(db, 'agent_followups'), {
    tenantId: TENANT_ID,
    enquiryId: enquiryDoc.id,
    admissionId: input.admissionId,
    title: missingFields.length > 0 ? 'Collect missing admission details' : 'Confirm admission or trial next step',
    details: approvalMessage,
    status: 'open',
    createdAt: now,
  });

  await addDoc(collection(db, 'agent_notifications'), {
    tenantId: TENANT_ID,
    enquiryId: enquiryDoc.id,
    admissionId: input.admissionId,
    type: 'admin_notification',
    title: 'Agent processed website admission enquiry',
    body: runPayload.result,
    createdAt: now,
  });

  return {
    enquiryId: enquiryDoc.id,
    approvalId: approvalDoc.id,
    runId: runDoc.id,
  };
}

function classifyAdmissionIntent(input: AdmissionAgentInput) {
  const text = `${input.batch} ${input.feesStatus} ${input.branch}`.toLowerCase();
  if (text.includes('trial')) return 'trial_class';
  if (text.includes('unpaid') || text.includes('fee')) return 'fees_and_admission';
  return 'admission';
}

function findMissingFields(input: AdmissionAgentInput) {
  return [
    ['parent name', input.parentName],
    ['phone', input.phone],
    ['email', input.email],
    ['batch', input.batch],
    ['branch', input.branch],
  ].filter(([, value]) => !String(value || '').trim()).map(([field]) => field);
}
