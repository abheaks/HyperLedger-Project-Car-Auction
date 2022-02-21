/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const WalaauctionContract = require('./lib/walaauction-contract');
const BidContract = require('./lib/bid-contract');

module.exports.WalaauctionContract = WalaauctionContract;
module.exports.BidContract = BidContract;
module.exports.contracts = [ WalaauctionContract,BidContract ];
