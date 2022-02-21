/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { Console } = require('winston/lib/winston/transports');
const BidContract  = require('./bid-contract');

class WalaauctionContract extends Contract {

    async walaauctionExists(ctx, walaauctionId) {
        const buffer = await ctx.stub.getState(walaauctionId);
        return (!!buffer && buffer.length > 0);
    }

    async createWalaauction(ctx, walaauctionId, manufacturer,model,yearOfManufacture,faceValue) {
        const exists = await this.walaauctionExists(ctx, walaauctionId);
        if (exists) {
            throw new Error(`The walaauction ${walaauctionId} already exists`);
        }
        const asset = { 
            walaauctionId:walaauctionId,
            assetType: 'car',
            manufacturer:manufacturer,
            yearOfManufacture:yearOfManufacture,
            model:model,
            faceValue:faceValue,
            status:'Created',
            HighestBidValue:'',
            HighestBidder:'',
            NumberOfBid:'',
            Owner:''
         };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(walaauctionId, buffer);
    }

    async readWalaauction(ctx, walaauctionId) {
        const exists = await this.walaauctionExists(ctx, walaauctionId);
        if (!exists) {
            throw new Error(`The walaauction ${walaauctionId} does not exist`);
        }
        const buffer = await ctx.stub.getState(walaauctionId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    // async updateWalaauction(ctx, walaauctionId, newValue) {
    //     const exists = await this.walaauctionExists(ctx, walaauctionId);
    //     if (!exists) {
    //         throw new Error(`The walaauction ${walaauctionId} does not exist`);
    //     }
    //     const asset = { value: newValue };
    //     const buffer = Buffer.from(JSON.stringify(asset));
    //     await ctx.stub.putState(walaauctionId, buffer);
    // }

    async deleteWalaauction(ctx, walaauctionId) {
        const exists = await this.walaauctionExists(ctx, walaauctionId);
        if (!exists) {
            throw new Error(`The walaauction ${walaauctionId} does not exist`);
        }
        await ctx.stub.deleteState(walaauctionId);
    }
    async checkMatchingOrders(ctx,walaauctionId){
        const exists = await this.walaauctionExists(ctx, walaauctionId);
        if (!exists) {
            throw new Error(`The walaauction ${walaauctionId} does not exist`);
        }
        const queryString = {
            selector: {
                assetType: 'Order',
                carId:walaauctionId
            }
            
        };
        const bidContract = new BidContract();
        const orders = await bidContract.queryAllBids(
            ctx,
            JSON.stringify(queryString)
        );

        return orders;

    }
    async matchBid(ctx,walaauctionId,BidId){
        
        // const queryString = {
        //     selector: {
        //         assetType: 'Order',
        //         carId:walaauctionId,
        //         BidId:BidId
        //     }
            
        // };
        // const bidContract = new BidContract();
        // const orders = await bidContract.queryAllBids(
        //     ctx,
        //     JSON.stringify(queryString)
        // );
        // return(orders[0][1]);
        const bidContract = new BidContract();
        const carDetails = await this.readWalaauction(ctx, walaauctionId);
        const orderDetails = await bidContract.readBid(ctx, BidId);
        carDetails.HighestBidValue=orderDetails.BidValue;
        carDetails.HighestBidder=orderDetails.BidderName;
        carDetails.status='Sold';
        carDetails.Owner=orderDetails.BidderName;
        const newCarBuffer = Buffer.from(JSON.stringify(carDetails));
            await ctx.stub.putState(walaauctionId, newCarBuffer);

            await bidContract.deleteBid(ctx, BidId);
            return `Car ${walaauctionId} is assigned to ${orderDetails.BidderName}`;

    }

}

module.exports = WalaauctionContract;
