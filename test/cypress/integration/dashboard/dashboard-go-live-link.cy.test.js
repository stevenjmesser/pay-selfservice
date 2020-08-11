'use strict'

const utils = require('../../utils/request-to-go-live-utils')
const commonStubs = require('../../utils/common-stubs')
const userStubs = require('../../utils/user-stubs')
const { userExternalId, gatewayAccountId, serviceExternalId } = utils.variables

describe('Go live link on dashboard', () => {
  beforeEach(() => {
    cy.setEncryptedCookies(userExternalId, gatewayAccountId)
  })

  describe('Card gateway account', () => {
    describe('Go live link shown', () => {
      beforeEach(() => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('NOT_STARTED'))
        cy.visit('/')
      })

      it.skip('should show request to go live link when go-live stage is NOT_STARTED', () => {
        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Request a live account')
        cy.get('#request-to-go-live-link a').should('have.attr', 'href', `/service/${serviceExternalId}/request-to-go-live`)
      })
    })

    describe('Continue link shown', () => {
      it.skip('should show continue link when go-live stage is ENTERED_ORGANISATION_NAME', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('ENTERED_ORGANISATION_NAME'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Setting up your live account')
        cy.get('#request-to-go-live-link a').should('have.attr', 'href', `/service/${serviceExternalId}/request-to-go-live`)
      })

      it.skip('should show continue link when go-live stage is CHOSEN_PSP_STRIPE', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('CHOSEN_PSP_STRIPE'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Setting up your live account')
        cy.get('#request-to-go-live-link a').should('have.attr', 'href', `/service/${serviceExternalId}/request-to-go-live`)
      })

      it.skip('should show continue link when go-live stage is CHOSEN_PSP_WORLDPAY', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('CHOSEN_PSP_WORLDPAY'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Setting up your live account')
        cy.get('#request-to-go-live-link a').should('have.attr', 'href', `/service/${serviceExternalId}/request-to-go-live`)
      })

      it.skip('should show continue link when go-live stage is CHOSEN_PSP_SMARTPAY', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('CHOSEN_PSP_SMARTPAY'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Setting up your live account')
        cy.get('#request-to-go-live-link a').should('have.attr', 'href', `/service/${serviceExternalId}/request-to-go-live`)
      })

      it.skip('should show continue link when go-live stage is CHOSEN_PSP_EPDQ', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('CHOSEN_PSP_EPDQ'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Setting up your live account')
        cy.get('#request-to-go-live-link a').should('have.attr', 'href', `/service/${serviceExternalId}/request-to-go-live`)
      })
    })

    describe('Waiting to go live text shown', () => {
      it.skip('should show waiting to go live text when go-live stage is TERMS_AGREED_STRIPE', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('TERMS_AGREED_STRIPE'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Your live account')
      })

      it.skip('should show waiting to go live text when go-live stage is TERMS_AGREED_WORLDPAY', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('TERMS_AGREED_WORLDPAY'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Your live account')
      })

      it.skip('should show waiting to go live text when go-live stage is TERMS_AGREED_SMARTPAY', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('TERMS_AGREED_SMARTPAY'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Your live account')
      })

      it.skip('should show waiting to go live text when go-live stage is TERMS_AGREED_EPDQ', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('TERMS_AGREED_EPDQ'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('exist')
        cy.get('#request-to-go-live-link h2').should('contain', 'Your live account')
      })
    })

    describe('Go live link not shown', () => {
      it.skip('should not show request to go live link when go-live stage is LIVE', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('LIVE'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('not.exist')
      })

      it.skip('should not show request to go live link when go-live stage is DENIED', () => {
        utils.setupGetUserAndGatewayAccountStubs(utils.buildServiceRoleForGoLiveStage('DENIED'))
        cy.visit('/')

        cy.get('#request-to-go-live-link').should('not.exist')
      })

      it.skip('should not show request to go live link when user is not an admin', () => {
        const serviceRole = utils.buildServiceRoleForGoLiveStage('NOT_STARTED')
        serviceRole.role = {
          permissions: []
        }
        utils.setupGetUserAndGatewayAccountStubs(serviceRole)

        cy.get('#request-to-go-live-link').should('not.exist')
      })
    })
  })

  describe('Direct debit gateway account', () => {
    it.skip('should display next steps to go live link', () => {
      const directDebitGatewayAccountId = 'DIRECT_DEBIT:101'

      cy.task('setupStubs', [
        userStubs.getUserSuccess({
          userExternalId,
          gatewayAccountId: directDebitGatewayAccountId,
          serviceExternalId,
          goLiveStage: 'NOT_STARTED'
        }),
        commonStubs.getDirectDebitGatewayAccountStub(directDebitGatewayAccountId, 'test', 'sandbox')
      ])
      cy.visit('/')

      cy.get('#request-to-go-live-link').should('exist')
      cy.get('#request-to-go-live-link h2').should('contain', 'Next steps to go live')
      cy.get('#request-to-go-live-link a').should('have.attr', 'href', 'https://docs.payments.service.gov.uk/switching_to_live/#switching-to-live')
    })
  })
})