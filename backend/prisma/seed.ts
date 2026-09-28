import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INDIAN_FIRST_NAMES = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Sneha', 'Vikram', 'Neha',
  'Rahul', 'Pooja', 'Karan', 'Kavya', 'Siddharth', 'Riya', 'Amit', 'Divya',
  'Rajesh', 'Sunita', 'Suresh', 'Meena', 'Deepak', 'Anita', 'Manish', 'Shweta',
  'Sanjay', 'Geeta', 'Alok', 'Priti', 'Varun', 'Nisha', 'Gaurav', 'Isha',
];

const INDIAN_LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Nair',
  'Rao', 'Joshi', 'Chawla', 'Mehta', 'Shah', 'Aggarwal', 'Deshmukh', 'Kulkarni',
  'Bhat', 'Pillai', 'Sengupta', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Iyer', 'Menon',
];

const INDIAN_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', postalCode: '400001' },
  { city: 'Bengaluru', state: 'Karnataka', postalCode: '560001' },
  { city: 'Delhi', state: 'Delhi', postalCode: '110001' },
  { city: 'Hyderabad', state: 'Telangana', postalCode: '500001' },
  { city: 'Chennai', state: 'Tamil Nadu', postalCode: '600001' },
  { city: 'Kolkata', state: 'West Bengal', postalCode: '700001' },
  { city: 'Pune', state: 'Maharashtra', postalCode: '411001' },
  { city: 'Ahmedabad', state: 'Gujarat', postalCode: '380001' },
];

