'use strict'

const nock = require('nock')

const gatewayAccountFixtures = require('../fixtures/gateway-account.fixtures')
const inviteFixtures = require('../fixtures/invite.fixtures')
const serviceRegistrationService = require('../../app/services/service-registration.service')

// Constants
const CONNECTOR_ACCOUNTS_URL = '/v1/api/accounts'
const ADMINUSERS_INVITES_URL = '/v1/api/invites'
const connectorMock = nock(process.env.CONNECTOR_URL)
const adminusersMock = nock(process.env.ADMINUSERS_URL)

// Global setup

describe('create populated service', () => {
  afterEach((done) => {
    nock.cleanAll()
    done()
  })

  it(
    'should create a sandbox gateway account and complete invite successfully',
    () => {
      const inviteCode = 'a-valid-invite-code'
      const userExternalId = 'f84b8210f93d455e97baeaf3fea72cf4'
      const serviceExternalId = '43a6818b522b4a628a14355614665ca3'
      const gatewayAccountId = '1'

      const mockConnectorCreateGatewayAccountResponse =
        gatewayAccountFixtures.validGatewayAccountResponse({
          gateway_account_id: gatewayAccountId
        }).getPlain()
      const mockAdminUsersInviteCompleteRequest =
        inviteFixtures.validInviteCompleteRequest({
          gateway_account_ids: [gatewayAccountId]
        }).getPlain()
      const mockAdminUsersInviteCompleteResponse =
        inviteFixtures.validInviteCompleteResponse({
          invite: {
            code: inviteCode,
            type: 'service',
            disabled: true
          },
          user_external_id: userExternalId,
          service_external_id: serviceExternalId
        }).getPlain()

      const createGatewayAccountMock = connectorMock.post(CONNECTOR_ACCOUNTS_URL)
        .reply(201, mockConnectorCreateGatewayAccountResponse)
      const completeServiceInviteMock = adminusersMock.post(`${ADMINUSERS_INVITES_URL}/${inviteCode}/complete`, mockAdminUsersInviteCompleteRequest)
        .reply(200, mockAdminUsersInviteCompleteResponse)

      return serviceRegistrationService.createPopulatedService(inviteCode).then(completeServiceInviteResponse => {
        expect(createGatewayAccountMock.isDone()).toBe(true) // eslint-disable-line no-unused-expressions
        expect(completeServiceInviteMock.isDone()).toBe(true) // eslint-disable-line no-unused-expressions
        expect(completeServiceInviteResponse.invite.code).toBe(mockAdminUsersInviteCompleteResponse.invite.code)
        expect(completeServiceInviteResponse.invite.type).toBe(mockAdminUsersInviteCompleteResponse.invite.type)
        expect(completeServiceInviteResponse.invite.disabled).toBe(mockAdminUsersInviteCompleteResponse.invite.disabled)
        expect(completeServiceInviteResponse.user_external_id).toBe(mockAdminUsersInviteCompleteResponse.user_external_id)
        expect(completeServiceInviteResponse.service_external_id).toBe(mockAdminUsersInviteCompleteResponse.service_external_id)
      });
    }
  )

  it('should error if creation of a gateway account failed', () => {
    const inviteCode = 'a-valid-invite-code'

    const mockConnectorCreateGatewayAccountResponse = connectorMock.post(CONNECTOR_ACCOUNTS_URL)
      .reply(500)

    return serviceRegistrationService.createPopulatedService(inviteCode)
      .then(
        () => { throw new Error('Expected to reject') },
        (err) => {
          expect(mockConnectorCreateGatewayAccountResponse.isDone()).toBe(true) // eslint-disable-line no-unused-expressions
          expect(err.errorCode).toBe(500)
        }
      );
  })

  it(
    'should error if creation of a gateway account succeeded, but complete invite failed',
    done => {
      const inviteCode = 'a-valid-invite-code'
      const gatewayAccountId = '1'

      const mockConnectorCreateGatewayAccountResponse =
        gatewayAccountFixtures.validGatewayAccountResponse({
          gateway_account_id: gatewayAccountId
        }).getPlain()
      const mockAdminUsersInviteCompleteRequest =
        inviteFixtures.validInviteCompleteRequest({
          gateway_account_ids: [gatewayAccountId]
        }).getPlain()

      const createGatewayAccountMock = connectorMock.post(CONNECTOR_ACCOUNTS_URL)
        .reply(201, mockConnectorCreateGatewayAccountResponse)
      const completeServiceInviteMock = adminusersMock.post(`${ADMINUSERS_INVITES_URL}/${inviteCode}/complete`, mockAdminUsersInviteCompleteRequest)
        .reply(500)

      serviceRegistrationService.createPopulatedService(inviteCode).then(() => {
        done('should not be called')
      }).catch(error => {
        expect(createGatewayAccountMock.isDone()).toBe(true) // eslint-disable-line no-unused-expressions
        expect(completeServiceInviteMock.isDone()).toBe(true) // eslint-disable-line no-unused-expressions
        expect(error.errorCode).toBe(500)
        done()
      })
    }
  )

  it(
    'should error if creation of a gateway account succeeded and complete invite succeeded, but user already exists',
    () => {
      const inviteCode = 'a-valid-invite-code'
      const gatewayAccountId = '1'

      const mockConnectorCreateGatewayAccountResponse =
        gatewayAccountFixtures.validGatewayAccountResponse({
          gateway_account_id: gatewayAccountId
        }).getPlain()
      const mockAdminUsersInviteCompleteRequest =
        inviteFixtures.validInviteCompleteRequest({
          gateway_account_ids: [gatewayAccountId]
        }).getPlain()

      const createGatewayAccountMock = connectorMock.post(CONNECTOR_ACCOUNTS_URL)
        .reply(201, mockConnectorCreateGatewayAccountResponse)
      const completeServiceInviteMock = adminusersMock.post(`${ADMINUSERS_INVITES_URL}/${inviteCode}/complete`, mockAdminUsersInviteCompleteRequest)
        .reply(409)

      return serviceRegistrationService.createPopulatedService(inviteCode)
        .then(
          () => { throw new Error('Expected to reject') },
          (err) => {
            expect(createGatewayAccountMock.isDone()).toBe(true) // eslint-disable-line no-unused-expressions
            expect(completeServiceInviteMock.isDone()).toBe(true) // eslint-disable-line no-unused-expressions
            expect(err.errorCode).toBe(409)
          }
        );
    }
  )
})