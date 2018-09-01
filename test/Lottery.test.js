const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3( ganache.provider() );

const { interface, bytecode } = require('../compile');

let accounts;
let lottery;

beforeEach( async () => {

    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract( JSON.parse(interface) )
                .deploy({ data: bytecode })
                .send({ from: accounts[0], gas: '1000000' });

});

describe("Lottery Contract", () => {

    it("deploys a contract", () => {

        assert.ok(lottery.options.address);

    });

    it("allows a account to enter the lottery", async () => {

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getAllPlayers().call({
            from: accounts[1]
        });

        assert.equal(accounts[1], players[0]);
        assert.equal(1, players.length);

    });

    it("allows multiple accounts to enter the lottery", async () => {

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[3],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getAllPlayers().call({
            from: accounts[1]
        });

        assert.equal(accounts[1], players[0]);
        assert.equal(accounts[2], players[1]);
        assert.equal(accounts[3], players[2]);
        assert.equal(3, players.length);

    });

    it('checks for minimum amount of ether to enter the lottery', async () => {

        try 
        {
            await lottery.methods.enter().send({
                from: accounts[1],
                value: web3.utils.toWei('0.001', 'ether')
            });

            assert(false);
        } 
        catch (err) 
        {
            assert(err);
        }

    });

    it('allows only the manager to call pickwinner', async () => {

        try
        {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });

            assert(false);
        }
        catch(err)
        {
            assert(err);
        }

    });

    it('picks winner and sends money to the winner and resets the players array', async () => {

        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("2", "ether")
        });

        const initBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        const difference = finalBalance - initBalance;

        assert(difference > web3.utils.toWei("1.8", "ether"));

        const players = await lottery.methods.getAllPlayers().call({
            from: accounts[0]
        });

        assert.equal(0, players.length);
        
    });

});
