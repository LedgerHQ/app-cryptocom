import { IDeviceModel } from "@zondax/zemu";
import { resolve } from "path";

export const APP_SEED =
    "equip will roof matter pink blind book anxiety banner elbow sun young";

const APP_PATH_S = resolve("../app/build/nanos/bin/app.elf");
const APP_PATH_X = resolve("../app/build/nanox/bin/app.elf");
const APP_PATH_SP = resolve("../app/build/nanos2/bin/app.elf");
const APP_PATH_ST = resolve("../app/build/stax/bin/app.elf");
const APP_PATH_FL = resolve("../app/build/flex/bin/app.elf");

export const models: IDeviceModel[] = [
    { name: "nanos", prefix: "S", path: APP_PATH_S },
    { name: "nanox", prefix: "X", path: APP_PATH_X },
    { name: "nanosp", prefix: "SP", path: APP_PATH_SP },
    { name: "stax", prefix: "ST", path: APP_PATH_ST },
    { name: "flex", prefix: "FL", path: APP_PATH_FL },
];
export const example_tx_str_basic = {
    account_number: "108",
    chain_id: "test",
    fee: {
        amount: [
            {
                amount: "600",
                denom: "basecro",
            },
        ],
        gas: "200000",
    },
    memo: "",
    msgs: [
        {
            type: "cosmos-sdk/MsgWithdrawDelegationReward",
            value: {
                delegator_address: "cro1w34k53py5v5xyluazqpq65agyajavep2rflq6h",
                validator_address:
                    "crovaloper1kn3wugetjuy4zetlq6wadchfhvu3x740ae6z6x",
            },
        },
        {
            type: "cosmos-sdk/MsgWithdrawDelegationReward",
            value: {
                delegator_address: "cro1w34k53py5v5xyluazqpq65agyajavep2rflq6h",
                validator_address:
                    "crovaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0",
            },
        },
    ],
    sequence: "106",
};

export const example_tx_str_expert = {
    account_number: "108",
    chain_id: "test-2",
    fee: {
        amount: [
            {
                amount: "600",
                denom: "basecro",
            },
        ],
        gas: "200000",
    },
    memo: "",
    msgs: [
        {
            type: "cosmos-sdk/MsgWithdrawDelegationReward",
            value: {
                delegator_address: "cro1kky4yzth6gdrm8ga5zlfwhav33yr7hl87jycah",
                validator_address:
                    "crovaloper1kn3wugetjuy4zetlq6wadchfhvu3x740ae6z6x",
            },
        },
        {
            type: "cosmos-sdk/MsgWithdrawDelegationReward",
            value: {
                delegator_address: "cro1kky4yzth6gdrm8ga5zlfwhav33yr7hl87jycah",
                validator_address:
                    "crovaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0",
            },
        },
    ],
    sequence: "106",
};

export const example_tx_str_combined = {
    account_number: "108",
    chain_id: "test",
    fee: {
        amount: [
            {
                amount: "600",
                denom: "basecro",
            },
        ],
        gas: "200000",
    },
    memo: "",
    msgs: [
        {
            type: "cosmos-sdk/MsgWithdrawDelegationReward",
            value: {
                delegator_address: "cro1w34k53py5v5xyluazqpq65agyajavep2rflq6h",
                validator_address:
                    "crovaloper1648ynlpdw7fqa2axt0w2yp3fk542junl7rsvq6",
            },
        },
        {
            type: "cosmos-sdk/MsgDelegate",
            value: {
                amount: {
                    amount: "20139397",
                    denom: "basecro",
                },
                delegator_address: "cro1w34k53py5v5xyluazqpq65agyajavep2rflq6h",
                validator_address:
                    "crovaloper1648ynlpdw7fqa2axt0w2yp3fk542junl7rsvq6",
            },
        },
    ],
    sequence: "106",
};
