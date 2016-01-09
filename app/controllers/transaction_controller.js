var response = require('../utils/response.js').response;
var renderErrorView = require('../utils/response.js').renderErrorView;
var TransactionView = require('../utils/transaction_view.js').TransactionView;
var ConnectorClient = require('../services/connector_client.js').ConnectorClient;
var transactionView = new TransactionView();

var TRANSACTIONS_LIST_PATH = '/selfservice/transactions';
var TRANSACTIONS_VIEW_PATH = TRANSACTIONS_LIST_PATH + '/:chargeId';

function connectorClient() {
    return new ConnectorClient(process.env.CONNECTOR_URL);
}

var auth = require('../services/auth_service.js');
var filterTransactions = function (req, res) {
    var gatewayAccountId = req.params.gatewayAccountId;
    var showError = function (err, response) {
        if (response) {
            if (response.statusCode === 400) {
                renderErrorView(req, res, err);
            } else {
                renderErrorView(req, res, 'Unable to retrieve list of transactions.');
            }
        } else {
            renderErrorView(req, res, 'Internal server error');
        }
    };

    var showTransactions = function (charges) {
        charges.search_path = req.path;
        response(req.headers.accept, res, 'transactions', transactionView.buildPaymentList(charges, gatewayAccountId));
    };
    connectorClient().withTransactionList(gatewayAccountId, req.body, showTransactions).on('connectorError', showError);
}

module.exports.bindRoutesTo = function (app) {
    /**
     * Display all the transactions for a given accountId
     */
    app.get(TRANSACTIONS_LIST_PATH, auth.enforce, function (req, res) {
        var accountId = auth.get_account_id(req);
        var showError = function (err, response) {
            if (response) {
                if (response.statusCode === 400) {
                    renderErrorView(req, res, err);
                } else {
                    renderErrorView(req, res, 'Unable to retrieve list of transactions.');
                }
            } else {
                renderErrorView(req, res, 'Internal server error');
            }
        };

        var showTransactions = function (charges) {
            response(req.headers.accept, res, 'transactions', transactionView.buildPaymentList(charges, accountId));
        };

        connectorClient().withTransactionList(accountId, showTransactions)
            .on('connectorError', showError);
    });

    /**
     *  Display transaction details for a given chargeId of an account.
     */
    app.get(TRANSACTIONS_VIEW_PATH, auth.enforce, function (req, res) {
        var accountId = auth.get_account_id(req);
        var chargeId = req.params.chargeId;

        var showError = function (err, response) {
            if (response) {
                if (response.statusCode === 404) {
                    renderErrorView(req, res, 'charge not found');
                } else {
                    renderErrorView(req, res, 'Error processing transaction view');
                }
            } else {
                renderErrorView(req, res, 'Error processing transaction view');
            }
        };

        var showTransactionDetails = function (charge, events) {
            response(req.headers.accept, res, 'transaction_details', transactionView.buildPaymentView(charge, events));
        };

        connectorClient().withGetCharge(accountId, chargeId,
            function (charge) { //on success of finding a charge
                connectorClient().withChargeEvents(accountId, chargeId,
                    function (events) { //on success of finding events for charge
                        showTransactionDetails(charge, events);
                    })
                    .on('connectorError', showError)
            }).on('connectorError', showError);
    });
};