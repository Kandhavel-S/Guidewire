/**
 * Mock Guidewire BillingCenter Service
 * Abstracts database access as if it were BillingCenter API calls.
 * In production, these would be real Guidewire REST API calls.
 */
export declare const billingCenterService: {
    getPolicies(params: {
        page: number;
        limit: number;
        search?: string;
        type?: string;
        status?: string;
    }): Promise<{
        policies: ({
            policyholder: {
                name: string;
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                customerNumber: string;
                phone: string;
                address: string;
                city: string;
                state: string;
                postalCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PolicyStatus;
            policyNumber: string;
            policyholderId: string;
            policyType: import(".prisma/client").$Enums.PolicyType;
            premiumAmount: import("@prisma/client/runtime/library").Decimal;
            billingFrequency: import(".prisma/client").$Enums.BillingFrequency;
            effectiveDate: Date;
            expirationDate: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPolicyById(id: string): Promise<({
        policyholder: {
            name: string;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            customerNumber: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            postalCode: string;
        };
        billingAccounts: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            policyId: string;
            status: string;
            policyholderId: string;
            accountNumber: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PolicyStatus;
        policyNumber: string;
        policyholderId: string;
        policyType: import(".prisma/client").$Enums.PolicyType;
        premiumAmount: import("@prisma/client/runtime/library").Decimal;
        billingFrequency: import(".prisma/client").$Enums.BillingFrequency;
        effectiveDate: Date;
        expirationDate: Date;
    }) | null>;
    getInvoices(params: {
        page: number;
        limit: number;
        policyId?: string;
        status?: string;
    }): Promise<{
        invoices: ({
            policy: {
                policyholder: {
                    name: string;
                    id: string;
                    email: string;
                    createdAt: Date;
                    updatedAt: Date;
                    customerNumber: string;
                    phone: string;
                    address: string;
                    city: string;
                    state: string;
                    postalCode: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PolicyStatus;
                policyNumber: string;
                policyholderId: string;
                policyType: import(".prisma/client").$Enums.PolicyType;
                premiumAmount: import("@prisma/client/runtime/library").Decimal;
                billingFrequency: import(".prisma/client").$Enums.BillingFrequency;
                effectiveDate: Date;
                expirationDate: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            policyId: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            premiumAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            billingAccountId: string;
            dueDate: Date;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getInvoiceById(id: string): Promise<({
        policy: {
            policyholder: {
                name: string;
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                customerNumber: string;
                phone: string;
                address: string;
                city: string;
                state: string;
                postalCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PolicyStatus;
            policyNumber: string;
            policyholderId: string;
            policyType: import(".prisma/client").$Enums.PolicyType;
            premiumAmount: import("@prisma/client/runtime/library").Decimal;
            billingFrequency: import(".prisma/client").$Enums.BillingFrequency;
            effectiveDate: Date;
            expirationDate: Date;
        };
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            invoiceId: string;
            policyId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            transactionId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            referenceNumber: string | null;
            gatewayResponse: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        policyId: string;
        status: import(".prisma/client").$Enums.InvoiceStatus;
        premiumAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceNumber: string;
        billingAccountId: string;
        dueDate: Date;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    }) | null>;
    getPayments(params: {
        page: number;
        limit: number;
        invoiceId?: string;
        status?: string;
    }): Promise<{
        payments: ({
            invoice: {
                invoiceNumber: string;
            };
            policy: {
                policyholder: {
                    name: string;
                    id: string;
                    email: string;
                    createdAt: Date;
                    updatedAt: Date;
                    customerNumber: string;
                    phone: string;
                    address: string;
                    city: string;
                    state: string;
                    postalCode: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PolicyStatus;
                policyNumber: string;
                policyholderId: string;
                policyType: import(".prisma/client").$Enums.PolicyType;
                premiumAmount: import("@prisma/client/runtime/library").Decimal;
                billingFrequency: import(".prisma/client").$Enums.BillingFrequency;
                effectiveDate: Date;
                expirationDate: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            invoiceId: string;
            policyId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            transactionId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paymentDate: Date;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            referenceNumber: string | null;
            gatewayResponse: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPaymentById(id: string): Promise<({
        invoice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            policyId: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            premiumAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            billingAccountId: string;
            dueDate: Date;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
        };
        policy: {
            policyholder: {
                name: string;
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
                customerNumber: string;
                phone: string;
                address: string;
                city: string;
                state: string;
                postalCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PolicyStatus;
            policyNumber: string;
            policyholderId: string;
            policyType: import(".prisma/client").$Enums.PolicyType;
            premiumAmount: import("@prisma/client/runtime/library").Decimal;
            billingFrequency: import(".prisma/client").$Enums.BillingFrequency;
            effectiveDate: Date;
            expirationDate: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceId: string;
        policyId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        transactionId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentDate: Date;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        referenceNumber: string | null;
        gatewayResponse: string | null;
    }) | null>;
    getAccounts(params: {
        page: number;
        limit: number;
        policyId?: string;
    }): Promise<{
        accounts: ({
            policy: {
                policyNumber: string;
                policyType: import(".prisma/client").$Enums.PolicyType;
            };
            policyholder: {
                name: string;
                customerNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            policyId: string;
            status: string;
            policyholderId: string;
            accountNumber: string;
            balance: import("@prisma/client/runtime/library").Decimal;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAccountById(id: string): Promise<({
        policy: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PolicyStatus;
            policyNumber: string;
            policyholderId: string;
            policyType: import(".prisma/client").$Enums.PolicyType;
            premiumAmount: import("@prisma/client/runtime/library").Decimal;
            billingFrequency: import(".prisma/client").$Enums.BillingFrequency;
            effectiveDate: Date;
            expirationDate: Date;
        };
        policyholder: {
            name: string;
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
            customerNumber: string;
            phone: string;
            address: string;
            city: string;
            state: string;
            postalCode: string;
        };
        invoices: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            policyId: string;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            premiumAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            billingAccountId: string;
            dueDate: Date;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        policyId: string;
        status: string;
        policyholderId: string;
        accountNumber: string;
        balance: import("@prisma/client/runtime/library").Decimal;
    }) | null>;
};
//# sourceMappingURL=billingCenter.service.d.ts.map