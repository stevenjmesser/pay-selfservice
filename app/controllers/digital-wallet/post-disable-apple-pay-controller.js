'use strict'

// Local dependencies
const paths = require('../../paths')
const { ConnectorClient } = require('../../services/clients/connector_client')
const auth = require('../../services/auth_service')
const { CORRELATION_HEADER } = require('../../utils/correlation_header.js')
const connector = new ConnectorClient(process.env.CONNECTOR_URL)

const displayErrorMessage = (error) => {
  return Array.isArray(error.message.errors) ? error.message.errors.join(', ') : error.message.message
}

module.exports = (req, res) => {
  const gatewayAccountId = auth.getCurrentGatewayAccountId(req)
  const correlationId = req.headers[CORRELATION_HEADER] || ''
  const disableApplePayPayload = { 'op': 'replace', 'path': 'allow_apple_pay', 'value': 'false' }

  const enableApplePayBoolean = connector.patchAccount({
    gatewayAccountId,
    correlationId,
    payload: disableApplePayPayload
  })

  enableApplePayBoolean.then(() => {
    req.flash('generic', '<h2>Apple Pay successfully disabled.</h2>')
    return res.redirect(paths.digitalWallet.summary)
  }).catch(err => {
    req.flash('genericError', `<h2>Something went wrong</h2><p>${displayErrorMessage(err)}</p>`)
    return res.redirect(paths.digitalWallet.summary)
  })
}
