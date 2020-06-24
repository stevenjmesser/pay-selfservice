'use strict'

const commonStubs = require('../../utils/common_stubs')

describe('The Stripe psp details banner', () => {
  const gatewayAccountId = 22
  const userExternalId = 'cd0fa54cf3b7408a80ae2f1b93e7c16e'
  beforeEach(() => {
    cy.setEncryptedCookies(userExternalId, gatewayAccountId)
    cy.task('setupStubs', [
      commonStubs.getUserStub(userExternalId, [gatewayAccountId]),
      commonStubs.getGatewayAccountStub(gatewayAccountId, 'live', 'stripe'),
      commonStubs.getDashboardStatisticsStub(),
      commonStubs.getGatewayAccountStripeSetupSuccess(gatewayAccountId, false, false, false),
      commonStubs.getStripeAccount(gatewayAccountId, 'stripe-account-id')
    ])
  })

  it('should display the banner', () => {
    cy.visit('/')

    cy.get('h2').contains('You must add more details')
    cy.get('#add-account-details').should('exist')
  })

  it('should redirect to bank account details page when "Add details" button clicked', () => {
    cy.get('#add-account-details').click()
    cy.get('h1').contains('What are your bank details?')
  })
})