async function main() {
  console.log('🌱 Starting InsureFlow database seed...');

  // 1. Clean existing records in safe order
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.exceptionTimelineEvent.deleteMany();
  await prisma.exceptionNote.deleteMany();
  await prisma.reconciliationRecord.deleteMany();
  await prisma.paymentException.deleteMany();
  await prisma.reconciliationRun.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.billingAccount.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.policyholder.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Create Users
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedFinancePassword = await bcrypt.hash('finance123', 10);
  const hashedOpsPassword = await bcrypt.hash('ops123', 10);
  const hashedViewerPassword = await bcrypt.hash('viewer123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@insurance.com',
      passwordHash: hashedAdminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const financeLead = await prisma.user.create({
    data: {
      name: 'Priya Patel (Finance Lead)',
      email: 'finance@insurance.com',
      passwordHash: hashedFinancePassword,
      role: 'FINANCE_ANALYST',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const financeAnalyst2 = await prisma.user.create({
    data: {
      name: 'Rohan Verma (Analyst)',
      email: 'rohan.finance@insurance.com',
      passwordHash: hashedFinancePassword,
      role: 'FINANCE_ANALYST',
    },
  });

  const opsUser = await prisma.user.create({
    data: {
      name: 'Vikram Singh (Operations)',
      email: 'ops@insurance.com',
      passwordHash: hashedOpsPassword,
      role: 'OPERATIONS_USER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const opsUser2 = await prisma.user.create({
    data: {
      name: 'Sneha Rao (Operations)',
      email: 'sneha.ops@insurance.com',
      passwordHash: hashedOpsPassword,
      role: 'OPERATIONS_USER',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Neha Nair (Audit Viewer)',
      email: 'viewer@insurance.com',
      passwordHash: hashedViewerPassword,
      role: 'VIEWER',
    },
  });

  console.log('👥 Created 6 system users with roles & hashed credentials.');

  // 3. Create 50 Policyholders
  const policyholders = [];
  for (let i = 1; i <= 50; i++) {
    const firstName = INDIAN_FIRST_NAMES[i % INDIAN_FIRST_NAMES.length];
    const lastName = INDIAN_LAST_NAMES[i % INDIAN_LAST_NAMES.length];
    const cityInfo = INDIAN_CITIES[i % INDIAN_CITIES.length];

    const ph = await prisma.policyholder.create({
      data: {
        customerNumber: `CUST-${String(i).padStart(5, '0')}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
        phone: `+91 98765 ${String(10000 + i).slice(1)}`,
        address: `${100 + i}, Nariman Point, MG Road`,
        city: cityInfo.city,
        state: cityInfo.state,
        postalCode: cityInfo.postalCode,
      },
    });
    policyholders.push(ph);
  }

  console.log(`👨‍👩‍👧 Created ${policyholders.length} policyholders.`);

  // 4. Create Policies & Billing Accounts
  const policyTypes = ['AUTO', 'HOME', 'HEALTH', 'LIFE', 'COMMERCIAL'] as const;
  const frequencies = ['MONTHLY', 'QUARTERLY', 'ANNUAL'] as const;

  const policies = [];
  const billingAccounts = [];

  for (let i = 1; i <= 100; i++) {
    const ph = policyholders[i % policyholders.length];
    const pType = policyTypes[i % policyTypes.length];
    const freq = frequencies[i % frequencies.length];
    const premium = 10000 + (i * 3500) % 150000;

    const policy = await prisma.policy.create({
      data: {
        policyNumber: `POL-${pType.slice(0, 3)}-${String(1000 + i)}`,
        policyholderId: ph.id,
        policyType: pType,
        premiumAmount: premium,
        billingFrequency: freq,
        effectiveDate: new Date(2025, 0, 1),
        expirationDate: new Date(2026, 0, 1),
        status: i % 12 === 0 ? 'EXPIRED' : i % 25 === 0 ? 'CANCELLED' : 'ACTIVE',
      },
    });
    policies.push(policy);

    const account = await prisma.billingAccount.create({
      data: {
        accountNumber: `ACC-${String(10000 + i)}`,
        policyholderId: ph.id,
        policyId: policy.id,
        balance: 0,
        status: 'ACTIVE',
      },
    });
    billingAccounts.push(account);
  }

  console.log(`📜 Created ${policies.length} policies and billing accounts.`);

  // 5. Create Invoices & Payments (with anomalies for reconciliation)
  const invoices = [];
  const payments = [];
  const paymentMethods = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'AUTO_DEBIT', 'CHEQUE'] as const;

  let invoiceCounter = 1;
  let paymentCounter = 1;

  for (let month = 1; month <= 6; month++) {
    for (let pIdx = 0; pIdx < policies.length; pIdx++) {
      const policy = policies[pIdx];
      const account = billingAccounts[pIdx];

      const dueDate = new Date(2025, month - 1, 10);
      const premium = Number(policy.premiumAmount);
      const tax = Math.round(premium * 0.18);
      const total = premium + tax;

      // Intentional anomaly distribution
      let invStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERPAID' | 'CANCELLED' = 'UNPAID';
      let payStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REFUNDED' = 'SUCCESS';
      let payAmount = total;

      if ((pIdx + month) % 7 === 0) {
        // Underpayment anomaly
        payAmount = total - 5000;
        invStatus = 'PARTIALLY_PAID';
      } else if ((pIdx + month) % 11 === 0) {
        // Overpayment anomaly
        payAmount = total + 3000;
        invStatus = 'OVERPAID';
      } else if ((pIdx + month) % 9 === 0) {
        // Missing payment
        payAmount = 0;
        invStatus = 'UNPAID';
      } else if ((pIdx + month) % 13 === 0) {
        // Payment failed
        payStatus = 'FAILED';
        invStatus = 'UNPAID';
      } else {
        invStatus = 'PAID';
      }

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-2025-${String(invoiceCounter++).padStart(5, '0')}`,
          billingAccountId: account.id,
          policyId: policy.id,
          dueDate,
          premiumAmount: premium,
          taxAmount: tax,
          totalAmount: total,
          status: invStatus,
          createdAt: new Date(2025, month - 1, 1),
        },
      });
      invoices.push(invoice);

      if (payAmount > 0 || payStatus === 'FAILED') {
        const payDate = new Date(dueDate);
        if ((pIdx + month) % 5 === 0) {
          // Late payment anomaly
          payDate.setDate(dueDate.getDate() + 15);
        }

        const method = paymentMethods[(pIdx + month) % paymentMethods.length];
        const payment = await prisma.payment.create({
          data: {
            transactionId: `TXN-${Date.now()}-${paymentCounter++}`,
            invoiceId: invoice.id,
            policyId: policy.id,
            amount: payAmount > 0 ? payAmount : total,
            paymentDate: payDate,
            paymentMethod: method,
            status: payStatus,
            referenceNumber: `REF-${String(90000 + paymentCounter)}`,
            gatewayResponse: payStatus === 'SUCCESS' ? 'SUCCESS_200' : 'GATEWAY_TIMEOUT_504',
          },
        });
        payments.push(payment);

        // Create duplicate payment anomaly for every 17th item
        if ((pIdx + month) % 17 === 0 && payStatus === 'SUCCESS') {
          const dupPayment = await prisma.payment.create({
            data: {
              transactionId: `TXN-${Date.now()}-${paymentCounter++}`,
              invoiceId: invoice.id,
              policyId: policy.id,
              amount: payAmount,
              paymentDate: payDate,
              paymentMethod: method,
              status: 'SUCCESS',
              referenceNumber: payment.referenceNumber, // Duplicate reference
              gatewayResponse: 'SUCCESS_200_DUPLICATE_RETRY',
            },
          });
          payments.push(dupPayment);
        }
      }
    }
  }

  console.log(`🧾 Created ${invoices.length} invoices and ${payments.length} payment transactions.`);

  // 6. Create Historical Reconciliation Run & Exceptions
  const runCount = 3;
  for (let r = 1; r <= runCount; r++) {
    const run = await prisma.reconciliationRun.create({
      data: {
        runNumber: `RUN-2025-${String(r).padStart(5, '0')}`,
        startedAt: new Date(2025, r * 2 - 1, 15, 10, 0, 0),
        completedAt: new Date(2025, r * 2 - 1, 15, 10, 5, 0),
        recordsProcessed: invoices.length,
        matchedRecords: Math.floor(invoices.length * 0.8),
        exceptionRecords: Math.floor(invoices.length * 0.2),
        totalExpectedAmount: 15500000,
        totalReceivedAmount: 14200000,
        totalDifference: 1300000,
        status: 'COMPLETED',
      },
    });

    // Generate Payment Exceptions from unpaid/partially paid/overpaid invoices
    const targetInvoices = invoices.filter((i) => i.status !== 'PAID').slice(0, 35);
    const assignees = [financeLead.id, financeAnalyst2.id, opsUser.id, opsUser2.id];

    for (let eIdx = 0; eIdx < targetInvoices.length; eIdx++) {
      const inv = targetInvoices[eIdx];
      const invPayments = payments.filter((p) => p.invoiceId === inv.id);
      const latestPay = invPayments[invPayments.length - 1];

      let excType: 'UNDERPAYMENT' | 'OVERPAYMENT' | 'MISSING_PAYMENT' | 'DUPLICATE_PAYMENT' | 'LATE_PAYMENT' | 'PAYMENT_FAILED' = 'UNDERPAYMENT';
      let expected = Number(inv.totalAmount);
      let actual = latestPay ? Number(latestPay.amount) : 0;

      if (inv.status === 'PARTIALLY_PAID') excType = 'UNDERPAYMENT';
      else if ((inv.status as any) === 'OVERPAID') excType = 'OVERPAYMENT';
      else if (latestPay?.status === 'FAILED') excType = 'PAYMENT_FAILED';
      else excType = 'MISSING_PAYMENT';

      const diff = Math.abs(expected - actual);
      let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (diff >= 50000) severity = 'CRITICAL';
      else if (diff >= 10000) severity = 'HIGH';
      else if (diff >= 3000) severity = 'MEDIUM';

      const exception = await prisma.paymentException.create({
        data: {
          exceptionNumber: `EXC-2025-${String(r * 100 + eIdx + 1).padStart(5, '0')}`,
          invoiceId: inv.id,
          paymentId: latestPay?.id || null,
          policyId: inv.policyId,
          type: excType,
          expectedAmount: expected,
          actualAmount: actual,
          difference: diff,
          severity,
          status: eIdx % 4 === 0 ? 'RESOLVED' : eIdx % 3 === 0 ? 'INVESTIGATING' : 'OPEN',
          assignedToId: assignees[eIdx % assignees.length],
          description: `Discrepancy detected during reconciliation run ${run.runNumber}. Expected ₹${expected}, Actual ₹${actual}.`,
          resolvedAt: eIdx % 4 === 0 ? new Date() : null,
          createdAt: new Date(2025, r * 2 - 1, 15),
        },
      });

      // Add timeline event & note for the exception
      await prisma.exceptionTimelineEvent.create({
        data: {
          exceptionId: exception.id,
          userId: adminUser.id,
          eventType: 'CREATED',
          description: `Exception auto-generated by reconciliation run ${run.runNumber}.`,
          createdAt: exception.createdAt,
        },
      });

      if (exception.assignedToId) {
        await prisma.exceptionTimelineEvent.create({
          data: {
            exceptionId: exception.id,
            userId: adminUser.id,
            eventType: 'ASSIGNED',
            description: `Assigned case for investigation.`,
            createdAt: new Date(exception.createdAt.getTime() + 3600000),
          },
        });
      }

      await prisma.exceptionNote.create({
        data: {
          exceptionId: exception.id,
          userId: financeLead.id,
          content: `Initial review completed. Bank statement discrepancy confirmed. Re-verifying gateway reference numbers.`,
          createdAt: new Date(exception.createdAt.getTime() + 7200000),
        },
      });
    }
  }

  console.log('🚨 Created historical reconciliation runs & exception cases with timelines & notes.');
  console.log('🎉 InsureFlow Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
