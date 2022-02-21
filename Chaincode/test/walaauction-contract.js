/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { WalaauctionContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('WalaauctionContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new WalaauctionContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"walaauction 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"walaauction 1002 value"}'));
    });

    describe('#walaauctionExists', () => {

        it('should return true for a walaauction', async () => {
            await contract.walaauctionExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a walaauction that does not exist', async () => {
            await contract.walaauctionExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createWalaauction', () => {

        it('should create a walaauction', async () => {
            await contract.createWalaauction(ctx, '1003', 'walaauction 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"walaauction 1003 value"}'));
        });

        it('should throw an error for a walaauction that already exists', async () => {
            await contract.createWalaauction(ctx, '1001', 'myvalue').should.be.rejectedWith(/The walaauction 1001 already exists/);
        });

    });

    describe('#readWalaauction', () => {

        it('should return a walaauction', async () => {
            await contract.readWalaauction(ctx, '1001').should.eventually.deep.equal({ value: 'walaauction 1001 value' });
        });

        it('should throw an error for a walaauction that does not exist', async () => {
            await contract.readWalaauction(ctx, '1003').should.be.rejectedWith(/The walaauction 1003 does not exist/);
        });

    });

    describe('#updateWalaauction', () => {

        it('should update a walaauction', async () => {
            await contract.updateWalaauction(ctx, '1001', 'walaauction 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"walaauction 1001 new value"}'));
        });

        it('should throw an error for a walaauction that does not exist', async () => {
            await contract.updateWalaauction(ctx, '1003', 'walaauction 1003 new value').should.be.rejectedWith(/The walaauction 1003 does not exist/);
        });

    });

    describe('#deleteWalaauction', () => {

        it('should delete a walaauction', async () => {
            await contract.deleteWalaauction(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a walaauction that does not exist', async () => {
            await contract.deleteWalaauction(ctx, '1003').should.be.rejectedWith(/The walaauction 1003 does not exist/);
        });

    });

});
