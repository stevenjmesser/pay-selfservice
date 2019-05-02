'use strict'

// NPM dependencies
const path = require('path')
const lodash = require('lodash')

// Global setup
const pactBase = require(path.join(__dirname, '/pact_base'))
const pactRegister = pactBase()

const buildChargeEventWithDefaults = (opts = {}) => {
  return {
    type: opts.type || 'PAYMENT',
    submitted_by: opts.submitted_by || null,
    state: buildChargeEventStateWithDefaults(opts.state),
    amount: opts.amount || 100,
    updated: opts.updated || '018-05-01T13:27:00.063Z',
    refund_reference: opts.refund_reference || null
  }
}

const buildChargeEventStateWithDefaults = (opts = {}) => {
  let state
  if (opts.status === 'failed') {
    state = {
      status: opts.status,
      finished: true,
      code: opts.code || 'P0010',
      message: opts.message || 'Payment method rejected'
    }
  } else {
    state = {
      status: opts.status || 'started',
      finished: opts.finished || false
    }
  }

  return state
}

const buildTransactionWithDefaults = (opts = {}) => {
  const data = {
    amount: opts.amount || 20000,
    state: {
      finished: opts.state_finished || false,
      code: opts.state_code || 'P0010',
      message: opts.state_message || 'Payment method rejected',
      status: opts.state_status || 'failed'
    },
    description: opts.description || 'ref1',
    reference: opts.reference || 'ref188888',
    links: [],
    charge_id: opts.charge_id || 'ht439nfg2l1e303k0dmifrn4fc',
    gateway_transaction_id: opts.gateway_transaction_id || '4cddd970-cce9-4bf1-b087-f13db1e199bd',
    return_url: opts.reference
      ? `https://demoservice.pymnt.localdomain:443/return/532aad2f833a3b8234921ca85a98ca5b/${opts.reference}`
      : 'https://demoservice.pymnt.localdomain:443/return/532aad2f833a3b8234921ca85a98ca5b/ref188888',
    email: opts.email || 'gds-payments-team-smoke@digital.cabinet-office.gov.uk',
    payment_provider: opts.payment_provider || 'sandbox',
    transaction_type: opts.transaction_type || 'charge',
    created_date: opts.created_date || '2018-05-01T13:27:00.057Z',
    refund_summary: {
      status: opts.refund_summary_status || 'unavailable',
      amount_available: opts.refund_summary_available || 20000,
      amount_submitted: opts.refund_summary_submitted || 0
    },
    settlement_summary: {
      capture_submit_time: opts.capture_submit_time || null,
      captured_date: opts.captured_date || null
    },
    card_details: {
      last_digits_card_number: opts.last_digits_card_number || '0002',
      cardholder_name: opts.cardholder_name || 'Test User',
      expiry_date: opts.expiry_date || '08/23',
      billing_address: {
        line1: opts.billing_address_line1 || 'address line 1',
        line2: opts.billing_address_line2 || 'address line 2',
        postcode: opts.billing_address_postcode || 'AB1A 1AB',
        city: opts.billing_address_city || 'GB',
        county: opts.billing_address_county || null,
        country: opts.billing_address_country || 'GB'
      },
      card_brand: opts.card_brand || 'Visa'
    },
    delayed_capture: opts.delayed_capture || false,
    wallet_type: opts.wallet_type || null,
    metadata: opts.metadata || null
  }

  if (opts.corporate_card_surcharge) {
    data.corporate_card_surcharge = opts.corporate_card_surcharge
    data.total_amount = opts.total_amount
  }
  if (opts.fee) data.fee = opts.fee
  if (opts.net_amount) data.net_amount = opts.net_amount

  return data
}

module.exports = {
  validTransactionSummaryResponse: () => {
    let data = {
      successful_payments: { count: 1, total_in_pence: 2 },
      refunded_payments: { count: 3, total_in_pence: 4 },
      net_income: { total_in_pence: 5 }
    }

    return {
      getPactified: () => {
        return pactRegister.pactify(data)
      },
      getPlain: () => {
        return data
      }
    }
  },
  validTransactionsResponse: (opts = {}) => {
    const results = lodash.flatMap(opts.transactions, buildTransactionWithDefaults)

    const data = {
      total: opts.transactions.length,
      count: opts.transactions.length,
      page: opts.page || 1,
      results: results,
      _links: opts.links || []
    }

    return {
      getPactified: () => {
        return pactRegister.pactify(data)
      },
      getPlain: () => {
        return data
      }
    }
  },
  validTransactionDetailsResponse: (opts = {}) => {
    const data = buildTransactionWithDefaults(opts)

    return {
      getPactified: () => {
        return pactRegister.pactify(data)
      },
      getPlain: () => {
        return data
      }
    }
  },
  validChargeEventsResponse: (opts = {}) => {
    const defaultEvents = [
      buildChargeEventWithDefaults({
        amount: opts.amount,
        updated: '2018-05-01T13:27:00.063Z'
      }),
      buildChargeEventWithDefaults({
        amount: opts.amount,
        updated: '2018-05-01T13:27:00.974Z'
      }),
      buildChargeEventWithDefaults({
        state: { status: 'failed' },
        amount: opts.amount,
        updated: '2018-05-01T13:27:18.126Z'
      })
    ]

    const events = opts.events ? lodash.flatMap(opts.events, buildChargeEventWithDefaults) : defaultEvents

    const data = {
      charge_id: opts.charge_id || 'ht439nfg2l1e303k0dmifrn4fc',
      events: events
    }

    return {
      getPactified: () => {
        return pactRegister.pactify(data)
      },
      getPlain: () => {
        return data
      }
    }
  },
  validTransactionRefundRequest: (opts = {}) => {
    const data = {
      amount: opts.amount || 101,
      refund_amount_available: opts.refund_amount_available || 100,
      user_external_id: opts.user_external_id || '3b7b5f33-24ea-4405-88d2-0a1b13efb20c'
    }

    return {
      getPactified: () => {
        return pactRegister.pactify(data)
      },
      getPlain: () => {
        return data
      }
    }
  },
  invalidTransactionRefundResponse: (opts = {}) => {
    let data = {
      reason: opts.reason || 'amount_not_available'
    }

    return {
      getPactified: () => {
        return pactRegister.pactify(data)
      },
      getPlain: () => {
        return data
      }
    }
  }
}
