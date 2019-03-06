'use strict'

// NPM dependencies
const lodash = require('lodash')

// Local dependencies
const { response, renderErrorView } = require('../../../utils/response')
const bankDetailsValidations = require('./bank-details-validations')
const { updateBankAccount } = require('../../../services/clients/stripe/stripe_client')
const { ConnectorClient } = require('../../../services/clients/connector_client')
const connector = new ConnectorClient(process.env.CONNECTOR_URL)
const paths = require('../../../paths')
const fieldValidationChecks = require('../../../browsered/field-validation-checks')

// Constants
const ACCOUNT_NUMBER_FIELD = 'account-number'
const SORT_CODE_FIELD = 'sort-code'
const ANSWERS_NEED_CHANGING_FIELD = 'answers-need-changing'
const ANSWERS_CHECKED_FIELD = 'answers-checked'

module.exports = (req, res) => {
  const accountNumber = req.body[ACCOUNT_NUMBER_FIELD]
  const sortCode = req.body[SORT_CODE_FIELD]

  let errors = validateBankDetails(accountNumber, sortCode)
  const pageData = {
    accountNumber,
    sortCode,
    errors
  }

  if (!lodash.isEmpty(errors)) {
    return response(req, res, 'stripe-setup/bank-details/index', pageData)
  }
  if (req.body[ANSWERS_NEED_CHANGING_FIELD]) {
    return response(req, res, 'stripe-setup/bank-details/index', pageData)
  }
  if (req.body[ANSWERS_CHECKED_FIELD]) {
    return updateBankAccount(res.locals.stripeAccount.stripeAccountId, {
      bank_account_sort_code: sortCode,
      bank_account_number: accountNumber
    })
      .then(() => {
        return connector.setStripeAccountSetupFlag(req.account.gateway_account_id, 'bank_account', req.correlationId)
      })
      .then(() => {
        return res.redirect(303, paths.dashboard.index)
      })
      .catch(error => {
        // check if it is Stripe related error
        if (error.code) {
          if (error.code === 'routing_number_invalid') {
            // invalid sort code
            errors = {}
            errors[SORT_CODE_FIELD] = fieldValidationChecks.validationErrors.invalidSortCode
            pageData.errors = errors
            return response(req, res, 'stripe-setup/bank-details/index', pageData)
          }
          if (error.code === 'account_number_invalid') {
            // invalid account number
            errors = {}
            errors[ACCOUNT_NUMBER_FIELD] = fieldValidationChecks.validationErrors.invalidBankAccountNumber
            pageData.errors = errors
            return response(req, res, 'stripe-setup/bank-details/index', pageData)
          }
        }
        // the error is generic
        return renderErrorView(req, res, 'Please try again or contact support team')
      })
  }
  return response(req, res, 'stripe-setup/bank-details/check-your-answers', pageData)
}

function validateBankDetails (accountNumber, sortCode) {
  const errors = {}

  const accountNumberValidationResult = bankDetailsValidations.validateAccountNumber(accountNumber)
  if (!accountNumberValidationResult.valid) {
    errors[ACCOUNT_NUMBER_FIELD] = accountNumberValidationResult.message
  }

  const sortCodeValidationResult = bankDetailsValidations.validateSortCode(sortCode)
  if (!sortCodeValidationResult.valid) {
    errors[SORT_CODE_FIELD] = sortCodeValidationResult.message
  }

  return errors
}
