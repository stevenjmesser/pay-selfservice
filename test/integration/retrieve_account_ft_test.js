
let nock = require('nock');
var proxyquire = require('proxyquire');
var supertest = require('supertest');
var csrf = require('csrf');

var session = require(__dirname + '/../test_helpers/mock_session.js');
var getApp = require(__dirname + '/../../server.js').getApp;

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

var app;

describe('get account', function () {
  afterEach((done) => {
    nock.cleanAll();
    app = null;
    done();
  });

  it('should get account', function (done) {
    var user = session.getUser({
      gateway_account_ids: ['1','2','5'],
      permissions: ['service-name:read']
    });
    var mockSession = session.getMockSession(user);
    session.currentGatewayAccountId = '2';
    app = session.getAppWithSession(getApp(), mockSession);
    var connectorMock = nock(process.env.CONNECTOR_URL);

    connectorMock.get('/v1/frontend/accounts/1').times(2).reply(200, {
      bob: 'bob'
    });

    return supertest(app)
      .get('/service-name')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(data => {
        expect(data.body.currentGatewayAccount).to.deep.equal({
          bob: 'bob'
        });
      })
      .end(done);
  });
});