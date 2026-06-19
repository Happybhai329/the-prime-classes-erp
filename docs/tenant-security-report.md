# Tenant Isolation Security Audit Report

Generated on: 2026-06-19T12:40:16.304Z

This report lists Prisma database queries that do not explicitly reference a `tenantId` filter, potentially violating the multi-tenant isolation model.

## Executive Summary
- **Total Findings**: 127
- **🔴 High Risk (Bulk operations / un-scraped writes)**: 115
- **🟡 Medium Risk (Single record reads/updates)**: 12
- **🟢 Low Risk**: 0

---

## Detailed Findings


### 1. [HIGH] testMarks.findMany in apps/api/src/modules/achievements/achievements.service.ts
- **File**: [achievements.service.ts](apps/api/src/modules/achievements/achievements.service.ts#L191) (Line 191)
- **Query Code**: `this.prisma.testMarks.findMany({ where: { studentId: s.id, isAbsent: false, test: { status: 'PUBLISH...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 2. [HIGH] documentVerification.update in apps/api/src/modules/admissions/admissions.service.ts
- **File**: [admissions.service.ts](apps/api/src/modules/admissions/admissions.service.ts#L188) (Line 188)
- **Query Code**: `this.prisma.documentVerification.update({ where: { id: existing.id }, data: { documentUrl, status: D...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 3. [HIGH] documentVerification.create in apps/api/src/modules/admissions/admissions.service.ts
- **File**: [admissions.service.ts](apps/api/src/modules/admissions/admissions.service.ts#L200) (Line 200)
- **Query Code**: `this.prisma.documentVerification.create({ data: { applicationId: id, documentType, documentUrl, stat...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 4. [HIGH] studentParentMap.create in apps/api/src/modules/admissions/admissions.service.ts
- **File**: [admissions.service.ts](apps/api/src/modules/admissions/admissions.service.ts#L338) (Line 338)
- **Query Code**: `tx.studentParentMap.create({ data: { studentId: student.id, parentId: parent.id, relationship: 'GUAR...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 5. [HIGH] lead.update in apps/api/src/modules/admissions/admissions.service.ts
- **File**: [admissions.service.ts](apps/api/src/modules/admissions/admissions.service.ts#L358) (Line 358)
- **Query Code**: `tx.lead.update({ where: { id: app.leadId }, data: { status: 'ADMISSION_CONFIRMED' }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 6. [HIGH] assignmentSubmission.findMany in apps/api/src/modules/analytics/services/prediction.service.ts
- **File**: [prediction.service.ts](apps/api/src/modules/analytics/services/prediction.service.ts#L99) (Line 99)
- **Query Code**: `this.prisma.assignmentSubmission.findMany({ where: { studentId }, select: { status: true }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 7. [HIGH] assignment.count in apps/api/src/modules/analytics/services/prediction.service.ts
- **File**: [prediction.service.ts](apps/api/src/modules/analytics/services/prediction.service.ts#L104) (Line 104)
- **Query Code**: `this.prisma.assignment.count({ where: { batchId: { in: batchIds }, deletedAt: null }, })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 8. [HIGH] testRanking.findMany in apps/api/src/modules/analytics/services/prediction.service.ts
- **File**: [prediction.service.ts](apps/api/src/modules/analytics/services/prediction.service.ts#L114) (Line 114)
- **Query Code**: `this.prisma.testRanking.findMany({ where: { studentId }, include: { test: true }, orderBy: { test: {...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 9. [HIGH] attendanceSnapshot.upsert in apps/api/src/modules/analytics/services/prediction.service.ts
- **File**: [prediction.service.ts](apps/api/src/modules/analytics/services/prediction.service.ts#L366) (Line 366)
- **Query Code**: `this.prisma.attendanceSnapshot.upsert({ where: { studentId_month_year: { studentId, month, year }, }...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 10. [HIGH] notification.findMany in apps/api/src/modules/announcements/announcements.service.ts
- **File**: [announcements.service.ts](apps/api/src/modules/announcements/announcements.service.ts#L74) (Line 74)
- **Query Code**: `this.prisma.notification.findMany({ where, include: { creator: { select: { email: true } }, }, order...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 11. [HIGH] notification.count in apps/api/src/modules/announcements/announcements.service.ts
- **File**: [announcements.service.ts](apps/api/src/modules/announcements/announcements.service.ts#L83) (Line 83)
- **Query Code**: `this.prisma.notification.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 12. [HIGH] webhookDelivery.create in apps/api/src/modules/api-platform/api-platform.service.ts
- **File**: [api-platform.service.ts](apps/api/src/modules/api-platform/api-platform.service.ts#L172) (Line 172)
- **Query Code**: `this.prisma.webhookDelivery.create({ data: { eventId: event.id, endpointId: endpoint.id }, })...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 13. [HIGH] webhookEvent.update in apps/api/src/modules/api-platform/api-platform.service.ts
- **File**: [api-platform.service.ts](apps/api/src/modules/api-platform/api-platform.service.ts#L188) (Line 188)
- **Query Code**: `this.prisma.webhookEvent.update({ where: { id: event.id }, data: { status: 'DISPATCHED' }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 14. [HIGH] assignment.findMany in apps/api/src/modules/assignments/assignments.service.ts
- **File**: [assignments.service.ts](apps/api/src/modules/assignments/assignments.service.ts#L138) (Line 138)
- **Query Code**: `this.prisma.assignment.findMany({ where, include: { batch: { select: { name: true, code: true } }, s...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 15. [HIGH] assignment.count in apps/api/src/modules/assignments/assignments.service.ts
- **File**: [assignments.service.ts](apps/api/src/modules/assignments/assignments.service.ts#L154) (Line 154)
- **Query Code**: `this.prisma.assignment.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 16. [MEDIUM] attendanceRecord.createMany in apps/api/src/modules/attendance/attendance.service.ts
- **File**: [attendance.service.ts](apps/api/src/modules/attendance/attendance.service.ts#L87) (Line 87)
- **Query Code**: `tx.attendanceRecord.createMany({ data: recordData })`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 17. [HIGH] attendanceSession.count in apps/api/src/modules/attendance/attendance.service.ts
- **File**: [attendance.service.ts](apps/api/src/modules/attendance/attendance.service.ts#L141) (Line 141)
- **Query Code**: `this.prisma.attendanceSession.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 18. [HIGH] batch.count in apps/api/src/modules/batches/batches.service.ts
- **File**: [batches.service.ts](apps/api/src/modules/batches/batches.service.ts#L58) (Line 58)
- **Query Code**: `this.prisma.batch.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 19. [HIGH] batchStudent.create in apps/api/src/modules/batches/batches.service.ts
- **File**: [batches.service.ts](apps/api/src/modules/batches/batches.service.ts#L265) (Line 265)
- **Query Code**: `this.prisma.batchStudent.create({ data: { batchId, studentId }, })`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 20. [HIGH] batchStudent.create in apps/api/src/modules/batches/batches.service.ts
- **File**: [batches.service.ts](apps/api/src/modules/batches/batches.service.ts#L337) (Line 337)
- **Query Code**: `this.prisma.batchStudent.create({ data: { batchId: dto.targetBatchId, studentId: dto.studentId, tran...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 21. [HIGH] campaign.update in apps/api/src/modules/campaigns/campaigns.service.ts
- **File**: [campaigns.service.ts](apps/api/src/modules/campaigns/campaigns.service.ts#L135) (Line 135)
- **Query Code**: `this.prisma.campaign.update({ where: { id }, data: { status: CampaignStatus.COMPLETED, sentAt: new D...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 22. [HIGH] ticketMessage.create in apps/api/src/modules/communication/communication.service.ts
- **File**: [communication.service.ts](apps/api/src/modules/communication/communication.service.ts#L57) (Line 57)
- **Query Code**: `tx.ticketMessage.create({ data: { ticketId: ticket.id, senderId: userId, content: dto.message, }, })...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 23. [HIGH] ticketMessage.create in apps/api/src/modules/communication/communication.service.ts
- **File**: [communication.service.ts](apps/api/src/modules/communication/communication.service.ts#L176) (Line 176)
- **Query Code**: `this.prisma.ticketMessage.create({ data: { ticketId, senderId: userId, content: dto.message, attachm...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 24. [HIGH] supportTicket.count in apps/api/src/modules/communication/communication.service.ts
- **File**: [communication.service.ts](apps/api/src/modules/communication/communication.service.ts#L264) (Line 264)
- **Query Code**: `this.prisma.supportTicket.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 25. [HIGH] lead.findUnique in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L78) (Line 78)
- **Query Code**: `this.prisma.lead.findUnique({ where: { id: leadId }, include: { activities: { where: { isCompleted: ...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 26. [HIGH] leadActivity.findFirst in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L89) (Line 89)
- **Query Code**: `this.prisma.leadActivity.findFirst({ where: { leadId, isCompleted: false, activityType: LeadActivity...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 27. [HIGH] lead.update in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L105) (Line 105)
- **Query Code**: `this.prisma.lead.update({ where: { id: leadId }, data: { score: new Prisma.Decimal(newScore) }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 28. [HIGH] lead.count in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L164) (Line 164)
- **Query Code**: `this.prisma.lead.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 29. [HIGH] leadActivity.create in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L247) (Line 247)
- **Query Code**: `this.prisma.leadActivity.create({ data: { leadId: lead.id, activityType: LeadActivityType.STATUS_CHA...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 30. [HIGH] lead.findUnique in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L260) (Line 260)
- **Query Code**: `this.prisma.lead.findUnique({ where: { id: lead.id }, include: { counselor: true }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 31. [HIGH] leadActivity.create in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L291) (Line 291)
- **Query Code**: `this.prisma.leadActivity.create({ data: { leadId: id, activityType: LeadActivityType.STATUS_CHANGE, ...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 32. [HIGH] leadActivity.create in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L346) (Line 346)
- **Query Code**: `this.prisma.leadActivity.create({ data: { leadId, activityType: LeadActivityType.STATUS_CHANGE, desc...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 33. [HIGH] leadActivity.create in apps/api/src/modules/crm/crm.service.ts
- **File**: [crm.service.ts](apps/api/src/modules/crm/crm.service.ts#L370) (Line 370)
- **Query Code**: `this.prisma.leadActivity.create({ data: { leadId, activityType: data.activityType, description: data...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 34. [HIGH] notificationLog.count in apps/api/src/modules/dashboard/dashboard.service.ts
- **File**: [dashboard.service.ts](apps/api/src/modules/dashboard/dashboard.service.ts#L392) (Line 392)
- **Query Code**: `this.prisma.notificationLog.count({ where: { userId: parentUserId, status: { not: 'READ' } } })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 35. [HIGH] backupRun.findMany in apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts
- **File**: [disaster-recovery.service.ts](apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts#L9) (Line 9)
- **Query Code**: `this.prisma.backupRun.findMany({ orderBy: { startedAt: 'desc' }, take: 100, })`
- **Remediation**: Add `tenantId` filter directly to the query where clause: `where: { tenantId, ... }`.


### 36. [HIGH] backupRun.create in apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts
- **File**: [disaster-recovery.service.ts](apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts#L16) (Line 16)
- **Query Code**: `this.prisma.backupRun.create({ data: { target, metadata: metadata as any }, })`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 37. [HIGH] backupRun.update in apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts
- **File**: [disaster-recovery.service.ts](apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts#L31) (Line 31)
- **Query Code**: `this.prisma.backupRun.update({ where: { id }, data: { status: input.status, backupUrl: input.backupU...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 38. [HIGH] restoreDrill.findMany in apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts
- **File**: [disaster-recovery.service.ts](apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts#L45) (Line 45)
- **Query Code**: `this.prisma.restoreDrill.findMany({ orderBy: { startedAt: 'desc' }, take: 100, })`
- **Remediation**: Add `tenantId` filter directly to the query where clause: `where: { tenantId, ... }`.


### 39. [HIGH] restoreDrill.create in apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts
- **File**: [disaster-recovery.service.ts](apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts#L59) (Line 59)
- **Query Code**: `this.prisma.restoreDrill.create({ data: { backupRunId: input.backupRunId || null, status: input.stat...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 40. [HIGH] disasterRecoveryEvent.findMany in apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts
- **File**: [disaster-recovery.service.ts](apps/api/src/modules/disaster-recovery/disaster-recovery.service.ts#L76) (Line 76)
- **Query Code**: `this.prisma.disasterRecoveryEvent.findMany({ orderBy: { openedAt: 'desc' }, take: 100, })...`
- **Remediation**: Add `tenantId` filter directly to the query where clause: `where: { tenantId, ... }`.


### 41. [HIGH] document.count in apps/api/src/modules/documents/documents.service.ts
- **File**: [documents.service.ts](apps/api/src/modules/documents/documents.service.ts#L90) (Line 90)
- **Query Code**: `this.prisma.document.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 42. [HIGH] organizationUnit.findMany in apps/api/src/modules/enterprise/enterprise-rollup.service.ts
- **File**: [enterprise-rollup.service.ts](apps/api/src/modules/enterprise/enterprise-rollup.service.ts#L181) (Line 181)
- **Query Code**: `this.prisma.organizationUnit.findMany({ where: { organizationId, type: { notIn: ['ORGANIZATION', 'BR...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 43. [HIGH] organizationUnitClosure.findMany in apps/api/src/modules/enterprise/enterprise-rollup.service.ts
- **File**: [enterprise-rollup.service.ts](apps/api/src/modules/enterprise/enterprise-rollup.service.ts#L189) (Line 189)
- **Query Code**: `this.prisma.organizationUnitClosure.findMany({ where: { ancestorId: unit.id, depth: { gt: 0 } }, sel...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 44. [HIGH] enterpriseRollup.findMany in apps/api/src/modules/enterprise/enterprise-rollup.service.ts
- **File**: [enterprise-rollup.service.ts](apps/api/src/modules/enterprise/enterprise-rollup.service.ts#L195) (Line 195)
- **Query Code**: `this.prisma.enterpriseRollup.findMany({ where: { organizationId, organizationUnitId: { in: descendan...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 45. [HIGH] eventRegistration.create in apps/api/src/modules/events/events.service.ts
- **File**: [events.service.ts](apps/api/src/modules/events/events.service.ts#L143) (Line 143)
- **Query Code**: `this.prisma.eventRegistration.create({ data: { eventId, leadId, firstName: data.firstName, lastName:...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 46. [HIGH] faculty.count in apps/api/src/modules/faculty/faculty.service.ts
- **File**: [faculty.service.ts](apps/api/src/modules/faculty/faculty.service.ts#L54) (Line 54)
- **Query Code**: `this.prisma.faculty.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 47. [HIGH] feeStructure.count in apps/api/src/modules/fees/services/fee-plans.service.ts
- **File**: [fee-plans.service.ts](apps/api/src/modules/fees/services/fee-plans.service.ts#L74) (Line 74)
- **Query Code**: `this.prisma.feeStructure.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 48. [HIGH] studentFee.update in apps/api/src/modules/fees/services/payments.service.ts
- **File**: [payments.service.ts](apps/api/src/modules/fees/services/payments.service.ts#L74) (Line 74)
- **Query Code**: `tx.studentFee.update({ where: { id: dto.studentFeeId }, data: { paidAmount: newPaidAmount, status: n...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 49. [HIGH] feePayment.count in apps/api/src/modules/fees/services/payments.service.ts
- **File**: [payments.service.ts](apps/api/src/modules/fees/services/payments.service.ts#L137) (Line 137)
- **Query Code**: `this.prisma.feePayment.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 50. [HIGH] feeInstallment.findUnique in apps/api/src/modules/fees/services/payments.service.ts
- **File**: [payments.service.ts](apps/api/src/modules/fees/services/payments.service.ts#L200) (Line 200)
- **Query Code**: `tx.feeInstallment.findUnique({ where: { id: payment.installmentId } })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 51. [HIGH] feeInstallment.update in apps/api/src/modules/fees/services/payments.service.ts
- **File**: [payments.service.ts](apps/api/src/modules/fees/services/payments.service.ts#L206) (Line 206)
- **Query Code**: `tx.feeInstallment.update({ where: { id: payment.installmentId }, data: { paidAmount: Math.max(0, new...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 52. [HIGH] feeReceipt.count in apps/api/src/modules/fees/services/receipts.service.ts
- **File**: [receipts.service.ts](apps/api/src/modules/fees/services/receipts.service.ts#L100) (Line 100)
- **Query Code**: `this.prisma.feeReceipt.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 53. [HIGH] studentFee.update in apps/api/src/modules/fees/services/refunds.service.ts
- **File**: [refunds.service.ts](apps/api/src/modules/fees/services/refunds.service.ts#L77) (Line 77)
- **Query Code**: `tx.studentFee.update({ where: { id: refund.studentFeeId }, data: { paidAmount: newPaidAmount, status...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 54. [HIGH] feeRefund.count in apps/api/src/modules/fees/services/refunds.service.ts
- **File**: [refunds.service.ts](apps/api/src/modules/fees/services/refunds.service.ts#L125) (Line 125)
- **Query Code**: `this.prisma.feeRefund.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 55. [MEDIUM] feeInstallment.createMany in apps/api/src/modules/fees/services/student-fees.service.ts
- **File**: [student-fees.service.ts](apps/api/src/modules/fees/services/student-fees.service.ts#L57) (Line 57)
- **Query Code**: `tx.feeInstallment.createMany({ data: installments })`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 56. [MEDIUM] feeInstallment.createMany in apps/api/src/modules/fees/services/student-fees.service.ts
- **File**: [student-fees.service.ts](apps/api/src/modules/fees/services/student-fees.service.ts#L118) (Line 118)
- **Query Code**: `tx.feeInstallment.createMany({ data: installments })`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 57. [HIGH] studentFee.count in apps/api/src/modules/fees/services/student-fees.service.ts
- **File**: [student-fees.service.ts](apps/api/src/modules/fees/services/student-fees.service.ts#L178) (Line 178)
- **Query Code**: `this.prisma.studentFee.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 58. [HIGH] franchiseOwner.create in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L19) (Line 19)
- **Query Code**: `this.prisma.franchiseOwner.create({ data: { organizationId, name: dto.name, email: dto.email, phone:...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 59. [HIGH] franchiseOwner.findMany in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L32) (Line 32)
- **Query Code**: `this.prisma.franchiseOwner.findMany({ where: { organizationId }, include: { agreements: { include: {...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 60. [HIGH] franchiseOwner.findFirst in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L48) (Line 48)
- **Query Code**: `this.prisma.franchiseOwner.findFirst({ where: { id: dto.ownerId, organizationId }, })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 61. [HIGH] royaltyLedger.create in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L152) (Line 152)
- **Query Code**: `this.prisma.royaltyLedger.create({ data: { agreementId: agreement.id, periodStart, periodEnd, ...dat...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 62. [HIGH] royaltyLedger.findMany in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L168) (Line 168)
- **Query Code**: `this.prisma.royaltyLedger.findMany({ where: { agreement: { organizationId, ...(ownerId ? { ownerId }...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 63. [HIGH] franchiseInvoice.create in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L229) (Line 229)
- **Query Code**: `this.prisma.franchiseInvoice.create({ data: { organizationId, ownerId: dto.ownerId, invoiceNumber: d...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 64. [HIGH] franchiseInvoice.findMany in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L242) (Line 242)
- **Query Code**: `this.prisma.franchiseInvoice.findMany({ where: { organizationId }, include: { owner: true }, orderBy...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 65. [HIGH] franchiseStatement.upsert in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L262) (Line 262)
- **Query Code**: `this.prisma.franchiseStatement.upsert({ where: { statementNumber }, update: { periodStart, periodEnd...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 66. [HIGH] franchiseStatement.findMany in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L292) (Line 292)
- **Query Code**: `this.prisma.franchiseStatement.findMany({ where: { organizationId, ...(ownerId ? { ownerId } : {}) }...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 67. [HIGH] payoutReport.upsert in apps/api/src/modules/franchise-billing/franchise-billing.service.ts
- **File**: [franchise-billing.service.ts](apps/api/src/modules/franchise-billing/franchise-billing.service.ts#L307) (Line 307)
- **Query Code**: `this.prisma.payoutReport.upsert({ where: { reportNumber }, update: { grossRevenue: performance.gross...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 68. [HIGH] marketplaceApp.create in apps/api/src/modules/marketplace/marketplace.service.ts
- **File**: [marketplace.service.ts](apps/api/src/modules/marketplace/marketplace.service.ts#L22) (Line 22)
- **Query Code**: `tx.marketplaceApp.create({ data: { name: dto.name, slug: dto.slug, publisher: dto.publisher, descrip...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 69. [MEDIUM] extensionPoint.createMany in apps/api/src/modules/marketplace/marketplace.service.ts
- **File**: [marketplace.service.ts](apps/api/src/modules/marketplace/marketplace.service.ts#L36) (Line 36)
- **Query Code**: `tx.extensionPoint.createMany({ data: dto.extensionPoints.map((type) => ({ appId: app.id, type: type ...`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 70. [HIGH] marketplaceApp.findMany in apps/api/src/modules/marketplace/marketplace.service.ts
- **File**: [marketplace.service.ts](apps/api/src/modules/marketplace/marketplace.service.ts#L49) (Line 49)
- **Query Code**: `this.prisma.marketplaceApp.findMany({ where: includeUnpublished ? {} : { status: 'PUBLISHED' }, incl...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 71. [HIGH] marketplaceApp.update in apps/api/src/modules/marketplace/marketplace.service.ts
- **File**: [marketplace.service.ts](apps/api/src/modules/marketplace/marketplace.service.ts#L57) (Line 57)
- **Query Code**: `this.prisma.marketplaceApp.update({ where: { id: appId }, data: { status: 'PUBLISHED' }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 72. [HIGH] marketplaceApp.findUnique in apps/api/src/modules/marketplace/marketplace.service.ts
- **File**: [marketplace.service.ts](apps/api/src/modules/marketplace/marketplace.service.ts#L68) (Line 68)
- **Query Code**: `this.prisma.marketplaceApp.findUnique({ where: { id: appId }, })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 73. [MEDIUM] marketplacePermissionGrant.createMany in apps/api/src/modules/marketplace/marketplace.service.ts
- **File**: [marketplace.service.ts](apps/api/src/modules/marketplace/marketplace.service.ts#L94) (Line 94)
- **Query Code**: `tx.marketplacePermissionGrant.createMany({ data: dto.permissions.map((permission) => ({ installation...`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 74. [HIGH] materialVersion.create in apps/api/src/modules/materials/materials.service.ts
- **File**: [materials.service.ts](apps/api/src/modules/materials/materials.service.ts#L89) (Line 89)
- **Query Code**: `tx.materialVersion.create({ data: { materialId: mat.id, version: 1, fileUrl: key, fileSize: size, up...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 75. [HIGH] materialVersion.create in apps/api/src/modules/materials/materials.service.ts
- **File**: [materials.service.ts](apps/api/src/modules/materials/materials.service.ts#L145) (Line 145)
- **Query Code**: `tx.materialVersion.create({ data: { materialId: material.id, version: nextVersion, fileUrl, fileSize...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 76. [HIGH] batchStudent.findMany in apps/api/src/modules/materials/materials.service.ts
- **File**: [materials.service.ts](apps/api/src/modules/materials/materials.service.ts#L225) (Line 225)
- **Query Code**: `this.prisma.batchStudent.findMany({ where: { studentId: userContext.studentId, status: 'ACTIVE' }, s...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 77. [HIGH] material.findMany in apps/api/src/modules/materials/materials.service.ts
- **File**: [materials.service.ts](apps/api/src/modules/materials/materials.service.ts#L246) (Line 246)
- **Query Code**: `this.prisma.material.findMany({ where, include: { category: { select: { id: true, name: true } }, ba...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 78. [HIGH] material.count in apps/api/src/modules/materials/materials.service.ts
- **File**: [materials.service.ts](apps/api/src/modules/materials/materials.service.ts#L259) (Line 259)
- **Query Code**: `this.prisma.material.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 79. [HIGH] materialFavorite.create in apps/api/src/modules/materials/materials.service.ts
- **File**: [materials.service.ts](apps/api/src/modules/materials/materials.service.ts#L363) (Line 363)
- **Query Code**: `this.prisma.materialFavorite.create({ data: { materialId: id, studentId, }, })...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 80. [HIGH] notice.count in apps/api/src/modules/notices/notices.service.ts
- **File**: [notices.service.ts](apps/api/src/modules/notices/notices.service.ts#L128) (Line 128)
- **Query Code**: `this.prisma.notice.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 81. [MEDIUM] notificationLog.createMany in apps/api/src/modules/notifications/notifications.service.ts
- **File**: [notifications.service.ts](apps/api/src/modules/notifications/notifications.service.ts#L62) (Line 62)
- **Query Code**: `tx.notificationLog.createMany({ data: logsData })`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 82. [MEDIUM] onlineTestQuestion.createMany in apps/api/src/modules/online-tests/online-tests.service.ts
- **File**: [online-tests.service.ts](apps/api/src/modules/online-tests/online-tests.service.ts#L57) (Line 57)
- **Query Code**: `this.prisma.onlineTestQuestion.createMany({ data: records, })`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 83. [MEDIUM] onlineTestQuestion.createMany in apps/api/src/modules/online-tests/online-tests.service.ts
- **File**: [online-tests.service.ts](apps/api/src/modules/online-tests/online-tests.service.ts#L148) (Line 148)
- **Query Code**: `this.prisma.onlineTestQuestion.createMany({ data: records as any, })`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 84. [HIGH] onlineTest.count in apps/api/src/modules/online-tests/online-tests.service.ts
- **File**: [online-tests.service.ts](apps/api/src/modules/online-tests/online-tests.service.ts#L230) (Line 230)
- **Query Code**: `this.prisma.onlineTest.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 85. [MEDIUM] testResponse.createMany in apps/api/src/modules/online-tests/online-tests.service.ts
- **File**: [online-tests.service.ts](apps/api/src/modules/online-tests/online-tests.service.ts#L404) (Line 404)
- **Query Code**: `tx.testResponse.createMany({ data: responseRecords, })`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 86. [HIGH] testAttempt.update in apps/api/src/modules/online-tests/online-tests.service.ts
- **File**: [online-tests.service.ts](apps/api/src/modules/online-tests/online-tests.service.ts#L409) (Line 409)
- **Query Code**: `tx.testAttempt.update({ where: { id: attemptId }, data: { status: finalStatus, submittedAt, scoreObt...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 87. [HIGH] student.update in apps/api/src/modules/online-tests/online-tests.service.ts
- **File**: [online-tests.service.ts](apps/api/src/modules/online-tests/online-tests.service.ts#L437) (Line 437)
- **Query Code**: `tx.student.update({ where: { id: studentId }, data: { points: { increment: pointsGranted } }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 88. [HIGH] organizationUnit.findMany in apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts
- **File**: [organization-hierarchy.service.ts](apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts#L15) (Line 15)
- **Query Code**: `this.prisma.organizationUnit.findMany({ where: { organizationId }, orderBy: [{ type: 'asc' }, { name...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 89. [HIGH] organizationUnit.findFirst in apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts
- **File**: [organization-hierarchy.service.ts](apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts#L38) (Line 38)
- **Query Code**: `tx.organizationUnit.findFirst({ where: { id: dto.parentId, organizationId: dto.organizationId }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 90. [HIGH] organizationUnitClosure.create in apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts
- **File**: [organization-hierarchy.service.ts](apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts#L62) (Line 62)
- **Query Code**: `tx.organizationUnitClosure.create({ data: { organizationId: dto.organizationId, ancestorId: unit.id,...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 91. [MEDIUM] organizationUnitClosure.createMany in apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts
- **File**: [organization-hierarchy.service.ts](apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts#L76) (Line 76)
- **Query Code**: `tx.organizationUnitClosure.createMany({ data: parentLinks.map((link) => ({ organizationId: dto.organ...`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 92. [HIGH] organizationUnit.update in apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts
- **File**: [organization-hierarchy.service.ts](apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts#L92) (Line 92)
- **Query Code**: `this.prisma.organizationUnit.update({ where: { id }, data: { ...dto, metadata: dto.metadata ? (dto.m...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 93. [HIGH] organizationUnit.upsert in apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts
- **File**: [organization-hierarchy.service.ts](apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts#L134) (Line 134)
- **Query Code**: `this.prisma.organizationUnit.upsert({ where: { organizationId_code: { organizationId: org.id, code: ...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 94. [HIGH] organizationUnit.upsert in apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts
- **File**: [organization-hierarchy.service.ts](apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts#L159) (Line 159)
- **Query Code**: `this.prisma.organizationUnit.upsert({ where: { organizationId_code: { organizationId: org.id, code: ...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 95. [HIGH] organizationUnitClosure.upsert in apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts
- **File**: [organization-hierarchy.service.ts](apps/api/src/modules/organization-hierarchy/organization-hierarchy.service.ts#L203) (Line 203)
- **Query Code**: `this.prisma.organizationUnitClosure.upsert({ where: { ancestorId_descendantId: { ancestorId, descend...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 96. [HIGH] parent.count in apps/api/src/modules/parents/parents.service.ts
- **File**: [parents.service.ts](apps/api/src/modules/parents/parents.service.ts#L66) (Line 66)
- **Query Code**: `this.prisma.parent.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 97. [HIGH] question.count in apps/api/src/modules/questions/questions.service.ts
- **File**: [questions.service.ts](apps/api/src/modules/questions/questions.service.ts#L92) (Line 92)
- **Query Code**: `this.prisma.question.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 98. [HIGH] question.create in apps/api/src/modules/questions/questions.service.ts
- **File**: [questions.service.ts](apps/api/src/modules/questions/questions.service.ts#L155) (Line 155)
- **Query Code**: `this.prisma.question.create({ data: { ...q, options: q.options ? JSON.parse(q.options) : undefined, ...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 99. [MEDIUM] questionBankQuestion.createMany in apps/api/src/modules/questions/questions.service.ts
- **File**: [questions.service.ts](apps/api/src/modules/questions/questions.service.ts#L234) (Line 234)
- **Query Code**: `this.prisma.questionBankQuestion.createMany({ data: records, skipDuplicates: true, })...`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 100. [HIGH] resourceCenterItem.create in apps/api/src/modules/resource-center/resource-center.service.ts
- **File**: [resource-center.service.ts](apps/api/src/modules/resource-center/resource-center.service.ts#L14) (Line 14)
- **Query Code**: `this.prisma.resourceCenterItem.create({ data: { organizationId, title: dto.title, description: dto.d...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 101. [HIGH] sharedAcademicAsset.create in apps/api/src/modules/resource-center/resource-center.service.ts
- **File**: [resource-center.service.ts](apps/api/src/modules/resource-center/resource-center.service.ts#L54) (Line 54)
- **Query Code**: `this.prisma.sharedAcademicAsset.create({ data: { organizationId, assetType: dto.assetType as any, ti...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 102. [HIGH] student.findMany in apps/api/src/modules/students/students.service.ts
- **File**: [students.service.ts](apps/api/src/modules/students/students.service.ts#L54) (Line 54)
- **Query Code**: `this.prisma.student.findMany({ where, skip: query.skip, take: query.take, orderBy: { [sortBy]: query...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 103. [HIGH] student.count in apps/api/src/modules/students/students.service.ts
- **File**: [students.service.ts](apps/api/src/modules/students/students.service.ts#L78) (Line 78)
- **Query Code**: `this.prisma.student.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 104. [HIGH] batchStudent.create in apps/api/src/modules/students/students.service.ts
- **File**: [students.service.ts](apps/api/src/modules/students/students.service.ts#L204) (Line 204)
- **Query Code**: `tx.batchStudent.create({ data: { batchId: dto.batchId, studentId: student.id, }, })...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 105. [HIGH] studentParentMap.create in apps/api/src/modules/students/students.service.ts
- **File**: [students.service.ts](apps/api/src/modules/students/students.service.ts#L246) (Line 246)
- **Query Code**: `tx.studentParentMap.create({ data: { studentId: student.id, parentId: parent.id, relationship: 'FATH...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 106. [HIGH] plan.findMany in apps/api/src/modules/super-admin/super-admin.service.ts
- **File**: [super-admin.service.ts](apps/api/src/modules/super-admin/super-admin.service.ts#L89) (Line 89)
- **Query Code**: `this.prisma.plan.findMany({ include: { featureFlags: true }, })`
- **Remediation**: Add `tenantId` filter directly to the query where clause: `where: { tenantId, ... }`.


### 107. [HIGH] saaSInvoice.count in apps/api/src/modules/super-admin/super-admin.service.ts
- **File**: [super-admin.service.ts](apps/api/src/modules/super-admin/super-admin.service.ts#L137) (Line 137)
- **Query Code**: `this.prisma.saaSInvoice.count()`
- **Remediation**: Add `tenantId` filter directly to the query where clause: `where: { tenantId, ... }`.


### 108. [HIGH] saaSInvoice.findMany in apps/api/src/modules/super-admin/super-admin.service.ts
- **File**: [super-admin.service.ts](apps/api/src/modules/super-admin/super-admin.service.ts#L163) (Line 163)
- **Query Code**: `this.prisma.saaSInvoice.findMany({ include: { tenant: true }, orderBy: { createdAt: 'desc' }, })...`
- **Remediation**: Add `tenantId` filter directly to the query where clause: `where: { tenantId, ... }`.


### 109. [HIGH] subscription.findMany in apps/api/src/modules/super-admin/super-admin.service.ts
- **File**: [super-admin.service.ts](apps/api/src/modules/super-admin/super-admin.service.ts#L168) (Line 168)
- **Query Code**: `this.prisma.subscription.findMany({ where: { status: 'ACTIVE' }, include: { plan: true }, })...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 110. [HIGH] supportTicket.findMany in apps/api/src/modules/super-admin/super-admin.service.ts
- **File**: [super-admin.service.ts](apps/api/src/modules/super-admin/super-admin.service.ts#L213) (Line 213)
- **Query Code**: `this.prisma.supportTicket.findMany({ include: { tenant: { select: { name: true } }, creator: { selec...`
- **Remediation**: Add `tenantId` filter directly to the query where clause: `where: { tenantId, ... }`.


### 111. [HIGH] supportTicket.findUnique in apps/api/src/modules/super-admin/super-admin.service.ts
- **File**: [super-admin.service.ts](apps/api/src/modules/super-admin/super-admin.service.ts#L223) (Line 223)
- **Query Code**: `this.prisma.supportTicket.findUnique({ where: { id: ticketId } })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 112. [HIGH] ticketMessage.create in apps/api/src/modules/super-admin/super-admin.service.ts
- **File**: [super-admin.service.ts](apps/api/src/modules/super-admin/super-admin.service.ts#L226) (Line 226)
- **Query Code**: `this.prisma.ticketMessage.create({ data: { ticketId, senderId, content, }, })...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 113. [HIGH] supportTicket.update in apps/api/src/modules/super-admin/super-admin.service.ts
- **File**: [super-admin.service.ts](apps/api/src/modules/super-admin/super-admin.service.ts#L234) (Line 234)
- **Query Code**: `this.prisma.supportTicket.update({ where: { id: ticketId }, data: { status: 'RESOLVED', updatedAt: n...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 114. [HIGH] supportSlaPolicy.create in apps/api/src/modules/support-desk/support-desk.service.ts
- **File**: [support-desk.service.ts](apps/api/src/modules/support-desk/support-desk.service.ts#L13) (Line 13)
- **Query Code**: `this.prisma.supportSlaPolicy.create({ data: { organizationId: dto.organizationId, name: dto.name, pr...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 115. [HIGH] supportSlaPolicy.findMany in apps/api/src/modules/support-desk/support-desk.service.ts
- **File**: [support-desk.service.ts](apps/api/src/modules/support-desk/support-desk.service.ts#L26) (Line 26)
- **Query Code**: `this.prisma.supportSlaPolicy.findMany({ where: { organizationId }, orderBy: [{ priority: 'asc' }, { ...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 116. [HIGH] supportTicket.updateMany in apps/api/src/modules/support-desk/support-desk.service.ts
- **File**: [support-desk.service.ts](apps/api/src/modules/support-desk/support-desk.service.ts#L34) (Line 34)
- **Query Code**: `this.prisma.supportTicket.updateMany({ where: { organizationId, status: { in: ['OPEN', 'IN_PROGRESS'...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 117. [HIGH] supportTicket.findMany in apps/api/src/modules/support-desk/support-desk.service.ts
- **File**: [support-desk.service.ts](apps/api/src/modules/support-desk/support-desk.service.ts#L50) (Line 50)
- **Query Code**: `this.prisma.supportTicket.findMany({ where: { organizationId }, include: { tenant: { select: { name:...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 118. [HIGH] knowledgeBaseArticle.create in apps/api/src/modules/support-desk/support-desk.service.ts
- **File**: [support-desk.service.ts](apps/api/src/modules/support-desk/support-desk.service.ts#L64) (Line 64)
- **Query Code**: `this.prisma.knowledgeBaseArticle.create({ data: { organizationId: dto.organizationId || null, title:...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 119. [HIGH] knowledgeBaseArticle.findMany in apps/api/src/modules/support-desk/support-desk.service.ts
- **File**: [support-desk.service.ts](apps/api/src/modules/support-desk/support-desk.service.ts#L77) (Line 77)
- **Query Code**: `this.prisma.knowledgeBaseArticle.findMany({ where: { ...(organizationId ? { organizationId } : {}), ...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 120. [HIGH] ticketMessage.create in apps/api/src/modules/support-desk/tickets.service.ts
- **File**: [tickets.service.ts](apps/api/src/modules/support-desk/tickets.service.ts#L21) (Line 21)
- **Query Code**: `this.prisma.ticketMessage.create({ data: { ticketId: ticket.id, senderId: userId, content: dto.messa...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 121. [HIGH] supportTicket.count in apps/api/src/modules/support-desk/tickets.service.ts
- **File**: [tickets.service.ts](apps/api/src/modules/support-desk/tickets.service.ts#L60) (Line 60)
- **Query Code**: `this.prisma.supportTicket.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 122. [HIGH] ticketMessage.create in apps/api/src/modules/support-desk/tickets.service.ts
- **File**: [tickets.service.ts](apps/api/src/modules/support-desk/tickets.service.ts#L148) (Line 148)
- **Query Code**: `this.prisma.ticketMessage.create({ data: { ticketId: id, senderId: userId, content: dto.message, att...`
- **Remediation**: Ensure the created record references the current tenant: `data: { tenantId, ... }`.


### 123. [HIGH] test.count in apps/api/src/modules/tests/tests.service.ts
- **File**: [tests.service.ts](apps/api/src/modules/tests/tests.service.ts#L50) (Line 50)
- **Query Code**: `this.prisma.test.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 124. [HIGH] subject.findMany in apps/api/src/modules/tests/tests.service.ts
- **File**: [tests.service.ts](apps/api/src/modules/tests/tests.service.ts#L120) (Line 120)
- **Query Code**: `this.prisma.subject.findMany({ where: { id: { in: test.subjectIds } }, select: { id: true, name: tru...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 125. [MEDIUM] testRanking.createMany in apps/api/src/modules/tests/tests.service.ts
- **File**: [tests.service.ts](apps/api/src/modules/tests/tests.service.ts#L396) (Line 396)
- **Query Code**: `this.prisma.testRanking.createMany({ data: rankings })`
- **Remediation**: Verify if the target ID is pre-scraped/validated or add `tenantId` to the `where` filter.


### 126. [HIGH] videoLecture.findMany in apps/api/src/modules/videos/videos.service.ts
- **File**: [videos.service.ts](apps/api/src/modules/videos/videos.service.ts#L70) (Line 70)
- **Query Code**: `this.prisma.videoLecture.findMany({ where, include: { batch: { select: { name: true } }, subject: { ...`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


### 127. [HIGH] videoLecture.count in apps/api/src/modules/videos/videos.service.ts
- **File**: [videos.service.ts](apps/api/src/modules/videos/videos.service.ts#L80) (Line 80)
- **Query Code**: `this.prisma.videoLecture.count({ where })`
- **Remediation**: Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add `tenantId` parameter and scoping.


---
*End of Report*
