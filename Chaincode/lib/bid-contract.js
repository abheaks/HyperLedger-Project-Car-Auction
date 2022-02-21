/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class BidContract extends Contract {

    async BidExists(ctx, BidId) {
        const buffer = await ctx.stub.getState(BidId);
        return (!!buffer && buffer.length > 0);
    }

    async createBid(ctx, BidId, carId,BidValue,BidderName) {
        const exists = await this.BidExists(ctx, BidId);
        if (exists) {
            throw new Error(`The Bid ${BidId} already exists`);
        }
        const asset = { 
            BidId:BidId,
            carId:carId,
            BidderName:BidderName,
            BidValue:BidValue,
            assetType:'Order',
            Status:'Open'
         };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(BidId, buffer);
    }

    async readBid(ctx, BidId) {
        const exists = await this.BidExists(ctx, BidId);
        if (!exists) {
            throw new Error(`The Bid ${BidId} does not exist`);
        }
        const buffer = await ctx.stub.getState(BidId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateBid(ctx, BidId, newValue) {
        const exists = await this.BidExists(ctx, BidId);
        if (!exists) {
            throw new Error(`The Bid ${BidId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(BidId, buffer);
    }

    async deleteBid(ctx, BidId) {
        const exists = await this.BidExists(ctx, BidId);
        if (!exists) {
            throw new Error(`The Bid ${BidId} does not exist`);
        }
        await ctx.stub.deleteState(BidId);
    }

    async queryAllBids(ctx,queryString){
        let resultIterator = await ctx.stub.getQueryResult(
            queryString
        );

        let result = await this.getAllResults(resultIterator, false);
        return JSON.stringify(result);
    }
    
    async getAllResults(iterator, isHistory) {
        let allResult = [];

        for (
            let res = await iterator.next();
            !res.done;
            res = await iterator.next()
        ) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.timestamp = res.value.timestamp;
                    jsonRes.Value = JSON.parse(res.value.value.toString());
                } else {
                    jsonRes.Key = res.value.key;
                    jsonRes.Record = JSON.parse(res.value.value.toString());
                }
                allResult.push(jsonRes);
            }
        }
        await iterator.close();
        return allResult;
    }

}

module.exports = BidContract;
