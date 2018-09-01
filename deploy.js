const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");

const { interface, bytecode } = require("./compile");
const provider = new HDWalletProvider(
    'brain trend profit cereal lucky detect laptop between blue electric flee transfer',
    'https://rinkeby.infura.io/v3/aee593831c8d4a7f8e01c3afe05cc284'
);

const web3 = new Web3( provider );

const deploy = async () => {

    const accounts = await web3.eth.getAccounts();

    console.log(accounts[0]);

    const inbox = await new web3.eth.Contract(JSON.parse(interface))
                    .deploy({ data: bytecode, arguments: ["Hello"] })
                    .send({ from: accounts[0], gas: '5000000' });

    console.log("Address of deployed contract - ",inbox.options.address);

}

deploy();