import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
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

export interface ParentQueryAgentInput {
  queryId: string;
  parentName: string;
  childName?: string;
  phone: string;
  email?: string;
  queryType: string;
  message: string;
  createdAt: number;
}

const TENANT_ID = 'lions-karate-club-pune';

export async function runParentQueryAgent(input: ParentQueryAgentInput) {
  const now = Date.now();
  const intent = classifyParentQueryIntent(input);
  const missingFields = findMissingQueryFields(input);
  const reply = draftParentQueryReply(input, intent, missingFields);
  const plan = missingFields.length > 0
    ? [
        'Read parent enquiry from website contact form.',
        'Detect missing details needed for proper follow-up.',
        'Draft a helpful reply asking for missing details.',
        'Save enquiry, reply draft, and admin follow-up in Firestore.',
      ]
    : [
        'Read parent enquiry from website contact form.',
        `Classify intent as ${intent}.`,
        'Use Lions Karate Club Pune business rules for answer.',
        'Draft parent reply and save it for admin review.',
        'Create follow-up task and agent activity log.',
      ];

  await updateDoc(doc(db, 'parent_queries', input.queryId), {
    agentIntent: intent,
    agentReply: reply,
    agentPlan: plan,
    agentStatus: 'reply_drafted',
    followUpNotes: reply,
    updatedAt: now,
  });

  const runDoc = await addDoc(collection(db, 'agent_runs'), {
    tenantId: TENANT_ID,
    queryId: input.queryId,
    source: 'website_parent_query_form',
    status: 'completed',
    intent,
    goal: `Handle parent enquiry from ${input.parentName}`,
    plan,
    missingFields,
    toolCalls: [
      { name: 'read_parent_query', status: 'completed', collection: 'parent_queries' },
      { name: 'lookup_lions_business_info', status: 'completed' },
      { name: 'draft_agent_reply', status: 'completed' },
      { name: 'update_parent_query', status: 'completed', collection: 'parent_queries' },
      { name: 'create_followup_task', status: 'completed', collection: 'agent_followups' },
    ],
    result: reply,
    createdAt: now,
  });

  await addDoc(collection(db, 'agent_enquiries'), {
    tenantId: TENANT_ID,
    source: 'website_parent_query_form',
    queryId: input.queryId,
    parentName: input.parentName,
    childName: input.childName || '',
    phone: input.phone,
    email: input.email || '',
    queryType: input.queryType,
    message: input.message,
    intent,
    agentReply: reply,
    status: 'reply_drafted',
    createdAt: now,
  });

  await addDoc(collection(db, 'agent_followups'), {
    tenantId: TENANT_ID,
    queryId: input.queryId,
    title: missingFields.length > 0 ? 'Collect missing enquiry details' : `Follow up: ${intent}`,
    details: reply,
    status: 'open',
    createdAt: now,
  });

  await addDoc(collection(db, 'agent_notifications'), {
    tenantId: TENANT_ID,
    queryId: input.queryId,
    type: 'admin_notification',
    title: 'Agent replied to parent enquiry',
    body: reply,
    createdAt: now,
  });

  return {
    runId: runDoc.id,
    intent,
    reply,
    missingFields,
  };
}

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

function classifyParentQueryIntent(input: ParentQueryAgentInput) {
  const text = `${input.queryType} ${input.message}`.toLowerCase();
  if (text.includes('trial') || text.includes('demo')) return 'trial_class';
  if (text.includes('fee') || text.includes('price') || text.includes('billing') || text.includes('cost')) return 'fees_and_billing';
  if (text.includes('batch') || text.includes('time') || text.includes('timing') || text.includes('schedule')) return 'batch_timing';
  if (text.includes('admission') || text.includes('join') || text.includes('enroll')) return 'admission';
  if (text.includes('belt') || text.includes('exam') || text.includes('promotion')) return 'belt_exam';
  if (text.includes('complaint') || text.includes('feedback')) return 'feedback';
  return 'general_query';
}

function draftParentQueryReply(input: ParentQueryAgentInput, intent: string, missingFields: string[]) {
  const name = input.parentName || 'Parent';
  if (missingFields.length > 0) {
    return `Hi ${name}, thank you for contacting Lions Karate Club Pune. To help you properly, please share ${missingFields.join(', ')}. Our team will guide you about the right batch, trial class, and next step.`;
  }

  if (intent === 'trial_class') {
    return `Hi ${name}, yes, we can arrange a trial class at Lions Karate Club Pune. Please keep your phone active so admin can confirm the branch, suitable batch, and trial timing. If you are ready, you can also proceed to the Online Admission form.`;
  }
  if (intent === 'fees_and_billing') {
    return `Hi ${name}, thank you for asking about fees. Fees can depend on batch, branch, and program type, so admin will confirm the latest amount before admission. I have saved your enquiry and marked it for fee follow-up.`;
  }
  if (intent === 'batch_timing') {
    return `Hi ${name}, Lions Karate Club Pune has evening training batches and branch-wise timings. I have saved your enquiry so admin can confirm the best timing for your child and nearest branch.`;
  }
  if (intent === 'admission') {
    return `Hi ${name}, admission is available through the Online Admission form. Before final registration, admin can help confirm batch, branch, fees, and trial details. Your enquiry is saved for follow-up.`;
  }
  if (intent === 'belt_exam') {
    return `Hi ${name}, belt exam and promotion details are handled from the student portal and admin review. I have saved your question so the team can check the correct belt/exam information.`;
  }
  if (intent === 'feedback') {
    return `Hi ${name}, thank you for sharing your feedback. It has been saved for admin review, and the team will follow up if action is needed.`;
  }

  return `Hi ${name}, thank you for contacting Lions Karate Club Pune. I have saved your enquiry and prepared it for admin follow-up. Our team can help with fees, batch timings, trial classes, admission, and belt exam questions.`;
}

function findMissingQueryFields(input: ParentQueryAgentInput) {
  return [
    ['parent name', input.parentName],
    ['phone number', input.phone],
    ['question/message', input.message],
  ].filter(([, value]) => !String(value || '').trim()).map(([field]) => field);
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
